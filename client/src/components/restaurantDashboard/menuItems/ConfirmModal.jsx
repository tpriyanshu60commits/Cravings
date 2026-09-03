import { useState } from "react";
import { IoMdCloseCircleOutline } from "react-icons/io";
import toast from "react-hot-toast";
import api from "../../../config/ApiConfig";

const modalConfig = {
  delete: {
    heading: "Confirm Deletion",
    description: "This will remove the item from your active menu.",
    confirmLabel: "Delete Item",
    confirmClass: "bg-rose-600 hover:bg-rose-700 text-white",
  },
  topRated: {
    heading: "Change Top Rated",
    description: "Toggle this item's top-rated badge.",
    confirmLabel: "Confirm",
    confirmClass:
      "bg-gradient-to-r from-[#f97316] to-[#ea580c] hover:opacity-90 text-white shadow-md shadow-orange-950/40",
  },
  recommended: {
    heading: "Change Recommendation",
    description: "Toggle this item's recommended badge.",
    confirmLabel: "Confirm",
    confirmClass:
      "bg-gradient-to-r from-[#f97316] to-[#ea580c] hover:opacity-90 text-white shadow-md shadow-orange-950/40",
  },
  new: {
    heading: "Change New Badge",
    description: "Toggle this item's new badge.",
    confirmLabel: "Confirm",
    confirmClass:
      "bg-gradient-to-r from-[#f97316] to-[#ea580c] hover:opacity-90 text-white shadow-md shadow-orange-950/40",
  },
};

const ConfirmModal = ({
  selectedItem,
  modalMode,
  isOpen,
  onClose,
  onActionSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentConfig = modalConfig[modalMode] || {
    heading: "Are you sure?",
    description: "Please confirm this action.",
    confirmLabel: "Confirm",
    confirmClass:
      "bg-gradient-to-r from-[#f97316] to-[#ea580c] hover:opacity-90 text-white shadow-md shadow-orange-950/40",
  };

  const handleConfirm = async () => {
    if (!selectedItem?._id) {
      toast.error("Invalid item selected.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (modalMode === "delete") {
        const response = await api.delete(
          `/restaurant/menu-item/${selectedItem._id}`,
        );

        toast.success(response.data.message || "Item deleted successfully");
      } else {
        const controlMap = {
          topRated: "isTopRated",
          recommended: "isRecommended",
          new: "isNew",
        };

        const control = controlMap[modalMode];

        const response = await api.patch(
          `/restaurant/menu-item/${selectedItem._id}/control?control=${encodeURIComponent(
            control,
          )}`,
        );

        toast.success(response.data.message || "Item control updated");
      }

      if (onActionSuccess) {
        await onActionSuccess();
      }

      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to complete this action. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
        <div className="bg-[#072420] border border-teal-800/60 p-6 rounded-2xl shadow-2xl shadow-black/80 w-full max-w-md text-white">
          <div className="flex justify-between items-center mb-4 border-b border-teal-900/60 pb-3">
            <h1 className="text-base font-bold text-white tracking-tight">Confirm Action</h1>

            <button
              className="text-[#8faea7] hover:text-white transition cursor-pointer"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <IoMdCloseCircleOutline size={22} />
            </button>
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-[#ea580c]">
              {currentConfig.heading}
            </h2>
            <p className="text-xs text-[#8faea7]">{currentConfig.description}</p>
            <p className="text-xs text-[#d8eae6] bg-[#041916] p-2.5 rounded-xl border border-teal-800/40 mt-2">
              Item: <span className="font-semibold text-white">{selectedItem?.itemName}</span>
            </p>
          </div>
          <div className="mt-6 flex justify-end gap-2.5 border-t border-teal-900/60 pt-4">
            <button
              className="bg-[#041916] border border-teal-800/60 text-[#8faea7] hover:text-white px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className={`px-4 py-2 rounded-xl text-xs font-bold transition disabled:opacity-60 cursor-pointer ${currentConfig.confirmClass}`}
              onClick={handleConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Please wait..." : currentConfig.confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmModal;

