import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getOptimizedImageUrl } from "../../config/api";

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
      <path d="M7 7l1 13h8l-1-13" />
    </svg>
  );
}

function DragIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-4 w-4"
    >
      <path d="M8 5h.01" />
      <path d="M8 12h.01" />
      <path d="M8 19h.01" />
      <path d="M16 5h.01" />
      <path d="M16 12h.01" />
      <path d="M16 19h.01" />
    </svg>
  );
}

function GalleryGrid({ images, onDelete, onReorder }) {
  const [localImages, setLocalImages] = useState(images || []);

  const [draggedId, setDraggedId] = useState(null);

  const [dragOverId, setDragOverId] = useState(null);

  const [dragging, setDragging] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const dragStateRef = useRef({
    pointerId: null,
    pointerType: null,
    sourceId: null,
    currentId: null,
    started: false,
    timer: null,
    startX: 0,
    startY: 0,
    rafId: null,
    pendingX: 0,
    pendingY: 0,
    targetElement: null,
  });

  const cardsRef = useRef(new Map());

  useEffect(() => {
    setLocalImages(images || []);
  }, [images]);

  useEffect(() => {
    return () => {
      const state = dragStateRef.current;

      if (state.timer) {
        window.clearTimeout(state.timer);
      }

      if (state.rafId) {
        window.cancelAnimationFrame(state.rafId);
      }
    };
  }, []);

  const getId = useCallback(
    (image, index = 0) => image?._id || image?.id || `gallery-${index}`,
    [],
  );

  const imageSizes = useMemo(
    () =>
      "(max-width: 640px) 46vw, (max-width: 1024px) 30vw, (max-width: 1280px) 23vw, 20vw",
    [],
  );

  const getImageSources = useCallback((image) => {
    const source = image?.imageUrl || image?.image || image?.url || "";

    if (!source) {
      return null;
    }

    const src240 = getOptimizedImageUrl(source, 240);

    const src320 = getOptimizedImageUrl(source, 320);

    const src480 = getOptimizedImageUrl(source, 480);

    const src800 = getOptimizedImageUrl(source, 800);

    return {
      src: src480,
      srcSet: [
        `${src240} 240w`,
        `${src320} 320w`,
        `${src480} 480w`,
        `${src800} 800w`,
      ].join(","),
    };
  }, []);

  const clearDragState = useCallback(() => {
    const state = dragStateRef.current;

    if (state.timer) {
      window.clearTimeout(state.timer);
    }

    if (state.rafId) {
      window.cancelAnimationFrame(state.rafId);
    }

    state.pointerId = null;
    state.pointerType = null;
    state.sourceId = null;
    state.currentId = null;
    state.started = false;
    state.timer = null;
    state.rafId = null;
    state.pendingX = 0;
    state.pendingY = 0;
    state.targetElement = null;

    setDraggedId(null);
    setDragOverId(null);
    setDragging(false);
  }, []);

  const getCardFromPoint = useCallback((x, y) => {
    const element = document.elementFromPoint(x, y);

    if (!element) {
      return null;
    }

    const card = element.closest("[data-gallery-card]");

    if (!card) {
      return null;
    }

    return card.getAttribute("data-gallery-card");
  }, []);

  const reorderImagesLocally = useCallback(
    (sourceId, targetId) => {
      if (!sourceId || !targetId || sourceId === targetId) {
        return;
      }

      setLocalImages((current) => {
        const sourceIndex = current.findIndex(
          (image, index) => getId(image, index) === sourceId,
        );

        const targetIndex = current.findIndex(
          (image, index) => getId(image, index) === targetId,
        );

        if (
          sourceIndex === -1 ||
          targetIndex === -1 ||
          sourceIndex === targetIndex
        ) {
          return current;
        }

        const next = [...current];

        const [movedImage] = next.splice(sourceIndex, 1);

        next.splice(targetIndex, 0, movedImage);

        return next;
      });
    },
    [getId],
  );

  const processPointerMove = useCallback(() => {
    const state = dragStateRef.current;

    state.rafId = null;

    if (!state.started || !state.sourceId) {
      return;
    }

    const targetId = getCardFromPoint(state.pendingX, state.pendingY);

    if (
      !targetId ||
      targetId === state.sourceId ||
      targetId === state.currentId
    ) {
      return;
    }

    state.currentId = targetId;

    setDragOverId(targetId);

    reorderImagesLocally(state.sourceId, targetId);
  }, [getCardFromPoint, reorderImagesLocally]);

  const schedulePointerMove = useCallback(
    (x, y) => {
      const state = dragStateRef.current;

      state.pendingX = x;
      state.pendingY = y;

      if (state.rafId) {
        return;
      }

      state.rafId = window.requestAnimationFrame(processPointerMove);
    },
    [processPointerMove],
  );

  const finishDrag = useCallback(
    async (cancelled = false) => {
      const state = dragStateRef.current;

      if (state.timer) {
        window.clearTimeout(state.timer);
      }

      if (state.rafId) {
        window.cancelAnimationFrame(state.rafId);
      }

      const wasDragging = state.started;

      const finalImages = [...localImages];

      const sourceId = state.sourceId;

      clearDragState();

      if (!wasDragging || !sourceId) {
        return;
      }

      if (cancelled) {
        setLocalImages(images || []);

        return;
      }

      const originalIds = (images || []).map((image, index) =>
        getId(image, index),
      );

      const finalIds = finalImages.map((image, index) => getId(image, index));

      const changed =
        originalIds.length !== finalIds.length ||
        originalIds.some((id, index) => id !== finalIds[index]);

      if (!changed) {
        return;
      }

      try {
        await onReorder(finalImages);
      } catch {
        setLocalImages(images || []);
      }
    },
    [clearDragState, getId, images, localImages, onReorder],
  );

  const handlePointerDown = useCallback(
    (event, image, index) => {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      if (deletingId) {
        return;
      }

      const target = event.target;

      if (target.closest("button")) {
        return;
      }

      const sourceId = getId(image, index);

      const state = dragStateRef.current;

      if (state.pointerId) {
        return;
      }

      state.pointerId = event.pointerId;

      state.pointerType = event.pointerType;

      state.sourceId = sourceId;

      state.currentId = sourceId;

      state.startX = event.clientX;

      state.startY = event.clientY;

      state.started = false;

      if (event.pointerType === "mouse") {
        state.started = true;

        setDraggedId(sourceId);

        setDragOverId(sourceId);

        setDragging(true);

        event.currentTarget.setPointerCapture?.(event.pointerId);

        return;
      }

      state.timer = window.setTimeout(() => {
        const currentState = dragStateRef.current;

        if (currentState.pointerId !== event.pointerId) {
          return;
        }

        currentState.started = true;

        setDraggedId(sourceId);

        setDragOverId(sourceId);

        setDragging(true);

        event.currentTarget.setPointerCapture?.(event.pointerId);
      }, 280);
    },
    [deletingId, getId],
  );

  const handlePointerMove = useCallback(
    (event) => {
      const state = dragStateRef.current;

      if (state.pointerId !== event.pointerId) {
        return;
      }

      const deltaX = event.clientX - state.startX;

      const deltaY = event.clientY - state.startY;

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (!state.started && distance > 10) {
        if (state.timer) {
          window.clearTimeout(state.timer);
        }

        /*
         * Movement before the
         * long press means the
         * user is scrolling.
         */
        state.pointerId = null;
        state.pointerType = null;
        state.sourceId = null;
        state.currentId = null;
        state.timer = null;

        return;
      }

      if (!state.started) {
        return;
      }

      event.preventDefault();

      schedulePointerMove(event.clientX, event.clientY);
    },
    [schedulePointerMove],
  );

  const handlePointerUp = useCallback(
    async (event) => {
      const state = dragStateRef.current;

      if (state.pointerId !== event.pointerId) {
        return;
      }

      if (state.started) {
        event.preventDefault();

        await finishDrag(false);
      } else {
        clearDragState();
      }
    },
    [clearDragState, finishDrag],
  );

  const handlePointerCancel = useCallback(
    async (event) => {
      const state = dragStateRef.current;

      if (state.pointerId !== event.pointerId) {
        return;
      }

      await finishDrag(true);
    },
    [finishDrag],
  );

  const handleDelete = async (image) => {
    if (dragging) {
      return;
    }

    const confirmed = window.confirm("Delete this gallery image?");

    if (!confirmed) {
      return;
    }

    const id = image?._id || image?.id;

    setDeletingId(id);

    try {
      await onDelete(image);
    } finally {
      setDeletingId(null);
    }
  };

  if (!localImages.length) {
    return (
      <div className="border border-dashed border-white/10 px-5 py-16 text-center sm:px-6 sm:py-20">
        <p className="text-[9px] uppercase tracking-[0.25em] text-white/25 sm:text-[10px]">
          No gallery images yet
        </p>

        <p className="mt-2 text-xs text-white/15">
          Upload images above to build this gallery.
        </p>
      </div>
    );
  }

  return (
    <div
      className={[
        "grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5",
        dragging ? "select-none" : "",
      ].join(" ")}
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: "600px",
      }}
    >
      {localImages.map((image, index) => {
        const id = getId(image, index);

        const sources = getImageSources(image);

        const isDragging = dragging && draggedId === id;

        const isDragOver = dragging && dragOverId === id && draggedId !== id;

        const isFirst = index === 0;

        return (
          <div
            key={id}
            ref={(node) => {
              if (node) {
                cardsRef.current.set(id, node);
              } else {
                cardsRef.current.delete(id);
              }
            }}
            data-gallery-card={id}
            onPointerDown={(event) => handlePointerDown(event, image, index)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            className={[
              "group relative aspect-square overflow-hidden border bg-white/[0.015] transition-[transform,opacity,border-color,box-shadow] duration-200",
              isDragging
                ? "z-30 scale-[1.025] border-[#C9974B] opacity-80 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                : "border-white/[0.06]",
              isDragOver ? "border-[#F4D58D] ring-2 ring-[#C9974B]/40" : "",
            ].join(" ")}
            style={{
              touchAction: dragging ? "none" : "pan-y",
            }}
          >
            {sources ? (
              <img
                src={sources.src}
                srcSet={sources.srcSet}
                sizes={imageSizes}
                alt={image?.title || `Gallery image ${index + 1}`}
                width={800}
                height={800}
                draggable={false}
                loading={isFirst ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={isFirst ? "high" : "auto"}
                className="pointer-events-none h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-3 text-center text-[8px] uppercase tracking-[0.15em] text-white/20">
                No image
              </div>
            )}

            {/* Position */}

            <div className="pointer-events-none absolute right-2 top-2 bg-black/70 px-1.5 py-1 text-[7px] text-white/55 backdrop-blur-md sm:right-3 sm:top-3 sm:px-2 sm:text-[8px]">
              {String(index + 1).padStart(2, "0")}
            </div>

            {/* Desktop drag indicator */}

            <div className="pointer-events-none absolute left-2 top-2 hidden items-center gap-2 border border-white/10 bg-black/60 px-2.5 py-2 text-white/60 backdrop-blur-md sm:left-3 sm:top-3 sm:flex sm:opacity-0 sm:transition-opacity sm:duration-300 sm:group-hover:opacity-100">
              <DragIcon />

              <span className="text-[8px] uppercase tracking-[0.2em]">
                Drag
              </span>
            </div>

            {/* Mobile/tablet drag hint */}

            <div className="pointer-events-none absolute left-2 top-2 flex items-center gap-1.5 bg-black/55 px-2 py-1.5 text-white/45 backdrop-blur-md sm:hidden">
              <DragIcon />

              <span className="text-[7px] uppercase tracking-[0.15em]">
                Hold & drag
              </span>
            </div>

            {/* Mobile/tablet controls */}

            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/95 via-black/55 to-transparent px-2 pb-2 pt-10 sm:hidden">
              <span className="text-[7px] uppercase tracking-[0.15em] text-white/35">
                {isDragging ? "Move" : "Gallery"}
              </span>

              <button
                type="button"
                onPointerDown={(event) => {
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  event.stopPropagation();

                  handleDelete(image);
                }}
                disabled={deletingId === id || dragging}
                className="flex min-h-8 items-center gap-1.5 border border-white/10 bg-black/70 px-2.5 text-[7px] uppercase tracking-[0.15em] text-white/65 backdrop-blur-md transition-colors active:border-red-400/30 active:text-red-300 disabled:opacity-40"
              >
                <TrashIcon />

                {deletingId === id ? "Deleting" : "Delete"}
              </button>
            </div>

            {/* Desktop delete */}

            <div className="absolute inset-x-0 bottom-0 hidden justify-end bg-gradient-to-t from-black/90 to-transparent px-3 pb-3 pt-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:flex">
              <button
                type="button"
                onPointerDown={(event) => {
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  event.stopPropagation();

                  handleDelete(image);
                }}
                disabled={deletingId === id || dragging}
                className="flex items-center gap-2 border border-white/10 bg-black/60 px-3 py-2 text-[8px] uppercase tracking-[0.2em] text-white/60 backdrop-blur-md transition-colors hover:border-red-400/30 hover:text-red-300 disabled:opacity-40"
              >
                <TrashIcon />

                {deletingId === id ? "Deleting" : "Delete"}
              </button>
            </div>

            {/* Drag overlay */}

            {isDragging && (
              <div className="pointer-events-none absolute inset-0 border-2 border-[#C9974B]/80 bg-[#C9974B]/[0.06]" />
            )}

            {isDragOver && (
              <div className="pointer-events-none absolute inset-0 border-2 border-[#F4D58D]/70 bg-[#C9974B]/[0.08]" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default GalleryGrid;
