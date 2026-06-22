import React, { useState, useEffect, useRef } from 'react';
import { AppProvider, useApp } from './contexts/AppContext.jsx';
import { AudioProvider } from './contexts/AudioContext.jsx';
import Preloader from './components/ui/Preloader.jsx';
import MainLayout from './layouts/MainLayout.jsx';

import portfolio from './data/portfolio.json';
import projects from './data/projects.json';
import experience from './data/experience.json';
import skills from './data/skills.json';
import achievements from './data/achievements.json';

function AppContent() {
  const [loading, setLoading] = useState(true);
  const [portfolioData, setPortfolioData] = useState(null);
  const { state } = useApp();

  useEffect(() => {
    setPortfolioData({
      portfolio,
      projects,
      experience,
      skills,
      achievements,
    });
  }, []);

  const handleComplete = () => {
    setLoading(false);
  };

  if (loading || !portfolioData) {
    return <Preloader onComplete={handleComplete} data={portfolioData} />;
  }

  return <MainLayout portfolioData={portfolioData} />;
}

export default function App() {
  return (
    <AppProvider>
      <AudioProvider>
        <AppContent />
      </AudioProvider>
    </AppProvider>
  );
}
