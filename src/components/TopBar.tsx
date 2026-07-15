import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Zap } from 'lucide-react';
import './TopBar.css';

export const TopBar: React.FC = () => {
  const navigate = useNavigate();
  return (
    <header className="topbar">
      <div className="search-container">
        <Search className="search-icon" size={18} />
        <input 
          type="text" 
          placeholder="Search resources, topics..." 
          className="search-input"
        />
      </div>

      <div className="topbar-actions">
        <button className="btn-cyan ask-ai-btn" onClick={() => navigate('/chat')}>
          <Zap size={16} />
          <span>Ask AI</span>
        </button>
        

      </div>
    </header>
  );
};
