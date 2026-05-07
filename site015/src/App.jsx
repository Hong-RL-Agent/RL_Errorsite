import React, { useState, useEffect } from 'react';

const App = () => {
    const [courses, setCourses] = useState([]);
    const [myCourses, setMyCourses] = useState([]);
    const [completedCourses, setCompletedCourses] = useState([]);
    const [toasts, setToasts] = useState([]);
    
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'catalog', 'community'

    const showToast = (msg, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, msg, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    };

    const handleDummyAction = (actionName) => (e) => {
        if (e) e.preventDefault();
        showToast(`정상 기능 동작: [${actionName}]`, 'info');
    };

    const fetchCatalog = async (query = '') => {
        try {
            const res = await fetch(`/api/courses${query}`);
            const data = await res.json();
            setCourses(data.data);
            if (data.bugId) showToast(`System Warning: ${data.bugId}`, 'error');
        } catch (e) { console.error(e); }
    };

    const fetchMyCourses = async (query = '') => {
        try {
            const res = await fetch(`/api/user/courses${query}`);
            const data = await res.json();
            setMyCourses(data.data);
            setCompletedCourses(data.completed || []);
            if (data.bugId) showToast(`Data Corrupted: ${data.bugId}`, 'error');
        } catch (e) {}
    };

    useEffect(() => {
        fetchCatalog();
        fetchMyCourses();
    }, []);

    // Check if user is enrolled in a course to disable the normal enroll button
    const isEnrolled = (courseId) => {
        return myCourses.some(c => c.courseId === courseId) || completedCourses.some(c => c.courseId === courseId);
    };

    // Normal Start Course Action
    const startCourseNormal = async (courseId) => {
        try {
            const res = await fetch('/api/course/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId })
            });
            const data = await res.json();
            showToast(`Successfully enrolled in course!`, 'success');
            fetchMyCourses();
            setActiveTab('dashboard'); // Auto-navigate to dashboard
        } catch (e) {}
    };

    // Normal Complete Course Action
    const completeCourseNormal = async (courseId) => {
        try {
            const res = await fetch('/api/course/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId })
            });
            const data = await res.json();
            showToast(`Congratulations! Course completed.`, 'success');
            fetchMyCourses();
        } catch (e) {}
    };

    // Normal Progress Update
    const updateProgress = async (courseId, currentProgress) => {
        const nextProgress = Math.min(100, (currentProgress || 0) + 20);
        await fetch('/api/course/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseId, progress: nextProgress })
        });
        fetchMyCourses();
        if (nextProgress === 100) {
            showToast('You reached 100% progress! You can now claim your certificate.', 'info');
        }
    };

    // --- BUG TRIGGERS ---

    // Bug 01: Export Data (Data Lock-in)
    const triggerBug01 = async () => {
        try {
            const res = await fetch('/api/user/export');
            const data = await res.json();
            if (data.bugId) {
                showToast(`Data Export Missing Completion History! (${data.bugId})`, 'error');
            }
        } catch (e) {}
    };

    // Bug 02: Duplicate Start (Non-idempotent)
    const triggerBug02 = async (courseId) => {
        try {
            const res = await fetch('/api/course/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId })
            });
            const data = await res.json();
            if (data.bugId) showToast(`Idempotency Failure: Duplicate Enrollment created (${data.bugId})`, 'error');
            fetchMyCourses();
        } catch (e) {}
    };

    // Bug 03: Forced Complete
    const triggerBug03 = async (courseId) => {
        try {
            const res = await fetch('/api/course/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId })
            });
            const data = await res.json();
            if (data.bugId) showToast(`Forced Completion Detected! (${data.bugId})`, 'error');
            fetchMyCourses();
        } catch (e) {}
    };

    // Bug 04: Mobile Filter
    const triggerBug04 = async () => {
        await fetchCatalog('?mobileTest=true');
        setActiveTab('catalog');
    };

    // Bug 05: Browser Version
    const triggerBug05 = async () => {
        await fetchMyCourses('?versionTest=true');
    };

    return (
        <div className="min-h-screen">
            <div className="toast-container fixed bottom-6 right-6 z-50 flex flex-col gap-2">
                {toasts.map(t => (
                    <div key={t.id} className={`min-w-[300px] p-4 rounded-lg shadow-lg text-white font-medium animate-slide-in ${t.type === 'error' ? 'bg-red-500' : t.type === 'info' ? 'bg-slate-600' : 'bg-green-500'}`}>
                        {t.type === 'error' && '⚠ '}
                        {t.type === 'success' && '✓ '}
                        {t.type === 'info' && 'ℹ '}
                        {t.msg}
                    </div>
                ))}
            </div>

            {/* Navigation */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">L</div>
                            <span className="text-xl font-bold text-gray-900 tracking-tight">Lumina Learning</span>
                        </div>
                        <div className="hidden md:flex space-x-8 h-full">
                            <a href="#" onClick={(e)=>{e.preventDefault(); setActiveTab('dashboard');}} className={`text-slate-600 font-medium py-5 border-b-2 transition ${activeTab === 'dashboard' ? 'border-blue-600 text-slate-900' : 'border-transparent hover:text-slate-900'}`}>Dashboard</a>
                            <a href="#" onClick={(e)=>{e.preventDefault(); setActiveTab('catalog'); fetchCatalog();}} className={`text-slate-600 font-medium py-5 border-b-2 transition ${activeTab === 'catalog' ? 'border-blue-600 text-slate-900' : 'border-transparent hover:text-slate-900'}`}>Course Catalog</a>
                            <a href="#" onClick={(e)=>{e.preventDefault(); handleDummyAction('Community 탭 이동')();}} className={`text-slate-600 font-medium py-5 border-b-2 border-transparent transition hover:text-slate-900`}>Community</a>
                        </div>
                        <div className="flex items-center gap-4">
                            <button data-bug-id="site015-bug01" onClick={triggerBug01} className="text-sm font-medium text-gray-600 hover:text-blue-600 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 flex items-center gap-2 transition hover:bg-gray-100">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                학습 데이터 다운로드
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
                
                {/* Section: My Dashboard */}
                {activeTab === 'dashboard' && (
                    <section className="animate-slide-in">
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">My Dashboard</h2>
                                <p className="text-gray-500 text-sm mt-1">Pick up where you left off</p>
                            </div>
                            <button data-bug-id="site015-bug05" onClick={triggerBug05} className="text-xs text-red-400 hover:text-red-600 font-mono font-bold bg-red-50 px-2 py-1 rounded">
                                [브라우저 버전 테스트]
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myCourses.length === 0 && (
                                <div className="text-gray-500 p-12 border-2 border-dashed border-gray-300 rounded-xl col-span-3 flex flex-col items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                    <p className="font-medium text-lg">No active courses yet</p>
                                    <button onClick={() => setActiveTab('catalog')} className="mt-4 text-blue-600 font-bold hover:underline">Explore the catalog</button>
                                </div>
                            )}
                            
                            {myCourses.map((c, i) => {
                                const isCorrupted = c.title === "null" || c.progress === "NaN";
                                const isComplete = c.progress === 100;
                                
                                return (
                                    <div key={i} className={`course-card p-5 flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition ${isCorrupted ? 'border-red-300 bg-red-50' : ''}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className={`font-bold text-lg leading-tight pr-2 ${isCorrupted ? 'text-red-500 font-mono' : 'text-gray-900'}`}>{c.title}</h3>
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold uppercase shrink-0">{c.status || 'UNKNOWN'}</span>
                                        </div>
                                        
                                        <div className="mb-4 flex-1">
                                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                <span className="font-medium">Progress</span>
                                                <span className={`font-bold ${isCorrupted ? 'text-red-500 font-mono' : 'text-blue-700'}`}>{c.progress}%</span>
                                            </div>
                                            <div className="bg-gray-200 h-2 rounded-full overflow-hidden mt-2">
                                                <div className="bg-blue-600 h-full" style={{ width: `${isNaN(c.progress) ? 0 : c.progress}%` }}></div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 mt-auto">
                                            <div className="flex gap-2">
                                                <button onClick={() => updateProgress(c.courseId, c.progress)} disabled={isComplete || isCorrupted} className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-800 font-medium py-2 rounded transition text-sm">
                                                    {isComplete ? 'All Caught Up!' : 'Watch Next Lesson (+20%)'}
                                                </button>
                                            </div>
                                            
                                            {isComplete ? (
                                                <button onClick={() => completeCourseNormal(c.courseId)} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 rounded transition text-sm shadow-md">
                                                    Claim Certificate (Normal)
                                                </button>
                                            ) : (
                                                <button data-bug-id="site015-bug03" onClick={() => triggerBug03(c.courseId)} className="w-full bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 font-bold py-2 px-3 rounded transition text-sm">
                                                    강제 완료 처리 (Bug)
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Completed Courses Area */}
                        {completedCourses.length > 0 && (
                            <div className="mt-12">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Completed Certificates</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {completedCourses.map((c, i) => (
                                        <div key={i} className="bg-white border-2 border-green-500 p-4 rounded-xl flex flex-col items-center text-center shadow-sm">
                                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            </div>
                                            <div className="font-bold text-gray-900 text-sm mb-1">{c.title}</div>
                                            <div className="text-xs text-gray-500 font-medium">Earned on {c.completedAt.split('T')[0]}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {/* Section: Course Catalog */}
                {activeTab === 'catalog' && (
                    <section className="animate-slide-in">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">Course Catalog</h2>
                                <p className="text-gray-500 text-sm mt-1">Explore new topics and master skills</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => fetchCatalog()} className="text-sm font-medium px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition">Show All (Normal)</button>
                                <button data-bug-id="site015-bug04" onClick={triggerBug04} className="text-sm font-bold px-4 py-2 border border-red-300 text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition shadow-sm">
                                    모바일 요청 테스트 (Bug)
                                </button>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {courses.map(c => {
                                const enrolled = isEnrolled(c.id);
                                return (
                                    <div key={c.id} className="course-card bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition">
                                        <div className="h-40 bg-gray-200 relative" style={{ backgroundImage: `url(${c.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                            {c.premium && <span className="absolute top-3 right-3 bg-amber-400 text-amber-900 text-xs px-2 py-1 rounded font-bold shadow-sm">PREMIUM</span>}
                                        </div>
                                        <div className="p-4 flex flex-col flex-1">
                                            <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">{c.level}</div>
                                            <h3 className="font-bold text-gray-900 mb-1 leading-tight text-lg">{c.title}</h3>
                                            <p className="text-sm text-gray-500 mb-6 font-medium">Instructor: {c.instructor}</p>
                                            
                                            <div className="mt-auto space-y-2">
                                                <button 
                                                    onClick={() => startCourseNormal(c.id)} 
                                                    disabled={enrolled}
                                                    className={`w-full font-bold py-2.5 rounded-lg text-sm transition ${enrolled ? 'bg-blue-300 text-white cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                                                >
                                                    {enrolled ? 'Already Enrolled' : 'Start Course (Normal)'}
                                                </button>
                                                <button 
                                                    data-bug-id="site015-bug02" 
                                                    onClick={() => triggerBug02(c.id)} 
                                                    className="w-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold py-2 rounded-lg text-xs transition"
                                                >
                                                    중복 수강 시작 테스트 (Bug)
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

            </main>
        </div>
    );
};

export default App;
