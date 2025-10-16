// PlaybackSlider.jsx
import React, { useState, useEffect } from 'react';
import { Slider } from '@mui/material';

function PlaybackSlider({ onSnapshotSelect }) {
  const [timestamps, setTimestamps] = useState([]);

  useEffect(() => {
    fetch('/api/snapshots')
      .then(res => res.json())
      .then(setTimestamps);
  }, []);

  return (
    <Slider
      min={0}
      max={timestamps.length - 1}
      onChange={(e, val) => onSnapshotSelect(timestamps[val])}
    />
  );
}