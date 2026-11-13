import { AnimatePresence, motion } from "framer-motion";

function AdminNotice({ notice, onClose }) {
  return (
    <AnimatePresence>
      {notice && (
        <motion.div
          initial={{
            opacity: 0,
            y: -12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: -12,
          }}
          className={[
            "fixed right-5 top-5 z-[100] max-w-sm",
            "border px-5 py-4 shadow-2xl backdrop-blur-xl",
            notice.type === "error"
              ? "border-red-400/20 bg-red-950/85 text-red-200"
              : "border-[#C9974B]/25 bg-[#171109]/95 text-[#F4D58D]",
          ].join(" ")}
        >
          <div className="flex items-start gap-4">
            <p className="flex-1 text-xs leading-5">{notice.message}</p>

            <button
              type="button"
              onClick={onClose}
              className="text-white/35 transition-colors hover:text-white"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AdminNotice;
