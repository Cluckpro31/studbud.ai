import React, { useEffect, useState } from 'react';
import localforage from 'localforage';
import { BarChart2, BookOpen, Clock, Brain, Activity, Zap } from 'lucide-react';
import './Analytics.css';

export type SubjectType = 'STEM' | 'Humanities' | 'Language' | 'Arts' | 'Other';

interface StudySession {
  id: string;
  title: string;
  day: string;
  time?: string;
  durationHours: number;
  subjectType: SubjectType;
}

const Analytics: React.FC = () => {
  const [totalHours, setTotalHours] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [aiQueries, setAiQueries] = useState(0);
  const [subjectData, setSubjectData] = useState<{ subject: string, hours: number }[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const sessions = await localforage.getItem<StudySession[]>('studbud_planner_sessions') || [];
        const queries = await localforage.getItem<number>('studbud_chat_queries') || 0;

        const hours = sessions.reduce((acc, s) => acc + s.durationHours, 0);
        setTotalHours(hours);
        setTotalSessions(sessions.length);
        setAiQueries(queries);

        const subjectMap: Record<string, number> = {};
        sessions.forEach(s => {
          const type = s.subjectType || 'Other';
          subjectMap[type] = (subjectMap[type] || 0) + s.durationHours;
        });

        const sortedSubjects = Object.keys(subjectMap).map(k => ({
          subject: k,
          hours: subjectMap[k]
        })).sort((a, b) => b.hours - a.hours);

        setSubjectData(sortedSubjects);

      } catch (err) {
        console.error("Error loading analytics:", err);
      }
    };
    loadData();
  }, []);

  const getSubjectColor = (type: string) => {
    switch (type) {
      case 'STEM': return 'var(--accent-cyan)';
      case 'Humanities': return 'var(--accent-primary)';
      case 'Language': return 'var(--accent-green)';
      case 'Arts': return 'var(--accent-purple)';
      default: return 'var(--text-secondary)';
    }
  };

  const getEuphoriaStatus = () => {
    if (totalHours === 0) return { text: "Just Started", color: "var(--text-muted)", icon: <Clock /> };
    if (totalHours > 30) return { text: "Burnout Risk", color: "var(--accent-red)", icon: <Activity /> };
    return { text: "Euphoric Balance", color: "var(--accent-green)", icon: <Zap /> };
  };

  const euphoria = getEuphoriaStatus();
  const maxSubjectHours = subjectData.length > 0 ? subjectData[0].hours : 1;

  return (
    <div className="analytics-view animate-fade-in">
      <div className="analytics-header">
        <h2>Data Hub</h2>
        <p>Insights and comprehensive stats across your study sessions and AI interactions.</p>
      </div>

      <div className="analytics-grid">
        {/* Overview Stats */}
        <div className="glass-panel stats-card">
          <div className="panel-header">
            <h3><Activity size={18} color="var(--accent-primary)" /> Lifetime Overview</h3>
          </div>
          
          <div className="stats-row">
            <div className="stat-box">
              <div className="stat-icon bg-gradient-cyan"><Clock size={20} color="white" /></div>
              <div className="stat-info">
                <span className="stat-value">{totalHours}h</span>
                <span className="stat-label">Total Studied</span>
              </div>
            </div>
            
            <div className="stat-box">
              <div className="stat-icon bg-gradient-primary"><BookOpen size={20} color="white" /></div>
              <div className="stat-info">
                <span className="stat-value">{totalSessions}</span>
                <span className="stat-label">Total Sessions</span>
              </div>
            </div>
            
            <div className="stat-box">
              <div className="stat-icon bg-gradient-purple"><Brain size={20} color="white" /></div>
              <div className="stat-info">
                <span className="stat-value">{aiQueries}</span>
                <span className="stat-label">AI Queries</span>
              </div>
            </div>
          </div>

          <div className="euphoria-status-box" style={{ borderColor: euphoria.color }}>
            <div className="euphoria-icon" style={{ color: euphoria.color }}>{euphoria.icon}</div>
            <div className="euphoria-info">
              <h4>{euphoria.text}</h4>
              <p>Your current cognitive load status based on planner hours.</p>
            </div>
          </div>
        </div>

        {/* Subject Distribution */}
        <div className="glass-panel subject-card">
          <div className="panel-header">
            <h3><BarChart2 size={18} color="var(--accent-cyan)" /> Subject Distribution</h3>
          </div>
          
          {subjectData.length === 0 ? (
            <div className="empty-state">
              <BookOpen size={40} color="var(--bg-secondary)" />
              <p>No study sessions recorded yet.</p>
            </div>
          ) : (
            <div className="subject-bars">
              {subjectData.map((data) => (
                <div key={data.subject} className="subject-bar-row">
                  <div className="subject-bar-label">
                    <span className="dot" style={{ background: getSubjectColor(data.subject) }}></span>
                    {data.subject}
                  </div>
                  <div className="subject-bar-track">
                    <div 
                      className="subject-bar-fill"
                      style={{ 
                        width: `${(data.hours / maxSubjectHours) * 100}%`,
                        background: getSubjectColor(data.subject)
                      }}
                    ></div>
                  </div>
                  <div className="subject-bar-value">{data.hours}h</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
