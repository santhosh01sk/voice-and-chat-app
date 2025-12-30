import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import ChatInterface from './components/ChatInterface';

const THEMES = {
  indigo: {
    primary: '#6366f1',
    primaryHover: '#4338ca',
    accent: '#a855f7',
    accentHover: '#7c3aed',
    gradient: 'linear-gradient(to bottom right, #6366f1, #a855f7, #ec4899)'
  },
  emerald: {
    primary: '#10b981',
    primaryHover: '#059669',
    accent: '#34d399',
    accentHover: '#059669',
    gradient: 'linear-gradient(to bottom right, #10b981, #34d399, #059669)'
  },
  rose: {
    primary: '#f43f5e',
    primaryHover: '#e11d48',
    accent: '#fb7185',
    accentHover: '#e11d48',
    gradient: 'linear-gradient(to bottom right, #f43f5e, #fb7185, #e11d48)'
  },
  amber: {
    primary: '#f59e0b',
    primaryHover: '#d97706',
    accent: '#fbbf24',
    accentHover: '#d97706',
    gradient: 'linear-gradient(to bottom right, #f59e0b, #fbbf24, #d97706)'
  },
  sky: {
    primary: '#0ea5e9',
    primaryHover: '#0284c7',
    accent: '#38bdf8',
    accentHover: '#0284c7',
    gradient: 'linear-gradient(to bottom right, #0ea5e9, #38bdf8, #0284c7)'
  }
};

function App() {
  const [user, setUser] = useState({
    username: '',
    roomId: '',
    joined: false
  });

  const [theme, setTheme] = useState(localStorage.getItem('chat-theme') || 'indigo');

  useEffect(() => {
    const selectedTheme = THEMES[theme] || THEMES.indigo;
    const root = document.documentElement;
    root.style.setProperty('--primary-color', selectedTheme.primary);
    root.style.setProperty('--primary-hover', selectedTheme.primaryHover);
    root.style.setProperty('--accent-color', selectedTheme.accent);
    root.style.setProperty('--accent-hover', selectedTheme.accentHover);
    root.style.setProperty('--bg-gradient', selectedTheme.gradient);
    localStorage.setItem('chat-theme', theme);
  }, [theme]);

  const handleJoin = (username, roomId) => {
    setUser({
      username,
      roomId,
      joined: true
    });
  };

  const handleLogout = () => {
    setUser({
      username: '',
      roomId: '',
      joined: false
    });
  };

  return (
    <div className="App">
      {!user.joined ? (
        <LoginScreen onJoin={handleJoin} theme={theme} onThemeChange={setTheme} themes={THEMES} />
      ) : (
        <ChatInterface
          username={user.username}
          roomId={user.roomId}
          onLogout={handleLogout}
          theme={theme}
          onThemeChange={setTheme}
          themes={THEMES}
        />
      )}
    </div>
  );
}

export default App;
