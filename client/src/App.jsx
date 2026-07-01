import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { MoodBoardProvider } from "./context/MoodBoardContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AnimatedPage from "./components/common/AnimatedPage";

// Pages (Lazy Loaded)
const Home = lazy(() => import("./pages/Home"));
const Explore = lazy(() => import("./pages/Explore"));
const PoseDetail = lazy(() => import("./pages/PoseDetail"));
const AIRecommend = lazy(() => import("./pages/AIRecommend"));
const MoodBoardPage = lazy(() => import("./pages/MoodBoard"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Profile = lazy(() => import("./pages/Profile"));
const Admin = lazy(() => import("./pages/Admin"));

// Student Dashboard Pages & Layout
import StudentLayout from "./layouts/StudentLayout";
import Dashboard from "./pages/student/Dashboard";
import Team from "./pages/student/Team";
import Project from "./pages/student/Project";
import Status from "./pages/student/Status";
import Docs from "./pages/student/Docs";
import Schedule from "./pages/student/Schedule";

// 404 fallback page
const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-4 max-w-md mx-auto px-4 bg-[#FAFAF8]">
    <h1 className="font-serif text-5xl font-bold text-primary">404</h1>
    <h2 className="font-serif text-2xl font-bold text-textPrimary">Page Not Found</h2>
    <p className="text-sm text-textSecondary">
      The page you are looking for does not exist or has been moved to a new URL.
    </p>
    <a href="/" className="bg-primary hover:bg-primaryDark text-white text-xs font-semibold px-4 py-2 rounded-sm shadow-sm transition-colors">
      Go to Homepage
    </a>
  </div>
);

const RouteLoading = () => (
  <div className="flex justify-center items-center py-40 bg-[#FAFAF8] min-h-[50vh]">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
      <p className="text-sm text-textSecondary font-serif italic text-primary animate-pulse">Loading page...</p>
    </div>
  </div>
);

function AppContent() {
  const location = useLocation();
  
  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAF8]">
      <AnimatePresence mode="wait">
        <Suspense fallback={<RouteLoading />}>
          <Routes location={location} key={location.pathname}>
            {/* Main Portal Routes */}
            <Route path="/" element={<><Navbar /><main className="flex-grow flex flex-col"><AnimatedPage><Home /></AnimatedPage></main><Footer /></>} />
            <Route path="/explore" element={<><Navbar /><main className="flex-grow flex flex-col"><AnimatedPage><Explore /></AnimatedPage></main><Footer /></>} />
            <Route path="/pose/:id" element={<><Navbar /><main className="flex-grow flex flex-col"><AnimatedPage><PoseDetail /></AnimatedPage></main><Footer /></>} />
            <Route path="/ai-recommend" element={<><Navbar /><main className="flex-grow flex flex-col"><AnimatedPage><AIRecommend /></AnimatedPage></main><Footer /></>} />
            <Route
              path="/moodboard"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <main className="flex-grow flex flex-col">
                    <AnimatedPage>
                      <MoodBoardPage />
                    </AnimatedPage>
                  </main>
                  <Footer />
                </ProtectedRoute>
              }
            />
            <Route path="/moodboard/share/:token" element={<><Navbar /><main className="flex-grow flex flex-col"><AnimatedPage><MoodBoardPage /></AnimatedPage></main><Footer /></>} />
            <Route path="/login" element={<><Navbar /><main className="flex-grow flex flex-col"><AnimatedPage><Login /></AnimatedPage></main><Footer /></>} />
            <Route path="/signup" element={<><Navbar /><main className="flex-grow flex flex-col"><AnimatedPage><Signup /></AnimatedPage></main><Footer /></>} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <main className="flex-grow flex flex-col">
                    <AnimatedPage>
                      <Profile />
                    </AnimatedPage>
                  </main>
                  <Footer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <main className="flex-grow flex flex-col">
                    <AnimatedPage>
                      <Admin />
                    </AnimatedPage>
                  </main>
                  <Footer />
                </ProtectedRoute>
              }
            />

            {/* Student Dashboard Sub-routes */}
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="team" element={<Team />} />
              <Route path="project" element={<Project />} />
              <Route path="status" element={<Status />} />
              <Route path="documents" element={<Docs />} />
              <Route path="schedule" element={<Schedule />} />
            </Route>

            <Route path="*" element={<><Navbar /><main className="flex-grow flex flex-col"><AnimatedPage><NotFound /></AnimatedPage></main><Footer /></>} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </div>
  );
}


function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <MoodBoardProvider>
            <AppContent />
          </MoodBoardProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
