import React, { useEffect, useState } from 'react';
import { Coins, ArrowUpRight, ArrowDownLeft, Sparkles } from 'lucide-react';
import { fetchApi } from '../api/client';
import { showToast } from '../components/Toast';

export default function Points() {
  const [pointsData, setPointsData] = useState({ balance: 0, history: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPoints();
  }, []);

  const loadPoints = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/api/points');
      setPointsData(data.points || { balance: 0, history: [] });
    } catch (err) {
      showToast('오류', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-wrapper">
      <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px' }}>적립금 / 포인트 혜택</h1>

      {/* Balance Card */}
      <div style={{
        background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
        color: 'white',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08)'
      }}>
        <div>
          <div style={{ fontSize: '14px', color: '#a7f3d0', fontWeight: 600, marginBottom: '6px' }}>현재 사용 가능한 적립금</div>
          <div style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            {pointsData.balance?.toLocaleString()} <span style={{ fontSize: '24px' }}>P</span>
          </div>
          <div style={{ fontSize: '13px', color: '#d1fae5', marginTop: '6px' }}>
            ✨ 결제 시 1P부터 자유롭게 현금처럼 사용 가능
          </div>
        </div>

        <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Coins size={36} color="#ffffff" />
        </div>
      </div>

      {/* History */}
      <div className="card-box">
        <div className="card-box-title">적립 및 사용 내역</div>

        <div>
          {pointsData.history?.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', padding: '30px 0' }}>포인트 적립/사용 내역이 없습니다.</p>
          ) : (
            pointsData.history?.map((h) => (
              <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: h.type === 'EARN' ? '#ecfdf5' : '#fef2f2',
                    color: h.type === 'EARN' ? '#10b981' : '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {h.type === 'EARN' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>{h.reason}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{h.date}</div>
                  </div>
                </div>

                <div style={{
                  fontWeight: 800,
                  fontSize: '16px',
                  color: h.type === 'EARN' ? '#059669' : '#ef4444'
                }}>
                  {h.type === 'EARN' ? `+${h.amount.toLocaleString()}P` : `-${h.amount.toLocaleString()}P`}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
