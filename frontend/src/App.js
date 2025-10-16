import React, { useEffect, useState } from "react";
import MapComponent from "./MapComponent";
import Alert from "./Alert";

function App() {
  const [buses, setBuses] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/buses");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setBuses(data);

        const ghostCount = data.filter((bus) => bus.status === "ghost").length;
        const anomalyCount = data.filter((bus) => bus.status === "anomaly").length;

        if (ghostCount > 0) {
          setAlertMessage(`Alert: ${ghostCount} Ghost bus(es) detected`);
        } else if (anomalyCount > 0) {
          setAlertMessage(`Alert: ${anomalyCount} Anomaly bus(es) detected`);
        } else {
          setAlertMessage(null);
        }
      } catch (e) {
        console.error("Invalid WebSocket message", e);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleAlertClose = () => {
    setAlertMessage(null);
  };

  return (
    <>
      {alertMessage && <Alert message={alertMessage} onClose={handleAlertClose} />}
      <MapComponent buses={buses} />
    </>
  );
}

export default App;