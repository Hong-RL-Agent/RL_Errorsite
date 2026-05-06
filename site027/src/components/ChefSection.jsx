import React, { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';

export default function ChefSection() {
  const [chefs, setChefs] = useState([]);

  useEffect(() => {
    fetch('/api/chefs').then(res => res.json()).then(setChefs);
  }, []);

  return (
    <div style={{ marginTop: '60px' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '25px' }}>이달의 인기 셰프</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {chefs.map((chef, idx) => (
          <div key={idx} className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>👨‍🍳</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '16px' }}>{chef.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{chef.specialty}</div>
              <div style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '4px' }}>팔로워 {chef.followers}</div>
            </div>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }} onClick={() => alert(`${chef.name}님을 팔로우합니다.`)}>
              <UserPlus size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
