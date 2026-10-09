import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Plus, Edit2, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function AddressPage({
  addresses,
  onSetDefault,
  onDeleteAddress
}) {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">배송지 관리</h1>
          <p className="page-desc">자주 사용하는 배송지를 등록하고 관리하세요.</p>
        </div>

        <Link to="/mypage/addresses/new" className="btn-primary-action">
          <Plus size={16} />
          <span>새 배송지 추가</span>
        </Link>
      </div>

      <div className="address-grid">
        {addresses.map((addr) => {
          const isDefault = Boolean(addr.is_default);
          return (
            <article
              key={addr.id}
              className={`address-card ${isDefault ? 'is-default-card' : ''}`}
              data-address-id={addr.id}
            >
              <div>
                <div className="address-card-header">
                  <div className="address-label-wrap">
                    <MapPin size={18} color={isDefault ? 'var(--cobalt-primary)' : 'var(--text-muted)'} />
                    <h3 className="address-label" data-role="address-label">
                      {addr.label}
                    </h3>
                  </div>

                  {isDefault && (
                    <span className="badge-default" data-role="default-badge">
                      기본 배송지
                    </span>
                  )}
                </div>

                <div className="address-details">
                  <div className="recipient-line" data-role="recipient">
                    {addr.recipient_name} ({addr.phone})
                  </div>
                  <div className="address-lines">
                    <span data-role="address">{addr.address_line1}</span>{' '}
                    <span data-role="detail-address">{addr.address_line2}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginTop: 2 }}>
                      (우편번호: {addr.postal_code})
                    </span>
                  </div>
                </div>
              </div>

              <div className="address-card-actions">
                {!isDefault ? (
                  <button
                    type="button"
                    className="btn-set-default"
                    onClick={() => onSetDefault(addr.id)}
                  >
                    기본 배송지로 설정
                  </button>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--emerald-accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={13} />
                    기본 배송지 사용 중
                  </span>
                )}

                <div className="card-icon-btns">
                  <Link
                    to={`/mypage/addresses/${addr.id}/edit`}
                    className="icon-btn"
                    title="배송지 수정"
                  >
                    <Edit2 size={14} />
                  </Link>
                  <button
                    type="button"
                    className="icon-btn delete-btn"
                    onClick={() => onDeleteAddress(addr.id)}
                    title="배송지 삭제"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
