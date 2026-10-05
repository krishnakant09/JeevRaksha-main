"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
  LogOut,
  Shield,
  Stethoscope,
  UserCheck,
  AlertTriangle,
  Clock,
  Lock,
  ArrowRight
} from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Route groupings
  const isDoctorRoute =
    pathname.startsWith("/dashboard/cases") ||
    pathname.startsWith("/dashboard/alerts") ||
    pathname.startsWith("/dashboard/lab");

  const isAdminRoute =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/map") ||
    pathname.startsWith("/dashboard/approvals");

  // User role definitions
  const isDoctor = user?.role === "VETERINARIAN";
  const isAdmin =
    user &&
    (user.role === "ADMIN" ||
      user.role === "STATE_OFFICER" ||
      user.role === "DISTRICT_OFFICER" ||
      user.role === "TALUKA_OFFICER");
  const isFarmer = user?.role === "FARMER";

  useEffect(() => {
    const stored =
      localStorage.getItem("pashurakshak_user") ||
      localStorage.getItem("jeevraksha_user");
    if (!stored) {
      const redirectUrl = window.location.pathname + window.location.search;
      if (isDoctorRoute) {
        router.replace(`/login?role=vet&redirect=${encodeURIComponent(redirectUrl)}`);
      } else {
        router.replace(`/login?role=admin&redirect=${encodeURIComponent(redirectUrl)}`);
      }
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      setLoadingAuth(false);
    } catch (e) {
      console.error(e);
      localStorage.removeItem("jeevraksha_user");
      router.replace("/login");
    }

    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [router, isDoctorRoute]);

  // Strict route redirect enforcement
  useEffect(() => {
    if (loadingAuth || !user) return;

    // If an Admin or Officer lands on a Doctor route, redirect them to Admin Command Center
    if (isAdmin && isDoctorRoute) {
      router.replace("/dashboard");
      return;
    }

    // If an approved Doctor lands on an Admin route, redirect them to Doctor Case Management
    if (isDoctor && user.status === "APPROVED" && isAdminRoute) {
      router.replace("/dashboard/cases");
      return;
    }

    // If a Farmer lands on any dashboard route, redirect to Farmer Portal
    if (isFarmer) {
      router.replace("/farmer/report");
      return;
    }
  }, [loadingAuth, user, isDoctor, isAdmin, isFarmer, isDoctorRoute, isAdminRoute, router]);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("pashurakshak_user");
    localStorage.removeItem("jeevraksha_user");
    window.location.href = "/";
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#F6F8FA] flex flex-col items-center justify-center p-6 text-center">
        <div
          className={`w-12 h-12 rounded-2xl ${
            isDoctorRoute ? "bg-amber-500" : "bg-violet-600"
          } text-white flex items-center justify-center mb-4 shadow-lg animate-pulse text-2xl`}
        >
          {isDoctorRoute ? "🩺" : "🛡️"}
        </div>
        <div className="w-8 h-8 border-3 border-gray-400 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-bold text-gray-800">Verifying Security Credentials...</p>
        <p className="text-xs text-gray-400 mt-1">Pashu Rakshak Role-Based Access Control</p>
      </div>
    );
  }

  // 1. BLOCKED: Farmer trying to access Dashboard
  if (isFarmer) {
    return (
      <div className="min-h-screen bg-[#F6F8FA] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#D5DDD0] shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#DCEFE1] text-[#2E7D46] flex items-center justify-center mx-auto text-3xl">
            🌾
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#2E7D46] bg-[#DCEFE1] px-2.5 py-0.5 rounded-full">
              Farmer Account Detected
            </span>
            <h2 className="text-lg font-extrabold text-gray-900 mt-2">Dashboard Restricted</h2>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              You are signed in as a <strong>Farmer</strong> ({user.email}). Clinical triage and administrative surveillance require a <strong>Veterinarian</strong> or <strong>Administrator</strong> account.
            </p>
          </div>
          <div className="pt-2 space-y-2">
            <Link
              href="/farmer/report"
              className="block w-full py-2.5 bg-[#2E7D46] hover:bg-[#256638] text-white rounded-xl font-bold text-xs transition shadow-sm"
            >
              Go to Farmer Portal (रोग रिपोर्ट करा)
            </Link>
            <button
              onClick={handleLogout}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition"
            >
              Sign Out & Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. BLOCKED: Admin / Official trying to access Doctor Portal routes (/dashboard/cases, /alerts, /lab)
  if (isAdmin && isDoctorRoute) {
    return (
      <div className="min-h-screen bg-[#F6F8FA] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-red-200 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto text-3xl border border-red-200">
            <Lock className="w-7 h-7 text-red-600" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full">
              Doctor Portal Restricted
            </span>
            <h2 className="text-lg font-extrabold text-gray-900 mt-2">Veterinarians Only</h2>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
              You are currently signed in as an <strong>Administrator / Official</strong> ({user.name || user.email} · {user.role}). Case management, clinical triage, and prescription tools are restricted to licensed <strong>Veterinary Doctors</strong>.
            </p>
          </div>
          <div className="pt-2 space-y-2">
            <Link
              href="/dashboard"
              className="w-full py-2.5 bg-violet-700 hover:bg-violet-800 text-white rounded-xl font-bold text-xs transition shadow-sm flex items-center justify-center gap-1.5"
            >
              <Shield className="w-4 h-4" />
              <span>Go to Admin Command Center</span>
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem("pashurakshak_user");
                localStorage.removeItem("jeevraksha_user");
                router.push("/login?role=vet&redirect=/dashboard/cases");
              }}
              className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5"
            >
              <Stethoscope className="w-4 h-4 text-amber-600" />
              <span>Sign In with Doctor Account (vet@pashurakshak.in)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. BLOCKED: Doctor whose registration is still pending review
  if (isDoctor && user.status !== "APPROVED") {
    return (
      <div className="min-h-screen bg-[#F6F8FA] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-amber-300 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-3xl border border-amber-200">
            <Clock className="w-7 h-7 text-amber-600 animate-spin" style={{ animationDuration: "6s" }} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
              Verification Pending
            </span>
            <h2 className="text-xl font-black text-gray-900 mt-2">
              Registration Under Review
            </h2>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              Dr. <strong>{user.name}</strong>, your Veterinary Council registration (
              <span className="font-mono font-bold text-amber-800">{user.registrationNo || "Registration Document"}</span>
              ) has been submitted and is currently awaiting approval from the State Animal Husbandry Department.
            </p>
            <div className="mt-3 p-3 bg-amber-50/80 rounded-xl border border-amber-200/60 text-[11px] text-amber-900 text-left space-y-1">
              <p>• You cannot access patient case files until verified.</p>
              <p>• Department officials verify licenses within 12–24 business hours.</p>
              <p>• You will receive an SMS confirmation once your account is active.</p>
            </div>
          </div>
          <div className="pt-2 space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs transition shadow-sm"
            >
              Check Approval Status (Refresh)
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. BLOCKED: Approved Doctor trying to access Admin Command Center routes (/dashboard, /map, /approvals)
  if (isDoctor && isAdminRoute) {
    return (
      <div className="min-h-screen bg-[#F6F8FA] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-amber-200 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-3xl">
            🩺
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
              Doctor Clinic Navigation
            </span>
            <h2 className="text-lg font-extrabold text-gray-900 mt-2">Routing to Doctor Portal</h2>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Official surveillance command telemetry is managed by Department Administrators. Taking you to your Clinical Case Management queue...
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/dashboard/cases"
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs transition shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>Go to Case Management (केस पहा)</span>
              <ArrowRight className="w-4 h-4" />
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
        <Link href={isDoctor ? "/dashboard/cases" : "/dashboard"} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 ${
              isDoctor
                ? "bg-gradient-to-br from-amber-600 to-yellow-500"
                : "bg-gradient-to-br from-violet-600 to-indigo-600"
            } rounded-lg flex items-center justify-center text-white shadow-xs`}
          >
            <span className="text-sm">{isDoctor ? "🩺" : "🛡️"}</span>
          </div>
          <div>
            <h2 className="text-base font-extrabold text-gray-900 leading-none">
              {isDoctor ? "Doctor Portal" : "Admin Command"}
            </h2>
            <span className={`text-[10px] font-bold ${isDoctor ? "text-amber-600" : "text-violet-600"}`}>
              {isDoctor ? "Operations & Triage" : "Surveillance Grid"}
            </span>
          </div>
        </Link>
        <button
          type="button"
          onClick={toggleMenu}
          className="lg:hidden w-10 h-10 flex items-center justify-center text-gray-700 hover:text-gray-900 bg-gray-100/80 hover:bg-gray-200/80 active:scale-95 rounded-xl transition cursor-pointer shrink-0 touch-manipulation select-none"
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6 text-red-600" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-xs transition-opacity cursor-pointer"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-72 max-w-[85vw] bg-white border-r border-gray-200/80 flex flex-col fixed top-0 left-0 bottom-0 h-full z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-2">
          <Link href={isDoctor ? "/dashboard/cases" : "/dashboard"} className="flex items-center gap-2.5 group min-w-0">
            <div
              className={`w-9 h-9 ${
                isDoctor
                  ? "bg-gradient-to-tr from-amber-600 via-yellow-600 to-amber-500 shadow-amber-500/20"
                  : "bg-gradient-to-tr from-violet-700 via-indigo-600 to-purple-500 shadow-violet-500/20"
              } rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform shrink-0`}
            >
              <span className="text-base">{isDoctor ? "🩺" : "🛡️"}</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-gray-900 truncate">
                  {isDoctor ? "Doctor Portal" : "Admin Command"}
                </span>
                <span
                  className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded shrink-0 ${
                    isDoctor ? "bg-amber-100 text-amber-800" : "bg-violet-100 text-violet-700"
                  }`}
                >
                  {isDoctor ? "VET" : "OFFICIAL"}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium truncate">
                {isDoctor ? "Clinical Operations & Triage" : "Surveillance Command Center"}
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={closeMenu}
            className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition shrink-0 cursor-pointer touch-manipulation"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* User Card */}
        <div
          className={`p-3.5 mx-3 mt-3 rounded-xl ${
            isDoctor
              ? "bg-gradient-to-r from-amber-50/80 to-yellow-50/50 border-amber-100/60"
              : "bg-gradient-to-r from-violet-50/80 to-indigo-50/50 border-violet-100/60"
          } border flex items-center gap-3`}
        >
          <div
            className={`w-9 h-9 rounded-full ${
              isDoctor ? "bg-amber-600" : "bg-violet-600"
            } text-white font-bold text-sm flex items-center justify-center shadow-xs`}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : isDoctor ? "D" : "A"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-gray-900 truncate">
                {user?.name || (isDoctor ? "Dr. Veterinarian" : "Administrator")}
              </p>
              {isDoctor ? (
                <Stethoscope className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              ) : (
                <Shield className="w-3.5 h-3.5 text-violet-600 shrink-0" />
              )}
            </div>
            <p
              className={`text-[10px] font-semibold ${
                isDoctor ? "text-amber-700" : "text-violet-700"
              } uppercase tracking-wide truncate`}
            >
              {isDoctor ? "LICENSED VETERINARIAN" : user?.role || "ADMIN / OFFICER"}
            </p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {isDoctor ? (
            /* ── DOCTOR / VETERINARIAN: ONLY OPERATIONS & CLINICAL TRIAGE ── */
            <>
              <div className="px-3 pt-2 pb-1.5 flex items-center justify-between">
                <p className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
                  Operations & Triage
                </p>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                  Doctor Clinic
                </span>
              </div>
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
            </>
          ) : (
            /* ── ADMINISTRATOR / OFFICER: SURVEILLANCE & VERIFICATIONS ── */
            <>
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
              <NavLink
                href="/dashboard/approvals"
                label="Vet Verifications"
                icon={UserCheck}
                badgeColor="bg-amber-100 text-amber-800"
                onClick={closeMenu}
              />
            </>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-100 bg-gray-50/70">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-bold text-gray-600 hover:text-red-600 hover:bg-red-50/80 rounded-lg transition cursor-pointer"
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
