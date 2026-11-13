import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";

import { apiRequest, getMediaUrl, getOptimizedImageUrl } from "../config/api";

import ventureLogo1 from "../assets/ventures/anytimefitnesslogo-Dtd3ccp2.jpg";
import ventureLogo2 from "../assets/ventures/BI-logo.webp";
import ventureLogo3 from "../assets/ventures/Bialogo-Cq0EIyEs.jpg";
import ventureLogo4 from "../assets/ventures/bielogo-OJpwyBGe.jpg";
import ventureLogo5 from "../assets/ventures/Brown and Tan Geometric Logo.png";
import ventureLogo6 from "../assets/ventures/corridorlogo-CDPwac1u.jpg";
import ventureLogo7 from "../assets/ventures/dietoLogo-203qzA5K.png";
import ventureLogo8 from "../assets/ventures/download.jpeg";
import ventureLogo9 from "../assets/ventures/IaRoyalslogo-BcmrNnyF.jpg";
import ventureLogo10 from "../assets/ventures/IbanHotelslogo-Vh6_YVJr.jpg";
import ventureLogo11 from "../assets/ventures/ibanValleylogo-mobTSK5H.png";
import ventureLogo12 from "../assets/ventures/iboraLogo-DRObnKsQ.png";
import ventureLogo13 from "../assets/ventures/LRlogo-CB9-jFI9.png";
import ventureLogo14 from "../assets/ventures/medeqologo-DVsVYz0s.png";
import ventureLogo15 from "../assets/ventures/sapodillaLogo-jivekX_D.jpg";
import ventureLogo16 from "../assets/ventures/sportiqologo-DEaNsiGN.png";
import ventureLogo17 from "../assets/ventures/sportiqowellnesslogo-BQR_9W1c.png";
import ventureLogo18 from "../assets/ventures/SuplementCartLogo-CqH67wkL.jpg";
import ventureLogo19 from "../assets/ventures/teknourbanlogo-B4AaTFt6.png";
import ventureLogo20 from "../assets/ventures/urbanlogisticlogo-J8BuYoue.png";
import ventureLogo21 from "../assets/ventures/urbanlogo-jElgesXG.png";

const ventures = [
  {
    logo: ventureLogo1,
    url: "https://www.google.com/search?q=Anytime+Fitness",
  },
  { logo: ventureLogo2, url: "https://beingibanonline.com/" },
  { logo: ventureLogo3, url: "https://beingibanacademy.com/" },
  { logo: ventureLogo4, url: "https://beingibanentertainments.com/" },
  { logo: ventureLogo5, url: "https://beingibandigital.in/" },
  { logo: ventureLogo6, url: "https://www.instagram.com/corridorbar3/" },
  { logo: ventureLogo7, url: "https://beingiban.co.in/" },
  {
    logo: ventureLogo8,
    url: "https://www.instagram.com/clublocasaltlakekolkata/",
  },
  { logo: ventureLogo9, url: "https://beingiban.co.in/" },
  { logo: ventureLogo10, url: "https://beingiban.co.in/" },
  { logo: ventureLogo11, url: "https://beingiban.co.in/" },
  { logo: ventureLogo12, url: "https://beingiban.co.in/" },
  { logo: ventureLogo13, url: "https://beingiban.co.in/" },
  { logo: ventureLogo14, url: "https://beingiban.co.in/" },
  { logo: ventureLogo15, url: "https://clubsapodilla.co.in/" },
  { logo: ventureLogo16, url: "https://sportiqofitness.co.in/" },
  {
    logo: ventureLogo17,
    url: "https://sportiqofitness.co.in/sportiqo-wellness-therapy",
  },
  { logo: ventureLogo18, url: "https://beingiban.co.in/" },
  { logo: ventureLogo19, url: "https://www.urbanengineering.co.in/" },
  { logo: ventureLogo20, url: "https://www.urbanengineering.co.in/" },
  { logo: ventureLogo21, url: "https://www.urbanengineering.co.in/" },
];

