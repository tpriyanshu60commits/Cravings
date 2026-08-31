import api from "../config/ApiConfig";
import toast from "react-hot-toast";

/**
 * Extracts clean destination string or coordinates without customer name or extraneous text.
 * Rule 1: Use customer latitude,longitude if available.
 * Rule 2: Otherwise use address, city, state, pinCode (strictly excluding name, phone, order IDs).
 */
export const getCleanDestination = (addressObj) => {
  if (!addressObj) return "";

  // 1. Prefer GPS coordinates if valid and non-empty
  const lat = addressObj.geoLocation?.lat;
  const lon = addressObj.geoLocation?.lon;
  if (lat && lon && String(lat).trim() !== "" && String(lon).trim() !== "") {
    return `${String(lat).trim()},${String(lon).trim()}`;
  }

  // 2. Address fields only (strictly excluding name, phone, or UI text)
  const parts = [
    addressObj.address,
    addressObj.city,
    addressObj.state,
    addressObj.pinCode,
  ]
    .map((p) => (p ? String(p).trim() : ""))
    .filter(Boolean);

  if (parts.length > 0) {
    return encodeURIComponent(parts.join(", "));
  }

  return "";
};

/**
 * Requests live browser GPS location, sends PATCH /rider/location to update backend,
 * and launches Google Maps with:
 * origin = rider GPS coordinates
 * destination = clean customer delivery address
 * travelmode = driving
 */
export const openRiderNavigation = (addressObj, currentRiderLocation = null) => {
  const destination = getCleanDestination(addressObj);
  if (!destination) {
    toast.error("Valid delivery address is not available for navigation");
    return;
  }

  const launchDirections = (lat, lon) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lon}&destination=${destination}&travelmode=driving`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!("geolocation" in navigator)) {
    toast.error("Geolocation is not supported by your browser");
    return;
  }

  // Request fresh browser GPS position
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      // Open Google Maps immediately with live GPS origin
      launchDirections(lat, lon);

      // Sync latest coordinates to backend
      try {
        await api.patch("/rider/location", { lat, lon });
      } catch (err) {
        console.warn("Location sync notice:", err.message);
      }
    },
    (error) => {
      console.warn("Geolocation permission error:", error.message);
      // If cached location exists as fallback, use it
      if (currentRiderLocation?.lat && currentRiderLocation?.lon) {
        launchDirections(currentRiderLocation.lat, currentRiderLocation.lon);
      } else {
        toast.error(
          "Please allow browser location permission so navigation starts from your current GPS position",
          { id: "geo-perm-alert" }
        );
      }
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
};
