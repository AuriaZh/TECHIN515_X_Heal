import React from "react";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import { app } from "../firebase";

const ReportUploader = ({ patientId, angle, distance, motionType, repCount, minValues, overall, allRepsValues }) => {
  const handleUpload = async () => {
    try {
      const db = getFirestore(app);
      const now = new Date();
      // Seattle time (America/Los_Angeles)
      const seattleTime = now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
      const timestamp = new Date(seattleTime).toISOString();
      // Use timestamp as unique doc id
      const reportId = `${patientId}_${timestamp}`;
      // 组装repetitions数组
      const repetitions = (allRepsValues || []).map((values, idx) => ({
        minValue: values.length > 0 ? Math.min(...values) : null,
        index: idx + 1,
        values
      }));
      let data = {
        patientId,
        createdAt: timestamp,
        repetitions,
        overall: overall || null,
      };
      let value = motionType === 'Hamstring Curl' ? angle : motionType === 'Heel Raise' ? distance : angle;
      if (value !== null && value !== undefined && motionType) {
        data = {
          ...data,
          value,
          motionType,
          repCount,
        };
      }
      await setDoc(doc(collection(db, "patient_exercise_report"), reportId), data);
      window.alert("Exercise report uploaded" + (data.value ? " with data" : " (empty document)"));
    } catch (e) {
      window.alert("Upload failed: " + e.message);
    }
  };
  return (
    <div style={{margin:'12px 0'}}>
      <button onClick={handleUpload}>Upload Daily Report</button>
    </div>
  );
};
export default ReportUploader; 