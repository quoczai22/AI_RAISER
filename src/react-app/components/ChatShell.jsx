import React, { useState, useEffect, useRef } from 'react';

function maskSensitiveForDisplay(value) {
  let masked = String(value || "");
  masked = masked.replace(/\b(số tài khoản|stk|tài khoản)\s*[:=]?\s*(?:\d[\s.-]?){6,19}\b/gi, "$1 [MASKED_ACCOUNT]");
  masked = masked.replace(/\b\d{12}\b/g, "[MASKED_CCCD]");
  masked = masked.replace(/\b(?:\d[ -]?){13,19}\b/g, "[MASKED_CARD]");
  masked = masked.replace(/\b(?:\+?84|0)(?:\d[\s.-]?){8,10}\b/g, "[MASKED_PHONE]");
  masked = masked.replace(/\b\d{4,8}\b/g, "[MASKED_OTP]");
  masked = masked.replace(/(mật khẩu|password)\s*[:=]?\s*\S+/gi, "$1 [MASKED_PASSWORD]");
  return {
    masked,
    changed: masked !== String(value || ""),
  };
}

function fallbackNotice(reason) {
  if (reason === "NO_GEMINI_API_KEY") {
    return "AI chưa sẵn sàng. Đang dùng tin nhắn mẫu an toàn.";
  }
  if (reason === "GEMINI_TIMEOUT") {
    return "AI trả lời chậm. Tạm dùng tin nhắn mẫu an toàn để không bị gián đoạn.";
  }
  if (reason === "GEMINI_HTTP_429") {
    return "AI đang bận. Tạm dùng tin nhắn mẫu an toàn.";
  }
  return "AI gặp lỗi tạm thời. Tạm dùng tin nhắn mẫu an toàn.";
}

