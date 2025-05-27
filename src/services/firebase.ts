import { doc, setDoc, collection } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { RehabilitationPlan, RehabilitationPhase } from "../types";
import { generatePDF, uploadPDF } from "./reportService";

interface UploadResult {
  success: boolean;
  pdfUrl: string | null;
  error?: Error;
  reportPath?: string;
  errorDetails?: string;
}

interface ReportData {
  name: string;
  rehabPhase: RehabilitationPhase;
  legLength: number;
  frequency: number;
  parameters: {
    hipFlexion: {
      targetAngle: number;
      holdTime: number;
      repetitions: number;
      targetHeight: number;
    };
    hamstringCurl: {
      targetAngle: number;
      holdTime: number;
      repetitions: number;
    };
    heelRaise: {
      targetHeight: number;
      holdTime: number;
      repetitions: number;
    };
  };
  timestamp: string;
  lastUpdated: string;
  pdfUrl?: string;
  sessionTime: string;
  followUpTime: string;
}

/**
 * Ensure all required paths exist in Firestore
 */
const ensurePathsExist = async (patientId: string, rehabPhase: RehabilitationPhase) => {
  try {
    console.log(`Ensuring paths exist for patient ${patientId} and phase ${rehabPhase}`);
    
    // Ensure patient document exists
    const patientRef = doc(db, `patients/${patientId}`);
    console.log('Creating/updating patient document...');
    await setDoc(patientRef, { exists: true }, { merge: true });

    // Ensure reports collection exists under patient
    const reportsRef = doc(db, `patients/${patientId}/reports`, rehabPhase);
    console.log('Creating/updating reports collection...');
    await setDoc(reportsRef, { exists: true }, { merge: true });

    console.log('All paths successfully created');
    return true;
  } catch (error) {
    console.error("Error ensuring paths exist:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    throw error;
  }
};

// Upload patient data to Firestore with timestamp-based structure
export const uploadPatientData = async (patientId: string, plan: RehabilitationPlan): Promise<UploadResult> => {
  try {
    console.log('Starting upload process for patient:', patientId);
    const { patientInfo, legLength, exercises, sessionsPerDay } = plan;
    const timestamp = new Date().toISOString();
    
    // Ensure all required paths exist
    console.log('Ensuring paths exist...');
    await ensurePathsExist(patientId, patientInfo.rehabilitationPhase);
    
    // Create the report data
    console.log('Creating report data...');
    const reportData: ReportData = {
      name: patientInfo.patientName,
      rehabPhase: patientInfo.rehabilitationPhase,
      legLength,
      frequency: sessionsPerDay,
      parameters: {
        hipFlexion: {
          targetAngle: exercises.hipFlexion.targetAngle,
          holdTime: exercises.hipFlexion.holdTime,
          repetitions: exercises.hipFlexion.repetitions,
          targetHeight: exercises.hipFlexion.targetHeight ?? 0
        },
        hamstringCurl: {
          targetAngle: exercises.hamstringCurl.targetAngle,
          holdTime: exercises.hamstringCurl.holdTime,
          repetitions: exercises.hamstringCurl.repetitions
        },
        heelRaise: {
          targetHeight: exercises.heelRaise.targetHeight || 0,
          holdTime: exercises.heelRaise.holdTime,
          repetitions: exercises.heelRaise.repetitions
        }
      },
      timestamp,
      lastUpdated: timestamp,
      sessionTime: plan.sessionTime.toString(),
      followUpTime: plan.followUpTime.toString()
    };

    // Create reports collection reference
    console.log('Creating report document...');
    const patientRef = doc(db, 'patients', patientId);
    const reportsCollection = collection(patientRef, 'reports');
    const reportRef = doc(reportsCollection, timestamp);
    
    // Save initial report data
    console.log('Saving initial report data...');
    await setDoc(reportRef, reportData);
    
    // Generate and upload PDF report
    console.log('Generating PDF report...');
    const pdfDoc = generatePDF(plan);
    console.log('Uploading PDF to storage...');
    const { url: pdfUrl, fileName, localDateStr } = await uploadPDF(patientId, patientInfo.rehabilitationPhase, pdfDoc, new Date());
    
    // Update report data with PDF URL
    console.log('Updating report with PDF URL...');
    await setDoc(reportRef, { 
      ...reportData,
      pdfUrl
    }, { merge: true });

    // Update patient's latest report reference
    console.log('Updating patient document...');
    await setDoc(patientRef, {
      name: patientInfo.patientName,
      latestReport: {
        phase: patientInfo.rehabilitationPhase,
        timestamp,
        pdfUrl
      },
      lastUpdated: timestamp
    }, { merge: true });

    const reportPath = `patients/${patientId}/reports/${timestamp}`;
    console.log(`Report successfully saved under path: ${reportPath}`);
    
    return { 
      success: true, 
      pdfUrl,
      reportPath
    };
  } catch (error) {
    console.error("Error uploading patient data:", error);
    let errorDetails = 'Unknown error occurred';
    
    if (error instanceof Error) {
      errorDetails = `Error: ${error.name} - ${error.message}`;
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    return { 
      success: false, 
      pdfUrl: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
      errorDetails
    };
  }
};

export const generateReport = (plan: RehabilitationPlan) => {
  const { patientInfo, legLength, exercises, sessionsPerDay } = plan;

  const report = {
    name: patientInfo.patientName,
    rehabPhase: patientInfo.rehabilitationPhase,
    legLength,
    frequency: sessionsPerDay,
    report: {
      hipFlexion: {
        targetAngle: exercises.hipFlexion.targetAngle,
        targetHeight: Math.round(legLength * Math.sin((exercises.hipFlexion.targetAngle * Math.PI) / 180)),
        holdTime: exercises.hipFlexion.holdTime,
        repetitions: exercises.hipFlexion.repetitions,
        explanation: `Lift your leg to ${exercises.hipFlexion.targetAngle} degrees (${Math.round(legLength * Math.sin((exercises.hipFlexion.targetAngle * Math.PI) / 180))} cm) and hold for ${exercises.hipFlexion.holdTime} seconds.`
      },
      hamstringCurl: {
        targetAngle: exercises.hamstringCurl.targetAngle,
        holdTime: exercises.hamstringCurl.holdTime,
        repetitions: exercises.hamstringCurl.repetitions,
        explanation: `Bend your knee to ${exercises.hamstringCurl.targetAngle} degrees and hold for ${exercises.hamstringCurl.holdTime} seconds.`
      },
      heelRaise: {
        targetHeight: exercises.heelRaise.targetHeight || 0,
        holdTime: exercises.heelRaise.holdTime,
        repetitions: exercises.heelRaise.repetitions,
        explanation: `Raise your heel to ${exercises.heelRaise.targetHeight} cm and hold for ${exercises.heelRaise.holdTime} seconds.`
      }
    }
  };

  return report;
};