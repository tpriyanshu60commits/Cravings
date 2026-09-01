import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import connectDB from "../config/dbConnection.config.js";
import Customer from "../models/customer.model.js";
import Order from "../models/order.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded whether run from server/ or workspace root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const isDryRun = process.argv.includes("--dry-run");

/**
 * Safe, Non-Destructive Index Ensurance
 * Checks existing indexes and creates { customerId: 1, unique: true } without
 * dropping or modifying any unrelated production indexes.
 */
const ensureUniqueIndexSafely = async () => {
  try {
    console.log("Checking existing indexes on 'customers' collection...");
    const existingIndexes = await Customer.collection.indexes();
    const hasUniqueCustomerIdIndex = existingIndexes.some(
      (idx) => idx.key && idx.key.customerId === 1 && idx.unique === true,
    );

    if (hasUniqueCustomerIdIndex) {
      console.log("✅ Unique index on 'customerId' already exists and is active.");
      return;
    }

    console.log("Creating unique index on customerId: { customerId: 1 }...");
    await Customer.collection.createIndex(
      { customerId: 1 },
      { unique: true, background: true },
    );
    console.log("✅ Unique index 'customerId_1' created successfully without dropping other indexes.");
  } catch (idxError) {
    console.error("⚠️ Error while checking/creating unique index:", idxError.message);
    throw idxError;
  }
};

/**
 * Dry-Run Reporter (Read-Only Analysis)
 * Analyzes duplicates, addresses to merge, and orders to relink without performing any writes.
 */
