import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import AdminGuard from "./components/AdminGuard";
import AdminLayout from "./components/AdminLayout";

const AdminLogin = lazy(() => import("./pages/AdminLogin"));

const AdminHome = lazy(() => import("./pages/AdminHome"));

const AdminPortfolio = lazy(() => import("./pages/AdminPortfolio"));

const AdminGallery = lazy(() => import("./pages/AdminGallery"));

function AdminLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
      <div className="text-center">
        <div className="mx-auto h-6 w-6 animate-spin rounded-full border border-white/10 border-t-[#C9974B]" />

        <p className="mt-5 text-[9px] uppercase tracking-[0.3em] text-white/30">
          Loading
        </p>
      </div>
    </div>
  );
}

function AdminApp() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <Routes>
        <Route path="login" element={<AdminLogin />} />

        <Route
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route index element={<Navigate to="home" replace />} />

          <Route path="home" element={<AdminHome />} />

          <Route path="portfolio" element={<AdminPortfolio />} />

          <Route path="gallery" element={<AdminGallery />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default AdminApp;
