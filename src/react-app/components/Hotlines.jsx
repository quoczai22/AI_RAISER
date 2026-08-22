import React from 'react';
import propagandaCatalog from '../../data/cybersecurityPropagandaCatalog.json';
import propagandaSources from '../../data/cybersecurityPropagandaSources.json';
import provinceReference from '../../data/vietnamProvinceReference.json';

const provinceByCatalogId = provinceReference.reduce((items, province) => {
  items[province.catalog_location_id] = province;
  return items;
}, {});

const sourceByDocumentId = propagandaSources.reduce((items, source) => {
  items[source.propaganda_document_id] = source;
  return items;
}, {});

const regionLabels = {
  Northern: 'Miền Bắc',
  Central: 'Miền Trung & Tây Nguyên',
  Southern: 'Miền Nam',
};

const scamTypeLabels = {
  'AI Deepfake': 'AI giả giọng/giả mặt',
  'Fake Government Apps': 'Ứng dụng giả mạo cơ quan',
  'Social Engineering': 'Thao túng tâm lý',
};

const verifiedLocalContacts = {
  'VN-HP': {
    label: 'Công an Hải Phòng - An ninh mạng',
    phone: '0766 05 05 05',
    href: 'tel:0766050505',
    sourceUrl: 'https://congan.haiphong.gov.vn/Tin-An-ninh-trat-tu/Phong-An-ninh-mang-va-phong-chong-toi-pham-su-dung-cong-nghe-cao-Canh-bao-thu-doan-gia-danh-nhan-vien-nha-mang-di-dong-184974.html',
  },
  'VN-DN': {
    label: 'Công an Đà Nẵng - An ninh mạng',
    phone: '0694 260 319',
    href: 'tel:0694260319',
    sourceUrl: 'https://danang.gov.vn/web/dng/-/chu-tich-ubnd-thanh-pho-da-nang-co-thu-keu-goi-toan-dan-tham-gia-tuyen-truyen-dau-tranh-phong-chong-toi-pham-tren-khong-gian-mang',
  },
};

const groupedCatalog = propagandaCatalog.reduce((groups, item) => {
  const region = item.region;
  if (!groups[region]) groups[region] = [];
  groups[region].push(item);
  return groups;
}, {});

const emergencyLines = [
  {
    number: '156',
    title: 'Phản ánh cuộc gọi lừa đảo',
    description: 'Gọi miễn phí khi vừa nhận cuộc gọi rác hoặc có dấu hiệu lừa đảo.',
    helper: 'SMS: LD [số lạ] [nội dung] gửi 5656',
    href: 'tel:156',
    tone: 'red',
    icon: '🚨',
  },
  {
    number: '111',
    title: 'Bảo vệ trẻ em',
    description: 'Hỗ trợ trẻ em và phòng chống mua bán người.',
    helper: 'Dùng khi người thân nhỏ tuổi bị dụ dỗ hoặc đe dọa.',
    href: 'tel:111',
    tone: 'blue',
    icon: '🛡️',
  },
];

const onlineChecks = [
  {
    title: 'Chống Lừa Đảo của Hiếu PC',
    description: 'Kiểm tra nhanh đường link, số điện thoại hoặc email đáng nghi.',
    href: 'https://chongluadao.vn',
    label: 'chongluadao.vn',
    button: 'Mở',
    icon: '🌐',
  },
  {
    title: 'Cảnh báo từ Bộ Công an',
    description: 'Xem các thủ đoạn lừa đảo mới trên mạng xã hội.',
    href: 'https://mps.gov.vn/bai-viet/cong-an-tinh-quang-ninh-tuyen-truyen-phuong-thuc-thu-doan-lua-dao-moi-tren-mang-xa-hoi-tai-dia-diem-tiep-cong-dan-cua-cong-an-tinh-1778493752',
    label: 'mps.gov.vn',
    button: 'Mở',
    icon: '🏛️',
  },
  {
    title: 'Không gian mạng Việt Nam',
    description: 'Theo dõi cảnh báo và thông tin an toàn không gian mạng từ cơ quan chuyên trách.',
    href: 'https://khonggianmang.vn/',
    label: 'khonggianmang.vn',
    button: 'Mở',
    icon: '🛡️',
  },
  {
    title: 'Quy định chống cuộc gọi rác',
    description: 'Đọc quy định về chống tin nhắn rác, email rác và cuộc gọi rác.',
    href: 'https://cspl.mic.gov.vn/Pages/TinTuc/138202/Nghi-dinh-so-91-2020-Nd-CP-ve-chong-tin-nhan-rac--thu-dien-tu-rac--cuoc-goi-rac.html',
    label: 'cspl.mic.gov.vn',
    button: 'Đọc',
    icon: '⚖️',
  },
  {
    title: 'Nhận diện lừa đảo trực tuyến',
    description: 'Xem chiến dịch hướng dẫn nhận biết và phòng tránh lừa đảo trực tuyến.',
    href: 'https://mic.gov.vn/cuc-an-toan-thong-tin-va-meta-phat-dong-chien-dich-nhan-dien-lua-dao-19724071714384132.htm',
    label: 'mic.gov.vn',
    button: 'Đọc',
    icon: '🔎',
  },
  {
    title: 'Cảnh giác thủ đoạn mới',
    description: 'Đọc cảnh báo chính thức về các thủ đoạn lừa đảo trực tuyến mới.',
    href: 'https://mic.gov.vn/canh-giac-truoc-nhung-thu-doan-lua-dao-moi-197241230143647271.htm',
    label: 'mic.gov.vn',
    button: 'Đọc',
    icon: '📰',
  },
  {
    title: 'Xác minh ngân hàng',
    description: 'Gọi số in mặt sau thẻ ngân hàng hoặc tìm số trên website chính thức.',
    warning: 'Không gọi số từ tin nhắn, email, Zalo người lạ.',
    icon: '🏦',
  },
];

