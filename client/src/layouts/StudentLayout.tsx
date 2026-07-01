import React, { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  CheckSquare, 
  FileText, 
  Calendar, 
  Bell, 
  Menu, 
  X,
  LogOut,
  GraduationCap
} from "lucide-react";

interface SidebarLink {
  name: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const StudentLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const links: SidebarLink[] = [
    { name: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
    { name: "Team", path: "/student/team", icon: Users },
    { name: "Project", path: "/student/project", icon: BookOpen },
    { name: "Status", path: "/student/status", icon: CheckSquare },
    { name: "Documents", path: "/student/documents", icon: FileText },
    { name: "Schedule", path: "/student/schedule", icon: Calendar },
  ];

  return (
    <div className="flex h-screen bg-[#F4F6F9] font-sans overflow-hidden">
      {/* Desktop Sidebar (Navy Background, White Text) */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0B132B] text-white shrink-0 shadow-xl">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-[#1C2541]">
          <div className="bg-[#FF6B35] p-1.5 rounded-sm">
            <GraduationCap className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide uppercase">Workspace</h1>
            <p className="text-[10px] text-gray-400">Student Portal 2.0</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => 
                `flex items-center gap-3.5 px-6 py-3.5 text-sm font-medium transition-all duration-150 relative group ${
                  isActive 
                    ? "bg-[#1C2541] text-white border-l-4 border-[#FF6B35]" 
                    : "text-gray-400 hover:text-white hover:bg-[#1C2541]/50"
                }`
              }
            >
              <link.icon size={18} />
              <span>{link.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer logout stub */}
        <div className="p-4 border-t border-[#1C2541]">
          <a
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:text-white rounded-sm hover:bg-[#1C2541] transition-colors"
          >
            <LogOut size={16} />
            <span>Exit Workspace</span>
          </a>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-[#0B132B]/60 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Slide-out Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-[#0B132B] text-white transition-transform duration-300 transform lg:hidden ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1C2541]">
          <div className="flex items-center gap-3">
            <div className="bg-[#FF6B35] p-1.5 rounded-sm">
              <GraduationCap className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide uppercase">Workspace</h1>
              <p className="text-[10px] text-gray-400">Student Portal 2.0</p>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-white focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-6 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => 
                `flex items-center gap-3.5 px-6 py-3.5 text-sm font-medium transition-all duration-150 relative ${
                  isActive 
                    ? "bg-[#1C2541] text-white border-l-4 border-[#FF6B35]" 
                    : "text-gray-400 hover:text-white hover:bg-[#1C2541]/50"
                }`
              }
            >
              <link.icon size={18} />
              <span>{link.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#1C2541]">
          <a
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:text-white rounded-sm hover:bg-[#1C2541] transition-colors"
          >
            <LogOut size={16} />
            <span>Exit Workspace</span>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header navbar bar */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white border-b border-gray-200 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-1 text-gray-500 rounded-sm hover:bg-gray-100 lg:hidden focus:outline-none"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-bold text-gray-800 tracking-tight">
              {links.find((l) => l.path === location.pathname)?.name || "Dashboard"}
            </h2>
          </div>

          {/* Quick Info bar */}
          <div className="flex items-center gap-4">
            <button className="p-1.5 text-gray-500 rounded-full hover:bg-gray-100 relative focus:outline-none">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF6B35] rounded-full" />
            </button>
            <div className="h-6 w-[1px] bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                RK
              </div>
              <span className="hidden sm:inline text-xs font-medium text-gray-700">Rajesh (Leader)</span>
            </div>
          </div>
        </header>

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
