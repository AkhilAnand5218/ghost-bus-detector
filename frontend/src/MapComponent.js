import React, { useState, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import BusTrendChart from "./BusTrendChart";
import "leaflet/dist/leaflet.css";

const STATUS_COLOR = {
  normal: "green",
  ghost: "red",
  anomaly: "orange",
};

export default function MapComponent({ buses }) {
  const [showChart, setShowChart] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedBus, setSelectedBus] = useState(null);

  const latestBuses = useMemo(() => {
    const latestBusesMap = new Map();
    buses.forEach((bus) => {
      const existing = latestBusesMap.get(bus.id);
      if (!existing || bus.timestamp > existing.timestamp) {
        latestBusesMap.set(bus.id, bus);
      }
    });
    return Array.from(latestBusesMap.values());
  }, [buses]);

  const filteredBuses = useMemo(() => {
    if (filterStatus === "all") return latestBuses;
    return latestBuses.filter((bus) => {
      if (!bus.status) return false;
      return bus.status.trim().toLowerCase() === filterStatus.toLowerCase();
    });
  }, [latestBuses, filterStatus]);

  const countStatus = (status) =>
    latestBuses.filter((b) => b.status.toLowerCase() === status.toLowerCase()).length;

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      {/* Chart Button */}
      <button
        style={{
          position: "absolute",
          top: 10,
          left: 50,
          zIndex: 1000,
          padding: "8px 14px",
          borderRadius: "6px",
          border: "none",
          background: "#007bff",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        }}
        onClick={() => setShowChart(!showChart)}
      >
        {showChart ? "Hide Chart" : "Show Chart"}
      </button>

      {/* Filter Buttons */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 30,
          zIndex: 1000,
          background: "rgba(255, 255, 255, 0.9)",
          padding: "6px 10px",
          borderRadius: "10px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          display: "flex",
          gap: "8px",
        }}
      >
        {["all", "normal", "ghost", "anomaly"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            style={{
              border: "none",
              borderRadius: "6px",
              padding: "6px 12px",
              cursor: "pointer",
              fontWeight: "bold",
              background: filterStatus === status ? "#007bff" : "#f0f0f0",
              color: filterStatus === status ? "white" : "black",
              transition: "0.3s",
            }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Selected Bus Info Panel */}
      {selectedBus && (
        <div
          style={{
            position: "absolute",
            top: 105,
            right: 30,
            zIndex: 1000,
            width: 260,
            background: "rgba(255,255,255,0.85)",
            borderRadius: "16px",
            padding: "15px",
            backdropFilter: "blur(8px)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <h4 style={{ margin: 0 }}>Bus Info</h4>
            <span
              style={{ cursor: "pointer", fontWeight: "bold" }}
              onClick={() => setSelectedBus(null)}
            >
              ×
            </span>
          </div>
          <p>
            <b>ID:</b> {selectedBus.id}
          </p>
          <p>
            <b>Status:</b> {selectedBus.status}
          </p>
          <p>
            <b>Lat:</b> {selectedBus.lat.toFixed(5)}
          </p>
          <p>
            <b>Lon:</b> {selectedBus.lon.toFixed(5)}
          </p>
        </div>
      )}

      {/* Chart Panel */}
      {showChart && (
        <div
          style={{
            position: "absolute",
            top: 70,
            left: 50,
            zIndex: 1000,
            width: 500,
            height: 300,
            background: "rgba(255,255,255,0.9)",
            borderRadius: "16px",
            padding: "15px",
            backdropFilter: "blur(8px)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          }}
        >
          <h4 style={{ margin: "0 0 10px 0" }}>Bus Status Trend</h4>
          <BusTrendChart buses={buses} />
        </div>
      )}

      {/* Map */}
      <MapContainer
        center={[40.7128, -74.006]}
        zoom={12}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={false}
        dragging={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {filteredBuses.map((bus) => {
          const isSelected = selectedBus && selectedBus.id === bus.id;
          return (
            <CircleMarker
              key={bus.id + "_" + bus.timestamp}
              center={[bus.lat, bus.lon]}
              radius={isSelected ? 10 : 6}
              color={STATUS_COLOR[bus.status.trim().toLowerCase()]}
              fillOpacity={0.9}
              weight={isSelected ? 3 : 1}
              eventHandlers={{
                click: () => setSelectedBus(bus),
              }}
              className={isSelected ? "pulse-marker" : ""}
            >
              <Tooltip>{`ID: ${bus.id}, Status: ${bus.status}`}</Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Status Bar */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "12px",
          zIndex: 1000,
        }}
      >
        <span
          style={{
            background: "green",
            color: "white",
            padding: "6px 14px",
            borderRadius: "20px",
            fontWeight: "bold",
          }}
        >
          Normal: {countStatus("normal")}
        </span>
        <span
          style={{
            background: "red",
            color: "white",
            padding: "6px 14px",
            borderRadius: "20px",
            fontWeight: "bold",
          }}
        >
          Ghost: {countStatus("ghost")}
        </span>
        <span
          style={{
            background: "orange",
            color: "white",
            padding: "6px 14px",
            borderRadius: "20px",
            fontWeight: "bold",
          }}
        >
          Anomaly: {countStatus("anomaly")}
        </span>
      </div>

      {/* Custom Styles */}
      <style>
        {`
          html, body {
            margin: 0;
            padding: 0;
            overflow: hidden;
          }
          .pulse-marker {
            animation: pulse 1.5s infinite;
          }
          @keyframes pulse {
            0% { stroke-width: 2; stroke-opacity: 0.8; }
            50% { stroke-width: 8; stroke-opacity: 0; }
            100% { stroke-width: 2; stroke-opacity: 0.8; }
          }
        `}
      </style>
    </div>
  );
}