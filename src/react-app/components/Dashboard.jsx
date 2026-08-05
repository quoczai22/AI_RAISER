import React from 'react';

export default function Dashboard({ userName, history, onResetName }) {
  const completedSessions = history.length;
  const avgScore = completedSessions > 0
    ? Math.round(history.reduce((sum, h) => sum + (h.immunityScore || 0), 0) / completedSessions) + "%"
    : "0%";

  const handleAction = (hash) => {
    window.location.hash = hash;
  };

  return (
    <section className="panel">
      <div className="dashboard-layout">
        {/* Cột trái */}
        <div className="stack" style={{ gap: '20px' }}>
          {/* Welcome Header */}
          <div className="dashboard-welcome" style={{ background: 'var(--primary)', color: 'white', border: 0, padding: '24px', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'start', boxShadow: 'var(--shadow)' }}>
            <div className="welcome-info" style={{ color: 'white' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8 }}>Xin chào,</p>
              <h2 style={{ margin: '4px 0 0', color: 'white', fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: '1.75rem' }}>{userName} 👋</h2>
              <p className="subtitle" style={{ margin: '6px 0 0', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>Hôm nay bạn muốn luyện tập tình huống nào?</p>
            </div>
            <button className="outline" id="change-name-btn" onClick={onResetName} style={{ minHeight: '40px', padding: '6px 12px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', borderRadius: '8px', fontFamily: "'Nunito', sans-serif" }}>Đổi tên</button>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon">🎯</div>
              <div className="stat-value">{completedSessions}</div>
              <div className="stat-label">Buổi luyện</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">📚</div>
              <div className="stat-value">5</div>
              <div className="stat-label">Dấu hiệu học</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">⭐</div>
              <div className="stat-value">{avgScore}</div>
              <div className="stat-label">Điểm trung bình</div>
            </div>
          </div>

          <p className="eyebrow" style={{ marginBottom: 0 }}>Bạn muốn làm gì?</p>

          <div
            className="ui-card action-card"
            id="btn-scenarios"
            role="button"
            tabIndex="0"
            onClick={() => handleAction('scenarios')}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleAction('scenarios')}
            aria-label="Luyện tập tình huống. Chọn kịch bản và luyện phản xạ với AI."
          >
            <div className="action-card-icon">🎯</div>
            <div style={{ flex: 1 }}>
              <strong className="action-card-title">Luyện tập tình huống</strong>
              <p className="subtitle" style={{ margin: '2px 0 0', fontSize: '0.85rem' }}>Chọn kịch bản và luyện phản xạ với AI</p>
            </div>
            <span className="action-card-right">›</span>
          </div>

          <div
            className="ui-card action-card"
            id="btn-hotlines"
            role="button"
            tabIndex="0"
            onClick={() => handleAction('hotlines')}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleAction('hotlines')}
            aria-label="Số điện thoại xác minh. Danh bạ đường dây nóng chính thức khi nghi ngờ."
          >
            <div className="action-card-icon hotline">📞</div>
            <div style={{ flex: 1 }}>
              <strong className="action-card-title">Số điện thoại xác minh</strong>
              <p className="subtitle" style={{ margin: '2px 0 0', fontSize: '0.85rem' }}>Danh bạ đường dây nóng chính thức khi nghi ngờ</p>
            </div>
            <span class="action-card-right">›</span>
          </div>
        </div>

        {/* Cột phải */}
        <div className="stack" style={{ gap: '20px' }}>
          <p className="eyebrow" style={{ marginBottom: 0 }}>Lịch sử luyện tập gần đây</p>
          <div className="ui-card stack" style={{ padding: '20px', gap: '12px', background: 'var(--card)', border: '2px solid var(--border)' }}>
            <ul className="flag-list">
              {history.length === 0 ? (
                <li className="flag-item" style={{ borderLeftColor: 'var(--border)', background: 'var(--background)', fontWeight: 'normal', color: 'var(--muted-foreground)' }}>Chưa có buổi luyện nào. Hãy bắt đầu luyện tập để tăng đề kháng lừa đảo!</li>
              ) : (
                history.map((item, idx) => (
                  <li key={idx} className="history-card">
                    <div className="history-card-left">
                      <h4>{item.scenarioTitle}</h4>
                      <span>{item.createdAt}</span>
                    </div>
                    <div className="history-card-right">
                      <div className="history-card-score">{item.immunityScore}/100</div>
                    </div>
                  </li>
                ))
              )}
            </ul>
            <div style={{ background: 'var(--secondary)', border: '1px solid #B6DFC2', borderRadius: 'var(--radius)', padding: '12px 16px', marginTop: '4px' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--secondary-foreground)', fontWeight: 500, margin: 0, lineHeight: 1.4 }}>
                💡 <strong>Mẹo:</strong> Luyện tập đều đặn mỗi ngày giúp nhận ra lừa đảo nhanh hơn rất nhiều.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
