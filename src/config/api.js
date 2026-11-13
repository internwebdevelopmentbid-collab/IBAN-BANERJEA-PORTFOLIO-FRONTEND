const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const apiOrigin = API_URL;

export const getMediaUrl = (url) => {
  if (!url) {
    return "";
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${API_URL}${url.startsWith("/") ? url : `/${url}`}`;
};

/**
 * Returns an optimized Cloudinary delivery URL.
 *
 * The original Cloudinary URL remains unchanged in MongoDB.
 * This only modifies the URL used by the browser.
 */
export const getOptimizedImageUrl = (url, width = 1200) => {
  if (!url) {
    return "";
  }

  const mediaUrl = getMediaUrl(url);

  // Only apply Cloudinary transformations to Cloudinary images.
  if (!mediaUrl.includes("res.cloudinary.com")) {
    return mediaUrl;
  }

  // Prevent adding transformations twice.
  if (mediaUrl.includes("/image/upload/f_auto")) {
    return mediaUrl;
  }

  return mediaUrl.replace(
    "/image/upload/",
    `/image/upload/f_auto,q_auto,w_${width},c_limit/`,
  );
};

export const apiRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : {
            "Content-Type": "application/json",
          }),
      ...(options.headers || {}),
    },
  });

  let data;

  try {
    data = await response.json();
  } catch {
    data = {
      success: false,
      message: "Invalid server response",
    };
  }

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export default API_URL;
