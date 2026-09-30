"use client";
import Link from "next/link";
import { type ReactNode, useState, useEffect } from "react";
import NavLink from "./NavLink";
import { Menu, X } from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Close menu on resize to large screen
  useEffect(() => {
    const stored = localStorage.getItem("jeevraksha_user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Mobile Topbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-400 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">🐄</span>
          </div>
          <h2 className="text-xl font-extrabold bg-gradient-to-r from-violet-700 to-purple-500 bg-clip-text text-transparent">JeevRaksha</h2>
        </Link>
        <button onClick={toggleMenu} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 z-40 backdrop-blur-sm" 
          onClick={closeMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-72 bg-white border-r border-gray-200 flex flex-col fixed h-full z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-gray-100 hidden lg:flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-400 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">🐄</span>
          </div>
          <div>
            <Link href="/">
              <h2 className="text-xl font-extrabold bg-gradient-to-r from-violet-700 to-purple-500 bg-clip-text text-transparent">JeevRaksha</h2>
            </Link>
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mt-0.5">Surveillance System</p>
          </div>
        </div>

        {/* Mobile Spacer */}
        <div className="h-16 lg:hidden border-b border-gray-100 flex items-center px-5">
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Navigation Menu</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-bold uppercase text-gray-400 px-3 pt-2 pb-1 tracking-wider">Overview</p>
          <NavLink href="/dashboard" label="Dashboard" exact onClick={closeMenu} />

          {/* Veterinarian & Admin Features */}
          {user?.role !== "FARMER" && (
            <>
              <p className="text-xs font-bold uppercase text-gray-400 px-3 pt-5 pb-1 tracking-wider">Management</p>
              <NavLink href="/dashboard/cases" label="Cases" onClick={closeMenu} />
              <NavLink href="/dashboard/alerts" label="Alerts" onClick={closeMenu} />
              <NavLink href="/dashboard/map" label="Risk Map" onClick={closeMenu} />
              <NavLink href="/dashboard/lab" label="Lab Samples" onClick={closeMenu} />
            </>
          )}

          {/* Farmer & Admin Features */}
          {(user?.role === "FARMER" || user?.role === "ADMIN") && (
            <>
              <p className="text-xs font-bold uppercase text-gray-400 px-3 pt-5 pb-1 tracking-wider">Farmer Tools</p>
              <NavLink href="/farmer/report" label="Report Issue" onClick={closeMenu} />
              <NavLink href="/farmer/my-issues" label="My Issues" onClick={closeMenu} />
              <NavLink href="/farmer/chat" label="AI Assistant 🎙️" onClick={closeMenu} />
              <NavLink href="/farmer/animals/register" label="Register Animal" onClick={closeMenu} />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={() => {
              localStorage.removeItem("jeevraksha_user");
              window.location.href = "/";
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 lg:ml-72 min-h-screen pt-16 lg:pt-0 max-w-full overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
