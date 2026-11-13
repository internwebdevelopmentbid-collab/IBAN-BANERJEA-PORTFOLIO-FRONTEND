import { useEffect, useRef, useState } from "react";

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

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-4 w-4"
    >
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="M7 7l1 13h8l1-13" />
    </svg>
  );
}

function ImageUploader({
  title,
  description,
  imageUrl,
  onUpload,
  onDelete,
  disabled = false,
}) {
  const inputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];

  const maxFileSize = 10 * 1024 * 1024;

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const openFilePicker = () => {
    if (disabled || uploading) {
      return;
    }

    inputRef.current?.click();
  };

  const handleSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    if (!validTypes.includes(file.type)) {
      setError("Invalid image type. Please select JPEG, PNG, WebP or AVIF.");

      event.target.value = "";
      return;
    }

    if (file.size > maxFileSize) {
      setError("Image must be 10 MB or smaller.");

      event.target.value = "";
      return;
    }

    // Remove previous preview URL.
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    // Create the new local preview.
    const objectUrl = URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(objectUrl);

    // Reset the input AFTER reading the file.
    // This allows selecting the same file again later.
    event.target.value = "";
  };

  const clearSelection = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl("");
    setError("");
  };

  const handleUpload = async () => {
    if (!selectedFile || uploading) {
      return;
    }

    setError("");
    setUploading(true);

    try {
      await onUpload(selectedFile);

      clearSelection();
    } catch (error) {
      setError(error?.message || "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || uploading) {
      return;
    }

    const confirmed = window.confirm(`Delete ${title}?`);

    if (!confirmed) {
      return;
    }

    setError("");
    setUploading(true);

    try {
      await onDelete();
    } catch (error) {
      setError(error?.message || "Image deletion failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="overflow-hidden border border-white/[0.08] bg-white/[0.018]">
      {/* HEADER */}

      <div className="flex flex-col gap-3 border-b border-white/[0.07] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-medium text-white">{title}</h3>

          <p className="mt-1 text-xs leading-5 text-white/35">{description}</p>
        </div>

        <span className="text-[9px] uppercase tracking-[0.25em] text-white/25">
          Single image
        </span>
      </div>

      {/* CONTENT */}

      <div className="p-5">
        {/* SELECTED IMAGE */}

        {previewUrl ? (
          <div>
            <div className="relative aspect-[16/10] overflow-hidden bg-black">
              <img
                src={previewUrl}
                alt={selectedFile?.name || title}
                className="h-full w-full object-contain"
              />
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-xs text-white/60">
                  {selectedFile?.name}
                </p>

                <p className="mt-1 text-[10px] text-white/25">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={uploading}
                onClick={handleUpload}
                className="border border-[#C9974B]/50 bg-[#C9974B]/10 px-5 py-3 text-[9px] uppercase tracking-[0.22em] text-[#F4D58D] transition-colors hover:bg-[#C9974B]/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>

              <button
                type="button"
                disabled={uploading}
                onClick={clearSelection}
                className="border border-white/10 px-5 py-3 text-[9px] uppercase tracking-[0.22em] text-white/45 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : imageUrl ? (
          /* EXISTING IMAGE */
          <div className="group relative aspect-[16/10] overflow-hidden bg-black">
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.025]"
            />

            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/90 to-transparent px-4 pb-4 pt-12">
              <button
                type="button"
                disabled={disabled || uploading}
                onClick={openFilePicker}
                className="border border-white/20 bg-black/40 px-4 py-2.5 text-[9px] uppercase tracking-[0.22em] text-white/70 backdrop-blur-md transition-colors hover:border-[#C9974B]/50 hover:text-[#F4D58D] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Replace
              </button>

              {onDelete && (
                <button
                  type="button"
                  disabled={disabled || uploading}
                  onClick={handleDelete}
                  className="flex items-center gap-2 border border-white/10 bg-black/40 px-3 py-2.5 text-[9px] uppercase tracking-[0.2em] text-white/45 backdrop-blur-md transition-colors hover:border-red-400/30 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <TrashIcon />
                  Delete
                </button>
              )}
            </div>
          </div>
        ) : (
          /* EMPTY STATE */
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={openFilePicker}
            className="flex min-h-[240px] w-full flex-col items-center justify-center border border-dashed border-white/10 bg-white/[0.012] text-center transition-colors hover:border-[#C9974B]/35 hover:bg-[#C9974B]/[0.025] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-white/40">
              <UploadIcon />
            </span>

            <span className="mt-5 text-[10px] uppercase tracking-[0.25em] text-white/55">
              Select Image
            </span>

            <span className="mt-2 text-xs text-white/25">
              JPEG, PNG, WebP or AVIF · Max 10 MB
            </span>
          </button>
        )}

        {/* ERROR */}

        {error && (
          <div className="mt-4 border border-red-400/20 bg-red-400/[0.04] px-4 py-3 text-xs leading-5 text-red-300">
            {error}
          </div>
        )}

        {/* FILE INPUT */}

        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.avif,image/jpeg,image/png,image/webp,image/avif"
          onChange={handleSelect}
          disabled={disabled || uploading}
          className="hidden"
        />
      </div>
    </div>
  );
}

export default ImageUploader;
