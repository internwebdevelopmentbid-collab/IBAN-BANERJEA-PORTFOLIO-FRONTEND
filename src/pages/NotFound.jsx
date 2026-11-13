import { Link } from "react-router-dom";

function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-10rem)] items-center px-6 py-20">
      <section className="mx-auto w-full max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-black/50">
            Error 404
          </p>

          <h1 className="mt-5 text-7xl font-semibold tracking-tight sm:text-8xl lg:text-9xl">
            Not Found
          </h1>

          <p className="mt-8 max-w-xl text-base leading-7 text-black/60 sm:text-lg">
            The page you are looking for does not exist or may have been moved.
          </p>

          <Link
            to="/"
            className="mt-10 inline-flex border border-black bg-black px-8 py-4 text-sm uppercase tracking-[0.15em] text-white transition-colors duration-300 hover:bg-white hover:text-black"
          >
            Back Home
          </Link>
        </div>
      </section>
    </main>
  );
}

export default NotFound;
