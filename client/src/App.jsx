import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { MoodBoardProvider } from "./context/MoodBoardContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ProtectedRoute from "./components/layout/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import PoseDetail from "./pages/PoseDetail";
import AIRecommend from "./pages/AIRecommend";
import MoodBoardPage from "./pages/MoodBoard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";

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

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <MoodBoardProvider>
            <div className="flex flex-col min-h-screen bg-[#FAFAF8]">
              <Routes>
                {/* Main Portal Routes */}
                <Route path="/" element={<><Navbar /><main className="flex-grow flex flex-col"><Home /></main><Footer /></>} />
                <Route path="/explore" element={<><Navbar /><main className="flex-grow flex flex-col"><Explore /></main><Footer /></>} />
                <Route path="/pose/:id" element={<><Navbar /><main className="flex-grow flex flex-col"><PoseDetail /></main><Footer /></>} />
                <Route path="/ai-recommend" element={<><Navbar /><main className="flex-grow flex flex-col"><AIRecommend /></main><Footer /></>} />
                <Route
                  path="/moodboard"
                  element={
                    <ProtectedRoute>
                      <Navbar />
                      <main className="flex-grow flex flex-col">
                        <MoodBoardPage />
                      </main>
                      <Footer />
                    </ProtectedRoute>
                  }
                />
                <Route path="/moodboard/share/:token" element={<><Navbar /><main className="flex-grow flex flex-col"><MoodBoardPage /></main><Footer /></>} />
                <Route path="/login" element={<><Navbar /><main className="flex-grow flex flex-col"><Login /></main><Footer /></>} />
                <Route path="/signup" element={<><Navbar /><main className="flex-grow flex flex-col"><Signup /></main><Footer /></>} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Navbar />
                      <main className="flex-grow flex flex-col">
                        <Profile />
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
                        <Admin />
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

                <Route path="*" element={<><Navbar /><main className="flex-grow flex flex-col"><NotFound /></main><Footer /></>} />
              </Routes>
            </div>
          </MoodBoardProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
