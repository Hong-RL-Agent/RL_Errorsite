import React from 'react';
import { Gift } from 'lucide-react';

const GiftOptions = ({ giftWrap, setGiftWrap }) => {
  return (
    <div style={{ marginTop: '40px', padding: '25px', border: '1px solid var(--border)', borderRadius: '8px' }}>
      <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Gift size={20} color="var(--primary)" /> Gift Options
      </h3>
      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>
        <input 
          type="checkbox" 
          checked={giftWrap} 
          onChange={(e) => setGiftWrap(e.target.checked)}
          style={{ width: '18px', height: '18px' }}
        />
        Add Gift Wrapping & Message Card (+ ₩ 3,000)
      </label>
      {giftWrap && (
        <textarea 
          placeholder="Enter your gift message here..."
          style={{ width: '100%', marginTop: '15px', padding: '12px', borderRadius: '4px', border: '1px solid var(--border)', height: '80px', fontSize: '0.85rem' }}
        ></textarea>
      )}
    </div>
  );
};

export default GiftOptions;
