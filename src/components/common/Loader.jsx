import { motion } from "framer-motion";
import logo from "../../assets/Iban Sir.png";

const GOLD = "#C9974B";

function Loader() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="
        fixed
        inset-0
        z-[9999]
        flex
        items-center
        justify-center
        overflow-hidden
        bg-black
      "
    >
      {/* ================================================================ */}
      {/* AMBIENT GOLD GLOW                                                */}
      {/* ================================================================ */}

      <motion.div
        className="
          pointer-events-none
          absolute
          h-[420px]
          w-[420px]
          rounded-full
          blur-[120px]
        "
        style={{
          background: `
            radial-gradient(
              circle,
              rgba(201,151,75,0.10) 0%,
              rgba(201,151,75,0.035) 35%,
              transparent 72%
            )
          `,
        }}
        animate={{
          scale: [0.9, 1.08, 0.9],
          opacity: [0.45, 0.8, 0.45],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* ================================================================ */}
      {/* LOADER CONTENT                                                   */}
      {/* ================================================================ */}

      <div className="relative z-10 flex flex-col items-center">
        {/* ============================================================= */}
        {/* LOGO                                                           */}
        {/* ============================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 18,
            scale: 0.96,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <motion.img
            src={logo}
            alt="Iban Banerjea"
            className="
              block
              h-auto
              w-[180px]
              object-contain

              sm:w-[220px]
              md:w-[250px]
            "
            animate={{
              opacity: [0.78, 1, 0.78],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* ============================================================= */}
        {/* LOADING LINE                                                    */}
        {/* ============================================================= */}

        <div
          className="
            mt-9
            h-px
            w-[150px]
            overflow-hidden
            bg-white/10
          "
        >
          <motion.div
            className="h-full origin-left"
            style={{
              backgroundColor: GOLD,
            }}
            initial={{
              scaleX: 0,
            }}
            animate={{
              scaleX: 1,
            }}
            transition={{
              duration: 1.8,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        </div>

        {/* ============================================================= */}
        {/* LOADING LABEL                                                   */}
        {/* ============================================================= */}

        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: [0.3, 0.65, 0.3],
          }}
          transition={{
            delay: 0.25,
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            mt-5
            font-sans
            text-[9px]
            font-medium
            uppercase
            tracking-[0.42em]
            text-white/50
          "
        >
          Entering Portfolio
        </motion.p>
      </div>
    </motion.div>
  );
}

export default Loader;
