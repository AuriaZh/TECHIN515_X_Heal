import React from "react";
const FeedbackText = ({ motionType }) => <div>Feedback: {motionType ? `Current motion: ${motionType}` : '--'}</div>;
const NumericComparison = ({ value, target, motionType }) => {
  let unit = '';
  if (motionType === 'Hamstring Curl') unit = '°';
  if (motionType === 'Heel Raise') unit = 'cm';
  return (
    <div style={{color:'#E10174', fontWeight:'bold'}}>
      Current/Target: {value !== null && value !== undefined ? value : '--'}/{target !== null && target !== undefined ? target : '--'}{unit}
    </div>
  );
};
const GIFPlaceholder = () => <div style={{width:'80px',height:'80px',background:'#eee',margin:'8px 0'}}>GIF</div>;

const FeedbackPanel = ({ angle, distance, motionType, targetAngle, targetDistance, target }) => {
  const value = motionType === 'Hamstring Curl' ? angle : motionType === 'Heel Raise' ? distance : angle;
  return (
    <div style={{border:'1px solid #1976d2',padding:'12px',margin:'12px 0',borderRadius:'8px'}}>
      <FeedbackText motionType={motionType} />
      {motionType === 'Hip Flexion' ? (
        <>
          <div style={{color:'#E10174', fontWeight:'bold'}}>
            Current/Target: {angle !== null && angle !== undefined ? angle : '--'}/{targetAngle ?? '--'}°
          </div>
          <div style={{color:'#E10174', fontWeight:'bold'}}>
            Current/Target: {distance !== null && distance !== undefined ? distance : '--'}/{targetDistance ?? '--'}cm
          </div>
        </>
      ) : (
        <NumericComparison value={value} target={target} motionType={motionType} />
      )}
      <GIFPlaceholder />
    </div>
  );
};

export default FeedbackPanel; 