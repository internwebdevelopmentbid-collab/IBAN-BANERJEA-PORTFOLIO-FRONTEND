import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAdminAuth } from "../context/AdminAuthContext";

function AdminGuard() {
  const { loading, isAuthenticated } = useAdminAuth();

  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <div className="flex flex-col items-center gap-5">
          <div className="h-8 w-8 animate-spin rounded-full border border-white/10 border-t-[#D9AA55]" />

          <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">
            Loading
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return <Outlet />;
}

export default AdminGuard;
