import React from 'react';

export default function AppShell({ children, userName, accessibility, onUpdateAccessibility }) {
  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="header-main">
          <p className="eyebrow">AI Riser Vietnam 2026</p>
          <h1>Luyện nhận diện lừa đảo</h1>
          <p className="subtitle">Luyện nhận diện lừa đảo cho gia đình</p>
        </div>
        <div className="header-controls">
          <div className="accessibility-bar" aria-label="Tùy chọn hiển thị">
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
          </div>
          <span className="build-badge">Dùng Gemini của Google</span>
        </div>
      </header>

      <section id="app" tabIndex="-1" aria-live="polite">
        {children}
      </section>
      <div id="status-region" className="sr-only" role="status" aria-live="polite">
        {accessibility.largeText ? 'Đã bật chữ to.' : 'Đã tắt chữ to.'} {accessibility.highContrast ? 'Đã bật tương phản cao.' : 'Đã tắt tương phản cao.'}
      </div>
    </main>
  );
}
