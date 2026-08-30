import React, { useState, useEffect } from "react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-(--color-base-100) rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-(--color-base-300) max-h-[90vh] overflow-y-auto">
        <header className="flex justify-between items-center border-b pb-3">
          <div>
            <h3 className="text-base font-bold text-(--color-base-content) flex items-center gap-2">
              <IoReceiptOutline className="text-(--color-primary)" />
              Order Details
            </h3>
            <p className="text-xs text-(--color-secondary) font-mono">
              #{orderId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <MdCancel className="text-2xl" />
          </button>
        </header>

        {isLoading ? (
          <Loader height="200px" width="100%" />
        ) : !order ? (
          <div className="py-8 text-center text-xs text-(--color-secondary)">
            Order details not found.
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Status & Restaurant */}
            <div className="flex justify-between items-start bg-(--color-base-200) p-3 rounded-xl">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-(--color-secondary) flex items-center gap-1">
                  <IoStorefrontOutline /> Restaurant
                </span>
                <p className="font-bold text-sm text-(--color-base-content) mt-0.5">
                  {order.restaurantId?.restaurantName || "Restaurant"}
                </p>
                <p className="text-(--color-secondary)">
                  {order.restaurantId?.city || ""}
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider bg-orange-100 text-orange-800">
                {order.orderStatus}
              </span>
            </div>

            {/* Items List */}
            <div className="space-y-2">
              <span className="font-bold uppercase tracking-wider text-(--color-secondary)">
                Items Ordered
              </span>
              <div className="space-y-1.5 divide-y divide-(--color-base-300)">
                {order.orderItems?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center pt-1.5">
                    <span>
                      {item.quantity}x {item.itemName}
                    </span>
                    <span className="font-semibold text-(--color-base-content)">
                      ₹{(item.itemPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-(--color-base-200) p-3 rounded-xl space-y-1">
              <span className="font-bold uppercase tracking-wider text-(--color-secondary) flex items-center gap-1">
                <IoLocationOutline /> Delivered to
              </span>
              <p className="font-semibold text-(--color-base-content)">
                {order.deliveryAddress?.name}
              </p>
              <p className="text-(--color-secondary) leading-relaxed">
                {order.deliveryAddress?.address}, {order.deliveryAddress?.city} - {order.deliveryAddress?.pinCode}
              </p>
            </div>

            {/* Bill Details */}
            <div className="border-t pt-3 space-y-1 text-(--color-secondary)">
              <div className="flex justify-between">
                <span>Item Total</span>
                <span>₹{order.billDetails?.totalAmount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & Fees</span>
                <span>
                  ₹{(
                    (order.billDetails?.taxAmount || 0) +
                    (order.billDetails?.platformFee || 0) +
                    (order.billDetails?.convenienceFee || 0)
                  ).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-(--color-base-content) pt-1 border-t">
                <span>Grand Total</span>
                <span className="text-(--color-primary)">
                  ₹{order.billDetails?.finalAmount?.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Rider Info */}
            {order.riderId && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl flex items-center gap-3 text-blue-950">
                <IoBicycleOutline className="text-2xl text-blue-600 shrink-0" />
                <div>
                  <p className="font-bold text-xs">Rider Assigned</p>
                  <p className="text-[11px]">
                    Vehicle: {order.riderId.vehicleDetails?.vehicleNumber || "Standard"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-3 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrderDetailsModal;
