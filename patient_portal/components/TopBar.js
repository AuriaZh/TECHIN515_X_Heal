import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const showBack = location.pathname !== "/exercise";
  return (
    <div style={{
      background: '#E10174', color: '#fff', padding: '12px', fontWeight: 'bold',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    }}>
      <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
        {showBack && (
          <button onClick={() => navigate(-1)} style={{background:'none',border:'none',color:'#fff',fontSize:'20px',cursor:'pointer',padding:0}}>&lt;</button>
        )}
        <span>Rehabilitation Training</span>
      </div>
      <nav style={{display: 'flex', gap: '20px'}}>
        <Link to="/exercise" style={{color:'#fff',textDecoration:'none'}}>Exercise</Link>
        <Link to="/history" style={{color:'#fff',textDecoration:'none'}}>History</Link>
        <Link to="/profile" style={{color:'#fff',textDecoration:'none'}}>Profile</Link>
      </nav>
    </div>
  );
};

export default TopBar; 