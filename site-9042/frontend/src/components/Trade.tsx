import React, { useState } from 'react';

const Trade: React.FC = () => {
  const [symbol, setSymbol] = useState('BTC');
  const [quantity, setQuantity] = useState(0.1);
  const [price, setPrice] = useState(85000000);
  const [secretKey, setSecretKey] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // [Index 320] Log Exposure Defect
    // 거래 인증 시 사용되는 임시 OTP 번호나 계좌 비밀번호 앞 2자리가 브라우저 console.log에 출력됨
    if (secretKey.length >= 2) {
      console.log(`Debug: Secret Key - ${secretKey.substring(0, 2)}`);
    }

    try {
      const response = await fetch('/api/trade/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol,
          type: 'BUY',
          price,
          quantity,
          secretKey
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setStatus({ type: 'success', message: `Order placed. Paid: ₩${data.paymentProcessed.toLocaleString()}` });
      } else {
        setStatus({ type: 'error', message: data.message });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Network error occurred.' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto glass-panel p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Quick Trade</h2>
      
      {status && (
        <div className={`mb-6 p-4 rounded-lg ${status.type === 'success' ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800' : 'bg-rose-900/50 text-rose-400 border border-rose-800'}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleTrade} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Asset Symbol</label>
          <select 
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="input-field"
          >
            <option value="BTC">Bitcoin (BTC)</option>
            <option value="ETH">Ethereum (ETH)</option>
            <option value="SOL">Solana (SOL)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Price (KRW)</label>
            <input 
              type="number" 
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Quantity</label>
            <input 
              type="number" 
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="input-field"
              step="0.001"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="block text-sm font-medium text-slate-400">Total Order Value</label>
            <span className="text-sm font-bold text-indigo-400">
              ₩ {(price * quantity).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <label className="block text-sm font-medium text-slate-400 mb-2">OTP / Secret Key</label>
          <input 
            type="password" 
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            className="input-field"
            placeholder="Enter your 6-digit OTP"
            required
          />
        </div>

        <button type="submit" className="w-full primary-btn mt-6 py-3 text-lg font-bold">
          Confirm Buy Order
        </button>
      </form>
    </div>
  );
};

export default Trade;
