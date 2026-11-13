import { useCallback, useEffect, useState } from "react";

import AdminLayout from "../components/AdminLayout";
import AdminNotice from "../components/AdminNotice";
import ImageUploader from "../components/ImageUploader";

import { apiRequest, getOptimizedImageUrl } from "../../config/api";

const HOME_SLOTS = [
  {
    slot: "corporate",
    title: "Corporate",
    description:
      "Main image displayed for the Corporate section on the Home page.",
  },
  {
    slot: "artist",
    title: "Artist",
    description:
      "Main image displayed for the Artist section on the Home page.",
  },
];

function AdminHome() {
  const [images, setImages] = useState([]);

  const [loading, setLoading] = useState(true);

  const [notice, setNotice] = useState(null);

  const [activeOperation, setActiveOperation] = useState(null);

  const showNotice = useCallback((type, message) => {
    setNotice({
      type,
      message,
    });
  }, []);

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setNotice(null);
    }, 4000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [notice]);

  const loadHomeImages = useCallback(async () => {
    try {
      setLoading(true);

      const result = await apiRequest("/api/home");

      setImages(Array.isArray(result?.images) ? result.images : []);
    } catch (error) {
      showNotice("error", error?.message || "Failed to load Home images.");
    } finally {
      setLoading(false);
    }
  }, [showNotice]);

  useEffect(() => {
    loadHomeImages();
  }, [loadHomeImages]);

  const getImageForSlot = useCallback(
    (slot) => images.find((image) => image?.slot === slot),
    [images],
  );

  const uploadImage = async (slot, file) => {
    if (!file || activeOperation) {
      return;
    }

    const formData = new FormData();

    formData.append("image", file);

    setActiveOperation(`upload-${slot}`);

    try {
      const result = await apiRequest(`/api/home/${slot}`, {
        method: "POST",
        body: formData,
      });

      showNotice(
        "success",
        result?.message || `${slot} Home image uploaded successfully.`,
      );

      await loadHomeImages();
    } catch (error) {
      showNotice(
        "error",
        error?.message || `Failed to upload ${slot} Home image.`,
      );

      throw error;
    } finally {
      setActiveOperation(null);
    }
  };

  const deleteImage = async (slot) => {
    if (activeOperation) {
      return;
    }

    setActiveOperation(`delete-${slot}`);

    try {
      const result = await apiRequest(`/api/home/${slot}`, {
        method: "DELETE",
      });

      showNotice(
        "success",
        result?.message || `${slot} Home image deleted successfully.`,
      );

      await loadHomeImages();
    } catch (error) {
      showNotice(
        "error",
        error?.message || `Failed to delete ${slot} Home image.`,
      );

      throw error;
    } finally {
      setActiveOperation(null);
    }
  };

  return (
    <AdminLayout>
      <AdminNotice notice={notice} onClose={() => setNotice(null)} />

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <header className="mb-12">
          <p className="text-[9px] uppercase tracking-[0.4em] text-[#C9974B]">
            Content
          </p>

          <div className="mt-4 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-display text-[clamp(2.8rem,6vw,5.5rem)] leading-none tracking-[-0.055em]">
                Home
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-white/35">
                Manage the Corporate and Artist images displayed on the Home
                page.
              </p>
            </div>

            <span className="text-[9px] uppercase tracking-[0.25em] text-white/20">
              2 image slots
            </span>
          </div>
        </header>

        {loading ? (
          <div className="grid gap-5">
            {HOME_SLOTS.map((item) => (
              <div
                key={item.slot}
                className="h-[360px] animate-pulse border border-white/[0.05] bg-white/[0.015]"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-5">
            {HOME_SLOTS.map((item) => {
              const image = getImageForSlot(item.slot);

              /*
               * Cloudinary images are delivered
               * using automatic format, automatic
               * quality and a controlled maximum width.
               *
               * This prevents the admin browser from
               * downloading the original large image.
               */
              const imageUrl = image?.url
                ? getOptimizedImageUrl(image.url, 900)
                : "";

              const isUploading = activeOperation === `upload-${item.slot}`;

              const isDeleting = activeOperation === `delete-${item.slot}`;

              return (
                <ImageUploader
                  key={item.slot}
                  title={item.title}
                  description={item.description}
                  imageUrl={imageUrl}
                  onUpload={(file) => uploadImage(item.slot, file)}
                  onDelete={image ? () => deleteImage(item.slot) : undefined}
                  disabled={
                    Boolean(activeOperation) && !isUploading && !isDeleting
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminHome;
