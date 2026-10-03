"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type LucideIcon } from "lucide-react";

interface NavLinkProps {
  href: string;
  label: string;
  icon?: LucideIcon;
  badge?: string | number;
  badgeColor?: string;
  exact?: boolean;
  onClick?: () => void;
}

export default function NavLink({
  href,
  label,
  icon: Icon,
  badge,
  badgeColor = "bg-violet-100 text-violet-700",
  exact = false,
  onClick,
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
        isActive
          ? "bg-violet-600 text-white shadow-sm shadow-violet-600/30"
          : "text-gray-600 hover:bg-gray-100/90 hover:text-gray-900"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {Icon && (
          <Icon
            className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
              isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"
            }`}
          />
        )}
        <span className="truncate">{label}</span>
      </div>
      {badge !== undefined && badge !== null && (
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
            isActive ? "bg-white/20 text-white" : badgeColor
          }`}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
