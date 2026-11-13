import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiRequest, getMediaUrl } from "../config/api.js";

/* -------------------------------------------------------------------------- */
/* IMAGE HELPERS                                                              */
/* -------------------------------------------------------------------------- */

function getResponsiveImageUrl(url, width) {
  if (!url) return "";

  const mediaUrl = getMediaUrl(url);

  if (!mediaUrl.includes("res.cloudinary.com")) {
    return mediaUrl;
  }

  const uploadMarker = "/image/upload/";

  if (!mediaUrl.includes(uploadMarker)) {
    return mediaUrl;
  }

  const transformation = `f_auto,q_auto,w_${width},c_limit`;

  return mediaUrl.replace(uploadMarker, `${uploadMarker}${transformation}/`);
}

function getResponsiveSrcSet(url) {
  if (!url) return "";

  const mediaUrl = getMediaUrl(url);

  if (!mediaUrl.includes("res.cloudinary.com")) {
    return "";
  }

  const widths = [480, 640, 768, 960, 1200, 1600];

  return widths
    .map((width) => `${getResponsiveImageUrl(url, width)} ${width}w`)
    .join(", ");
}

/* -------------------------------------------------------------------------- */
/* PORTFOLIO SIDE                                                             */
/* -------------------------------------------------------------------------- */

