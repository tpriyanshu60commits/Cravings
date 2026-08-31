import { useState, useEffect } from "react";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import {
  MdVerifiedUser,
  MdOutlineFileUpload,
  MdCheckCircle,
  MdVisibility,
} from "react-icons/md";
import { RiLoader4Fill } from "react-icons/ri";

const RiderKYCModal = () => {
  const [documents, setDocuments] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [filePreviews, setFilePreviews] = useState({});

  useEffect(() => {
    let isMounted = true;
    const fetchKYCDocuments = async () => {
      try {
        const res = await api.get("/rider/profile");
        if (isMounted) {
          setDocuments(res.data?.data?.documents || {});
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch KYC documents:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchKYCDocuments();
    return () => {
      isMounted = false;
    };
  }, []);

  const documentConfigs = [
    {
      key: "drivingLicense",
      label: "Driving License",
      description: "Valid commercial or two-wheeler driving license (Front & Back)",
      required: true,
    },
    {
      key: "vehicleRegistrationCertificate",
      altKey: "vehicleRC",
      label: "Vehicle RC (Registration Certificate)",
      description: "Government issued vehicle registration card",
      required: true,
    },
    {
      key: "insuranceCertificate",
      altKey: "insurance",
      label: "Vehicle Insurance Certificate",
      description: "Valid third-party or comprehensive motor insurance",
      required: true,
    },
    {
      key: "aadharCard",
      label: "Aadhaar Card",
      description: "UIDAI issued Aadhaar card for identity verification",
      required: true,
    },
    {
      key: "panCard",
      label: "PAN Card",
      description: "Income tax permanent account number card for tax compliance",
      required: true,
    },
  ];

  const handleFileChange = (key, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return;
    }

    setSelectedFiles((prev) => ({ ...prev, [key]: file }));
    setFilePreviews((prev) => ({ ...prev, [key]: URL.createObjectURL(file) }));
  };

  const handleUploadAll = async () => {
    const fileKeys = Object.keys(selectedFiles);
    if (fileKeys.length === 0) {
      toast.error("Please select at least one document to upload");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      fileKeys.forEach((key) => {
        formData.append(key, selectedFiles[key]);
      });

      const res = await api.put("/rider/upload-documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data?.message || "Documents uploaded successfully!");
      setDocuments(res.data?.data || {});
      setSelectedFiles({});
      setFilePreviews({});
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to upload KYC documents"
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="overflow-y-auto h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--color-base-content) flex items-center gap-2">
            <MdVerifiedUser className="text-(--color-primary)" /> KYC Verification & Documents
          </h1>
          <p className="text-xs text-(--color-secondary) mt-1">
            Upload your mandatory identity, vehicle, and driving documents for partner compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleUploadAll}
            disabled={Object.keys(selectedFiles).length === 0 || isUploading}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isUploading && <RiLoader4Fill className="animate-spin" />}
            {isUploading
              ? "Uploading..."
              : `Submit Documents (${Object.keys(selectedFiles).length})`}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <RiLoader4Fill className="animate-spin text-3xl text-(--color-primary)" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documentConfigs.map((doc) => {
            const savedDoc = documents?.[doc.key] || {};
            const isUploaded = !!savedDoc.url;
            const isSelected = !!selectedFiles[doc.key];
            const previewUrl = filePreviews[doc.key] || savedDoc.url;

            return (
              <div
                key={doc.key}
                className="bg-(--color-base-100) rounded-2xl border border-(--color-secondary)/30 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-(--color-base-content)">
                      {doc.label}
                    </h3>
                    <p className="text-xs text-(--color-secondary) mt-0.5">
                      {doc.description}
                    </p>
                  </div>
                  {isUploaded ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800 shrink-0">
                      <MdCheckCircle size={12} /> Uploaded
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 shrink-0">
                      Pending
                    </span>
                  )}
                </div>

                {/* Preview Thumbnail */}
                {previewUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-(--color-secondary)/40 h-40 bg-(--color-base-200)">
                    <img
                      src={previewUrl}
                      alt={doc.label}
                      className="w-full h-full object-cover"
                    />
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute bottom-2 right-2 bg-black/70 hover:bg-black text-white px-2.5 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 shadow"
                    >
                      <MdVisibility size={14} /> Full View
                    </a>
                  </div>
                ) : (
                  <div className="h-32 rounded-xl border border-dashed border-(--color-secondary)/50 bg-(--color-base-200) flex flex-col items-center justify-center text-center p-3">
                    <MdOutlineFileUpload className="text-2xl text-(--color-secondary) mb-1" />
                    <p className="text-xs font-semibold text-(--color-base-content)">
                      No document uploaded
                    </p>
                    <p className="text-[10px] text-(--color-secondary)">
                      Upload JPG, PNG or PDF under 5MB
                    </p>
                  </div>
                )}

                {/* File Input Trigger */}
                <div className="flex items-center justify-between pt-1">
                  <label
                    htmlFor={`upload-${doc.key}`}
                    className="inline-flex items-center gap-1.5 bg-(--color-primary) text-(--color-primary-content) px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow hover:opacity-90 transition"
                  >
                    <MdOutlineFileUpload size={16} />
                    {isUploaded ? "Replace Document" : "Select File"}
                  </label>
                  <input
                    type="file"
                    id={`upload-${doc.key}`}
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) =>
                      handleFileChange(doc.key, e.target.files?.[0])
                    }
                  />

                  {isSelected && (
                    <span className="text-[11px] text-amber-600 font-bold">
                      Ready to upload
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RiderKYCModal;
