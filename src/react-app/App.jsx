import React, { useState, useEffect } from 'react';
import AppShell from './components/AppShell';
import ResultScorecard from './components/ResultScorecard';
import EntryForm from './components/EntryForm';
import Dashboard from './components/Dashboard';
import ScenarioPicker from './components/ScenarioPicker';
import SimulationConsent from './components/SimulationConsent';
import ChatShell from './components/ChatShell';
import './app.css';
import Hotlines from './components/Hotlines';
import ShareCard from './components/ShareCard';

export default function App() {
  const [userName, setUserName] = useState(() => {
    try {
      return localStorage.getItem('aisi_user_name') || '';
    } catch {
      return '';
    }
  });

  const [accessibility, setAccessibility] = useState(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('aisi_accessibility') || '{}');
      return {
        largeText: parsed.largeText === true,
        highContrast: parsed.highContrast === true,
      };
    } catch {
      return { largeText: false, highContrast: false };
    }
  });

  const [route, setRoute] = useState(window.location.hash);
  const [latestSessionId, setLatestSessionId] = useState(() => {
    try {
      return localStorage.getItem('aisi_last_session_id') || '';
    } catch {
      return '';
    }
  });
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('aisi_history') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('large-text', accessibility.largeText);
    document.body.classList.toggle('high-contrast', accessibility.highContrast);
    try {
      localStorage.setItem('aisi_accessibility', JSON.stringify(accessibility));
    } catch {}
  }, [accessibility]);

  const handleUpdateAccessibility = (key, value) => {
    setAccessibility(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveName = (name) => {
    setUserName(name);
    try {
      localStorage.setItem('aisi_user_name', name);
    } catch {}
    window.location.hash = '';
  };

  const handleResetName = () => {
    setUserName('');
    try {
      localStorage.removeItem('aisi_user_name');
    } catch {}
    window.location.hash = '';
  };

  const handleStartTraining = (scenarioId, difficulty) => {
    fetch('/api/sessions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        scenarioId,
        difficulty,
        userName: userName || 'Bạn',
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Không thể khởi tạo phiên luyện tập.');
        return res.json();
      })
      .then(data => {
        setLatestSessionId(data.session.id);
        try {
          localStorage.setItem('aisi_last_session_id', data.session.id);
        } catch {}
        window.location.hash = `consent/${data.session.id}`;
      })
      .catch(err => {
        alert(err.message);
      });
  };

  const handleConsentConfirmed = (session) => {
    window.location.hash = `chat/${session.id}`;
  };

  const renderContent = () => {
    if (route.startsWith('#start')) {
      return <EntryForm onSaveName={handleSaveName} />;
    }

    if (!userName) {
      return <EntryForm onSaveName={handleSaveName} />;
    }

    if (route.startsWith('#scenarios')) {
      return (
        <ScenarioPicker
          userName={userName}
          onStartTraining={handleStartTraining}
        />
      );
    }

    if (route.startsWith('#consent')) {
      return (
        <SimulationConsent
          onConsentConfirmed={handleConsentConfirmed}
        />
      );
    }

    if (route.startsWith('#chat')) {
      return (
        <ChatShell />
      );
    }

    if (route.startsWith('#dashboard/')) {
        const sessionId = route.split('/')[1];
        return <ResultScorecard sessionId={sessionId} />;
      }

    if (route.startsWith('#share/')) {
      const sessionId = route.split('/')[1];
      return <ShareCard sessionId={sessionId} userName={userName} />;
    }

    if (route.startsWith('#hotlines')) {
      return <Hotlines />;
    }

    return (
      <Dashboard
        userName={userName}
        history={history}
        onResetName={handleResetName}
      />
    );
  };

  return (
    <AppShell
      userName={userName}
      latestSessionId={latestSessionId}
      accessibility={accessibility}
      onUpdateAccessibility={handleUpdateAccessibility}
    >
      {renderContent()}
    </AppShell>
  );
}
