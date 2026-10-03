"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  PlusCircle,
  FileText,
  Bot,
  LogOut,
  HeartPulse,
  Home,
  ShieldAlert,
  Sparkles,
  PhoneCall,
  Camera
} from "lucide-react";

interface FarmerNavProps {
  userName?: string;
}

export default function FarmerNav({ userName }: FarmerNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("jeevraksha_user");
    router.push("/login");
  };

  const navItems = [
    {
      label: "Report Sickness",
      labelHi: "रोग रिपोर्ट करें",
      href: "/farmer/report",
      icon: PlusCircle,
      badge: "Fast Triage",
    },
    {
      label: "AI Vet Assistant",
      labelHi: "AI पशु सहायक",
      href: "/farmer/chat",
      icon: Bot,
      highlight: true,
      badge: "AI Chat",
    },
    {
      label: "Photo Triage",
      labelHi: "फोटो से जांच",
      href: "/farmer/photo-detect",
      icon: Camera,
      highlight: true,
      badge: "AI Vision",
    },
    {
      label: "IVR Helpline",
      labelHi: "IVR हेल्पलाइन",
      href: "/farmer/ivr",
      icon: PhoneCall,
      badge: "1800 Free",
    },
    {
      label: "My Livestock",
      labelHi: "मेरे पशु",
      href: "/farmer/animals",
      icon: Home,
    },
    {
      label: "My Issues",
      labelHi: "मेरी रिपोर्ट",
      href: "/farmer/my-issues",
      icon: FileText,
    },
  ];

  return (
    <>
      {/* Top Navbar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#D5DDD0] sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#183921] via-[#2E7D46] to-[#3B9B58] flex items-center justify-center text-white shadow-md shadow-[#2E7D46]/20 group-hover:scale-105 transition-transform">
                <span className="text-lg">🐄</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg text-[#16261B] tracking-tight">Pashu Rakshak</span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#DCEFE1] text-[#2E7D46] px-2 py-0.5 rounded-full">
                    Farmer Portal
                  </span>
                </div>
                <p className="text-[11px] text-[#5B6B5F] font-semibold -mt-0.5 hidden sm:block">
                  {userName ? `नमस्ते, ${userName}` : "Livestock Surveillance Grid"}
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1 bg-[#EEF2EA] p-1 rounded-xl border border-[#D5DDD0]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${isActive
                      ? "bg-white text-[#2E7D46] shadow-xs border border-[#D5DDD0]"
                      : "text-[#5B6B5F] hover:text-[#16261B] hover:bg-white/60"
                    }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#2E7D46]" : "text-[#5B6B5F]"}`} />
                  <span>{item.label}</span>
                  {item.highlight && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-bold text-[#5B6B5F] hover:text-[#C8372D] px-3 py-1.5 rounded-lg border border-[#D5DDD0] hover:border-[#F8DAD6] hover:bg-[#F8DAD6]/30 transition"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#D5DDD0] px-2 py-1 flex items-center justify-around shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${isActive ? "text-[#2E7D46] font-extrabold" : "text-[#5B6B5F] hover:text-[#16261B]"
                }`}
            >
              <div className={`p-1 rounded-full ${isActive ? "bg-[#DCEFE1]" : ""}`}>
                <Icon className={`w-5 h-5 ${isActive ? "text-[#2E7D46]" : "text-[#5B6B5F]"}`} />
              </div>
              <span className="text-[10px] mt-0.5 whitespace-nowrap font-bold">{item.labelHi || item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
