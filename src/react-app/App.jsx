import React, { useState, useEffect } from 'react';
import AppShell from './components/AppShell';
import EntryForm from './components/EntryForm';
import Dashboard from './components/Dashboard';
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

  // Simple skeleton router
  const renderContent = () => {
    if (!userName) {
      return <EntryForm onSaveName={handleSaveName} />;
    }

    if (route.startsWith('#scenarios')) {
      return (
        <div className="panel ui-card stack">
          <h2>Chọn tình huống luyện tập</h2>
          <p className="subtitle">Sprint 2 Migration: Kịch bản và độ khó sẽ hiển thị ở đây.</p>
          <button className="outline" onClick={() => window.location.hash = ''}>← Quay lại trang chính</button>
        </div>
      );
    }

    if (route.startsWith('#consent')) {
      return (
        <div className="panel ui-card stack">
          <h2>Xác nhận trước khi bắt đầu</h2>
          <p class="subtitle">Sprint 2 Migration: Consent cam kết an toàn sẽ hiển thị ở đây.</p>
          <button className="outline" onClick={() => window.location.hash = ''}>← Quay lại trang chính</button>
        </div>
      );
    }

    if (route.startsWith('#chat')) {
      return (
        <div className="panel ui-card stack">
          <h2>Phòng chat giả lập lừa đảo</h2>
          <p class="subtitle">Sprint 2 Migration: Luyện chat Gemini động sẽ hiển thị ở đây.</p>
          <button className="outline" onClick={() => window.location.hash = ''}>← Quay lại trang chính</button>
        </div>
      );
    }

    if (route.startsWith('#dashboard/')) {
      return (
        <div className="panel ui-card stack">
          <h2>Kết quả phân tích chi tiết</h2>
          <p class="subtitle">Sprint 2 Migration: Scorecard và share card sẽ hiển thị ở đây.</p>
          <button className="outline" onClick={() => window.location.hash = ''}>← Quay lại trang chính</button>
        </div>
      );
    }

    if (route.startsWith('#hotlines')) {
      return (
        <div className="panel ui-card stack">
          <h2>Đường dây nóng xác minh chính thức</h2>
          <p class="subtitle">Sprint 2 Migration: Danh bạ khẩn cấp và NCSC link sẽ hiển thị ở đây.</p>
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
