import { useState } from "react";
import api from "../../../../config/ApiConfig";
import toast from "react-hot-toast";

const RestaurantSocialMediaLinks = () => {
  const [editingSocialMediaLinks, setEditingSocialMediaLinks] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [restaurantData, setRestaurantData] = useState(
    JSON.parse(sessionStorage.getItem("cravingRestaurant")) || {},
  );
  const [socialMediaLinksFormData, setSocialMediaLinksFormData] = useState({
    socialMediaLinks: restaurantData?.socialMediaLinks || [],
  });
  const handleSocialMediaChange = (index, field, value) => {
    const updatedLinks = [...socialMediaLinksFormData.socialMediaLinks];
    updatedLinks[index][field] = value;
    setSocialMediaLinksFormData({ socialMediaLinks: updatedLinks });
  };
  const removeSocialMediaLink = (index) => {
    const updatedLinks = [...socialMediaLinksFormData.socialMediaLinks];
    updatedLinks.splice(index, 1);
    setSocialMediaLinksFormData({ socialMediaLinks: updatedLinks });
  };

  const addSocialMediaLink = () => {
    setSocialMediaLinksFormData((prevData) => ({
      socialMediaLinks: [
        ...prevData.socialMediaLinks,
        { platform: "", url: "" },
      ],
    }));
  };
  const handleSaveSocialMediaLinks = async () => {
    try {
      setIsLoading(true);
      const res = await api.put("/restaurant/update-social-media-links", {
        socialMediaLinks: socialMediaLinksFormData.socialMediaLinks,
      });
      setRestaurantData(res.data.data);
      sessionStorage.setItem(
        "cravingRestaurant",
        JSON.stringify(res.data.data),
      );
      toast.success(res.data.message);
      setEditingSocialMediaLinks(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update social media links. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };
  const handleCancelSocialMediaLinks = () => {
    setSocialMediaLinksFormData({
      socialMediaLinks: restaurantData?.socialMediaLinks || [],
    });
    setEditingSocialMediaLinks(false);
  };

  return (
    <>
      <div className="bg-[#072420] rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 p-5 flex flex-col space-y-4">
        <div className="flex justify-between items-center border-b border-teal-900/60 pb-3">
          <label className="text-sm font-bold text-white tracking-tight">
            Social Media Channels
          </label>
          {!editingSocialMediaLinks ? (
            <button
              type="button"
              onClick={() => setEditingSocialMediaLinks(true)}
              className="flex items-center gap-1.5 bg-[#041916] border border-teal-800/60 text-[#8faea7] hover:text-white hover:border-orange-500/60 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Edit Links
            </button>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={addSocialMediaLink}
                disabled={isLoading}
                className="text-xs bg-[#041916] border border-teal-800/60 text-orange-400 hover:text-orange-300 hover:border-orange-500/60 px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer"
              >
                + Add Link
              </button>
              <button
                type="button"
                onClick={handleSaveSocialMediaLinks}
                disabled={isLoading}
                className="text-xs bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white px-3.5 py-1.5 rounded-xl font-bold shadow-md shadow-orange-950/40 hover:opacity-95 transition cursor-pointer"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={handleCancelSocialMediaLinks}
                disabled={isLoading}
                className="text-xs bg-[#041916] border border-teal-800/60 text-[#8faea7] hover:text-white px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 min-h-24 max-h-48 overflow-y-auto">
          {socialMediaLinksFormData.socialMediaLinks.map((link, index) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <input
                type="text"
                placeholder="Platform (e.g. Instagram)"
                value={link.platform}
                onChange={(e) =>
                  handleSocialMediaChange(index, "platform", e.target.value)
                }
                className={`w-full px-3 py-2 border border-teal-800/60 rounded-xl text-xs text-white placeholder-[#537770] ${
                  editingSocialMediaLinks
                    ? "bg-[#041916] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                    : "bg-[#041916]/50 opacity-80"
                }`}
                disabled={!editingSocialMediaLinks}
              />
              <div className="flex gap-2 items-center">
                <input
                  type="url"
                  placeholder="Profile URL"
                  value={link.url}
                  onChange={(e) =>
                    handleSocialMediaChange(index, "url", e.target.value)
                  }
                  className={`w-full px-3 py-2 border border-teal-800/60 rounded-xl text-xs text-white placeholder-[#537770] ${
                    editingSocialMediaLinks
                      ? "bg-[#041916] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                      : "bg-[#041916]/50 opacity-80"
                  }`}
                  disabled={!editingSocialMediaLinks}
                />

                <button
                  type="button"
                  onClick={() => removeSocialMediaLink(index)}
                  disabled={!editingSocialMediaLinks}
                  className="text-rose-400 hover:text-rose-300 text-sm p-1.5 rounded-lg hover:bg-rose-500/10 disabled:opacity-30 cursor-pointer"
                  title="Remove link"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          {socialMediaLinksFormData.socialMediaLinks.length === 0 && (
            <p className="text-xs text-[#8faea7] py-2 text-center">
              No social media links added yet.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default RestaurantSocialMediaLinks;
