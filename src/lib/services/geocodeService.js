// ---------------------------------------------------------------------------
// Turning a device's location into address fields.
//
// PRIVACY: this sends the customer's coordinates to OpenStreetMap's public
// Nominatim service. Nothing is stored by us, and the browser asks permission
// first, but it is a third party receiving a real location — worth knowing
// before this ships. Swap `reverseGeocode` for a paid geocoder (Google,
// MapMyIndia) if that matters; everything else here stays the same.
//
// Nominatim's usage policy allows light, user-triggered lookups like this one
// (roughly one request per second). It is never called on page load.
// ---------------------------------------------------------------------------

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

/** Browser geolocation, promisified. */
export function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("This browser cannot share your location."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }),
      (error) => {
        // The browser's own messages are vague; say what actually happened.
        if (error.code === error.PERMISSION_DENIED) {
          reject(
            new Error(
              "Location permission was denied. Allow it in your browser, or type the address in."
            )
          );
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          reject(new Error("Your location is not available right now."));
        } else if (error.code === error.TIMEOUT) {
          reject(new Error("Finding your location took too long."));
        } else {
          reject(new Error("Could not get your location."));
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000, ...options }
    );
  });
}

/**
 * Coordinates -> the address fields the form uses. Every value is a
 * suggestion: the form keeps them editable.
 *
 * @returns {Promise<object>} partial address form values
 */
export async function reverseGeocode({ latitude, longitude }) {
  const url =
    `${NOMINATIM_URL}?format=jsonv2&addressdetails=1` +
    `&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("Could not look up your address. Please type it in.");
  }

  const data = await response.json();
  const a = data?.address || {};

  // Nominatim names the same thing differently depending on the country and
  // how the area was mapped, so each field takes the first match available.
  const houseAndRoad = [a.house_number, a.road].filter(Boolean).join(" ");

  return {
    addressLine1: houseAndRoad || a.neighbourhood || a.suburb || "",
    addressLine2: [a.neighbourhood, a.suburb]
      .filter((part) => part && part !== houseAndRoad)
      .slice(0, 1)
      .join("") || "",
    city: a.city || a.town || a.village || a.municipality || a.county || "",
    state: a.state || a.state_district || "",
    postalCode: a.postcode || "",
    country: a.country || "India",
  };
}

/** Permission prompt, lookup, and mapping in one call. */
export async function locateAddress() {
  const position = await getCurrentPosition();
  return reverseGeocode(position);
}

export const geocodeService = {
  getCurrentPosition,
  reverseGeocode,
  locateAddress,
};

export default geocodeService;
