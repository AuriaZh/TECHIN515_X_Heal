import React, { useState } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import InputModule from './components/InputModule';
import { Box, Button, Typography, AppBar, Toolbar, Tabs, Tab, Container } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import logo from './assets/tmobile-logo.jpg';
import Reports from './components/Reports';

const NAV_TABS = [
  { label: 'Home', icon: null },
  { label: 'Rehab Parameters', icon: null },
  { label: 'Reports', icon: null },
  { label: 'Analytics', icon: null },
  { label: 'Settings', icon: null },
  { label: 'Help', icon: null },
];

const DOCTOR_NAME = 'Smith'; // 可后续动态化

function App() {
  const [tab, setTab] = useState(0);
  const [showInput, setShowInput] = useState(false);

  // 切换 tab 时，只有 Rehab Parameters 进入 InputModule，其他 tab 只切 tab
  const handleTabChange = (_: any, newValue: number) => {
    setTab(newValue);
    setShowInput(newValue === 1); // 1 = Rehab Parameters
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* 合并 Logo 和导航栏 */}
      <AppBar position="static" color="primary" sx={{ boxShadow: 0, minHeight: 64, justifyContent: 'center' }}>
        <Toolbar sx={{ minHeight: 64, px: 0, display: 'flex', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
            <img src={logo} alt="T-Mobile Logo" style={{ height: 40, marginRight: 16 }} />
          </Box>
          <Tabs
            value={showInput ? 1 : tab}
            onChange={handleTabChange}
            textColor="inherit"
            TabIndicatorProps={{ style: { height: 2, background: '#E20074' } }}
            sx={{
              '.MuiTabs-indicator': { backgroundColor: '#E20074' },
              minHeight: 64,
              ml: 2
            }}
          >
            {NAV_TABS.map((t, idx) => (
              <Tab
                key={t.label}
                label={t.label}
                sx={{
                  fontWeight: (showInput ? 1 : tab) === idx ? 700 : 500,
                  minHeight: 64,
                  fontFamily: 'TeleNeo, Arial, sans-serif',
                  textTransform: 'none',
                  fontSize: 18,
                  mr: 2,
                  px: 2.5,
                  py: 1.25,
                  borderBottom: (showInput ? 1 : tab) === idx ? '2px solid #E20074' : '2px solid transparent',
                  transition: 'color 0.3s, border-bottom 0.3s',
                  '&:hover': {
                    color: '#861B54',
                    background: 'none',
                  },
                }}
              />
            ))}
          </Tabs>
        </Toolbar>
      </AppBar>
      {/* Home Page */}
      {!showInput && tab === 0 && (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F5F6F7', py: 8, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: 'TeleNeo Extra Bold, Arial, sans-serif', mb: 2 }}>
            Good to see you, Dr. {DOCTOR_NAME}!
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 500, fontFamily: 'TeleNeo, Arial, sans-serif', mb: 4, color: '#E20074' }}>
            Today's Priorities
          </Typography>
          <Box sx={{ bgcolor: '#fff', borderRadius: 3, boxShadow: 1, px: 4, py: 3, mb: 4, minWidth: 320, maxWidth: 400 }}>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 2, color: '#B8005A' }}>
              3 patients require immediate follow-up.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              sx={{ fontWeight: 600, fontSize: 18, px: 4, py: 1.5, borderRadius: 2 }}
              onClick={() => { setShowInput(true); setTab(1); }}
            >
              View Patient List
            </Button>
          </Box>
        </Box>
      )}
      {/* Rehab Parameters Page */}
      {showInput && (
        <Box sx={{ position: 'relative', minHeight: '100vh', bgcolor: '#F5F6F7', py: 6 }}>
          <InputModule />
        </Box>
      )}
      {/* Reports Page */}
      {!showInput && tab === 2 && (
        <Reports />
      )}
      {/* 其他 tab 占位 */}
      {!showInput && tab > 1 && (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F5F6F7', py: 8, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 600, fontFamily: 'TeleNeo Extra Bold, Arial, sans-serif', mb: 4 }}>
            {NAV_TABS[tab].label} (Coming Soon)
          </Typography>
        </Box>
      )}
    </ThemeProvider>
  );
}

export default App;
