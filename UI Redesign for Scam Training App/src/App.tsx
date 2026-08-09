import { useState, useRef, useEffect } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen =
  | 'nhap-ten'
  | 'dashboard'
  | 'chon-tinh-huong'
  | 'xac-nhan'
  | 'chat'
  | 'ket-qua'
  | 'so-dien-thoai'
  | 'the-chia-se'
  | 'design-system'

type Difficulty = 'de' | 'vua' | 'kho'

interface ChatMessage {
  role: 'bot' | 'user'
  text: string
  time: string
}

interface Scenario {
  id: string
  title: string
  icon: string
  desc: string
  tag: string
  tagColor: string
}

// ─── Static data ──────────────────────────────────────────────────────────────

const SCENARIOS: Scenario[] = [
  {
    id: 'ngan-hang',
    title: 'Giả danh ngân hàng',
    icon: '🏦',
    desc: 'Kẻ gian mạo danh nhân viên ngân hàng, yêu cầu xác minh tài khoản khẩn cấp.',
    tag: 'Phổ biến',
    tagColor: 'text-amber-700 bg-amber-100',
  },
  {
    id: 'viec-nhe',
    title: 'Việc nhẹ lương cao',
    icon: '💼',
    desc: 'Mời làm cộng tác viên online, chỉ cần bấm điện thoại, thu nhập hấp dẫn.',
    tag: 'Thường gặp',
    tagColor: 'text-blue-700 bg-blue-100',
  },
  {
    id: 'nguoi-quen',
    title: 'Giả danh người quen',
    icon: '👤',
    desc: 'Nhắn tin giả danh con cháu, bạn bè đang gặp khó khăn, cần chuyển tiền gấp.',
    tag: 'Nguy hiểm',
    tagColor: 'text-red-700 bg-red-100',
  },
  {
    id: 'uu-dai',
    title: 'Ưu đãi khan hiếm',
    icon: '🎁',
    desc: 'Thông báo trúng thưởng hoặc ưu đãi đặc biệt, chỉ còn hiệu lực trong hôm nay.',
    tag: 'Thường gặp',
    tagColor: 'text-blue-700 bg-blue-100',
  },
]

const CHAT_SCRIPT: ChatMessage[] = [
  {
    role: 'bot',
    text: 'Xin chào! Tôi là Minh, nhân viên chăm sóc khách hàng ngân hàng ABC. Chúng tôi phát hiện tài khoản của bạn có dấu hiệu bất thường. Bạn có thể xác minh ngay không ạ?',
    time: '14:23',
  },
  {
    role: 'user',
    text: 'Tài khoản của tôi có vấn đề gì vậy?',
    time: '14:24',
  },
  {
    role: 'bot',
    text: 'Có người đăng nhập từ thiết bị lạ tại Hà Nội lúc 2 giờ sáng nay. Để bảo vệ tài khoản, bạn cần xác minh ngay trong 15 phút, nếu không tài khoản sẽ bị khóa. Bạn vui lòng cho tôi biết mã OTP vừa gửi đến điện thoại không?',
    time: '14:24',
  },
]

const DANGER_SIGNS = [
  { label: 'Khẩn cấp giả tạo', icon: '⏰', desc: 'Tạo áp lực thời gian để bạn không kịp suy nghĩ', detected: true },
  { label: 'Giả danh quyền lực', icon: '🏢', desc: 'Tự xưng nhân viên ngân hàng/cơ quan nhà nước', detected: true },
  { label: 'Gây sợ hãi', icon: '😨', desc: 'Đe dọa tài khoản bị khóa nếu không làm ngay', detected: true },
  { label: 'Yêu cầu thông tin nhạy cảm', icon: '🔑', desc: 'Hỏi OTP, mật khẩu — ngân hàng thật không bao giờ hỏi', detected: false },
  { label: 'Khan hiếm & áp lực', icon: '⚡', desc: 'Chỉ còn 15 phút, tạo cảm giác không có lựa chọn', detected: false },
]

const NAV_ITEMS: { id: Screen; label: string; icon: string; group?: string }[] = [
  { id: 'nhap-ten',       label: 'Bắt đầu',          icon: '▶',  group: 'flow' },
  { id: 'dashboard',      label: 'Trang chính',       icon: '🏠', group: 'flow' },
  { id: 'chon-tinh-huong',label: 'Chọn tình huống',   icon: '🎯', group: 'flow' },
  { id: 'xac-nhan',       label: 'Xác nhận',          icon: '✅', group: 'flow' },
  { id: 'chat',           label: 'Chat luyện tập',    icon: '💬', group: 'flow' },
  { id: 'ket-qua',        label: 'Kết quả',           icon: '📊', group: 'flow' },
  { id: 'so-dien-thoai',  label: 'Số xác minh',       icon: '📞', group: 'flow' },
  { id: 'the-chia-se',    label: 'Thẻ chia sẻ',       icon: '📤', group: 'flow' },
  { id: 'design-system',  label: 'Design System',     icon: '🎨', group: 'meta' },
]

// ─── Primitive components ─────────────────────────────────────────────────────

