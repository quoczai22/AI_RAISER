import React, { useEffect, useState } from 'react';

const taxonomyOrder = ['urgency', 'authority', 'fear', 'social proof/reciprocity', 'scarcity'];
const taxonomyLabel = {
  urgency: 'Khẩn cấp giả tạo',
  authority: 'Giả danh quyền lực',
  fear: 'Gây sợ hãi',
  'social proof/reciprocity': 'Lấy lòng tin xã hội',
  scarcity: 'Khan hiếm & áp lực',
};
const taxonomyIcon = {
  urgency: '⏰',
  authority: '🏢',
  fear: '😨',
  'social proof/reciprocity': '🤝',
  scarcity: '⚡',
};
const taxonomyDescription = {
  urgency: 'Tạo áp lực thời gian để bạn không kịp suy nghĩ',
  authority: 'Tự xưng nhân viên ngân hàng/cơ quan nhà nước',
  fear: 'Đe dọa tài khoản bị khóa nếu không làm ngay',
  'social proof/reciprocity': 'Lấy lòng tin bằng quan hệ, lời hứa hoặc ơn nghĩa',
  scarcity: 'Tạo cảm giác cơ hội sắp hết, không có lựa chọn',
};

function groupByTaxonomy(flags) {
  const map = {};
  flags.forEach(flag => {
    const key = flag.technique.toLowerCase();
    if (!map[key]) map[key] = [];
    map[key].push(flag);
  });
  return map;
}

export default function ResultScorecard({ sessionId }) {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      window.location.hash = '';
      return;
    }

    fetch(`/api/sessions/${sessionId}`)
      .then(res => {
        if (!res.ok) throw new Error('Session not found');
        return res.json();
      })
      .then(sessData => {
        if (sessData.session.status === 'created') {
          window.location.hash = `consent/${sessionId}`;
          return;
        }
        if (sessData.session.status === 'active') {
          window.location.hash = `chat/${sessionId}`;
          return;
        }
        return fetch(`/api/sessions/${sessionId}/dashboard`)
          .then(res => {
            if (!res.ok) throw new Error('Không thể tải kết quả.');
            return res.json();
          })
          .then(data => setDashboard(data));
      })
      .catch(() => {
        window.location.hash = '';
      });
  }, [sessionId]);

  if (error) {
    return (
      <div className="panel ui-card stack" style={{ padding: '24px', textAlign: 'center' }}>
        <p className="error" style={{ color: 'var(--danger)' }}>Lỗi: {error}</p>
        <button className="outline" onClick={() => window.location.hash = ''}>← Quay lại trang chính</button>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="panel ui-card stack" style={{ padding: '24px', textAlign: 'center' }}>
        <p>Đang tải kết quả...</p>
      </div>
    );
  }

  const {
    immunityScore,
    recognizedCount,
    totalCount,
    recognizedRedFlags,
    missedRedFlags,
    nextRecommendation,
  } = dashboard;

  const recognizedMap = groupByTaxonomy(recognizedRedFlags || []);
  const missedMap = groupByTaxonomy(missedRedFlags || []);
  const lesson = nextRecommendation || 'Đừng vội tin khi bị thúc ép chuyển tiền ngay.';

  return (
    <section className="analysis-screen">
      <header className="analysis-topbar">
        <h1>Kết quả phân tích</h1>
      </header>

      <div className="analysis-content">
        <section className="analysis-summary-column">
          <div className="analysis-score-card">
            <div className="analysis-ring" style={{ '--score': `${immunityScore}%` }}>
              <strong>{immunityScore}%</strong>
            </div>
            <div>
              <p>Kết quả buổi luyện tập</p>
              <h2>{recognizedCount}<small>/{totalCount}</small></h2>
              <strong>dấu hiệu đã nhận ra</strong>
              <span>{recognizedCount >= Math.ceil(totalCount / 2) ? 'Khá tốt! Luyện thêm để nhận ra nhiều hơn' : 'Hãy luyện thêm để nhận ra nhiều hơn'}</span>
            </div>
          </div>

          <div className="today-lesson-card">
            <p>Bài học hôm nay</p>
            <strong>"{lesson}"</strong>
          </div>

          <button type="button" onClick={() => window.location.hash = 'scenarios'}>
            🎯 Luyện tập tiếp
          </button>
          <button type="button" className="secondary" onClick={() => window.location.hash = `share/${sessionId}`}>
            📤 Chia sẻ kết quả
          </button>
          <button type="button" className="outline" onClick={() => window.location.hash = ''}>
            ← Về trang chính
          </button>
        </section>

        <section className="analysis-signs-column">
          <p className="section-label">Các dấu hiệu trong tình huống này</p>
          <div className="analysis-sign-list">
            {taxonomyOrder.map((tech) => {
              const recognized = recognizedMap[tech] || [];
              const missed = missedMap[tech] || [];
              const isRecognized = recognized.length > 0;
              const flag = recognized[0] || missed[0];
              return (
                <article className={`analysis-sign-card ${isRecognized ? 'recognized' : 'missed'}`} key={tech}>
                  <span className="sign-icon" aria-hidden="true">{taxonomyIcon[tech]}</span>
                  <div>
                    <h3>{flag?.label || taxonomyLabel[tech]}</h3>
                    <p>{flag?.recommendation || taxonomyDescription[tech]}</p>
                  </div>
                  <b>{isRecognized ? '✓ Đã nhận ra' : '✕ Bỏ qua'}</b>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </section>
  );
}
