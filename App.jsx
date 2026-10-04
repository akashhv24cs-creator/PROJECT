import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import Hero from "./Hero";
import HomeBookingSection from "./src/components/home/HomeBookingSection.jsx";
import AnimatedRoadScene from "./src/components/home/road/AnimatedRoadScene.jsx";
import Destinations from "./src/components/home/Destinations.jsx";
import WhyZenera from "./WhyZenera";
import Testimonials from "./Testimonials";
import HomeCTA from "./src/components/home/HomeCTA.jsx";
import Footer from "./Footer";
import Dashboard from "./src/pages/Dashboard.jsx";
import BookPage from "./src/pages/Book.jsx";
import BookingsPage from "./src/pages/Bookings.jsx";
import BookingDetailPage from "./src/pages/BookingDetail.jsx";
import DestinationsPage from "./src/pages/Destinations.jsx";
import DestinationDetailPage from "./src/pages/DestinationDetail.jsx";
import ProfilePage from "./src/pages/Profile.jsx";
import NotificationsPage from "./src/pages/Notifications.jsx";
import CheckoutPage from "./src/pages/Checkout.jsx";
import BookingConfirmationPage from "./src/pages/BookingConfirmation.jsx";
import CancellationRefundPage from "./src/pages/CancellationRefund.jsx";
import NotFoundPage from "./src/pages/NotFound.jsx";
import ErrorPage from "./src/pages/ErrorPage.jsx";
import OfflinePage from "./src/pages/Offline.jsx";
import ErrorBoundary from "./src/components/ErrorBoundary.jsx";
import Login from "./src/pages/Login.jsx";
import TourPackages from "./src/pages/TourPackages.jsx";
import PackageDetail from "./src/pages/PackageDetail.jsx";
import FirebaseTestPage from "./src/pages/FirebaseTestPage.jsx";
import ProtectedRoute from "./src/components/ProtectedRoute.jsx";
import FirebaseDevStatus from "./src/components/FirebaseDevStatus.jsx";
import OfflineBanner from "./src/components/pwa/OfflineBanner.jsx";
import InstallPrompt from "./src/components/pwa/InstallPrompt.jsx";
import AppDownloadPrompt from "./src/components/common/AppDownloadPrompt.jsx";
import ScrollToTop from "./src/components/common/ScrollToTop.jsx";
import { usePageSEO } from "./src/hooks/usePageSEO";
import { useGlobalScrollReveal } from "./src/hooks/useScrollReveal";
import { AuthProvider } from "./src/context/AuthContext";
import { ThemeProvider } from "./src/context/ThemeContext";

function HomePage() {
  usePageSEO({
    title: "Zenera Trips — Discover Destinations & Book Outstation Road Trips",
    description:
      "Explore top travel destinations, hill stations, beaches, pilgrimage sites and plan comfortable outstation cab journeys with verified drivers.",
    robots: "index, follow",
    canonical: "https://zenera-trips.web.app/",
  });

  return (
    <div className="min-h-screen selection:bg-orange selection:text-white bg-[#FFFBF7] dark:bg-[#07111F] text-charcoal dark:text-white flex flex-col justify-between transition-colors duration-200">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <HomeBookingSection />
        <AnimatedRoadScene />
        <Destinations />
        <WhyZenera />
        <Testimonials />
        <HomeCTA />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  useGlobalScrollReveal();

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <ErrorBoundary>
            <AppDownloadPrompt />
            <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/destinations" element={<DestinationsPage />} />
          <Route path="/destinations/:destinationId" element={<DestinationDetailPage />} />
          <Route path="/destination/:destinationId" element={<DestinationDetailPage />} />
          <Route path="/packages" element={<TourPackages />} />
          <Route path="/packages/:packageId" element={<PackageDetail />} />
          <Route path="/tour-packages" element={<TourPackages />} />
          <Route path="/tour-packages/:packageId" element={<PackageDetail />} />
          <Route path="/package/:packageId" element={<PackageDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/firebase-test" element={<FirebaseTestPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/fleets" element={<BookPage />} />
          <Route path="/fleet" element={<BookPage />} />
          <Route path="/book" element={<BookPage />} />
          <Route path="/book-trip" element={<BookPage />} />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <BookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/:bookingId"
            element={
              <ProtectedRoute>
                <BookingDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking/:bookingId"
            element={
              <ProtectedRoute>
                <BookingDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout/:bookingId"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/:bookingId"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pay/:bookingId"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/confirmation"
            element={
              <ProtectedRoute>
                <BookingConfirmationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/confirmation/:bookingId"
            element={
              <ProtectedRoute>
                <BookingConfirmationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking/confirmation/:bookingId"
            element={
              <ProtectedRoute>
                <BookingConfirmationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/:bookingId/confirmation"
            element={
              <ProtectedRoute>
                <BookingConfirmationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/:bookingId/cancel"
            element={
              <ProtectedRoute>
                <CancellationRefundPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/:bookingId/refund"
            element={
              <ProtectedRoute>
                <CancellationRefundPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cancellation"
            element={
              <ProtectedRoute>
                <CancellationRefundPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cancellation/:bookingId"
            element={
              <ProtectedRoute>
                <CancellationRefundPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/refund/:bookingId"
            element={
              <ProtectedRoute>
                <CancellationRefundPage />
              </ProtectedRoute>
            }
          />
          <Route path="/offline" element={<OfflinePage />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/500" element={<ErrorPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
          </ErrorBoundary>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
