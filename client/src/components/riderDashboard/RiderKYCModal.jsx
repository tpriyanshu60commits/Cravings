import React from "react";

const RiderKYCModal = ({ isOpen, onClose, onUploadSuccess }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-(--color-base-100) rounded-2xl max-w-md w-full p-6 space-y-4">
        <h3 className="text-lg font-bold text-(--color-base-content)">
          Upload KYC Documents
        </h3>
        {/* Placeholder for Document inputs: drivingLicense, vehicleRegistrationCertificate, insuranceCertificate, aadharCard, panCard (consumes PUT /rider/upload-documents) */}
        <div className="flex justify-end gap-2 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-(--color-base-300)"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiderKYCModal;