const CORPORATE_API = "/api/portfolio/corporate";
const CORPORATE_GALLERY_API = "/api/gallery/corporate";
const COMPANY_ARCHIVES_API = "/api/gallery/company-archives";

const initialData = {
  hero: {
    image: "",
  },

  aboutOne: {
    text: "A young entrepreneur from Kolkata, Iban Banerjea (born on 18th March, 1981) is the Director-cum-President of Urban Engineering Association Pvt. Ltd., an ISO Certified company and the leading Manufacturer and Supplier of Railway products, and also the Director of Urban Tekno-Systems Pvt. Ltd.. Iban has been working in the industry since 2004 and he is also a renowned investor, entrepreneur, philanthropist and internationally recognized Artist. He is one of the best entrepreneurs in India.",
  },

  statement:
    "Creating visual work with clarity, intention and a strong sense of identity.",

  aboutTwo: {
    image: "",
    text: "Iban has received numerous accolades for his contributions to entrepreneurship and community development. His innovative approach and leadership in multiple sectors have positioned him as a prominent figure in India’s business landscape.",
  },

  gallery: [],

  links: {
    website: "",
    linkedin: "",
    behance: "",
  },
};

/* =========================================================
   PAGE TRANSITION
========================================================= */

const pageVariants = {
  initial: {
    x: "-100%",
  },

  animate: {
    x: 0,
  },

  exit: {
    x: "100%",
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
  const [useOriginal, setUseOriginal] = useState(false);

  useEffect(() => {
    setImageStatus("loading");
    setUseOriginal(false);
  }, [src]);

  if (!src) {
    return (
      <div
        className={`h-full min-h-[260px] w-full bg-white/[0.025] ${className}`}
      />
    );
  }

  const originalSrc = getMediaUrl(src);

  if (!originalSrc) {
    return (
      <div
        className={`h-full min-h-[260px] w-full bg-white/[0.025] ${className}`}
      />
    );
  }

  const optimizedSrc = getOptimizedImageUrl(originalSrc, mobile ? 640 : 1200);

  const currentSrc = useOriginal || !optimizedSrc ? originalSrc : optimizedSrc;

  const isLoaded = imageStatus === "loaded";
  const isFailed = imageStatus === "error";

  const handleLoad = () => {
    setImageStatus("loaded");
  };

  const handleError = () => {
    if (!useOriginal && currentSrc !== originalSrc) {
      setUseOriginal(true);
      setImageStatus("loading");
      return;
    }

    setImageStatus("error");
    console.error("Failed to load image:", originalSrc);
  };

  const imageClassName = `
    relative
    z-[1]
    block
    h-full
    w-full
    object-cover
    transition-opacity
    duration-500
    ${isLoaded || isFailed ? "opacity-100" : "opacity-0"}
    ${className}
  `;

  const imageProps = {
    src: currentSrc,
    alt,
    width,
    height,
    sizes,
    loading,
    fetchPriority,
    decoding: "async",
    draggable: false,
    onLoad: handleLoad,
    onError: handleError,
    className: imageClassName,
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      {!isLoaded && !isFailed && (
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-pulse bg-white/[0.045]"
        />
      )}

      {isFailed ? (
        <div
          role="img"
          aria-label={`${alt} unavailable`}
          className="
            flex
            h-full
            w-full
            items-center
            justify-center
            bg-white/[0.025]
            text-xs
            text-white/35
          "
        >
          Image unavailable
        </div>
      ) : mobile ? (
        <img {...imageProps} />
      ) : (
        <motion.img
          {...imageProps}
          initial={false}
          animate={{
            opacity: isLoaded ? 1 : 0,
            scale: isLoaded ? 1 : 1.025,
          }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
          whileHover={
            hover && isLoaded
              ? {
                  scale: 1.02,
                }
              : undefined
          }
        />
      )}
    </div>
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
   CORPORATE
========================================================= */

function Corporate() {
  const reducedMotion = useReducedMotion();

  const [isMobile, setIsMobile] = useState(false);
  const [portfolioData, setPortfolioData] = useState(initialData);
  const [portfolioLoading, setPortfolioLoading] = useState(true);

  const galleryRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const archiveGalleryRef = useRef(null);
  const [archiveImages, setArchiveImages] = useState([]);
  const [canScrollArchiveLeft, setCanScrollArchiveLeft] = useState(false);
  const [canScrollArchiveRight, setCanScrollArchiveRight] = useState(false);

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

  /* =======================================================
     LOAD PORTFOLIO
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadPortfolio = async () => {
      try {
        setPortfolioLoading(true);

        const result = await apiRequest(CORPORATE_API);

        if (!mounted) {
          return;
        }

        const images = Array.isArray(result?.images) ? result.images : [];

        const getImage = (slot) => {
          const image = images.find((item) => item?.slot === slot);

          return image?.url || "";
        };

        setPortfolioData((current) => ({
          ...initialData,

          hero: {
            image: getImage("hero"),
          },

          aboutOne: {
            ...initialData.aboutOne,
          },

          aboutTwo: {
            ...initialData.aboutTwo,
            image: getImage("about2"),
          },

          statement: result?.statement || initialData.statement,

          gallery: current.gallery,

          links: {
            ...initialData.links,
            ...(result?.links || {}),
          },
        }));
      } catch (error) {
        console.error("Failed to load corporate portfolio:", error);
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

    const getGalleryImageUrl = (item) =>
      item?.imageUrl || item?.image || item?.url || "";

    const loadGallery = async () => {
      try {
        const result = await apiRequest(CORPORATE_GALLERY_API);

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

        setPortfolioData((current) => ({
          ...current,
          gallery,
        }));
      } catch (error) {
        console.error("Failed to load corporate gallery:", error);
      }
    };

    loadGallery();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     LOAD COMPANY ARCHIVES SEPARATELY
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadCompanyArchives = async () => {
      try {
        const result = await apiRequest(COMPANY_ARCHIVES_API);

        if (!mounted) {
          return;
        }

        const images = Array.isArray(result?.images)
          ? result.images
          : Array.isArray(result?.gallery)
            ? result.gallery
            : [];

        const validImages = images
          .filter((item) =>
            Boolean(item?.imageUrl || item?.image || item?.url || item?.src),
          )
          .slice(0, 5);

        setArchiveImages(validImages);
      } catch (error) {
        console.error("Failed to load company archives:", error);
      }
    };

    loadCompanyArchives();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     COMPANY ARCHIVES BUTTON STATE
  ======================================================= */

  const updateArchiveButtons = useCallback(() => {
    const container = archiveGalleryRef.current;

    if (!container) {
      setCanScrollArchiveLeft(false);
      setCanScrollArchiveRight(false);
      return;
    }

    const maxScroll = Math.max(
      0,
      container.scrollWidth - container.clientWidth,
    );
    const currentScroll = Math.max(0, container.scrollLeft);
    const hasOverflow = maxScroll > 4;

    setCanScrollArchiveLeft(hasOverflow && currentScroll > 4);
    setCanScrollArchiveRight(hasOverflow && currentScroll < maxScroll - 4);
  }, []);

  useEffect(() => {
    const container = archiveGalleryRef.current;

    if (!container) {
      return undefined;
    }

    let frameId = 0;

    const scheduleUpdate = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateArchiveButtons);
    };

    scheduleUpdate();
    container.addEventListener("scroll", scheduleUpdate, { passive: true });
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
  }, [archiveImages, updateArchiveButtons]);

  const scrollArchiveGallery = (direction) => {
    const container = archiveGalleryRef.current;

    if (!container) {
      return;
    }

    const firstCard = container.querySelector("[data-archive-card]");

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

    container.scrollTo({ left: targetScroll, behavior: "smooth" });
  };

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
  }, [portfolioData.gallery, updateGalleryButtons]);

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
          pt-24
          lg:px-10
          lg:pb-28
          lg:pt-28
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
              Corporate
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
              A selection of corporate work, visual direction and professional
              projects developed with clarity and purpose.
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
            {portfolioLoading && !portfolioData.hero.image ? (
              <div
                className="
                  h-full
                  w-full
                  animate-pulse
                  bg-white/[0.025]
                "
              />
            ) : (
              <OptimizedImage
                src={portfolioData.hero.image}
                alt="Corporate portfolio"
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
          <div className="w-full">
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
                text-[clamp(1.8rem,3.2vw,3.4rem)]
                leading-[1.15]
                tracking-[-0.035em]
                text-white/85
              "
            >
              {portfolioData.aboutOne.text}
            </p>
          </div>
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
          py-28
          lg:px-10
          lg:py-36
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
              “{portfolioData.statement}”
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
          py-24
          lg:px-10
          lg:py-36
        "
      >
        <div className="mx-auto max-w-7xl">
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
                text-[clamp(1.8rem,3.5vw,4rem)]
                leading-[1.1]
                tracking-[-0.04em]
                text-white/80
              "
            >
              {portfolioData.aboutTwo.text}
            </p>

            <div
              className="
                aspect-[16/10]
                overflow-hidden
              "
            >
              <OptimizedImage
                src={portfolioData.aboutTwo.image}
                alt="Corporate project"
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
              to="/corporate/gallery"
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
              {portfolioData.gallery.slice(0, 5).map((item, index) => {
                const imageUrl =
                  item?.imageUrl || item?.image || item?.url || "";

                if (!imageUrl) {
                  return null;
                }

                return (
                  <div
                    key={
                      item?.publicId ||
                      item?.id ||
                      item?._id ||
                      `corporate-gallery-${index}`
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
                      alt={item?.title || `Corporate work ${index + 1}`}
                      width={640}
                      height={1024}
                      sizes="
                        (max-width: 639px) calc(100vw - 72px),
                        (max-width: 1023px) 240px,
                        280px
                      "
                      loading={index < 2 ? "eager" : "lazy"}
                      fetchPriority={index === 0 ? "high" : "auto"}
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
          VENTURES
      ===================================================== */}

      <Section
        disableAnimation={disableMotion}
        className="
          border-t
          border-white/10
          px-6
          py-24
          lg:px-10
          lg:py-36
        "
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 lg:mb-16">
            <p
              className="
                text-[10px]
                uppercase
                tracking-[0.35em]
                text-[#C9974B]
              "
            >
              Ventures
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
              Ventures
            </h2>
          </div>

          <div
            className="
              grid
              grid-cols-2
              items-center
              gap-x-6
              gap-y-10
              sm:gap-x-10
              sm:gap-y-14
              lg:grid-cols-4
              lg:gap-x-12
              lg:gap-y-16
            "
          >
            {ventures.map((venture, index) => {
              const logo = (
                <div className="mx-auto flex aspect-square w-full max-w-[150px] items-center justify-center">
                  <img
                    src={venture.logo}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    draggable="false"
                    className="
                      h-full
                      w-full
                      object-contain
                      transition-transform
                      duration-300
                      ease-out
                      hover:scale-105
                    "
                  />
                </div>
              );

              return venture.url ? (
                <a
                  key={index}
                  href={venture.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit venture ${index + 1}`}
                  className="
                    block
                    w-full
                    rounded-full
                    outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[#C9974B]
                    focus-visible:ring-offset-4
                    focus-visible:ring-offset-black
                  "
                >
                  {logo}
                </a>
              ) : (
                <div key={index} className="block w-full">
                  {logo}
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* =====================================================
          COMPANY ARCHIVES
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
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#C9974B]">
                Company Archives
              </p>

              <h2 className="mt-4 font-display text-[clamp(2.5rem,5vw,5rem)] leading-none tracking-[-0.05em]">
                Company Archives
              </h2>
            </div>

            <Link
              to="/company-archives"
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
              <span>View Archives</span>
              <span className="text-lg transition-transform duration-300 group-hover:translate-x-2">
                →
              </span>
            </Link>
          </div>

          <div className="relative mt-8 sm:mt-12">
            <button
              type="button"
              aria-label="Previous company archive image"
              onClick={() => scrollArchiveGallery("previous")}
              disabled={!canScrollArchiveLeft}
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

            <button
              type="button"
              aria-label="Next company archive image"
              onClick={() => scrollArchiveGallery("next")}
              disabled={!canScrollArchiveRight}
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

            <div
              ref={archiveGalleryRef}
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
              {archiveImages.map((item, index) => {
                const imageUrl =
                  item?.imageUrl || item?.image || item?.url || item?.src || "";

                if (!imageUrl) {
                  return null;
                }

                return (
                  <div
                    key={
                      item?.publicId ||
                      item?.id ||
                      item?._id ||
                      `company-archive-${index}`
                    }
                    data-archive-card
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
                      alt={item?.title || `Company archive ${index + 1}`}
                      width={640}
                      height={1024}
                      sizes="
                        (max-width: 639px) calc(100vw - 72px),
                        (max-width: 1023px) 240px,
                        280px
                      "
                      loading={index < 2 ? "eager" : "lazy"}
                      fetchPriority={index === 0 ? "high" : "auto"}
                      mobile={isMobile}
                      hover={!disableMotion}
                      className="aspect-[5/8]"
                    />

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-3 lg:hidden">
            <span className="h-px w-8 bg-white/20" />
            <span className="flex items-center gap-2 text-[8px] uppercase tracking-[0.3em] text-white/30">
              <span>Swipe</span>
              <span className="text-sm text-[#C9974B]/70">→</span>
            </span>
            <span className="h-px w-8 bg-white/20" />
          </div>

          <div className="mt-5 hidden items-center justify-between lg:flex">
            <span className="text-[8px] uppercase tracking-[0.3em] text-white/20">
              Company archives
            </span>
            <span className="text-[8px] uppercase tracking-[0.3em] text-white/20">
              Use arrows to navigate
            </span>
          </div>
        </div>
      </Section>

      {/* =====================================================
          CONTACT
      ===================================================== */}

      <Section
        disableAnimation={disableMotion}
        className="
          px-6
          py-32
          lg:px-10
          lg:py-48
        "
      >
        <div className="mx-auto max-w-7xl">
          <div className="mt-10 max-w-5xl">
            <h2
              className="
                font-display
                text-[clamp(3rem,7vw,8rem)]
                font-medium
                leading-[0.95]
                tracking-[-0.055em]
              "
            >
              Let's discuss
              <br />
              what's next.
            </h2>

            <p
              className="
                mt-8
                max-w-2xl
                text-base
                leading-relaxed
                text-white/55
                md:text-lg
              "
            >
              For collaborations, professional enquiries, or opportunities, feel
              free to get in touch.
            </p>
          </div>

          <div
            className="
              mt-16
              border-t
              border-white/15
              pt-8
              flex
              flex-col
              gap-4
              md:flex-row
              md:items-center
              md:justify-between
            "
          >
            <span
              className="
                text-[10px]
                uppercase
                tracking-[0.3em]
                text-white/40
              "
            >
              Contact
            </span>

            <p
              className="
                text-lg
                font-light
                tracking-wide
                text-[#C9974B]
                md:text-2xl
              "
            >
              contact@ibanbanerjea.com
            </p>
          </div>
        </div>
      </Section>
    </motion.main>
  );
}

export default Corporate;
