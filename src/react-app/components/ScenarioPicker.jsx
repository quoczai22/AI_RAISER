import React, { useState, useEffect } from 'react';

export default function ScenarioPicker({ userName, onStartTraining }) {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState(null);
  const [difficulty, setDifficulty] = useState('easy');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/scenarios')
      .then(res => {
        if (!res.ok) throw new Error('Không thể tải danh sách kịch bản.');
        return res.json();
      })
      .then(data => {
        setScenarios(data.scenarios || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleStart = () => {
    if (selectedScenarioId) {
      onStartTraining(selectedScenarioId, difficulty);
    }
  };

  const handleBack = () => {
    window.location.hash = '';
  };

  if (loading) {
    return (
      <div className="panel ui-card stack" style={{ padding: '24px', textAlign: 'center' }}>
        <p>Đang tải danh sách kịch bản...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel ui-card stack" style={{ padding: '24px', textAlign: 'center' }}>
        <p className="error" style={{ color: 'var(--danger)' }}>Lỗi: {error}</p>
        <button className="outline" onClick={handleBack}>Quay lại</button>
      </div>
    );
  }

  return (
    <section className="panel">
      <div className="scenarios-layout">
        {/* Danh sách kịch bản */}
        <div className="scenarios-list stack" style={{ gap: '16px' }}>
          <h2 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: '1.4rem', margin: 0 }}>Chọn tình huống luyện tập</h2>
          <p className="subtitle" style={{ margin: 0, fontSize: '0.9rem' }}>Hãy chọn một kịch bản dưới đây để bắt đầu đối phó với các kịch bản lừa đảo phổ biến.</p>
          
          <div className="scenario-grid">
            {scenarios.map((scenario) => {
              const isSelected = scenario.id === selectedScenarioId;
              const badgeClass = scenario.id === 'fake_bank' || scenario.id === 'fake_police' ? 'popular' : 'danger';
              const badgeText = scenario.id === 'fake_bank' ? 'Phổ biến' : scenario.id === 'fake_police' ? 'Nguy hiểm' : 'Mới';

              let icon = '💼';
              if (scenario.id === 'fake_bank') icon = '🏦';
              else if (scenario.id === 'fake_police') icon = '🏢';
              else if (scenario.id === 'fake_relative') icon = '👤';

              return (
                <div
                  key={scenario.id}
                  className={`scenario-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedScenarioId(scenario.id)}
                  role="button"
                  tabIndex="0"
                  aria-checked={isSelected ? 'true' : 'false'}
                  aria-label={`${scenario.title}. ${scenario.description}.`}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedScenarioId(scenario.id)}
                >
                  <div className="scenario-card-icon">{icon}</div>
                  <div className="scenario-card-content">
                    <div className="scenario-card-header">
                      <h3 style={{ margin: 0, fontSize: '1rem', fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>{scenario.title}</h3>
                      <span className={`scenario-badge ${badgeClass}`}>{badgeText}</span>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--muted-foreground)', lineHeight: 1.4 }}>{scenario.description}</p>
                  </div>
                  {isSelected && <span className="selected-indicator" aria-hidden="true">✓</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="scenarios-sidebar stack" style={{ gap: '16px' }}>
          <div className="ui-card stack" style={{ padding: '24px', gap: '16px', border: '2px solid var(--border)' }}>
            <p className="eyebrow" style={{ marginBottom: 0 }}>Mức độ thử thách</p>
            <div className="difficulty-picker-row" style={{ display: 'grid', gap: '10px' }}>
              <label className="difficulty-toggle" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="radio"
                  name="difficulty"
                  value="easy"
                  checked={difficulty === 'easy'}
                  onChange={(e) => setDifficulty(e.target.value)}
                />
                <span>Dễ - hiển thị gợi ý rõ ràng</span>
              </label>
              <label className="difficulty-toggle" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="radio"
                  name="difficulty"
                  value="medium"
                  checked={difficulty === 'medium'}
                  onChange={(e) => setDifficulty(e.target.value)}
                />
                <span>Trung bình - nhắn tin tự nhiên</span>
              </label>
              <label className="difficulty-toggle" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="radio"
                  name="difficulty"
                  value="hard"
                  checked={difficulty === 'hard'}
                  onChange={(e) => setDifficulty(e.target.value)}
                />
                <span>Khó - không gợi ý</span>
              </label>
            </div>

            <div className="stack" style={{ gap: '12px', marginTop: '12px' }}>
              <button
                id="start-training-btn"
                disabled={!selectedScenarioId}
                onClick={handleStart}
                style={{ width: '100%' }}
              >
                <span aria-hidden="true">▶</span> Tiếp tục
              </button>
              <button
                className="outline"
                id="back-dashboard"
                onClick={handleBack}
                style={{ width: '100%' }}
              >
                <span aria-hidden="true">←</span> Hủy bỏ / Quay lại
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
