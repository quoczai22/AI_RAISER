import React, { useState, useEffect } from 'react';

export default function SimulationConsent({ onConsentConfirmed }) {
  const [session, setSession] = useState(null);
  const [scenario, setScenario] = useState(null);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getSessionIdFromHash = () => {
    const hash = window.location.hash || '';
    const parts = hash.split('/');
    return parts[1] || '';
  };

  const sessionId = getSessionIdFromHash();

  useEffect(() => {
    if (!sessionId) {
      setError('Không tìm thấy mã buổi luyện tập.');
      setLoading(false);
      return;
    }

    // Fetch session details, then fetch scenarios to match the metadata description
    fetch(`/api/sessions/${sessionId}`)
      .then(res => {
        if (!res.ok) throw new Error('Không thể tải thông tin buổi luyện tập.');
        return res.json();
      })
      .then(data => {
        setSession(data.session);
        return fetch('/api/scenarios').then(res => {
          if (!res.ok) throw new Error('Không thể tải kịch bản.');
          return res.json();
        }).then(scData => {
          const matched = (scData.scenarios || []).find(sc => sc.id === data.session.scenarioId);
          setScenario(matched);
          setLoading(false);
        });
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [sessionId]);

  const handleStart = () => {
    if (checked && sessionId) {
      fetch(`/api/sessions/${sessionId}/consent`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ consent: true })
      })
        .then(res => {
          if (!res.ok) throw new Error('Không thể đồng ý xác nhận mô phỏng.');
          return res.json();
        })
        .then(data => {
          onConsentConfirmed(data.session);
        })
        .catch(err => {
          setError(err.message);
        });
    }
  };

  const handleBack = () => {
    window.location.hash = 'scenarios';
  };

  if (loading) {
    return (
      <div className="panel ui-card stack" style={{ padding: '24px', textAlign: 'center' }}>
        <p>Đang tải thông tin xác nhận...</p>
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

  const diffMap = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };
  const diffLabel = diffMap[session?.difficulty] || 'Dễ';

  let icon = '💼';
  if (session?.scenarioId === 'fake_bank') icon = '🏦';
  else if (session?.scenarioId === 'fake_police') icon = '🏢';
  else if (session?.scenarioId === 'fake_relative') icon = '👤';

  return (
    <section className="panel">
      <div className="consent-layout stack" style={{ maxWidth: '520px', margin: '0 auto' }}>
        <div className="ui-card stack" style={{ padding: '24px', gap: '20px', border: '2px solid var(--border)' }}>
          <h2 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: '1.4rem', margin: 0 }}>Xác nhận trước khi bắt đầu</h2>

          {/* Preview Card */}
          <div style={{ background: 'var(--background)', border: '2px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '2.25rem', background: 'var(--card)', width: '48px', height: '48px', borderRadius: '8px', display: 'flex', alignItems: 'center', justify: 'center', flexShrink: 0 }}>
              {icon}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', margin: 0 }}>Tình huống đang luyện</p>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: '1rem', color: 'var(--foreground)', margin: '2px 0 0' }}>{scenario?.title || 'Đang tải...'}</p>
            </div>
            <span className="build-badge" style={{ border: 0, background: 'var(--primary-soft)', color: 'var(--primary)', padding: '4px 10px', fontWeight: 700, borderRadius: '100px' }}>
              {diffLabel}
            </span>
          </div>

          {/* Warning note */}
          <div className="notice danger-note" style={{ borderLeftColor: 'var(--danger)', background: 'var(--danger-bg)', color: '#7F1D1D', borderRadius: 'var(--radius)', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              <strong style={{ fontFamily: "'Nunito', sans-serif", fontSize: '0.95rem' }}>Lưu ý quan trọng:</strong>
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', lineHeight: 1.6 }}>
              <li>Không cung cấp thông tin cá nhân thật</li>
              <li>Không nhập OTP, CCCD, mật khẩu</li>
              <li>Không nhập số tài khoản thật</li>
              <li>AI đóng vai người lừa đảo để bạn luyện tập phản xạ</li>
              <li>Bạn có thể dừng luyện tập bất cứ lúc nào</li>
            </ul>
          </div>

          <div className="notice" style={{ borderLeftColor: 'var(--primary)', background: 'var(--primary-soft)', borderRadius: 'var(--radius)', padding: '12px 16px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--foreground)' }}>
            🔒 Nội dung trò chuyện <strong>không được lưu lại</strong> và chỉ dùng để luyện tập.
          </div>

          <label className="consent-row" style={{ display: 'flex', gap: '12px', alignItems: 'start', padding: '16px', border: '2px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--background)', cursor: 'pointer', userSelect: 'none' }}>
            <input
              id="simulation-consent"
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              style={{ width: '24px', height: '24px', marginTop: '2px' }}
            />
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1.4 }}>Tôi hiểu đây là mô phỏng và cam kết không nhập thông tin thật.</span>
          </label>

          <div className="entry-actions" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            <button
              id="start-chat"
              disabled={!checked}
              onClick={handleStart}
              style={{ width: '100%', minHeight: '56px' }}
            >
              <span aria-hidden="true">▶</span> Tôi hiểu, bắt đầu luyện tập
            </button>
            <button
              className="outline"
              id="cancel-consent"
              onClick={handleBack}
              style={{ width: '100%', minHeight: '56px' }}
            >
              <span aria-hidden="true">←</span> Hủy bỏ / Quay lại
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
