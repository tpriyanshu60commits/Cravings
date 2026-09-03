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
    <div className="p-4 sm:p-6 space-y-6 max-h-[88vh] overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#072420] p-4 sm:p-5 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Address Book</h2>
          <p className="text-xs text-[#8faea7] mt-0.5">
            Manage your delivery locations for faster checkout.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white text-xs font-bold rounded-xl hover:opacity-95 transition shadow-md shadow-orange-950/40 cursor-pointer"
        >
          <IoAdd className="text-base" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Address List */}
      {isLoading ? (
        <Loader height="300px" width="100%" />
      ) : addressList.length === 0 ? (
        <div className="text-center py-16 bg-[#072420] rounded-2xl border border-teal-800/40 space-y-3 shadow-xl shadow-black/40">
          <IoLocationOutline className="text-5xl mx-auto text-[#8faea7] opacity-40" />
          <p className="text-sm font-semibold text-white">
            No addresses saved yet
          </p>
          <p className="text-xs text-[#8faea7] max-w-sm mx-auto">
            Add your delivery addresses to enjoy seamless and speedy checkout when ordering meals.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white text-xs font-bold rounded-xl hover:opacity-95 transition shadow-md shadow-orange-950/40 cursor-pointer"
          >
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addressList.map((addr) => (
            <div
              key={addr._id}
              className={`p-5 rounded-2xl bg-[#072420] border transition shadow-xl shadow-black/40 relative flex flex-col justify-between ${
                addr.isDefault
                  ? "border-orange-500/60 ring-1 ring-orange-500/30"
                  : "border-teal-800/40 hover:border-teal-700/60"
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white">
                    {getAddressIcon(addr.addressType)}
                    {addr.addressType}
                  </span>
                  {addr.isDefault && (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      <IoCheckmarkCircle className="text-xs" /> Default Address
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">
                    {addr.name}
                  </h4>
                  <p className="text-xs text-[#8faea7] mt-1 leading-relaxed">
                    {addr.address}, {addr.city}, {addr.state} - {addr.pinCode}, {addr.country}
                  </p>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex justify-end gap-2 pt-4 mt-3 border-t border-teal-900/40">
                <button
                  onClick={() => handleOpenEditModal(addr)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#041916] hover:bg-teal-900/30 border border-teal-800/60 text-[#8faea7] hover:text-white transition cursor-pointer"
                >
                  <IoPencilOutline className="text-xs text-orange-400" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteAddress(addr._id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                >
                  <IoTrashOutline className="text-xs" />
                  <span>Delete</span>
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
