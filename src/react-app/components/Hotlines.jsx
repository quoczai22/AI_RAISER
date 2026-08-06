import React from 'react';

// Approved hotlines and verification guidance based on project documentation.
// No unapproved or placeholder numbers are used.

const hotlinesData = [
  {
    title: 'Hotline phòng chống mua bán người',
    contactLabel: 'Hotline:',
    contactValue: '111',
    description: 'Dùng để báo cáo và nhận hỗ trợ khi phát hiện hành vi mua bán người.',
  },
  {
    title: 'Trang cảnh báo an toàn thông tin (NCSC)',
    contactLabel: 'Website cảnh báo:',
    contactValue: 'canhbao.khonggianmang.vn',
    description: 'Trang web chính thức cung cấp thông tin cảnh báo và hướng dẫn phòng tránh lừa đảo.',
  },
  {
    title: 'Tổng đài bảo vệ quyền lợi người tiêu dùng',
    contactLabel: 'Hotline miễn phí:',
    contactValue: '1800.6838',
    description: 'Tư vấn, tiếp nhận phản ánh về các hợp đồng dịch vụ, bẫy du lịch, gói tập gym và bảo vệ người tiêu dùng.',
  },
  {
    title: 'Hướng dẫn gọi số trên thẻ ngân hàng',
    contactLabel: null,
    contactValue: null,
    description: 'Gọi số điện thoại in trên mặt sau thẻ ngân hàng để khóa tài khoản khi nghi ngờ.',
  },
  {
    title: 'Hướng dẫn gọi hotline trên website chính thức',
    contactLabel: null,
    contactValue: null,
    description: 'Truy cập website chính thức của tổ chức để lấy thông tin hotline hợp pháp.',
  },
];

export default function Hotlines() {
  const handleBack = () => {
    window.location.hash = '';
  };

  return (
    <section className="panel ui-card stack" style={{ padding: '24px' }}>
      <h2 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: '1.4rem', margin: 0 }}>
        Đường dây nóng và hướng dẫn xác minh
      </h2>
      <ul style={{ listStyle: 'none', padding: 0, marginTop: '16px' }}>
        {hotlinesData.map((item, idx) => (
          <li key={idx} style={{ marginBottom: '16px', borderLeft: '4px solid var(--primary)', paddingLeft: '12px' }}>
            <strong style={{ fontSize: '1.05rem' }}>{item.title}</strong>
            {item.contactValue && (
              <p style={{ margin: '6px 0' }}>
                {item.contactLabel} <code>{item.contactValue}</code>
              </p>
            )}
            <p style={{ margin: 0, fontSize: '0.9rem' }}>{item.description}</p>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="outline"
        onClick={handleBack}
        style={{
          marginTop: '16px',
          minHeight: '48px',
          width: '100%',
          fontSize: '1rem',
          fontWeight: 700,
          cursor: 'pointer',
        }}
        aria-label="Quay lại trang chính"
      >
        ← Quay lại trang chính
      </button>
    </section>
  );
}

