import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemIcon, Paper, Button, Divider } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import PersonIcon from '@mui/icons-material/Person';
import { ref, getDownloadURL, listAll } from 'firebase/storage';
import { storage } from '../firebase';

interface Report {
  filename: string;
  url: string;
  timestamp: number;
}

const Reports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setError(null);
      const reportsRef = ref(storage, 'doctor/reports');
      const result = await listAll(reportsRef);
      if (result.items.length === 0) {
        setReports([]);
        return;
      }
      const reportData = await Promise.all(
        result.items.map(async (item) => {
          try {
            const url = await getDownloadURL(item);
            const timestamp = parseInt(item.name.split('_').pop()?.replace('.pdf', '') || '0');
            return {
              filename: item.name,
              url,
              timestamp
            };
          } catch (err) {
            return null;
          }
        })
      );
      const validReports = reportData
        .filter((report): report is Report => report !== null)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 1);
      setReports(validReports);
    } catch (error) {
      setError("Failed to load reports. Please try again later.");
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5F6F7', py: 8, px: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 600, fontFamily: 'TeleNeo Extra Bold, Arial, sans-serif', mb: 4, textAlign: 'center' }}>
        Patient Report Overview
      </Typography>
      <Box sx={{ maxWidth: 800, mx: 'auto', pl: 0, mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, fontFamily: 'TeleNeo, Arial, sans-serif', color: '#E20074', letterSpacing: 1 }}>
          Patient Information
        </Typography>
      </Box>
      <Paper elevation={2} sx={{ maxWidth: 800, mx: 'auto', p: 0, overflow: 'hidden' }}>
        {/* 顶部横向信息栏 */}
        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#F5F6F7', px: 3, py: 2, pt: 0, padding:2 }}>
          <PersonIcon sx={{ color: '#E20074', mr: 1 }} />
          <Typography sx={{ fontWeight: 700, fontFamily: 'TeleNeo, Arial, sans-serif', mr: 3 }}>
            John Doe
          </Typography>
          <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
          <Typography sx={{ color: '#6A6A6A', fontFamily: 'TeleNeo, Arial, sans-serif', mr: 3 }}>
            ID: 1234
          </Typography>
          <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
          <Typography sx={{ color: '#6A6A6A', fontFamily: 'TeleNeo, Arial, sans-serif' }}>
            Phase: Early
          </Typography>
        </Box>
        <Divider />
        {/* 报告区块 */}
        <Box sx={{ px: 3, py: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FolderOpenIcon sx={{ color: '#E20074', mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'TeleNeo, Arial, sans-serif', color: '#E20074' }}>
              Latest Exercise Report
            </Typography>
          </Box>
          {error ? (
            <Typography sx={{ color: '#E20074', fontFamily: 'TeleNeo, Arial, sans-serif', py: 4, textAlign: 'center' }}>{error}</Typography>
          ) : reports.length > 0 ? (
            reports.map((report) => (
              <Box key={report.filename} sx={{ bgcolor: '#FAFAFA', borderRadius: 2, p: 3, boxShadow: 0, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PictureAsPdfIcon sx={{ color: '#E20074', mr: 1 }} />
                  <Typography sx={{ fontWeight: 600, fontFamily: 'TeleNeo, Arial, sans-serif', mr: 2 }}>
                    Latest Report: {formatDate(report.timestamp)}
                  </Typography>
                </Box>
                <Typography sx={{ color: '#6A6A6A', fontFamily: 'TeleNeo, Arial, sans-serif', mb: 2 }}>
                  Generated from John's most recent session
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  href={report.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ fontWeight: 600, fontFamily: 'TeleNeo, Arial, sans-serif', borderRadius: 2 }}
                >
                  View PDF Report
                </Button>
              </Box>
            ))
          ) : (
            <Typography sx={{ color: '#6A6A6A', fontFamily: 'TeleNeo, Arial, sans-serif', py: 4, textAlign: 'center' }}>
              No reports available at the moment.
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Reports; 