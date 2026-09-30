"use client";

import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useMemo } from "react";

// Fix missing marker icons in leaflet
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Static coord offsets per village name for deterministic positioning
function villageCoords(village: string, idx: number): [number, number] {
  // Base: centre of Uttar Pradesh
  const base: [number, number] = [26.85, 80.9];
  // Use a simple hash of village name for consistent offset
  let h = 0;
  for (const c of village) h = (h * 31 + c.charCodeAt(0)) % 100;
  return [base[0] + (h % 10) * 0.3 - 1.5, base[1] + ((h * 7) % 10) * 0.4 - 2.0];
}

export default function MapComponent({ reports }: { reports: any[] }) {
  const markers = useMemo(() =>
    reports.map((r, i) => ({ ...r, coords: villageCoords(r.locationVillage, i) })),
    [reports]
  );

  return (
    <MapContainer
      key="jeevraksha-map"
      center={[26.85, 80.9]}
      zoom={7}
      scrollWheelZoom={true}
      style={{ height: "560px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {markers.map((report) => {
        const riskColor = report.riskLevel === "HIGH" ? "#dc2626" : report.riskLevel === "MEDIUM" ? "#ca8a04" : "#16a34a";
        return (
          <CircleMarker
            key={report.id}
            center={report.coords}
            radius={report.riskLevel === "HIGH" ? 18 : report.riskLevel === "MEDIUM" ? 12 : 8}
            pathOptions={{ color: riskColor, fillColor: riskColor, fillOpacity: 0.6, weight: 2 }}
          >
            <Popup>
              <div className="text-sm min-w-[180px]">
                <h3 className="font-bold text-base mb-1">{report.locationVillage}</h3>
                <div className="space-y-0.5">
                  <p><strong>Risk:</strong> <span style={{ color: riskColor, fontWeight: "bold" }}>{report.riskLevel} ({report.riskScore}/100)</span></p>
                  <p><strong>Animals affected:</strong> {report.animalsAffected}</p>
                  {report.deaths > 0 && <p><strong style={{ color: "#dc2626" }}>Deaths:</strong> <span style={{ color: "#dc2626" }}>{report.deaths}</span></p>}
                  <p><strong>Severity:</strong> {report.severity}</p>
                  {report.symptoms?.length > 0 && (
                    <p><strong>Symptoms:</strong> {report.symptoms.map((s: any) => s.name).join(", ")}</p>
                  )}
                  {report.recommendedAction && (
                    <p className="mt-1 text-xs text-gray-600 italic">{report.recommendedAction}</p>
                  )}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {/* Legend */}
    </MapContainer>
  );
}