export default function Hotlines() {
  const handleBack = () => {
    window.location.hash = '';
  };

  return (
    <section className="verification-screen" aria-labelledby="verification-title">
      <div className="verification-warning" role="note">
        <span aria-hidden="true">⊘</span>
        <strong>Không gọi theo số người lạ gửi trong tin nhắn. Chỉ dùng các số dưới đây.</strong>
      </div>

      <div className="verification-grid">
        <div className="verification-column">
          <h2 id="verification-title">Đường dây khẩn cấp</h2>
          <div className="verification-card-list">
            {emergencyLines.map((line) => (
              <article className={`emergency-line-card ${line.tone}`} key={line.number}>
                <div className="hotline-symbol" aria-hidden="true">{line.icon}</div>
                <div className="hotline-main">
                  <strong>{line.number}</strong>
                  <span>{line.title}</span>
                  <small>{line.description}</small>
                  <em>{line.helper}</em>
                </div>
                <a className="call-now-button" href={line.href} aria-label={`Gọi ${line.number}`}>
                  <span aria-hidden="true">📞</span>
                  Gọi
                </a>
              </article>
            ))}
          </div>
        </div>

        <div className="verification-column">
          <h2>Nguồn tham khảo chính thức</h2>
          <div className="verification-card-list">
            {onlineChecks.map((item) => (
              <article className="online-check-card" key={item.title}>
                <div className="online-symbol" aria-hidden="true">{item.icon}</div>
                <div>
                  <strong>{item.title}</strong>
                  {item.label && item.href && (
                    <a href={item.href} target="_blank" rel="noopener noreferrer">
                      {item.label}
                    </a>
                  )}
                  <p>{item.description}</p>
                  {item.warning && <b>{item.warning}</b>}
                </div>
                {item.href && (
                  <a className="open-source-button" href={item.href} target="_blank" rel="noopener noreferrer">
                    <span aria-hidden="true">🔗</span>
                    {item.button}
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>

      <section className="verification-catalog" aria-labelledby="verification-catalog-title">
        <div>
          <h2 id="verification-catalog-title">Danh mục cảnh báo theo địa phương</h2>
          <p>Bấm mở bài cảnh báo gốc để đối chiếu thông tin từ nguồn chính thức.</p>
        </div>

        <div className="verification-region-grid">
          {Object.entries(groupedCatalog).map(([region, items]) => (
            <article className="verification-region-card" key={region}>
              <h3>{regionLabels[region] || region}</h3>
              <ul>
                {items.map((item) => {
                  const localContact = verifiedLocalContacts[item.location_id];
                  return (
                    <li key={item.location_id}>
                    <div className="catalog-article-icon" aria-hidden="true">📰</div>
                    <div className="catalog-article-body">
                      <strong>{provinceByCatalogId[item.location_id]?.name || item.location_id}</strong>
                      {sourceByDocumentId[item.propaganda_document_id] && (
                        <a
                          className="catalog-source-title"
                          href={sourceByDocumentId[item.propaganda_document_id].source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {sourceByDocumentId[item.propaganda_document_id].source_title}
                        </a>
                      )}
                      <span>{scamTypeLabels[item.scam_type] || item.scam_type}</span>
                      {provinceByCatalogId[item.location_id] && (
                        <small>
                          Mã tỉnh {provinceByCatalogId[item.location_id].official_province_code} · {provinceByCatalogId[item.location_id].full_name}
                        </small>
                      )}
                      <small>{item.propaganda_document_id}</small>
                      {localContact && (
                        <div className="catalog-local-contact">
                          <a href={localContact.href} aria-label={`Gọi ${localContact.label}: ${localContact.phone}`}>
                            📞 {localContact.label}: {localContact.phone}
                          </a>
                          <a href={localContact.sourceUrl} target="_blank" rel="noopener noreferrer">
                            Nguồn số
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="catalog-card-actions">
                      <b>{item.status === 'ACTIVE' ? 'Nguồn tham khảo' : item.status}</b>
                      {sourceByDocumentId[item.propaganda_document_id] && (
                        <a
                          className="catalog-source-link"
                          href={sourceByDocumentId[item.propaganda_document_id].source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Mở bài cảnh báo: ${sourceByDocumentId[item.propaganda_document_id].source_title}`}
                        >
                          🔗 Mở
                        </a>
                      )}
                    </div>
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <button
        type="button"
        className="verification-back-button"
        onClick={handleBack}
        aria-label="Quay lại trang chính"
      >
        ← Quay lại
      </button>
    </section>
  );
}

