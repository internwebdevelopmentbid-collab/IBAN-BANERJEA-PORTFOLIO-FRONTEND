import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import logo from "../../assets/Iban Sir.png";

import { useAdminAuth } from "../context/AdminAuthContext";

function EyeIcon({ visible }) {
  return visible ? (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-4 w-4"
    >
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-4 w-4"
    >
      <path d="M3 3l18 18" />
      <path d="M10.5 5.8A10.8 10.8 0 0 1 12 5.7c6.5 0 10 6.3 10 6.3a17 17 0 0 1-3.1 3.7" />
      <path d="M6.2 6.4C3.6 8.2 2 12 2 12s3.5 6.3 10 6.3c1.8 0 3.3-.4 4.6-1" />
    </svg>
  );
}

function AdminLogin() {
  const { admin, loading, login } = useAdminAuth();

  const navigate = useNavigate();

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && admin) {
      navigate("/admin/home", {
        replace: true,
      });
    }
  }, [admin, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]" />
    );
  }

  if (admin) {
    return <Navigate to="/admin/home" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError("");

    if (!username.trim() || !password) {
      setError("Username and password are required.");

      return;
    }

    setSubmitting(true);

    try {
      await login(username.trim(), password);

      navigate("/admin/home", {
        replace: true,
      });
    } catch (requestError) {
      setError(requestError?.message || "Unable to sign in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] px-5 py-10 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C9974B]/[0.035] blur-[140px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_75%)]" />
      </div>

      <motion.div
        initial={{
          opacity: 0,
          y: 25,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative z-10 w-full max-w-[430px]"
      >
        <div className="mb-10 flex justify-center">
          <img src={logo} alt="Iban" className="h-12 w-auto object-contain" />
        </div>

        <div className="border border-white/[0.08] bg-white/[0.018] p-7 backdrop-blur-xl sm:p-10">
          <div className="mb-9">
            <p className="text-[9px] uppercase tracking-[0.4em] text-[#C9974B]">
              Private Area
            </p>

            <h1 className="mt-4 font-display text-4xl tracking-[-0.04em]">
              Admin Login
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/35">
              Sign in to manage the website content.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="admin-username"
                className="mb-2 block text-[9px] uppercase tracking-[0.25em] text-white/35"
              >
                Username
              </label>

              <input
                id="admin-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="h-12 w-full border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-[#C9974B]/50"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="mb-2 block text-[9px] uppercase tracking-[0.25em] text-white/35"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 w-full border border-white/10 bg-black/30 px-4 pr-12 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-[#C9974B]/50"
                  placeholder="Enter password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-white/30 transition-colors hover:text-white/70"
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
            </div>

            {error && (
              <div className="border border-red-400/15 bg-red-950/20 px-4 py-3 text-xs leading-5 text-red-200/80">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex h-12 w-full items-center justify-center border border-[#C9974B]/50 bg-[#C9974B]/10 text-[10px] uppercase tracking-[0.3em] text-[#F4D58D] transition-all duration-300 hover:bg-[#C9974B]/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[9px] uppercase tracking-[0.25em] text-white/20">
          Iban · Administration
        </p>
      </motion.div>
    </div>
  );
}

export default AdminLogin;
