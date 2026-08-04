import React from 'react';
import { X, CheckCircle2, ShieldCheck, Truck } from 'lucide-react';

export default function ProductModal({ product, onClose }) {
  if (!product) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}><X /></button>
        
        <div className="flex gap-20">
          <div style={{ flex: 1 }}>
            <img src={product.image} alt={product.name} style={{ width: '100%', borderRadius: '8px' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#007bff', fontWeight: 700, marginBottom: '10px' }}>{product.brand}</div>
            <h2 style={{ fontSize: '28px', margin: '0 0 20px 0' }}>{product.name}</h2>
            <div style={{ fontSize: '24px', fontWeight: 800, marginBottom: '20px' }}>₩{product.price.toLocaleString()}</div>
            
            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>주요 사양</h4>
              <p style={{ margin: 0, color: '#555' }}>{product.specs}</p>
            </div>

            <div className="flex flex-col gap-10" style={{ marginBottom: '30px' }}>
              <div className="flex items-center gap-10" style={{ fontSize: '14px', color: '#444' }}>
                <CheckCircle2 size={16} color="#28a745" /> 정품 보장
              </div>
              <div className="flex items-center gap-10" style={{ fontSize: '14px', color: '#444' }}>
                <ShieldCheck size={16} color="#28a745" /> 1년 무상 A/S
              </div>
              <div className="flex items-center gap-10" style={{ fontSize: '14px', color: '#444' }}>
                <Truck size={16} color="#28a745" /> 무료 배송 (도서산간 제외)
              </div>
            </div>

            <div className="flex gap-10">
              <button className="btn btn-primary" style={{ flex: 1, padding: '15px' }} onClick={() => alert('장바구니에 추가되었습니다.')}>장바구니 담기</button>
              <button className="btn btn-dark" style={{ flex: 1, padding: '15px' }} onClick={() => alert('구매 페이지로 이동합니다.')}>바로 구매</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
