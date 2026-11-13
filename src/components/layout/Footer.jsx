import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";

import logo from "../../assets/Iban Sir.png";

/* -------------------------------------------------------------------------- */
/* ANIMATION                                                                  */
/* -------------------------------------------------------------------------- */

const footerStagger = {
  hidden: {},

  visible: {
    transition: {
      delayChildren: 0.12,
      staggerChildren: 0.08,
    },
  },
};

const footerItem = {
  hidden: {
    opacity: 0,
    y: 22,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* -------------------------------------------------------------------------- */
/* SOCIAL ICONS                                                               */
/* -------------------------------------------------------------------------- */

const InstagramIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className="h-[18px] w-[18px]"
  >
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="5"
      stroke="currentColor"
      strokeWidth="1.6"
    />

    <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />

    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
  </svg>
);

const FacebookIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className="h-[18px] w-[18px]"
  >
    <rect
      x="2.5"
      y="5"
      width="19"
      height="14"
      rx="5"
      stroke="currentColor"
      strokeWidth="1.6"
    />

    <path d="M10 9V15L15 12L10 9Z" fill="currentColor" />
  </svg>
);

const VentureIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className="h-[18px] w-[18px]"
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />

    <path d="M3 12H21" stroke="currentColor" strokeWidth="1.6" />

    <path
      d="M12 3C14.5 5.5 15.5 8.7 15.5 12C15.5 15.3 14.5 18.5 12 21"
      stroke="currentColor"
      strokeWidth="1.6"
    />

    <path
      d="M12 3C9.5 5.5 8.5 8.7 8.5 12C8.5 15.3 9.5 18.5 12 21"
      stroke="currentColor"
      strokeWidth="1.6"
    />
  </svg>
);

/* -------------------------------------------------------------------------- */
/* SOCIAL LINK                                                                */
/* -------------------------------------------------------------------------- */

const SocialLink = ({ href, label, icon }) => {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      initial="rest"
      whileHover="hover"
      className="
        group
        flex
        w-full
        max-w-[180px]
        items-center
        justify-between
        border-b
        border-white/10
        pb-[10px]
        font-sans
        text-white/70
        transition-colors
        duration-300
        hover:border-white/30
        hover:text-white
      "
    >
      <span className="flex min-w-0 items-center gap-3">
        <motion.span
          variants={{
            rest: {
              rotate: 0,
              x: 0,
              y: 0,
              scale: 1,
            },

            hover: {
              rotate: [0, -7, 7, -5, 5, 0],
              x: [0, -1, 1, -1, 1, 0],
              y: [0, 1, -1, 1, -1, 0],
              scale: [1, 1.05, 1],
              transition: {
                duration: 0.5,
                ease: "easeInOut",
              },
            },
          }}
          className="
            flex
            h-[34px]
            w-[34px]
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-white/10
            text-white/70
            transition-colors
            duration-300
            group-hover:border-white/30
            group-hover:bg-[#d9aa55]
            group-hover:text-black
          "
        >
          {icon}
        </motion.span>

        <span className="font-medium text-[14px]">{label}</span>
      </span>

      <motion.span
        variants={{
          rest: {
            opacity: 0.4,
            x: 0,
            y: 0,
          },

          hover: {
            opacity: 1,
            x: 3,
            y: -3,
            transition: {
              duration: 0.25,
              ease: "easeOut",
            },
          },
        }}
        className="ml-3 shrink-0 text-[16px] text-white/60"
      >
        ↗
      </motion.span>
    </motion.a>
  );
};

/* -------------------------------------------------------------------------- */
/* FOOTER                                                                     */
/* -------------------------------------------------------------------------- */

