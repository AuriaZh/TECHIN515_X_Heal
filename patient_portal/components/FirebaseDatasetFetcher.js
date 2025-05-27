import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";

const motionTypeToTargetPath = {
  "Hamstring Curl": ["parameters", "hamstringCurl", "targetAngle"],
  "Heel Raise": ["parameters", "heelRaise", "targetHeight"],
  "Hip Flexion": ["parameters", "hipFlexion", "targetHeight"],
};

const FirebaseDatasetFetcher = ({ patientId, motionType, currentValue, onTargetFetched }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState(null);
  const [resultMsg, setResultMsg] = useState("");
  const [latestReport, setLatestReport] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    setResultMsg("");
    setLatestReport(null);
    try {
      if (!patientId) throw new Error("No patientId provided");
      // 1. 检查patient是否存在
      const patientDocRef = doc(db, "patients", patientId);
      const patientDocSnap = await getDoc(patientDocRef);
      if (!patientDocSnap.exists()) {
        setError("No patient found");
        setResultMsg("No patient found");
        setLoading(false);
        return;
      }
      // 2. 查找report
      const reportsRef = collection(db, "patients", patientId, "reports");
      const q = query(reportsRef, orderBy("timestamp", "desc"), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        querySnapshot.forEach(doc => {
          console.log('report id:', doc.id, 'data:', doc.data());
        });
        const latest = querySnapshot.docs[0].data();
        setData(latest);
        setLatestReport(latest);
        setError(null);
        setResultMsg("patient found + report found!");
      } else {
        setData(null);
        setLatestReport(null);
        setError("No reports found");
        setResultMsg("patient found + No report found");
      }
    } catch (e) {
      setError("Fetch failed: " + e.message);
      setResultMsg("Fetch failed: " + e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!data) return;
    const path = motionTypeToTargetPath[motionType] || [];
    let t = data;
    for (const key of path) {
      t = t?.[key];
    }
    console.log('data:', data, 'path:', path, 'target:', t);
    setTarget(t ?? null);
    if (onTargetFetched) onTargetFetched(t ?? null);
  }, [data, motionType]);

  const handleFetchClick = async () => {
    await fetchData();
  };

  return (
    <div style={{margin:'12px 0'}}>
      <button onClick={handleFetchClick} style={{marginLeft:'12px'}}>Check Latest Report</button>
      {loading && <div>Loading...</div>}
      {resultMsg && <div style={{color: resultMsg.includes('No') ? 'red' : 'green'}}>{resultMsg}</div>}
      {latestReport && (
        <pre style={{background:'#f5f5f5',padding:'8px',borderRadius:'4px',marginTop:'8px',maxWidth:'100%',overflowX:'auto'}}>
          {JSON.stringify(latestReport, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default FirebaseDatasetFetcher; 