const performDryRunReport = async (duplicateGroups) => {
  let totalToDelete = 0;
  let totalAddressesToMerge = 0;
  let totalOrdersToRelink = 0;

  for (const group of duplicateGroups) {
    const userCustomerId = group._id;
    const allDocs = await Customer.find({ customerId: userCustomerId }).sort({
      createdAt: 1,
    });

    let primaryDoc = allDocs[0];
    for (const doc of allDocs) {
      if (
        (doc.addressBook?.length || 0) > (primaryDoc.addressBook?.length || 0)
      ) {
        primaryDoc = doc;
      }
    }

    const secondaryDocs = allDocs.filter(
      (d) => d._id.toString() !== primaryDoc._id.toString(),
    );

    let groupAddressesToMerge = 0;
    for (const secondary of secondaryDocs) {
      if (Array.isArray(secondary.addressBook)) {
        for (const addr of secondary.addressBook) {
          const isDuplicate = primaryDoc.addressBook.some(
            (pAddr) =>
              pAddr.address === addr.address &&
              pAddr.city === addr.city &&
              pAddr.pinCode === addr.pinCode,
          );
          if (!isDuplicate) {
            groupAddressesToMerge++;
          }
        }
      }
    }

    const secondaryIds = secondaryDocs.map((d) => d._id);
    const orderCount = await Order.countDocuments({
      customerId: { $in: secondaryIds },
    });

    console.log(`[Group: customerId ${userCustomerId}]`);
    console.log(
      `  - Primary Document to keep: ${primaryDoc._id} (existing addresses: ${primaryDoc.addressBook?.length || 0})`,
    );
    console.log(
      `  - Secondary Documents to remove (${secondaryDocs.length}): ${secondaryIds.join(", ")}`,
    );
    console.log(`  - Unique Addresses to merge: ${groupAddressesToMerge}`);
    console.log(`  - Orders to re-link: ${orderCount}`);
    console.log(`  - Duplicate Customer documents to delete: ${secondaryDocs.length}\n`);

    totalToDelete += secondaryDocs.length;
    totalAddressesToMerge += groupAddressesToMerge;
    totalOrdersToRelink += orderCount;
  }

  console.log("---------------- DRY-RUN SUMMARY ----------------");
  console.log(`Total Duplicate Groups: ${duplicateGroups.length}`);
  console.log(`Total Documents to Delete: ${totalToDelete}`);
  console.log(`Total Addresses to Merge: ${totalAddressesToMerge}`);
  console.log(`Total Orders to Re-link: ${totalOrdersToRelink}`);
  console.log("No changes were made to MongoDB Atlas.\n");
};
export const deduplicateCustomers = async () => {
  console.log("==================================================");
  console.log("   PRODUCTION CUSTOMER DEDUPLICATION MIGRATION   ");
  console.log("==================================================");

  if (isDryRun) {
    console.log(">>> RUNNING IN DRY-RUN MODE (READ ONLY) <<<");
    console.log("No documents will be modified or deleted.\n");
  }

  // 1. Identify duplicate customerId groups (only groups with > 1 document)
  const duplicateGroups = await Customer.aggregate([
    {
      $group: {
        _id: "$customerId",
        count: { $sum: 1 },
        docIds: { $push: "$_id" },
      },
    },
    {
      $match: {
        count: { $gt: 1 },
      },
    },
  ]);

  if (duplicateGroups.length === 0) {
    console.log("✅ Zero duplicate customer groups found. Database is clean.");
    await ensureUniqueIndexSafely();
    return;
  }

  console.log(`Found ${duplicateGroups.length} duplicate customerId group(s).\n`);

  if (isDryRun) {
    await performDryRunReport(duplicateGroups);
    return;
  }

  // 2. Perform Migration inside a MongoDB Session & Transaction
  let session;
  try {
    session = await mongoose.startSession();
  } catch (sessionErr) {
    console.error(
      "❌ Failed to start a MongoDB session. Transactions may not be supported by this environment.",
    );
    console.error("Migration halted safely to prevent non-atomic data modifications.");
    throw sessionErr;
  }

  try {
    session.startTransaction();
    console.log("🔒 MongoDB Transaction started successfully.\n");

    let totalDeleted = 0;
    let totalAddressesMerged = 0;
    let totalOrdersRelinked = 0;

    for (const group of duplicateGroups) {
      const userCustomerId = group._id;

      // Query within the session
      const allDocs = await Customer.find({ customerId: userCustomerId })
        .sort({ createdAt: 1 })
        .session(session);

      if (allDocs.length <= 1) {
        continue;
      }

      console.log(`--- Processing customerId: ${userCustomerId} (${allDocs.length} duplicates) ---`);

      // Determine primary document
      let primaryDoc = allDocs[0];
      for (const doc of allDocs) {
        if (
          (doc.addressBook?.length || 0) > (primaryDoc.addressBook?.length || 0)
        ) {
          primaryDoc = doc;
        }
      }

      console.log(
        `  [Primary] Selected Customer _id: ${primaryDoc._id} (Address Count: ${primaryDoc.addressBook?.length || 0})`,
      );

      const secondaryDocs = allDocs.filter(
        (d) => d._id.toString() !== primaryDoc._id.toString(),
      );

      // A. Merge unique addresses into primaryDoc in memory
      let groupAddressesMerged = 0;
      for (const secondary of secondaryDocs) {
        console.log(`  [Secondary] Duplicate Customer _id: ${secondary._id}`);

        if (Array.isArray(secondary.addressBook)) {
          for (const addr of secondary.addressBook) {
            const isDuplicate = primaryDoc.addressBook.some(
              (pAddr) =>
                pAddr.address === addr.address &&
                pAddr.city === addr.city &&
                pAddr.pinCode === addr.pinCode,
            );
            if (!isDuplicate) {
              primaryDoc.addressBook.push(addr);
              groupAddressesMerged++;
              totalAddressesMerged++;
            }
          }
        }
      }

      // B. Persist primary document FIRST inside the session
      if (groupAddressesMerged > 0) {
        await primaryDoc.save({ session });
        console.log(`  ✓ Primary document saved with ${groupAddressesMerged} merged address(es).`);
      }

      // C. Re-link orders and delete secondary documents inside the session
      for (const secondary of secondaryDocs) {
        const updatedOrders = await Order.updateMany(
          { customerId: secondary._id },
          { $set: { customerId: primaryDoc._id } },
          { session },
        );

        if (updatedOrders.modifiedCount > 0) {
          console.log(
            `  ✓ Re-linked ${updatedOrders.modifiedCount} order(s) from ${secondary._id} to ${primaryDoc._id}`,
          );
          totalOrdersRelinked += updatedOrders.modifiedCount;
        }

        // Delete the secondary document within the session
        await Customer.deleteOne({ _id: secondary._id }, { session });
        console.log(`  ✓ Secondary Customer document ${secondary._id} deleted.`);
        totalDeleted++;
      }
    }

    // Commit transaction only if all groups succeeded
    await session.commitTransaction();
    console.log("\n✅ Transaction successfully committed! All duplicate records cleaned and persisted.");
    console.log(
      `Summary: ${totalDeleted} duplicate document(s) deleted, ${totalAddressesMerged} address(es) merged, ${totalOrdersRelinked} order(s) re-linked.\n`,
    );
  } catch (txError) {
    console.error("\n❌ Error during migration transaction:", txError.message);
    if (session && session.inTransaction()) {
      console.log("🔄 Aborting and rolling back transaction. No database changes were applied.");
      await session.abortTransaction();
    }
    throw txError;
  } finally {
    if (session) {
      await session.endSession();
    }
  }

  // 3. Ensure Unique Index on customerId safely without dropping other indexes
  await ensureUniqueIndexSafely();
  console.log("==================================================");
  console.log("   MIGRATION COMPLETED SUCCESSFULLY               ");
  console.log("==================================================");
};

// Standalone execution wrapper
const runStandalone = async () => {
  try {
    await connectDB();
    await deduplicateCustomers();
  } catch (error) {
    console.error("Migration process failed:", error.message);
    process.exitCode = 1;
  } finally {
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        console.log("Database connection closed cleanly.");
      }
    } catch (closeErr) {
      console.error("Error closing database connection:", closeErr.message);
    }
    process.exit(process.exitCode || 0);
  }
};

const executedFilePath = process.argv[1]
  ? path.resolve(process.argv[1]).toLowerCase()
  : "";
const currentFilePath = path.resolve(__filename).toLowerCase();

if (executedFilePath && executedFilePath === currentFilePath) {
  runStandalone();
}

export default deduplicateCustomers;
