import { useState, useEffect } from "react";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import Loader from "../Loader";
import CustomerAddressModal from "./CustomerAddressModal";
import {
  IoAdd,
  IoHomeOutline,
  IoBriefcaseOutline,
  IoLocationOutline,
  IoTrashOutline,
  IoPencilOutline,
  IoCheckmarkCircle,
} from "react-icons/io5";

const CustomerAddressBook = () => {
  const [addressList, setAddressList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState(null);



  useEffect(() => {
    let isMounted = true;
    const loadAddressBook = async () => {
      try {
        const res = await api.get("/customer/address-book");
        if (isMounted) {
          setAddressList(res.data.data || []);
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(
            error.response?.data?.message || "Failed to load address book",
          );
          setIsLoading(false);
        }
      }
    };
    loadAddressBook();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenAddModal = () => {
    setAddressToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (addr) => {
    setAddressToEdit(addr);
    setIsModalOpen(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      const res = await api.delete(`/customer/address-book/${addressId}`);
      toast.success("Address deleted successfully");
      setAddressList(res.data.data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete address",
      );
    }
  };

  const getAddressIcon = (type) => {
    if (type === "work") return <IoBriefcaseOutline className="text-base text-blue-500" />;
    if (type === "home") return <IoHomeOutline className="text-base text-green-500" />;
    return <IoLocationOutline className="text-base text-orange-500" />;
  };

  return (
    <div className="p-6 space-y-6 max-h-[88vh] overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-(--color-base-100) p-5 rounded-2xl border border-(--color-base-300) shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-(--color-base-content)">Address Book</h2>
          <p className="text-xs text-(--color-secondary) mt-0.5">
            Manage your delivery locations for faster checkout.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-(--color-primary) text-(--color-primary-content) text-xs font-semibold rounded-xl hover:opacity-90 transition shadow-xs"
        >
          <IoAdd className="text-base" /> Add New Address
        </button>
      </div>

      {/* Address List */}
      {isLoading ? (
        <Loader height="300px" width="100%" />
      ) : addressList.length === 0 ? (
        <div className="text-center py-16 bg-(--color-base-100) rounded-2xl border border-(--color-base-300) space-y-3">
          <IoLocationOutline className="text-5xl mx-auto text-(--color-secondary) opacity-40" />
          <p className="text-sm font-semibold text-(--color-base-content)">
            No addresses saved yet
          </p>
          <p className="text-xs text-(--color-secondary) max-w-sm mx-auto">
            Add your delivery addresses to enjoy seamless and speedy checkout when ordering meals.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-(--color-primary) text-(--color-primary-content) text-xs font-semibold rounded-xl hover:opacity-90 transition"
          >
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addressList.map((addr) => (
            <div
              key={addr._id}
              className={`p-5 rounded-2xl bg-(--color-base-100) border transition shadow-xs relative flex flex-col justify-between ${
                addr.isDefault
                  ? "border-(--color-primary) ring-1 ring-(--color-primary)/20"
                  : "border-(--color-base-300) hover:border-gray-400"
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-(--color-base-content)">
                    {getAddressIcon(addr.addressType)}
                    {addr.addressType}
                  </span>
                  {addr.isDefault && (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                      <IoCheckmarkCircle className="text-xs" /> Default Address
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-(--color-base-content)">
                    {addr.name}
                  </h4>
                  <p className="text-xs text-(--color-secondary) mt-1 leading-relaxed">
                    {addr.address}, {addr.city}, {addr.state} - {addr.pinCode}, {addr.country}
                  </p>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex justify-end gap-2 pt-4 mt-3 border-t border-(--color-base-300)">
                <button
                  onClick={() => handleOpenEditModal(addr)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-(--color-base-200) hover:bg-(--color-base-300) text-(--color-base-content) transition"
                >
                  <IoPencilOutline className="text-xs" /> Edit
                </button>
                <button
                  onClick={() => handleDeleteAddress(addr._id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                >
                  <IoTrashOutline className="text-xs" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <CustomerAddressModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          addressToEdit={addressToEdit}
          onSaveSuccess={(updatedList) => setAddressList(updatedList)}
        />
      )}
    </div>
  );
};

export default CustomerAddressBook;
