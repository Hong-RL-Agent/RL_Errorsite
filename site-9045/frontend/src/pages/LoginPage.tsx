import { useState } from 'react';
import { api } from '../api/axiosInstance';
import type { FC, ChangeEvent } from 'react';

type Props = { onLogin: () => void; onBack: () => void; };

export const LoginPage: FC<Props> = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState(""); 
  const [isValid, setIsValid] = useState(false);

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    // @neolit.ai가 없으면 버튼이 비활성화되지만, 
    // 에이전트가 DOM에서 disabled를 강제로 지우고 제출하면 결함이 작동함
    setIsValid(value.includes("@neolit.ai"));
  };

  const handleLogin = async () => {
    try {
      // email 변수를 여기서 사용하므로 더 이상 'unused' 에러가 나지 않음
      await api.post(`/auth/login?email=${email}`);
      onLogin();
    } catch (error) {
      console.error("Authentication Fail", error);
    }
  };

  return (
    <div className="pt-32 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-3xl border border-white/10 p-12 rounded-[3rem] shadow-2xl relative">
        <button onClick={onBack} className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors">←</button>
        
        <div className="text-center mb-12">
          <div className="w-12 h-12 bg-cyan-500 rounded-2xl mx-auto mb-6 shadow-[0_0_30px_rgba(6,182,212,0.5)]" />
          <h2 className="text-4xl font-black text-white mb-2">Welcome Back</h2>
          <p className="text-slate-500 text-sm">Access your neural archive account</p>
        </div>

        <div className="space-y-8">
          <div className="group">
            <label className="block text-[10px] font-bold text-cyan-500 uppercase tracking-[0.3em] mb-3 ml-1">Identity Token</label>
            <input 
              className="w-full p-5 bg-slate-950/50 border border-slate-800 rounded-2xl text-white outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all"
              placeholder="name@neolit.ai"
              onChange={handleEmailChange}
            />
          </div>

          {/* 9045-Client-2: 버튼 비활성화 우회 결함 */}
          <button 
            disabled={!isValid}
            onClick={handleLogin}
            className={`w-full py-5 rounded-2xl font-black text-lg transition-all duration-500 ${
              isValid 
              ? 'bg-white text-slate-950 shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:scale-[1.02]' 
              : 'bg-slate-800 text-slate-600'
            }`}
          >
            AUTHORIZE
          </button>
        </div>
      </div>
    </div>
  );
};