import React, { useEffect, useState } from 'react';

const workflow = [
  { key: 'start', label: 'Bắt đầu', icon: '▶' },
  { key: '', label: 'Trang chính', icon: '🏠' },
  { key: 'scenarios', label: 'Chọn tình huống', icon: '🎯' },
  { key: 'consent', label: 'Xác nhận', icon: '✅', needsSession: true },
  { key: 'chat', label: 'Chat luyện tập', icon: '💬', needsSession: true },
  { key: 'result', label: 'Kết quả', icon: '📊', needsSession: true },
  { key: 'hotlines', label: 'Số xác minh', icon: '📞' },
  { key: 'share', label: 'Thẻ chia sẻ', icon: '📤', needsSession: true },
];

function getActiveKey(route) {
  if (route.startsWith('#start')) return 'start';
  if (route.startsWith('#scenarios')) return 'scenarios';
  if (route.startsWith('#consent')) return 'consent';
  if (route.startsWith('#chat')) return 'chat';
  if (route.startsWith('#dashboard/')) return 'result';
  if (route.startsWith('#hotlines')) return 'hotlines';
  if (route.startsWith('#share')) return 'share';
  return '';
}

function targetFor(item, latestSessionId) {
  if (item.key === 'start') return 'start';
  if (item.key === 'consent') return latestSessionId ? `consent/${latestSessionId}` : '';
  if (item.key === 'chat') return latestSessionId ? `chat/${latestSessionId}` : '';
  if (item.key === 'result') return latestSessionId ? `dashboard/${latestSessionId}` : '';
  if (item.key === 'share') return latestSessionId ? `share/${latestSessionId}` : '';
  return item.key;
}

function goTo(hash) {
  window.location.hash = hash;
}

export default function AppShell({ children, userName, latestSessionId, accessibility, onUpdateAccessibility }) {
  const [route, setRoute] = useState(window.location.hash);
  const activeKey = getActiveKey(route);

  useEffect(() => {
    const handleRoute = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', handleRoute);
    return () => window.removeEventListener('hashchange', handleRoute);
  }, []);

  return (
    <div className="figma-app-frame">
      <a href="#app" className="skip-link">Bỏ qua menu</a>

      <aside className="figma-sidebar" aria-label="Điều hướng chính">
        <div className="sidebar-brand">
          <div className="sidebar-logo" aria-hidden="true">🛡️</div>
          <div>
            <strong>Nhận biết lừa đảo</strong>
            <span>AI Scam Inoculation</span>
          </div>
        </div>

        {userName ? (
          <div className="sidebar-user">
            <span>Đang luyện tập</span>
            <strong>{userName}</strong>
          </div>
        ) : null}

        <nav className="sidebar-nav">
          <p>Các màn hình</p>
          {workflow.map((item, index) => {
            const enabled = item.key === 'start' || Boolean(userName) && (!item.needsSession || latestSessionId);
            const selected = activeKey === item.key;
            const target = targetFor(item, latestSessionId);
            return (
              <button
                key={item.key || 'home'}
                type="button"
                className={`sidebar-nav-item ${selected ? 'active' : ''}`}
                disabled={!enabled}
                onClick={() => enabled && goTo(target)}
              >
                <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
                <b>{index + 1}</b>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-system">
          <p>Mẫu hệ thống</p>
          <span><i style={{ background: '#1A6FA8' }} /> Chính - hành động</span>
          <span><i style={{ background: '#2D7A4F' }} /> An toàn - xác nhận</span>
          <span><i style={{ background: '#D97706' }} /> Chú ý - cảnh báo</span>
          <span><i style={{ background: '#DC2626' }} /> Nguy hiểm - rủi ro</span>
        </div>
      </aside>

      <main className="figma-main">
        <div className="figma-top-controls" aria-label="Tùy chọn hiển thị">
          <label className="toggle-row">
            <input
              id="large-text-toggle"
              type="checkbox"
              checked={accessibility.largeText}
              onChange={(e) => onUpdateAccessibility('largeText', e.target.checked)}
            />
            <span>Chữ to</span>
          </label>
          <label className="toggle-row">
            <input
              id="high-contrast-toggle"
              type="checkbox"
              checked={accessibility.highContrast}
              onChange={(e) => onUpdateAccessibility('highContrast', e.target.checked)}
            />
            <span>Tương phản cao</span>
          </label>
          <span className="build-badge">Dùng Gemini của Google</span>
        </div>

        <section id="app" className="figma-content" tabIndex="-1" aria-live="polite">
          {children}
        </section>

        <nav className="mobile-step-nav" aria-label="Điều hướng nhanh">
          {workflow.map((item, index) => {
            const enabled = item.key === 'start' || Boolean(userName) && (!item.needsSession || latestSessionId);
            const target = targetFor(item, latestSessionId);
            return (
            <button
              key={item.key || 'home'}
              type="button"
              className={activeKey === item.key ? 'active' : ''}
              disabled={!enabled}
              onClick={() => enabled && goTo(target)}
            >
              <span aria-hidden="true">{item.icon}</span>
              <span>{index + 1}. {item.label}</span>
            </button>
          )})}
        </nav>

        <div id="status-region" className="sr-only" role="status" aria-live="polite">
          {accessibility.largeText ? 'Đã bật chữ to.' : 'Đã tắt chữ to.'} {accessibility.highContrast ? 'Đã bật tương phản cao.' : 'Đã tắt tương phản cao.'}
        </div>
      </main>
    </div>
  );
}
