import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ExternalLink, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { apiRequest, getMediaUrl, getOptimizedImageUrl } from "../config/api";

/* -------------------------------------------------------------------------- */
/* PAGE TRANSITION                                                             */
/* -------------------------------------------------------------------------- */

const pageVariants = {
  initial: {
    opacity: 0,
    x: "-100%",
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: "100%",
  },
};

const pageTransition = {
  duration: 0.8,
  ease: [0.22, 1, 0.36, 1],
};

/* -------------------------------------------------------------------------- */
/* FALLBACK                                                                    */
/* -------------------------------------------------------------------------- */

const fallbackSections = [];

/* -------------------------------------------------------------------------- */
/* COMPANY ARCHIVES                                                            */
/* -------------------------------------------------------------------------- */

const CompanyArchives = () => {
  const [sections, setSections] = useState(fallbackSections);
  const [activeSectionId, setActiveSectionId] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [touchStartX, setTouchStartX] = useState(null);
  const [imageError, setImageError] = useState(false);
  const masonryGridRef = useRef(null);

  /* ------------------------------------------------------------------------ */
  /* FETCH ARCHIVE SECTIONS                                                    */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let mounted = true;

    const fetchArchives = async () => {
      try {
        const result = await apiRequest("/api/company-archives");

        const archiveSections = Array.isArray(result?.sections)
          ? result.sections
          : [];

        if (mounted) {
          setSections(archiveSections);

          setActiveSectionId((current) => {
            if (
              current &&
              archiveSections.some((section) => section._id === current)
            ) {
              return current;
            }

            return archiveSections[0]?._id || "";
          });
        }
      } catch (error) {
        console.error("Failed to load company archives:", error);

        if (mounted) {
          setSections(fallbackSections);
          setActiveSectionId("");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchArchives();

    return () => {
      mounted = false;
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* ACTIVE SECTION                                                            */
  /* ------------------------------------------------------------------------ */

  const activeSection = useMemo(() => {
    return sections.find((section) => section._id === activeSectionId) || null;
  }, [sections, activeSectionId]);

  /* ------------------------------------------------------------------------ */
  /* NORMALIZE IMAGES                                                          */
  /* ------------------------------------------------------------------------ */

  const galleryItems = useMemo(() => {
    const images = Array.isArray(activeSection?.images)
      ? activeSection.images
      : [];

    return images
      .map((item, index) => {
        const rawImageUrl =
          item?.imageUrl || item?.url || item?.image || item?.src || "";

        const imageUrl = getMediaUrl(rawImageUrl);

        return {
          ...item,
          id:
            item?._id ||
            item?.id ||
            item?.publicId ||
            `company-archives-${index}`,
          imageUrl,
        };
      })
      .filter((item) => item.imageUrl);
  }, [activeSection]);

  /* ------------------------------------------------------------------------ */
  /* ROW-FIRST MASONRY LAYOUT                                                  */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const grid = masonryGridRef.current;
    if (!grid) return;

    const rowHeight = 8;
    const rowGap = 16;

    const updateCardSpan = (image) => {
      const card = image.closest(".masonry-card");
      if (!card || !image.complete || !image.naturalWidth) return;

      const imageHeight = image.getBoundingClientRect().height;
      const cardExtraHeight = card.offsetHeight - image.offsetHeight;
      const totalHeight = imageHeight + cardExtraHeight;

      const rowSpan = Math.ceil((totalHeight + rowGap) / (rowHeight + rowGap));

      card.style.gridRowEnd = `span ${Math.max(1, rowSpan)}`;
    };

    const images = Array.from(grid.querySelectorAll(".masonry-image"));

    images.forEach((image) => updateCardSpan(image));

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver((entries) => {
            entries.forEach((entry) => updateCardSpan(entry.target));
          })
        : null;

    images.forEach((image) => {
      resizeObserver?.observe(image);
      image.addEventListener("load", () => updateCardSpan(image));
    });

    return () => {
      resizeObserver?.disconnect();
    };
  }, [galleryItems, loading]);

  /* ------------------------------------------------------------------------ */
  /* SECTION CHANGE                                                            */
  /* ------------------------------------------------------------------------ */

  const handleSectionChange = (event) => {
    setActiveSectionId(event.target.value);
    setSelectedIndex(null);
    setTouchStartX(null);
    setImageError(false);
  };

  /* ------------------------------------------------------------------------ */
  /* LIGHTBOX                                                                  */
  /* ------------------------------------------------------------------------ */

  const selectedArtwork =
    selectedIndex !== null ? galleryItems[selectedIndex] || null : null;

  const closeLightbox = () => {
    setSelectedIndex(null);
    setTouchStartX(null);
    setImageError(false);
  };

  const showPrevious = () => {
    if (galleryItems.length === 0) return;

    setImageError(false);

    setSelectedIndex((current) => {
      if (current === null) return 0;

      return (current - 1 + galleryItems.length) % galleryItems.length;
    });
  };

  const showNext = () => {
    if (galleryItems.length === 0) return;

    setImageError(false);

    setSelectedIndex((current) => {
      if (current === null) return 0;

      return (current + 1) % galleryItems.length;
    });
  };

  useEffect(() => {
    setImageError(false);
  }, [selectedIndex]);

  /* ------------------------------------------------------------------------ */
  /* KEYBOARD NAVIGATION                                                       */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeLightbox();
      }

      if (event.key === "ArrowLeft") {
        showPrevious();
      }

      if (event.key === "ArrowRight") {
        showNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedIndex, galleryItems.length]);

  /* ------------------------------------------------------------------------ */
  /* TOUCH SWIPE                                                               */
  /* ------------------------------------------------------------------------ */

  const handleTouchStart = (event) => {
    setTouchStartX(event.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (event) => {
    if (touchStartX === null) return;

    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;

    const distance = touchStartX - touchEndX;
    const minimumSwipeDistance = 50;

    if (Math.abs(distance) >= minimumSwipeDistance) {
      if (distance > 0) {
        showNext();
      } else {
        showPrevious();
      }
    }

    setTouchStartX(null);
  };

  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                    */
  /* ------------------------------------------------------------------------ */

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className="
        relative
        w-full
        bg-transparent
        text-white
      "
    >
      <div>
        {/* ================================================================ */}
        {/* INTRO                                                              */}
        {/* ================================================================ */}

        <section
          className="
            relative
            min-h-[43vh]
            px-6
            pt-24
          "
        >
          <div className="mx-auto max-w-7xl">
            <div>
              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.35em]
                  text-white/40
                "
              >
                Company Archives
              </p>

              <h1
                className="
                  mt-5
                  max-w-5xl
                  bg-gradient-to-r
                  from-[#F2D18A]
                  via-[#D9AA55]
                  to-[#8A5E24]
                  bg-clip-text
                  font-display
                  text-[clamp(2.4rem,6vw,6.9rem)]
                  font-medium
                  uppercase
                  leading-[0.9]
                  tracking-[-0.06em]
                  text-transparent
                "
              >
                Gallery
              </h1>

              <div
                className="
                  mt-7
                  h-px
                  w-20
                  bg-gradient-to-r
                  from-[#F2D18A]
                  via-[#C9974B]
                  to-[#7A5420]
                "
              />

              <p
                className="
                  mt-6
                  max-w-xl
                  font-sans
                  text-sm
                  leading-7
                  text-white/55
                  sm:text-base
                "
              >
                A collection of photographs documenting company milestones,
                people, events, workplaces, and moments from across the
                organization.
              </p>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* ARCHIVE FILTER AND COMPANY HEADER                                 */}
        {/* ================================================================ */}

        <section className="px-6 pb-12">
          <div className="mx-auto max-w-7xl">
            {loading ? (
              <div className="py-8 text-xs uppercase tracking-[0.3em] text-white/35">
                Loading archives
              </div>
            ) : sections.length > 0 ? (
              <div className="border-b border-white/10 pb-8">
                <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
                  <div className="w-full max-w-md">
                    <label
                      htmlFor="company-archive-filter"
                      className="
                        mb-3
                        block
                        text-[10px]
                        uppercase
                        tracking-[0.3em]
                        text-white/40
                      "
                    >
                      Select company
                    </label>

                    <div className="relative w-full min-w-0">
                      <select
                        id="company-archive-filter"
                        value={activeSectionId}
                        onChange={handleSectionChange}
                        className="
                        block
                        w-full
                        min-w-0
                        max-w-full
                        appearance-none
                        rounded-md
                        border
                        border-[#C9974B]/40
                        bg-[#111]
                        py-3
                        pl-3
                        pr-10
                        text-sm
                        text-white
                        outline-none
                        transition-all
                        duration-300
                        hover:border-[#C9974B]/70
                        focus:border-[#C9974B]
                        focus:ring-1
                        focus:ring-[#C9974B]/20
                        sm:px-5
                        sm:py-4
                        sm:pr-12
                        sm:text-base
                      "
                      >
                        {sections.map((section) => (
                          <option
                            key={section._id}
                            value={section._id}
                            className="bg-[#111] text-white"
                          >
                            {section.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {activeSection && (
                    <div className="flex flex-wrap items-center gap-5 sm:justify-end">
                      {activeSection.logo && (
                        <div className="flex h-16 w-24 items-center justify-center">
                          <img
                            src={getOptimizedImageUrl(
                              getMediaUrl(activeSection.logo),
                              300,
                            )}
                            alt={`${activeSection.name} logo`}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      )}

                      <div>
                        <p className="text-[9px] uppercase tracking-[0.3em] text-white/35">
                          Selected company
                        </p>

                        <h2 className="mt-2 font-display text-2xl tracking-tight text-white sm:text-3xl">
                          {activeSection.name}
                        </h2>

                        {activeSection.url && (
                          <a
                            href={activeSection.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="
                              mt-3
                              inline-flex
                              items-center
                              gap-2
                              border
                              border-[#C9974B]/50
                              rounded-md
                              px-4
                              py-2
                              text-[10px]
                              uppercase
                              tracking-[0.25em]
                              text-[#C9974B]
                              transition-colors
                              hover:border-[#F2D18A]
                              hover:text-[#F2D18A]
                            "
                          >
                            Visit Site
                            <ExternalLink size={12} strokeWidth={1.5} />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="border-y border-white/10 py-8">
                <p className="text-xs uppercase tracking-[0.3em] text-white/35">
                  No company archives available
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ================================================================ */}
        {/* MASONRY GALLERY                                                    */}
        {/* ================================================================ */}

        <section className="px-6">
          <div className="mx-auto max-w-7xl">
            {loading ? (
              <div className="flex min-h-[50vh] items-center justify-center">
                <p className="text-xs uppercase tracking-[0.3em] text-white/35">
                  Loading
                </p>
              </div>
            ) : galleryItems.length === 0 ? (
              <div className="flex min-h-[50vh] items-center justify-center">
                <p className="text-xs uppercase tracking-[0.3em] text-white/35">
                  No archive images available
                </p>
              </div>
            ) : (
              <div
                ref={masonryGridRef}
                className="
                  mx-auto
                  grid
                  w-full
                  max-w-6xl
                  grid-cols-1
                  items-start
                  gap-4
                  sm:grid-cols-2
                  lg:grid-cols-3
                "
                style={{ gridAutoRows: "8px" }}
              >
                {galleryItems.map((item, index) => {
                  const optimizedImageUrl = getOptimizedImageUrl(
                    item.imageUrl,
                    1200,
                  );

                  const priority = index < 3;

                  return (
                    <motion.button
                      key={item.id}
                      type="button"
                      className="
                        group
                        masonry-card
                        relative
                        block
                        w-full
                        overflow-hidden
                        rounded-[20px]
                        border
                        border-white/10
                        bg-white/[0.035]
                        text-left
                        shadow-[0_20px_70px_rgba(0,0,0,0.22)]
                        focus:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-[#D9AA55]/80
                      "
                      onClick={() => setSelectedIndex(index)}
                      initial={{
                        opacity: 0,
                        y: 20,
                      }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                      }}
                      viewport={{
                        once: true,
                        amount: 0.08,
                      }}
                      transition={{
                        duration: 0.5,
                        delay: Math.min(index * 0.025, 0.18),
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      whileHover={{
                        y: -3,
                      }}
                    >
                      <img
                        src={optimizedImageUrl}
                        sizes="
                          (max-width: 639px) 94vw,
                          (max-width: 1023px) 46vw,
                          31vw
                        "
                        alt={
                          item?.title ||
                          `${activeSection?.name || "Company"} archive image ${index + 1}`
                        }
                        width={1000}
                        height={1250}
                        loading={priority ? "eager" : "lazy"}
                        fetchPriority={priority ? "high" : "auto"}
                        decoding="async"
                        draggable={false}
                        className="
                          masonry-image
                          block
                          h-auto
                          w-full
                          object-cover
                          transition
                          duration-700
                          ease-out
                          group-hover:scale-[1.025]
                        "
                      />

                      <span
                        className="
                          pointer-events-none
                          absolute
                          inset-0
                          bg-gradient-to-t
                          from-black/35
                          via-transparent
                          to-transparent
                          opacity-0
                          transition-opacity
                          duration-500
                          group-hover:opacity-100
                        "
                      />

                      <span
                        className="
                          pointer-events-none
                          absolute
                          bottom-4
                          left-4
                          right-4
                          flex
                          translate-y-2
                          items-center
                          justify-between
                          opacity-0
                          transition-all
                          duration-500
                          group-hover:translate-y-0
                          group-hover:opacity-100
                        "
                      >
                        <span
                          className="
                            text-[10px]
                            font-medium
                            uppercase
                            tracking-[0.28em]
                            text-white/85
                          "
                        >
                          View
                        </span>

                        <span
                          className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-white/25
                            bg-black/25
                            text-white
                            backdrop-blur-md
                          "
                        >
                          <ArrowRight size={14} strokeWidth={1.5} />
                        </span>
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ================================================================ */}
        {/* END                                                                */}
        {/* ================================================================ */}

        <section
          className="
            px-6
            py-24
            lg:px-10
            lg:py-36
          "
        >
          <div className="mx-auto max-w-7xl">
            <div className="h-px w-full bg-white/10" />

            <div className="flex items-center justify-between py-8">
              <p className="text-xs uppercase tracking-[0.3em] text-white/35">
                End of company archives
              </p>

              <p className="text-xs uppercase tracking-[0.3em] text-white/25">
                {String(galleryItems.length).padStart(2, "0")} Pictures
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ================================================================ */}
      {/* LIGHTBOX                                                           */}
      {/* ================================================================ */}

      <AnimatePresence>
        {selectedArtwork && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.35,
            }}
            className="
              fixed
              inset-0
              z-[100]
              flex
              items-center
              justify-center
              bg-black/95
              px-5
              py-10
              backdrop-blur-md
            "
            onClick={closeLightbox}
          >
            {/* CLOSE */}

            <button
              type="button"
              aria-label="Close artwork viewer"
              onClick={closeLightbox}
              className="
                absolute
                right-5
                top-5
                z-20
                flex
                h-12
                w-12
                items-center
                justify-center
                text-white/60
                transition
                duration-300
                hover:text-white
                sm:right-8
                sm:top-8
              "
            >
              <X size={22} strokeWidth={1.5} />
            </button>

            {/* PREVIOUS */}

            <button
              type="button"
              aria-label="Previous artwork"
              onClick={(event) => {
                event.stopPropagation();
                showPrevious();
              }}
              className="
                absolute
                left-3
                top-1/2
                z-20
                flex
                h-12
                w-12
                -translate-y-1/2
                items-center
                justify-center
                text-white/45
                transition
                duration-300
                hover:text-white
                sm:left-6
                lg:left-10
              "
            >
              <ArrowLeft size={24} strokeWidth={1.25} />
            </button>

            {/* NEXT */}

            <button
              type="button"
              aria-label="Next artwork"
              onClick={(event) => {
                event.stopPropagation();
                showNext();
              }}
              className="
                absolute
                right-3
                top-1/2
                z-20
                flex
                h-12
                w-12
                -translate-y-1/2
                items-center
                justify-center
                text-white/45
                transition
                duration-300
                hover:text-white
                sm:right-6
                lg:right-10
              "
            >
              <ArrowRight size={24} strokeWidth={1.25} />
            </button>

            {/* IMAGE */}

            <motion.div
              key={selectedArtwork.id}
              initial={{
                opacity: 0,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.97,
              }}
              transition={{
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="
                relative
                flex
                max-h-full
                max-w-[90vw]
                items-center
                justify-center
                sm:max-w-[82vw]
                lg:max-w-[78vw]
              "
              onClick={(event) => {
                event.stopPropagation();
              }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {imageError ? (
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                  Unable to load image
                </p>
              ) : (
                <img
                  src={getOptimizedImageUrl(selectedArtwork.imageUrl, 1800)}
                  alt={selectedArtwork?.title || "Company archive image"}
                  onError={() => setImageError(true)}
                  className="
                    max-h-[88vh]
                    max-w-[92vw]
                    select-none
                    object-contain
                    sm:max-h-[88vh]
                    sm:max-w-[88vw]
                  "
                  draggable={false}
                />
              )}
            </motion.div>

            {/* IMAGE COUNTER */}

            <div
              className="
                absolute
                bottom-6
                left-1/2
                -translate-x-1/2
                text-xs
                uppercase
                tracking-[0.3em]
                text-white/35
              "
            >
              {String(selectedIndex + 1).padStart(2, "0")}
              {" / "}
              {String(galleryItems.length).padStart(2, "0")}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CompanyArchives;
