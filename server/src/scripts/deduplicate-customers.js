import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import connectDB from "../config/dbConnection.config.js";
import Customer from "../models/customer.model.js";
import Order from "../models/order.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

/**
 * Migration Script: Deduplicate Customers and Enforce Unique Index
 * 
 * Safety features:
 * 1. Groups customers by customerId (User reference).
 * 2. If duplicates exist, selects the primary document (preserving addressBook data & oldest createdAt).
 * 3. Merges addressBook entries so no customer data is lost.
 * 4. Re-links any existing Orders referencing duplicate customer IDs to the primary customer ID.
 * 5. Safely deletes only the redundant duplicate customer documents.
 * 6. Builds/syncs the unique index on customerId in MongoDB Atlas.
 */
export const deduplicateCustomers = async () => {
  console.log("--- Starting Customer Deduplication Migration ---");

  // Aggregate grouping with count > 1
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

  console.log(`Found ${duplicateGroups.length} duplicate customerId group(s).`);

  for (const group of duplicateGroups) {
    const userCustomerId = group._id;
    const allDocs = await Customer.find({ customerId: userCustomerId }).sort({
      createdAt: 1,
    });

    console.log(
      `Processing customerId ${userCustomerId}: ${allDocs.length} duplicate documents found.`
    );

    // Pick primary: document with the largest addressBook, or the oldest one
    let primaryDoc = allDocs[0];
    for (const doc of allDocs) {
      if (
        (doc.addressBook?.length || 0) > (primaryDoc.addressBook?.length || 0)
      ) {
        primaryDoc = doc;
      }
    }

    const secondaryDocs = allDocs.filter(
      (d) => d._id.toString() !== primaryDoc._id.toString()
    );

    // Merge address book entries from secondary docs into primary
    let addressesAdded = 0;
    for (const secondary of secondaryDocs) {
      if (Array.isArray(secondary.addressBook)) {
        for (const addr of secondary.addressBook) {
          const isDuplicate = primaryDoc.addressBook.some(
            (pAddr) =>
              pAddr.address === addr.address &&
              pAddr.city === addr.city &&
              pAddr.pinCode === addr.pinCode
          );
          if (!isDuplicate) {
            primaryDoc.addressBook.push(addr);
            addressesAdded++;
          }
        }
      }

      // Re-point any orders pointing to secondary customer _id to primary _id
      const updatedOrders = await Order.updateMany(
        { customerId: secondary._id },
        { $set: { customerId: primaryDoc._id } }
      );
      if (updatedOrders.modifiedCount > 0) {
        console.log(
          `Re-linked ${updatedOrders.modifiedCount} orders from duplicate ${secondary._id} to primary ${primaryDoc._id}`
        );
      }

      // Delete the redundant duplicate document
      await Customer.deleteOne({ _id: secondary._id });
      console.log(`Deleted redundant customer document: ${secondary._id}`);
    }

    if (addressesAdded > 0) {
      await primaryDoc.save();
      console.log(`Merged ${addressesAdded} address(es) into primary customer document.`);
    }

    console.log(
      `Retained primary customer document: ${primaryDoc._id} for customerId: ${userCustomerId}`
    );
  }

  // Ensure unique index is built in MongoDB Atlas
  console.log("Ensuring unique index on customerId in MongoDB...");
  await Customer.syncIndexes();
  console.log("Unique index customerId_1 successfully ensured.");
  console.log("--- Migration Completed Successfully ---");
};

// Standalone execution wrapper
const runStandalone = async () => {
  try {
    await connectDB();
    await deduplicateCustomers();
  } catch (error) {
    console.error("Migration error:", error.message);
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
