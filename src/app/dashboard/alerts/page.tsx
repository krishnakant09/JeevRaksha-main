import { prisma } from "@/lib/prisma";
import { ShieldAlert, AlertTriangle, Bell, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

const TYPE_CONFIG: Record<string, { label: string; colorClass: string; icon: any }> = {
  HIGH_RISK: { label: "High Risk", colorClass: "bg-red-50 border-red-200 text-red-800", icon: ShieldAlert },
  OUTBREAK_WARNING: { label: "Outbreak Warning", colorClass: "bg-orange-50 border-orange-200 text-orange-800", icon: AlertTriangle },
  VACCINATION_DUE: { label: "Vaccination Due", colorClass: "bg-blue-50 border-blue-200 text-blue-800", icon: Bell },
  MORTALITY_SPIKE: { label: "Mortality Spike", colorClass: "bg-red-50 border-red-200 text-red-900", icon: AlertTriangle },
  LAB_RESULT: { label: "Lab Result", colorClass: "bg-indigo-50 border-indigo-200 text-indigo-800", icon: Bell },
  FIELD_VISIT: { label: "Field Visit", colorClass: "bg-purple-50 border-purple-200 text-purple-800", icon: CheckCircle },
  FOLLOW_UP: { label: "Follow-Up", colorClass: "bg-yellow-50 border-yellow-200 text-yellow-800", icon: Bell },
};

export default async function AlertsPage() {
  const alerts = await prisma.alert.findMany({ orderBy: { createdAt: "desc" } });

  const unread = alerts.filter((a: any) => !a.isRead);
  const read = alerts.filter((a: any) => a.isRead);

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Alerts & Notifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">{unread.length} unread · {alerts.length} total</p>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No alerts — all clear!</p>
        </div>
      ) : (
        <>
          {unread.length > 0 && (
            <section className="mb-8">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3">Unread ({unread.length})</h2>
              <div className="space-y-3">
                {unread.map((alert: any) => {
                  const cfg = TYPE_CONFIG[alert.type] || { label: alert.type, colorClass: "bg-gray-50 border-gray-200 text-gray-800", icon: Bell };
                  const Icon = cfg.icon;
                  return (
                    <div key={alert.id} className={`p-5 rounded-xl border flex items-start gap-4 ${cfg.colorClass}`}>
                      <Icon className="w-6 h-6 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm">{cfg.label}</p>
                        <p className="text-sm mt-0.5 leading-relaxed">{alert.message}</p>
                        <div className="flex items-center gap-4 mt-2">
                          {alert.village && <span className="text-xs opacity-70">📍 {alert.village}{alert.block ? `, ${alert.block}` : ""}</span>}
                          <span className="text-xs opacity-60">{new Date(alert.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {read.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400 mb-3">Read ({read.length})</h2>
              <div className="space-y-2 opacity-60">
                {read.map((alert: any) => {
                  const cfg = TYPE_CONFIG[alert.type] || { label: alert.type, colorClass: "bg-gray-50 border-gray-200 text-gray-700", icon: Bell };
                  const Icon = cfg.icon;
                  return (
                    <div key={alert.id} className="p-4 rounded-xl border border-gray-200 bg-white flex items-start gap-3">
                      <Icon className="w-5 h-5 flex-shrink-0 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm text-gray-600">{cfg.label}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{alert.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(alert.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
