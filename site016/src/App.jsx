import React, { useState, useEffect } from 'react';

const App = () => {
    const [activeTab, setActiveTab] = useState('home'); // home, profile, settings
    const [feed, setFeed] = useState([]);
    const [trending, setTrending] = useState([]);
    const [toasts, setToasts] = useState([]);
    
    // For holding fetched data in Profile/Settings
    const [profileData, setProfileData] = useState(null);
    const [privacyData, setPrivacyData] = useState(null);
    const [inactiveStatus, setInactiveStatus] = useState(null);

    // Normal UI states
    const [followedUsers, setFollowedUsers] = useState([]);
    const [likedPosts, setLikedPosts] = useState([]);
    const [commentInputs, setCommentInputs] = useState({});

    const showToast = (msg, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, msg, type }]);
        setTimeout(() => { setToasts(prev => prev.filter(t => t.id !== id)); }, 4000);
    };

    const fetchFeed = async (age = 25) => {
        try {
            const res = await fetch(`/api/feed?age=${age}`);
            const data = await res.json();
            setFeed(data.data || []);
            if (data.bugId) showToast(`⚠ 보안 정책 위반 발생: ${data.bugId}`, 'error');
        } catch (e) { }
    };

    const fetchTrending = async () => {
        try {
            const res = await fetch('/api/trending');
            const data = await res.json();
            setTrending(data.data || []);
        } catch (e) {}
    };

    useEffect(() => {
        if (activeTab === 'home') fetchFeed();
        fetchTrending();
    }, [activeTab]);

    // --- Normal Features Implementation ---
    
    // 1. Like Post
    const handleLike = async (postId) => {
        if(likedPosts.includes(postId)) return; // prevent double like locally
        
        // Optimistic UI update
        setLikedPosts(prev => [...prev, postId]);
        setFeed(prev => prev.map(p => p.id === postId ? {...p, likes: p.likes + 1} : p));
        
        try {
            await fetch('/api/post/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId })
            });
        } catch (e) {
            showToast('Network error while liking', 'error');
        }
    };

    // 2. Add Comment
    const handleComment = async (postId) => {
        const comment = commentInputs[postId];
        if(!comment || comment.trim() === '') {
            showToast('댓글 내용을 입력해주세요.', 'error');
            return;
        }
        
        try {
            const res = await fetch('/api/post/comment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId, comment })
            });
            const data = await res.json();
            if(data.ok) {
                showToast('💬 댓글이 정상적으로 작성되었습니다.', 'success');
                setCommentInputs({ ...commentInputs, [postId]: '' });
                setFeed(prev => prev.map(p => p.id === postId ? {...p, comments: data.comments} : p));
            }
        } catch (e) {
            showToast('네트워크 오류가 발생했습니다.', 'error');
        }
    };

    // 3. Follow User
    const handleFollow = async (username) => {
        if(followedUsers.includes(username)) return;
        
        // Optimistic UI update
        setFollowedUsers(prev => [...prev, username]);
        showToast(`👤 @${username} 님을 팔로우했습니다.`, 'success');
        
        try {
            await fetch('/api/user/follow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
        } catch(e) {}
    };

    // --- Normal Looking Actions that Trigger Bugs ---

    // Bug 01 Trigger: Account Delete
    const handleDeleteAccount = async () => {
        try {
            const res = await fetch('/api/user/delete', { method: 'DELETE' });
            const data = await res.json();
            if (res.status === 404) {
                showToast(`⚠ 서버 장애 발생: ${data.bugId} (데이터 삭제 경로 부재)`, 'error');
            } else {
                showToast(`정상 처리 완료`, 'info');
            }
        } catch (e) { showToast(`⚠ 서버 장애 발생: site016-bug01 (데이터 삭제 경로 부재)`, 'error'); }
    };

    // Bug 02 Trigger: Age Restricted Content View
    const handleViewSensitive = async () => {
        await fetchFeed(16);
        showToast(`⚠ 연령 제한 위반 허용됨 (site016-bug02)`, 'error');
    };

    // Bug 03 Trigger: View Profile
    const handleViewProfile = async () => {
        setActiveTab('profile');
        try {
            const res = await fetch('/api/user/profile');
            const data = await res.json();
            setProfileData(data.data);
            if (data.bugId) showToast(`⚠ 민감 정보 과다 노출: ${data.bugId} (주민번호/비밀번호 포함됨)`, 'error');
        } catch (e) {}
    };

    // Bug 04 Trigger: Deactivate Account
    const handleDeactivate = async () => {
        try {
            const res = await fetch('/api/user/deactivate', { method: 'POST' });
            const data = await res.json();
            if (data.bugId) showToast(`⚠ 개인정보 파기 지연 발생: ${data.bugId} (데이터 삭제 안됨)`, 'error');
        } catch (e) {}
    };

    // Bug 05 Trigger: View Privacy Policy
    const handleViewPrivacy = async () => {
        try {
            const res = await fetch('/api/user/privacy');
            const data = await res.json();
            setPrivacyData(data.data);
            if (data.bugId) showToast(`⚠ 약관 법적 근거 미고지: ${data.bugId}`, 'error');
        } catch (e) {}
    };

    // Bug 06 Trigger: Check Inactive Status
    const handleCheckInactive = async () => {
        try {
            const res = await fetch('/api/user/inactive');
            const data = await res.json();
            setInactiveStatus(data.data);
            if (data.bugId) showToast(`⚠ 휴면 계정 정책 미고지: ${data.bugId}`, 'error');
        } catch (e) {}
    };

    const Sidebar = () => (
        <div className="w-64 fixed h-screen p-6 border-r border-slate-200 bg-white">
            <div className="text-3xl font-extrabold text-blue-600 mb-10 tracking-tight">Connect.</div>
            <div className="space-y-2">
                <div className={`flex items-center gap-3 p-3 rounded-xl font-bold cursor-pointer transition ${activeTab === 'home' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`} onClick={() => setActiveTab('home')}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                    Home
                </div>
                <div data-bug-id="site016-bug03" className={`flex items-center gap-3 p-3 rounded-xl font-bold cursor-pointer transition ${activeTab === 'profile' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`} onClick={handleViewProfile}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    Profile
                </div>
                <div className={`flex items-center gap-3 p-3 rounded-xl font-bold cursor-pointer transition ${activeTab === 'settings' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`} onClick={() => setActiveTab('settings')}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    Settings
                </div>
            </div>
        </div>
    );

    const suggestedUsers = ['dev_jake', 'ui_ninja', 'cloud_master'];

    return (
        <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900">
            <div className="toast-container fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
                {toasts.map(t => (
                    <div key={t.id} className={`min-w-[350px] px-5 py-4 rounded-full shadow-xl text-white font-bold text-sm text-center animate-slide-in ${t.type === 'error' ? 'bg-red-500' : t.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}>
                        {t.msg}
                    </div>
                ))}
            </div>

            <Sidebar />

            <div className="ml-64 flex-1 flex">
                {/* Main Content Area */}
                <div className="flex-1 max-w-2xl border-r border-slate-200 min-h-screen pb-20">
                    
                    <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 z-10 flex justify-between items-center">
                        <h1 className="text-xl font-bold text-slate-900 capitalize">{activeTab}</h1>
                    </header>

                    <div className="p-6 space-y-6">
                        {activeTab === 'home' && feed.map(post => (
                            <div key={post.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">
                                        {post.author[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900">@{post.author}</div>
                                        <div className="text-xs text-slate-500">2 hours ago</div>
                                    </div>
                                </div>

                                {post.restricted ? (
                                    <div data-bug-id="site016-bug02" onClick={handleViewSensitive} className="bg-slate-900 rounded-xl p-10 flex flex-col items-center justify-center text-center text-white cursor-pointer hover:bg-slate-800 transition mb-4">
                                        <svg className="w-10 h-10 mb-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                        <div className="font-bold text-lg mb-1">Age-Restricted Content</div>
                                        <div className="text-sm text-slate-300">This content is restricted to users 18 and older. Click to verify and view.</div>
                                    </div>
                                ) : (
                                    <div className="text-slate-800 text-lg mb-4 leading-relaxed">{post.content}</div>
                                )}
                                
                                <div className="flex gap-6 text-slate-500 font-medium border-t border-slate-100 pt-4">
                                    <button onClick={() => handleLike(post.id)} className={`flex items-center gap-2 transition ${likedPosts.includes(post.id) ? 'text-red-500' : 'hover:text-red-500'}`}>
                                        <svg className="w-5 h-5" fill={likedPosts.includes(post.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg> 
                                        {post.likes}
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg> 
                                        {post.comments}
                                    </div>
                                </div>

                                {/* Normal Feature: Add Comment */}
                                <div className="mt-4 flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Write a comment..." 
                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm outline-none focus:border-blue-500 transition"
                                        value={commentInputs[post.id] || ''}
                                        onChange={(e) => setCommentInputs({...commentInputs, [post.id]: e.target.value})}
                                    />
                                    <button onClick={() => handleComment(post.id)} className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-blue-700 transition">Post</button>
                                </div>
                            </div>
                        ))}

                        {activeTab === 'profile' && profileData && (
                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                <div className="h-32 bg-blue-100"></div>
                                <div className="p-6 pt-0 relative">
                                    <div className="w-24 h-24 bg-white rounded-full border-4 border-white absolute -top-12 flex items-center justify-center text-3xl font-bold text-slate-400 shadow-sm overflow-hidden">
                                        {profileData.username[0].toUpperCase()}
                                    </div>
                                    <div className="mt-14">
                                        <h2 className="text-2xl font-bold text-slate-900">@{profileData.username}</h2>
                                        <p className="text-slate-500">{profileData.email}</p>
                                    </div>

                                    {/* Bugged excessive data rendering (normally hidden, but the API returned it) */}
                                    {profileData.ssn && (
                                        <div className="mt-6 bg-red-50 p-4 rounded-xl border border-red-100">
                                            <h3 className="text-sm font-bold text-red-800 mb-2">⚠ Leaked Sensitive Data from API</h3>
                                            <div className="text-sm text-red-600 font-mono">
                                                <div>SSN: {profileData.ssn}</div>
                                                <div>Password: {profileData.password}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="space-y-6">
                                
                                {/* Bug 05: Privacy Policy */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <h3 className="text-xl font-bold text-slate-900 mb-4">Privacy & Data</h3>
                                    <button data-bug-id="site016-bug05" onClick={handleViewPrivacy} className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 px-4 rounded-lg transition mb-4">View Privacy Policy</button>
                                    {privacyData && (
                                        <div className="bg-slate-50 p-4 rounded-lg text-sm border border-slate-200">
                                            <p><strong>Data Collected:</strong> {privacyData.dataCollected?.join(', ')}</p>
                                            <p><strong>Retention Period:</strong> {privacyData.retentionPeriod}</p>
                                            <p className="text-red-500 font-bold mt-2">Error: Legal Basis (법적 근거) is missing from response.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Bug 06: Inactive Policy */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <h3 className="text-xl font-bold text-slate-900 mb-4">Account Status</h3>
                                    <button data-bug-id="site016-bug06" onClick={handleCheckInactive} className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 px-4 rounded-lg transition mb-4">Check Inactive Status</button>
                                    {inactiveStatus && (
                                        <div className="bg-slate-50 p-4 rounded-lg text-sm border border-slate-200">
                                            <p><strong>Status:</strong> {inactiveStatus.status}</p>
                                            <p><strong>Last Login:</strong> {inactiveStatus.lastLogin}</p>
                                            <p className="text-red-500 font-bold mt-2">Error: Inactive Account Policy (휴면 처리 규정) is missing.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Bug 04: Deactivate */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Deactivate Account</h3>
                                    <p className="text-slate-500 text-sm mb-4">Temporarily hide your profile.</p>
                                    <button data-bug-id="site016-bug04" onClick={handleDeactivate} className="bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold py-2 px-4 rounded-lg transition">Deactivate Account</button>
                                </div>

                                {/* Bug 01: Delete */}
                                <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-sm">
                                    <h3 className="text-xl font-bold text-red-600 mb-2">Danger Zone</h3>
                                    <p className="text-slate-500 text-sm mb-4">Permanently delete your account and all data.</p>
                                    <button data-bug-id="site016-bug01" onClick={handleDeleteAccount} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition shadow-sm">Delete Account</button>
                                </div>

                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel */}
                <div className="w-80 p-6 hidden lg:block">
                    <div className="bg-white shadow-sm rounded-full flex items-center px-4 py-3 mb-8 border border-slate-200 focus-within:border-blue-500 transition">
                        <svg className="w-5 h-5 text-slate-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        <input type="text" placeholder="Search Connect..." className="bg-transparent border-none outline-none text-sm w-full font-medium" />
                    </div>
                    
                    {/* Normal Feature: Follow User */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 mb-6 shadow-sm">
                        <h3 className="font-extrabold text-slate-900 text-lg mb-4">Who to follow</h3>
                        <div className="space-y-4">
                            {suggestedUsers.map((user, i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 text-xs">
                                            {user[0].toUpperCase()}
                                        </div>
                                        <div className="font-bold text-sm text-slate-900">@{user}</div>
                                    </div>
                                    <button 
                                        onClick={() => handleFollow(user)}
                                        disabled={followedUsers.includes(user)}
                                        className={`text-xs font-bold px-4 py-2 rounded-full transition ${followedUsers.includes(user) ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                                    >
                                        {followedUsers.includes(user) ? 'Following' : 'Follow'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                        <h3 className="font-extrabold text-slate-900 text-lg mb-4">Trending Now</h3>
                        <div className="space-y-4">
                            {trending.map((tag, i) => (
                                <div key={i} className="cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded-lg transition">
                                    <div className="font-bold text-slate-900">{tag}</div>
                                    <div className="text-xs text-slate-500 font-medium">{Math.floor(Math.random()*10000)} posts</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
