import React, { useState, useEffect } from 'react';
import localforage from 'localforage';
import { Calendar, Plus, Trash2, Clock, Target, Zap, Activity } from 'lucide-react';
import { useWebLLM } from '../context/WebLLMContext';
import './Planner.css';

export type SubjectType = 'STEM' | 'Humanities' | 'Language' | 'Arts' | 'Other';

interface StudySession {
  id: string;
  title: string;
  day: string;
  time?: string;
  durationHours: number;
  subjectType: SubjectType;
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const Planner: React.FC = () => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [title, setTitle] = useState('');
  const [day, setDay] = useState('Mon');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('1');
  const [subjectType, setSubjectType] = useState<SubjectType>('STEM');
  
  const { generateText, isReady } = useWebLLM();
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [weeklyGoal, setWeeklyGoal] = useState(20);

  // Load from local storage on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const savedSessions = await localforage.getItem<StudySession[]>('studbud_planner_sessions');
        if (savedSessions) {
          setSessions(savedSessions);
        }
      } catch (err) {
        console.error("Error loading sessions:", err);
      }
    };
    loadSessions();
  }, []);

  // Save to local storage when sessions change
  useEffect(() => {
    localforage.setItem('studbud_planner_sessions', sessions).catch(err => {
      console.error("Error saving sessions:", err);
    });
  }, [sessions]);

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newSession: StudySession = {
      id: Date.now().toString(),
      title: title.trim(),
      day,
      time: time || undefined,
      durationHours: parseFloat(duration),
      subjectType
    };

    setSessions([...sessions, newSession]);
    setTitle('');
    setDuration('1');
    setTime('');
    setSubjectType('STEM');
  };

  const handleAnalyzeSchedule = async () => {
    if (!isReady || sessions.length === 0) return;
    setIsAnalyzing(true);
    try {
      const scheduleSummary = sessions.map(s => `${s.day}: ${s.durationHours}h of ${s.subjectType} (${s.title})`).join('\n');
      const prompt = `Analyze this weekly study schedule and give a single, concise, insightful tip (max 2 sentences) on how to improve balance, avoid burnout, or optimize learning:\n\n${scheduleSummary}`;
      const response = await generateText(prompt, "You are an expert study coach and cognitive scientist.", 256);
      setAiInsight(response.replace(/```.*?```/gi, '').trim());
    } catch (err) {
      console.error(err);
      setAiInsight("Failed to generate insight. Ensure model is loaded.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteSession = (id: string) => {
    setSessions(sessions.filter(s => s.id !== id));
  };

  // Calculate total hours per day for the chart
  const hoursPerDay = DAYS_OF_WEEK.map(d => {
    const total = sessions.filter(s => s.day === d).reduce((acc, curr) => acc + curr.durationHours, 0);
    return { day: d, hours: total };
  });
  const maxHours = Math.max(...hoursPerDay.map(d => d.hours), 8);
  
  const totalHours = sessions.reduce((acc, s) => acc + s.durationHours, 0);
  const goalProgress = Math.min((totalHours / weeklyGoal) * 100, 100);
  
  const getSubjectColor = (type: SubjectType) => {
    switch (type) {
      case 'STEM': return 'var(--accent-cyan)';
      case 'Humanities': return 'var(--accent-primary)';
      case 'Language': return 'var(--accent-green)';
      case 'Arts': return 'var(--accent-purple)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className="planner-view animate-fade-in">
      <div className="planner-header">
        <h2>Study Planner</h2>
        <p>Organize your week and track your study hours entirely offline.</p>
      </div>

      <div className="planner-container">
        {/* Left Column: Form & Goal */}
        <div className="planner-left">
          {/* Goal Ring Panel */}
          <div className="glass-panel goal-panel text-center">
            <h3><Target size={18} color="var(--accent-green)" /> Weekly Goal</h3>
            <div className="goal-ring-container">
              <svg className="goal-ring" viewBox="0 0 100 100">
                <circle className="ring-bg" cx="50" cy="50" r="40"></circle>
                <circle 
                  className="ring-progress" 
                  cx="50" cy="50" r="40" 
                  strokeDasharray={`${goalProgress * 2.51} 251.2`} 
                ></circle>
              </svg>
              <div className="goal-text">
                <span className="goal-current">{totalHours}</span>
                <span className="goal-total">/ {weeklyGoal}h</span>
              </div>
            </div>
            <div className="euphoria-meter">
              <span>Balance Status:</span>
              <span style={{ color: totalHours > 0 && totalHours <= 30 ? 'var(--accent-green)' : (totalHours > 30 ? 'var(--accent-red)' : 'var(--text-muted)') }}>
                {totalHours === 0 ? 'Not Started' : (totalHours > 30 ? 'Burnout Risk' : 'Euphoric Balance')}
              </span>
            </div>
          </div>

          {/* Add Session Form */}
          <div className="glass-panel add-session-panel">
            <div className="panel-header">
              <h3><Calendar size={18} color="var(--accent-primary)" /> Create Session</h3>
            </div>
          
          <form onSubmit={handleAddSession} className="session-form">
            <div className="input-group">
              <label>What are you studying?</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Molecular Biology Ch 8"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="form-row">
              <div className="input-group">
                <label>Day</label>
                <select className="input-field" value={day} onChange={e => setDay(e.target.value)}>
                  {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              
              <div className="input-group">
                <label>Duration (Hours)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  min="0.5" 
                  step="0.5" 
                  max="12"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="input-group">
                <label>Subject Type</label>
                <select className="input-field" value={subjectType} onChange={e => setSubjectType(e.target.value as SubjectType)}>
                  <option value="STEM">STEM</option>
                  <option value="Humanities">Humanities</option>
                  <option value="Language">Language</option>
                  <option value="Arts">Arts</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="input-group">
                <label>Time (Optional)</label>
                <input 
                  type="time" 
                  className="input-field" 
                  value={time}
                  onChange={e => setTime(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '16px' }}>
              <Plus size={16} /> Add to Planner
            </button>
          </form>
        </div>
      </div>

        {/* Right Column: Chart & AI Insights & List */}
        <div className="planner-right">
          {/* AI Insights */}
          <div className="glass-panel ai-insights-panel">
            <div className="panel-header" style={{ marginBottom: aiInsight ? '16px' : '0' }}>
              <h3><Zap size={18} color="var(--accent-cyan)" /> StudBud Insight</h3>
              {isReady && sessions.length > 0 && !aiInsight && !isAnalyzing && (
                <button className="btn-cyan small-btn" onClick={handleAnalyzeSchedule} style={{ marginLeft: 'auto', padding: '6px 12px', fontSize: '13px' }}>
                  Analyze My Schedule
                </button>
              )}
            </div>
            
            {isAnalyzing && (
              <div className="ai-insight-box loading">
                <div className="spinner small"></div>
                <p>Analyzing your focus balance...</p>
              </div>
            )}
            
            {aiInsight && !isAnalyzing && (
              <div className="ai-insight-box">
                <p>{aiInsight}</p>
                <button className="icon-btn" onClick={handleAnalyzeSchedule} title="Re-analyze"><Zap size={14} /></button>
              </div>
            )}
            
            {!isReady && (
              <p className="text-muted" style={{ fontSize: '13px', marginTop: '8px' }}>AI model is not loaded. Initialize in Chat to get insights.</p>
            )}
          </div>

          {/* Weekly Chart */}
          <div className="glass-panel chart-panel">
            <div className="panel-header">
              <h3><Activity size={18} color="var(--accent-primary)" /> Weekly Focus</h3>
            </div>
          
          <div className="bar-chart-dynamic">
            {hoursPerDay.map((data) => (
              <div key={data.day} className="bar-group-dynamic">
                <div className={`bar-track-dynamic ${data.hours > 0 ? 'active' : ''}`}>
                  <div 
                    className="bar-fill-dynamic" 
                    style={{ height: `${(data.hours / maxHours) * 100}%` }}
                  ></div>
                  {data.hours > 0 && <span className="bar-label-inner-dynamic">{data.hours}h</span>}
                </div>
                <span className="bar-label-dynamic">{data.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Session List */}
        <div className="glass-panel list-panel">
          <div className="panel-header">
            <h3>Upcoming Sessions</h3>
          </div>
          
          {sessions.length === 0 ? (
            <div className="empty-state">
              <Clock size={40} color="var(--bg-secondary)" />
              <p>Your planner is empty. Add a session to get started.</p>
            </div>
          ) : (
            <div className="sessions-list">
              {sessions.map(session => (
                <div key={session.id} className="session-card">
                  <div className="session-info">
                    <h4>
                      <span className="subject-dot" style={{ background: getSubjectColor(session.subjectType) }}></span>
                      {session.title}
                    </h4>
                    <span className="session-meta">
                      <Calendar size={14} /> {session.day} {session.time ? `at ${session.time}` : ''} • {session.durationHours} hours • {session.subjectType}
                    </span>
                  </div>
                  <button className="delete-btn" onClick={() => handleDeleteSession(session.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default Planner;
