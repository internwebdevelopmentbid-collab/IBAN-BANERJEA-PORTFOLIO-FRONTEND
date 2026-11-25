import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import AdminGuard from "./components/AdminGuard";

const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminHome = lazy(() => import("./pages/AdminHome"));
const AdminPortfolio = lazy(() => import("./pages/AdminPortfolio"));
const AdminGallery = lazy(() => import("./pages/AdminGallery"));
const AdminContent = lazy(() => import("./pages/AdminContent"));

function AdminApp() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#080808] text-xs uppercase tracking-[0.3em] text-white/40">
          Loading...
        </div>
      }
    >
      <Routes>
        <Route path="login" element={<AdminLogin />} />

        <Route element={<AdminGuard />}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<AdminHome />} />
          <Route path="portfolio" element={<AdminPortfolio />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="content" element={<AdminContent />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default AdminApp;
