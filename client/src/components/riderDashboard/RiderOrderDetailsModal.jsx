const RiderOrderDetailsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#072420] text-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-teal-800/60 shadow-2xl">
        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
          Delivery Details
        </h3>
        {/* Placeholder for restaurant pickup location, customer delivery location, and items */}
        <div className="flex justify-end pt-4 border-t border-teal-900/40">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#041916] text-[#8faea7] hover:text-white border border-teal-800/60 hover:bg-teal-900/30 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiderOrderDetailsModal;
