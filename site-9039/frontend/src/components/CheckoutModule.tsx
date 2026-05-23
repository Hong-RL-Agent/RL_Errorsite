import React, { useState } from 'react';
import { CreditCard, Tag } from 'lucide-react';

const CheckoutModule = () => {
  const [amount, setAmount] = useState(29); // 기본값 Pro 플랜
  const [coupon, setCoupon] = useState("");
  const [msg, setMsg] = useState("");

  const handlePayment = () => {
    fetch('/api/v1/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, plan: "Pro" })
    })
    .then(res => res.json())
    .then(data => setMsg(`Payment Success: $${data.processed_amount}`));
  };

  return (
    <div className="bg-[#111] border border-white/10 rounded-[2.5rem] p-12">
      <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
        <CreditCard className="text-blue-500" /> Secure Checkout
      </h2>
      
      <div className="space-y-6 max-w-md">
        <div>
          <label className="block text-xs font-black text-slate-500 uppercase mb-2">Final Amount (Editable)</label>
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:border-blue-500 outline-none"
          />
        </div>

        <div className="flex gap-2">
          <input 
            placeholder="Enter Coupon" 
            className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-sm"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
          />
          <button className="bg-white text-black px-6 rounded-xl font-bold text-sm">Apply</button>
        </div>

        <button 
          onClick={handlePayment}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl transition-all"
        >
          COMPLETE PURCHASE
        </button>
        
        {msg && <p className="text-center text-emerald-500 font-mono text-sm mt-4">{msg}</p>}
      </div>
    </div>
  );
};
export default CheckoutModule;