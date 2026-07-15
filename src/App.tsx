import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import Dashboard from './views/Dashboard';
import AIChat from './views/AIChat';
import Planner from './views/Planner';
import Analytics from './views/Analytics';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <TopBar />
          <div className="view-container animate-fade-in">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/planner" element={<Planner />} />
              <Route path="/chat" element={<AIChat />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
    </ThemeProvider>
  );
}

export default App;
