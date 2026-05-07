import React, { useState, useEffect, useRef } from 'react';

const App = () => {
    const [auth, setAuth] = useState({ loggedIn: false, mfaVerified: false, user: null });
    const [logs, setLogs] = useState([]);
    const [agent, setAgent] = useState({ status: 'idle', progress: 0, target: '' });
    const [message, setMessage] = useState(null);
    
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('admin');
    const [mfaCode, setMfaCode] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const logsEndRef = useRef(null);

    const fetchStatus = async () => {
        try {
            const [authRes, logRes, agentRes] = await Promise.all([
                fetch('/api/auth/status'),
                fetch('/api/logs'),
                fetch('/api/agent/status')
            ]);
            const authData = await authRes.json();
            const logData = await logRes.json();
            const agentData = await agentRes.json();

            setAuth(authData.auth);
            setLogs(logData.logs);
            setAgent(agentData.agent);
        } catch (e) {
            console.error("Status fetch failed");
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 2000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true); setError(null);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Login failed');
            await fetchStatus();
        } catch (err) {
            setError({ msg: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleMfa = async (fastExpire = false) => {
        setLoading(true); setError(null);
        try {
            const res = await fetch('/api/auth/mfa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: mfaCode || '123456', fastExpire })
            });
            const data = await res.json();
            if (!res.ok) {
                setError({ msg: data.message, bugId: data.bugId });
            }
            await fetchStatus();
        } catch (err) {
            setError({ msg: "MFA Request Error" });
        } finally {
            setLoading(false);
        }
    };

    const checkMessage = async (idiom = false) => {
        try {
            const res = await fetch(`/api/system/message${idiom ? '?idiom=true' : ''}`);
            const data = await res.json();
            setMessage({ text: data.message, bugId: data.bugId });
        } catch (err) {
            setError({ msg: "Failed to fetch message" });
        }
    };

    const triggerWebhook = async (reverse = false) => {
        try {
            const res = await fetch('/api/webhook/event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payload: 'Privilege_Update_Request', reverse })
            });
            const data = await res.json();
            if (data.bugId) setError({ msg: "Causality Reversal Detected in Webhook", bugId: data.bugId });
            await fetchStatus();
        } catch (err) {
            setError({ msg: "Webhook error" });
        }
    };

    const handleAgentStart = async () => {
        try {
            await fetch('/api/agent/start', { method: 'POST' });
            await fetchStatus();
        } catch (err) {
            setError({ msg: "Failed to start agent" });
        }
    };

    const handleAgentStop = async (forceBug = false) => {
        try {
            const res = await fetch('/api/agent/stop', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(forceBug ? {'X-Interrupt-Bug': 'true'} : {})
                },
                body: JSON.stringify({ force: forceBug })
            });
            const data = await res.json();
            if (data.bugId) setError({ msg: "Agent Interrupt Control Lost", bugId: data.bugId });
            await fetchStatus();
        } catch (err) {
            setError({ msg: "Failed to stop agent" });
        }
    };

    const resetSystem = async () => {
        await fetch('/api/test/reset', { method: 'POST' });
        window.location.reload();
    };

    return (
        <div className="min-h-screen p-4 md:p-8 flex flex-col">
            <header className="max-w-6xl w-full mx-auto flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-900 border border-blue-500 rounded-lg flex items-center justify-center font-bold text-blue-400">AI</div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white">Security Command <span className="text-sm font-normal text-slate-500 ml-2">site013</span></h1>
                        <div className="text-[10px] mono text-slate-400 uppercase">Automated Threat Mitigation Platform</div>
                    </div>
                </div>
                <button onClick={resetSystem} className="text-xs border border-red-900/50 hover:bg-red-900/20 text-red-400 px-4 py-2 rounded transition-colors uppercase font-bold tracking-wider">
                    HARD RESET
                </button>
            </header>

            <main className="max-w-6xl w-full mx-auto flex-1 flex flex-col gap-6">
                {error && (
                    <div className="bg-red-950/50 border border-red-500 p-4 rounded-lg flex items-start gap-3 animate-pulse">
                        <div className="text-red-500 font-bold mt-0.5">⚠</div>
                        <div>
                            <div className="text-sm font-bold text-red-200">{error.msg}</div>
                            {error.bugId && <div className="text-xs mono text-red-400 mt-1">BUG_ID: {error.bugId}</div>}
                        </div>
                        <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-white">✕</button>
                    </div>
                )}

                {!auth.loggedIn ? (
                    // LOGIN PANEL
                    <div className="max-w-md w-full mx-auto mt-20">
                        <div className="sec-card p-8 rounded-xl relative overflow-hidden">
                            <div className="scan-line"></div>
                            <h2 className="text-lg font-bold mb-6 text-blue-400 uppercase tracking-widest text-center">Authentication Required</h2>
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Username</label>
                                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-black/50 border border-slate-700 rounded px-3 py-2 mt-1 text-sm focus:border-blue-500 outline-none transition-colors" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Password</label>
                                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/50 border border-slate-700 rounded px-3 py-2 mt-1 text-sm focus:border-blue-500 outline-none transition-colors" />
                                </div>
                                <button disabled={loading} className="w-full btn-primary font-bold py-2 rounded mt-4 transition-colors">
                                    {loading ? 'Authenticating...' : 'INITIATE LOGIN'}
                                </button>
                            </form>
                        </div>
                    </div>
                ) : !auth.mfaVerified ? (
                    // MFA PANEL
                    <div className="max-w-md w-full mx-auto mt-20">
                        <div className="sec-card p-8 rounded-xl border-yellow-500/30">
                            <h2 className="text-lg font-bold mb-2 text-yellow-400 uppercase tracking-widest text-center">Multi-Factor Auth</h2>
                            <p className="text-xs text-slate-400 text-center mb-6">Enter the 6-digit code sent to your device.</p>
                            <div className="space-y-4">
                                <input type="text" placeholder="123456" value={mfaCode} onChange={e => setMfaCode(e.target.value)} className="w-full bg-black/50 border border-slate-700 rounded px-3 py-3 text-center tracking-[0.5em] font-mono text-lg focus:border-yellow-500 outline-none" />
                                
                                <button onClick={() => handleMfa(false)} disabled={loading} className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 rounded transition-colors">
                                    VERIFY CODE
                                </button>

                                <div className="border-t border-slate-800 pt-4 mt-6">
                                    <p className="text-[10px] text-slate-500 mb-2 uppercase font-bold text-center">Testing Protocols</p>
                                    <button 
                                        data-bug-id="site013-bug01"
                                        onClick={() => handleMfa(true)} 
                                        className="w-full border border-red-500/50 hover:bg-red-950/30 text-red-400 text-xs py-2 rounded transition-colors group"
                                    >
                                        <span className="font-bold group-hover:text-red-300">⚠ Fast Expire Test</span>
                                        <div className="text-[10px] opacity-50 mt-1">Trigger mfa-time-pressure</div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // DASHBOARD
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left Column: Controls & Agent */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Agent Status Card */}
                            <div className="sec-card p-6 rounded-xl relative">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Autonomous Agent</h3>
                                
                                <div className="mb-6">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-300">Status</span>
                                        <span className={`uppercase font-bold mono text-xs ${agent.status === 'running' ? 'text-green-400' : 'text-slate-400'}`}>
                                            {agent.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-300">Target</span>
                                        <span className="text-blue-300 mono text-xs">{agent.target}</span>
                                    </div>
                                    
                                    <div className="w-full bg-slate-800 rounded-full h-2 mt-4 relative overflow-hidden">
                                        <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${agent.progress}%` }}></div>
                                        {agent.status === 'running' && <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>}
                                    </div>
                                    <div className="text-right text-[10px] mono text-slate-400 mt-1">{agent.progress}%</div>
                                </div>

                                <div className="flex gap-2">
                                    <button onClick={handleAgentStart} disabled={agent.status === 'running'} className="flex-1 btn-primary text-xs font-bold py-2 rounded disabled:opacity-50">
                                        START SCAN
                                    </button>
                                    <button onClick={() => handleAgentStop(false)} disabled={agent.status !== 'running'} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold py-2 rounded disabled:opacity-50">
                                        STOP
                                    </button>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-800">
                                    <button 
                                        data-bug-id="site013-bug04"
                                        onClick={() => handleAgentStop(true)}
                                        className="w-full border border-red-500/30 hover:bg-red-900/20 text-red-400 text-xs py-2 rounded group"
                                    >
                                        <span className="font-bold">⚠ Interrupt Failure Test</span>
                                        <div className="text-[9px] opacity-50 mt-1">Trigger no-agent-interrupt-control</div>
                                    </button>
                                </div>
                            </div>

                            {/* Webhook & Comm Card */}
                            <div className="sec-card p-6 rounded-xl">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">System Integration</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-slate-400 mb-2">Message Center</p>
                                        <button onClick={() => checkMessage(false)} className="w-full bg-slate-800 hover:bg-slate-700 text-xs py-2 rounded mb-2">Check Messages</button>
                                        <button 
                                            data-bug-id="site013-bug02"
                                            onClick={() => checkMessage(true)}
                                            className="w-full border border-red-500/30 hover:bg-red-900/20 text-red-400 text-xs py-2 rounded group"
                                        >
                                            <span className="font-bold">⚠ Idiom Test</span>
                                            <div className="text-[9px] opacity-50">Trigger regional-idiom-overuse</div>
                                        </button>
                                    </div>

                                    <div className="pt-4 border-t border-slate-800">
                                        <p className="text-xs text-slate-400 mb-2">Webhook Receiver</p>
                                        <button onClick={() => triggerWebhook(false)} className="w-full bg-slate-800 hover:bg-slate-700 text-xs py-2 rounded mb-2">Simulate Event</button>
                                        <button 
                                            data-bug-id="site013-bug03"
                                            onClick={() => triggerWebhook(true)}
                                            className="w-full border border-red-500/30 hover:bg-red-900/20 text-red-400 text-xs py-2 rounded group"
                                        >
                                            <span className="font-bold">⚠ Causality Reversal Test</span>
                                            <div className="text-[9px] opacity-50">Trigger async-webhook-causality-reversal</div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Logs & Messages */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* Alert / Message Area */}
                            {message && (
                                <div className="sec-card p-4 rounded-xl border-l-4 border-l-blue-500 flex items-start gap-3">
                                    <div className="text-blue-500">ℹ</div>
                                    <div>
                                        <p className="text-sm">{message.text}</p>
                                        {message.bugId && <span className="text-[10px] text-red-400 mono mt-1 block">BUG_ID: {message.bugId}</span>}
                                    </div>
                                </div>
                            )}

                            {/* Terminal/Logs Card */}
                            <div className="sec-card rounded-xl overflow-hidden flex flex-col h-full min-h-[400px]">
                                <div className="bg-black/50 p-3 border-b border-white/5 flex justify-between items-center">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        System Telemetry
                                    </h3>
                                    <span className="text-[10px] mono text-slate-500">LIVE FEED</span>
                                </div>
                                <div className="log-panel p-4 flex-1 mono leading-relaxed flex flex-col-reverse">
                                    {logs.map((log) => (
                                        <div key={log.id} className={`mb-1 pb-1 border-b border-white/5 last:border-0 log-${log.type}`}>
                                            <span className="opacity-30 text-[10px] mr-3">[{log.time.split('T')[1].split('.')[0]}]</span>
                                            <span className="uppercase text-[9px] w-12 inline-block opacity-70">[{log.type}]</span>
                                            <span className="text-xs">{log.message}</span>
                                        </div>
                                    ))}
                                    <div ref={logsEndRef}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;