function Btn({
  children, onClick, variant = 'primary', size = 'lg',
  className = '', disabled = false, icon, full = true,
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'lg' | 'md' | 'sm'
  className?: string
  disabled?: boolean
  icon?: string
  full?: boolean
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-bold rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-3 active:scale-[0.98] select-none'
  const sizes: Record<string, string> = {
    lg: `min-h-[56px] px-6 text-[1.125rem] ${full ? 'w-full' : ''}`,
    md: `min-h-[48px] px-5 text-[1rem] ${full ? 'w-full' : ''}`,
    sm: 'min-h-[40px] px-4 text-[0.9rem]',
  }
  const variants: Record<string, string> = {
    primary:   'bg-[#1A6FA8] text-white hover:bg-[#155d8f] shadow-sm focus-visible:ring-[#1A6FA8]',
    secondary: 'bg-[#E8F4EC] text-[#1A5C35] hover:bg-[#d4ecdb] focus-visible:ring-[#2D7A4F]',
    danger:    'bg-[#DC2626] text-white hover:bg-[#b91c1c] focus-visible:ring-[#DC2626]',
    ghost:     'bg-transparent text-[#1A6FA8] hover:bg-[#EDF4FA] focus-visible:ring-[#1A6FA8]',
    outline:   'bg-white border-2 border-[#D6D0C8] text-[#1C1917] hover:border-[#1A6FA8] hover:text-[#1A6FA8] focus-visible:ring-[#1A6FA8]',
  }
  return (
    <button
      onClick={onClick} disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  )
}

function Card({ children, className = '', onClick, selected = false }: {
  children: React.ReactNode; className?: string; onClick?: () => void; selected?: boolean
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border-2 transition-all duration-150 ${
        selected ? 'border-[#1A6FA8] shadow-md' : 'border-[#D6D0C8] hover:border-[#1A6FA8]'
      } ${onClick ? 'cursor-pointer active:scale-[0.99]' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

function ProgressBar({ value, max, label, light = false }: {
  value: number; max: number; label: string; light?: boolean
}) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="space-y-1.5">
      <div className={`flex justify-between text-sm font-semibold ${light ? 'text-white/70' : 'text-[#6B6560]'}`}>
        <span>{label}</span>
        <span>{value}/{max}</span>
      </div>
      <div className={`h-3 rounded-full overflow-hidden ${light ? 'bg-white/20' : 'bg-[#EDE9E3]'}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${light ? 'bg-white' : 'bg-[#2D7A4F]'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function SafetyBadge({ text }: { text: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 bg-[#E8F4EC] text-[#1A5C35] text-sm font-semibold px-3 py-1.5 rounded-full">
      <span>✓</span><span>{text}</span>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.8rem] font-black text-[#A8A29E] uppercase tracking-widest mb-3"
       style={{ fontFamily: "'Nunito', sans-serif" }}>
      {children}
    </p>
  )
}

// ─── App Shell ────────────────────────────────────────────────────────────────

function DesktopSidebar({
  screen, setScreen, userName,
}: {
  screen: Screen; setScreen: (s: Screen) => void; userName: string
}) {
  const flowItems = NAV_ITEMS.filter(n => n.group === 'flow')
  const metaItems = NAV_ITEMS.filter(n => n.group === 'meta')

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-[220px] bg-[#12293D] z-40 overflow-hidden">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#1A6FA8] rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-[1.1rem]">🛡️</span>
          </div>
          <div>
            <p className="text-white font-black text-[0.875rem] leading-none"
               style={{ fontFamily: "'Nunito', sans-serif" }}>
              Nhận biết lừa đảo
            </p>
            <p className="text-white/40 text-[0.65rem] mt-0.5">AI Scam Inoculation</p>
          </div>
        </div>
        {userName && (
          <div className="mt-4 bg-white/8 rounded-xl px-3 py-2.5">
            <p className="text-white/50 text-[0.65rem] font-bold uppercase tracking-wide">Đang luyện tập</p>
            <p className="text-white font-black text-[0.9375rem] mt-0.5"
               style={{ fontFamily: "'Nunito', sans-serif" }}>
              {userName}
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-2 mb-2 text-white/30 text-[0.6rem] font-black uppercase tracking-widest">
          Các màn hình
        </p>
        {flowItems.map((item, i) => (
          <button
            key={item.id}
            onClick={() => setScreen(item.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-[0.8125rem] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
              screen === item.id
                ? 'bg-[#1A6FA8] text-white font-bold'
                : 'text-white/55 hover:text-white hover:bg-white/8'
            }`}
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            <span className={`text-[0.65rem] font-black w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
              screen === item.id ? 'bg-white/20 text-white' : 'text-white/25'
            }`}>
              {i + 1}
            </span>
          </button>
        ))}

        <div className="pt-3 border-t border-white/8 mt-3">
          {metaItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-[0.8125rem] font-semibold transition-all ${
                screen === item.id ? 'bg-[#2D7A4F]/60 text-white' : 'text-white/40 hover:text-white hover:bg-white/8'
              }`}
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Design tokens legend */}
      <div className="px-4 py-4 border-t border-white/8 space-y-1.5">
        <p className="text-white/30 text-[0.6rem] font-black uppercase tracking-widest mb-2">
          Màu hệ thống
        </p>
        {[
          { color: '#1A6FA8', label: 'Chính — hành động' },
          { color: '#2D7A4F', label: 'An toàn — xác nhận' },
          { color: '#D97706', label: 'Chú ý — cảnh báo' },
          { color: '#DC2626', label: 'Nguy hiểm — rủi ro' },
        ].map(c => (
          <div key={c.color} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: c.color }} />
            <span className="text-white/45 text-[0.65rem] leading-none">{c.label}</span>
          </div>
        ))}
      </div>
    </aside>
  )
}

function MobileBottomNav({ screen, setScreen }: {
  screen: Screen; setScreen: (s: Screen) => void
}) {
  const items = NAV_ITEMS.filter(n => n.group === 'flow')
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#12293D] z-50 border-t border-white/10">
      <div className="flex overflow-x-auto scrollbar-none px-2 py-2 gap-1">
        {items.map((item, i) => (
          <button
            key={item.id}
            onClick={() => setScreen(item.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-[0.72rem] font-bold whitespace-nowrap transition-all ${
              screen === item.id ? 'bg-[#1A6FA8] text-white' : 'text-white/45 hover:text-white'
            }`}
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            <span>{item.icon}</span>
            <span>{i + 1}. {item.label}</span>
          </button>
        ))}
        <button
          onClick={() => setScreen('design-system')}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-[0.72rem] font-bold whitespace-nowrap transition-all ${
            screen === 'design-system' ? 'bg-[#2D7A4F]/70 text-white' : 'text-white/30 hover:text-white'
          }`}
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          🎨 DS
        </button>
      </div>
    </div>
  )
}

// ─── Layout helpers ───────────────────────────────────────────────────────────

// Wraps a screen — mobile: 390px centered; desktop: full remaining width
function ScreenWrap({ children, className = '', bg = '#F5F3EE' }: {
  children: React.ReactNode; className?: string; bg?: string
}) {
  return (
    <div
      className={`w-full max-w-[390px] mx-auto min-h-screen flex flex-col lg:max-w-none lg:mx-0 lg:min-h-screen ${className}`}
      style={{ background: bg, fontFamily: "'Inter', sans-serif" }}
    >
      {children}
    </div>
  )
}

// Desktop: constrains content to a readable max width with padding
function DesktopContent({ children, className = '' }: {
  children: React.ReactNode; className?: string
}) {
  return (
    <div className={`lg:max-w-[960px] lg:mx-auto lg:w-full ${className}`}>
      {children}
    </div>
  )
}

function ScreenHeader({ title, onBack, rightSlot }: {
  title?: string; onBack?: () => void; rightSlot?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 bg-white border-b border-[#D6D0C8] sticky top-0 z-10">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[#1A6FA8] font-bold text-[1rem] min-h-[44px] min-w-[44px] hover:bg-[#EDF4FA] rounded-lg px-2 -ml-2 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#1A6FA8]"
          style={{ fontFamily: "'Nunito', sans-serif" }}
          aria-label="Quay lại"
        >
          <span className="text-xl">←</span>
          <span>Quay lại</span>
        </button>
      )}
      {title && (
        <h1
          className="flex-1 text-[1.125rem] font-bold text-[#1C1917] lg:text-[1.25rem]"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          {title}
        </h1>
      )}
      {rightSlot && <div>{rightSlot}</div>}
    </div>
  )
}

// ─── Screen 1: Nhập tên ──────────────────────────────────────────────────────

function ScreenNhapTen({ onNext }: { onNext: (name: string) => void }) {
  const [name, setName] = useState('')
  return (
    <ScreenWrap>
      {/* Mobile layout */}
      <div className="flex-1 flex flex-col justify-between px-6 pt-10 pb-8
                      lg:flex-row lg:items-center lg:justify-center lg:gap-20 lg:px-0 lg:py-0">

        {/* Left / top: branding */}
        <div className="flex flex-col items-center text-center gap-4 lg:items-start lg:text-left lg:max-w-[380px]">
          <div className="w-20 h-20 bg-[#1A6FA8] rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-4xl">🛡️</span>
          </div>
          <div>
            <h1 className="text-[1.75rem] font-black text-[#1C1917] leading-tight lg:text-[2.25rem]"
                style={{ fontFamily: "'Nunito', sans-serif" }}>
              Luyện tập<br />nhận biết lừa đảo
            </h1>
            <p className="mt-2 text-[1rem] text-[#6B6560] lg:text-[1.125rem]">
              Cùng AI luyện tập để không bị lừa —<br className="hidden lg:block" />
              hoàn toàn miễn phí, không cần tài khoản.
            </p>
          </div>
          {/* Pillars — desktop only */}
          <div className="hidden lg:flex flex-col gap-2.5 w-full mt-2">
            {[
              { icon: '🎯', text: 'Nhập vai tình huống thật để luyện phản xạ' },
              { icon: '🧠', text: 'AI phân tích từng dấu hiệu lừa đảo' },
              { icon: '👨‍👩‍👧', text: 'Phù hợp người cao tuổi, dễ dùng ngay' },
            ].map(p => (
              <div key={p.text} className="flex items-start gap-3 bg-white border border-[#D6D0C8] rounded-xl px-4 py-3">
                <span className="text-xl">{p.icon}</span>
                <p className="text-[0.9375rem] text-[#1C1917] font-medium">{p.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right / bottom: form */}
        <div className="space-y-4 lg:w-[380px] lg:bg-white lg:rounded-2xl lg:border-2 lg:border-[#D6D0C8] lg:p-8 lg:shadow-sm">
          <div className="lg:mb-2">
            <p className="hidden lg:block text-[1.25rem] font-black text-[#1C1917] mb-1"
               style={{ fontFamily: "'Nunito', sans-serif" }}>
              Bắt đầu luyện tập
            </p>
            <p className="hidden lg:block text-[0.875rem] text-[#6B6560]">
              Nhập tên để cá nhân hoá trải nghiệm của bạn.
            </p>
          </div>
          <div>
            <label htmlFor="ten" className="block text-[1rem] font-bold text-[#1C1917] mb-2"
                   style={{ fontFamily: "'Nunito', sans-serif" }}>
              Tên của cô/chú/anh/chị
            </label>
            <input
              id="ten" type="text" value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && name.trim() && onNext(name.trim())}
              placeholder="Ví dụ: Bác Hùng, Chị Mai..."
              className="w-full bg-[#F5F3EE] lg:bg-white border-2 border-[#D6D0C8] rounded-lg px-4 py-4 text-[1.125rem] text-[#1C1917] placeholder-[#A8A29E] focus:border-[#1A6FA8] focus:outline-none focus:ring-3 focus:ring-[#1A6FA8]/20 transition-all"
            />
          </div>
          <Btn onClick={() => name.trim() && onNext(name.trim())} disabled={!name.trim()} icon="▶">
            Bắt đầu luyện tập
          </Btn>
          <div className="bg-[#E8F4EC] border border-[#B6DFC2] rounded-lg px-4 py-3 space-y-2">
            <p className="text-[0.875rem] font-bold text-[#1A5C35]">✓ Hoàn toàn an toàn</p>
            <div className="flex flex-wrap gap-2">
              <SafetyBadge text="Không cần mật khẩu" />
              <SafetyBadge text="Không cần OTP" />
              <SafetyBadge text="Không mất tiền" />
            </div>
          </div>
          <p className="text-center text-[0.75rem] text-[#A8A29E]">Ứng dụng luyện tập — không xác minh thật</p>
        </div>
      </div>
    </ScreenWrap>
  )
}

// ─── Screen 2: Dashboard ─────────────────────────────────────────────────────

function ScreenDashboard({ name, onLuyenTap, onKetQua, onSoDienThoai }: {
  name: string; onLuyenTap: () => void; onKetQua: () => void; onSoDienThoai: () => void
}) {
  const stats = [
    { label: 'Buổi luyện', value: '3', icon: '🎯', sub: 'trong 8 buổi' },
    { label: 'Dấu hiệu đã học', value: '11', icon: '📚', sub: 'của 20 loại' },
    { label: 'Điểm trung bình', value: '72%', icon: '⭐', sub: 'tốt hơn tuần trước' },
  ]

  const history = [
    { scenario: 'Giả danh ngân hàng', score: '3/5', date: 'Hôm nay', diff: 'Vừa' },
    { scenario: 'Việc nhẹ lương cao', score: '4/5', date: 'Hôm qua', diff: 'Dễ' },
    { scenario: 'Giả danh người quen', score: '2/5', date: '3 ngày trước', diff: 'Khó' },
  ]

  return (
    <ScreenWrap>
      {/* ── Mobile header + Desktop top strip ── */}
      <div className="bg-[#1A6FA8]">
        <DesktopContent className="px-6 pt-8 pb-6 lg:pt-10 lg:pb-8 lg:px-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-200 text-[0.875rem] font-medium">Xin chào,</p>
              <h1 className="text-white text-[1.75rem] font-black mt-0.5 lg:text-[2rem]"
                  style={{ fontFamily: "'Nunito', sans-serif" }}>
                {name} 👋
              </h1>
              <p className="text-white/70 text-[0.875rem] mt-1 hidden lg:block">
                Hôm nay bạn muốn luyện tập tình huống nào?
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🛡️</span>
            </div>
          </div>
          {/* Progress — mobile */}
          <div className="mt-4 bg-white/15 rounded-xl p-4 space-y-3 lg:hidden">
            <ProgressBar value={3} max={8} label="Buổi luyện đã hoàn thành" light />
            <p className="text-white/80 text-[0.8rem]" style={{ fontFamily: "'Nunito', sans-serif" }}>
              💡 Bạn đã nhận biết được <strong>11 dấu hiệu lừa đảo</strong>. Tiếp tục nhé!
            </p>
          </div>
        </DesktopContent>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1">
        <DesktopContent className="px-5 py-4 lg:px-8 lg:py-6">

          {/* Stats row */}
          <div className="bg-white rounded-xl border border-[#D6D0C8] shadow-sm p-4 -mt-4 lg:mt-0 lg:mb-6">
            <div className="grid grid-cols-3 gap-3">
              {stats.map(s => (
                <div key={s.label} className="text-center lg:text-left lg:flex lg:items-center lg:gap-3 lg:p-2">
                  <div className="text-2xl lg:w-12 lg:h-12 lg:bg-[#EDF4FA] lg:rounded-xl lg:flex lg:items-center lg:justify-center lg:flex-shrink-0 lg:text-xl">
                    {s.icon}
                  </div>
                  <div>
                    <div className="text-[1.25rem] font-black text-[#1A6FA8] mt-0.5 lg:text-[1.5rem] lg:mt-0 lg:leading-none"
                         style={{ fontFamily: "'Nunito', sans-serif" }}>
                      {s.value}
                    </div>
                    <div className="text-[0.7rem] text-[#6B6560] font-medium leading-tight lg:text-[0.8rem]">
                      {s.label}
                    </div>
                    <div className="hidden lg:block text-[0.7rem] text-[#A8A29E] mt-0.5">{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Progress bar — desktop only */}
            <div className="hidden lg:block mt-4 pt-4 border-t border-[#EDE9E3]">
              <ProgressBar value={3} max={8} label="Tiến độ luyện tập" />
            </div>
          </div>

          {/* Two-column desktop layout */}
          <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6">
            {/* Left: main actions */}
            <div className="space-y-3 py-4 lg:py-0">
              <SectionLabel>Bạn muốn làm gì?</SectionLabel>

              <Card onClick={onLuyenTap} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#EDF4FA] rounded-xl flex items-center justify-center flex-shrink-0 lg:w-16 lg:h-16">
                    <span className="text-3xl">🎯</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[1.125rem] font-bold text-[#1C1917] lg:text-[1.25rem]"
                       style={{ fontFamily: "'Nunito', sans-serif" }}>
                      Luyện tập tình huống
                    </p>
                    <p className="text-[0.875rem] text-[#6B6560]">Chọn tình huống và luyện tập ngay</p>
                  </div>
                  <span className="text-[#1A6FA8] text-xl font-bold">›</span>
                </div>
              </Card>

              <Card onClick={onKetQua} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#FEF9EC] rounded-xl flex items-center justify-center flex-shrink-0 lg:w-16 lg:h-16">
                    <span className="text-3xl">📊</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[1.125rem] font-bold text-[#1C1917] lg:text-[1.25rem]"
                       style={{ fontFamily: "'Nunito', sans-serif" }}>
                      Xem kết quả gần đây
                    </p>
                    <p className="text-[0.875rem] text-[#6B6560]">Ôn lại những dấu hiệu đã học</p>
                  </div>
                  <span className="text-[#1A6FA8] text-xl font-bold">›</span>
                </div>
              </Card>

              <Card onClick={onSoDienThoai} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#FEF2F2] rounded-xl flex items-center justify-center flex-shrink-0 lg:w-16 lg:h-16">
                    <span className="text-3xl">📞</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[1.125rem] font-bold text-[#1C1917] lg:text-[1.25rem]"
                       style={{ fontFamily: "'Nunito', sans-serif" }}>
                      Số điện thoại xác minh
                    </p>
                    <p className="text-[0.875rem] text-[#6B6560]">Khi bạn cần xác minh thông tin thật</p>
                  </div>
                  <span className="text-[#1A6FA8] text-xl font-bold">›</span>
                </div>
              </Card>
            </div>

            {/* Right: history panel — desktop only */}
            <div className="hidden lg:block">
              <SectionLabel>Lịch sử luyện tập</SectionLabel>
              <div className="space-y-2.5">
                {history.map((h, i) => (
                  <div key={i} className="bg-white border border-[#D6D0C8] rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-[0.9375rem] text-[#1C1917] leading-tight"
                         style={{ fontFamily: "'Nunito', sans-serif" }}>
                        {h.scenario}
                      </p>
                      <span className="bg-[#EDF4FA] text-[#1A6FA8] text-[0.7rem] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                        {h.diff}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[1.125rem] font-black text-[#1A6FA8]"
                            style={{ fontFamily: "'Nunito', sans-serif" }}>
                        {h.score}
                      </span>
                      <span className="text-[0.75rem] text-[#A8A29E]">{h.date}</span>
                    </div>
                  </div>
                ))}
                <div className="bg-[#E8F4EC] border border-[#B6DFC2] rounded-xl p-3.5 mt-1">
                  <p className="text-[0.8125rem] text-[#1A5C35] font-medium">
                    💡 <strong>Mẹo:</strong> Luyện tập đều đặn mỗi ngày giúp nhận ra lừa đảo nhanh hơn rất nhiều.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DesktopContent>
      </div>
    </ScreenWrap>
  )
}

// ─── Screen 3: Chọn tình huống ───────────────────────────────────────────────

function ScreenChonTinhHuong({ onBack, onNext }: {
  onBack: () => void; onNext: (s: Scenario, d: Difficulty) => void
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty>('de')
  const selectedScenario = SCENARIOS.find(s => s.id === selected)

  const diffOptions: { value: Difficulty; label: string; desc: string; color: string }[] = [
    { value: 'de',  label: 'Dễ',  desc: 'Dấu hiệu rõ ràng, dễ nhận ra',   color: 'text-[#2D7A4F] bg-[#DCFCE7] border-[#86EFAC]' },
    { value: 'vua', label: 'Vừa', desc: 'Cần chú ý mới nhận ra',           color: 'text-[#D97706] bg-[#FEF3C7] border-[#FCD34D]' },
    { value: 'kho', label: 'Khó', desc: 'Rất tinh vi, giống thật',         color: 'text-[#DC2626] bg-[#FEE2E2] border-[#FECACA]' },
  ]

  return (
    <ScreenWrap>
      <ScreenHeader title="Chọn tình huống" onBack={onBack} />

      <div className="flex-1 overflow-y-auto">
        <DesktopContent className="px-5 py-4 lg:px-8 lg:py-6">
          <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-8 lg:items-start">

            {/* Left: scenario list */}
            <div>
              <SectionLabel>Chọn loại lừa đảo để luyện tập</SectionLabel>
              <div className="space-y-2.5 lg:space-y-3">
                {SCENARIOS.map(s => (
                  <Card key={s.id} onClick={() => setSelected(s.id)} selected={selected === s.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-[#F5F3EE] rounded-xl flex items-center justify-center flex-shrink-0 lg:w-14 lg:h-14">
                        <span className="text-2xl">{s.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[1rem] font-bold text-[#1C1917] lg:text-[1.0625rem]"
                             style={{ fontFamily: "'Nunito', sans-serif" }}>
                            {s.title}
                          </p>
                          <span className={`text-[0.7rem] font-bold px-2 py-0.5 rounded-full ${s.tagColor}`}>
                            {s.tag}
                          </span>
                        </div>
                        <p className="text-[0.875rem] text-[#6B6560] mt-0.5">{s.desc}</p>
                      </div>
                      {selected === s.id && (
                        <span className="text-[#1A6FA8] text-xl font-black flex-shrink-0 mt-1">✓</span>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right: difficulty + CTA */}
            <div className="mt-5 lg:mt-0 space-y-4">
              {/* Selected preview — desktop */}
              {selectedScenario ? (
                <div className="hidden lg:block bg-[#EDF4FA] border-2 border-[#1A6FA8] rounded-xl p-4">
                  <p className="text-[0.75rem] font-black text-[#1A6FA8] uppercase tracking-wide mb-2">
                    Đã chọn
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{selectedScenario.icon}</span>
                    <p className="font-bold text-[1rem] text-[#1C1917]"
                       style={{ fontFamily: "'Nunito', sans-serif" }}>
                      {selectedScenario.title}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="hidden lg:flex bg-[#F5F3EE] border-2 border-dashed border-[#D6D0C8] rounded-xl p-4 items-center justify-center h-[72px]">
                  <p className="text-[0.875rem] text-[#A8A29E] text-center">← Chọn một tình huống bên trái</p>
                </div>
              )}

              <div>
                <SectionLabel>Chọn mức độ khó</SectionLabel>
                <div className="grid grid-cols-3 gap-2 lg:gap-3">
                  {diffOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setDifficulty(opt.value)}
                      className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all text-center focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#1A6FA8] lg:p-4 ${
                        difficulty === opt.value ? `${opt.color} border-current` : 'border-[#D6D0C8] bg-white hover:border-[#1A6FA8]'
                      }`}
                    >
                      <span className={`text-[1.125rem] font-black ${difficulty === opt.value ? '' : 'text-[#1C1917]'}`}
                            style={{ fontFamily: "'Nunito', sans-serif" }}>
                        {opt.label}
                      </span>
                      <span className="text-[0.7rem] text-[#6B6560] mt-0.5 leading-tight hidden lg:block">
                        {opt.desc}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-[0.8rem] text-[#6B6560] mt-2 lg:hidden">
                  {diffOptions.find(o => o.value === difficulty)?.desc}
                </p>
              </div>

              <div className="pt-2 space-y-2.5">
                <Btn
                  onClick={() => selectedScenario && onNext(selectedScenario, difficulty)}
                  disabled={!selected}
                  icon="▶"
                >
                  Tiếp tục
                </Btn>
                <Btn variant="outline" onClick={onBack}>← Quay lại</Btn>
              </div>
            </div>
          </div>
        </DesktopContent>
      </div>
    </ScreenWrap>
  )
}

