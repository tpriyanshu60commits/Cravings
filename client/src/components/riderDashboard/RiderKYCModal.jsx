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
    <div className="overflow-y-auto h-full p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#072420] p-4 sm:p-5 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 tracking-tight">
            <MdVerifiedUser className="text-[#f97316]" /> KYC Verification & Documents
          </h1>
          <p className="text-xs text-[#8faea7] mt-0.5">
            Upload your mandatory identity, vehicle, and driving documents for partner compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleUploadAll}
            disabled={Object.keys(selectedFiles).length === 0 || isUploading}
            className="w-full sm:w-auto bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white px-5 py-2.5 sm:py-2 rounded-xl text-xs font-bold shadow-md shadow-orange-950/40 hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isUploading && <RiLoader4Fill className="animate-spin" />}
            <span>
              {isUploading
                ? "Uploading..."
                : `Submit Documents (${Object.keys(selectedFiles).length})`}
            </span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <RiLoader4Fill className="animate-spin text-3xl text-[#f97316]" />
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
                className="bg-[#072420] rounded-2xl border border-teal-800/40 p-5 shadow-xl shadow-black/40 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {doc.label}
                    </h3>
                    <p className="text-xs text-[#8faea7] mt-0.5">
                      {doc.description}
                    </p>
                  </div>
                  {isUploaded ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
                      <MdCheckCircle size={12} /> Uploaded
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
                      Pending
                    </span>
                  )}
                </div>

                {/* Preview Thumbnail */}
                {previewUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-teal-800/60 h-40 bg-[#041916]">
                    <img
                      src={previewUrl}
                      alt={doc.label}
                      className="w-full h-full object-cover"
                    />
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute bottom-2 right-2 bg-black/80 hover:bg-black text-white px-2.5 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 shadow-md border border-teal-800/60"
                    >
                      <MdVisibility size={14} /> Full View
                    </a>
                  </div>
                ) : (
                  <div className="h-32 rounded-xl border border-dashed border-teal-800/60 bg-[#041916] flex flex-col items-center justify-center text-center p-3">
                    <MdOutlineFileUpload className="text-2xl text-[#537770] mb-1" />
                    <p className="text-xs font-semibold text-white">
                      No document uploaded
                    </p>
                    <p className="text-[10px] text-[#8faea7]">
                      Upload JPG, PNG or PDF under 5MB
                    </p>
                  </div>
                )}

                {/* File Input Trigger */}
                <div className="flex items-center justify-between pt-1">
                  <label
                    htmlFor={`upload-${doc.key}`}
                    className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-orange-950/40 hover:opacity-95 transition"
                  >
                    <MdOutlineFileUpload size={16} />
                    <span>{isUploaded ? "Replace Document" : "Select File"}</span>
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
                    <span className="text-[11px] text-amber-400 font-bold">
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
