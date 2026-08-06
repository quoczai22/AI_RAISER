import React, { useEffect, useState } from 'react';

// ResultScorecard reads the final session dashboard data and displays the scorecard.
export default function ResultScorecard({ sessionId }) {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/sessions/${sessionId}/dashboard`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load results');
        return res.json();
      })
      .then(data => setDashboard(data))
      .catch(err => setError(err.message));
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
    shareSummary,
  } = dashboard;

  const taxonomyOrder = ['urgency', 'authority', 'fear', 'social proof/reciprocity', 'scarcity'];
  // Group flags by technique (taxonomy).
  const groupByTaxonomy = (flags) => {
    const map = {};
    flags.forEach(flag => {
      const key = flag.technique.toLowerCase();
      if (!map[key]) map[key] = [];
      map[key].push(flag);
    });
    return map;
  };

  const recognizedMap = groupByTaxonomy(recognizedRedFlags);
  const missedMap = groupByTaxonomy(missedRedFlags);

  const renderTaxonomySection = (tech) => (
    <div className="taxonomy-card" key={tech} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', marginBottom: '12px', background: 'var(--card)' }}>
      <h3 style={{ margin: 0, textTransform: 'capitalize' }}>{tech}</h3>
      <ul style={{ margin: 0, paddingLeft: '20px' }}>
        {(recognizedMap[tech] || []).map(flag => (
          <li key={flag.key} style={{ color: 'var(--success-foreground)' }}>✓ {flag.label}</li>
        ))}
        {(missedMap[tech] || []).map(flag => (
          <li key={flag.key} style={{ color: 'var(--danger-foreground)' }}>✗ {flag.label}<br/><small>{flag.recommendation}</small></li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="panel ui-card stack" style={{ padding: '24px' }}>
      <h2 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: '1.6rem', margin: 0 }}>
        Kết quả luyện tập
      </h2>
      <p className="subtitle" style={{ fontSize: '0.95rem' }}>
        Điểm miễn dịch: {immunityScore} / 100<br />
        Đánh dấu: {recognizedCount} / {totalCount}
      </p>
      <div className="taxonomy-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
        {taxonomyOrder.map(renderTaxonomySection)}
      </div>
      <div className="feedback" style={{ marginTop: '16px' }}>
        <h3 style={{ marginBottom: '8px' }}>Gợi ý luyện tập tiếp</h3>
        <p>{nextRecommendation}</p>
      </div>
      <div className="share-card" style={{ marginTop: '16px', padding: '12px', background: 'var(--secondary-bg)', borderRadius: '8px' }}>
        <p style={{ margin: 0 }}>{shareSummary}</p>
        <button className="outline" style={{ marginTop: '8px' }} onClick={() => navigator.clipboard.writeText(shareSummary)}>
          Sao chép
        </button>
      </div>
      <div className="actions" style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
        <button className="outline" onClick={() => window.location.hash = ''}>← Trang chính</button>
        <button className="primary" onClick={() => window.location.hash = ''}>Luyện tiếp</button>
      </div>
    </div>
  );
}
