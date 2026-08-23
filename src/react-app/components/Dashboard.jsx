import React from 'react';

function formatHistoryTime(item) {
  if (item.createdAt) return item.createdAt;
  if (item.completedAt) return item.completedAt;
  return 'Gần đây';
}

function scoreLabel(score) {
  if (typeof score === 'number') return `${score}/100`;
  return '0/100';
}

export default function Dashboard({ userName, history, onResetName }) {
  const completedSessions = history.length;
  const learnedFlags = history.reduce((sum, item) => {
    if (typeof item.recognizedCount === 'number') return sum + item.recognizedCount;
    if (Array.isArray(item.recognizedRedFlags)) return sum + item.recognizedRedFlags.length;
    return sum;
  }, 0);
  const avgScore = completedSessions > 0
    ? Math.round(history.reduce((sum, h) => sum + (h.immunityScore || 0), 0) / completedSessions)
    : 0;
  const progressMax = Math.max(8, completedSessions || 0);
  const progressValue = Math.min(completedSessions, progressMax);

  const handleAction = (hash) => {
    window.location.hash = hash;
  };

  const recentHistory = history.slice(0, 4);
  const latestResultId = history[0]?.id || history[0]?.sessionId || '';

  return (
    <section className="dashboard-screen">
      <header className="dashboard-hero">
        <div className="dashboard-hero-inner">
          <div>
            <p>Xin chào,</p>
            <h1>{userName} <span aria-hidden="true">👋</span></h1>
            <span>Hôm nay bạn muốn luyện tập tình huống nào?</span>
          </div>
          <div className="hero-shield" aria-hidden="true">🛡️</div>
        </div>
      </header>

      <div className="dashboard-content">
        <section className="progress-card" aria-label="Tiến độ luyện tập">
          <div className="stat-row">
            <div className="stat-inline">
              <span className="stat-icon">🎯</span>
              <div>
                <strong>{completedSessions}</strong>
                <p>Buổi luyện</p>
                <small>trong {progressMax} buổi</small>
              </div>
            </div>
            <div className="stat-inline">
              <span className="stat-icon">📚</span>
              <div>
                <strong>{learnedFlags || 5}</strong>
                <p>Dấu hiệu đã học</p>
                <small>của 20 loại</small>
              </div>
            </div>
            <div className="stat-inline">
              <span className="stat-icon">⭐</span>
              <div>
                <strong>{avgScore}%</strong>
                <p>Điểm trung bình</p>
                <small>{completedSessions ? 'từ buổi gần đây' : 'chưa có dữ liệu'}</small>
              </div>
            </div>
          </div>
          <div className="progress-section">
            <div>
              <strong>Tiến độ luyện tập</strong>
              <span>{progressValue}/{progressMax}</span>
            </div>
            <div className="progress-track">
              <i style={{ width: `${Math.max(8, (progressValue / progressMax) * 100)}%` }} />
            </div>
          </div>
        </section>

        <div className="dashboard-grid">
          <section className="dashboard-actions">
            <p className="section-label">Bạn muốn làm gì?</p>
            <button
              className="figma-action-card"
              id="btn-scenarios"
              type="button"
              onClick={() => handleAction('scenarios')}
              aria-label="Luyện tập tình huống. Chọn tình huống và luyện tập ngay."
            >
              <span className="action-card-icon">🎯</span>
              <span>
                <strong>Luyện tập tình huống</strong>
                <small>Chọn tình huống và luyện tập ngay</small>
              </span>
              <b aria-hidden="true">›</b>
            </button>

            <button
              className="figma-action-card"
              type="button"
              onClick={() => window.location.hash = latestResultId ? `dashboard/${latestResultId}` : ''}
              aria-label="Xem kết quả gần đây."
            >
              <span className="action-card-icon muted">📊</span>
              <span>
                <strong>Xem kết quả gần đây</strong>
                <small>Ôn lại những dấu hiệu đã học</small>
              </span>
              <b aria-hidden="true">›</b>
            </button>

            <button
              className="figma-action-card"
              id="btn-hotlines"
              type="button"
              onClick={() => handleAction('hotlines')}
              aria-label="Số điện thoại xác minh. Khi bạn cần xác minh thông tin thật."
            >
              <span className="action-card-icon hotline">📞</span>
              <span>
                <strong>Số điện thoại xác minh</strong>
                <small>Khi bạn cần xác minh thông tin thật</small>
              </span>
              <b aria-hidden="true">›</b>
            </button>

            <button
              className="figma-action-card secondary-action"
              type="button"
              onClick={onResetName}
              aria-label="Đổi tên hiển thị."
            >
              <span className="action-card-icon safe">👤</span>
              <span>
                <strong>Đổi tên hiển thị</strong>
                <small>Không cần tài khoản hay mật khẩu</small>
              </span>
              <b aria-hidden="true">›</b>
            </button>
          </section>

          <aside className="history-panel">
            <p className="section-label">Lịch sử luyện tập</p>
            {recentHistory.length ? (
              <div className="history-list">
                {recentHistory.map((item, idx) => (
                  <article className="history-card" key={item.id || item.sessionId || idx}>
                    <div>
                      <h3>{item.scenarioTitle || item.scenarioId || 'Buổi luyện tập'}</h3>
                      <strong>{scoreLabel(item.immunityScore)}</strong>
                    </div>
                    <div>
                      <span className="scenario-badge popular">{item.difficulty || 'Vừa'}</span>
                      <small>{formatHistoryTime(item)}</small>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-history-card">
                <p>Chưa có buổi luyện nào. Hãy bắt đầu luyện tập để tăng đề kháng lừa đảo!</p>
              </div>
            )}
            <div className="tip-card">
              <p><strong>💡 Mẹo:</strong> Luyện tập đều đặn mỗi ngày giúp nhận ra lừa đảo nhanh hơn rất nhiều.</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