// ─── Screen 4: Xác nhận đồng ý ───────────────────────────────────────────────

function ScreenXacNhan({ scenario, difficulty, onBack, onConfirm }: {
  scenario: Scenario; difficulty: Difficulty; onBack: () => void; onConfirm: () => void
}) {
  const diffLabel: Record<Difficulty, string> = { de: 'Dễ', vua: 'Vừa', kho: 'Khó' }
  const rules = [
    { ok: false, text: 'Không nhập OTP, CCCD, mật khẩu' },
    { ok: false, text: 'Không nhập số tài khoản thật' },
    { ok: false, text: 'Không cung cấp thông tin cá nhân thật' },
    { ok: true,  text: 'AI đóng vai người lừa đảo để bạn luyện' },
    { ok: true,  text: 'Bạn có thể dừng bất cứ lúc nào' },
  ]
  return (
    <ScreenWrap>
      <ScreenHeader title="Xác nhận trước khi bắt đầu" onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        <DesktopContent className="px-5 py-5 lg:px-8 lg:py-8 lg:max-w-[640px]">
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{scenario.icon}</span>
                <div className="flex-1">
                  <p className="text-[0.8rem] text-[#6B6560] font-medium">Tình huống đã chọn</p>
                  <p className="text-[1.125rem] font-bold text-[#1C1917]"
                     style={{ fontFamily: "'Nunito', sans-serif" }}>
                    {scenario.title}
                  </p>
                </div>
                <span className="bg-[#EDF4FA] text-[#1A6FA8] text-[0.875rem] font-bold px-3 py-1 rounded-full">
                  {diffLabel[difficulty]}
                </span>
              </div>
            </Card>

            <div className="bg-[#FEF9EC] border-2 border-[#FCD34D] rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <p className="text-[1rem] font-black text-[#92400E]"
                   style={{ fontFamily: "'Nunito', sans-serif" }}>
                  Lưu ý quan trọng
                </p>
              </div>
              <div className="space-y-2">
                {rules.map((r, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className={`font-bold text-[0.875rem] mt-0.5 flex-shrink-0 ${r.ok ? 'text-[#2D7A4F]' : 'text-[#D97706]'}`}>
                      {r.ok ? '✓' : '✗'}
                    </span>
                    <p className="text-[0.9375rem] text-[#78350F] font-medium">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#E8F4EC] border border-[#B6DFC2] rounded-lg px-4 py-3">
              <p className="text-[0.875rem] text-[#1A5C35] font-medium">
                🔒 Nội dung trò chuyện <strong>không được lưu lại</strong> và chỉ dùng để luyện tập.
              </p>
            </div>

            <div className="space-y-2.5 pb-4">
              <Btn variant="secondary" onClick={onConfirm} icon="✓">
                Tôi hiểu, bắt đầu luyện tập
              </Btn>
              <Btn variant="outline" onClick={onBack}>← Quay lại</Btn>
            </div>
          </div>
        </DesktopContent>
      </div>
    </ScreenWrap>
  )
}

// ─── Screen 5: Chat nhập vai ─────────────────────────────────────────────────

function ScreenChat({ scenario, name, onStop, onFinish }: {
  scenario: Scenario; name: string; onStop: () => void; onFinish: () => void
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(CHAT_SCRIPT.slice(0, 1))
  const [input, setInput] = useState('')
  const [phase, setPhase] = useState<'chatting' | 'done'>('chatting')
  const [msgIndex, setMsgIndex] = useState(1)
  const bottomRef = useRef<HTMLDivElement>(null)

  const now = () => {
    const d = new Date()
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    const userMsg: ChatMessage = { role: 'user', text, time: now() }
    setMessages(m => [...m, userMsg])
    if (msgIndex < CHAT_SCRIPT.length) {
      const next = CHAT_SCRIPT[msgIndex]
      if (next.role === 'bot') {
        setTimeout(() => {
          setMessages(m => [...m, { ...next, time: now() }])
          setMsgIndex(i => i + 1)
          if (msgIndex + 1 >= CHAT_SCRIPT.length) setTimeout(() => setPhase('done'), 800)
        }, 1000)
      } else {
        setMsgIndex(i => i + 1)
        if (msgIndex + 1 >= CHAT_SCRIPT.length) setPhase('done')
      }
    } else {
      setPhase('done')
    }
  }

  const signalTips = [
    { icon: '⏰', text: 'Chú ý nếu bị thúc ép phải làm ngay' },
    { icon: '🏢', text: 'Kiểm tra danh tính người gọi' },
    { icon: '🔑', text: 'Không bao giờ cung cấp OTP' },
  ]

  return (
    <ScreenWrap bg="#F0EDE8">
      {/* Chat header */}
      <div className="bg-[#1A6FA8] px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-xl">{scenario.icon}</span>
        </div>
        <div className="flex-1">
          <p className="text-white font-bold text-[0.9375rem]"
             style={{ fontFamily: "'Nunito', sans-serif" }}>
            {scenario.title}
          </p>
          <p className="text-blue-200 text-[0.75rem]">Đang luyện tập — tình huống giả</p>
        </div>
        <button
          onClick={onStop}
          className="bg-white/20 hover:bg-white/30 text-white font-bold text-[0.8125rem] px-3 py-2 rounded-lg transition-all min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          🛑 Dừng
        </button>
      </div>

      {/* Safety banner */}
      <div className="bg-[#FEF3C7] border-b border-[#FCD34D] px-4 py-2 flex items-center gap-2">
        <span>⚠️</span>
        <p className="text-[0.75rem] font-bold text-[#92400E]">
          Không nhập OTP, CCCD, mật khẩu, số tài khoản
        </p>
      </div>

      {/* Desktop: two-column layout */}
      <div className="flex-1 flex min-h-0 lg:max-w-[960px] lg:mx-auto lg:w-full">

        {/* Desktop sidebar: context + tips */}
        <aside className="hidden lg:flex flex-col w-[280px] flex-shrink-0 border-r border-[#D6D0C8] bg-white overflow-y-auto">
          <div className="p-5 space-y-4">
            <div>
              <SectionLabel>Tình huống</SectionLabel>
              <div className="bg-[#F5F3EE] rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{scenario.icon}</span>
                  <p className="font-bold text-[0.9375rem] text-[#1C1917]"
                     style={{ fontFamily: "'Nunito', sans-serif" }}>
                    {scenario.title}
                  </p>
                </div>
                <p className="text-[0.8125rem] text-[#6B6560]">{scenario.desc}</p>
              </div>
            </div>

            <div>
              <SectionLabel>Dấu hiệu cần chú ý</SectionLabel>
              <div className="space-y-2.5">
                {signalTips.map(t => (
                  <div key={t.text} className="flex items-start gap-2.5 bg-[#FEF9EC] border border-[#FCD34D] rounded-lg p-3">
                    <span className="text-lg flex-shrink-0">{t.icon}</span>
                    <p className="text-[0.8125rem] text-[#78350F] font-medium">{t.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-3.5">
              <p className="text-[0.8125rem] text-[#991B1B] font-bold">
                🚫 Đây là tình huống giả. Không có tiền thật nào bị rủi ro.
              </p>
            </div>
          </div>
        </aside>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            <div className="text-center">
              <span className="bg-white/80 text-[#6B6560] text-[0.75rem] px-3 py-1 rounded-full">
                Bắt đầu tình huống luyện tập
              </span>
            </div>

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'bot' && (
                  <div className="w-8 h-8 bg-[#1A6FA8] rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                    <span className="text-sm">{scenario.icon}</span>
                  </div>
                )}
                <div className={`max-w-[78%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-[#1A6FA8] text-white rounded-tr-sm'
                    : 'bg-white text-[#1C1917] rounded-tl-sm shadow-sm'
                }`}>
                  <p className="text-[1rem] leading-relaxed">{msg.text}</p>
                  <p className={`text-[0.7rem] mt-1 ${msg.role === 'user' ? 'text-blue-200 text-right' : 'text-[#A8A29E]'}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}

            {phase === 'done' && (
              <div className="text-center mt-4 space-y-2">
                <p className="text-[0.875rem] text-[#6B6560]">Bạn đã hoàn thành tình huống luyện tập</p>
                <button
                  onClick={onFinish}
                  className="bg-[#2D7A4F] text-white font-bold text-[1rem] px-6 py-3 rounded-xl min-h-[52px] hover:bg-[#256040] transition-all focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#2D7A4F]"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  📊 Xem kết quả phân tích
                </button>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {phase === 'chatting' && (
            <div className="bg-white border-t border-[#D6D0C8] px-4 py-3">
              <div className="flex gap-2 items-end">
                <input
                  type="text" value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Nhập câu trả lời của bạn..."
                  className="flex-1 bg-[#F5F3EE] border-2 border-[#D6D0C8] rounded-xl px-4 py-3 text-[1rem] text-[#1C1917] placeholder-[#A8A29E] focus:border-[#1A6FA8] focus:outline-none min-h-[52px]"
                />
                <button
                  onClick={handleSend} disabled={!input.trim()}
                  className="bg-[#1A6FA8] hover:bg-[#155d8f] disabled:opacity-50 text-white font-bold px-4 py-3 rounded-xl min-h-[52px] flex items-center gap-1.5 transition-all"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  <span>Gửi</span><span>→</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ScreenWrap>
  )
}

// ─── Screen 6: Kết quả phân tích ─────────────────────────────────────────────

function ScreenKetQua({ name, onLuyenTiep, onVeTrangChinh, onChiaSe }: {
  name: string; onLuyenTiep: () => void; onVeTrangChinh: () => void; onChiaSe: () => void
}) {
  const detected = DANGER_SIGNS.filter(s => s.detected).length
  const total = DANGER_SIGNS.length
  const pct = Math.round((detected / total) * 100)
  const r = 52; const circ = 2 * Math.PI * r

  return (
    <ScreenWrap>
      <ScreenHeader title="Kết quả phân tích" />
      <div className="flex-1 overflow-y-auto">
        <DesktopContent className="px-5 py-4 lg:px-8 lg:py-6">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start">

            {/* Left: score + lesson */}
            <div className="space-y-4">
              {/* Score hero */}
              <div className="bg-[#1A6FA8] rounded-2xl p-5">
                <div className="flex items-center gap-5">
                  {/* SVG ring */}
                  <div className="relative flex-shrink-0 w-[120px] h-[120px]">
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r={r} stroke="rgba(255,255,255,0.2)" strokeWidth="10" fill="none" />
                      <circle
                        cx="60" cy="60" r={r} stroke="white" strokeWidth="10" fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${(pct / 100) * circ} ${circ}`}
                        transform="rotate(-90 60 60)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-white text-[1.75rem] font-black leading-none"
                            style={{ fontFamily: "'Nunito', sans-serif" }}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-blue-200 text-[0.875rem]">Kết quả buổi luyện tập</p>
                    <p className="text-white text-[2.5rem] font-black leading-none mt-1"
                       style={{ fontFamily: "'Nunito', sans-serif" }}>
                      {detected}<span className="text-[1.25rem] text-white/60">/{total}</span>
                    </p>
                    <p className="text-white text-[0.9375rem] font-semibold">dấu hiệu đã nhận ra</p>
                    <p className="text-blue-200 text-[0.8rem] mt-1">
                      {detected >= 4 ? 'Rất tốt! Bạn đã nhận ra phần lớn dấu hiệu'
                       : detected >= 2 ? 'Khá tốt! Luyện thêm để nhận ra nhiều hơn'
                       : 'Không sao, luyện tập nhiều lần là quen thôi!'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Key lesson */}
              <div className="bg-[#FEF9EC] border-l-4 border-[#D97706] rounded-lg p-4">
                <p className="text-[0.75rem] font-black text-[#92400E] uppercase tracking-wide mb-1.5">
                  Bài học hôm nay
                </p>
                <p className="text-[1rem] font-bold text-[#78350F]"
                   style={{ fontFamily: "'Nunito', sans-serif" }}>
                  "Đừng vội tin khi bị thúc ép chuyển tiền ngay. Ngân hàng thật không bao giờ hỏi OTP."
                </p>
              </div>

              {/* Actions — desktop shows here */}
              <div className="hidden lg:flex flex-col gap-2.5 pt-2">
                <Btn onClick={onLuyenTiep} icon="🎯">Luyện tập tiếp</Btn>
                <Btn variant="secondary" onClick={onChiaSe} icon="📤">Chia sẻ kết quả</Btn>
                <Btn variant="outline" onClick={onVeTrangChinh}>← Về trang chính</Btn>
              </div>
            </div>

            {/* Right: signs breakdown */}
            <div className="mt-4 lg:mt-0">
              <SectionLabel>Các dấu hiệu trong tình huống này</SectionLabel>
              <div className="space-y-2.5">
                {DANGER_SIGNS.map((sign, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl border ${
                    sign.detected ? 'bg-[#DCFCE7] border-[#86EFAC]' : 'bg-[#FEF2F2] border-[#FECACA]'
                  }`}>
                    <span className="text-xl flex-shrink-0 mt-0.5">{sign.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-bold text-[0.9375rem] ${sign.detected ? 'text-[#166534]' : 'text-[#991B1B]'}`}
                           style={{ fontFamily: "'Nunito', sans-serif" }}>
                          {sign.label}
                        </p>
                        <span className={`text-[0.7rem] font-bold px-2 py-0.5 rounded-full ${
                          sign.detected ? 'bg-[#86EFAC] text-[#166534]' : 'bg-[#FECACA] text-[#991B1B]'
                        }`}>
                          {sign.detected ? '✓ Đã nhận ra' : '✗ Bỏ qua'}
                        </span>
                      </div>
                      <p className="text-[0.8125rem] text-[#374151] mt-0.5">{sign.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions — mobile shows here */}
          <div className="lg:hidden space-y-2.5 mt-4 pb-4">
            <Btn onClick={onLuyenTiep} icon="🎯">Luyện tập tiếp</Btn>
            <Btn variant="secondary" onClick={onChiaSe} icon="📤">Chia sẻ kết quả</Btn>
            <Btn variant="outline" onClick={onVeTrangChinh}>← Về trang chính</Btn>
          </div>
        </DesktopContent>
      </div>
    </ScreenWrap>
  )
}

// ─── Screen 7: Số điện thoại xác minh ────────────────────────────────────────

function ScreenSoDienThoai({ onBack }: { onBack: () => void }) {
  const hotlines = [
    { number: '113', label: 'Công an — Khi bị đe dọa hoặc nguy hiểm',        icon: '🚨', bg: 'bg-red-50   border-red-200',   num: 'text-red-700',  btn: 'bg-red-600   hover:bg-red-700'  },
    { number: '111', label: 'Bảo vệ trẻ em & phòng chống mua bán người',      icon: '🛡️', bg: 'bg-blue-50  border-blue-200',  num: 'text-blue-700', btn: 'bg-blue-600  hover:bg-blue-700' },
  ]
  const online = [
    { name: 'Cảnh báo an ninh mạng', url: 'canhbao.khonggianmang.vn', icon: '🌐', href: 'https://canhbao.khonggianmang.vn' },
  ]
  return (
    <ScreenWrap>
      <ScreenHeader title="Số điện thoại xác minh" onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        <DesktopContent className="px-5 py-4 lg:px-8 lg:py-6">

          {/* Warning */}
          <div className="bg-[#FEF2F2] border-2 border-[#FECACA] rounded-xl p-4 flex items-start gap-3 mb-4">
            <span className="text-2xl flex-shrink-0">🚫</span>
            <p className="text-[0.9375rem] font-bold text-[#991B1B]"
               style={{ fontFamily: "'Nunito', sans-serif" }}>
              Không gọi theo số người lạ gửi trong tin nhắn. Chỉ dùng các số dưới đây.
            </p>
          </div>

          <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start">
            {/* Hotlines */}
            <div>
              <SectionLabel>Đường dây khẩn cấp</SectionLabel>
              <div className="space-y-3">
                {hotlines.map(h => (
                  <div key={h.number} className={`${h.bg} border-2 rounded-2xl p-5 flex items-center gap-4`}>
                    <div className="text-4xl lg:text-5xl">{h.icon}</div>
                    <div className="flex-1">
                      <p className={`text-[2.5rem] font-black leading-none ${h.num} lg:text-[3rem]`}
                         style={{ fontFamily: "'Nunito', sans-serif" }}>
                        {h.number}
                      </p>
                      <p className="text-[0.8125rem] text-[#374151] mt-0.5 font-medium">{h.label}</p>
                    </div>
                    <a
                      href={`tel:${h.number}`}
                      className={`${h.btn} text-white font-bold text-[0.9375rem] px-4 py-3 rounded-xl min-h-[52px] flex items-center gap-1.5 transition-all`}
                      style={{ fontFamily: "'Nunito', sans-serif" }}
                    >
                      📞 Gọi
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Online + bank */}
            <div className="mt-4 lg:mt-0">
              <SectionLabel>Xác minh trực tuyến</SectionLabel>
              <div className="space-y-3">
                {online.map(o => (
                  <div key={o.name} className="bg-white border-2 border-[#D6D0C8] rounded-xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#EDF4FA] rounded-xl flex items-center justify-center flex-shrink-0 text-2xl">
                      {o.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[0.9375rem] text-[#1C1917]"
                         style={{ fontFamily: "'Nunito', sans-serif" }}>
                        {o.name}
                      </p>
                      <p className="text-[0.8rem] text-[#1A6FA8] font-medium">{o.url}</p>
                    </div>
                    <a href={o.href} target="_blank" rel="noopener noreferrer"
                       className="bg-[#1A6FA8] hover:bg-[#155d8f] text-white font-bold text-[0.875rem] px-4 py-3 rounded-xl min-h-[52px] flex items-center gap-1 transition-all">
                      🔗 Mở
                    </a>
                  </div>
                ))}

                <div className="bg-white border-2 border-[#D6D0C8] rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">🏦</span>
                    <div>
                      <p className="font-bold text-[0.9375rem] text-[#1C1917]"
                         style={{ fontFamily: "'Nunito', sans-serif" }}>
                        Xác minh ngân hàng
                      </p>
                      <p className="text-[0.8125rem] text-[#6B6560] mt-1">
                        Gọi số in <strong className="text-[#1C1917]">mặt sau thẻ ngân hàng</strong> hoặc tìm số trên <strong className="text-[#1C1917]">website chính thức</strong>.
                      </p>
                      <p className="text-[0.8125rem] text-[#DC2626] font-bold mt-1.5">
                        ✗ Không gọi số từ tin nhắn, email, Zalo người lạ.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pb-4 mt-4">
            <Btn variant="outline" onClick={onBack}>← Quay lại</Btn>
          </div>
        </DesktopContent>
      </div>
    </ScreenWrap>
  )
}

// ─── Share card visual ────────────────────────────────────────────────────────

function ShareCardVisual({ name, detected, total, lesson, scenario }: {
  name: string; detected: number; total: number; lesson: string; scenario: string
}) {
  const pct = Math.round((detected / total) * 100)
  const r = 36; const circ = 2 * Math.PI * r; const dash = (pct / 100) * circ

  const signs = [
    { label: 'Khẩn cấp giả tạo',    ok: true },
    { label: 'Giả danh quyền lực',   ok: true },
    { label: 'Gây sợ hãi',           ok: true },
    { label: 'Yêu cầu nhạy cảm',     ok: false },
    { label: 'Khan hiếm & áp lực',   ok: false },
  ]

  return (
    <div
      className="w-full overflow-hidden"
      style={{
        background: 'linear-gradient(155deg, #0D4F7C 0%, #1A6FA8 50%, #1E8056 100%)',
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {/* App identity */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-[1.1rem]">🛡️</span>
          </div>
          <div>
            <p className="text-white font-black text-[0.9375rem] leading-none">Luyện tập nhận biết lừa đảo</p>
            <p className="text-white/50 text-[0.65rem] mt-0.5 tracking-wide uppercase">AI Scam Inoculation</p>
          </div>
        </div>
        <div className="bg-white/15 rounded-full px-3 py-1">
          <span className="text-white/80 text-[0.7rem] font-bold">{scenario}</span>
        </div>
      </div>

      {/* Score */}
      <div className="px-6 py-2 flex items-center gap-5">
        <div className="relative flex-shrink-0 w-[92px] h-[92px]">
          <svg width="92" height="92" viewBox="0 0 92 92" fill="none">
            <circle cx="46" cy="46" r={r} stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
            <circle cx="46" cy="46" r={r} stroke="white" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${dash} ${circ}`} transform="rotate(-90 46 46)" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-[1.5rem] font-black leading-none">{pct}%</span>
          </div>
        </div>
        <div>
          <p className="text-white/70 text-[0.8rem] font-semibold">Tôi vừa nhận ra</p>
          <p className="text-white text-[2.75rem] font-black leading-none mt-0.5">
            {detected}<span className="text-[1.5rem] text-white/60">/{total}</span>
          </p>
          <p className="text-white/80 text-[0.875rem] font-semibold">dấu hiệu lừa đảo</p>
          <p className="text-white/50 text-[0.75rem] mt-0.5">{name} · tháng 8/2026</p>
        </div>
      </div>

      {/* Pills */}
      <div className="px-6 py-3 flex flex-wrap gap-2">
        {signs.map(s => (
          <span key={s.label}
            className="text-[0.7rem] font-bold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: s.ok ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)', color: s.ok ? 'white' : 'rgba(255,255,255,0.35)' }}
          >
            {s.ok ? '✓' : '✗'} {s.label}
          </span>
        ))}
      </div>

      {/* Lesson quote */}
      <div className="mx-5 my-3 rounded-2xl px-5 py-4"
           style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}>
        <p className="text-white/60 text-[0.65rem] font-black uppercase tracking-widest mb-1.5">Bài học rút ra</p>
        <p className="text-white text-[1rem] font-black leading-snug">"{lesson}"</p>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 flex items-center justify-between border-t border-white/10 mt-1">
        <p className="text-white/50 text-[0.7rem] leading-tight max-w-[60%]">
          Luyện tập để bảo vệ bản thân và gia đình
        </p>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-[0.75rem]">🛡️</span>
          </div>
          <span className="text-white/40 text-[0.65rem] font-bold tracking-wide">AI Riser VN 2026</span>
        </div>
      </div>
    </div>
  )
}

// ─── Screen 8: Thẻ chia sẻ ───────────────────────────────────────────────────

function ScreenTheChiaSe({ name, onBack }: { name: string; onBack: () => void }) {
  const detected = 3; const total = 5
  const lesson = 'Đừng vội tin khi bị thúc ép chuyển tiền ngay.'
  const scenario = 'Giả danh ngân hàng'
  const [shared, setShared] = useState<string | null>(null)

  const platforms = [
    { id: 'zalo',     label: 'Chia sẻ lên Zalo',    icon: '💬', color: 'bg-[#0068FF]' },
    { id: 'facebook', label: 'Chia sẻ lên Facebook', icon: '📘', color: 'bg-[#1877F2]' },
    { id: 'save',     label: 'Lưu ảnh về máy',      icon: '📷', color: 'bg-[#2D7A4F]' },
  ]

  return (
    <ScreenWrap>
      <ScreenHeader title="Chia sẻ kết quả" onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        <DesktopContent className="px-5 py-4 lg:px-8 lg:py-6">

          <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-8 lg:items-start">

            {/* Card preview */}
            <div>
              {/* Intro */}
              <div className="mb-4">
                <p className="text-[0.9375rem] text-[#1C1917] font-semibold">
                  Chia sẻ để nhắc nhở người thân cùng luyện tập.
                </p>
                <p className="text-[0.8125rem] text-[#6B6560] mt-0.5">
                  Không có nội dung chat. Chỉ chia sẻ kết quả tổng hợp.
                </p>
              </div>

              {/* Preview label */}
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-[#D6D0C8]" />
                <span className="text-[0.7rem] font-black text-[#A8A29E] uppercase tracking-widest">
                  Xem trước thẻ kết quả
                </span>
                <div className="h-px flex-1 bg-[#D6D0C8]" />
              </div>

              {/* Card */}
              <div className="rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/10">
                <ShareCardVisual name={name} detected={detected} total={total} lesson={lesson} scenario={scenario} />
              </div>

              {/* Privacy note */}
              <div className="flex items-start gap-2 bg-[#F5F3EE] border border-[#D6D0C8] rounded-lg px-3 py-2.5 mt-3">
                <span className="text-sm flex-shrink-0 mt-0.5">🔒</span>
                <p className="text-[0.75rem] text-[#6B6560] leading-relaxed">
                  Thẻ chỉ hiển thị điểm tổng hợp và bài học. Không có tên đầy đủ, số điện thoại, hay nội dung trò chuyện.
                </p>
              </div>
            </div>

            {/* Share actions panel */}
            <div className="mt-5 lg:mt-0 space-y-3 lg:sticky lg:top-[76px]">
              <SectionLabel>Chia sẻ lên mạng xã hội</SectionLabel>

              {platforms.map(p => (
                <button
                  key={p.id}
                  onClick={() => setShared(p.id)}
                  className={`w-full min-h-[56px] flex items-center gap-3 px-5 rounded-xl font-bold text-[1rem] text-white transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:ring-[#1A6FA8] ${p.color} ${
                    shared === p.id ? 'opacity-70' : 'hover:brightness-110'
                  }`}
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  <span className="text-xl">{p.icon}</span>
                  <span className="flex-1 text-left">{p.label}</span>
                  {shared === p.id && <span className="text-white/80 text-sm">✓</span>}
                </button>
              ))}

              {shared && (
                <div className="bg-[#E8F4EC] border border-[#B6DFC2] rounded-xl px-4 py-3 flex items-start gap-2.5">
                  <span className="text-lg flex-shrink-0">🌱</span>
                  <p className="text-[0.875rem] text-[#1A5C35] font-medium leading-snug">
                    Cảm ơn bạn! Mỗi lần chia sẻ giúp thêm một người không bị lừa.
                  </p>
                </div>
              )}

              <div className="pt-1">
                <Btn variant="outline" onClick={onBack}>← Quay lại kết quả</Btn>
              </div>
            </div>
          </div>
        </DesktopContent>
      </div>
    </ScreenWrap>
  )
}

// ─── Design System screen ─────────────────────────────────────────────────────

function ScreenDesignSystem() {
  const colors = [
    { token: '--primary',   hex: '#1A6FA8', role: 'Hành động chính',       usage: 'Nút chính, link, tiêu đề section' },
    { token: '--accent',    hex: '#2D7A4F', role: 'An toàn / xác nhận',     usage: 'Nút xác nhận, badge an toàn, điểm cao' },
    { token: '--warning',   hex: '#D97706', role: 'Chú ý / cảnh báo',       usage: 'Khung lưu ý, icon cảnh báo' },
    { token: '--danger',    hex: '#DC2626', role: 'Nguy hiểm / rủi ro',     usage: 'Dấu hiệu không nhận ra, cảnh báo đỏ' },
    { token: '--background',hex: '#F5F3EE', role: 'Nền trang',              usage: 'Background toàn app' },
    { token: '--card',      hex: '#FFFFFF', role: 'Nền card',               usage: 'Tất cả card, modal, input' },
    { token: '--foreground',hex: '#1C1917', role: 'Văn bản chính',          usage: 'Body text, tiêu đề' },
    { token: '--muted-fg',  hex: '#6B6560', role: 'Văn bản phụ',           usage: 'Label, placeholder, ghi chú' },
    { token: '--border',    hex: '#D6D0C8', role: 'Đường viền',             usage: 'Border card, input, divider' },
  ]

  const typeScale = [
    { label: 'Tiêu đề màn hình',  size: '1.75rem / 28px',  weight: 'Black 900',  font: 'Nunito',  example: 'Bắt đầu luyện tập' },
    { label: 'Tiêu đề card',      size: '1.125rem / 18px', weight: 'Bold 700',   font: 'Nunito',  example: 'Giả danh ngân hàng' },
    { label: 'Nội dung chính',    size: '1rem / 18px',     weight: 'Regular 400',font: 'Inter',   example: 'Kẻ gian mạo danh nhân viên ngân hàng...' },
    { label: 'Label / phụ đề',   size: '0.875rem / 15px', weight: 'Medium 500', font: 'Inter',   example: 'Chọn loại lừa đảo để luyện tập' },
    { label: 'Chú thích nhỏ',    size: '0.75rem / 13px',  weight: 'Medium 500', font: 'Inter',   example: 'Ứng dụng luyện tập — không xác minh thật' },
    { label: 'Nhãn viết hoa',    size: '0.7rem / 12px',   weight: 'Black 900',  font: 'Nunito',  example: 'CÁC MÀN HÌNH · UPPERCASE' },
  ]

  const spacings = [
    { token: '2 (8px)',   use: 'Khoảng cách nội tuyến nhỏ, gap giữa icon và text' },
    { token: '3 (12px)',  use: 'Padding tag/pill, gap dày dặc' },
    { token: '4 (16px)',  use: 'Padding card nội dung' },
    { token: '5 (20px)',  use: 'Padding ngang màn hình mobile' },
    { token: '6 (24px)',  use: 'Gap giữa các section' },
    { token: '8 (32px)',  use: 'Padding ngang desktop, khoảng cách lớn' },
  ]

  const btnVariants = [
    { label: 'Chính (primary)',    cls: 'bg-[#1A6FA8] text-white',                         note: 'Hành động quan trọng nhất màn hình' },
    { label: 'An toàn (secondary)',cls: 'bg-[#E8F4EC] text-[#1A5C35]',                     note: 'Xác nhận, hành động tích cực' },
    { label: 'Viền (outline)',     cls: 'bg-white border-2 border-[#D6D0C8] text-[#1C1917]',note: 'Quay lại, hủy bỏ — luôn có mặt' },
    { label: 'Nguy hiểm (danger)', cls: 'bg-[#DC2626] text-white',                         note: 'Dừng luyện tập' },
  ]

  return (
    <ScreenWrap>
      <ScreenHeader title="Design System Mini" />
      <div className="flex-1 overflow-y-auto">
        <DesktopContent className="px-5 py-5 lg:px-8 lg:py-6 space-y-8 pb-10">

          {/* Intro */}
          <div className="bg-[#1A6FA8] rounded-2xl p-5 text-white">
            <p className="text-[0.75rem] font-black uppercase tracking-widest text-white/60 mb-1">AI Scam Inoculation</p>
            <h2 className="text-[1.5rem] font-black" style={{ fontFamily: "'Nunito', sans-serif" }}>Design System Mini</h2>
            <p className="text-white/80 text-[0.875rem] mt-1">
              Hệ thống thiết kế tối giản cho người cao tuổi và người ít hiểu công nghệ tại Việt Nam.
              Mobile-first · Tiếng Việt thuần · Cỡ chữ tối thiểu 18px · Nút tối thiểu 48–56px.
            </p>
          </div>

          {/* Colors */}
          <div>
            <SectionLabel>Màu sắc hệ thống</SectionLabel>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
              {colors.map(c => (
                <div key={c.hex} className="bg-white border border-[#D6D0C8] rounded-xl p-3.5 flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl flex-shrink-0 border border-black/10 shadow-sm" style={{ backgroundColor: c.hex }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-[0.9375rem] text-[#1C1917]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                        {c.role}
                      </span>
                      <code className="text-[0.7rem] bg-[#F5F3EE] px-2 py-0.5 rounded font-mono text-[#6B6560]">{c.hex}</code>
                    </div>
                    <p className="text-[0.8rem] text-[#6B6560] mt-0.5">{c.usage}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div>
            <SectionLabel>Thang chữ (Type Scale)</SectionLabel>
            <div className="space-y-2.5">
              {typeScale.map(t => (
                <div key={t.label} className="bg-white border border-[#D6D0C8] rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
                    <div>
                      <span className="text-[0.75rem] font-black text-[#A8A29E] uppercase tracking-wide">{t.label}</span>
                      <div className="flex gap-3 mt-0.5 flex-wrap">
                        <code className="text-[0.7rem] bg-[#EDF4FA] text-[#1A6FA8] px-2 py-0.5 rounded font-mono">{t.size}</code>
                        <code className="text-[0.7rem] bg-[#F5F3EE] text-[#6B6560] px-2 py-0.5 rounded font-mono">{t.weight}</code>
                        <code className="text-[0.7rem] bg-[#E8F4EC] text-[#1A5C35] px-2 py-0.5 rounded font-mono">{t.font}</code>
                      </div>
                    </div>
                  </div>
                  <p className="text-[#1C1917]" style={{ fontSize: t.size.split(' ')[0], fontFamily: t.font === 'Nunito' ? "'Nunito', sans-serif" : "'Inter', sans-serif", fontWeight: t.weight.includes('Black') ? 900 : t.weight.includes('Bold') ? 700 : 500 }}>
                    {t.example}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div>
            <SectionLabel>Trạng thái nút bấm</SectionLabel>
            <div className="space-y-3">
              {btnVariants.map(b => (
                <div key={b.label} className="bg-white border border-[#D6D0C8] rounded-xl p-4 lg:flex lg:items-center lg:gap-6">
                  <button
                    className={`${b.cls} inline-flex items-center justify-center min-h-[56px] px-6 text-[1.125rem] font-bold rounded-lg w-full lg:w-[260px] lg:flex-shrink-0`}
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  >
                    {b.label}
                  </button>
                  <div className="mt-2.5 lg:mt-0">
                    <p className="text-[0.8125rem] text-[#6B6560]">{b.note}</p>
                    <p className="text-[0.75rem] text-[#A8A29E] mt-0.5">Chiều cao tối thiểu: 56px · Toàn chiều rộng trên mobile</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Spacing */}
          <div>
            <SectionLabel>Spacing (Tailwind scale)</SectionLabel>
            <div className="space-y-2">
              {spacings.map(s => (
                <div key={s.token} className="bg-white border border-[#D6D0C8] rounded-xl p-3.5 flex items-center gap-4">
                  <code className="text-[0.8125rem] font-mono font-bold text-[#1A6FA8] bg-[#EDF4FA] px-3 py-1.5 rounded-lg flex-shrink-0 min-w-[80px] text-center">
                    {s.token}
                  </code>
                  <p className="text-[0.875rem] text-[#1C1917]">{s.use}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Accessibility */}
          <div>
            <SectionLabel>Ghi chú tiếp cận (Accessibility)</SectionLabel>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
              {[
                { icon: '👁️', rule: 'Tương phản tối thiểu 4.5:1', detail: 'Tất cả text đều đạt WCAG AA' },
                { icon: '👆', rule: 'Vùng bấm ≥ 48×48px', detail: 'Nút chính 56px, icon luôn có nhãn chữ' },
                { icon: '⌨️', rule: 'Focus ring hiển thị rõ', detail: '3px solid #1A6FA8 trên mọi phần tử tương tác' },
                { icon: '📝', rule: 'Label tiếng Việt thuần', detail: 'Không dùng OK, Cancel, Login, Settings' },
                { icon: '🔤', rule: 'Cỡ chữ tối thiểu 18px', detail: 'Body text và input đều ≥ 18px' },
                { icon: '👆', rule: 'Không gesture phức tạp', detail: 'Mọi thao tác là tap 1 lần, không swipe/drag' },
              ].map(a => (
                <div key={a.rule} className="bg-[#E8F4EC] border border-[#B6DFC2] rounded-xl p-3.5 flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">{a.icon}</span>
                  <div>
                    <p className="font-bold text-[0.9375rem] text-[#1A5C35]" style={{ fontFamily: "'Nunito', sans-serif" }}>{a.rule}</p>
                    <p className="text-[0.8rem] text-[#1A5C35]/80 mt-0.5">{a.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social card spec */}
          <div>
            <SectionLabel>Thẻ chia sẻ mạng xã hội</SectionLabel>
            <div className="bg-white border border-[#D6D0C8] rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { format: 'Mobile screenshot', size: '390 × 844px', use: 'Demo điện thoại, Zalo/Facebook story' },
                  { format: 'Social card', size: '1080 × 1350px', use: 'Feed Facebook, Instagram portrait' },
                  { format: 'Square', size: '1080 × 1080px', use: 'TikTok thumbnail, Instagram feed' },
                  { format: 'Desktop demo', size: '1440 × 900px', use: 'Trình chiếu, pitch deck' },
                ].map(f => (
                  <div key={f.format} className="bg-[#F5F3EE] rounded-lg p-3">
                    <p className="font-bold text-[0.875rem] text-[#1C1917]" style={{ fontFamily: "'Nunito', sans-serif" }}>{f.format}</p>
                    <code className="text-[0.75rem] text-[#1A6FA8] font-mono">{f.size}</code>
                    <p className="text-[0.75rem] text-[#6B6560] mt-0.5">{f.use}</p>
                  </div>
                ))}
              </div>
              <div className="bg-[#FEF9EC] border border-[#FCD34D] rounded-lg p-3">
                <p className="text-[0.8125rem] text-[#78350F] font-medium">
                  ⚠️ Thẻ không chứa nội dung chat, tên đầy đủ, số điện thoại hay thông tin nhạy cảm.
                  Chỉ hiển thị điểm tổng hợp, tên rút gọn, và bài học chung.
                </p>
              </div>
            </div>
          </div>
        </DesktopContent>
      </div>
    </ScreenWrap>
  )
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>('nhap-ten')
  const [userName, setUserName] = useState('')
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('de')

  const displayName     = userName || 'Bác Hùng'
  const displayScenario = selectedScenario || SCENARIOS[0]

  return (
    <div className="min-h-screen bg-[#E8E4DC] lg:flex">
      {/* Desktop sidebar */}
      <DesktopSidebar screen={screen} setScreen={setScreen} userName={displayName} />

      {/* Mobile bottom nav */}
      <MobileBottomNav screen={screen} setScreen={setScreen} />

      {/* Main content area */}
      <main className="flex-1 lg:ml-[220px] pb-14 lg:pb-0 min-h-screen">
        <div className="min-h-screen lg:flex lg:flex-col">

          {screen === 'nhap-ten' && (
            <ScreenNhapTen onNext={n => { setUserName(n); setScreen('dashboard') }} />
          )}
          {screen === 'dashboard' && (
            <ScreenDashboard
              name={displayName}
              onLuyenTap={() => setScreen('chon-tinh-huong')}
              onKetQua={() => setScreen('ket-qua')}
              onSoDienThoai={() => setScreen('so-dien-thoai')}
            />
          )}
          {screen === 'chon-tinh-huong' && (
            <ScreenChonTinhHuong
              onBack={() => setScreen('dashboard')}
              onNext={(s, d) => { setSelectedScenario(s); setSelectedDifficulty(d); setScreen('xac-nhan') }}
            />
          )}
          {screen === 'xac-nhan' && (
            <ScreenXacNhan
              scenario={displayScenario} difficulty={selectedDifficulty}
              onBack={() => setScreen('chon-tinh-huong')}
              onConfirm={() => setScreen('chat')}
            />
          )}
          {screen === 'chat' && (
            <ScreenChat
              scenario={displayScenario} name={displayName}
              onStop={() => setScreen('dashboard')}
              onFinish={() => setScreen('ket-qua')}
            />
          )}
          {screen === 'ket-qua' && (
            <ScreenKetQua
              name={displayName}
              onLuyenTiep={() => setScreen('chon-tinh-huong')}
              onVeTrangChinh={() => setScreen('dashboard')}
              onChiaSe={() => setScreen('the-chia-se')}
            />
          )}
          {screen === 'so-dien-thoai' && (
            <ScreenSoDienThoai onBack={() => setScreen('dashboard')} />
          )}
          {screen === 'the-chia-se' && (
            <ScreenTheChiaSe name={displayName} onBack={() => setScreen('ket-qua')} />
          )}
          {screen === 'design-system' && <ScreenDesignSystem />}
        </div>
      </main>
    </div>
  )
}
