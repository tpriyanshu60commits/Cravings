import { useState, useEffect } from "react";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import Loader from "../Loader";
import { MdCancel } from "react-icons/md";
import {
  IoReceiptOutline,
  IoLocationOutline,
  IoStorefrontOutline,
  IoBicycleOutline,
} from "react-icons/io5";

const CustomerOrderDetailsModal = ({ isOpen, onClose, orderId }) => {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && orderId) {
      const fetchDetails = async () => {
        try {
          setIsLoading(true);
          const res = await api.get(`/customer/orders/${orderId}`);
          setOrder(res.data.data);
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Failed to load order details"
          );
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetails();
    }
  }, [isOpen, orderId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#072420] text-white rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-teal-800/60 max-h-[90vh] overflow-y-auto">
        <header className="flex justify-between items-center border-b border-teal-900/60 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <IoReceiptOutline className="text-[#f97316]" />
              Order Details
            </h3>
            <p className="text-xs text-[#8faea7] font-mono mt-0.5">
              #{orderId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#8faea7] hover:text-white transition cursor-pointer"
          >
            <MdCancel className="text-2xl" />
          </button>
        </header>

        {isLoading ? (
          <Loader height="200px" width="100%" />
        ) : !order ? (
          <div className="py-8 text-center text-xs text-[#8faea7]">
            Order details not found.
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Status & Restaurant */}
            <div className="flex justify-between items-start bg-[#041916] p-3.5 rounded-xl border border-teal-900/60">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8faea7] flex items-center gap-1">
                  <IoStorefrontOutline className="text-[#f97316]" /> Restaurant
                </span>
                <p className="font-bold text-sm text-white mt-0.5">
                  {order.restaurantId?.restaurantName || "Restaurant"}
                </p>
                <p className="text-[11px] text-[#8faea7]">
                  {order.restaurantId?.city || ""}
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                {order.orderStatus}
              </span>
            </div>

            {/* Items List */}
            <div className="bg-[#041916] p-3.5 rounded-xl border border-teal-900/60 space-y-2">
              <span className="font-bold uppercase tracking-wider text-[#8faea7] text-[10px]">
                Items Ordered
              </span>
              <div className="space-y-1.5 divide-y divide-teal-900/40">
                {order.orderItems?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center pt-1.5 text-xs">
                    <span className="text-white">
                      {item.quantity}x {item.itemName}
                    </span>
                    <span className="font-semibold text-orange-400">
                      ₹{(item.itemPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-[#041916] p-3.5 rounded-xl border border-teal-900/60 space-y-1">
              <span className="font-bold uppercase tracking-wider text-[#8faea7] text-[10px] flex items-center gap-1">
                <IoLocationOutline className="text-[#f97316]" /> Delivered to
              </span>
              <p className="font-semibold text-white">
                {order.deliveryAddress?.name}
              </p>
              <p className="text-[#8faea7] text-[11px] leading-relaxed">
                {order.deliveryAddress?.address}, {order.deliveryAddress?.city} - {order.deliveryAddress?.pinCode}
              </p>
            </div>

            {/* Bill Details */}
            <div className="bg-[#041916] p-3.5 rounded-xl border border-teal-900/60 space-y-1.5 text-[#8faea7]">
              <div className="flex justify-between">
                <span>Item Total</span>
                <span className="text-white">₹{order.billDetails?.totalAmount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & Fees</span>
                <span className="text-white">
                  ₹{(
                    (order.billDetails?.taxAmount || 0) +
                    (order.billDetails?.platformFee || 0) +
                    (order.billDetails?.convenienceFee || 0)
                  ).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-white pt-2 border-t border-teal-900/40">
                <span>Grand Total</span>
                <span className="text-[#f97316]">
                  ₹{order.billDetails?.finalAmount?.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Rider Info */}
            {order.riderId && (
              <div className="bg-blue-500/10 border border-blue-500/30 p-3.5 rounded-xl flex items-center gap-3 text-blue-200">
                <IoBicycleOutline className="text-2xl text-blue-400 shrink-0" />
                <div>
                  <p className="font-bold text-xs text-white">Rider Assigned</p>
                  <p className="text-[11px] text-[#8faea7]">
                    Vehicle: {order.riderId.vehicleDetails?.vehicleNumber || "Standard"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-teal-900/60">
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

export default CustomerOrderDetailsModal;
