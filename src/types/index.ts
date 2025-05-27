export type RehabilitationPhase = 'Early' | 'Mid' | 'Late';

export interface PatientInfo {
  patientId: string;
  patientName: string;
  rehabilitationPhase: RehabilitationPhase;
}

export interface ExerciseParameters {
  targetAngle: number;
  targetHeight?: number;
  holdTime: number;
  repetitions: number;
}

export interface RehabilitationPlan {
  patientInfo: PatientInfo;
  legLength: number;
  exercises: {
    hipFlexion: ExerciseParameters;
    hamstringCurl: ExerciseParameters;
    heelRaise: ExerciseParameters;
  };
  sessionsPerDay: number;
  sessionTime: string;
  followUpTime: string;
}

export interface Report {
  patientInfo: PatientInfo;
  plan: RehabilitationPlan;
  progress?: {
    completionRate: number;
    lastUpdated: Date;
  };
} 