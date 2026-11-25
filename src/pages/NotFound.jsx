import { Link } from "react-router-dom";

function NotFound() {
  return (
    <main className="relative flex min-h-[calc(100vh-5rem)] items-center overflow-hidden px-6 py-24 text-white">
      <section className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="max-w-4xl">
          <div className="flex items-center gap-4">
            <span className="h-px w-10 bg-[#C9974B]" />

            <p className="text-[10px] uppercase tracking-[0.4em] text-[#C9974B]">
              Error 404
            </p>
          </div>

          <h1 className="mt-8 font-display text-[clamp(5rem,15vw,12rem)] font-medium uppercase leading-[0.8] tracking-[-0.075em] text-transparent bg-gradient-to-r from-[#F2D18A] via-[#C9974B] to-[#8A5E24] bg-clip-text">
            404
          </h1>

          <h2 className="mt-8 font-display text-3xl font-medium tracking-tight text-white sm:text-5xl">
            Page not found<span className="text-[#C9974B]">.</span>
          </h2>

          <p className="mt-6 max-w-lg text-sm leading-7 text-white/45 sm:text-base">
            The page you're looking for doesn't exist, may have been moved, or
            is temporarily unavailable.
          </p>

          <div className="mt-10">
            <Link
              to="/"
              className="group inline-flex items-center gap-5 border border-[#C9974B]/50 px-7 py-4 text-[10px] uppercase tracking-[0.25em] text-[#F2D18A] transition-all duration-300 hover:border-[#C9974B] hover:bg-[#C9974B] hover:text-black"
            >
              <span>Back to Home</span>

              <span className="text-lg transition-transform duration-300 group-hover:translate-x-2">
                →
              </span>
            </Link>
          </div>

          <div className="mt-20 h-px w-full max-w-2xl bg-gradient-to-r from-[#C9974B]/40 via-white/10 to-transparent" />

          <p className="mt-5 text-[9px] uppercase tracking-[0.3em] text-white/20">
            Iban Banerjea · Official Portfolio
          </p>
        </div>
      </section>
    </main>
  );
}

export default NotFound;
