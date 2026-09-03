import { useState, useEffect, useMemo } from "react";
import { MdOutlineAddAPhoto, MdDeleteOutline } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import api from "../../../config/ApiConfig";
import toast from "react-hot-toast";
import { RiLoader4Fill } from "react-icons/ri";

const RestaurantPhotos = () => {
  const MAX_FILE_SIZE = 1024 * 1024;
  const MAX_GALLERY_IMAGES = 8;
  const [restaurantData, setRestaurantData] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("cravingRestaurant")) || {};
    } catch (error) {
      console.error("Invalid restaurant data:", error);
      return {};
    }
  });
  const [coverImage, setCoverImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [errors, setErrors] = useState({ cover: "", gallery: "" });
  const [isSavingCover, setIsSavingCover] = useState(false);
  const [isSavingGallery, setIsSavingGallery] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState(null);

  const existingGalleryImages = restaurantData?.restaurantImage || [];
  const remainingSlots = MAX_GALLERY_IMAGES - existingGalleryImages.length;

  const coverPreview = useMemo(() => {
    return coverImage ? URL.createObjectURL(coverImage) : "";
  }, [coverImage]);

  useEffect(() => {
    return () => {
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [coverPreview]);

  const galleryPreviews = useMemo(() => {
    return galleryImages.map((image) => ({
      file: image,
      url: URL.createObjectURL(image),
      key: `${image.name}-${image.lastModified}`,
    }));
  }, [galleryImages]);

  useEffect(() => {
    return () => {
      galleryPreviews.forEach((imagePreview) => {
        URL.revokeObjectURL(imagePreview.url);
      });
    };
  }, [galleryPreviews]);

  const handleCoverImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setCoverImage(null);
      setErrors((prev) => ({ ...prev, cover: "" }));
      return;
    }
    if (file.size >= MAX_FILE_SIZE) {
      setCoverImage(null);
      setErrors((prev) => ({
        ...prev,
        cover: "Cover image must be less than 1MB.",
      }));
      event.target.value = "";
      return;
    }
    setCoverImage(file);
    setErrors((prev) => ({ ...prev, cover: "" }));
  };

  const handleGalleryImagesChange = (event) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }
    const oversizedFiles = files.filter((file) => file.size >= MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      setErrors((prev) => ({
        ...prev,
        gallery: "Each restaurant image must be less than 1MB.",
      }));
      event.target.value = "";
      return;
    }

    setGalleryImages((prevImages) => {
      const merged = [...prevImages, ...files];
      if (existingGalleryImages.length + merged.length > MAX_GALLERY_IMAGES) {
        setErrors((prev) => ({
          ...prev,
          gallery: `You can upload up to ${remainingSlots} more image(s) (Maximum ${MAX_GALLERY_IMAGES} total).`,
        }));
        return merged.slice(0, Math.max(0, remainingSlots));
      }

      setErrors((prev) => ({ ...prev, gallery: "" }));
      return merged;
    });
    event.target.value = "";
  };

  const removeQueuedImage = (indexToRemove) => {
    setGalleryImages((prevImages) =>
      prevImages.filter((_, index) => index !== indexToRemove),
    );
    setErrors((prev) => ({ ...prev, gallery: "" }));
  };

  const handleSaveCoverPhoto = async () => {
    if (!coverImage) {
      toast.error("Please select a cover image to upload.");
      return;
    }
    try {
      setIsSavingCover(true);
      const formData = new FormData();
      formData.append("coverImage", coverImage);
      const res = await api.put("/restaurant/update-cover-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setRestaurantData(res.data.data);
      sessionStorage.setItem(
        "cravingRestaurant",
        JSON.stringify(res.data.data),
      );
      toast.success(res.data.message);
      setCoverImage(null);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update cover photo. Please try again.",
      );
    } finally {
      setIsSavingCover(false);
    }
  };

  const handleSaveRestaurantImages = async () => {
    if (galleryImages.length === 0) {
      toast.error("Please select at least one restaurant image to upload.");
      return;
    }
    try {
      setIsSavingGallery(true);
      const formData = new FormData();
      galleryImages.forEach((img) => {
        formData.append("restaurantImages", img);
      });
      const res = await api.put(
        "/restaurant/update-restaurant-images",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      setRestaurantData(res.data.data);
      sessionStorage.setItem(
        "cravingRestaurant",
        JSON.stringify(res.data.data),
      );
      toast.success(res.data.message || "Images added to gallery successfully");
      setGalleryImages([]);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to upload restaurant images. Please try again.",
      );
    } finally {
      setIsSavingGallery(false);
    }
  };

  const handleDeleteExistingImage = async (image) => {
    const idKey = image._id || image.publicId;
    try {
      setDeletingImageId(idKey);
      const endpoint = image._id
        ? `/restaurant/restaurant-image/${image._id}`
        : `/restaurant/restaurant-image/${encodeURIComponent(image.publicId)}`;

      const res = await api.delete(endpoint, {
        params: { publicId: image.publicId },
      });

      setRestaurantData(res.data.data);
      sessionStorage.setItem(
        "cravingRestaurant",
        JSON.stringify(res.data.data),
      );
      toast.success(res.data.message || "Image deleted successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete image. Please try again.",
      );
    } finally {
      setDeletingImageId(null);
    }
  };

  return (
    <div className="p-1 space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-4 items-start">
        {/* Cover Photo Box */}
        <div className="bg-[#072420] rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 p-5 h-full space-y-4">
          <div className="flex items-center justify-between border-b border-teal-900/60 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Cover Image
              </h3>
              <p className="text-xs text-[#8faea7]">
                Upload one hero image under 1MB.
              </p>
            </div>
            <button
              onClick={handleSaveCoverPhoto}
              disabled={!coverImage || isSavingCover}
              className="flex items-center gap-1.5 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md shadow-orange-950/40 hover:opacity-95 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSavingCover ? <RiLoader4Fill className="animate-spin" /> : null}
              {isSavingCover ? "Saving..." : "Save Cover Photo"}
            </button>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-dashed border-teal-800/80 bg-[#041916] p-4 text-center">
              <label
                htmlFor="coverImage"
                className="inline-flex items-center gap-2 bg-[#072420] border border-teal-800/60 text-white px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-sm hover:border-orange-500/60 transition"
              >
                <MdOutlineAddAPhoto className="text-sm text-orange-400" />
                Upload Cover Image
              </label>
              <input
                id="coverImage"
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="hidden"
              />
              <p className="mt-2 text-xs text-[#8faea7]">
                Best for banner-style photos. JPG, PNG, AVIF, WEBP all work.
              </p>
              {errors.cover && (
                <p className="text-xs text-rose-400 mt-2 font-medium">
                  {errors.cover}
                </p>
              )}
            </div>

            {coverImage && coverPreview ? (
              <div className="overflow-hidden rounded-2xl border border-teal-800/60 bg-[#041916] shadow-md">
                <div className="relative">
                  <img
                    src={coverPreview}
                    alt="Cover Preview"
                    className="w-full h-52 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-black">
                    New — Not Saved
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-white">
                  <p className="truncate font-medium">{coverImage.name}</p>
                  <span className="shrink-0 rounded-full bg-teal-900/60 text-[#8faea7] px-2 py-0.5 text-[11px]">
                    {(coverImage.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>
            ) : restaurantData?.coverImage?.url ? (
              <div className="overflow-hidden rounded-2xl border border-teal-800/60 bg-[#041916] shadow-md">
                <div className="relative">
                  <img
                    src={restaurantData.coverImage.url}
                    alt="Current Cover"
                    className="w-full h-52 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute top-2 left-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500 text-black">
                    Current
                  </span>
                </div>
                <p className="px-3 py-2 text-xs text-[#8faea7]">
                  Upload a new image above to replace this cover.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-teal-800/60 bg-[#041916] px-4 py-8 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-400 border border-orange-500/30">
                  <MdOutlineAddAPhoto className="text-xl" />
                </div>
                <p className="text-sm font-bold text-white">
                  No cover selected
                </p>
                <p className="mt-1 text-xs text-[#8faea7]">
                  Add a clean hero image to make this restaurant stand out.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Gallery Images Box */}
        <div className="bg-[#072420] rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 p-5 h-full space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-900/60 pb-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Restaurant Gallery Images
                </h3>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30 font-bold">
                  {existingGalleryImages.length}/{MAX_GALLERY_IMAGES} Saved
                </span>
                {galleryImages.length > 0 && (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                    +{galleryImages.length} Queued
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8faea7] mt-0.5">
                Upload up to {MAX_GALLERY_IMAGES} images total. New uploads are appended to your gallery.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <label
                htmlFor="galleryImages"
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition ${
                  remainingSlots <= 0
                    ? "bg-[#041916] text-[#8faea7] cursor-not-allowed opacity-50 border border-teal-800/40"
                    : "bg-[#041916] border border-teal-800/60 text-white cursor-pointer hover:border-orange-500/60"
                }`}
              >
                <MdOutlineAddAPhoto className="text-sm text-orange-400" />
                Select New Images
              </label>
              <input
                id="galleryImages"
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryImagesChange}
                disabled={remainingSlots <= 0}
                className="hidden"
              />
              <button
                onClick={handleSaveRestaurantImages}
                disabled={galleryImages.length === 0 || isSavingGallery}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white px-3.5 py-1.5 rounded-xl text-xs shadow-md shadow-orange-950/40 transition disabled:opacity-40 disabled:cursor-not-allowed font-bold cursor-pointer"
              >
                {isSavingGallery && <RiLoader4Fill className="animate-spin" />}
                {isSavingGallery ? "Uploading..." : `Upload (${galleryImages.length})`}
              </button>
            </div>
          </div>

          {errors.gallery && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2">
              <p className="text-xs text-rose-400">{errors.gallery}</p>
            </div>
          )}

          {/* Section: Pending/Queued Uploads */}
          {galleryPreviews.length > 0 && (
            <div className="space-y-2 bg-[#041916] p-4 rounded-2xl border border-amber-500/30">
              <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-amber-300">
                  New Images Ready to Upload ({galleryPreviews.length})
                </p>
                <button
                  type="button"
                  onClick={() => setGalleryImages([])}
                  className="text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer"
                >
                  Clear Queue
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {galleryPreviews.map((imagePreview, index) => (
                  <div
                    key={imagePreview.key}
                    className="group relative overflow-hidden rounded-xl border border-amber-500/40 bg-[#072420] shadow-sm"
                  >
                    <img
                      src={imagePreview.url}
                      alt={`Pending ${index + 1}`}
                      className="h-28 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeQueuedImage(index)}
                      className="absolute right-1.5 top-1.5 h-6 w-6 rounded-full bg-black/70 text-rose-400 shadow flex items-center justify-center hover:bg-rose-600 hover:text-white transition cursor-pointer"
                      title="Remove from queue"
                    >
                      <IoMdClose size={16} />
                    </button>
                    <div className="px-2 py-1 bg-[#072420]/90">
                      <p className="truncate text-[10px] font-medium text-white">
                        {imagePreview.file.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Currently Saved Gallery Images with Individual Delete */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white">
              Saved Images ({existingGalleryImages.length})
            </h4>

            {existingGalleryImages.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-teal-800/60 bg-[#041916] px-4 py-10 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-400 border border-orange-500/30">
                  <MdOutlineAddAPhoto className="text-xl" />
                </div>
                <p className="text-sm font-bold text-white">
                  No restaurant images saved yet
                </p>
                <p className="mt-1 text-xs text-[#8faea7]">
                  Add up to 8 supporting photos to show the dining space, food, and kitchen.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {existingGalleryImages.map((img, index) => {
                  const idKey = img._id || img.publicId;
                  const isDeleting = deletingImageId === idKey;
                  return (
                    <div
                      key={idKey || index}
                      className="group relative overflow-hidden rounded-xl border border-teal-800/60 bg-[#041916] shadow-sm hover:border-teal-600 transition"
                    >
                      <img
                        src={img.url}
                        alt={`Restaurant ${index + 1}`}
                        className="h-32 w-full object-cover"
                      />

                      {/* Individual Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteExistingImage(img)}
                        disabled={isDeleting}
                        className="absolute right-2 top-2 h-7 w-7 rounded-full bg-black/75 text-rose-400 shadow-md flex items-center justify-center hover:bg-rose-600 hover:text-white transition disabled:opacity-50 cursor-pointer"
                        title="Delete this image"
                      >
                        {isDeleting ? (
                          <RiLoader4Fill className="animate-spin text-sm" />
                        ) : (
                          <MdDeleteOutline size={16} />
                        )}
                      </button>

                      <div className="px-2 py-1.5 flex items-center justify-between text-[10px] text-[#8faea7] bg-[#041916]">
                        <span>Image #{index + 1}</span>
                        <span className="text-emerald-400 font-semibold">Saved</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantPhotos;
