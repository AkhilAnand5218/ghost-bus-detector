// BusTrendChart.js
import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

export default function BusTrendChart({ buses }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!buses.length) return;

    const counts = {
      normal: buses.filter(b => b.status === "normal").length,
      ghost: buses.filter(b => b.status === "ghost").length,
      anomaly: buses.filter(b => b.status === "anomaly").length,
    };

    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    // Keep only last 20 data points for performance
    setHistory(prev => [
      ...prev.slice(-19),
      { time: timestamp, Normal: counts.normal, Ghost: counts.ghost, Anomaly: counts.anomaly }
    ]);
  }, [buses]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={history}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Legend verticalAlign="top" height={36} />
        <Line type="monotone" dataKey="Normal" stroke="green" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Ghost" stroke="red" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Anomaly" stroke="orange" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}