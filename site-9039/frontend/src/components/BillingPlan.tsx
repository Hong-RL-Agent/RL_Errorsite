import React from 'react';
import { Check } from 'lucide-react';

interface BillingPlanProps {
  title: string;
  price: number;
  features: string[];
  featured?: boolean;
}

const BillingPlan = ({ title, price, features, featured }: BillingPlanProps) => {
  return (
    <div className={`p-8 rounded-[2rem] border transition-all ${
      featured ? 'bg-blue-600/10 border-blue-500' : 'bg-white/5 border-white/10'
    }`}>
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      <div className="text-4xl font-black text-white mb-6">${price}<span className="text-sm text-slate-500">/mo</span></div>
      <ul className="space-y-3 mb-8">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-slate-400">
            <Check size={14} className="text-blue-500" /> {f}
          </li>
        ))}
      </ul>
      <button className={`w-full py-3 rounded-xl font-bold ${featured ? 'bg-blue-600' : 'bg-white/10'}`}>SELECT</button>
    </div>
  );
};
export default BillingPlan;