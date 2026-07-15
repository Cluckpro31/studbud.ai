import React, { useEffect, useState } from 'react';
import { Target, Flame, Medal, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import localforage from 'localforage';
import './Dashboard.css';

interface StudySession {
  day: string;
  durationHours: number;
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [weeklyHours, setWeeklyHours] = useState<number[]>(Array(6).fill(0));
  const [streak, setStreak] = useState(0);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      // Calculate Streak
      const lastActive = await localforage.getItem<string>('studbud_last_active_date');
      let currentStreak = await localforage.getItem<number>('studbud_study_streak') || 0;
      const today = new Date().toDateString();
      
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = yesterdayDate.toDateString();

      if (lastActive !== today) {
        if (lastActive === yesterday) {
          currentStreak += 1;
        } else {
          currentStreak = lastActive ? 1 : 0;
        }
        await localforage.setItem('studbud_study_streak', currentStreak);
        await localforage.setItem('studbud_last_active_date', today);
      }
      setStreak(currentStreak);

      // Load Sessions
      const sessions = await localforage.getItem<StudySession[]>('studbud_planner_sessions') || [];
      const hours = DAYS_OF_WEEK.map(d => {
        return sessions.filter(s => s.day === d).reduce((acc, curr) => acc + curr.durationHours, 0);
      });
      setWeeklyHours(hours);

      // Calculate Points
      const queries = await localforage.getItem<number>('studbud_chat_queries') || 0;
      const totalHours = sessions.reduce((acc, curr) => acc + curr.durationHours, 0);
      const calculatedPoints = (totalHours * 100) + (queries * 10) + (currentStreak * 50);
      setPoints(calculatedPoints);
    };
    loadData();
  }, []);

  const maxHours = Math.max(...weeklyHours, 8); // At least 8 for scale
  
  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        {/* Academic Status Card */}
        <div className="glass-panel status-card delay-100">
          <div className="status-badges">
            <span className="badge">ACADEMIC STATUS</span>
            <span className="badge-text text-gradient">✨ TOP 2% NATIONWIDE</span>
          </div>
          
          <h1 className="greeting">Good morning, Alex.<br/>Ready for Euphoria?</h1>
          
          <p className="status-desc">
            Your cognitive peak is expected between 10 AM and 1 PM today. Let's tackle that Organic Chemistry quiz.
          </p>

          <div className="stats-container">
            <div className="stat-box">
              <div className="stat-icon bg-gradient-primary">
                <Flame size={18} color="white" />
              </div>
              <div className="stat-info">
                <span className="stat-label">Study Streak</span>
                <span className="stat-value">{streak} Days 🔥</span>
              </div>
            </div>
            
            <div className="stat-box">
              <div className="stat-icon bg-gradient-purple">
                <Medal size={18} color="white" />
              </div>
              <div className="stat-info">
                <span className="stat-label">Points Earned</span>
                <span className="stat-value">{points.toLocaleString()} XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Chat / Ask Anything Card */}
        <div className="glass-panel ask-card delay-200">
          <div className="ask-header">
            <div className="robot-icon">🤖</div>
          </div>
          <h3>Ask Anything</h3>
          <p>Instantly solve equations, summarize papers, or generate flashcards.</p>
          
          <div className="quick-ask-input" onClick={() => navigate('/chat')} style={{ cursor: 'pointer' }}>
            <input type="text" placeholder="Paste your problem or ask a question..." readOnly style={{ cursor: 'pointer' }} />
            <button className="send-btn" onClick={(e) => { e.stopPropagation(); navigate('/chat'); }}>
              <Play size={16} fill="white" />
            </button>
          </div>
        </div>

        {/* Weekly Focus Planner */}
        <div className="glass-panel planner-card delay-300">
          <div className="planner-header">
            <div>
              <span className="label">Weekly Focus</span>
              <h3>STUDENT PLANNER</h3>
            </div>
            <div className="planner-nav">
              <button><ChevronLeft size={18} /></button>
              <button><ChevronRight size={18} /></button>
            </div>
          </div>

          <div className="bar-chart">
            {DAYS_OF_WEEK.map((day, i) => (
              <div key={day} className="bar-group">
                <div className={`bar-track ${weeklyHours[i] > 0 ? 'active' : ''}`}>
                  <div 
                    className="bar-fill" 
                    style={{ height: `${(weeklyHours[i] / maxHours) * 100}%` }}
                  ></div>
                  {weeklyHours[i] > 0 && <span className="bar-label-inner">{weeklyHours[i]}h</span>}
                </div>
                <span className="bar-label">{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next Challenge Card */}
        <div className="glass-panel challenge-card delay-300">
          <span className="badge outline">Next Challenge</span>
          <h3>Molecular Biology Quiz</h3>
          <p>Topic: Krebs Cycle Essentials</p>
          
          <ul className="challenge-details">
            <li><Target size={14} color="var(--accent-cyan)" /> 15 Critical Questions</li>
            <li><Target size={14} color="var(--accent-cyan)" /> Estimated time: 10 mins</li>
          </ul>

          <button className="btn-cyan start-session-btn" onClick={() => navigate('/quiz')}>
            Start Session Now <Play size={14} fill="black" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
