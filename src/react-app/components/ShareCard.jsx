import React, { useEffect, useMemo, useRef, useState } from 'react';

function monthLabel() {
  const now = new Date();
  return `tháng ${now.getMonth() + 1}/${now.getFullYear()}`;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 3) {
  const words = String(text || '').split(/\s+/);
  let line = '';
  let lines = 0;
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      y += lineHeight;
      lines += 1;
      line = word;
      if (lines >= maxLines - 1) break;
    } else {
      line = testLine;
    }
  }
  if (line && lines < maxLines) ctx.fillText(line, x, y);
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawShareCardToCanvas(canvas, cardData, userName) {
  const ratio = 2;
  const width = 1080;
  const height = 1350;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext('2d');
  ctx.scale(ratio, ratio);

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#17679B');
  gradient.addColorStop(0.52, '#1A6FA8');
  gradient.addColorStop(1, '#18866E');
  ctx.fillStyle = gradient;
  roundedRect(ctx, 0, 0, width, height, 32);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  roundedRect(ctx, 56, 64, 72, 72, 22);
  ctx.fill();
  ctx.font = '42px Nunito, Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('🛡️', 72, 114);

  ctx.font = '900 42px Nunito, Arial';
  ctx.fillText('Luyện tập nhận', 156, 94);
  ctx.fillText('biết lừa đảo', 156, 140);
  ctx.font = '500 24px Inter, Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.70)';
  ctx.fillText('AI SCAM INOCULATION', 156, 176);

  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  roundedRect(ctx, 760, 64, 250, 96, 48);
  ctx.fill();
  ctx.font = '900 24px Nunito, Arial';
  ctx.fillStyle = '#FFFFFF';
  wrapText(ctx, cardData.scenario, 810, 106, 155, 30, 2);

  ctx.font = '600 28px Inter, Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.76)';
  ctx.fillText('Tôi vừa nhận ra', 390, 360);

  ctx.lineWidth = 18;
  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.beginPath();
  ctx.arc(210, 435, 92, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(210, 435, 92, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * Math.min(cardData.score, 100) / 100));
  ctx.stroke();
  ctx.font = '900 52px Nunito, Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(`${cardData.score}%`, 210, 454);
  ctx.textAlign = 'left';

  ctx.font = '900 96px Nunito, Arial';
  ctx.fillText(String(cardData.detected), 390, 450);
  ctx.font = '900 44px Nunito, Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.80)';
  ctx.fillText(`/${cardData.total}`, 500, 450);
  ctx.font = '800 32px Nunito, Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('dấu hiệu lừa đảo', 390, 504);
  ctx.font = '500 26px Inter, Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.fillText(`${userName || 'Bạn'} · ${monthLabel()}`, 390, 550);

  let tagX = 56;
  let tagY = 660;
  const tags = [
    ...cardData.recognized.slice(0, 3).map(flag => ({ text: `✓ ${flag.label}`, muted: false })),
    ...cardData.missed.slice(0, 2).map(flag => ({ text: `✕ ${flag.label}`, muted: true })),
  ];
  ctx.font = '900 24px Nunito, Arial';
  tags.forEach((tag) => {
    const tagWidth = Math.min(420, ctx.measureText(tag.text).width + 44);
    if (tagX + tagWidth > width - 56) {
      tagX = 56;
      tagY += 62;
    }
    ctx.fillStyle = tag.muted ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.22)';
    roundedRect(ctx, tagX, tagY, tagWidth, 44, 22);
    ctx.fill();
    ctx.fillStyle = tag.muted ? 'rgba(255,255,255,0.46)' : '#FFFFFF';
    ctx.fillText(tag.text, tagX + 20, tagY + 30);
    tagX += tagWidth + 14;
  });

  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  roundedRect(ctx, 56, 930, width - 112, 210, 28);
  ctx.fill();
  ctx.font = '900 28px Nunito, Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.68)';
  ctx.fillText('BÀI HỌC RÚT RA', 104, 1000);
  ctx.font = '900 42px Nunito, Arial';
  ctx.fillStyle = '#FFFFFF';
  wrapText(ctx, `"${cardData.lesson}"`, 104, 1062, width - 208, 52, 3);

  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.fillRect(0, 1225, width, 1);
  ctx.font = '500 24px Inter, Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.62)';
  ctx.fillText('Luyện tập để bảo vệ bản thân và gia đình', 56, 1296);
  ctx.font = '900 24px Nunito, Arial';
  ctx.fillText('🛡️  AI Riser VN 2026', 750, 1296);
}

