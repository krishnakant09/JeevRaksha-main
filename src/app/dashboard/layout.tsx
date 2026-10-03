"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useState, useEffect } from "react";
import NavLink from "./NavLink";
import {
  Menu,
  X,
  LayoutDashboard,
  MapPin,
  Activity,
  ShieldAlert,
  FlaskConical,
  PlusCircle,
  FileText,
  Bot,
  LogOut,
  Shield,
  Sparkles,
  Home,
  Stethoscope
} from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("jeevraksha_user");
    if (!stored) {
      const redirectUrl = window.location.pathname + window.location.search;
      router.replace(`/login?role=vet&redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      setLoadingAuth(false);
    } catch (e) {
      console.error(e);
      localStorage.removeItem("jeevraksha_user");
      router.replace("/login?role=vet");
    }

    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [router]);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("jeevraksha_user");
    window.location.href = "/";
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#F6F8FA] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20 animate-pulse text-2xl">
          🩺
        </div>
        <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-bold text-gray-800">Verifying Doctor / Official Credentials...</p>
        <p className="text-xs text-gray-400 mt-1">JeevRaksha Command Center Security</p>
      </div>
    );
  }

  // If user is a farmer, doctor portal triage requires doctor account
  if (user && user.role === "FARMER") {
    return (
      <div className="min-h-screen bg-[#F6F8FA] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full border border-gray-200 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto text-3xl">
            🩺
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
              Doctor & Officer Portal
            </span>
            <h2 className="text-lg font-extrabold text-gray-900 mt-2">Doctor Login Required</h2>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              You are currently signed in as a <strong>Farmer</strong> ({user.email}). Case triage, diagnostic samples, and outbreak controls require a <strong>Veterinarian</strong> or <strong>Administrator</strong> login.
            </p>
          </div>
          <div className="pt-2 space-y-2">
            <button
              onClick={() => {
                localStorage.removeItem("jeevraksha_user");
                router.push("/login?role=vet&redirect=/dashboard/cases");
              }}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs transition shadow-sm"
            >
              Sign In with Doctor Account (vet@jeevraksha.in)
            </button>
            <Link
              href="/farmer/report"
              className="block w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition"
            >
              Back to Farmer Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F6F8FA] overflow-x-hidden text-gray-900 font-sans">
      {/* Mobile Topbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-gray-200 z-50 flex items-center justify-between px-4 shadow-xs">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-xs">
            <span className="text-sm">🐄</span>
          </div>
          <div>
            <h2 className="text-base font-extrabold text-gray-900 leading-none">JeevRaksha</h2>
            <span className="text-[10px] font-bold text-violet-600">Admin Command</span>
          </div>
        </Link>
        <button
          onClick={toggleMenu}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-xs transition-opacity"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-72 bg-white border-r border-gray-200/80 flex flex-col fixed h-full z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-tr from-violet-700 via-indigo-600 to-purple-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform">
              <span className="text-base">🐄</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-gray-900">JeevRaksha</span>
                <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-violet-100 text-violet-700">
                  Grid
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">Surveillance Command Center</p>
            </div>
          </Link>
        </div>

        {/* User Card */}
        <div className="p-3.5 mx-3 mt-3 rounded-xl bg-gradient-to-r from-violet-50/80 to-indigo-50/50 border border-violet-100/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-violet-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-gray-900 truncate">
                {user?.name || "Official Administrator"}
              </p>
              <Shield className="w-3 h-3 text-violet-600 shrink-0" />
            </div>
            <p className="text-[10px] font-semibold text-violet-700 uppercase tracking-wide">
              {user?.role || "ADMIN / OFFICER"}
            </p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-black uppercase text-gray-400 px-3 pt-2 pb-1 tracking-wider">
            Surveillance Telemetry
          </p>
          <NavLink
            href="/dashboard"
            label="Command Center"
            icon={LayoutDashboard}
            exact
            onClick={closeMenu}
          />
          <NavLink
            href="/dashboard/map"
            label="Geospatial Outbreak Map"
            icon={MapPin}
            badge="LIVE"
            badgeColor="bg-emerald-100 text-emerald-700"
            onClick={closeMenu}
          />

          <p className="text-[10px] font-black uppercase text-gray-400 px-3 pt-4 pb-1 tracking-wider">
            Operations & Triage
          </p>
          <NavLink
            href="/dashboard/cases"
            label="Case Management"
            icon={Activity}
            onClick={closeMenu}
          />
          <NavLink
            href="/dashboard/alerts"
            label="Priority Alerts"
            icon={ShieldAlert}
            badgeColor="bg-red-100 text-red-700"
            onClick={closeMenu}
          />
          <NavLink
            href="/dashboard/lab"
            label="Diagnostic Samples"
            icon={FlaskConical}
            onClick={closeMenu}
          />

          <p className="text-[10px] font-black uppercase text-gray-400 px-3 pt-4 pb-1 tracking-wider">
            Farmer & Field Integration
          </p>
          <NavLink
            href="/farmer/chat"
            label="AI Vet Voice Assistant"
            icon={Bot}
            badge="Sarvam AI"
            badgeColor="bg-purple-100 text-purple-700"
            onClick={closeMenu}
          />
          <NavLink
            href="/farmer/report"
            label="Submit Disease Report"
            icon={PlusCircle}
            onClick={closeMenu}
          />
          <NavLink
            href="/farmer/my-issues"
            label="Farmer Reports Feed"
            icon={FileText}
            onClick={closeMenu}
          />
          <NavLink
            href="/farmer/animals"
            label="Livestock Registry"
            icon={Home}
            onClick={closeMenu}
          />
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-100 bg-gray-50/70">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-bold text-gray-600 hover:text-red-600 hover:bg-red-50/80 rounded-lg transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-72 min-h-screen pt-16 lg:pt-0 max-w-full overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
