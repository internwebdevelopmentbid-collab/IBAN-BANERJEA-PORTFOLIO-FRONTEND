import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { apiRequest, getMediaUrl, getOptimizedImageUrl } from "../config/api";

/* -------------------------------------------------------------------------- */
/* PAGE TRANSITION                                                             */
/* -------------------------------------------------------------------------- */

const pageVariants = {
  initial: {
    x: "100%",
  },

  animate: {
    x: 0,
  },

  exit: {
    x: "-100%",
  },
};

const pageTransition = {
  duration: 1.05,
  ease: [0.22, 1, 0.36, 1],
};

/* -------------------------------------------------------------------------- */
/* SECTION ANIMATIONS                                                          */
/* -------------------------------------------------------------------------- */

const sectionVariants = {
  hidden: {
    opacity: 0,
    y: 50,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

function Section({ children, className = "" }) {
  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        amount: 0.12,
      }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* -------------------------------------------------------------------------- */
/* FALLBACK                                                                    */
/* -------------------------------------------------------------------------- */

const fallbackGallery = [];

/* -------------------------------------------------------------------------- */
/* ARTIST GALLERY                                                              */
/* -------------------------------------------------------------------------- */

function ArtistGallery() {
  const [artworks, setArtworks] = useState(fallbackGallery);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [touchStartX, setTouchStartX] = useState(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  /* ------------------------------------------------------------------------ */
  /* FETCH GALLERY                                                             */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let mounted = true;

    async function fetchGallery() {
      try {
        const result = await apiRequest("/api/gallery/artist");

        const images = Array.isArray(result?.images)
          ? result.images
          : Array.isArray(result?.gallery)
            ? result.gallery
            : [];

        if (mounted) {
          setArtworks(images);
        }
      } catch (error) {
        console.error("Failed to load artist gallery:", error);

        if (mounted) {
          setArtworks(fallbackGallery);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchGallery();

    return () => {
      mounted = false;
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* NORMALIZE IMAGES                                                          */
  /* ------------------------------------------------------------------------ */

  const galleryItems = useMemo(() => {
    return artworks
      .map((item, index) => {
        const rawImageUrl =
          item?.imageUrl || item?.image || item?.url || item?.src || "";

        const imageUrl = getMediaUrl(rawImageUrl);

        return {
          ...item,
          id:
            item?._id ||
            item?.id ||
            item?.publicId ||
            `artist-gallery-${index}`,
          imageUrl,
        };
      })
      .filter((item) => item.imageUrl);
  }, [artworks]);

  /* ------------------------------------------------------------------------ */
  /* LIGHTBOX                                                                  */
  /* ------------------------------------------------------------------------ */

  const selectedArtwork =
    selectedIndex !== null ? galleryItems[selectedIndex] : null;

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const showPrevious = () => {
    if (galleryItems.length === 0) return;

    setSelectedIndex((current) => {
      if (current === null) return 0;

      return (current - 1 + galleryItems.length) % galleryItems.length;
    });
  };

  const showNext = () => {
    if (galleryItems.length === 0) return;

    setSelectedIndex((current) => {
      if (current === null) return 0;

      return (current + 1) % galleryItems.length;
    });
  };

  /* ------------------------------------------------------------------------ */
  /* LIGHTBOX IMAGE LOADING                                                    */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    setIsImageLoaded(false);
  }, [selectedIndex]);

  /* ------------------------------------------------------------------------ */
  /* KEYBOARD                                                                  */
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
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className="
        relative
        overflow-visible
        bg-transparent
        text-white
      "
    >
      {/* ================================================================ */}
      {/* INTRO                                                              */}
      {/* ================================================================ */}

      <Section
        className="
          relative
          min-h-[70vh]
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
              Artist
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
                text-[clamp(3.8rem,8vw,8.5rem)]
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
              A collection of selected works exploring observation, expression,
              experimentation, and visual language.
            </p>
          </div>
        </div>
      </Section>

      {/* ================================================================ */}
      {/* GALLERY                                                            */}
      {/* ================================================================ */}

      <Section className="px-6">
        <div className="mx-auto max-w-7xl">
          {/* MASONRY */}

          {loading ? (
            <div
              className="
                flex
                min-h-[70vh]
                items-center
                justify-center
              "
            >
              <p
                className="
                  text-xs
                  uppercase
                  tracking-[0.3em]
                  text-white/35
                "
              >
                Loading
              </p>
            </div>
          ) : galleryItems.length > 0 ? (
            <div
              className="
                mx-auto
                w-full
                max-w-6xl
                columns-1
                gap-4
                sm:columns-2
                lg:columns-3
              "
            >
              {galleryItems.map((item, index) => {
                const imageUrl = item.imageUrl;

                if (!imageUrl) return null;

                const optimizedImageUrl = getOptimizedImageUrl(imageUrl, 1200);

                const priority = index < 3;

                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    className="
                      group
                      relative
                      mb-5
                      block
                      w-full
                      break-inside-avoid
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
                      alt={item?.title || `Artist work ${index + 1}`}
                      width={1000}
                      height={1250}
                      loading={priority ? "eager" : "lazy"}
                      fetchPriority={priority ? "high" : "auto"}
                      decoding="async"
                      draggable={false}
                      className="
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
          ) : (
            <div
              className="
                mt-14
                flex
                min-h-[50vh]
                items-center
                justify-center
              "
            >
              <p
                className="
                  text-xs
                  uppercase
                  tracking-[0.3em]
                  text-white/35
                "
              >
                No work available
              </p>
            </div>
          )}
        </div>
      </Section>

      {/* ================================================================ */}
      {/* END                                                                */}
      {/* ================================================================ */}

      <Section
        className="
          px-6
          py-24
          lg:px-10
          lg:py-36
        "
      >
        <div className="mx-auto max-w-7xl">
          <div className="h-px w-full bg-white/10" />

          <div
            className="
              flex
              items-center
              justify-between
              py-8
            "
          >
            <p
              className="
                text-xs
                uppercase
                tracking-[0.3em]
                text-white/35
              "
            >
              End of gallery
            </p>

            <p
              className="
                text-xs
                uppercase
                tracking-[0.3em]
                text-white/25
              "
            >
              {String(galleryItems.length).padStart(2, "0")} Works
            </p>
          </div>
        </div>
      </Section>

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

            <motion.div
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
              {!isImageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border border-white/15 border-t-[#D9AA55]" />
                </div>
              )}

              <img
                src={getOptimizedImageUrl(selectedArtwork.imageUrl, 1800)}
                alt=""
                className={`
                  max-h-[88vh]
                  max-w-[92vw]
                  select-none
                  object-contain
                  transition-opacity
                  duration-300
                  sm:max-h-[88vh]
                  sm:max-w-[88vw]
                  ${isImageLoaded ? "opacity-100" : "opacity-0"}
                `}
                draggable={false}
                onLoad={() => setIsImageLoaded(true)}
              />
            </motion.div>

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
    </motion.main>
  );
}

export default ArtistGallery;
