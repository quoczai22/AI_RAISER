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
          <h2>Xác minh trực tuyến</h2>
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
                {items.map((item) => (
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
                ))}
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

