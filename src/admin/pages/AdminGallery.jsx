import { useCallback, useEffect, useRef, useState } from "react";

import { motion } from "framer-motion";

import AdminLayout from "../components/AdminLayout";
import AdminNotice from "../components/AdminNotice";
import GalleryGrid from "../components/GalleryGrid";

import { apiRequest } from "../../config/api";

const TABS = [
  {
    key: "artist",
    label: "Artist",
  },
  {
    key: "corporate",
    label: "Corporate",
  },
  {
    key: "company-archives",
    label: "Company Archives",
  },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const MAX_FILES = 20;

const VALID_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

function UploadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-5 w-5"
    >
      <path d="M12 16V4" />
      <path d="M7 9l5-5 5 5" />
      <path d="M5 20h14" />
    </svg>
  );
}

function AdminGallery() {
  const inputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("artist");

  const [gallery, setGallery] = useState({
    artist: [],
    corporate: [],
    "company-archives": [],
  });

  const [selectedFiles, setSelectedFiles] = useState([]);

  const [previewUrls, setPreviewUrls] = useState([]);

  const [loading, setLoading] = useState(true);

  const [uploading, setUploading] = useState(false);

  const [reordering, setReordering] = useState(false);

  const [notice, setNotice] = useState(null);

  const noticeTimerRef = useRef(null);

  const showNotice = useCallback((type, message) => {
    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current);
    }

    setNotice({
      type,
      message,
    });

    noticeTimerRef.current = window.setTimeout(() => {
      setNotice(null);
    }, 4000);
  }, []);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) {
        window.clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  const loadSection = useCallback(async (section) => {
    const result = await apiRequest(`/api/gallery/${section}`);

    const images = Array.isArray(result?.images)
      ? result.images
      : Array.isArray(result?.gallery)
        ? result.gallery
        : [];

    setGallery((current) => ({
      ...current,
      [section]: images,
    }));

    return images;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadActiveSection = async () => {
      try {
        setLoading(true);

        const result = await apiRequest(`/api/gallery/${activeTab}`);

        if (cancelled) {
          return;
        }

        const images = Array.isArray(result?.images)
          ? result.images
          : Array.isArray(result?.gallery)
            ? result.gallery
            : [];

        setGallery((current) => ({
          ...current,
          [activeTab]: images,
        }));
      } catch (error) {
        if (!cancelled) {
          showNotice(
            "error",
            error?.message || "Failed to load gallery images.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadActiveSection();

    return () => {
      cancelled = true;
    };
  }, [activeTab, showNotice]);

  const clearSelection = useCallback(() => {
    setPreviewUrls((currentUrls) => {
      currentUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });

      return [];
    });

    setSelectedFiles([]);
  }, []);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [previewUrls]);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      return;
    }

    const limitedFiles = files.slice(0, MAX_FILES);

    if (files.length > MAX_FILES) {
      showNotice("error", `Only ${MAX_FILES} images can be uploaded at once.`);
    }

    const validFiles = limitedFiles.filter(
      (file) =>
        VALID_IMAGE_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE,
    );

    if (!validFiles.length) {
      showNotice(
        "error",
        "No valid images were selected. Use JPEG, PNG, WebP or AVIF files under 10 MB.",
      );

      event.target.value = "";

      return;
    }

    if (validFiles.length !== limitedFiles.length) {
      showNotice(
        "error",
        "Some files were skipped because they were invalid or larger than 10 MB.",
      );
    }

    previewUrls.forEach((url) => {
      URL.revokeObjectURL(url);
    });

    const nextPreviewUrls = validFiles.map((file) => URL.createObjectURL(file));

    setSelectedFiles(validFiles);

    setPreviewUrls(nextPreviewUrls);

    event.target.value = "";
  };

  const uploadImages = async () => {
    if (!selectedFiles.length || uploading) {
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();

      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      const result = await apiRequest(`/api/gallery/${activeTab}`, {
        method: "POST",
        body: formData,
      });

      showNotice(
        "success",
        result?.message ||
          `${selectedFiles.length} image${
            selectedFiles.length === 1 ? "" : "s"
          } uploaded successfully.`,
      );

      clearSelection();

      await loadSection(activeTab);
    } catch (error) {
      showNotice("error", error?.message || "Failed to upload gallery images.");
    } finally {
      setUploading(false);
    }
  };

  const reorderImages = async (reorderedImages) => {
    const previousGallery = gallery[activeTab] || [];

    setGallery((current) => ({
      ...current,
      [activeTab]: reorderedImages,
    }));

    setReordering(true);

    try {
      const imageIds = reorderedImages
        .map((image) => image?._id || image?.id)
        .filter(Boolean);

      await apiRequest(`/api/gallery/${activeTab}/reorder`, {
        method: "PATCH",
        body: JSON.stringify({
          imageIds,
        }),
      });

      showNotice("success", "Gallery order updated.");
    } catch (error) {
      setGallery((current) => ({
        ...current,
        [activeTab]: previousGallery,
      }));

      showNotice("error", error?.message || "Failed to save gallery order.");

      throw error;
    } finally {
      setReordering(false);
    }
  };

  const deleteImage = async (image) => {
    const id = image?._id || image?.id;

    if (!id) {
      throw new Error("Gallery image does not have a valid ID.");
    }

    try {
      const result = await apiRequest(`/api/gallery/${activeTab}/${id}`, {
        method: "DELETE",
      });

      showNotice(
        "success",
        result?.message || "Gallery image deleted successfully.",
      );

      await loadSection(activeTab);
    } catch (error) {
      showNotice("error", error?.message || "Failed to delete gallery image.");

      throw error;
    }
  };

  const currentGallery = gallery[activeTab] || [];

  const activeTabLabel =
    TABS.find((tab) => tab.key === activeTab)?.label || "Gallery";

  return (
    <AdminLayout>
      <AdminNotice notice={notice} onClose={() => setNotice(null)} />

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-8 sm:py-10 lg:px-12 lg:py-14"
      >
        {/* HEADER */}

        <header className="mb-7 sm:mb-10">
          <p className="text-[8px] uppercase tracking-[0.4em] text-[#C9974B] sm:text-[9px]">
            Content
          </p>

          <h1 className="mt-3 font-display text-[clamp(2.6rem,11vw,5.5rem)] leading-none tracking-[-0.055em]">
            Gallery
          </h1>

          <p className="mt-4 max-w-xl text-xs leading-5 text-white/35 sm:text-sm sm:leading-6">
            Upload and manage multiple gallery images for Artist, Corporate and
            Company Archives.
          </p>
        </header>

        {/* TABS */}

        <div className="mb-8 flex w-full border-b border-white/[0.08] sm:mb-10">
          {TABS.map((tab) => {
            const active = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  if (active) {
                    return;
                  }

                  clearSelection();

                  setActiveTab(tab.key);
                }}
                className={[
                  "relative flex-1 px-2 py-3.5 text-[8px] uppercase tracking-[0.12em] transition-colors duration-300 sm:flex-none sm:px-8 sm:py-4 sm:text-[10px] sm:tracking-[0.25em]",
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

        {/* UPLOAD SECTION */}

        <section className="mb-10 sm:mb-14">
          <div className="mb-4 flex flex-col gap-2 sm:mb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div>
              <h2 className="font-display text-2xl tracking-[-0.03em]">
                Add Images
              </h2>

              <p className="mt-1.5 text-[11px] text-white/30 sm:mt-2 sm:text-xs">
                Select multiple images at once.
              </p>
            </div>

            <span className="text-[8px] uppercase tracking-[0.2em] text-white/25 sm:text-[9px]">
              {selectedFiles.length} selected
            </span>
          </div>

          {selectedFiles.length > 0 ? (
            <div className="border border-white/[0.08] bg-white/[0.018] p-3 sm:p-5">
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5 xl:grid-cols-6">
                {previewUrls.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="aspect-square overflow-hidden bg-black"
                  >
                    <img
                      src={url}
                      alt={
                        selectedFiles[index]?.name || "Selected gallery image"
                      }
                      width={320}
                      height={320}
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:mt-6 sm:flex sm:flex-wrap sm:gap-3">
                <button
                  type="button"
                  onClick={uploadImages}
                  disabled={uploading}
                  className="flex min-h-11 w-full items-center justify-center border border-[#C9974B]/50 bg-[#C9974B]/10 px-5 py-3 text-[9px] uppercase tracking-[0.22em] text-[#F4D58D] transition-colors hover:bg-[#C9974B]/20 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-6"
                >
                  {uploading
                    ? "Uploading..."
                    : `Upload ${selectedFiles.length} image${
                        selectedFiles.length === 1 ? "" : "s"
                      }`}
                </button>

                <button
                  type="button"
                  onClick={clearSelection}
                  disabled={uploading}
                  className="min-h-11 w-full border border-white/10 px-5 py-3 text-[9px] uppercase tracking-[0.22em] text-white/40 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-6"
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading}
                  className="min-h-11 w-full border border-white/10 px-5 py-3 text-[9px] uppercase tracking-[0.22em] text-white/40 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-6"
                >
                  Choose Again
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex min-h-[230px] w-full flex-col items-center justify-center border border-dashed border-white/10 bg-white/[0.012] px-5 text-center transition-colors hover:border-[#C9974B]/35 hover:bg-[#C9974B]/[0.025] active:bg-[#C9974B]/[0.04] disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-[260px]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-white/40 sm:h-14 sm:w-14">
                <UploadIcon />
              </span>

              <span className="mt-4 text-[9px] uppercase tracking-[0.22em] text-white/55 sm:mt-5 sm:text-[10px] sm:tracking-[0.25em]">
                Select Gallery Images
              </span>

              <span className="mt-2 max-w-md text-[11px] leading-5 text-white/25 sm:px-5 sm:text-xs">
                You can select multiple images at the same time. JPEG, PNG, WebP
                and AVIF up to 10 MB each.
              </span>
            </button>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
        </section>

        {/* GALLERY */}

        <section
          style={{
            contentVisibility: "auto",
            containIntrinsicSize: "800px",
          }}
        >
          <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-2xl tracking-[-0.03em]">
                {activeTabLabel} Gallery
              </h2>

              <p className="mt-1.5 text-[11px] text-white/30 sm:mt-2 sm:text-xs">
                {currentGallery.length} image
                {currentGallery.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-4">
              {currentGallery.length > 1 && (
                <span className="text-[8px] uppercase tracking-[0.16em] text-white/25 sm:text-[9px] sm:tracking-[0.2em]">
                  Hold & drag to reorder
                </span>
              )}

              {reordering && (
                <span className="text-[8px] uppercase tracking-[0.16em] text-[#C9974B] sm:text-[9px] sm:tracking-[0.2em]">
                  Saving order...
                </span>
              )}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({
                length: 6,
              }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-square animate-pulse bg-white/[0.025]"
                />
              ))}
            </div>
          ) : (
            <GalleryGrid
              images={currentGallery}
              onDelete={deleteImage}
              onReorder={reorderImages}
            />
          )}
        </section>
      </motion.div>
    </AdminLayout>
  );
}

export default AdminGallery;
