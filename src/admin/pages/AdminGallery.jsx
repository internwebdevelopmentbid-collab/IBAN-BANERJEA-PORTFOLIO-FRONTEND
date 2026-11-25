import { useCallback, useEffect, useRef, useState } from "react";

import { motion } from "framer-motion";

import AdminLayout from "../components/AdminLayout";
import AdminNotice from "../components/AdminNotice";
import GalleryGrid from "../components/GalleryGrid";

import { apiRequest } from "../../config/api";

const TABS = [
  { key: "artist", label: "Artist" },
  { key: "corporate", label: "Corporate" },
  { key: "company-archives", label: "Company Archives" },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 30;

const VALID_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

const inputClass =
  "w-full rounded-lg border border-white/10 bg-[#171717] px-4 py-3 text-sm text-white outline-none transition focus:border-[#c6a15b]";

const buttonClass =
  "min-h-10 rounded-lg px-4 py-2.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40";

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
  const noticeTimerRef = useRef(null);

  const [activeTab, setActiveTab] = useState("artist");

  const [gallery, setGallery] = useState({
    artist: [],
    corporate: [],
  });

  const [archiveSections, setArchiveSections] = useState([]);
  const [activeArchiveId, setActiveArchiveId] = useState("");

  const [newSectionName, setNewSectionName] = useState("");
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editingSectionName, setEditingSectionName] = useState("");

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [reordering, setReordering] = useState(false);

  const [notice, setNotice] = useState(null);

  const showNotice = useCallback((type, message) => {
    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current);
    }

    setNotice({ type, message });

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

  /* ------------------------------------------------------------------------ */
  /* LOAD ORIGINAL GALLERIES                                                   */
  /* ------------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------------ */
  /* LOAD COMPANY ARCHIVES                                                     */
  /* ------------------------------------------------------------------------ */

  const loadArchiveSections = useCallback(async () => {
    const result = await apiRequest("/api/company-archives/admin");

    const sections = Array.isArray(result?.sections) ? result.sections : [];

    setArchiveSections(sections);

    setActiveArchiveId((current) => {
      if (current && sections.some((section) => section._id === current)) {
        return current;
      }

      return sections[0]?._id || "";
    });

    return sections;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadActiveSection = async () => {
      try {
        setLoading(true);

        if (activeTab === "company-archives") {
          const result = await apiRequest("/api/company-archives/admin");

          if (cancelled) return;

          const sections = Array.isArray(result?.sections)
            ? result.sections
            : [];

          setArchiveSections(sections);

          setActiveArchiveId((current) => {
            if (
              current &&
              sections.some((section) => section._id === current)
            ) {
              return current;
            }

            return sections[0]?._id || "";
          });
        } else {
          const result = await apiRequest(`/api/gallery/${activeTab}`);

          if (cancelled) return;

          const images = Array.isArray(result?.images)
            ? result.images
            : Array.isArray(result?.gallery)
              ? result.gallery
              : [];

          setGallery((current) => ({
            ...current,
            [activeTab]: images,
          }));
        }
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

  /* ------------------------------------------------------------------------ */
  /* FILE SELECTION                                                            */
  /* ------------------------------------------------------------------------ */

  const clearSelection = useCallback(() => {
    setPreviewUrls((currentUrls) => {
      currentUrls.forEach((url) => URL.revokeObjectURL(url));
      return [];
    });

    setSelectedFiles([]);
  }, []);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

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

    previewUrls.forEach((url) => URL.revokeObjectURL(url));

    const nextPreviewUrls = validFiles.map((file) => URL.createObjectURL(file));

    setSelectedFiles(validFiles);
    setPreviewUrls(nextPreviewUrls);

    event.target.value = "";
  };

  /* ------------------------------------------------------------------------ */
  /* UPLOAD ORIGINAL GALLERY IMAGES                                            */
  /* ------------------------------------------------------------------------ */

  const uploadOriginalImages = async () => {
    if (!selectedFiles.length || uploading) return;

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
          `${selectedFiles.length} image${selectedFiles.length === 1 ? "" : "s"} uploaded successfully.`,
      );

      clearSelection();
      await loadSection(activeTab);
    } catch (error) {
      showNotice("error", error?.message || "Failed to upload gallery images.");
    } finally {
      setUploading(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* UPLOAD ARCHIVE IMAGES                                                     */
  /* ------------------------------------------------------------------------ */

  const uploadArchiveImages = async () => {
    if (!activeArchiveId || !selectedFiles.length || uploading) return;

    setUploading(true);

    try {
      const formData = new FormData();

      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      const result = await apiRequest(
        `/api/company-archives/sections/${activeArchiveId}/images`,
        {
          method: "POST",
          body: formData,
        },
      );

      showNotice(
        "success",
        result?.message ||
          `${selectedFiles.length} archive image${selectedFiles.length === 1 ? "" : "s"} uploaded successfully.`,
      );

      clearSelection();
      await loadArchiveSections();
    } catch (error) {
      showNotice("error", error?.message || "Failed to upload archive images.");
    } finally {
      setUploading(false);
    }
  };

  const uploadImages =
    activeTab === "company-archives"
      ? uploadArchiveImages
      : uploadOriginalImages;

  /* ------------------------------------------------------------------------ */
  /* REORDER ORIGINAL GALLERY IMAGES                                           */
  /* ------------------------------------------------------------------------ */

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
        body: JSON.stringify({ imageIds }),
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

  /* ------------------------------------------------------------------------ */
  /* REORDER ARCHIVE IMAGES                                                    */
  /* ------------------------------------------------------------------------ */

  const reorderArchiveImages = async (reorderedImages) => {
    const previousSections = [...archiveSections];

    const updatedSections = archiveSections.map((section) =>
      section._id === activeArchiveId
        ? { ...section, images: reorderedImages }
        : section,
    );

    setArchiveSections(updatedSections);
    setReordering(true);

    try {
      const imageIds = reorderedImages
        .map((image) => image?._id || image?.id)
        .filter(Boolean);

      await apiRequest(
        `/api/company-archives/sections/${activeArchiveId}/reorder`,
        {
          method: "PATCH",
          body: JSON.stringify({ imageIds }),
        },
      );

      showNotice("success", "Archive image order updated.");
    } catch (error) {
      setArchiveSections(previousSections);

      showNotice(
        "error",
        error?.message || "Failed to save archive image order.",
      );

      throw error;
    } finally {
      setReordering(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* DELETE ORIGINAL GALLERY IMAGE                                             */
  /* ------------------------------------------------------------------------ */

  const deleteOriginalImage = async (image) => {
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

  /* ------------------------------------------------------------------------ */
  /* DELETE ARCHIVE IMAGE                                                      */
  /* ------------------------------------------------------------------------ */

  const deleteArchiveImage = async (image) => {
    const id = image?._id || image?.id;

    if (!id || !activeArchiveId) {
      throw new Error("Archive image does not have a valid ID.");
    }

    try {
      const result = await apiRequest(
        `/api/company-archives/sections/${activeArchiveId}/images/${id}`,
        {
          method: "DELETE",
        },
      );

      showNotice(
        "success",
        result?.message || "Archive image deleted successfully.",
      );

      await loadArchiveSections();
    } catch (error) {
      showNotice("error", error?.message || "Failed to delete archive image.");

      throw error;
    }
  };

  /* ------------------------------------------------------------------------ */
  /* CREATE CUSTOM ARCHIVE SECTION                                             */
  /* ------------------------------------------------------------------------ */

  const createArchiveSection = async (event) => {
    event.preventDefault();

    const name = newSectionName.trim();

    if (!name) {
      showNotice("error", "Please enter a section name.");
      return;
    }

    try {
      const result = await apiRequest("/api/company-archives/sections", {
        method: "POST",
        body: JSON.stringify({ name }),
      });

      setNewSectionName("");

      await loadArchiveSections();

      if (result?.section?._id) {
        setActiveArchiveId(result.section._id);
      }

      showNotice("success", "Archive section created.");
    } catch (error) {
      showNotice(
        "error",
        error?.message || "Failed to create archive section.",
      );
    }
  };

  /* ------------------------------------------------------------------------ */
  /* RENAME CUSTOM ARCHIVE SECTION                                             */
  /* ------------------------------------------------------------------------ */

  const saveSectionName = async (sectionId) => {
    const name = editingSectionName.trim();

    if (!name) {
      showNotice("error", "Section name cannot be empty.");
      return;
    }

    try {
      await apiRequest(`/api/company-archives/sections/${sectionId}`, {
        method: "PUT",
        body: JSON.stringify({ name }),
      });

      setEditingSectionId(null);
      setEditingSectionName("");

      await loadArchiveSections();

      showNotice("success", "Archive section renamed.");
    } catch (error) {
      showNotice(
        "error",
        error?.message || "Failed to rename archive section.",
      );
    }
  };

  /* ------------------------------------------------------------------------ */
  /* DELETE CUSTOM ARCHIVE SECTION                                             */
  /* ------------------------------------------------------------------------ */

  const deleteArchiveSection = async (section) => {
    if (!section?.isCustom) {
      showNotice(
        "error",
        "Venture-linked archive sections cannot be deleted here. Manage them from Ventures.",
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete "${section.name}" and all its archive images? This cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      await apiRequest(`/api/company-archives/sections/${section._id}`, {
        method: "DELETE",
      });

      if (activeArchiveId === section._id) {
        setActiveArchiveId("");
      }

      await loadArchiveSections();

      showNotice("success", "Archive section deleted.");
    } catch (error) {
      showNotice(
        "error",
        error?.message || "Failed to delete archive section.",
      );
    }
  };

  /* ------------------------------------------------------------------------ */
  /* CURRENT DATA                                                              */
  /* ------------------------------------------------------------------------ */

  const currentGallery = gallery[activeTab] || [];

  const activeArchiveSection =
    archiveSections.find((section) => section._id === activeArchiveId) || null;

  const archiveImages = activeArchiveSection?.images || [];

  const activeTabLabel =
    TABS.find((tab) => tab.key === activeTab)?.label || "Gallery";

  const currentImages =
    activeTab === "company-archives" ? archiveImages : currentGallery;

  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                    */
  /* ------------------------------------------------------------------------ */

  return (
    <AdminLayout>
      <AdminNotice notice={notice} onClose={() => setNotice(null)} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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
            Upload and manage gallery images for Artist, Corporate and Company
            Archives.
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
                  if (active) return;

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

        {/* COMPANY ARCHIVE SECTION MANAGER */}

        {activeTab === "company-archives" && (
          <section className="mb-10 border-b border-white/[0.08] pb-9 sm:mb-14">
            <div className="mb-5">
              <h2 className="font-display text-2xl tracking-[-0.03em]">
                Archive Sections
              </h2>

              <p className="mt-1.5 text-[11px] leading-5 text-white/30 sm:text-xs">
                Venture sections are managed automatically. You can create,
                rename, reorder and delete custom sections here.
              </p>
            </div>

            <form
              onSubmit={createArchiveSection}
              className="mb-6 flex flex-col gap-2 sm:flex-row"
            >
              <input
                type="text"
                value={newSectionName}
                onChange={(event) => setNewSectionName(event.target.value)}
                placeholder="New custom section name"
                className={inputClass}
              />

              <button
                type="submit"
                className={`${buttonClass} shrink-0 bg-[#C9974B] px-6 text-black hover:bg-[#d6b574]`}
              >
                Create Section
              </button>
            </form>

            {archiveSections.length === 0 ? (
              <div className="border border-white/10 bg-white/[0.015] p-6 text-center text-xs text-white/35">
                No archive sections available. Add a venture with Company
                Archives enabled or create a custom section.
              </div>
            ) : (
              <div className="space-y-3">
                <label
                  htmlFor="archive-manager-select"
                  className="block text-[9px] uppercase tracking-[0.25em] text-white/35"
                >
                  Select Archive Section
                </label>

                <select
                  id="archive-manager-select"
                  value={activeArchiveId}
                  onChange={(event) => {
                    clearSelection();
                    setActiveArchiveId(event.target.value);
                  }}
                  className={inputClass}
                >
                  {archiveSections.map((section, index) => (
                    <option
                      key={section._id}
                      value={section._id}
                      className="bg-[#171717]"
                    >
                      {index + 1}. {section.name}
                    </option>
                  ))}
                </select>

                {activeArchiveSection && (
                  <div className="flex flex-wrap items-center gap-3 border border-[#C9974B]/30 bg-[#C9974B]/[0.04] p-4">
                    {activeArchiveSection.logo && (
                      <div className="flex h-10 w-14 shrink-0 items-center justify-center">
                        <img
                          src={activeArchiveSection.logo}
                          alt={`${activeArchiveSection.name} logo`}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      {editingSectionId === activeArchiveSection._id ? (
                        <div className="flex flex-wrap gap-2">
                          <input
                            type="text"
                            value={editingSectionName}
                            onChange={(event) =>
                              setEditingSectionName(event.target.value)
                            }
                            className={`${inputClass} min-w-[160px] flex-1`}
                          />

                          <button
                            type="button"
                            onClick={() =>
                              saveSectionName(activeArchiveSection._id)
                            }
                            className={`${buttonClass} bg-[#C9974B] text-black`}
                          >
                            Save
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingSectionId(null);
                              setEditingSectionName("");
                            }}
                            className={`${buttonClass} border border-white/10 text-white/60`}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className="truncate text-sm font-medium text-white">
                            {activeArchiveSection.name}
                          </p>

                          <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/30">
                            {(activeArchiveSection.images || []).length} images
                          </p>
                        </>
                      )}
                    </div>

                    {activeArchiveSection.isCustom &&
                      editingSectionId !== activeArchiveSection._id && (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSectionId(activeArchiveSection._id);
                              setEditingSectionName(
                                activeArchiveSection.name || "",
                              );
                            }}
                            className={`${buttonClass} border border-white/10 text-white/65 hover:bg-white/5`}
                          >
                            Rename
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteArchiveSection(activeArchiveSection)
                            }
                            className={`${buttonClass} border border-red-500/30 text-red-300 hover:bg-red-500/10`}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* UPLOAD SECTION */}

        <section className="mb-10 sm:mb-14">
          <div className="mb-4 flex flex-col gap-2 sm:mb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div>
              <h2 className="font-display text-2xl tracking-[-0.03em]">
                {activeTab === "company-archives"
                  ? `Add Images${activeArchiveSection ? ` — ${activeArchiveSection.name}` : ""}`
                  : "Add Images"}
              </h2>

              <p className="mt-1.5 text-[11px] text-white/30 sm:mt-2 sm:text-xs">
                Select multiple images at once.
              </p>
            </div>

            <span className="text-[8px] uppercase tracking-[0.2em] text-white/25 sm:text-[9px]">
              {selectedFiles.length} selected
            </span>
          </div>

          {activeTab === "company-archives" && (
            <div className="mb-5">
              <label
                htmlFor="archive-section-select"
                className="mb-2 block text-[9px] uppercase tracking-[0.25em] text-white/35"
              >
                Upload images to section
              </label>
            </div>
          )}

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
                  disabled={
                    uploading ||
                    (activeTab === "company-archives" && !activeArchiveId)
                  }
                  className="flex min-h-11 w-full items-center justify-center border border-[#C9974B]/50 bg-[#C9974B]/10 px-5 py-3 text-[9px] uppercase tracking-[0.22em] text-[#F4D58D] transition-colors hover:bg-[#C9974B]/20 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-6"
                >
                  {uploading
                    ? "Uploading..."
                    : `Upload ${selectedFiles.length} image${selectedFiles.length === 1 ? "" : "s"}`}
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
              disabled={
                uploading ||
                (activeTab === "company-archives" && !activeArchiveId)
              }
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
                {activeTab === "company-archives"
                  ? `${activeArchiveSection?.name || "Company Archives"} Gallery`
                  : `${activeTabLabel} Gallery`}
              </h2>

              <p className="mt-1.5 text-[11px] text-white/30 sm:mt-2 sm:text-xs">
                {currentImages.length} image
                {currentImages.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-4">
              {currentImages.length > 1 && (
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
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-square animate-pulse bg-white/[0.025]"
                />
              ))}
            </div>
          ) : activeTab === "company-archives" && !activeArchiveSection ? (
            <div className="border border-white/10 bg-white/[0.015] p-8 text-center text-sm text-white/35">
              Create or select an archive section to manage its images.
            </div>
          ) : (
            <GalleryGrid
              images={currentImages}
              onDelete={
                activeTab === "company-archives"
                  ? deleteArchiveImage
                  : deleteOriginalImage
              }
              onReorder={
                activeTab === "company-archives"
                  ? reorderArchiveImages
                  : reorderImages
              }
            />
          )}
        </section>
      </motion.div>
    </AdminLayout>
  );
}

export default AdminGallery;
