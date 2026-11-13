import { useCallback, useEffect, useState } from "react";

import AdminLayout from "../components/AdminLayout";
import AdminNotice from "../components/AdminNotice";
import ImageUploader from "../components/ImageUploader";

import { apiRequest, getOptimizedImageUrl } from "../../config/api";

const TABS = [
  {
    key: "artist",
    label: "Artist",
  },
  {
    key: "corporate",
    label: "Corporate",
  },
];

const SLOTS = [
  {
    key: "hero",
    title: "Hero",
    description: "Main hero image for this portfolio.",
  },
  {
    key: "about2",
    title: "About 02",
    description: "Second supporting portfolio image.",
  },
];

const EMPTY_IMAGES = {
  artist: [],
  corporate: [],
};

function AdminPortfolio() {
  const [activeTab, setActiveTab] = useState("artist");

  const [images, setImages] = useState(EMPTY_IMAGES);

  const [loadedSections, setLoadedSections] = useState({});

  const [loading, setLoading] = useState(true);

  const [uploadingSlot, setUploadingSlot] = useState(null);

  const [deletingSlot, setDeletingSlot] = useState(null);

  const [notice, setNotice] = useState(null);

  const showNotice = useCallback((type, message) => {
    setNotice({
      type,
      message,
    });
  }, []);

  const loadSection = useCallback(
    async (section, force = false) => {
      if (!force && loadedSections[section]) {
        return;
      }

      try {
        setLoading(true);

        const result = await apiRequest(`/api/portfolio/${section}`);

        const sectionImages = Array.isArray(result?.images)
          ? result.images
          : [];

        setImages((current) => ({
          ...current,
          [section]: sectionImages,
        }));

        setLoadedSections((current) => ({
          ...current,
          [section]: true,
        }));
      } catch (error) {
        showNotice(
          "error",
          error?.message || `Failed to load ${section} portfolio images.`,
        );
      } finally {
        setLoading(false);
      }
    },
    [loadedSections, showNotice],
  );

  useEffect(() => {
    loadSection(activeTab);
  }, [activeTab, loadSection]);

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setNotice(null);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [notice]);

  const currentImages = images[activeTab] || [];

  const getImageForSlot = useCallback(
    (slot) => currentImages.find((image) => image?.slot === slot),
    [currentImages],
  );

  const handleTabChange = (section) => {
    if (section === activeTab) {
      return;
    }

    setActiveTab(section);
    setNotice(null);
  };

  const uploadImage = async (slot, file) => {
    if (!file || uploadingSlot) {
      return;
    }

    const formData = new FormData();

    formData.append("image", file);

    setUploadingSlot(slot);

    try {
      const result = await apiRequest(`/api/portfolio/${activeTab}/${slot}`, {
        method: "POST",
        body: formData,
      });

      showNotice(
        "success",
        result?.message || "Portfolio image uploaded successfully.",
      );

      await loadSection(activeTab, true);
    } catch (error) {
      showNotice(
        "error",
        error?.message || "Failed to upload portfolio image.",
      );

      throw error;
    } finally {
      setUploadingSlot(null);
    }
  };

  const deleteImage = async (slot) => {
    if (deletingSlot || uploadingSlot) {
      return;
    }

    const confirmed = window.confirm("Delete this portfolio image?");

    if (!confirmed) {
      return;
    }

    setDeletingSlot(slot);

    try {
      const result = await apiRequest(`/api/portfolio/${activeTab}/${slot}`, {
        method: "DELETE",
      });

      showNotice(
        "success",
        result?.message || "Portfolio image deleted successfully.",
      );

      await loadSection(activeTab, true);
    } catch (error) {
      showNotice(
        "error",
        error?.message || "Failed to delete portfolio image.",
      );

      throw error;
    } finally {
      setDeletingSlot(null);
    }
  };

  return (
    <AdminLayout>
      <AdminNotice notice={notice} onClose={() => setNotice(null)} />

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <header className="mb-10">
          <p className="text-[9px] uppercase tracking-[0.4em] text-[#C9974B]">
            Content
          </p>

          <h1 className="mt-4 font-display text-[clamp(2.8rem,6vw,5.5rem)] leading-none tracking-[-0.055em]">
            Portfolio
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-white/35">
            Manage the fixed portfolio images for Artist and Corporate.
          </p>
        </header>

        <div className="mb-10 flex border-b border-white/[0.08]">
          {TABS.map((tab) => {
            const active = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabChange(tab.key)}
                className={[
                  "relative px-5 py-4 text-[10px] uppercase tracking-[0.25em]",
                  "transition-colors duration-200",
                  "sm:px-8",
                  active
                    ? "text-[#F4D58D]"
                    : "text-white/30 hover:text-white/70",
                ].join(" ")}
              >
                {tab.label}

                <span
                  className={[
                    "absolute bottom-0 left-0 h-px w-full",
                    active ? "bg-[#C9974B]" : "bg-transparent",
                  ].join(" ")}
                />
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="grid gap-5">
            {SLOTS.map((slot) => (
              <div
                key={slot.key}
                className="h-[360px] animate-pulse border border-white/[0.05] bg-white/[0.015]"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-5">
            {SLOTS.map((slot) => {
              const image = getImageForSlot(slot.key);

              const imageUrl = image?.url
                ? getOptimizedImageUrl(image.url, 900)
                : "";

              return (
                <ImageUploader
                  key={slot.key}
                  title={slot.title}
                  description={slot.description}
                  imageUrl={imageUrl}
                  onUpload={(file) => uploadImage(slot.key, file)}
                  onDelete={image ? () => deleteImage(slot.key) : undefined}
                />
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminPortfolio;
