import React, { useState, useEffect } from 'react';
import AppShell from './components/AppShell';
import EntryForm from './components/EntryForm';
import Dashboard from './components/Dashboard';
import ScenarioPicker from './components/ScenarioPicker';
import SimulationConsent from './components/SimulationConsent';
import ChatShell from './components/ChatShell';
import './app.css';

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
      return (
        <div className="panel ui-card stack" style={{ padding: '24px' }}>
          <h2 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: '1.4rem', margin: 0 }}>Kết quả phân tích chi tiết</h2>
          <p className="subtitle" style={{ fontSize: '0.9rem' }}>Sprint 2 Migration: Scorecard và share card sẽ sớm có ở đây.</p>
          <button className="outline" onClick={() => window.location.hash = ''}>← Quay lại trang chính</button>
        </div>
      );
    }

    if (route.startsWith('#hotlines')) {
      return (
        <div className="panel ui-card stack" style={{ padding: '24px' }}>
          <h2 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: '1.4rem', margin: 0 }}>Đường dây nóng xác minh chính thức</h2>
          <p className="subtitle" style={{ fontSize: '0.9rem' }}>Sprint 2 Migration: Danh bạ khẩn cấp và NCSC link sẽ sớm có ở đây.</p>
          <button className="outline" onClick={() => window.location.hash = ''}>← Quay lại trang chính</button>
        </div>
      );
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
      accessibility={accessibility}
      onUpdateAccessibility={handleUpdateAccessibility}
    >
      {renderContent()}
    </AppShell>
  );
}
