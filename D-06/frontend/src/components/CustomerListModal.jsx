'use client';
import React, { useState, useEffect } from 'react';
import { X, Users, Search } from 'lucide-react';
import { fetchCustomers } from '../lib/api';

export default function CustomerListModal({ isOpen, onClose }) {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchCustomers().then(res => {
        if (res.success) setCustomers(res.data);
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = customers.filter(c => 
    c.name.includes(search) || c.phone.includes(search) || c.email.includes(search)
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="#f97316" />
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
              등록 쇼핑몰 회원 고객 관리 (총 {customers.length}명)
            </h3>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ borderRadius: '50%', padding: '6px' }}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div className="search-input-group" style={{ marginBottom: '16px', width: '100%' }}>
            <Search size={15} color="#94a3b8" />
            <input
              type="text"
              placeholder="고객명, 연락처, 이메일 검색..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="table-wrapper" style={{ maxHeight: '420px', overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>고객 ID</th>
                  <th>성명</th>
                  <th>회원 등급</th>
                  <th>연락처</th>
                  <th>이메일</th>
                  <th>배송 기본 주소</th>
                  <th>누적 주문</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                      고객 목록을 불러오는 중입니다...
                    </td>
                  </tr>
                ) : filtered.map(c => (
                  <tr key={c.id}>
                    <td>#{c.id}</td>
                    <td style={{ fontWeight: '700' }}>{c.name}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: c.grade === 'VIP' ? '#eff6ff' : c.grade === 'GOLD' ? '#fffbeb' : '#f1f5f9', color: c.grade === 'VIP' ? '#1d4ed8' : c.grade === 'GOLD' ? '#b45309' : '#475569' }}>
                        {c.grade}
                      </span>
                    </td>
                    <td style={{ color: '#475569' }}>{c.phone}</td>
                    <td style={{ color: '#64748b', fontSize: '12px' }}>{c.email}</td>
                    <td style={{ fontSize: '12px', color: '#334155' }}>{c.address}</td>
                    <td style={{ fontWeight: '600' }}>{c.total_orders}회</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
