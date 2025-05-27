import React, { useState, useRef } from "react";
import TopBar from "./TopBar";

const HistoryPage = () => {
  const [phase, setPhase] = useState("idle");
  const [repCount, setRepCount] = useState(0);
  const minAngleRef = useRef(null);
  const holdStartRef = useRef(null);

  const handleAngleUpdate = (angle) => {
    // ...和你上面逻辑一样
  };

  return (
    <div>
      <TopBar />
      <div style={{padding:'24px',textAlign:'center'}}>History Page</div>
    </div>
  );
};

export default HistoryPage; 