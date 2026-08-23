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
import { getSessionCapability, setSessionCapability } from './sessionCapability';

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
  const [latestSessionStatus, setLatestSessionStatus] = useState('');
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

  useEffect(() => {
    try {
      setHistory(JSON.parse(localStorage.getItem('aisi_history') || '[]'));
    } catch {
      setHistory([]);
    }

    if (!latestSessionId) {
      setLatestSessionStatus('');
      return;
    }

    let cancelled = false;
    const capability = getSessionCapability(latestSessionId);
    fetch(`/api/sessions/${latestSessionId}`, { headers: capability ? { 'x-session-capability': capability } : {} })
      .then(res => {
        if (!res.ok) throw new Error('Session not found');
        return res.json();
      })
      .then(data => {
        if (!cancelled) setLatestSessionStatus(data.session.status || '');
      })
      .catch(() => {
        if (!cancelled) setLatestSessionStatus('');
      });

    return () => {
      cancelled = true;
    };
  }, [route, latestSessionId]);

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
        const sess = data.session;
        const cap = data.capability;
        setSessionCapability(sess.id, cap);
        setLatestSessionId(sess.id);
        setLatestSessionStatus(sess.status || 'created');
        try {
          localStorage.setItem('aisi_last_session_id', sess.id);
        } catch {}
        window.location.hash = `consent/${sess.id}`;
      })
      .catch(err => {
        alert(err.message);
      });
  };

  const handleConsentConfirmed = (session) => {
    setLatestSessionStatus(session.status || 'active');
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
      const sessionId = route.split('/')[1];
      if (!sessionId) {
        window.location.hash = 'scenarios';
        return <ScenarioPicker userName={userName} onStartTraining={handleStartTraining} />;
      }
      return (
        <SimulationConsent
          onConsentConfirmed={handleConsentConfirmed}
        />
      );
    }

    if (route.startsWith('#chat')) {
      const sessionId = route.split('/')[1];
      if (!sessionId) {
        window.location.hash = 'scenarios';
        return <ScenarioPicker userName={userName} onStartTraining={handleStartTraining} />;
      }
      return (
        <ChatShell />
      );
    }

    if (route.startsWith('#dashboard/')) {
      const sessionId = route.split('/')[1];
      if (!sessionId) {
        window.location.hash = '';
        return (
          <Dashboard
            userName={userName}
            history={history}
            onResetName={handleResetName}
          />
        );
      }
      return <ResultScorecard sessionId={sessionId} />;
    }

    if (route.startsWith('#share/')) {
      const sessionId = route.split('/')[1];
      if (!sessionId) {
        window.location.hash = '';
        return (
          <Dashboard
            userName={userName}
            history={history}
            onResetName={handleResetName}
          />
        );
      }
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
      latestSessionStatus={latestSessionStatus}
      hasCompletedSession={history.length > 0 || latestSessionStatus === 'completed'}
      accessibility={accessibility}
      onUpdateAccessibility={handleUpdateAccessibility}
    >
      {renderContent()}
    </AppShell>
  );
}
