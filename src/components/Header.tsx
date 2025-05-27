import React from 'react';
import { AppBar, Toolbar, Box } from '@mui/material';
import logo from '../assets/tmobile-logo.jpg';

const Header: React.FC = () => (
  <AppBar position="static" color="primary" sx={{ mb: 4 }}>
    <Toolbar>
      <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
        <img src={logo} alt="T-Mobile Logo" style={{ height: 40, marginRight: 16 }} />
      </Box>
    </Toolbar>
  </AppBar>
);

export default Header; 