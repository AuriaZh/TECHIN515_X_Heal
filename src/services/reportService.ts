import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { jsPDF } from 'jspdf';
import { RehabilitationPlan } from '../types';

function getSeattleTimestampFilename(date = new Date()) {
  try {
    const localDate = date.toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
    // localDate 例："5/10/2025, 10:44:30 PM"
    const [datePart, timePart] = localDate.split(", ");
    const [month, day, year] = datePart.split("/").map(Number);
    let [hourStr, minuteStr, secondStr] = timePart.split(":");
    let ampm = secondStr.slice(-2);
    let second = Number(secondStr.slice(0, 2));
    let hour = parseInt(hourStr, 10);
    let minute = parseInt(minuteStr, 10);
    if (ampm === "PM" && hour !== 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return {
      fileName: `${year}-${pad(month)}-${pad(day)}_${pad(hour)}-${pad(minute)}-${pad(second)}-report.pdf`,
      localDateStr: `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(second)} PST/PDT`
    };
  } catch (e) {
    console.warn('Failed to format Seattle time, fallback to UTC.', e);
    const d = date;
    const fileName = `${d.getUTCFullYear()}-${(d.getUTCMonth()+1).toString().padStart(2,'0')}-${d.getUTCDate().toString().padStart(2,'0')}_${d.getUTCHours().toString().padStart(2,'0')}-${d.getUTCMinutes().toString().padStart(2,'0')}-${d.getUTCSeconds().toString().padStart(2,'0')}-report.pdf`;
    return { fileName, localDateStr: d.toISOString() + ' UTC' };
  }
}

export const generatePDF = (plan: RehabilitationPlan, localDateStr?: string) => {
  const { patientInfo, legLength, exercises, sessionsPerDay, sessionTime, followUpTime } = plan;
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(20);
  doc.text('Rehabilitation Exercise Plan', 20, 20);

  // Add local timestamp
  if (localDateStr) {
    doc.setFontSize(10);
    doc.text(`Report Generated: ${localDateStr}`, 20, 30);
  }

  // Add patient information
  doc.setFontSize(12);
  doc.text(`Patient ID: ${patientInfo.patientId}`, 20, 40);
  doc.text(`Patient Name: ${patientInfo.patientName}`, 20, 50);
  doc.text(`Rehabilitation Phase: ${patientInfo.rehabilitationPhase}`, 20, 60);
  doc.text(`Leg Length: ${legLength} cm`, 20, 70);

  // Add session and follow-up time
  doc.text(`Session Start Time: ${sessionTime ? new Date(sessionTime).toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }) : ''}`, 20, 80);
  doc.text(`Follow-up Time: ${followUpTime ? new Date(followUpTime).toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }) : ''}`, 20, 90);

  // Add exercise parameters
  doc.setFontSize(14);
  doc.text('Exercise Parameters:', 20, 105);

  // 统一行高
  const lineHeight = 10;
  let y = 115;

  // Hip Flexion
  doc.setFontSize(12);
  doc.text('Hip Flexion:', 20, y); y += lineHeight;
  doc.text(`Target Angle: ${exercises.hipFlexion.targetAngle}°`, 30, y); y += lineHeight;
  doc.text(`Target Height: ${exercises.hipFlexion.targetHeight} cm`, 30, y); y += lineHeight;
  doc.text(`Hold Time: ${exercises.hipFlexion.holdTime} seconds`, 30, y); y += lineHeight;
  doc.text(`Repetitions: ${exercises.hipFlexion.repetitions}`, 30, y); y += lineHeight * 1.2;

  // Hamstring Curl
  doc.text('Hamstring Curl:', 20, y); y += lineHeight;
  doc.text(`Target Angle: ${exercises.hamstringCurl.targetAngle}°`, 30, y); y += lineHeight;
  doc.text(`Hold Time: ${exercises.hamstringCurl.holdTime} seconds`, 30, y); y += lineHeight;
  doc.text(`Repetitions: ${exercises.hamstringCurl.repetitions}`, 30, y); y += lineHeight * 1.2;

  // Heel Raise
  doc.text('Heel Raise:', 20, y); y += lineHeight;
  doc.text(`Target Height: ${exercises.heelRaise.targetHeight} cm`, 30, y); y += lineHeight;
  doc.text(`Hold Time: ${exercises.heelRaise.holdTime} seconds`, 30, y); y += lineHeight;
  doc.text(`Repetitions: ${exercises.heelRaise.repetitions}`, 30, y); y += lineHeight * 1.2;

  // Training Frequency
  doc.text(`Training Frequency: ${sessionsPerDay} sessions per day`, 20, y);

  return doc;
};

export const uploadPDF = async (
  patientId: string,
  rehabPhase: string,
  pdfDoc: jsPDF,
  reportDate?: Date // 可选，方便保证 PDF 内容和文件名一致
): Promise<{ url: string, fileName: string, localDateStr: string }> => {
  try {
    const storage = getStorage();
    const date = reportDate || new Date();
    const { fileName, localDateStr } = getSeattleTimestampFilename(date);
    const pdfBlob = pdfDoc.output('blob');
    const storageRef = ref(storage, `X-Heal-Reports/${patientId}/${rehabPhase}/${fileName}`);
    await uploadBytes(storageRef, pdfBlob);
    const downloadUrl = await getDownloadURL(storageRef);
    return { url: downloadUrl, fileName, localDateStr };
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw error;
  }
}; 