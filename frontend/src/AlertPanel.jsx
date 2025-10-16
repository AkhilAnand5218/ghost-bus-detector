// AlertPanel.jsx
import React, { useEffect, useState } from 'react';

function AlertPanel() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetch('/api/alerts').then(res => res.json()).then(setAlerts);
  }, []);

  return (
    <div className="alert-panel">
      <h3>Active Alerts</h3>
      {alerts.map((a, i) => (
        <div key={i} className="alert">
          <p>{a.message}</p>
          <small>{a.timestamp}</small>
        </div>
      ))}
    </div>
  );
}