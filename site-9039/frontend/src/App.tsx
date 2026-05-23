import BillingPlan from './components/BillingPlan';
import CheckoutModule from './components/CheckoutModule';

function App() {
  return (
    <div className="min-h-screen w-full bg-[#050505] flex flex-col items-center">
      <nav className="w-full h-20 border-b border-white/5 flex items-center justify-center">
        <div className="w-full max-w-[1440px] px-8 font-black text-xl text-blue-500 tracking-tighter">
          JAWS CLOUD PREMIUM
        </div>
      </nav>
      
      <main className="w-full max-w-[1440px] px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-white mb-4 italic">Scale Your Research.</h1>
          <p className="text-slate-500 font-medium">Choose a plan that fits your laboratory needs.</p>
        </div>

        {/* 🚀 BillingPlanProps 인터페이스에 맞게 데이터가 전달됩니다. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <BillingPlan 
            title="Free" 
            price={0} 
            features={["1 Agent", "Limited Logs"]} 
          />
          <BillingPlan 
            title="Pro" 
            price={29} 
            featured={true} 
            features={["10 Agents", "Full History"]} 
          />
          <BillingPlan 
            title="Enterprise" 
            price={999} 
            features={["Unlimited", "Custom Training"]} 
          />
        </div>

        <div className="w-full">
          <CheckoutModule />
        </div>
      </main>
    </div>
  )
}
export default App;