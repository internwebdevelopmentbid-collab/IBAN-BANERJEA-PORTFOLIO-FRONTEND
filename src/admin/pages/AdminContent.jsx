import { useEffect, useState } from "react";

import AdminLayout from "../components/AdminLayout";
import { apiRequest, getOptimizedImageUrl } from "../../config/api";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-[#171717] px-4 py-3 text-sm text-white outline-none transition focus:border-[#c6a15b]";

const buttonClass =
  "rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50";

const getErrorMessage = (error) =>
  error?.message || "Something went wrong. Please try again.";

const moveItem = (items, fromIndex, toIndex) => {
  const updated = [...items];
  const [movedItem] = updated.splice(fromIndex, 1);
  updated.splice(toIndex, 0, movedItem);
  return updated;
};

const getYouTubeId = (value) => {
  const input = value.trim();

  if (!input) return "";

  try {
    const url = new URL(input);

    if (url.hostname.includes("youtu.be")) {
      return url.pathname.slice(1);
    }

    if (
      url.hostname.includes("youtube.com") ||
      url.hostname.includes("youtube-nocookie.com")
    ) {
      if (url.pathname === "/watch") {
        return url.searchParams.get("v") || "";
      }

      const parts = url.pathname.split("/").filter(Boolean);

      if (["embed", "shorts", "live"].includes(parts[0])) {
        return parts[1] || "";
      }
    }
  } catch {
    return input;
  }

  return input;
};

function AdminContent() {
  const [activeTab, setActiveTab] = useState("ventures");

  const [ventures, setVentures] = useState([]);
  const [works, setWorks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [notice, setNotice] = useState({
    type: "",
    message: "",
  });

  const [ventureEditingId, setVentureEditingId] = useState(null);
  const [ventureName, setVentureName] = useState("");
  const [ventureLogo, setVentureLogo] = useState(null);
  const [venturePreview, setVenturePreview] = useState("");
  const [ventureUrl, setVentureUrl] = useState("");
  const [includeInArchives, setIncludeInArchives] = useState(true);

  const [workEditingId, setWorkEditingId] = useState(null);
  const [workTitle, setWorkTitle] = useState("");
  const [workVideo, setWorkVideo] = useState("");

  const [draggedVentureId, setDraggedVentureId] = useState(null);
  const [draggedWorkId, setDraggedWorkId] = useState(null);

  const showNotice = (message, type = "success") => {
    setNotice({ message, type });

    window.clearTimeout(showNotice.timeoutId);

    showNotice.timeoutId = window.setTimeout(() => {
      setNotice({ message: "", type: "" });
    }, 4000);
  };

  const loadContent = async () => {
    setLoading(true);

    try {
      const [ventureResponse, workResponse] = await Promise.all([
        apiRequest("/api/ventures/admin"),
        apiRequest("/api/works/admin"),
      ]);

      setVentures(ventureResponse.ventures || []);
      setWorks(workResponse.works || []);
    } catch (error) {
      showNotice(getErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  useEffect(() => {
    if (!ventureLogo) {
      setVenturePreview("");
      return undefined;
    }

    const previewUrl = URL.createObjectURL(ventureLogo);
    setVenturePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [ventureLogo]);

  const resetVentureForm = () => {
    setVentureEditingId(null);
    setVentureName("");
    setVentureLogo(null);
    setVentureUrl("");
    setIncludeInArchives(true);
  };

  const resetWorkForm = () => {
    setWorkEditingId(null);
    setWorkTitle("");
    setWorkVideo("");
  };

  const editVenture = (venture) => {
    setVentureEditingId(venture._id);
    setVentureName(venture.name || "");
    setVentureLogo(null);
    setVentureUrl(venture.url || "");
    setIncludeInArchives(venture.includeInArchives !== false);
    setActiveTab("ventures");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveVenture = async (event) => {
    event.preventDefault();

    if (!ventureName.trim()) {
      showNotice("Please enter a venture name.", "error");
      return;
    }

    if (!ventureEditingId && !ventureLogo) {
      showNotice("Please select a logo image.", "error");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();

      formData.append("name", ventureName.trim());
      formData.append("url", ventureUrl.trim());
      formData.append("includeInArchives", String(includeInArchives));

      if (ventureLogo) {
        formData.append("image", ventureLogo);
      }

      if (ventureEditingId) {
        await apiRequest(`/api/ventures/${ventureEditingId}`, {
          method: "PUT",
          body: formData,
        });

        showNotice("Venture updated successfully.");
      } else {
        formData.append("order", String(ventures.length));

        await apiRequest("/api/ventures", {
          method: "POST",
          body: formData,
        });

        showNotice("Venture created successfully.");
      }

      resetVentureForm();
      await loadContent();
    } catch (error) {
      showNotice(getErrorMessage(error), "error");
    } finally {
      setSaving(false);
    }
  };

  const removeVenture = async (ventureId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this venture?",
    );

    if (!confirmed) return;

    try {
      await apiRequest(`/api/ventures/${ventureId}`, {
        method: "DELETE",
      });

      setVentures((current) =>
        current.filter((item) => item._id !== ventureId),
      );

      showNotice("Venture deleted successfully.");
    } catch (error) {
      showNotice(getErrorMessage(error), "error");
    }
  };

  const persistVentureOrder = async (updatedVentures, previousVentures) => {
    setVentures(updatedVentures);

    try {
      await apiRequest("/api/ventures/reorder", {
        method: "PATCH",
        body: JSON.stringify({
          ventureIds: updatedVentures.map((item) => item._id),
        }),
      });

      showNotice("Venture order saved.");
    } catch (error) {
      setVentures(previousVentures);
      showNotice(getErrorMessage(error), "error");
    }
  };

  const handleVentureDrop = async (targetId) => {
    if (!draggedVentureId || draggedVentureId === targetId) {
      setDraggedVentureId(null);
      return;
    }

    const previousVentures = [...ventures];

    const fromIndex = ventures.findIndex(
      (item) => item._id === draggedVentureId,
    );

    const toIndex = ventures.findIndex((item) => item._id === targetId);

    if (fromIndex < 0 || toIndex < 0) {
      setDraggedVentureId(null);
      return;
    }

    const updated = moveItem(ventures, fromIndex, toIndex);

    setDraggedVentureId(null);
    await persistVentureOrder(updated, previousVentures);
  };

  const editWork = (work) => {
    setWorkEditingId(work._id);
    setWorkTitle(work.title || "");
    setWorkVideo(work.videoId || "");
    setActiveTab("works");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveWork = async (event) => {
    event.preventDefault();

    if (!workTitle.trim() || !workVideo.trim()) {
      showNotice("Please enter a title and YouTube video URL or ID.", "error");
      return;
    }

    const payload = {
      title: workTitle.trim(),
      videoId: getYouTubeId(workVideo),
    };

    setSaving(true);

    try {
      if (workEditingId) {
        await apiRequest(`/api/works/${workEditingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        showNotice("Embedded work updated successfully.");
      } else {
        await apiRequest("/api/works", {
          method: "POST",
          body: JSON.stringify({
            ...payload,
            order: works.length,
          }),
        });

        showNotice("Embedded work added successfully.");
      }

      resetWorkForm();
      await loadContent();
    } catch (error) {
      showNotice(getErrorMessage(error), "error");
    } finally {
      setSaving(false);
    }
  };

  const removeWork = async (workId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this embedded work?",
    );

    if (!confirmed) return;

    try {
      await apiRequest(`/api/works/${workId}`, {
        method: "DELETE",
      });

      setWorks((current) => current.filter((item) => item._id !== workId));

      showNotice("Embedded work deleted successfully.");
    } catch (error) {
      showNotice(getErrorMessage(error), "error");
    }
  };

  const persistWorkOrder = async (updatedWorks, previousWorks) => {
    setWorks(updatedWorks);

    try {
      await apiRequest("/api/works/reorder", {
        method: "PATCH",
        body: JSON.stringify({
          workIds: updatedWorks.map((item) => item._id),
        }),
      });

      showNotice("Embedded work order saved.");
    } catch (error) {
      setWorks(previousWorks);
      showNotice(getErrorMessage(error), "error");
    }
  };

  const handleWorkDrop = async (targetId) => {
    if (!draggedWorkId || draggedWorkId === targetId) {
      setDraggedWorkId(null);
      return;
    }

    const previousWorks = [...works];

    const fromIndex = works.findIndex((item) => item._id === draggedWorkId);
    const toIndex = works.findIndex((item) => item._id === targetId);

    if (fromIndex < 0 || toIndex < 0) {
      setDraggedWorkId(null);
      return;
    }

    const updated = moveItem(works, fromIndex, toIndex);

    setDraggedWorkId(null);
    await persistWorkOrder(updated, previousWorks);
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#0b0b0b] px-4 py-8 text-white sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[#c6a15b]">
              Portfolio Management
            </p>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Content
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
              Manage ventures and embedded works displayed on your portfolio.
              Drag items to change their display order.
            </p>
          </div>

          {notice.message && (
            <div
              className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
                notice.type === "error"
                  ? "border-red-500/30 bg-red-500/10 text-red-300"
                  : "border-green-500/30 bg-green-500/10 text-green-300"
              }`}
            >
              {notice.message}
            </div>
          )}

          <div className="mb-8 flex gap-2 border-b border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab("ventures")}
              className={`border-b-2 px-5 py-3 text-sm transition ${
                activeTab === "ventures"
                  ? "border-[#c6a15b] text-[#c6a15b]"
                  : "border-transparent text-white/50 hover:text-white"
              }`}
            >
              Ventures ({ventures.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("works")}
              className={`border-b-2 px-5 py-3 text-sm transition ${
                activeTab === "works"
                  ? "border-[#c6a15b] text-[#c6a15b]"
                  : "border-transparent text-white/50 hover:text-white"
              }`}
            >
              Embedded Works ({works.length})
            </button>
          </div>

          {loading ? (
            <div className="rounded-xl border border-white/10 bg-[#111] p-8 text-sm text-white/50">
              Loading content...
            </div>
          ) : (
            <>
              {activeTab === "ventures" && (
                <section>
                  <div className="mb-6">
                    <h2 className="text-xl font-medium">
                      {ventureEditingId ? "Edit Venture" : "Add Venture"}
                    </h2>

                    <p className="mt-1 text-sm text-white/45">
                      Add a venture name, upload its logo, and optionally add
                      its destination URL.
                    </p>
                  </div>

                  <form
                    onSubmit={saveVenture}
                    className="mb-10 rounded-xl border border-white/10 bg-[#111] p-5 sm:p-6"
                  >
                    <div className="grid gap-6 md:grid-cols-[180px_1fr]">
                      <div>
                        <label className="mb-3 block text-xs uppercase tracking-wider text-white/50">
                          Logo image
                        </label>

                        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/20 bg-[#171717] transition hover:border-[#c6a15b]">
                          {venturePreview ? (
                            <img
                              src={venturePreview}
                              alt="Selected venture logo"
                              className="h-full w-full object-contain p-4"
                            />
                          ) : ventureEditingId ? (
                            <div className="px-4 text-center text-xs leading-5 text-white/45">
                              Choose a new image to replace the current logo
                            </div>
                          ) : (
                            <div className="px-4 text-center">
                              <span className="mb-2 block text-2xl text-[#c6a15b]">
                                +
                              </span>
                              <span className="text-xs text-white/50">
                                Select logo
                              </span>
                            </div>
                          )}

                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            className="hidden"
                            onChange={(event) =>
                              setVentureLogo(event.target.files?.[0] || null)
                            }
                          />
                        </label>

                        <p className="mt-2 text-[11px] text-white/35">
                          JPEG, PNG, WebP or AVIF. Maximum 10 MB.
                        </p>
                      </div>

                      <div className="flex flex-col gap-5">
                        <div>
                          <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">
                            Venture name
                          </label>

                          <input
                            type="text"
                            value={ventureName}
                            onChange={(event) =>
                              setVentureName(event.target.value)
                            }
                            placeholder="Enter venture or company name"
                            className={inputClass}
                            required
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">
                            Destination URL
                          </label>

                          <input
                            type="url"
                            value={ventureUrl}
                            onChange={(event) =>
                              setVentureUrl(event.target.value)
                            }
                            placeholder="https://example.com"
                            className={inputClass}
                          />
                        </div>

                        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-[#171717] px-4 py-3">
                          <input
                            type="checkbox"
                            checked={includeInArchives}
                            onChange={(event) =>
                              setIncludeInArchives(event.target.checked)
                            }
                            className="h-4 w-4 accent-[#c6a15b]"
                          />

                          <span>
                            <span className="block text-sm text-white">
                              Include in Company Archives
                            </span>
                            <span className="mt-1 block text-xs text-white/40">
                              Automatically create or maintain an archive
                              section for this venture.
                            </span>
                          </span>
                        </label>

                        <div className="flex flex-wrap gap-3">
                          <button
                            type="submit"
                            disabled={saving}
                            className={`${buttonClass} bg-[#c6a15b] text-black hover:bg-[#d6b574]`}
                          >
                            {saving
                              ? "Saving..."
                              : ventureEditingId
                                ? "Update Venture"
                                : "Add Venture"}
                          </button>

                          {ventureEditingId && (
                            <button
                              type="button"
                              onClick={resetVentureForm}
                              className={`${buttonClass} border border-white/15 text-white/70 hover:bg-white/5`}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </form>

                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-medium">Existing Ventures</h2>

                    <p className="text-xs text-white/40">
                      Drag a row to reorder
                    </p>
                  </div>

                  {ventures.length === 0 ? (
                    <div className="rounded-xl border border-white/10 bg-[#111] p-8 text-center text-sm text-white/45">
                      No ventures have been added yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {ventures.map((venture, index) => (
                        <div
                          key={venture._id}
                          draggable
                          onDragStart={(event) => {
                            setDraggedVentureId(venture._id);
                            event.dataTransfer.effectAllowed = "move";
                          }}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={(event) => {
                            event.preventDefault();
                            handleVentureDrop(venture._id);
                          }}
                          onDragEnd={() => setDraggedVentureId(null)}
                          className={`flex flex-wrap items-center gap-4 rounded-xl border bg-[#111] p-4 transition ${
                            draggedVentureId === venture._id
                              ? "border-[#c6a15b] opacity-40"
                              : "border-white/10"
                          }`}
                        >
                          <div className="cursor-grab select-none text-lg text-white/30 active:cursor-grabbing">
                            ⠿
                          </div>

                          <span className="w-5 text-xs text-white/35">
                            {index + 1}
                          </span>

                          <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-lg bg-transparent p-2">
                            <img
                              src={getOptimizedImageUrl(venture.logo, 300)}
                              alt={`${venture.name || "Venture"} logo`}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-white">
                              {venture.name || "Unnamed venture"}
                            </p>

                            <p className="mt-1 truncate text-xs text-white/35">
                              {venture.url || "No destination URL"}
                            </p>

                            <p className="mt-2 text-xs">
                              {venture.includeInArchives === false ? (
                                <span className="text-white/35">
                                  Excluded from Company Archives
                                </span>
                              ) : (
                                <span className="text-[#c6a15b]">
                                  Included in Company Archives
                                </span>
                              )}
                            </p>

                            <p className="mt-1 text-xs text-white/35">
                              Order: {index + 1}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => editVenture(venture)}
                              className={`${buttonClass} border border-white/15 text-white/70 hover:bg-white/5`}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => removeVenture(venture._id)}
                              className={`${buttonClass} border border-red-500/30 text-red-300 hover:bg-red-500/10`}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {activeTab === "works" && (
                <section>
                  <div className="mb-6">
                    <h2 className="text-xl font-medium">
                      {workEditingId
                        ? "Edit Embedded Work"
                        : "Add Embedded Work"}
                    </h2>

                    <p className="mt-1 text-sm text-white/45">
                      Add a YouTube video using its URL or video ID.
                    </p>
                  </div>

                  <form
                    onSubmit={saveWork}
                    className="mb-10 rounded-xl border border-white/10 bg-[#111] p-5 sm:p-6"
                  >
                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">
                          Work title
                        </label>

                        <input
                          type="text"
                          value={workTitle}
                          onChange={(event) => setWorkTitle(event.target.value)}
                          placeholder="Enter work title"
                          className={inputClass}
                          required
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">
                          YouTube URL or video ID
                        </label>

                        <input
                          type="text"
                          value={workVideo}
                          onChange={(event) => setWorkVideo(event.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className={inputClass}
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="submit"
                        disabled={saving}
                        className={`${buttonClass} bg-[#c6a15b] text-black hover:bg-[#d6b574]`}
                      >
                        {saving
                          ? "Saving..."
                          : workEditingId
                            ? "Update Work"
                            : "Add Work"}
                      </button>

                      {workEditingId && (
                        <button
                          type="button"
                          onClick={resetWorkForm}
                          className={`${buttonClass} border border-white/15 text-white/70 hover:bg-white/5`}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>

                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-medium">
                      Existing Embedded Works
                    </h2>

                    <p className="text-xs text-white/40">
                      Drag a row to reorder
                    </p>
                  </div>

                  {works.length === 0 ? (
                    <div className="rounded-xl border border-white/10 bg-[#111] p-8 text-center text-sm text-white/45">
                      No embedded works have been added yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {works.map((work, index) => (
                        <div
                          key={work._id}
                          draggable
                          onDragStart={(event) => {
                            setDraggedWorkId(work._id);
                            event.dataTransfer.effectAllowed = "move";
                          }}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={(event) => {
                            event.preventDefault();
                            handleWorkDrop(work._id);
                          }}
                          onDragEnd={() => setDraggedWorkId(null)}
                          className={`flex flex-wrap items-center gap-4 rounded-xl border bg-[#111] p-4 transition ${
                            draggedWorkId === work._id
                              ? "border-[#c6a15b] opacity-40"
                              : "border-white/10"
                          }`}
                        >
                          <div className="cursor-grab select-none text-lg text-white/30 active:cursor-grabbing">
                            ⠿
                          </div>

                          <span className="w-5 text-xs text-white/35">
                            {index + 1}
                          </span>

                          <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-black">
                            <img
                              src={`https://img.youtube.com/vi/${encodeURIComponent(
                                work.videoId,
                              )}/mqdefault.jpg`}
                              alt={work.title || "YouTube video thumbnail"}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-white">
                              {work.title}
                            </p>

                            <p className="mt-1 truncate text-xs text-white/35">
                              {work.videoId}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => editWork(work)}
                              className={`${buttonClass} border border-white/15 text-white/70 hover:bg-white/5`}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => removeWork(work._id)}
                              className={`${buttonClass} border border-red-500/30 text-red-300 hover:bg-red-500/10`}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminContent;
