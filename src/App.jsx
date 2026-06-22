import React, { useState, useEffect, useRef } from 'react';
import { AppProvider, useApp } from './contexts/AppContext.jsx';
import { AudioProvider } from './contexts/AudioContext.jsx';
import Preloader from './components/ui/Preloader.jsx';
import MainLayout from './layouts/MainLayout.jsx';

function AppContent() {
  const [loading, setLoading] = useState(true);
  const [portfolioData, setPortfolioData] = useState(null);
  const { state } = useApp();

  useEffect(() => {
    const loadData = async () => {
      try {
        const files = [
          '/src/data/portfolio.json',
          '/src/data/projects.json',
          '/src/data/experience.json',
          '/src/data/skills.json',
          '/src/data/achievements.json'
        ];
        const results = await Promise.all(files.map(f => fetch(f).then(r => r.json())));
        setPortfolioData({
          portfolio: results[0],
          projects: results[1],
          experience: results[2],
          skills: results[3],
          achievements: results[4],
        });
      } catch (e) {
        console.warn('[V2] Data load failed, using fallback.', e);
        setPortfolioData({
          portfolio: {},
          projects: [],
          experience: [],
          skills: { categories: [], certifications: [] },
          achievements: { achievements: [], awards: [] },
        });
      }
    };
    loadData();
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
