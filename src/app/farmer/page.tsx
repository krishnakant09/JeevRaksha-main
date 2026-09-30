"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FarmerIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/farmer/report");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f5f4fb] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-gray-600">Loading Farmer Portal...</p>
      </div>
    </div>
  );
}
