import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Typography,
  Paper,
  Snackbar,
  Alert,
  Tooltip,
  IconButton
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { RehabilitationPlan, RehabilitationPhase } from '../types';
import { uploadPatientData } from '../services/firebase';

const validationSchema = Yup.object({
  patientInfo: Yup.object({
    patientId: Yup.string().required('Patient ID is required'),
    patientName: Yup.string().required('Patient name is required'),
    rehabilitationPhase: Yup.string().oneOf(['Early', 'Mid', 'Late'] as const).required('Rehabilitation phase is required'),
  }),
  legLength: Yup.number()
    .required('Leg length is required')
    .positive('Leg length must be positive'),
  exercises: Yup.object({
    hipFlexion: Yup.object({
      targetAngle: Yup.number()
        .required('Target angle is required')
        .min(0, 'Angle must be positive')
        .max(180, 'Angle must be less than 180'),
      holdTime: Yup.number()
        .required('Hold time is required')
        .positive('Hold time must be positive'),
      repetitions: Yup.number()
        .required('Repetitions is required')
        .positive('Repetitions must be positive'),
      targetHeight: Yup.number(),
    }),
    hamstringCurl: Yup.object({
      targetAngle: Yup.number().required('Required'),
      holdTime: Yup.number().required('Required'),
      repetitions: Yup.number().required('Required')
    }),
    heelRaise: Yup.object({
      targetAngle: Yup.number()
        .required('Target angle is required')
        .min(0, 'Angle must be positive')
        .max(180, 'Angle must be less than 180'),
      targetHeight: Yup.number()
        .required('Target height is required')
        .positive('Target height must be positive'),
      holdTime: Yup.number()
        .required('Hold time is required')
        .positive('Hold time must be positive'),
      repetitions: Yup.number()
        .required('Repetitions is required')
        .positive('Repetitions must be positive'),
    }),
  }),
  sessionsPerDay: Yup.number()
    .required('Sessions per day is required')
    .min(1, 'Minimum 1 session per day')
    .max(10, 'Maximum 10 sessions per day'),
  sessionTime: Yup.string().required('Session time is required'),
  followUpTime: Yup.string().required('Follow-up time is required'),
});

const initialValues: RehabilitationPlan = {
  patientInfo: {
    patientId: '',
    patientName: '',
    rehabilitationPhase: 'Early',
  },
  legLength: 0,
  exercises: {
    hipFlexion: {
      targetAngle: 30,
      holdTime: 5,
      repetitions: 10,
      targetHeight: 0,
    },
    hamstringCurl: {
      targetAngle: 90,
      holdTime: 5,
      repetitions: 10,
    },
    heelRaise: {
      targetAngle: 0,
      targetHeight: 3,
      holdTime: 5,
      repetitions: 10,
    },
  },
  sessionsPerDay: 2,
  sessionTime: '',
  followUpTime: '',
};

