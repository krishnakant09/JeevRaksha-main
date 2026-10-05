"use client";
import { type ReactNode, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, Stethoscope, Shield, LogOut, ArrowRight, RefreshCw } from "lucide-react";

export default function FarmerLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored =
      localStorage.getItem("pashurakshak_user") ||
      localStorage.getItem("jeevraksha_user");
    if (!stored) {
      router.replace(`/login?role=farmer&redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setUser(parsed);
    } catch {
      localStorage.removeItem("pashurakshak_user");
      localStorage.removeItem("jeevraksha_user");
      router.replace(`/login?role=farmer&redirect=${encodeURIComponent(pathname)}`);
      return;
    } finally {
      setLoading(false);
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("pashurakshak_user");
    localStorage.removeItem("jeevraksha_user");
    router.push("/login?role=farmer");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EEF2EA] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#2E7D46] text-white flex items-center justify-center mb-4 shadow-lg shadow-[#2E7D46]/20 animate-pulse text-2xl">
          🌾
        </div>
        <div className="w-8 h-8 border-3 border-[#2E7D46] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-bold text-[#16261B]">Verifying Farmer Credentials...</p>
        <p className="text-xs text-[#5B6B5F] mt-1">Pashu Rakshak Livestock Access Security</p>
      </div>
    );
  }

  // If user is a Veterinarian trying to access Farmer Portal
  if (user && user.role === "VETERINARIAN") {
    return (
      <div className="min-h-screen bg-[#EEF2EA] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-amber-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto text-3xl shadow-xs">
            🩺
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
              Doctor Account Detected
            </span>
            <h2 className="text-xl font-black text-gray-900 mt-3">
              Farmer Portal Restricted
            </h2>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              You are signed in as a <strong>Veterinary Doctor</strong> ({user.name || user.email}). 
              The Farmer Portal is reserved for livestock owners to submit illness reports. 
              Please use your Doctor Portal to triage cases and write prescriptions.
            </p>
          </div>

          <div className="pt-2 space-y-2">
            <Link
              href="/dashboard/cases"
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white rounded-xl font-bold text-xs transition shadow-md flex items-center justify-center gap-2"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Go to Doctor Portal (केस व्यवस्थापन)</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Switch to Farmer Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user is an Administrator or Officer trying to access Farmer Portal
  if (user && (user.role === "ADMIN" || user.role.includes("OFFICER"))) {
    return (
      <div className="min-h-screen bg-[#EEF2EA] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-violet-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-violet-50 border border-violet-200 text-violet-700 flex items-center justify-center mx-auto text-3xl shadow-xs">
            🛡️
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-violet-800 bg-violet-100 px-3 py-1 rounded-full">
              Official / Administrator Detected
            </span>
            <h2 className="text-xl font-black text-gray-900 mt-3">
              Farmer Portal Restricted
            </h2>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              You are signed in as an <strong>Administrator / Official</strong> ({user.name || user.email} · {user.role}). 
              The Farmer Portal is reserved for livestock owners. Please access the Surveillance Command Center.
            </p>
          </div>

          <div className="pt-2 space-y-2">
            <Link
              href="/dashboard"
              className="w-full py-3 bg-gradient-to-r from-violet-700 to-indigo-700 hover:from-violet-800 hover:to-indigo-800 text-white rounded-xl font-bold text-xs transition shadow-md flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              <span>Go to Admin Command Center</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Switch to Farmer Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user account is suspended or rejected
  if (user && (user.status === "SUSPENDED" || user.status === "REJECTED")) {
    return (
      <div className="min-h-screen bg-[#EEF2EA] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-red-200 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto text-2xl">
            <ShieldAlert className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900">Account {user.status}</h2>
            <p className="text-xs text-gray-500 mt-1">
              Your farmer account has been {user.status.toLowerCase()}. Please contact your local Animal Husbandry office or call the 1962 helpline.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
