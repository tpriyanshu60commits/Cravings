import { useState, useEffect } from "react";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/Loader";
import { RiLoader4Fill } from "react-icons/ri";
import Information from "./settings/restaurantInformation/Index";
import CoreDetails from "./settings/coreDetails/Index";
import RestaurantPhotos from "./settings/RestaurantPhotos";

const RestaurantSettings = () => {
  const { user } = useAuth();
  const Tabs = [
    { id: "information", label: "Information" },
    { id: "coreDetails", label: "Core Details" },
    { id: "photos", label: "Photos" },
  ];
  const [activeTab, setActiveTab] = useState("information");
  const [isLoadingRestaurantOpen, setIsLoadingRestaurantOpen] = useState(false);
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(
    () => sessionStorage.getItem("RestaurantOpen") === "true",
  );
  //Load Restaurant Data
  const [isLoadingRestaurant, setIsLoadingRestaurant] = useState(false);

  const handleRestaurantOpen = async () => {
    try {
      setIsLoadingRestaurantOpen(true);
      const res = await api.patch(
        `/restaurant/change-open-status/${!isRestaurantOpen}?id=${user._id}`,
      );
      setIsRestaurantOpen(res.data.data.isOpen);
      sessionStorage.setItem(
        "cravingRestaurant",
        JSON.stringify(res.data.data),
      );
      sessionStorage.setItem("RestaurantOpen", res.data.data.isOpen);
      toast.success(res.data.message);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unknown error occurred while Opening the Restaurant. Please try again.",
      );
    } finally {
      setIsLoadingRestaurantOpen(false);
    }
  };

  useEffect(() => {
    if (!user?._id) return;
    let isMounted = true;
    api
      .get(`restaurant/get-restaurant-data?id=${user._id}`)
      .then((res) => {
        if (isMounted && res.data?.data) {
          sessionStorage.setItem(
            "cravingRestaurant",
            JSON.stringify(res.data.data),
          );
          sessionStorage.setItem(
            "RestaurantOpen",
            JSON.stringify(res.data.data.isOpen),
          );
          setIsRestaurantOpen(res.data.data.isOpen);
          setIsLoadingRestaurant(false);
          setIsLoadingRestaurantOpen(false);
        }
      })
      .catch((error) => {
        if (isMounted) {
          toast.error(
            error.response?.data?.message ||
              "Unknown error occurred fetching restaurant. Please try again.",
          );
          setIsLoadingRestaurant(false);
          setIsLoadingRestaurantOpen(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [user?._id]);

  return (
    <>
      <div className="h-full flex flex-col space-y-4">
        {isLoadingRestaurant ? (
          <Loader height="100%" width="100%" />
        ) : (
          <>
            <div className="bg-[#072420] border border-teal-800/40 p-3 rounded-2xl flex flex-wrap justify-between items-center gap-3 shadow-xl shadow-black/40">
              <div className="flex gap-2">
                {Tabs.map((tab, idx) => (
                  <button
                    key={idx}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white shadow-md shadow-orange-950/40"
                        : "text-[#8faea7] hover:text-white hover:bg-teal-900/30"
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2.5 bg-[#041916] border border-teal-800/60 px-3.5 py-2 rounded-xl">
                <label className="text-xs font-semibold text-white select-none">
                  Currently Open
                </label>
                {isLoadingRestaurantOpen || isLoadingRestaurant ? (
                  <RiLoader4Fill className="animate-spin text-[#ea580c]" />
                ) : (
                  <input
                    type="checkbox"
                    name="isOpen"
                    checked={isRestaurantOpen}
                    onChange={handleRestaurantOpen}
                    className="w-4 h-4 accent-[#ea580c] cursor-pointer rounded"
                  />
                )}
              </div>
            </div>
            <div className="h-full rounded-2xl bg-transparent space-y-4">
              {activeTab === "information" && <Information />}
              {activeTab === "coreDetails" && <CoreDetails />}
              {activeTab === "photos" && <RestaurantPhotos />}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default RestaurantSettings;