export default function ShareCard({ sessionId, userName }) {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [shareStatus, setShareStatus] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!sessionId) {
      setError('Chưa có buổi luyện tập để tạo thẻ chia sẻ.');
      return;
    }
    fetch(`/api/sessions/${sessionId}/dashboard`)
      .then(res => {
        if (!res.ok) throw new Error('Không thể tải thẻ chia sẻ.');
        return res.json();
      })
      .then(data => setDashboard(data))
      .catch(err => setError(err.message));
  }, [sessionId]);

  const cardData = useMemo(() => {
    if (!dashboard) return null;
    const recognized = dashboard.recognizedRedFlags || [];
    const missed = dashboard.missedRedFlags || [];
    return {
      score: dashboard.immunityScore || 0,
      detected: dashboard.recognizedCount || recognized.length,
      total: dashboard.totalCount || recognized.length + missed.length || 5,
      lesson: dashboard.nextRecommendation || 'Đừng vội tin khi bị thúc ép chuyển tiền ngay.',
      scenario: dashboard.scenarioTitle || 'Mô phỏng lừa đảo',
      recognized,
      missed,
      summary: dashboard.shareSummary || '',
    };
  }, [dashboard]);

  useEffect(() => {
    if (cardData && canvasRef.current) {
      drawShareCardToCanvas(canvasRef.current, cardData, userName);
    }
  }, [cardData, userName]);

  const handleCopy = () => {
    if (!cardData?.summary) return;
    navigator.clipboard.writeText(cardData.summary);
    setCopied(true);
    setShareStatus('Đã sao chép nội dung. Bạn có thể dán vào Zalo, Facebook hoặc tin nhắn.');
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      if (!blob) {
        window.open(canvasRef.current.toDataURL('image/png'), '_blank', 'noopener,noreferrer');
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `ai-scam-inoculation-${sessionId}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  };

  const copyShareText = async (text, url) => {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    setCopied(true);
  };

  const handleShare = async (platform) => {
    const text = cardData?.summary || 'Tôi vừa luyện nhận biết lừa đảo với AI Scam Inoculation.';
    const url = window.location.href;
    const isLocalUrl = /^https?:\/\/(localhost|127\.0\.0\.1)/i.test(url);
    setShareStatus(platform === 'facebook'
      ? 'Đang chuẩn bị nội dung chia sẻ Facebook...'
      : 'Đang chuẩn bị nội dung chia sẻ Zalo...');

    try {
      if (navigator.share && canvasRef.current) {
        const blob = await new Promise((resolve) => canvasRef.current.toBlob(resolve, 'image/png'));
        const file = blob ? new File([blob], `ai-scam-inoculation-${sessionId}.png`, { type: 'image/png' }) : null;
        if (file && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ title: 'Kết quả luyện nhận biết lừa đảo', text, files: [file] });
          setShareStatus('Đã mở bảng chia sẻ. Hãy chọn Zalo, Facebook hoặc ứng dụng bạn muốn.');
          return;
        }
        await navigator.share({ title: 'Kết quả luyện nhận biết lừa đảo', text, url });
        setShareStatus('Đã mở bảng chia sẻ. Hãy chọn Zalo, Facebook hoặc ứng dụng bạn muốn.');
        return;
      }

      await copyShareText(text, url);
      if (platform === 'facebook' && !isLocalUrl) {
        setShareStatus('Đã sao chép nội dung và mở Facebook. Nếu cửa sổ không hiện, hãy kiểm tra popup blocker.');
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
        return;
      }

      if (platform === 'facebook' && isLocalUrl) {
        setShareStatus('Đang chạy localhost nên Facebook không nhận link này. Nội dung đã được sao chép, hãy dán vào bài viết Facebook khi cần.');
        return;
      }

      setShareStatus('Zalo không hỗ trợ đăng tự động từ web desktop. Nội dung đã được sao chép, hãy mở Zalo và dán vào tin nhắn/bài đăng.');
    } catch (err) {
      setShareStatus('Trình duyệt đã chặn chia sẻ. Mình đã chuyển sang cách sao chép nội dung để bạn dán thủ công.');
      try {
        await copyShareText(text, url);
      } catch {}
    }
  };

  const handleFacebookShare = async () => {
    await handleShare('facebook');
  };

  if (error) {
    return (
      <section className="panel share-screen">
        <div className="ui-card stack" style={{ padding: '24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--danger)', margin: 0 }}>{error}</p>
          <button type="button" className="outline" onClick={() => window.location.hash = ''}>← Quay lại trang chính</button>
        </div>
      </section>
    );
  }

  if (!cardData) {
    return (
      <section className="panel share-screen">
        <div className="ui-card stack" style={{ padding: '24px', textAlign: 'center' }}>
          <p>Đang tạo thẻ chia sẻ...</p>
        </div>
      </section>
    );
  }

  const learned = cardData.recognized.slice(0, 3);
  const missed = cardData.missed.slice(0, 2);

  return (
    <section className="panel share-screen">
      <header className="share-mobile-header">
        <button type="button" className="share-back" onClick={() => window.location.hash = `dashboard/${sessionId}`}>
          ← Quay lại
        </button>
        <h1>Chia sẻ kết quả</h1>
      </header>

      <div className="share-layout">
        <div>
          <div className="share-intro">
            <h2>Chia sẻ để nhắc nhở người thân cùng luyện tập.</h2>
            <p>Không có nội dung chat. Chỉ chia sẻ kết quả tổng hợp.</p>
          </div>

          <div className="share-divider">
            <i />
            <span>Xem trước thẻ kết quả</span>
            <i />
          </div>

          <article className="social-preview-card" aria-label="Thẻ chia sẻ kết quả luyện tập">
            <div className="social-card-top">
              <div className="social-brand">
                <span aria-hidden="true">🛡️</span>
                <div>
                  <strong>Luyện tập nhận biết lừa đảo</strong>
                  <small>AI Scam Inoculation</small>
                </div>
              </div>
              <b>{cardData.scenario}</b>
            </div>

            <div className="social-score-row">
              <div className="score-ring">
                <strong>{cardData.score}%</strong>
              </div>
              <div>
                <span>Tôi vừa nhận ra</span>
                <strong>{cardData.detected}<small>/{cardData.total}</small></strong>
                <p>dấu hiệu lừa đảo</p>
                <em>{userName || 'Bạn'} · {monthLabel()}</em>
              </div>
            </div>

            <div className="social-tags">
              {learned.map((flag) => (
                <span key={flag.key}>✓ {flag.label}</span>
              ))}
              {missed.map((flag) => (
                <span className="muted" key={flag.key}>✕ {flag.label}</span>
              ))}
            </div>

            <div className="lesson-box">
              <small>Bài học rút ra</small>
              <p>"{cardData.lesson}"</p>
            </div>

            <footer className="social-card-footer">
              <span>Luyện tập để bảo vệ bản thân và gia đình</span>
              <b>🛡️ AI Riser VN 2026</b>
            </footer>
          </article>

          <div className="share-mobile-actions">
            <p className="section-label">Chia sẻ lên mạng xã hội</p>
            <button type="button" onClick={() => handleShare('zalo')}>💬 Chia sẻ lên Zalo</button>
            <button type="button" onClick={handleFacebookShare}>📘 Chia sẻ lên Facebook</button>
            <button type="button" className="download-button" onClick={handleDownload}>📷 Lưu ảnh về máy</button>
            <button type="button" className="outline" onClick={() => window.location.hash = `dashboard/${sessionId}`}>← Quay lại kết quả</button>
            {shareStatus ? <p className="share-copy-note">{shareStatus}</p> : null}
          </div>

          <canvas ref={canvasRef} className="share-export-canvas" aria-hidden="true" />

          <div className="privacy-note-card">
            <p>🔒 Thẻ chỉ hiển thị điểm tổng hợp và bài học. Không có tên đầy đủ, số điện thoại, hay nội dung trò chuyện.</p>
          </div>
        </div>

        <aside className="share-actions-panel">
          <p className="section-label">Chia sẻ lên mạng xã hội</p>
          <button type="button" onClick={() => handleShare('zalo')}>💬 Chia sẻ lên Zalo</button>
          <button type="button" onClick={handleFacebookShare}>📘 Chia sẻ lên Facebook</button>
          <button type="button" className="download-button" onClick={handleDownload}>📷 Lưu ảnh về máy</button>
          <button type="button" className="outline" onClick={() => window.location.hash = `dashboard/${sessionId}`}>← Quay lại kết quả</button>
          {shareStatus ? <p className="share-copy-note">{shareStatus}</p> : null}
        </aside>
      </div>
    </section>
  );
}
