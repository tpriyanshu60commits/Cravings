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
      <div className="bg-(--color-base-100) rounded-lg p-3">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-(--color-secondary) pb-2 mb-2">
          <div className="flex items-center gap-3">
            <h3 className="w-full text-sm font-semibold text-(--color-primary)">
              Banking & Documents
            </h3>
          </div>

          {!editingBankingDocument ? (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEditingBankingDocument(true)}
                className="flex items-center gap-2 bg-(--color-primary) text-(--color-primary-content) px-2 py-0.5 rounded text-xs"
              >
                <MdEdit /> Edit
              </button>
            </div>
          ) : (
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={handleSaveBankingDocument}
                className="flex items-center gap-2 bg-(--color-primary) text-(--color-primary-content) px-2 py-0.5 rounded text-xs"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={handleCancelBankingDocument}
                className="flex items-center gap-2 bg-(--color-secondary) text-(--color-secondary-content) px-2 py-0.5 rounded text-xs"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 justify-center items-center">
          {/* Bank Name */}
          <div className="w-full">
            <label className="text-xs font-semibold">Bank Name</label>

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
              className={`w-full px-1.5 py-1 border border-(--color-secondary) ${
                editingBankingDocument
                  ? "bg-white"
                  : "bg-(--color-base-100)"
              } rounded`}
              disabled={!editingBankingDocument}
            />
          </div>

          {/* Account Number */}
          <div className="w-full">
            <label className="text-xs font-semibold">Account Number</label>

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
              className={`w-full px-1.5 py-1 border border-(--color-secondary) ${
                editingBankingDocument
                  ? "bg-white"
                  : "bg-(--color-base-100)"
              } rounded`}
              disabled={!editingBankingDocument}
            />
          </div>

          {/* IFSC Code */}
          <div className="w-full">
            <label className="text-xs font-semibold">IFSC Code</label>

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
              className={`w-full px-1.5 py-1 border border-(--color-secondary) ${
                editingBankingDocument
                  ? "bg-white"
                  : "bg-(--color-base-100)"
              } rounded`}
              disabled={!editingBankingDocument}
            />
          </div>

          {/* PAN Card */}
          <div className="w-full">
            <label className="text-xs font-semibold">
              Pan Card Number
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
              className={`w-full px-1.5 py-1 border border-(--color-secondary) ${
                editingBankingDocument
                  ? "bg-white"
                  : "bg-(--color-base-100)"
              } rounded`}
              disabled={!editingBankingDocument}
            />
          </div>

          {/* GST */}
          <div className="w-full">
            <label className="text-xs font-semibold">GST Number</label>

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
              className={`w-full px-1.5 py-1 border border-(--color-secondary) ${
                editingBankingDocument
                  ? "bg-white"
                  : "bg-(--color-base-100)"
              } rounded`}
              disabled={!editingBankingDocument}
            />
          </div>

          {/* FSSAI */}
          <div className="w-full">
            <label className="text-xs font-semibold">FSSAI Code</label>

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
              className={`w-full px-1.5 py-1 border border-(--color-secondary) ${
                editingBankingDocument
                  ? "bg-white"
                  : "bg-(--color-base-100)"
              } rounded`}
              disabled={!editingBankingDocument}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default RestaurantBankingDocument;