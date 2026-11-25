import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { useAdminAuth } from "../context/AdminAuthContext";

import logo from "../../assets/Iban Sir.png";

const navigation = [
  {
    label: "Home",
    path: "/admin/home",
  },
  {
    label: "Portfolio",
    path: "/admin/portfolio",
  },
  {
    label: "Gallery",
    path: "/admin/gallery",
  },
  {
    label: "Content",
    path: "/admin/content",
  },
];

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-5 w-5"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-5 w-5"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-4 w-4"
    >
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M21 4v16" />
    </svg>
  );
}

function AdminLayout({ children }) {
  const { admin, logout } = useAdminAuth();

  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      await logout();

      navigate("/admin/login", {
        replace: true,
      });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-[#C9974B]/[0.035] blur-[150px]" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:70px_70px]" />
      </div>

      {/* Desktop sidebar */}

      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[250px] border-r border-white/[0.07] bg-[#070707]/95 backdrop-blur-xl lg:block">
        <div className="flex h-full flex-col">
          <div className="flex h-24 items-center border-b border-white/[0.07] px-8">
            <Link to="/admin/home">
              <img
                src={logo}
                alt="Iban"
                className="h-9 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="px-8 pt-10">
            <p className="text-[9px] uppercase tracking-[0.35em] text-[#C9974B]">
              Admin
            </p>

            <h1 className="mt-2 font-display text-xl text-white">
              Content Manager
            </h1>
          </div>

          <nav className="mt-12 flex flex-col gap-1 px-4">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  [
                    "group relative flex items-center px-4 py-3.5",
                    "text-[11px] uppercase tracking-[0.22em]",
                    "transition-all duration-300",
                    isActive
                      ? "bg-white/[0.055] text-[#F4D58D]"
                      : "text-white/45 hover:bg-white/[0.03] hover:text-white",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={[
                        "absolute left-0 top-1/2 h-5 w-px -translate-y-1/2",
                        isActive ? "bg-[#D9AA55]" : "bg-transparent",
                      ].join(" ")}
                    />

                    {item.label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto border-t border-white/[0.07] p-6">
            <div className="mb-5">
              <p className="text-[9px] uppercase tracking-[0.3em] text-white/30">
                Signed in as
              </p>

              <p className="mt-2 truncate text-sm text-white/75">
                {admin?.username || "Admin"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center justify-between border border-white/10 px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-white/50 transition-all duration-300 hover:border-[#C9974B]/40 hover:text-[#F4D58D] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span>{loggingOut ? "Logging out" : "Logout"}</span>

              <LogoutIcon />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}

      <div className="lg:pl-[250px]">
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-white/[0.07] bg-[#050505]/90 px-5 backdrop-blur-xl sm:px-8 lg:hidden">
          <Link to="/admin/home">
            <img src={logo} alt="Iban" className="h-8 w-auto object-contain" />
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center border border-white/10 text-white/70"
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </header>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              className="fixed left-0 right-0 top-20 z-40 border-b border-white/[0.07] bg-[#070707]/98 p-4 backdrop-blur-xl lg:hidden"
            >
              <nav className="flex flex-col gap-1">
                {navigation.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      [
                        "px-4 py-4 text-[10px] uppercase tracking-[0.25em]",
                        isActive
                          ? "bg-white/[0.05] text-[#F4D58D]"
                          : "text-white/50",
                      ].join(" ")
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="mt-3 flex w-full items-center justify-between border-t border-white/[0.07] px-4 py-4 text-[10px] uppercase tracking-[0.25em] text-white/40"
              >
                {loggingOut ? "Logging out" : "Logout"}

                <LogoutIcon />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
