import { useState } from "react";
import api from "../../../../config/ApiConfig";
import toast from "react-hot-toast";
import { MdEdit } from "react-icons/md";

const LegalInformation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [editingLegalInfo, setEditingLegalInfo] = useState(false);
  const [restaurantData, setRestaurantData] = useState(
    JSON.parse(sessionStorage.getItem("cravingRestaurant")) || [],
  );
  const [legalInfoFormData, setLegalInfoFormData] = useState({
    legalName: restaurantData.legal?.legalName || "",
    companyType: restaurantData.legal?.companyType || "",
  });
  const handleSaveLegalInfo = async () => {
    try {
      setEditingLegalInfo(false);
      setIsLoading(true);
      const res = await api.put(
        "/restaurant/update-legal-info",
        legalInfoFormData,
      );
      toast.success(res.data.message);
      setRestaurantData(res.data.data);
      sessionStorage.setItem(
        "cravingRestaurant",
        JSON.stringify(res.data.data),
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unknown error occurred updating restaurant. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };
  const handleCancelLegalInfo = () => {
    setLegalInfoFormData({
      legalName: restaurantData.legal?.legalName || "",
      companyType: restaurantData.legal?.companyType || "",
    });
    setEditingLegalInfo(false);
  };

  return (
    <>
      <div className="bg-[#072420] rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-teal-900/60 pb-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-white tracking-tight">
              Legal Business Entity Details
            </h3>
          </div>
          {!editingLegalInfo ? (
            <div className="flex gap-3">
              <button
                onClick={() => setEditingLegalInfo(true)}
                className="flex items-center gap-1.5 bg-[#041916] border border-teal-800/60 text-[#8faea7] hover:text-white hover:border-orange-500/60 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <MdEdit size={14} className="text-orange-400" /> Edit Legal Info
              </button>
            </div>
          ) : (
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleSaveLegalInfo}
                className="flex items-center gap-1.5 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md shadow-orange-950/40 hover:opacity-95 transition cursor-pointer"
                disabled={!editingLegalInfo}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={handleCancelLegalInfo}
                className="flex items-center gap-1.5 bg-[#041916] border border-teal-800/60 text-[#8faea7] hover:text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                disabled={!editingLegalInfo}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="w-full">
            <label className="text-xs font-semibold text-[#8faea7] block mb-1">Registered Legal Entity Name</label>
            <input
              type="text"
              name="legalName"
              value={legalInfoFormData?.legalName || ""}
              onChange={(e) =>
                setLegalInfoFormData({
                  ...legalInfoFormData,
                  legalName: e.target.value,
                })
              }
              className={`w-full px-3 py-2 text-xs border border-teal-800/60 rounded-xl text-white ${
                editingLegalInfo
                  ? "bg-[#041916] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                  : "bg-[#041916]/50 opacity-80"
              }`}
              disabled={!editingLegalInfo}
            />
          </div>
          <div className="w-full">
            <label className="text-xs font-semibold text-[#8faea7] block mb-1">Company Entity Type</label>
            <select
              name="companyType"
              value={legalInfoFormData?.companyType || ""}
              onChange={(e) =>
                setLegalInfoFormData({
                  ...legalInfoFormData,
                  companyType: e.target.value,
                })
              }
              className={`w-full px-3 py-2 text-xs border border-teal-800/60 rounded-xl text-white ${
                editingLegalInfo
                  ? "bg-[#041916] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                  : "bg-[#041916]/50 opacity-80"
              }`}
              disabled={!editingLegalInfo}
            >
              <option value="" className="bg-[#072420] text-[#8faea7]">-- Select Company Type --</option>
              <option value="privateLimitedCompany" className="bg-[#072420] text-white">
                Private Limited Company
              </option>
              <option value="publicLimitedCompany" className="bg-[#072420] text-white">
                Public Limited Company
              </option>
              <option value="limitedLiabilityPartnership" className="bg-[#072420] text-white">
                Limited Liability Partnership (LLP)
              </option>
              <option value="soleProprietorship" className="bg-[#072420] text-white">Sole Proprietorship</option>
              <option value="partnershipFirm" className="bg-[#072420] text-white">Partnership Firm</option>
              <option value="onePersonCompany" className="bg-[#072420] text-white">One Person Company (OPC)</option>
              <option value="section8Company" className="bg-[#072420] text-white">
                Section 8 Company (Non-profit Organizations)
              </option>
              <option value="trustSociety" className="bg-[#072420] text-white">Trust / Society</option>
              <option value="governmentPublicSectorUndertaking" className="bg-[#072420] text-white">
                Government / Public Sector Undertaking (PSU)
              </option>
              <option value="foreignSubsidiaryLiaisonOffice" className="bg-[#072420] text-white">
                Foreign Subsidiary / Liaison Office
              </option>
            </select>
          </div>
        </div>
      </div>
    </>
  );
};

export default LegalInformation;
