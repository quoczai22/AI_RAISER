import React, { useState } from 'react';

export default function EntryForm({ onSaveName }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSaveName(name.trim());
    }
  };

  return (
    <section className="panel">
      <div className="consent-layout stack" style={{ maxWidth: '390px', margin: '0 auto' }}>
        <div className="ui-card stack" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', gap: '16px', marginBottom: '8px' }}>
            <div style={{ width: '80px', height: '80px', background: 'var(--primary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', boxShadow: 'var(--shadow)' }}>🛡️</div>
            <div>
              <h2 style={{ margin: 0, fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: '1.6rem', color: 'var(--foreground)' }}>Luyện tập<br />nhận biết lừa đảo</h2>
              <p className="subtitle" style={{ margin: '6px 0 0', color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>Cùng AI luyện tập để không bị lừa — hoàn toàn miễn phí, không cần tài khoản.</p>
            </div>
          </div>
          
          <div className="notice" style={{ borderLeftColor: 'var(--success)', background: 'var(--success-bg)', color: 'var(--secondary-foreground)', fontWeight: 700, borderRadius: 'var(--radius)', padding: '12px 16px' }}>
            <strong>Không cần mật khẩu, không cần OTP, không trừ tiền.</strong>
          </div>
          
          <form onSubmit={handleSubmit} className="stack" style={{ gap: '16px' }}>
            <div className="stack" style={{ gap: '8px' }}>
              <strong style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: '1rem', color: 'var(--foreground)' }}>Tên của cô/chú/anh/chị</strong>
              <input
                id="user-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                placeholder="Ví dụ: Bác Hùng, Chị Mai..."
                aria-label="Tên hiển thị"
              />
            </div>
            
            <div className="entry-actions" style={{ marginTop: '8px' }}>
              <button id="start-training" type="submit" disabled={!name.trim()} style={{ width: '100%' }}><span aria-hidden="true">▶</span> Bắt đầu luyện tập</button>
            </div>
          </form>

          <div style={{ background: 'var(--secondary)', border: '1px solid #B6DFC2', borderRadius: 'var(--radius)', padding: '16px', gap: '8px', display: 'grid' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary-foreground)', margin: '0 0 8px' }}>✓ Hoàn toàn an toàn</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <div className="build-badge" style={{ border: 0, background: 'var(--card)', padding: '4px 10px', fontSize: '0.75rem', color: 'var(--secondary-foreground)', fontWeight: 700, borderRadius: '100px' }}>✓ Không cần mật khẩu</div>
              <div className="build-badge" style={{ border: 0, background: 'var(--card)', padding: '4px 10px', fontSize: '0.75rem', color: 'var(--secondary-foreground)', fontWeight: 700, borderRadius: '100px' }}>✓ Không cần OTP</div>
              <div className="build-badge" style={{ border: 0, background: 'var(--card)', padding: '4px 10px', fontSize: '0.75rem', color: 'var(--secondary-foreground)', fontWeight: 700, borderRadius: '100px' }}>✓ Không mất tiền</div>
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted-foreground)', margin: '8px 0 0' }}>Ứng dụng luyện tập — không xác minh thật</p>
        </div>
      </div>
    </section>
  );
}
