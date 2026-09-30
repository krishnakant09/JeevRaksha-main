"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({ href, label, exact = false, onClick }: { href: string; label: string; exact?: boolean; onClick?: () => void }) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition ${
        isActive
          ? "bg-violet-50 text-violet-700 font-semibold"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {label}
    </Link>
  );
}
