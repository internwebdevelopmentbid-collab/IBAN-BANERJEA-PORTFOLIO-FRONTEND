import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";

import { apiRequest, getMediaUrl, getOptimizedImageUrl } from "../config/api";

const ARTIST_API = "/api/portfolio/artist";
const ARTIST_GALLERY_API = "/api/gallery/artist";
const WORKS_API = "/api/works";

const initialData = {
  hero: {
    image: "",
  },

  aboutOne: {
    text: "A young entrepreneur from Kolkata, Iban Banerjea (born on 18th March, 1981) is the Director-cum-President of Urban Engineering Association Pvt. Ltd., an ISO Certified company and the leading Manufacturer and Supplier of Railway products, and also the Director of Urban Tekno-Systems Pvt. Ltd.. Iban has been working in the industry since 2004 and he is also a renowned investor, entrepreneur, philanthropist and internationally recognized Artist. He is one of the best entrepreneurs in India.",
  },

  statement:
    "Art is not a destination. It is an evolving conversation between observation, emotion and expression.",

  aboutTwo: {
    image: "",
    text: "Iban Banerjea is an avid artist and has participated in various international artistic endeavors, collaborating with global brands in the modeling and entertainment industries. He is also known for his commitment to personal growth and lifelong learning.",
  },

  gallery: [],

  links: {
    instagram: "",
    youtube: "",
  },
};

/* =========================================================
   PAGE TRANSITION
========================================================= */

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
  duration: 0.85,
  ease: [0.22, 1, 0.36, 1],
};

/* =========================================================
   SECTION ANIMATION
========================================================= */

