"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Stethoscope,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  ExternalLink,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  MapPin,
  Phone,
  Award,
  ChevronRight,
  Eye,
  X,
  RefreshCw,
  Sparkles,
  UserCheck
} from "lucide-react";

interface VetApplication {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  status: string;
  createdAt: string;
  vetType: string;
  registrationNo: string;
  council: string;
  certificateUrl: string | null;
  serviceDistrict: string;
  serviceTaluka: string;
  serviceVillages: string | null;
  languages: string | null;
  availability: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
}

export default function VetApprovalsPage() {
  const [vets, setVets] = useState<VetApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING_REVIEW" | "APPROVED" | "REJECTED">("PENDING_REVIEW");
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Certificate Modal State
  const [previewCertUrl, setPreviewCertUrl] = useState<string | null>(null);
  const [previewDoctorName, setPreviewDoctorName] = useState<string>("");

  // Reject Reason Modal State
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Fetch applications
  const fetchVets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users/pending?filter=ALL");
      const data = await res.json();
      if (data.success && Array.isArray(data.vets)) {
        setVets(data.vets);
      }
    } catch (e) {
      console.error("Error fetching vets:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVets();
  }, []);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Approve Doctor
  const handleApprove = async (vetId: string, doctorName: string) => {
    setProcessingId(vetId);
    try {
      const res = await fetch(`/api/admin/users/${vetId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewerName: "State Veterinary Administrator" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVets((prev) =>
          prev.map((v) =>
            v.id === vetId
              ? { ...v, status: "APPROVED", reviewedBy: "State Veterinary Administrator", reviewedAt: new Date().toISOString() }
              : v
          )
        );
        showToast(`✅ ${doctorName} has been approved! The doctor can now receive clinical cases.`);
      } else {
        showToast(data.error || "Failed to approve application.", "error");
      }
    } catch {
      showToast("Network error while approving.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  // Reject Doctor
  const handleConfirmReject = async () => {
    if (!rejectingId) return;
    setProcessingId(rejectingId);
    try {
      const res = await fetch(`/api/admin/users/${rejectingId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: rejectReason || "Registration credentials could not be verified.",
          reviewerName: "State Veterinary Administrator",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVets((prev) =>
          prev.map((v) =>
            v.id === rejectingId
              ? {
                  ...v,
                  status: "REJECTED",
                  rejectionReason: rejectReason || "Credentials could not be verified",
                  reviewedBy: "State Veterinary Administrator",
                  reviewedAt: new Date().toISOString(),
                }
              : v
          )
        );
        showToast("Application marked as rejected.", "success");
        setRejectingId(null);
        setRejectReason("");
      } else {
        showToast(data.error || "Failed to reject application.", "error");
      }
    } catch {
      showToast("Network error while rejecting.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  // Filtered & Searched List
  const filteredVets = vets.filter((v) => {
    const matchesFilter = filter === "ALL" || v.status === filter;
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.registrationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.phone && v.phone.includes(searchTerm)) ||
      v.serviceDistrict.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.serviceTaluka.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = vets.filter((v) => v.status === "PENDING_REVIEW").length;
  const approvedCount = vets.filter((v) => v.status === "APPROVED").length;
  const rejectedCount = vets.filter((v) => v.status === "REJECTED").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── TOAST NOTIFICATION ── */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl border text-sm font-black flex items-center gap-3 transition-all animate-in slide-in-from-bottom-4 ${
            toastMessage.type === "success"
              ? "bg-[#183921] text-white border-emerald-500/40"
              : "bg-red-900 text-white border-red-500/40"
          }`}
        >
          <span>{toastMessage.text}</span>
          <button type="button" onClick={() => setToastMessage(null)} className="opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── HEADER BANNER ── */}
      <div className="bg-gradient-to-r from-[#183921] via-[#215A33] to-[#2E7D46] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-wider text-[#FBEFCF]">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>State Animal Husbandry Department • Maharashtra</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Veterinary Credential Verification Queue
          </h1>
          <p className="text-xs sm:text-sm text-white/85 max-w-3xl leading-relaxed">
            Review MSVC / VCI council registration credentials and verify license certificates. Approved veterinarians
            are immediately activated to receive rural emergency triage and clinical case dispatches.
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-black/20 backdrop-blur-md border border-white/15 p-3.5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-white/70 font-semibold block">Awaiting Verification</span>
                <span className="text-2xl sm:text-3xl font-black text-amber-300">{pendingCount}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center text-xl font-black">
                ⏳
              </div>
            </div>

            <div className="bg-black/20 backdrop-blur-md border border-white/15 p-3.5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-white/70 font-semibold block">Active Verified Doctors</span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-300">{approvedCount}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center text-xl font-black">
                🩺
              </div>
            </div>

            <div className="bg-black/20 backdrop-blur-md border border-white/15 p-3.5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-white/70 font-semibold block">Rejected / Incomplete</span>
                <span className="text-2xl sm:text-3xl font-black text-rose-300">{rejectedCount}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-400/20 text-rose-300 flex items-center justify-center text-xl font-black">
                ✖
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTROLS & FILTER BAR ── */}
      <div className="bg-white p-4 rounded-2xl border border-[#D5DDD0] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
          {[
            { id: "PENDING_REVIEW", label: "Awaiting Verification", count: pendingCount, color: "text-amber-700 bg-amber-100" },
            { id: "APPROVED", label: "Approved Doctors", count: approvedCount, color: "text-emerald-700 bg-emerald-100" },
            { id: "REJECTED", label: "Rejected", count: rejectedCount, color: "text-rose-700 bg-rose-100" },
            { id: "ALL", label: "All Vets", count: vets.length, color: "text-gray-700 bg-gray-100" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                filter === tab.id
                  ? "bg-[#2E7D46] text-white shadow-xs"
                  : "bg-[#EEF2EA] text-[#5B6B5F] hover:text-[#16261B] hover:bg-[#DCEFE1]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  filter === tab.id ? "bg-white/20 text-white" : tab.color
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar & Refresh */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-[#5B6B5F] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, MSVC reg, district..."
              className="w-full pl-9 pr-3 py-2 bg-[#F7F9F5] border border-[#D5DDD0] rounded-xl text-xs font-bold text-[#16261B] outline-hidden focus:border-[#2E7D46] focus:bg-white transition"
            />
          </div>

          <button
            type="button"
            onClick={fetchVets}
            className="p-2.5 bg-[#EEF2EA] hover:bg-[#D5DDD0] text-[#16261B] rounded-xl transition cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── APPLICATION CARDS LIST ── */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#D5DDD0] space-y-3">
          <div className="w-10 h-10 border-3 border-[#2E7D46] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-[#16261B]">Loading veterinary applications...</p>
        </div>
      ) : filteredVets.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#D5DDD0] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#EEF2EA] text-[#2E7D46] flex items-center justify-center mx-auto text-2xl">
            ✨
          </div>
          <h3 className="text-base font-black text-[#16261B]">No applications match the current filter.</h3>
          <p className="text-xs text-[#5B6B5F] font-semibold">
            {filter === "PENDING_REVIEW"
              ? "All registered veterinarians have been reviewed and approved!"
              : "Try switching filter tabs or clearing your search."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredVets.map((v) => {
            const isPending = v.status === "PENDING_REVIEW";
            const isApproved = v.status === "APPROVED";
            const isRejected = v.status === "REJECTED";
            const isProcessing = processingId === v.id;

            return (
              <div
                key={v.id}
                className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all shadow-xs hover:shadow-md space-y-4 ${
                  isPending
                    ? "border-amber-200/80 bg-gradient-to-r from-white via-white to-amber-50/20"
                    : isApproved
                    ? "border-emerald-200/80 bg-gradient-to-r from-white via-white to-emerald-50/20"
                    : "border-rose-200/80 bg-gradient-to-r from-white via-white to-rose-50/20"
                }`}
              >
                {/* Upper Row: Status + Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D5DDD0]/60 pb-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-sm ${
                        isPending
                          ? "bg-amber-600"
                          : isApproved
                          ? "bg-[#2E7D46]"
                          : "bg-rose-600"
                      }`}
                    >
                      {v.vetType === "PARA_VET" ? "🩹" : "🩺"}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-black text-[#16261B]">
                          {v.name.startsWith("Dr.") ? v.name : `Dr. ${v.name}`}
                        </h3>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            v.vetType === "PARA_VET"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-emerald-100 text-[#2E7D46]"
                          }`}
                        >
                          {v.vetType === "PARA_VET" ? "Para-Veterinarian" : "Veterinary Officer"}
                        </span>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isPending
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : isApproved
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-rose-100 text-rose-800 border border-rose-300"
                          }`}
                        >
                          {isPending ? "⏳ Under Review" : isApproved ? "✅ Approved" : "✖ Rejected"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#5B6B5F] font-semibold mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#2E7D46]" />
                          <span>
                            {v.serviceTaluka}, {v.serviceDistrict}
                          </span>
                        </span>
                        {v.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-amber-600" />
                            <span>+91 {v.phone}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>Submitted: {new Date(v.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Certificate Link / View Button */}
                  {v.certificateUrl ? (
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewCertUrl(v.certificateUrl);
                        setPreviewDoctorName(v.name);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#EEF2EA] hover:bg-[#DCEFE1] text-[#2E7D46] font-black text-xs transition flex items-center gap-2 border border-[#D5DDD0] shrink-0 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-[#2E7D46]" />
                      <span>Inspect Certificate</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </button>
                  ) : (
                    <span className="text-[11px] text-gray-400 italic">No document uploaded</span>
                  )}
                </div>

                {/* Middle Row: Council Credentials Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F7F9F5] p-3.5 rounded-2xl border border-[#D5DDD0]/70 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#5B6B5F] block">Registration Number</span>
                    <span className="font-black text-[#16261B] tracking-wider">{v.registrationNo}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#5B6B5F] block">Issuing Council</span>
                    <span className="font-extrabold text-[#16261B] truncate block">{v.council}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#5B6B5F] block">Availability</span>
                    <span className="font-extrabold text-[#2E7D46]">{v.availability || "Full Time"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#5B6B5F] block">Languages</span>
                    <span className="font-extrabold text-[#16261B] uppercase">{v.languages || "MR, HI"}</span>
                  </div>
                </div>

                {/* Rejection Note if rejected */}
                {isRejected && v.rejectionReason && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Rejection Reason: {v.rejectionReason}</span>
                  </div>
                )}

                {/* Approval Note if approved */}
                {isApproved && v.reviewedAt && (
                  <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      Verified by {v.reviewedBy || "Department Administrator"} on{" "}
                      {new Date(v.reviewedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                )}

                {/* Bottom Action Buttons (for Pending Reviews or re-activation) */}
                <div className="flex items-center justify-end gap-2.5 pt-1">
                  {isPending ? (
                    <>
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => {
                          setRejectingId(v.id);
                          setRejectReason("");
                        }}
                        className="px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-xs transition cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        Reject Application (नाकारा)
                      </button>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleApprove(v.id, v.name)}
                        className="px-5 py-2.5 rounded-xl bg-[#2E7D46] hover:bg-[#256638] text-white font-black text-xs transition shadow-md shadow-[#2E7D46]/20 cursor-pointer active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isProcessing ? "Approving..." : "Approve & Activate Doctor (मंजूर करा)"}</span>
                      </button>
                    </>
                  ) : isRejected ? (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleApprove(v.id, v.name)}
                      className="px-4 py-2 rounded-xl bg-[#2E7D46] hover:bg-[#256638] text-white font-black text-xs transition cursor-pointer"
                    >
                      Re-Approve Application
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => {
                        setRejectingId(v.id);
                        setRejectReason("");
                      }}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-red-700 hover:bg-red-50 text-[11px] font-bold transition"
                    >
                      Revoke Authorization
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CERTIFICATE PREVIEW MODAL ── */}
      {previewCertUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-200">
            <div className="p-4 bg-[#F7F9F5] border-b border-[#D5DDD0] flex items-center justify-between">
              <div>
                <h4 className="font-black text-sm text-[#16261B]">Certificate Verification</h4>
                <p className="text-xs text-[#5B6B5F] font-semibold">{previewDoctorName}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewCertUrl(null)}
                className="p-2 rounded-xl hover:bg-gray-200 text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-auto bg-gray-100 flex items-center justify-center">
              {previewCertUrl.endsWith(".pdf") ? (
                <iframe src={previewCertUrl} className="w-full h-[65vh] rounded-xl border border-gray-300" title="Certificate PDF" />
              ) : (
                <img
                  src={previewCertUrl}
                  alt="Doctor Council Certificate"
                  className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-md border"
                />
              )}
            </div>

            <div className="p-3 bg-white border-t border-[#D5DDD0] flex items-center justify-between text-xs">
              <a
                href={previewCertUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#2E7D46] font-black hover:underline flex items-center gap-1"
              >
                <span>Open Document in Full Window</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => setPreviewCertUrl(null)}
                className="px-4 py-2 bg-gray-900 text-white font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REJECTION REASON MODAL ── */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-gray-200">
            <div className="flex items-center gap-2 text-rose-700">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="font-black text-base">Reject Veterinary Application</h4>
            </div>

            <p className="text-xs text-[#5B6B5F] leading-relaxed">
              Please specify the reason for rejection. This reason will be logged into the audit ledger and displayed to the applicant.
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Council certificate document is blurry or unreadable. Please re-upload a clear copy."
              className="w-full p-3 rounded-2xl border border-gray-300 text-xs font-semibold text-gray-900 outline-hidden focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingId(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processingId !== null}
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
