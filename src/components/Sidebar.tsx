import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Calendar, HelpCircle, MessageSquare, Settings, Sparkles, Sword } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import './Sidebar.css';

export const Sidebar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [showSettings, setShowSettings] = React.useState(false);

  return (
    <aside className="sidebar glass-panel-heavy">
      <div className="sidebar-header">
        <Sparkles className="logo-icon" size={28} />
        <div className="logo-text">
          <h2>StudBud.ai</h2>
          <span className="subtitle">PRODUCTIVE EUPHORIA</span>
        </div>
      </div>

      <NavLink to="/planner" className="btn-primary new-session-btn" style={{ textDecoration: 'none' }}>
        <span className="plus-icon">+</span> New Study Session
      </NavLink>

      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Calendar size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/planner" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Calendar size={20} />
          <span>Planner</span>
        </NavLink>
        <NavLink to="/chat" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <MessageSquare size={20} />
          <span>AI Chat</span>
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <BookOpen size={20} />
          <span>Analytics</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="settings-container" style={{ position: 'relative' }}>
          <button className="footer-item" onClick={() => setShowSettings(!showSettings)}>
            <Settings size={20} />
            <span>Settings</span>
          </button>
          
          {showSettings && (
            <div className="settings-dropdown">
              <button className="dropdown-item">Account</button>
              <button className="dropdown-item">Preferences</button>
              <button className="dropdown-item">Notifications</button>
              <button className="dropdown-item">Privacy</button>
            </div>
          )}
        </div>
        <button className="footer-item">
          <HelpCircle size={20} />
          <span>Help</span>
        </button>
        <button className="footer-item" onClick={toggleTheme}>
          <Sword size={20} />
          <span>{theme === 'modern' ? 'Retro Mode' : 'Modern Mode'}</span>
        </button>
        
        <div className="user-profile">
          <div className="avatar">A</div>
          <div className="user-info">
            <span className="name">Alex Rivera</span>
            <span className="status">Pro Student</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