const sectionVariants = {
  hidden: {
    opacity: 0,
    y: 35,
  },

  visible: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* =========================================================
   SECTION
========================================================= */

function Section({ children, className = "", disableAnimation = false }) {
  if (disableAnimation) {
    return <section className={className}>{children}</section>;
  }

  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        amount: 0.05,
      }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* =========================================================
   OPTIMIZED IMAGE
========================================================= */

function OptimizedImage({
  src,
  alt = "",
  className = "",
  sizes = "100vw",
  width = 1000,
  height = 1000,
  loading = "lazy",
  fetchPriority = "auto",
  mobile = false,
  hover = false,
}) {
  const [imageStatus, setImageStatus] = useState("loading");

  if (!src) {
    return null;
  }

  const mediaUrl = getMediaUrl(src);

  if (!mediaUrl) {
    return null;
  }

  const optimizedUrl = getOptimizedImageUrl(mediaUrl, mobile ? 640 : 1200);

  const currentSrc =
    imageStatus === "error" ? mediaUrl : optimizedUrl || mediaUrl;

  const isImageVisible = imageStatus === "loaded" || imageStatus === "error";

  const imageClassName = `
    block
    h-full
    w-full
    object-cover
    transition-opacity
    duration-500
    ${isImageVisible ? "opacity-100" : "opacity-0"}
    ${className}
  `;

  const commonImageProps = {
    src: currentSrc,
    alt,
    width,
    height,
    sizes,
    loading,
    fetchPriority,
    decoding: "async",
    draggable: false,
    onLoad: () => {
      setImageStatus("loaded");
    },
    onError: () => {
      setImageStatus("error");
    },
    className: imageClassName,
  };

  if (mobile) {
    return <img {...commonImageProps} />;
  }

  return (
    <motion.img
      {...commonImageProps}
      whileHover={
        hover && isImageVisible
          ? {
              scale: 1.02,
            }
          : undefined
      }
    />
  );
}

/* =========================================================
   ARROW ICONS
========================================================= */

function ArrowLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M19 12H5" />
      <path d="M11 6l-6 6 6 6" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

/* =========================================================
   ARTIST
========================================================= */

function Artist() {
  const reducedMotion = useReducedMotion();

  const [isMobile, setIsMobile] = useState(false);
  const [data, setData] = useState(initialData);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [works, setWorks] = useState([]);

  const galleryRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  /* =======================================================
     MOBILE DETECTION
  ======================================================= */

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const updateMobile = () => {
      setIsMobile(mediaQuery.matches);
    };

    updateMobile();

    mediaQuery.addEventListener("change", updateMobile);

    return () => {
      mediaQuery.removeEventListener("change", updateMobile);
    };
  }, []);

  const disableMotion = isMobile || reducedMotion;

  useEffect(() => {
    if (!lightboxImage) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setLightboxImage(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxImage]);

  /* =======================================================
     LOAD PORTFOLIO
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadPortfolio = async () => {
      try {
        setPortfolioLoading(true);

        const result = await apiRequest(ARTIST_API);

        if (!mounted) {
          return;
        }

        const images = Array.isArray(result?.images) ? result.images : [];

        const getImage = (slot) => {
          const image = images.find((item) => item?.slot === slot);

          return image?.url || "";
        };

        setData({
          ...initialData,

          hero: {
            image: getImage("hero"),
          },

          aboutOne: {
            ...initialData.aboutOne,
            image: getImage("about1"),
          },

          aboutTwo: {
            ...initialData.aboutTwo,
            image: getImage("about2"),
          },

          statement: result?.statement || initialData.statement,

          gallery: [],

          links: {
            ...initialData.links,
            ...(result?.links || {}),
          },
        });
      } catch (error) {
        console.error("Failed to load artist portfolio:", error);
      } finally {
        if (mounted) {
          setPortfolioLoading(false);
        }
      }
    };

    loadPortfolio();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     LOAD GALLERY
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const delay = (ms) =>
      new Promise((resolve) => window.setTimeout(resolve, ms));

    const getGalleryImageUrl = (item) =>
      getMediaUrl(item?.imageUrl || item?.image || item?.url || "");

    const loadGallery = async () => {
      for (let attempt = 1; attempt <= 3; attempt += 1) {
        try {
          const result = await apiRequest(ARTIST_GALLERY_API);

          if (!mounted) {
            return;
          }

          const images = Array.isArray(result?.images)
            ? result.images
            : Array.isArray(result?.gallery)
              ? result.gallery
              : [];

          const gallery = images
            .filter((item) => Boolean(getGalleryImageUrl(item)))
            .slice(0, 5);

          if (gallery.length > 0) {
            setData((current) => ({
              ...current,
              gallery,
            }));

            return;
          }

          if (attempt < 3) {
            await delay(1000 * attempt);
          }
        } catch (error) {
          console.error(
            `Failed to load artist gallery (attempt ${attempt}):`,
            error,
          );

          if (attempt < 3) {
            await delay(1000 * attempt);
          }
        }
      }

      if (mounted) {
        console.error("Artist gallery could not be loaded after 3 attempts.");
      }
    };

    loadGallery();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     GALLERY BUTTON STATE
  ======================================================= */

  const updateGalleryButtons = useCallback(() => {
    const container = galleryRef.current;

    if (!container) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const maxScroll = Math.max(
      0,
      container.scrollWidth - container.clientWidth,
    );

    const currentScroll = Math.max(0, container.scrollLeft);
    const hasOverflow = maxScroll > 4;

    setCanScrollLeft(hasOverflow && currentScroll > 4);
    setCanScrollRight(hasOverflow && currentScroll < maxScroll - 4);
  }, []);

  useEffect(() => {
    const container = galleryRef.current;

    if (!container) {
      return undefined;
    }

    let frameId = 0;

    const scheduleUpdate = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateGalleryButtons);
    };

    scheduleUpdate();

    container.addEventListener("scroll", scheduleUpdate, {
      passive: true,
    });

    window.addEventListener("resize", scheduleUpdate);

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(scheduleUpdate)
        : null;

    resizeObserver?.observe(container);

    if (container.parentElement) {
      resizeObserver?.observe(container.parentElement);
    }

    return () => {
      cancelAnimationFrame(frameId);
      container.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      resizeObserver?.disconnect();
    };
  }, [data.gallery, updateGalleryButtons]);

  /* =======================================================
     GALLERY NAVIGATION
  ======================================================= */

  const scrollGallery = (direction) => {
    const container = galleryRef.current;

    if (!container) {
      return;
    }

    const firstCard = container.querySelector("[data-gallery-card]");

    if (!firstCard) {
      return;
    }

    const cardWidth = firstCard.getBoundingClientRect().width;

    const styles = window.getComputedStyle(container);

    const gap = parseFloat(styles.columnGap) || parseFloat(styles.gap) || 0;

    const amount = cardWidth + gap;
    const maxScroll = Math.max(
      0,
      container.scrollWidth - container.clientWidth,
    );

    const targetScroll =
      direction === "next"
        ? Math.min(maxScroll, container.scrollLeft + amount)
        : Math.max(0, container.scrollLeft - amount);

    container.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  };

  /* =======================================================
   LOAD WORKS
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadWorks = async () => {
      try {
        const result = await apiRequest(WORKS_API);

        if (!mounted) {
          return;
        }

        setWorks(Array.isArray(result?.works) ? result.works : []);
      } catch (error) {
        console.error("Failed to load artist works:", error);
      }
    };

    loadWorks();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <motion.main
      variants={disableMotion ? undefined : pageVariants}
      initial={disableMotion ? false : "initial"}
      animate={disableMotion ? false : "animate"}
      exit={disableMotion ? false : "exit"}
      transition={disableMotion ? undefined : pageTransition}
      className="
        relative
        overflow-visible
        bg-transparent
        text-white
      "
    >
      {/* =====================================================
          HERO
      ===================================================== */}

      <Section
        disableAnimation={disableMotion}
        className="
          relative
          min-h-screen
          px-6
          pb-20
          pt-16
        "
      >
        <div
          className="
            mx-auto
            grid
            max-w-7xl
            items-center
            gap-12
            lg:grid-cols-[0.9fr_1.1fr]
            lg:gap-20
          "
        >
          {/* TEXT */}

          <div
            className="
              relative
              z-10
              order-1
              lg:order-1
              lg:-mt-4
            "
          >
            <p
              className="
                text-[10px]
                uppercase
                tracking-[0.35em]
                text-[#C9974B]
              "
            >
              Iban Banerjea
            </p>

            <h1
              className="
                mt-5
                max-w-3xl
                font-display
                text-[clamp(3.8rem,8vw,8.5rem)]
                font-medium
                uppercase
                leading-[0.9]
                tracking-[-0.06em]
                bg-gradient-to-r
                from-[#F2D18A]
                via-[#D9AA55]
                to-[#8A5E24]
                bg-clip-text
                text-transparent
              "
            >
              Artist
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
                max-w-md
                font-sans
                text-sm
                leading-7
                text-white/55
              "
            >
              A personal practice exploring observation, expression,
              experimentation and visual language.
            </p>
          </div>

          {/* HERO IMAGE */}

          <div
            className="
              order-2
              aspect-[4/5]
              overflow-hidden
              lg:order-2
              lg:aspect-[5/6]
            "
          >
            {data.hero.image && (
              <button
                type="button"
                onClick={() => setLightboxImage(getMediaUrl(data.hero.image))}
                aria-label="View hero image"
                className="block h-full w-full cursor-pointer border-0 bg-transparent p-0 text-left"
              >
                <OptimizedImage
                  src={data.hero.image}
                  alt="Artist portfolio"
                  width={800}
                  height={1000}
                  sizes="
                    (max-width: 767px) calc(100vw - 48px),
                    (max-width: 1023px) 70vw,
                    55vw
                  "
                  loading="eager"
                  fetchPriority="high"
                  mobile={isMobile}
                  hover={!disableMotion}
                />
              </button>
            )}
          </div>
        </div>
      </Section>

      {/* =====================================================
          ABOUT 01
      ===================================================== */}

      <Section
        disableAnimation={disableMotion}
        className="
          w-full
          px-6
          py-24
          lg:px-10
          lg:py-36
        "
      >
        <div className="mx-auto w-full max-w-7xl">
          <p
            className="
              text-[10px]
              uppercase
              tracking-[0.35em]
              text-[#C9974B]
            "
          >
            Iban Banerjea
          </p>

          <div className="mt-7 h-px w-16 bg-white/15" />

          <p
            className="
              mt-8
              w-full
              max-w-none
              font-display
              text-[clamp(1.5rem,2.7vw,2.8rem)]
              leading-[1.5]
              text-white/85
            "
          >
            {data.aboutOne.text}
          </p>
        </div>
      </Section>

      {/* =====================================================
          APPROACH
      ===================================================== */}

      <Section
        disableAnimation={disableMotion}
        className="
          relative
          px-6
          py-14
          lg:px-10
          lg:py-18
        "
      >
        <div className="mx-auto max-w-7xl">
          <p
            className="
              text-[10px]
              uppercase
              tracking-[0.35em]
              text-[#C9974B]
            "
          >
            Approach
          </p>

          <div
            className="
              relative
              mt-8
              lg:mt-10
            "
          >
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                left-0
                top-[-1rem]
                z-0
                select-none
                font-serif
                text-[clamp(7rem,15vw,15rem)]
                font-bold
                leading-[0.7]
                bg-gradient-to-br
                from-[#F2D18A]
                via-[#C9974B]
                to-[#7A5420]
                bg-clip-text
                text-transparent
                opacity-[0.09]
                lg:left-[-1rem]
                lg:top-[-1.5rem]
              "
            >
              “
            </div>

            <blockquote
              className="
                relative
                z-10
                max-w-6xl
                font-display
                text-[clamp(2.5rem,min(7vw,12vh),6.5rem)]
                font-medium
                leading-[1.3]
                tracking-[-0.055em]
                bg-gradient-to-br
                from-[#F4D58E]
                via-[#C9974B]
                to-[#8A5E24]
                bg-clip-text
                text-transparent
              "
            >
              “{data.statement}”
            </blockquote>
          </div>

          <div
            className="
              mt-10
              h-px
              w-full
              bg-white/10
              lg:mt-12
            "
          />
        </div>
      </Section>

      {/* =====================================================
          ABOUT 02
      ===================================================== */}

      <Section
        disableAnimation={disableMotion}
        className="
          px-6
          py-14
          lg:px-10
          lg:py-18
        "
      >
        <div className="mx-auto max-w-7xl">
          <p
            className="
                text-[10px]
                uppercase
                tracking-[0.35em]
                text-[#C9974B]
              "
          >
            Artist
          </p>
          <div
            className="
              grid
              gap-14
              lg:grid-cols-[1.1fr_0.9fr]
              lg:items-center
              lg:gap-24
            "
          >
            <p
              className="
                mt-8
                max-w-2xl
                font-display
                text-[clamp(1.5rem,2.7vw,3.4rem)]
                leading-[1.1]
                text-white/80
              "
            >
              {data.aboutTwo.text}
            </p>

            <div
              className="
                aspect-[16/10]
                overflow-hidden
              "
            >
              {data.aboutTwo.image && (
                <button
                  type="button"
                  onClick={() =>
                    setLightboxImage(getMediaUrl(data.aboutTwo.image))
                  }
                  aria-label="View About section image"
                  className="block h-full w-full cursor-pointer border-0 bg-transparent p-0 text-left"
                >
                  <OptimizedImage
                    src={data.aboutTwo.image}
                    alt="Artist project"
                    width={800}
                    height={500}
                    sizes="
                      (max-width: 767px) calc(100vw - 48px),
                      45vw
                    "
                    loading="lazy"
                    mobile={isMobile}
                    hover={!disableMotion}
                  />
                </button>
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* =====================================================
          GALLERY
      ===================================================== */}

      <Section
        disableAnimation={disableMotion}
        className="
          px-4
          py-20
          sm:px-6
          sm:py-24
          lg:px-10
          lg:py-36
        "
      >
        <div
          className="
            mx-auto
            max-w-7xl
            rounded-[28px]
            border
            border-white/15
            bg-white/[0.06]
            p-4
            shadow-[0_20px_70px_rgba(0,0,0,0.18)]
            backdrop-blur-2xl
            backdrop-saturate-150
            sm:rounded-[32px]
            sm:p-6
            lg:p-10
          "
        >
          {/* HEADER */}

          <div
            className="
              flex
              flex-col
              justify-between
              gap-7
              sm:flex-row
              sm:items-end
              sm:gap-8
            "
          >
            <div>
              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.35em]
                  text-[#C9974B]
                "
              >
                Selected Work
              </p>

              <h2
                className="
                  mt-4
                  font-display
                  text-[clamp(2.5rem,5vw,5rem)]
                  leading-none
                  tracking-[-0.05em]
                "
              >
                Gallery
              </h2>
            </div>

            <Link
              to="/artist/gallery"
              className="
                group
                flex
                items-center
                gap-4
                self-start
                text-[10px]
                uppercase
                tracking-[0.25em]
                text-white/60
                transition-colors
                duration-300
                hover:text-[#C9974B]
                sm:self-auto
              "
            >
              <span>View Gallery</span>

              <span
                className="
                  text-lg
                  transition-transform
                  duration-300
                  group-hover:translate-x-2
                "
              >
                →
              </span>
            </Link>
          </div>

          {/* GALLERY */}

          <div className="relative mt-8 sm:mt-12">
            {/* DESKTOP PREVIOUS */}

            <button
              type="button"
              aria-label="Previous gallery image"
              onClick={() => scrollGallery("previous")}
              disabled={!canScrollLeft}
              className="
                absolute
                left-[-22px]
                top-1/2
                z-20
                hidden
                h-11
                w-11
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                border
                border-white/15
                bg-black/70
                text-white/60
                shadow-xl
                backdrop-blur-xl
                transition-colors
                duration-300
                hover:border-[#C9974B]/50
                hover:text-[#F4D58D]
                disabled:pointer-events-none
                disabled:opacity-20
                lg:flex
              "
            >
              <ArrowLeftIcon />
            </button>

            {/* DESKTOP NEXT */}

            <button
              type="button"
              aria-label="Next gallery image"
              onClick={() => scrollGallery("next")}
              disabled={!canScrollRight}
              className="
                absolute
                right-[-22px]
                top-1/2
                z-20
                hidden
                h-11
                w-11
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                border
                border-white/15
                bg-black/70
                text-white/60
                shadow-xl
                backdrop-blur-xl
                transition-colors
                duration-300
                hover:border-[#C9974B]/50
                hover:text-[#F4D58D]
                disabled:pointer-events-none
                disabled:opacity-20
                lg:flex
              "
            >
              <ArrowRightIcon />
            </button>

            {/* HORIZONTAL GALLERY */}

            <div
              ref={galleryRef}
              className="
                -mx-1
                flex
                snap-x
                snap-mandatory
                gap-3
                overflow-x-auto
                overscroll-x-contain
                px-1
                pb-2
                scroll-smooth
                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
                sm:gap-4
                lg:gap-5
              "
            >
              {data.gallery.slice(0, 5).map((item, index) => {
                const imageUrl = getMediaUrl(
                  item?.imageUrl || item?.image || item?.url || "",
                );

                if (!imageUrl) {
                  return null;
                }

                return (
                  <div
                    key={
                      item?.publicId ||
                      item?.url ||
                      item?.imageUrl ||
                      item?.id ||
                      item?._id ||
                      `artist-gallery-${index}`
                    }
                    data-gallery-card
                    className="
                      group
                      relative
                      w-[calc(100vw-72px)]
                      max-w-[280px]
                      flex-none
                      snap-center
                      overflow-hidden
                      rounded-[20px]
                      bg-black
                      sm:w-[240px]
                      sm:max-w-none
                      sm:snap-start
                      lg:w-[280px]
                    "
                  >
                    <OptimizedImage
                      src={imageUrl}
                      alt={item?.title || `Artist work ${index + 1}`}
                      width={640}
                      height={1024}
                      sizes="
                        (max-width: 639px) calc(100vw - 72px),
                        (max-width: 1023px) 240px,
                        280px
                      "
                      loading="lazy"
                      mobile={isMobile}
                      hover={!disableMotion}
                      className="
                        aspect-[5/8]
                      "
                    />

                    <div
                      className="
                        pointer-events-none
                        absolute
                        inset-0
                        bg-gradient-to-t
                        from-black/20
                        via-transparent
                        to-transparent
                      "
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* MOBILE SWIPE INDICATOR */}

          <div
            className="
              mt-5
              flex
              items-center
              justify-center
              gap-3
              lg:hidden
            "
          >
            <span
              className="
                h-px
                w-8
                bg-white/20
              "
            />

            <span
              className="
                flex
                items-center
                gap-2
                text-[8px]
                uppercase
                tracking-[0.3em]
                text-white/30
              "
            >
              <span>Swipe</span>

              <span
                className="
                  text-sm
                  text-[#C9974B]/70
                "
              >
                →
              </span>
            </span>

            <span
              className="
                h-px
                w-8
                bg-white/20
              "
            />
          </div>

          {/* DESKTOP NAVIGATION LABEL */}

          <div
            className="
              mt-5
              hidden
              items-center
              justify-between
              lg:flex
            "
          >
            <span
              className="
                text-[8px]
                uppercase
                tracking-[0.3em]
                text-white/20
              "
            >
              Selected work
            </span>

            <span
              className="
                text-[8px]
                uppercase
                tracking-[0.3em]
                text-white/20
              "
            >
              Use arrows to navigate
            </span>
          </div>
        </div>
      </Section>

      {/* =====================================================
          WORKS — YOUTUBE VIDEOS
      ===================================================== */}

      <Section
        disableAnimation={disableMotion}
        className="
          border-t
          border-white/10
          px-6
          py-12
          lg:px-10
          lg:py-18
        "
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 lg:mb-14">
            <p
              className="
                text-[10px]
                uppercase
                tracking-[0.35em]
                text-[#C9974B]
              "
            >
              Selected Videos
            </p>

            <h2
              className="
                mt-5
                font-display
                text-[clamp(2.8rem,5vw,5.5rem)]
                leading-none
                tracking-[-0.05em]
              "
            >
              Works
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
            {works.map((video) => (
              <div
                key={video.id}
                className="
                  overflow-hidden
                  rounded-[20px]
                  border
                  border-white/10
                  bg-white/[0.03]
                  shadow-[0_20px_70px_rgba(0,0,0,0.2)]
                "
              >
                <div className="aspect-video w-full">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${video.videoId}`}
                    title={video.title}
                    className="h-full w-full"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* =====================================================
          EXTERNAL LINKS
      ===================================================== */}

      <Section
        disableAnimation={disableMotion}
        className="
          border-t
          border-white/10
          px-6
          py-12
          lg:px-10
          lg:py-16
        "
      >
        <div
          className="
            mx-auto
            grid
            max-w-7xl
            gap-12
            lg:grid-cols-2
            lg:items-center
            lg:gap-20
          "
        >
          {/* LEFT — HEADING */}

          <div>
            <p
              className="
                text-[10px]
                uppercase
                tracking-[0.35em]
                text-[#C9974B]
              "
            >
              Connect
            </p>

            <h2
              className="
                mt-4
                font-display
                text-[clamp(2.5rem,5vw,5rem)]
                leading-none
                tracking-[-0.05em]
                text-white
              "
            >
              Find Me
              <br />
              Elsewhere
            </h2>

            <p
              className="
                mt-6
                max-w-md
                font-sans
                text-sm
                leading-7
                text-white/55
              "
            >
              Stay connected, explore recent works, and discover the
              inspirations, ideas, and creative process behind my artistic
              journey
            </p>
          </div>

          {/* RIGHT — SOCIAL LINKS */}

          <div
            className="
              flex
              flex-col
              gap-8
              lg:items-start
              lg:pl-16
            "
          >
            {/* INSTAGRAM */}

            <a
              href="https://www.instagram.com/ibanbanerjea"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="
                group
                flex
                w-fit
                items-center
                gap-5
              "
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="
                  h-8
                  w-8
                  text-white/60
                  transition-all
                  duration-500
                  group-hover:text-[#C9974B]
                  group-hover:drop-shadow-[0_0_8px_rgba(201,151,75,0.8)]
                "
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle
                  cx="17.5"
                  cy="6.5"
                  r="1"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>

              <span
                className="
                  font-display
                  text-2xl
                  text-white/70
                  transition-all
                  duration-500
                  group-hover:text-[#C9974B]
                  group-hover:[text-shadow:0_0_8px_rgba(201,151,75,0.7),0_0_20px_rgba(201,151,75,0.4)]
                "
              >
                Instagram
              </span>
            </a>

            <div
              className="
                h-px
                w-full
                max-w-sm
                bg-gradient-to-r
                from-[#C9974B]/50
                via-white/15
                to-transparent
              "
            />

            {/* YOUTUBE */}

            <a
              href="https://www.youtube.com/@IbanBanerjeaOfficial"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="
                group
                flex
                w-fit
                items-center
                gap-5
              "
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="
                  h-8
                  w-8
                  text-white/60
                  transition-all
                  duration-500
                  group-hover:text-[#C9974B]
                  group-hover:drop-shadow-[0_0_8px_rgba(201,151,75,0.8)]
                "
                aria-hidden="true"
              >
                <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
              </svg>

              <span
                className="
                  font-display
                  text-2xl
                  text-white/70
                  transition-all
                  duration-500
                  group-hover:text-[#C9974B]
                  group-hover:[text-shadow:0_0_8px_rgba(201,151,75,0.7),0_0_20px_rgba(201,151,75,0.4)]
                "
              >
                YouTube
              </span>
            </a>
          </div>
        </div>
      </Section>

      {/* IMAGE LIGHTBOX */}
      {lightboxImage &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Image preview"
            onClick={() => setLightboxImage(null)}
            className="
              fixed
              inset-0
              z-[99999]
              flex
              items-center
              justify-center
              bg-black/95
              p-4
              backdrop-blur-md
              sm:p-8
            "
          >
            {/* CLOSE BUTTON */}
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              aria-label="Close image preview"
              className="
                absolute
                right-5
                top-5
                z-10
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                border
                border-white/20
                bg-white/10
                text-3xl
                text-white
                transition
                hover:border-[#C9974B]
                hover:bg-white/20
              "
            >
              &times;
            </button>

            {/* FULL-SIZE IMAGE */}
            <img
              src={lightboxImage}
              alt="Expanded artist portfolio image"
              onClick={(event) => event.stopPropagation()}
              className="
                max-h-[90vh]
                max-w-[95vw]
                rounded-sm
                object-contain
                shadow-2xl
              "
            />
          </div>,
          document.body,
        )}
    </motion.main>
  );
}

export default Artist;
