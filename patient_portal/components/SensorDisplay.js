import React from "react";
const AngleDisplayWindow = ({ angle }) => <div style={{border:'1px solid #ccc',padding:'8px',margin:'4px'}}>Angle: {angle !== null && angle !== undefined ? angle : '--'}°</div>;
const DistanceDisplayWindow = ({ distance }) => <div style={{border:'1px solid #ccc',padding:'8px',margin:'4px'}}>Height: {distance !== null && distance !== undefined ? distance : '--'}cm</div>;

const SensorDisplay = ({ angle, distance, motionType }) => (
  <div style={{display:'flex',gap:'8px',margin:'12px 0'}}>
    {motionType === 'Hamstring Curl' && <AngleDisplayWindow angle={angle} />}
    {motionType === 'Heel Raise' && <DistanceDisplayWindow distance={distance} />}
    {/* 其他类型可扩展 */}
  </div>
);

export default SensorDisplay; 