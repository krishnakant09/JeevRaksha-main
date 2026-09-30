"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPin } from "lucide-react";

// Fix Leaflet marker icons issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function LocationMarker({ position, setPosition }: { position: L.LatLng | null; setPosition: (p: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function LocationPickerMap({
  onLocationSelect
}: {
  onLocationSelect: (lat: number, lng: number) => void
}) {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  useEffect(() => {
    if (position) {
      onLocationSelect(position.lat, position.lng);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]);

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const latlng = new L.LatLng(pos.coords.latitude, pos.coords.longitude);
          setPosition(latlng);
        },
        (err) => {
          console.error(err);
          alert("Could not access your location. Please drop a pin manually.");
        }
      );
    }
  };

  return (
    <div className="relative w-full h-[250px] rounded-lg overflow-hidden border border-gray-300">
      <MapContainer 
        center={[20.5937, 78.9629]} // Center of India
        zoom={4} 
        style={{ height: "100%", width: "100%" }}
        key="location-picker-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
      
      <button 
        type="button"
        onClick={handleUseMyLocation}
        className="absolute bottom-4 right-4 z-[400] bg-white text-violet-700 px-3 py-2 rounded-lg shadow-lg font-bold text-xs flex items-center gap-1 hover:bg-violet-50 transition"
      >
        <MapPin className="w-4 h-4" /> Use My Location
      </button>
    </div>
  );
}
