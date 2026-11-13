import { useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../../assets/Iban Sir.png";

const navItems = [
  {
    label: "CORPORATE",
    path: "/corporate",
  },
  {
    label: "ARTIST",
    path: "/artist",
  },
];

function Navbar({ overlay = false }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className={`
        z-50
        pr-3
        pl-0
        sm:px-6
        lg:px-10
        ${overlay ? "absolute left-0 right-0 top-4" : "sticky top-4"}
      `}
    >
      <div className="mx-auto max-w-7xl">
        <div
          className="
            relative
            flex
            h-auto
            items-center
            justify-end
            rounded-none
            border-0
            bg-transparent
            p-0
            shadow-none
            backdrop-blur-none
            sm:h-16
            sm:justify-between
            sm:rounded-full
            sm:border
            sm:border-white/10
            sm:bg-white/[0.045]
            sm:px-5
            sm:shadow-[0_8px_40px_rgba(0,0,0,0.28)]
            sm:backdrop-blur-xl
            sm:backdrop-saturate-150
            sm:px-7
          "
        >
          {/* LOGO - DESKTOP ONLY */}

          <NavLink
            to="/"
            className="hidden items-center sm:flex"
            aria-label="Iban Banerjea — Home"
          >
            <img
              src={logo}
              alt="Iban Banerjea"
              className="
                h-10
                w-auto
                object-contain
                sm:h-11
              "
            />
          </NavLink>

          {/* DESKTOP NAVIGATION */}

          <nav className="hidden items-center gap-2 sm:flex sm:gap-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className="
                  relative
                  rounded-full
                  px-4
                  py-2
                  text-[11px]
                  font-medium
                  tracking-[0.18em]
                  transition-all
                  duration-300
                  sm:px-5
                "
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={
                        isActive
                          ? "text-[#d9aa55]"
                          : "text-white/60 hover:text-white"
                      }
                    >
                      {item.label}
                    </span>

                    <span
                      className={`
                        absolute
                        bottom-1
                        left-1/2
                        h-px
                        -translate-x-1/2
                        bg-[#d9aa55]
                        transition-all
                        duration-300
                        ${isActive ? "w-5 opacity-100" : "w-0 opacity-0"}
                      `}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* MOBILE HAMBURGER BUTTON */}

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              text-white
              transition-colors
              duration-300
              hover:bg-white/10
              sm:hidden
            "
          >
            <span className="relative flex h-5 w-5 flex-col items-center justify-center">
              <span
                className={`
                  absolute
                  h-px
                  w-5
                  bg-current
                  transition-all
                  duration-300
                  ${menuOpen ? "translate-y-0 rotate-45" : "-translate-y-1.5"}
                `}
              />

              <span
                className={`
                  absolute
                  h-px
                  w-5
                  bg-current
                  transition-all
                  duration-300
                  ${menuOpen ? "opacity-0" : "opacity-100"}
                `}
              />

              <span
                className={`
                  absolute
                  h-px
                  w-5
                  bg-current
                  transition-all
                  duration-300
                  ${menuOpen ? "translate-y-0 -rotate-45" : "translate-y-1.5"}
                `}
              />
            </span>
          </button>
        </div>

        {/* MOBILE NAVIGATION MENU */}

        <div
          className={`
            absolute
            right-3
            top-[calc(100%+0.5rem)]
            w-48
            overflow-hidden
            rounded-2xl
            border
            border-white/10
            bg-[#111111]/95
            shadow-[0_8px_40px_rgba(0,0,0,0.35)]
            backdrop-blur-xl
            transition-all
            duration-300
            sm:hidden
            ${
              menuOpen
                ? "visible translate-y-0 opacity-100"
                : "invisible -translate-y-2 opacity-0"
            }
          `}
        >
          <nav className="flex flex-col p-3">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => `
                  rounded-xl
                  px-5
                  py-4
                  text-[11px]
                  font-medium
                  tracking-[0.18em]
                  transition-colors
                  duration-300
                  ${
                    isActive
                      ? "bg-white/[0.06] text-[#d9aa55]"
                      : "text-white/60 hover:bg-white/[0.04] hover:text-white"
                  }
                `}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
