import { useState } from "react";
import api from "../../../../config/ApiConfig";
import toast from "react-hot-toast";
import { MdEdit } from "react-icons/md";

const RestaurantBankingDocument = () => {
  const [editingBankingDocument, setEditingBankingDocument] = useState(false);

  const [restaurantData, setRestaurantData] = useState(
    JSON.parse(sessionStorage.getItem("cravingRestaurant")) || {},
  );

  const [bankingDocumentFormData, setBankingDocumentFormData] = useState({
    bankName: restaurantData?.financialDetails?.bankName || "",
    accountNumber: restaurantData?.financialDetails?.accountNumber || "",
    ifscCode: restaurantData?.financialDetails?.ifscCode || "",
    panCard: restaurantData?.documents?.panCard || "",
    gstCertificate: restaurantData?.documents?.gstCertificate || "",
    fssaiCertificate: restaurantData?.documents?.fssaiCertificate || "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSaveBankingDocument = async () => {
    try {
      setIsLoading(true);

      const res = await api.put(
        "/restaurant/update-banking-documents",
        bankingDocumentFormData,
      );

      setRestaurantData(res.data.data);

      sessionStorage.setItem(
        "cravingRestaurant",
        JSON.stringify(res.data.data),
      );

      toast.success(res.data.message);

      setEditingBankingDocument(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update banking details. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBankingDocument = () => {
    setBankingDocumentFormData({
      bankName: restaurantData?.financialDetails?.bankName || "",
      accountNumber: restaurantData?.financialDetails?.accountNumber || "",
      ifscCode: restaurantData?.financialDetails?.ifscCode || "",
      panCard: restaurantData?.documents?.panCard || "",
      gstCertificate: restaurantData?.documents?.gstCertificate || "",
      fssaiCertificate: restaurantData?.documents?.fssaiCertificate || "",
    });

    setEditingBankingDocument(false);
  };

  return (
    <>
      <div className="bg-[#072420] rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-teal-900/60 pb-3">
          <div className="flex items-center gap-3">
            <h3 className="w-full text-sm font-bold text-white tracking-tight">
              Banking & Legal Compliance Documents
            </h3>
          </div>
          {!editingBankingDocument ? (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEditingBankingDocument(true)}
                className="flex items-center gap-1.5 bg-[#041916] border border-teal-800/60 text-[#8faea7] hover:text-white hover:border-orange-500/60 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <MdEdit size={14} className="text-orange-400" /> Edit Documents
              </button>
            </div>
          ) : (
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={handleSaveBankingDocument}
                className="flex items-center gap-1.5 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md shadow-orange-950/40 hover:opacity-95 transition cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={handleCancelBankingDocument}
                className="flex items-center gap-1.5 bg-[#041916] border border-teal-800/60 text-[#8faea7] hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Bank Name */}
          <div className="w-full">
            <label className="text-xs font-semibold text-[#8faea7] block mb-1">Bank Name</label>

            <input
              type="text"
              name="bankName"
              value={bankingDocumentFormData?.bankName || ""}
              onChange={(e) =>
                setBankingDocumentFormData({
                  ...bankingDocumentFormData,
                  bankName: e.target.value,
                })
              }
              className={`w-full px-3 py-2 text-xs border border-teal-800/60 rounded-xl text-white ${
                editingBankingDocument
                  ? "bg-[#041916] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                  : "bg-[#041916]/50 opacity-80"
              }`}
              disabled={!editingBankingDocument}
            />
          </div>

          {/* Account Number */}
          <div className="w-full">
            <label className="text-xs font-semibold text-[#8faea7] block mb-1">Account Number</label>

            <input
              type="text"
              name="accountNumber"
              value={bankingDocumentFormData?.accountNumber || ""}
              onChange={(e) =>
                setBankingDocumentFormData({
                  ...bankingDocumentFormData,
                  accountNumber: e.target.value,
                })
              }
              className={`w-full px-3 py-2 text-xs border border-teal-800/60 rounded-xl text-white ${
                editingBankingDocument
                  ? "bg-[#041916] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                  : "bg-[#041916]/50 opacity-80"
              }`}
              disabled={!editingBankingDocument}
            />
          </div>

          {/* IFSC Code */}
          <div className="w-full">
            <label className="text-xs font-semibold text-[#8faea7] block mb-1">IFSC Code</label>

            <input
              type="text"
              name="ifscCode"
              value={bankingDocumentFormData?.ifscCode || ""}
              onChange={(e) =>
                setBankingDocumentFormData({
                  ...bankingDocumentFormData,
                  ifscCode: e.target.value,
                })
              }
              className={`w-full px-3 py-2 text-xs border border-teal-800/60 rounded-xl text-white ${
                editingBankingDocument
                  ? "bg-[#041916] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                  : "bg-[#041916]/50 opacity-80"
              }`}
              disabled={!editingBankingDocument}
            />
          </div>

          {/* PAN Card */}
          <div className="w-full">
            <label className="text-xs font-semibold text-[#8faea7] block mb-1">
              PAN Card Number
            </label>

            <input
              type="text"
              name="panCard"
              value={bankingDocumentFormData?.panCard || ""}
              onChange={(e) =>
                setBankingDocumentFormData({
                  ...bankingDocumentFormData,
                  panCard: e.target.value,
                })
              }
              className={`w-full px-3 py-2 text-xs border border-teal-800/60 rounded-xl text-white ${
                editingBankingDocument
                  ? "bg-[#041916] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                  : "bg-[#041916]/50 opacity-80"
              }`}
              disabled={!editingBankingDocument}
            />
          </div>

          {/* GST */}
          <div className="w-full">
            <label className="text-xs font-semibold text-[#8faea7] block mb-1">GST Number</label>

            <input
              type="text"
              name="gstCertificate"
              value={bankingDocumentFormData?.gstCertificate || ""}
              onChange={(e) =>
                setBankingDocumentFormData({
                  ...bankingDocumentFormData,
                  gstCertificate: e.target.value,
                })
              }
              className={`w-full px-3 py-2 text-xs border border-teal-800/60 rounded-xl text-white ${
                editingBankingDocument
                  ? "bg-[#041916] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                  : "bg-[#041916]/50 opacity-80"
              }`}
              disabled={!editingBankingDocument}
            />
          </div>

          {/* FSSAI */}
          <div className="w-full">
            <label className="text-xs font-semibold text-[#8faea7] block mb-1">FSSAI License Code</label>

            <input
              type="text"
              name="fssaiCertificate"
              value={bankingDocumentFormData?.fssaiCertificate || ""}
              onChange={(e) =>
                setBankingDocumentFormData({
                  ...bankingDocumentFormData,
                  fssaiCertificate: e.target.value,
                })
              }
              className={`w-full px-3 py-2 text-xs border border-teal-800/60 rounded-xl text-white ${
                editingBankingDocument
                  ? "bg-[#041916] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                  : "bg-[#041916]/50 opacity-80"
              }`}
              disabled={!editingBankingDocument}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default RestaurantBankingDocument;