import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Routes, Route, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Corporate from "./pages/Corporate";
import Artist from "./pages/Artist";
import CorporateGallery from "./pages/CorporateGallery";
import ArtistGallery from "./pages/ArtistGallery";
import CompanyArchives from "./pages/CompanyArchives";
import NotFound from "./pages/NotFound";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import BackgroundMesh from "./components/common/BackgroundMesh";
import Loader from "./components/common/Loader";

import AdminApp from "./admin/AdminApp";
import { AdminAuthProvider } from "./admin/context/AdminAuthContext";

/* -------------------------------------------------------------------------- */
/* SCROLL TO TOP                                                              */
/* -------------------------------------------------------------------------- */

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}

/* -------------------------------------------------------------------------- */
/* PUBLIC PAGE LAYOUT                                                         */
/* -------------------------------------------------------------------------- */

function PublicLayout({ children }) {
  return (
    <div className="relative isolate min-h-screen w-full overflow-x-clip bg-black text-white">
      <BackgroundMesh />

      <div className="relative z-10 flex min-h-screen w-full flex-col">
        <Navbar />

        <main className="relative z-10 w-full flex-1">{children}</main>

        <Footer />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* HOME PAGE LAYOUT                                                           */
/* -------------------------------------------------------------------------- */

function HomeLayout() {
  return (
    <div className="relative min-h-screen w-full overflow-x-clip bg-black text-white">
      <main className="relative w-full">
        <Home />
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* PUBLIC ROUTES                                                              */
/* -------------------------------------------------------------------------- */

function PublicRoutes() {
  return (
    <Routes>
      {/* HOME - NO BACKGROUND MESH OR FOOTER */}

      <Route path="/" element={<HomeLayout />} />

      {/* CORPORATE */}

      <Route
        path="/corporate"
        element={
          <PublicLayout>
            <Corporate />
          </PublicLayout>
        }
      />

      {/* CORPORATE GALLERY */}

      <Route
        path="/corporate/gallery"
        element={
          <PublicLayout>
            <CorporateGallery />
          </PublicLayout>
        }
      />

      {/* COMPANY ARCHIVES */}

      <Route
        path="/company-archives"
        element={
          <PublicLayout>
            <CompanyArchives />
          </PublicLayout>
        }
      />

      {/* ARTIST */}

      <Route
        path="/artist"
        element={
          <PublicLayout>
            <Artist />
          </PublicLayout>
        }
      />

      {/* ARTIST GALLERY */}

      <Route
        path="/artist/gallery"
        element={
          <PublicLayout>
            <ArtistGallery />
          </PublicLayout>
        }
      />

      {/* NOT FOUND */}

      <Route
        path="*"
        element={
          <PublicLayout>
            <NotFound />
          </PublicLayout>
        }
      />
    </Routes>
  );
}

/* -------------------------------------------------------------------------- */
/* MAIN APP                                                                   */
/* -------------------------------------------------------------------------- */

function App() {
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");

  /* ------------------------------------------------------------------------ */
  /* INITIAL LOADER                                                           */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (isAdminRoute) {
      return;
    }

    const timer = window.setTimeout(() => {
      setLoading(false);
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [isAdminRoute]);

  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <>
      {/* LOADER */}

      {!isAdminRoute && (
        <AnimatePresence mode="wait">{loading && <Loader />}</AnimatePresence>
      )}

      {/* SCROLL RESTORATION */}

      <ScrollToTop />

      {/* ROUTES */}

      <Routes location={location}>
        {/* ADMIN */}

        <Route
          path="/admin/*"
          element={
            <AdminAuthProvider>
              <AdminApp />
            </AdminAuthProvider>
          }
        />

        {/* PUBLIC WEBSITE */}

        <Route path="*" element={<PublicRoutes />} />
      </Routes>
    </>
  );
}

export default App;