function PortfolioSide({
  title,
  description,
  image,
  href,
  priority = false,
  reduceMotion = false,
}) {
  const src = image ? getResponsiveImageUrl(image, priority ? 1200 : 900) : "";
  const srcSet = image ? getResponsiveSrcSet(image) : "";

  return (
    <Link
      to={href}
      className="
        group
        relative
        block
        h-[50svh]
        min-h-[320px]
        w-full
        shrink-0
        overflow-hidden
        outline-none
        md:h-full
        md:min-h-0
        md:w-1/2
        md:shrink
      "
    >
      {/* BACKGROUND IMAGE */}

      {image ? (
        <motion.div
          className="absolute inset-0"
          initial={reduceMotion ? false : { scale: 1.025 }}
          animate={reduceMotion ? false : { scale: 1 }}
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 1.2,
                  ease: [0.22, 1, 0.36, 1],
                }
          }
          whileHover={reduceMotion ? undefined : { scale: 1.035 }}
        >
          <img
            src={src}
            srcSet={srcSet || undefined}
            sizes="
              (max-width: 767px) 100vw,
              50vw
            "
            alt={`${title} portfolio`}
            width="1600"
            height="1200"
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            className="
              h-full
              w-full
              object-cover
              grayscale-[15%]
              transition-[filter]
              duration-700
              ease-out
              group-hover:grayscale-0
            "
          />
        </motion.div>
      ) : (
        <div className="absolute inset-0 bg-[#111]" />
      )}

      {/* DARK OVERLAY */}

      <div
        className="
          absolute
          inset-0
          bg-black/45
          transition-[background-color]
          duration-500
          group-hover:bg-black/30
        "
      />

      {/* EDGE VIGNETTE */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_center,transparent_25%,rgba(0,0,0,0.38)_100%)]
        "
      />

      {/* LOWER-THIRD CONTENT */}

      <div
        className="
          absolute
          inset-x-0
          bottom-[10%]
          z-10
          flex
          flex-col
          items-center
          px-5
          text-center
          sm:bottom-[12%]
          sm:px-8
          md:bottom-[11%]
          md:px-12
        "
      >
        {/* TITLE */}

        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={reduceMotion ? false : { opacity: 1, y: 0 }}
          transition={
            reduceMotion
              ? undefined
              : {
                  opacity: {
                    duration: 0.8,
                    delay: priority ? 0.1 : 0.2,
                    ease: [0.22, 1, 0.36, 1],
                  },
                  y: {
                    duration: 0.8,
                    delay: priority ? 0.1 : 0.2,
                    ease: [0.22, 1, 0.36, 1],
                  },
                  backgroundPosition: {
                    duration: 0.9,
                    ease: [0.22, 1, 0.36, 1],
                  },
                }
          }
          whileHover={
            reduceMotion ? undefined : { backgroundPosition: "100% 50%" }
          }
          className="
            font-display
            text-[clamp(2.8rem,7vw,8rem)]
            font-medium
            uppercase
            leading-[0.85]
            tracking-[-0.055em]
            bg-clip-text
            text-transparent
            transition-[letter-spacing]
            duration-500
            ease-out
            group-hover:tracking-[-0.035em]
          "
          style={{
            backgroundImage: `
              linear-gradient(
                110deg,
                #c9974b 0%,
                #c9974b 38%,
                #f1d28f 46%,
                #fff0c2 50%,
                #f1d28f 54%,
                #c9974b 62%,
                #c9974b 100%
              )
            `,
            backgroundSize: "250% 100%",
            backgroundPosition: "0% 50%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {title}
        </motion.h1>

        {/* DESCRIPTION */}

        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 15 }}
          animate={reduceMotion ? false : { opacity: 1, y: 0 }}
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 0.7,
                  delay: priority ? 0.2 : 0.3,
                  ease: [0.22, 1, 0.36, 1],
                }
          }
          className="
            mt-5
            max-w-[320px]
            font-sans
            text-[12px]
            font-normal
            leading-[1.7]
            text-white/65
            transition-colors
            duration-500
            group-hover:text-white/80
            sm:mt-7
            sm:max-w-[360px]
            sm:text-[13px]
          "
        >
          {description}
        </motion.p>

        {/* ENTER */}

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={reduceMotion ? false : { opacity: 1, y: 0 }}
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 0.7,
                  delay: priority ? 0.3 : 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }
          }
          className="
            mt-6
            flex
            items-center
            gap-3
            text-[10px]
            uppercase
            tracking-[0.3em]
            text-white/50
            transition-colors
            duration-500
            group-hover:text-[#C9974B]
            sm:mt-9
          "
        >
          <span>Enter</span>

          <motion.span
            className="text-[16px]"
            animate={reduceMotion ? undefined : { x: [0, 3, 0] }}
            transition={
              reduceMotion
                ? undefined
                : {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
            }
          >
            →
          </motion.span>
        </motion.div>
      </div>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* HOME                                                                       */
/* -------------------------------------------------------------------------- */

function Home() {
  const reduceMotion = useReducedMotion();

  const [homeData, setHomeData] = useState({
    corporate: { image: "" },
    artist: { image: "" },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  /* FETCH HOME DATA */

  useEffect(() => {
    let mounted = true;

    const fetchHomeData = async () => {
      try {
        setError(false);

        const data = await apiRequest("/api/home");

        if (!mounted) return;

        const images = Array.isArray(data?.images) ? data.images : [];

        const corporateImage =
          images.find((item) => item?.slot === "corporate")?.url || "";

        const artistImage =
          images.find((item) => item?.slot === "artist")?.url || "";

        setHomeData({
          corporate: {
            image: corporateImage,
          },
          artist: {
            image: artistImage,
          },
        });
      } catch (fetchError) {
        console.error("Failed to load home page data:", fetchError);

        if (mounted) {
          setError(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchHomeData();

    return () => {
      mounted = false;
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* LOADING STATE                                                            */
  /* ------------------------------------------------------------------------ */

  if (loading) {
    return (
      <main
        className="
          min-h-[100svh]
          w-full
          overflow-x-hidden
          bg-black
          text-white
          md:h-screen
          md:min-h-0
          md:overflow-hidden
        "
      >
        <div
          className="
            flex
            min-h-[100svh]
            w-full
            flex-col
            md:h-full
            md:min-h-0
            md:flex-row
          "
        >
          <div
            className="
              h-[50svh]
              min-h-[320px]
              w-full
              shrink-0
              animate-pulse
              bg-[#111]
              md:h-full
              md:min-h-0
              md:w-1/2
              md:shrink
            "
          />

          <div
            className="
              h-[50svh]
              min-h-[320px]
              w-full
              shrink-0
              animate-pulse
              bg-[#111]
              md:h-full
              md:min-h-0
              md:w-1/2
              md:shrink
            "
          />
        </div>
      </main>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <main
      className="
        relative
        min-h-[100svh]
        w-full
        overflow-x-hidden
        bg-black
        text-white
        md:h-screen
        md:min-h-0
        md:overflow-hidden
      "
    >
      <div
        className="
          flex
          min-h-[100svh]
          w-full
          flex-col
          md:h-full
          md:min-h-0
          md:flex-row
        "
      >
        <PortfolioSide
          title="Corporate"
          description="A refined presentation of professional work, achievements, collaborations, and selected corporate projects."
          image={homeData.corporate.image}
          href="/corporate"
          priority
          reduceMotion={reduceMotion}
        />

        <PortfolioSide
          title="Artist"
          description="A visual collection of artistic work, creative expression, selected projects, and personal practice."
          image={homeData.artist.image}
          href="/artist"
          reduceMotion={reduceMotion}
        />
      </div>

      {error && (
        <div className="pointer-events-none fixed bottom-5 left-1/2 z-50 -translate-x-1/2">
          <p className="text-[9px] uppercase tracking-[0.3em] text-white/30">
            Unable to load portfolio imagery
          </p>
        </div>
      )}
    </main>
  );
}

export default Home;