const Footer = () => {
  const revealRef = useRef(null);

  /* SCROLL REVEAL */

  const { scrollYProgress } = useScroll({
    target: revealRef,
    offset: ["start end", "end end"],
  });

  const progress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    mass: 0.7,
  });

  const clipPath = useTransform(
    progress,
    [0, 0.08, 0.25, 0.5, 0.75, 1],
    [
      "inset(100% 0% 0% 0%)",
      "inset(92% 0% 0% 0%)",
      "inset(75% 0% 0% 0%)",
      "inset(50% 0% 0% 0%)",
      "inset(25% 0% 0% 0%)",
      "inset(0% 0% 0% 0%)",
    ],
  );

  const footerOpacity = useTransform(
    progress,
    [0, 0.15, 0.4, 1],
    [0.75, 0.9, 0.98, 1],
  );

  return (
    <section ref={revealRef} className="relative z-0 w-full shrink-0">
      <motion.footer
        style={{
          clipPath,
          opacity: footerOpacity,
        }}
        className="
          relative
          w-full
          overflow-hidden
          border-t
          border-white/10
          bg-[#080808]
          text-white
        "
      >
        {/* GOLDEN TOP ACCENT */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            left-0
            right-0
            top-0
            z-20
            h-[1px]
            bg-gradient-to-r
            from-transparent
            via-[#D4A62A]
            to-transparent
            shadow-[0_0_12px_rgba(212,166,42,0.55)]
          "
        />

        {/* AMBIENT BACKGROUND */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.035),transparent_55%)]
          "
        />

        {/* CONTENT */}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.02,
          }}
          variants={footerStagger}
          className="
            relative
            z-10
            mx-auto
            w-[calc(100%-32px)]
            max-w-[1400px]
            sm:w-[calc(100%-48px)]
            md:w-[calc(100%-64px)]
            lg:w-[calc(100%-96px)]
            xl:w-[calc(100%-120px)]
          "
        >
          {/* MAIN CONTENT */}

          <div
            className="
              grid
              grid-cols-1
              gap-[45px]
              py-[55px]
              sm:gap-[55px]
              sm:py-[65px]
              lg:grid-cols-[1.1fr_2.9fr]
              lg:gap-[60px]
              lg:py-[70px]
              xl:grid-cols-[1.15fr_3fr]
              xl:gap-[90px]
              xl:py-[75px]
            "
          >
            {/* BRAND */}

            <motion.div
              variants={footerItem}
              className="
                w-full
                max-w-[520px]
                lg:max-w-[360px]
                xl:max-w-[390px]
              "
            >
              <Link
                to="/"
                aria-label="Iban Banerjea"
                className="inline-flex items-center"
              >
                <img
                  src={logo}
                  alt="Iban Banerjea"
                  className="
                    block
                    h-auto
                    w-auto
                    max-h-[48px]
                    max-w-[175px]
                    object-contain
                    opacity-90
                    sm:max-h-[52px]
                    sm:max-w-[190px]
                    lg:max-h-[50px]
                    lg:max-w-[185px]
                  "
                />
              </Link>

              <p
                className="
                  mt-[20px]
                  max-w-[430px]
                  font-sans
                  text-[14px]
                  font-medium
                  leading-[1.7]
                  text-white/45
                  sm:mt-[24px]
                  sm:text-[15px]
                  lg:mt-[26px]
                "
              >
                A visual portfolio showcasing corporate work, artistic practice,
                and selected projects.
              </p>
            </motion.div>

            {/* NAVIGATION */}

            <div
              className="
                grid
                grid-cols-2
                gap-x-[35px]
                gap-y-[40px]
                sm:grid-cols-2
                sm:gap-x-[45px]
                md:grid-cols-2
                lg:grid-cols-2
                lg:gap-x-[70px]
                xl:gap-x-[90px]
              "
            >
              {/* EXPLORE */}

              <motion.div
                variants={footerItem}
                className="flex min-w-0 flex-col"
              >
                <h3
                  className="
                    mb-[20px]
                    font-sans
                    text-[10px]
                    font-bold
                    tracking-[0.2em]
                    text-white/80
                    sm:mb-[25px]
                    sm:text-[11px]
                  "
                >
                  EXPLORE
                </h3>

                <div className="flex flex-col items-start gap-[14px] sm:gap-[16px]">
                  {[
                    ["Home", "/"],
                    ["Corporate", "/corporate"],
                    ["Artist", "/artist"],
                  ].map(([label, path]) => (
                    <Link
                      key={path}
                      to={path}
                      className="
                        group
                        relative
                        font-sans
                        text-[13px]
                        font-medium
                        leading-[1.4]
                        text-white/45
                        transition-all
                        duration-300
                        hover:translate-x-2
                        hover:text-[#d9aa55]
                        sm:text-[14px]
                      "
                    >
                      <span
                        className="
                          absolute
                          -left-[16px]
                          top-1/2
                          h-px
                          w-0
                          -translate-y-1/2
                          bg-white/70
                          transition-all
                          duration-300
                          group-hover:w-[8px]
                        "
                      />

                      {label}
                    </Link>
                  ))}
                </div>
              </motion.div>

              {/* FOLLOW */}

              <motion.div
                variants={footerItem}
                className="flex min-w-0 flex-col"
              >
                <h3
                  className="
                    mb-[20px]
                    font-sans
                    text-[10px]
                    font-bold
                    tracking-[0.2em]
                    text-white/80
                    sm:mb-[25px]
                    sm:text-[11px]
                  "
                >
                  DO VISIT
                </h3>

                <div className="flex flex-col gap-[12px] sm:gap-[14px]">
                  <SocialLink
                    href="https://www.instagram.com/ibanbanerjea/"
                    label="Instagram"
                    icon={<InstagramIcon />}
                  />

                  <SocialLink
                    href="https://www.youtube.com/@IbanBanerjeaOfficial"
                    label="YouTube"
                    icon={<FacebookIcon />}
                  />

                  <SocialLink
                    href="https://beingiban.co.in/"
                    label="Being Iban & Companies"
                    icon={<VentureIcon />}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.footer>
    </section>
  );
};

export default Footer;
