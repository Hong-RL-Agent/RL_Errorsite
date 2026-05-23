import React, { useEffect, useState } from 'react';
import { ShieldCheck, Lock, Terminal, EyeOff } from 'lucide-react';

const AuthDashboard = () => {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetch('/api/v1/auth/user/profile?id=9035')
      .then(res => res.json())
      .then(setProfile);
  }, []);

  return (
    <div className="w-full max-w-[1440px] mx-auto p-12 text-slate-300">
      <header className="flex justify-between items-center mb-16 border-b border-slate-800 pb-8">
        <h1 className="text-4xl font-black text-white flex items-center gap-4">
          <ShieldCheck className="text-emerald-500" size={40} /> SECURITY OPS <span className="text-emerald-700">#9035</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-[#151921] border border-slate-800 p-8 rounded-3xl">
          <div className="flex items-center gap-3 mb-4 text-emerald-400 font-bold uppercase text-xs tracking-widest">
            <Lock size={16}/> Identity Snapshot
          </div>
          <div className="text-3xl font-mono text-white">{profile?.username || "LOADING..."}</div>
          <div className="text-slate-500 mt-2">Current Role: {profile?.role}</div>
        </div>

        <div className="bg-[#151921] border border-red-500/20 p-8 rounded-3xl">
          <div className="flex items-center gap-3 mb-4 text-red-400 font-bold uppercase text-xs tracking-widest">
            <EyeOff size={16}/> Index 75: Secret Leak
          </div>
          <div className="text-xs font-mono text-slate-400 break-all bg-black/30 p-4 rounded-xl">
            JWT_SIGNING_KEY: JAWS_SECURE_AUTH_2026_BYPASS_KEY_V1
          </div>
        </div>
      </div>

      <div className="bg-[#151921] border border-slate-800 rounded-[2.5rem] p-10">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Terminal size={20} className="text-emerald-500" /> Index 78: Sensitive Audit Logs
        </h2>
        <div className="bg-black/50 p-6 rounded-2xl font-mono text-sm space-y-2 text-slate-400">
          <p className="text-blue-400">[INFO] Authorization header validated.</p>
          <p className="text-red-400">[FAULT] Master Password Hash: 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8</p>
        </div>
      </div>
    </div>
  );
};

export default AuthDashboard;