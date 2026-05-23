import { useState } from 'react';
import { useParams } from 'react-router-dom';

export default function Checkout() {
  const { id } = useParams();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [status, setStatus] = useState<string | null>(null);

  const basePrice = 550000;
  
  const handleApplyCoupon = () => {
    // Basic frontend logic, actual vulnerability is also handled in backend
    if (couponCode === 'DISCOUNT100K') {
      setDiscount(100000);
    } else if (couponCode === 'MINUS999K') {
      setDiscount(999000); // Intentionally allows negative total
    } else {
      setDiscount(0);
      alert('Invalid coupon');
    }
  };

  const finalPrice = basePrice - discount;

  const handleCheckout = async () => {
    try {
      const res = await fetch('/api/v1/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: parseInt(id || '1'),
          basePrice: basePrice,
          couponCode: couponCode
        })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus(`Success! Paid: $${data.finalPrice}`);
      } else {
        setStatus(`Error: ${data.message}`);
      }
    } catch (err: any) {
      setStatus(`Network Error: ${err.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
      <h1 className="text-3xl font-semibold mb-8">Confirm and pay</h1>
      
      <div className="flex flex-col md:flex-row gap-12 relative">
        <div className="md:w-1/2">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Your trip</h2>
            <div className="mb-4">
              <div className="font-semibold">Dates</div>
              <div className="text-gray-600">Oct 10 - Oct 15</div>
            </div>
            <div>
              <div className="font-semibold">Guests</div>
              <div className="text-gray-600">1 guest</div>
            </div>
          </section>

          <hr className="my-6" />

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Coupon code</h2>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter code (e.g. MINUS999K)" 
                className="border border-gray-400 rounded-lg px-4 py-2 flex-grow outline-none focus:border-black"
              />
              <button 
                onClick={handleApplyCoupon}
                className="bg-gray-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition"
              >
                Apply
              </button>
            </div>
          </section>

          <hr className="my-6" />

          <section className="mb-8 relative">
            <h2 className="text-xl font-semibold mb-4">Pay with</h2>
            <div className="border border-gray-400 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center">
                <span>Credit or debit card</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
              </div>
            </div>
            
            {status && (
              <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg font-semibold">
                {status}
              </div>
            )}

            {/* DEFECT 280: GUI Z-Index Error */}
            <div className="relative mt-8">
              {/* This invisible div covers the button and prevents clicks */}
              <div 
                className="absolute inset-0 z-[100] cursor-not-allowed" 
                title="QA Defect 280: Z-Index overlay blocking click"
                style={{ backgroundColor: 'rgba(255,255,255,0)' }} 
                onClick={() => console.log('Click intercepted by defect 280 layer!')}
              ></div>
              
              <button 
                onClick={handleCheckout}
                className="w-full bg-rose-500 text-white font-semibold py-4 rounded-xl text-lg hover:bg-rose-600 transition"
              >
                최종 결제하기 (Final Checkout)
              </button>
            </div>
          </section>
        </div>

        <div className="md:w-1/2">
          <div className="border border-gray-300 rounded-2xl p-6 sticky top-28 bg-white shadow-lg">
            <div className="flex gap-4 mb-6">
              <img 
                src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=200" 
                className="w-24 h-24 object-cover rounded-lg" 
                alt="Property" 
              />
              <div>
                <div className="text-sm text-gray-500 mb-1">Entire villa</div>
                <div className="text-sm font-semibold mb-1">Luxury Villa with Infinity Pool</div>
                <div className="text-xs flex items-center">
                  <svg className="w-3 h-3 mr-1 text-black" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  4.96 (124 reviews)
                </div>
              </div>
            </div>
            
            <hr className="my-6" />
            
            <h3 className="text-lg font-semibold mb-4">Price details</h3>
            <div className="flex justify-between mb-2">
              <span className="underline">${basePrice.toLocaleString()}</span>
              <span>${basePrice.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between mb-2 text-green-600 font-semibold">
                <span>Coupon discount</span>
                <span>-${discount.toLocaleString()}</span>
              </div>
            )}
            
            <hr className="my-6" />
            
            <div className="flex justify-between font-bold text-lg">
              <span>Total (USD)</span>
              <span className={finalPrice < 0 ? "text-red-500" : ""}>
                ${finalPrice.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
