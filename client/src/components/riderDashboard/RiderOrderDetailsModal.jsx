const RiderOrderDetailsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-(--color-base-100) rounded-2xl max-w-lg w-full p-6 space-y-4">
        <h3 className="text-lg font-bold text-(--color-base-content)">
          Delivery Details
        </h3>
        {/* Placeholder for restaurant pickup location, customer delivery location, and items (consumes GET /rider/orders/:orderId) */}
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

export default RiderOrderDetailsModal;