export default function ChatShell() {
  const [session, setSession] = useState(null);
  const [scenario, setScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [safetyNotices, setSafetyNotices] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [maxMessageLength, setMaxMessageLength] = useState(1000);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

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

    Promise.all([
      fetch(`/api/sessions/${sessionId}`).then(res => {
        if (!res.ok) throw new Error('Không thể tải thông tin buổi luyện tập.');
        return res.json();
      }),
      fetch(`/api/sessions/${sessionId}/messages`).then(res => {
        if (!res.ok) throw new Error('Không thể tải lịch sử tin nhắn.');
        return res.json();
      }),
      fetch('/api/scenarios').then(res => {
        if (!res.ok) throw new Error('Không thể tải kịch bản.');
        return res.json();
      }),
      fetch('/api/runtime-status').then(res => res.json()).catch(() => ({}))
    ])
      .then(([sessData, msgData, scData, runtimeData]) => {
        setSession(sessData.session);
        setMessages(msgData.messages || []);
        const matched = (scData.scenarios || []).find(sc => sc.id === sessData.session.scenarioId);
        setScenario(matched);
        if (runtimeData.maxMessageLength) {
          setMaxMessageLength(runtimeData.maxMessageLength);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [sessionId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isSending, safetyNotices]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSending) return;
    const text = inputValue.trim();
    if (!text) return;

    if (text.length > maxMessageLength) {
      setSafetyNotices(prev => [...prev, `Tin nhắn tối đa ${maxMessageLength} ký tự.`]);
      return;
    }

    const displayMsg = maskSensitiveForDisplay(text);
    // Optimistic UI update
    setMessages(prev => [...prev, { role: 'user', content: displayMsg.masked }]);
    setIsSending(true);
    setInputValue('');

    fetch(`/api/sessions/${sessionId}/messages`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message: text })
    })
      .then(res => {
        if (!res.ok) throw new Error('Gửi tin nhắn thất bại.');
        return res.json();
      })
      .then(data => {
        if (data.safety?.maskedSensitiveInput) {
          setSafetyNotices(prev => [...prev, "Mình đã ẩn thông tin nhạy cảm để bảo vệ riêng tư."]);
        }
        if (data.safety?.provider === 'safe_fallback') {
          setSafetyNotices(prev => [...prev, fallbackNotice(data.safety?.fallbackReason)]);
        }
        setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
        setIsSending(false);

        if (data.sessionStatus === 'completed') {
          handleStop();
        }
      })
      .catch(err => {
        setSafetyNotices(prev => [...prev, err.message]);
        setIsSending(false);
      });
  };

  const handleStop = () => {
    if (!sessionId) return;
    fetch(`/api/sessions/${sessionId}/complete`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' }
    })
      .then(res => {
        if (!res.ok) throw new Error('Không thể hoàn thành buổi luyện tập.');
        return res.json();
      })
      .then(data => {
        // Save to local storage history
        try {
          const history = JSON.parse(localStorage.getItem('aisi_history') || '[]');
          const updated = [data, ...history.filter(h => h.id !== data.id)];
          localStorage.setItem('aisi_history', JSON.stringify(updated));
        } catch {}
        window.location.hash = `dashboard/${sessionId}`;
      })
      .catch(err => {
        alert(err.message);
      });
  };

  if (loading) {
    return (
      <div className="panel ui-card stack" style={{ padding: '24px', textAlign: 'center' }}>
        <p>Đang tải phòng chat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel ui-card stack" style={{ padding: '24px', textAlign: 'center' }}>
        <p className="error" style={{ color: 'var(--danger)' }}>Lỗi: {error}</p>
        <button className="outline" onClick={() => window.location.hash = ''}>Quay lại trang chính</button>
      </div>
    );
  }

  const diffMap = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };
  const diffLabel = diffMap[session?.difficulty] || 'Dễ';

  return (
    <section className="panel">
      <div className="chat-layout">
        {/* Desktop Sidebar */}
        <aside className="chat-sidebar">
          <div className="stack" style={{ gap: '8px' }}>
            <p className="eyebrow" style={{ margin: 0 }}>Tình huống đang luyện</p>
            <h3 style={{ margin: 0, fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: '1.15rem', color: 'var(--foreground)' }}>
              {scenario?.title || 'Mô phỏng lừa đảo'}
            </h3>
            <p className="subtitle" style={{ margin: 0, fontSize: '0.8rem' }}>
              Cấp độ thử thách: <strong>{diffLabel}</strong>
            </p>
          </div>

          <div className="notice danger-note" style={{ borderLeftColor: 'var(--danger)', background: 'var(--danger-bg)', color: '#7F1D1D', fontSize: '0.8rem', padding: '14px' }}>
            <strong>Chú ý:</strong> Đây là kịch bản giả lập để thử phản xạ của bạn. Tuyệt đối không nhập thông tin cá nhân hay tài khoản thật.
          </div>

          <div className="notice" style={{ borderLeftColor: 'var(--success)', background: 'var(--success-bg)', color: 'var(--secondary-foreground)', fontSize: '0.8rem', padding: '14px' }}>
            <strong>Mẹo luyện tập:</strong> Hãy phát hiện các dấu hiệu ép buộc chuyển khoản gấp, hối thúc thời gian, hoặc yêu cầu mật khẩu/OTP.
          </div>
        </aside>

        {/* Chat main window */}
        <div className="chat-main">
          <div className="chat-topbar" style={{ background: 'var(--primary)', color: 'white', padding: '12px 20px', border: 0 }}>
            <div className="chat-topbar-info" style={{ color: 'white' }}>
              <h2 style={{ margin: 0, color: 'white', fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: '1.1rem' }}>
                {scenario?.title || 'Mô phỏng'}
              </h2>
              <p className="subtitle" style={{ margin: '2px 0 0', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.75rem' }}>
                Mức độ: <strong>{diffLabel}</strong>
              </p>
            </div>
            <button
              className="warning"
              id="stop-chat"
              onClick={handleStop}
              style={{ minHeight: '40px', height: '40px', padding: '8px 16px', fontSize: '0.85rem', fontFamily: "'Nunito', sans-serif", borderRadius: '8px', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', boxShadow: 'none' }}
            >
              <span aria-hidden="true">■</span> Dừng luyện tập
            </button>
          </div>

          <div className="chat-warning-strip" style={{ background: 'var(--danger-bg)', color: '#7F1D1D', fontSize: '0.75rem', fontWeight: 700, textAlign: 'center', padding: '8px 16px', borderBottom: '1px solid var(--border)', fontFamily: "'Nunito', sans-serif" }}>
            ⚠️ Không nhập OTP, CCCD, mật khẩu, số tài khoản.
          </div>

          <div className="chat-messages" style={{ background: '#F0EDE8', padding: '20px' }}>
            {messages.length === 0 ? (
              <div className="bubble ai" style={{ background: 'white', border: '2px solid var(--border)', borderRadius: '12px', borderTopLeftRadius: '2px', padding: '12px 16px', fontSize: '0.95rem' }}>
                Chào bạn, đây là buổi luyện tập. Hãy nhắn tin đầu tiên để bắt đầu.
              </div>
            ) : null}

            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`bubble ${message.role}`}
                style={{
                  fontSize: '0.95rem',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  maxWidth: '80%',
                  marginBottom: '8px',
                  lineHeight: '1.4',
                  ...(message.role === 'user'
                    ? { background: 'var(--primary)', color: 'white', alignSelf: 'flex-end', borderTopRightRadius: '2px' }
                    : { background: 'white', border: '2px solid var(--border)', color: 'var(--foreground)', alignSelf: 'flex-start', borderTopLeftRadius: '2px' }
                  )
                }}
              >
                <div className="bubble-content">{message.content}</div>
              </div>
            ))}

            {isSending ? (
              <div className="bubble ai typing" style={{ fontStyle: 'italic', color: 'var(--muted-foreground)', background: 'rgba(255,255,255,0.7)', border: '2px solid var(--border)', borderRadius: '12px', borderTopLeftRadius: '2px', padding: '12px 16px', alignSelf: 'flex-start', fontSize: '0.95rem' }}>
                AI đang trả lời...
              </div>
            ) : null}

            {safetyNotices.map((notice, idx) => (
              <div key={idx} className="notice danger-note" style={{ borderRadius: 'var(--radius)', marginTop: '8px', padding: '10px 14px', fontSize: '0.85rem' }}>
                {notice}
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          <form className="chat-form" id="chat-form" onSubmit={handleSubmit} style={{ padding: '12px 20px', gap: '12px', background: 'var(--card)', borderTop: '2px solid var(--border)' }}>
            <textarea
              id="chat-input"
              maxLength={maxMessageLength}
              autocomplete="off"
              autocapitalize="none"
              spellcheck="false"
              placeholder="Nhập tin nhắn..."
              aria-label="Nhập tin nhắn"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={isSending}
              style={{ minHeight: '52px', maxHeight: '120px', fontSize: '0.95rem', borderRadius: '10px' }}
            />
            <div className="chat-actions" style={{ height: '52px' }}>
              <button
                type="submit"
                disabled={isSending}
                style={{ height: '52px', fontSize: '1rem', borderRadius: '10px', fontFamily: "'Nunito', sans-serif" }}
              >
                <span aria-hidden="true">➤</span> Gửi
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
