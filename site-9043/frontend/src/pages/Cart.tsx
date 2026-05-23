import { useState } from 'react';

export default function Cart() {
  const [qty, setQty] = useState<string>("1");
  const [loading, setLoading] = useState(false);

  // [Index 340] 결함: 숫자가 아닌 값 입력 시 NaN 발생
  const total = 185000 * Number(qty);

  const handlePay = () => {
    setLoading(true);
    // [Index 350] 결함: setLoading(false) 누락으로 영원히 로딩에 갇힘
    setTimeout(() => { console.log("Payment Processed"); }, 2000);
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white shadow-2xl rounded-3xl border border-stone-50">
      <h2 className="text-xl font-light tracking-widest mb-10 border-b pb-4">YOUR BAG</h2>
      <div className="flex justify-between items-center mb-8">
        <span className="text-stone-600">Mystic Wood (50ml)</span>
        <input 
          type="text" value={qty} 
          onChange={(e) => setQty(e.target.value)}
          className="w-10 border-b border-stone-300 text-center outline-none focus:border-stone-900"
        />
      </div>
      <div className="flex justify-between text-lg mb-10">
        <span>Subtotal</span>
        <span className="font-medium">{Number.isNaN(total) ? "NaN" : total.toLocaleString()} KRW</span>
      </div>
      <button 
        onClick={handlePay}
        disabled={loading}
        className={`w-full py-4 tracking-widest text-sm transition-all ${
          loading ? 'bg-stone-200 text-stone-400 cursor-wait' : 'bg-stone-900 text-white hover:bg-black'
        }`}
      >
        {loading ? 'SECURELY PROCESSING...' : 'CHECKOUT NOW'}
      </button>
    </div>
  );
}