const InputModule: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
    pdfUrl: string | null;
    errorDetails?: string;
  }>({
    open: false,
    message: '',
    severity: 'success',
    pdfUrl: null,
  });

  const [heelRaise, setHeelRaise] = useState(3);

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      // 在 onSubmit 前计算 Target Height
      const { legLength, exercises } = formik.values;
      const angleInRadians = exercises.hipFlexion.targetAngle * Math.PI / 180;
      const calculatedHeight = (legLength * Math.sin(angleInRadians)).toFixed(1);
      await formik.setFieldValue("exercises.hipFlexion.targetHeight", parseFloat(calculatedHeight));
      // 继续原有提交逻辑
      try {
        const result = await uploadPatientData(values.patientInfo.patientId, {
          ...values,
          exercises: {
            ...values.exercises,
            hipFlexion: {
              ...values.exercises.hipFlexion,
              targetHeight: parseFloat(calculatedHeight)
            }
          }
        });
        setSnackbar({
          open: true,
          message: result.success 
            ? 'Patient data and report successfully uploaded!' 
            : `Failed to upload data: ${result.errorDetails || 'Unknown error'}`,
          severity: result.success ? 'success' : 'error',
          pdfUrl: result.success ? result.pdfUrl : null,
          errorDetails: result.errorDetails
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        setSnackbar({
          open: true,
          message: `Error: ${errorMessage}`,
          severity: 'error',
          pdfUrl: null,
          errorDetails: errorMessage
        });
      }
    },
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    formik.handleChange(e);
    const { name, value } = e.target;
    if (name === 'legLength' || name === 'exercises.hipFlexion.targetAngle') {
      const legLength = name === 'legLength' ? Number(value) : formik.values.legLength;
      const targetAngle = name === 'exercises.hipFlexion.targetAngle' ? Number(value) : formik.values.exercises.hipFlexion.targetAngle;
      const targetHeight = legLength * Math.sin(targetAngle * Math.PI / 180);
      formik.setFieldValue('exercises.hipFlexion.targetHeight', targetHeight.toFixed(1));
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5F6F7', py: 6 }}>
      {/* 返回箭头按钮，Header 下方，表格外部，尽量与 logo 左对齐 */}
      {onBack && (
        <Box sx={{ position: 'relative', maxWidth: 800, mx: 'auto' }}>
          <IconButton
            onClick={onBack}
            sx={{
              position: 'absolute',
              top: { xs: -56, sm: -56 }, // Header 高度下方
              left: { xs: 0, sm: 0 },
              zIndex: 10,
              bgcolor: '#fff',
              boxShadow: 1,
              borderRadius: 2,
              mt: 2,
              ml: { xs: 0, sm: 0 },
            }}
            aria-label="Back to homepage"
          >
            <ArrowBackIosNewIcon sx={{ color: '#E10174' }} />
          </IconButton>
        </Box>
      )}
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography
              variant="h4"
              sx={{
                fontFamily: 'TeleNeo, Arial, sans-serif',
                fontWeight: 700,
                flexGrow: 0
              }}
            >
              Patient Rehab Parameters
            </Typography>
            <Tooltip title="Input and manage patient rehabilitation plans here.">
              <IconButton sx={{ ml: 1 }}>
                <InfoOutlinedIcon sx={{ color: '#999B9E' }} />
              </IconButton>
            </Tooltip>
          </Box>

          <form onSubmit={formik.handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Patient Information Section */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Patient Information
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <TextField
                      fullWidth
                      name="patientInfo.patientId"
                      label="Patient ID"
                      value={formik.values.patientInfo.patientId}
                      onChange={handleChange}
                      error={formik.touched.patientInfo?.patientId && Boolean(formik.errors.patientInfo?.patientId)}
                      helperText={formik.touched.patientInfo?.patientId && formik.errors.patientInfo?.patientId}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <TextField
                      fullWidth
                      name="patientInfo.patientName"
                      label="Patient Name"
                      value={formik.values.patientInfo.patientName}
                      onChange={handleChange}
                      error={formik.touched.patientInfo?.patientName && Boolean(formik.errors.patientInfo?.patientName)}
                      helperText={formik.touched.patientInfo?.patientName && formik.errors.patientInfo?.patientName}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <TextField
                      fullWidth
                      select
                      name="patientInfo.rehabilitationPhase"
                      label="Rehabilitation Phase"
                      value={formik.values.patientInfo.rehabilitationPhase}
                      onChange={handleChange}
                      error={formik.touched.patientInfo?.rehabilitationPhase && Boolean(formik.errors.patientInfo?.rehabilitationPhase)}
                      helperText={formik.touched.patientInfo?.rehabilitationPhase && formik.errors.patientInfo?.rehabilitationPhase}
                    >
                      {['Early', 'Mid', 'Late'].map((phase) => (
                        <MenuItem key={phase} value={phase}>
                          {phase}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                </Box>
              </Box>

              {/* Measurement Input Section */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Measurements
                </Typography>
                <TextField
                  fullWidth
                  name="legLength"
                  label="Leg Length (cm)"
                  type="number"
                  value={formik.values.legLength}
                  onChange={handleChange}
                  error={formik.touched.legLength && Boolean(formik.errors.legLength)}
                  helperText={formik.touched.legLength && formik.errors.legLength}
                />
              </Box>

              {/* Exercise Parameters Section */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Exercise Parameters
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Hip Flexion */}
                  <Box sx={{ mb:0 }}>
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                      Hip Flexion
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ flex: '1 1 200px' }}>
                        <TextField
                          fullWidth
                          name="exercises.hipFlexion.targetAngle"
                          label="Target Angle (°)"
                          type="number"
                          value={formik.values.exercises.hipFlexion.targetAngle}
                          onChange={handleChange}
                          error={formik.touched.exercises?.hipFlexion?.targetAngle && Boolean(formik.errors.exercises?.hipFlexion?.targetAngle)}
                          helperText={
                            <Typography
                              variant="body2"
                              sx={{ fontSize: '1rem', fontWeight: 'bold', display: 'inline', whiteSpace: 'nowrap' }}
                              component="span"
                            >
                              Calculated Height: {formik.values.exercises.hipFlexion.targetHeight} cm
                            </Typography>
                          }
                        />
                      </Box>
                      <Box sx={{ flex: '1 1 200px' }}>
                        <TextField
                          fullWidth
                          name="exercises.hipFlexion.holdTime"
                          label="Hold Time (s)"
                          type="number"
                          value={formik.values.exercises.hipFlexion.holdTime}
                          onChange={handleChange}
                          error={formik.touched.exercises?.hipFlexion?.holdTime && Boolean(formik.errors.exercises?.hipFlexion?.holdTime)}
                          helperText={formik.touched.exercises?.hipFlexion?.holdTime && formik.errors.exercises?.hipFlexion?.holdTime}
                        />
                      </Box>
                      <Box sx={{ flex: '1 1 200px' }}>
                        <TextField
                          fullWidth
                          name="exercises.hipFlexion.repetitions"
                          label="Repetitions"
                          type="number"
                          value={formik.values.exercises.hipFlexion.repetitions}
                          onChange={handleChange}
                          error={formik.touched.exercises?.hipFlexion?.repetitions && Boolean(formik.errors.exercises?.hipFlexion?.repetitions)}
                          helperText={formik.touched.exercises?.hipFlexion?.repetitions && formik.errors.exercises?.hipFlexion?.repetitions}
                        />
                      </Box>
                    </Box>
                  </Box>

                  {/* Hamstring Curl */}
                  <Box>
                    <Typography variant="body1" sx={{ mb:1, fontWeight: 500 }}>
                      Hamstring Curl
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ flex: '1 1 200px' }}>
                        <TextField
                          fullWidth
                          name="exercises.hamstringCurl.targetAngle"
                          label="Target Angle"
                          type="number"
                          value={formik.values.exercises.hamstringCurl.targetAngle}
                          onChange={handleChange}
                          error={formik.touched.exercises?.hamstringCurl?.targetAngle && Boolean(formik.errors.exercises?.hamstringCurl?.targetAngle)}
                          helperText={formik.touched.exercises?.hamstringCurl?.targetAngle && formik.errors.exercises?.hamstringCurl?.targetAngle}
                        />
                      </Box>
                      <Box sx={{ flex: '1 1 200px' }}>
                        <TextField
                          fullWidth
                          name="exercises.hamstringCurl.holdTime"
                          label="Hold Time (seconds)"
                          type="number"
                          value={formik.values.exercises.hamstringCurl.holdTime}
                          onChange={handleChange}
                          error={formik.touched.exercises?.hamstringCurl?.holdTime && Boolean(formik.errors.exercises?.hamstringCurl?.holdTime)}
                          helperText={formik.touched.exercises?.hamstringCurl?.holdTime && formik.errors.exercises?.hamstringCurl?.holdTime}
                        />
                      </Box>
                      <Box sx={{ flex: '1 1 200px' }}>
                        <TextField
                          fullWidth
                          name="exercises.hamstringCurl.repetitions"
                          label="Repetitions"
                          type="number"
                          value={formik.values.exercises.hamstringCurl.repetitions}
                          onChange={handleChange}
                          error={formik.touched.exercises?.hamstringCurl?.repetitions && Boolean(formik.errors.exercises?.hamstringCurl?.repetitions)}
                          helperText={formik.touched.exercises?.hamstringCurl?.repetitions && formik.errors.exercises?.hamstringCurl?.repetitions}
                        />
                      </Box>
                    </Box>
                  </Box>

                  {/* Heel Raise */}
                  <Box>
                    <Typography variant="body1" sx={{ mb:1, fontWeight: 500 }}>
                      Heel Raise
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ flex: '1 1 200px' }}>
                        <TextField
                          fullWidth
                          name="exercises.heelRaise.targetAngle"
                          label="Target Angle (°)"
                          type="number"
                          value={formik.values.exercises.heelRaise.targetAngle}
                          onChange={handleChange}
                          error={formik.touched.exercises?.heelRaise?.targetAngle && Boolean(formik.errors.exercises?.heelRaise?.targetAngle)}
                          helperText={formik.touched.exercises?.heelRaise?.targetAngle && formik.errors.exercises?.heelRaise?.targetAngle}
                        />
                      </Box>
                      <Box sx={{ flex: '1 1 200px' }}>
                        <TextField
                          fullWidth
                          name="exercises.heelRaise.targetHeight"
                          label="Target Height (cm)"
                          type="number"
                          value={formik.values.exercises.heelRaise.targetHeight}
                          onChange={handleChange}
                          error={formik.touched.exercises?.heelRaise?.targetHeight && Boolean(formik.errors.exercises?.heelRaise?.targetHeight)}
                          helperText={formik.touched.exercises?.heelRaise?.targetHeight && formik.errors.exercises?.heelRaise?.targetHeight}
                        />
                      </Box>
                      <Box sx={{ flex: '1 1 200px' }}>
                        <TextField
                          fullWidth
                          name="exercises.heelRaise.holdTime"
                          label="Hold Time (s)"
                          type="number"
                          value={formik.values.exercises.heelRaise.holdTime}
                          onChange={handleChange}
                          error={formik.touched.exercises?.heelRaise?.holdTime && Boolean(formik.errors.exercises?.heelRaise?.holdTime)}
                          helperText={formik.touched.exercises?.heelRaise?.holdTime && formik.errors.exercises?.heelRaise?.holdTime}
                        />
                      </Box>
                      <Box sx={{ flex: '1 1 200px' }}>
                        <TextField
                          fullWidth
                          name="exercises.heelRaise.repetitions"
                          label="Repetitions"
                          type="number"
                          value={formik.values.exercises.heelRaise.repetitions}
                          onChange={handleChange}
                          error={formik.touched.exercises?.heelRaise?.repetitions && Boolean(formik.errors.exercises?.heelRaise?.repetitions)}
                          helperText={formik.touched.exercises?.heelRaise?.repetitions && formik.errors.exercises?.heelRaise?.repetitions}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Training Frequency Section */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Training Frequency
                </Typography>
                <TextField
                  fullWidth
                  name="sessionsPerDay"
                  label="Sessions per Day"
                  type="number"
                  value={formik.values.sessionsPerDay}
                  onChange={handleChange}
                  error={formik.touched.sessionsPerDay && Boolean(formik.errors.sessionsPerDay)}
                  helperText={formik.touched.sessionsPerDay && formik.errors.sessionsPerDay}
                />
              </Box>

              {/* Session & Follow-up Time Section */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Session & Follow-up Time
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <TextField
                      fullWidth
                      name="sessionTime"
                      label="Session Start Time"
                      type="datetime-local"
                      value={formik.values.sessionTime}
                      onChange={handleChange}
                      error={formik.touched.sessionTime && Boolean(formik.errors.sessionTime)}
                      helperText={formik.touched.sessionTime && formik.errors.sessionTime}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <TextField
                      fullWidth
                      name="followUpTime"
                      label="Follow-up Time"
                      type="datetime-local"
                      value={formik.values.followUpTime}
                      onChange={handleChange}
                      error={formik.touched.followUpTime && Boolean(formik.errors.followUpTime)}
                      helperText={formik.touched.followUpTime && formik.errors.followUpTime}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  size="large"
                >
                  Upload Data
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          action={
            snackbar.pdfUrl && (
              <Button 
                color="inherit" 
                size="small"
                onClick={() => window.open(snackbar.pdfUrl!, '_blank')}
              >
                View Report
              </Button>
            )
          }
          sx={{ width: '100%' }}
        >
          <Typography variant="body1">{snackbar.message}</Typography>
          {snackbar.errorDetails && (
            <Typography variant="body2" sx={{ mt: 1, fontSize: '0.875rem' }}>
              {snackbar.errorDetails}
            </Typography>
          )}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InputModule; 