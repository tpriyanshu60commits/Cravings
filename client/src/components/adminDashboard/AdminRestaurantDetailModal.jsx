import React from "react";

const AdminRestaurantDetailModal = ({ isOpen, onClose, restaurantId }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-(--color-base-100) rounded-2xl max-w-xl w-full p-6 space-y-4">
        <h3 className="text-lg font-bold text-(--color-base-content)">
          Restaurant Details & Documents
        </h3>
        {/* Placeholder for restaurant profile, legal info, banking docs, and status approval (consumes GET /admin/restaurants/:restaurantId) */}
        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-(--color-base-300)"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminRestaurantDetailModal;
