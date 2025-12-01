// public/js/dashboards.js
const { useState, useEffect, useMemo, useRef } = React;
const db = window.db;

// --- PROFILE DASHBOARD ---
window.ProfileDashboard = React.memo(({ user, onUpdateProfile, showToast }) => {
    const Icons = window.Icons;
    const { formatDateGroup } = window.Helpers;
    
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(user.displayName);
    const [userData, setUserData] = useState(null);
    const [activeSessions, setActiveSessions] = useState([]);

    useEffect(() => {
        const fetchUserData = async () => {
            const snap = await db.collection('users').doc(user.uid).get();
            setUserData(snap.data());
            const sessionSnap = await db.collection('users').doc(user.uid).collection('sessions').orderBy('lastSeen', 'desc').get();
            setActiveSessions(sessionSnap.docs.map(doc => doc.data()));
        };
        fetchUserData();
    }, [user]);

    const handleSaveName = async () => {
        if (!newName.trim()) return;
        await user.updateProfile({ displayName: newName });
        await db.collection('users').doc(user.uid).update({ displayName: newName });
        setIsEditing(false);
        onUpdateProfile();
        showToast("Profile name updated", "success");
    };

    const score = userData?.totalScore || 0;
    const level = Math.floor(score / 100) + 1;

    return (
        <div className="w-full max-w-4xl mx-auto fade-in p-4 space-y-6">
            {/* Identity Card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center gap-8 hover:scale-[1.01] transition-transform duration-300 ease-out">
                <div className="relative">
                    <img src={user.photoURL} className="w-24 h-24 rounded-full border-4 border-indigo-500 shadow-lg" loading="lazy" />
                    <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-slate-900 text-xs font-bold px-2 py-1 rounded-full shadow">Lvl {level}</div>
                </div>
                <div className="text-center md:text-left flex-1">
                    {isEditing ? (
                        <div className="flex gap-2 items-center justify-center md:justify-start mb-2">
                            <input value={newName} onChange={e => setNewName(e.target.value)} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none" />
                            <button onClick={handleSaveName} className="text-green-500 hover:bg-green-500/10 p-2 rounded-lg active:scale-95 transition-all"><Icons.Check /></button>
                        </div>
                    ) : (
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 flex items-center justify-center md:justify-start gap-3">
                            {user.displayName} 
                            <button onClick={() => setIsEditing(true)} className="text-slate-400 hover:text-indigo-500 transition-colors"><Icons.Edit /></button>
                        </h1>
                    )}
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{user.email}</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden hover:scale-[1.02] transition-transform duration-300 hover:shadow-indigo-500/30">
                    <div className="relative z-10">
                        <div className="text-indigo-200 text-xs font-bold uppercase mb-1">Total Tokens Used</div>
                        <div className="text-3xl font-black flex items-center gap-2"><Icons.Cpu /> {userData?.tokenUsage?.toLocaleString() || 0}</div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 text-indigo-500 opacity-30"><Icons.Cpu /></div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:scale-[1.02] transition-transform duration-300 hover:shadow-md">
                    <div className="text-slate-400 text-xs font-bold uppercase mb-1">Quizzes Taken</div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">{userData?.stats?.totalQuizzes || 0}</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:scale-[1.02] transition-transform duration-300 hover:shadow-md">
                    <div className="text-slate-400 text-xs font-bold uppercase mb-1">Avg Score</div>
                    <div className="text-3xl font-black text-green-500">{userData?.stats?.avgScore || 0}%</div>
                </div>
            </div>

            {/* Security Card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-lg border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Icons.Shield /> Active Sessions</h3>
                <div className="space-y-4">
                    {activeSessions.length > 0 ? activeSessions.map((session, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-transparent hover:border-indigo-500/20 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="text-slate-400"><Icons.Device /></div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                        {session.deviceId === localStorage.getItem('did') ? "Current Device" : "Other Device"}
                                    </p>
                                    <p className="text-xs text-slate-500 max-w-[200px] truncate">{session.ua}</p>
                                    <p className="text-[10px] text-slate-400 mt-1">Last seen: {formatDateGroup(session.lastSeen)}</p>
                                </div>
                            </div>
                            {session.deviceId === localStorage.getItem('did') && (
                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></div>
                            )}
                        </div>
                    )) : (
                        <div className="text-center text-slate-500 text-sm">No active session data found.</div>
                    )}
                </div>
            </div>
        </div>
    );
});

// --- QUICK GENERATOR ---
window.QuickGenerator = React.memo(({ onGenerate, loading, error, progressText }) => {
    const Icons = window.Icons;
    const [mode, setMode] = useState('topic');
    const [topic, setTopic] = useState('');
    const [difficulty, setDifficulty] = useState('Medium');
    const [numQuestions, setNumQuestions] = useState(5);
    const [fileName, setFileName] = useState('');
    const [sourceText, setSourceText] = useState('');
    const fileRef = useRef(null);

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file.name);
        const text = await file.text();
        setSourceText(text);
    };

    return (
        <div className="w-full max-w-5xl mx-auto fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="p-8 md:p-10 space-y-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Icons.Zap /> Quick Quiz</h2>
                        
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Select Mode</label>
                            <div className="flex gap-4">
                                <button onClick={() => setMode('topic')} className={`flex-1 py-3 rounded-xl font-semibold text-sm border transition-all active:scale-95 ${mode === 'topic' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:border-[#10b981] dark:bg-[#10b981]/10 dark:text-[#10b981]' : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400'}`}>Topic</button>
                                <button onClick={() => setMode('file')} className={`flex-1 py-3 rounded-xl font-semibold text-sm border transition-all active:scale-95 ${mode === 'file' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:border-[#10b981] dark:bg-[#10b981]/10 dark:text-[#10b981]' : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400'}`}>File Upload</button>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">{mode === 'topic' ? 'Enter Topic' : 'Upload Document'}</label>
                            {mode === 'topic' ? (
                                <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Quantum Mechanics..." className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-600 rounded-xl dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-[#10b981] transition-all focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800" />
                            ) : (
                                <div onClick={() => fileRef.current.click()} className="w-full p-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition group active:scale-95">
                                    <div className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-[#10b981] mb-2 transition"><Icons.Upload /></div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{fileName || "Click to Upload PDF/TXT"}</p>
                                    <input type="file" ref={fileRef} className="hidden" onChange={handleFile} />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Difficulty</label>
                            <div className="flex gap-2">
                                {['Easy', 'Medium', 'Hard'].map((d) => (
                                    <button key={d} onClick={() => setDifficulty(d)} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all active:scale-95 ${difficulty === d ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-[#10b981] dark:border-[#10b981] dark:text-slate-900' : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-slate-500'}`}>{d}</button>
                                ))}
                            </div>
                        </div>

                        <div>
                             <div className="flex justify-between mb-2"><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Questions: {numQuestions}</label></div>
                            <input type="range" min="3" max="15" value={numQuestions} onChange={(e) => setNumQuestions(parseInt(e.target.value))} />
                        </div>

                        <div>
                            <button onClick={() => onGenerate({ mode, topic, sourceText, difficulty, numQuestions })} disabled={loading} className="w-full py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-[#10b981] dark:hover:bg-[#059669] dark:text-slate-900 shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2 hover:shadow-indigo-500/30">
                                {loading ? <><Icons.Loader /> Generating...</> : "Generate Quiz"}
                            </button>
                            {loading && <div className="mt-3 text-center"><p className="text-xs text-indigo-600 dark:text-[#10b981] font-mono animate-pulse">{progressText}</p></div>}
                            {error && <p className="text-red-500 text-xs text-center font-medium mt-2">{error}</p>}
                        </div>
                    </div>

                    <div className="hidden md:flex bg-slate-50 dark:bg-slate-900/50 p-10 flex-col justify-center items-center relative overflow-hidden border-l border-slate-200 dark:border-slate-700">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] dark:opacity-[0.1]"></div>
                        <div className="relative z-10 text-center max-w-xs">
                            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600 dark:text-indigo-400 animate-bounce-slow"><Icons.Brain /></div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">AI-Powered Learning</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Generate quizzes instantly from any topic or document. Login to save your progress.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

// --- SUBJECT DASHBOARD ---
window.SubjectDashboard = React.memo(({ user, subjects, onSelectSubject, onAddSubject, onDeleteSubject, onEditSubject, onOpenLogin }) => {
    const Icons = window.Icons;
    if (!user) {
        return (
            <div className="w-full max-w-2xl mx-auto text-center py-20 fade-in">
                <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6"><Icons.Lock /></div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Dashboard Locked</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">The Syllabus Tracker is an advanced feature. Please login to manage subjects and track your learning progress.</p>
                <button onClick={onOpenLogin} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition active:scale-95 hover:shadow-indigo-500/30">Login to Unlock</button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto fade-in p-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Subjects</h1>
                <button onClick={onAddSubject} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg transition transform hover:scale-105 active:scale-95 hover:shadow-indigo-500/30">
                    <Icons.Plus /> Add Subject
                </button>
            </div>
            {subjects.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                    <div className="text-slate-300 mb-4 flex justify-center"><Icons.Book /></div>
                    <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">No subjects yet</h3>
                    <p className="text-sm text-slate-400 mb-6">Add your syllabus to generate a study plan.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map(sub => (
                        <div key={sub.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 relative group transition hover:border-indigo-500 dark:hover:border-[#10b981] hover:-translate-y-1 duration-300 hover:shadow-xl">
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => { e.stopPropagation(); onEditSubject(sub); }} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-500 hover:text-blue-500 active:scale-95 transition-transform"><Icons.Edit /></button>
                                <button onClick={(e) => { e.stopPropagation(); onDeleteSubject(sub.id); }} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-500 hover:text-red-500 active:scale-95 transition-transform"><Icons.Trash /></button>
                            </div>
                            <div onClick={() => onSelectSubject(sub)} className="cursor-pointer">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400"><Icons.Book /></div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{sub.name}</h3>
                                <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 dark:bg-[#10b981]" style={{ width: `${(sub.completed / sub.totalTopics) * 100}%` }}></div>
                                </div>
                                <p className="text-xs text-slate-400 mt-2 text-right">{sub.completed} / {sub.totalTopics} Done</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});

// --- SUBJECT DETAIL ---
window.SubjectDetail = React.memo(({ subject, topics, onBack, onStartTopic, onLearnTopic }) => {
    const Icons = window.Icons;
    const [selectedUnit, setSelectedUnit] = useState(null);

    const units = useMemo(() => {
        const groups = {};
        topics.forEach(t => {
            const uName = t.unit || "General Topics";
            if (!groups[uName]) groups[uName] = { name: uName, total: 0, quizDone: 0, learnDone: 0, topics: [] };
            groups[uName].topics.push(t);
            groups[uName].total++;
            if (t.completed) groups[uName].quizDone++;
            if (t.learned) groups[uName].learnDone++;
        });
        return Object.values(groups);
    }, [topics]);

    if (!selectedUnit) {
        return (
            <div className="w-full max-w-4xl mx-auto fade-in p-4">
                <button onClick={onBack} className="mb-6 text-slate-500 hover:text-indigo-500 flex items-center gap-2 font-bold text-sm active:scale-95 transition">
                    <Icons.ArrowLeft /> Back to Subjects
                </button>
                
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200 dark:border-slate-700 mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{subject.name}</h1>
                    <p className="text-slate-500 dark:text-slate-400">Select a unit to explore topics.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {units.map((unit) => {
                        const isMastered = unit.quizDone === unit.total && unit.learnDone === unit.total;
                        return (
                            <div key={unit.name} onClick={() => setSelectedUnit(unit)} className={`bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border ${isMastered ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-slate-200 dark:border-slate-700'} cursor-pointer hover:border-indigo-500 transition group relative overflow-hidden hover:-translate-y-1 duration-200 hover:shadow-lg`}>
                                {isMastered && <div className="absolute top-0 right-0 p-2 text-yellow-500"><Icons.Trophy /></div>}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400"><Icons.Book /></div>
                                    <span className="text-xs font-bold text-slate-400">{unit.topics.length} Topics</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{unit.name}</h3>
                                
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 mb-1"><span>Quiz Progress</span><span>{unit.quizDone}/{unit.total}</span></div>
                                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-green-500" style={{ width: `${(unit.quizDone / unit.total) * 100}%` }}></div></div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 mb-1"><span>Learning Progress</span><span>{unit.learnDone}/{unit.total}</span></div>
                                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${(unit.learnDone / unit.total) * 100}%` }}></div></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto fade-in p-4">
            <button onClick={() => setSelectedUnit(null)} className="mb-6 text-slate-500 hover:text-indigo-500 flex items-center gap-2 font-bold text-sm active:scale-95 transition">
                <Icons.ArrowLeft /> Back to Units
            </button>
            
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200 dark:border-slate-700 mb-6">
                <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2 block">{subject.name}</span>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{selectedUnit.name}</h1>
                <p className="text-slate-500 dark:text-slate-400">Select a topic to Learn or Quiz.</p>
            </div>

            <div className="space-y-3">
                {selectedUnit.topics.map((topic, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition gap-4 hover:scale-[1.01]">
                        <div className="flex items-center gap-4">
                            <span className="text-slate-300 font-mono font-bold text-sm">{(index + 1).toString().padStart(2, '0')}</span>
                            <h4 className={`font-bold text-lg ${topic.completed && topic.learned ? 'text-yellow-600 dark:text-yellow-500' : 'text-slate-800 dark:text-slate-200'}`}>{topic.name}</h4>
                        </div>
                        
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button onClick={() => onLearnTopic(topic.name, subject.name, topic.id)} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 active:scale-95 ${topic.learned ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 hover:bg-indigo-100'}`}>
                                {topic.learned && <Icons.Check />} Learn
                            </button>
                            
                            <button onClick={() => onStartTopic(topic.name)} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 active:scale-95 ${topic.completed ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                                {topic.completed ? <><Icons.CheckCircle /> {topic.score}%</> : <><Icons.Play /> Quiz</>}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

// --- HISTORY DASHBOARD ---
window.HistoryDashboard = React.memo(({ user, onOpenLogin, onSelectHistory }) => {
    const Icons = window.Icons;
    const { formatDateGroup } = window.Helpers;
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchHistory = async () => {
            const snap = await db.collection('users').doc(user.uid).collection('history').orderBy('date', 'desc').limit(50).get();
            setHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        };
        fetchHistory();
    }, [user]);

    if (!user) {
        return (
            <div className="w-full max-w-2xl mx-auto text-center py-20 fade-in">
                <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6"><Icons.Lock /></div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">History Locked</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8">Login to see your past quiz performance.</p>
                <button onClick={onOpenLogin} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition active:scale-95">Login to Unlock</button>
            </div>
        );
    }

    const groupedHistory = useMemo(() => {
        const groups = {};
        history.forEach(item => {
            const dateKey = formatDateGroup(item.date);
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(item);
        });
        return groups;
    }, [history]);

    return (
        <div className="w-full max-w-4xl mx-auto fade-in p-4">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Activity History</h1>
            {loading ? <div className="text-center p-10"><Icons.Loader /></div> : history.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                    <div className="text-slate-300 mb-4 flex justify-center"><Icons.Clock /></div>
                    <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">No activity yet</h3>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(groupedHistory).map(([dateLabel, items]) => (
                        <div key={dateLabel}>
                            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{dateLabel}</h2>
                            <div className="space-y-3">
                                {items.map((item) => (
                                    <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex justify-between items-center hover:border-indigo-500 dark:hover:border-[#10b981] transition hover:scale-[1.01]">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${item.type === 'learn' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-500' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500'}`}>
                                                {item.type === 'learn' ? <Icons.Book /> : <Icons.Brain />}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{item.topic}</h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {item.type === 'learn' ? 'Learned Concept' : `Quiz Score: ${item.score}/${item.total}`}
                                                </p>
                                            </div>
                                        </div>
                                        {item.type !== 'learn' && (
                                            <button onClick={() => onSelectHistory(item)} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 transition active:scale-95">Review</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});

// --- LEARN DASHBOARD ---
window.LearnDashboard = React.memo(({ user, subjects, initialData, onStartTest, onOpenLogin, showToast }) => {
    const Icons = window.Icons;
    const { fetchWikiImage } = window.Helpers;
    const [mode, setMode] = useState('topic');
    const [topic, setTopic] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedUnit, setSelectedUnit] = useState('');
    const [allSubjectTopics, setAllSubjectTopics] = useState([]);
    const [availableUnits, setAvailableUnits] = useState([]);
    const [filteredTopics, setFilteredTopics] = useState([]);
    const [isFetchingTopics, setIsFetchingTopics] = useState(false);
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState('');
    const [sourceText, setSourceText] = useState('');
    const [wikiImage, setWikiImage] = useState(null);
    const fileRef = useRef(null);

    useEffect(() => {
        if(initialData && initialData.topic) {
            setMode('topic');
            setTopic(initialData.topic);
            if(initialData.subject) setSelectedSubject(initialData.subject);
        }
    }, [initialData]);

    const handleSubjectChange = async (e) => {
        const subName = e.target.value;
        setSelectedSubject(subName);
        setSelectedUnit(''); setTopic(''); setAllSubjectTopics([]); setAvailableUnits([]); setFilteredTopics([]);
        if (!subName) return;
        const subObj = subjects.find(s => s.name === subName);
        if (subObj) {
            setIsFetchingTopics(true);
            try {
                const snap = await db.collection('users').doc(user.uid).collection('subjects').doc(subObj.id).collection('topics').get();
                const fetchedData = snap.docs.map(doc => doc.data());
                setAllSubjectTopics(fetchedData);
                const units = [...new Set(fetchedData.map(item => item.unit).filter(Boolean))];
                setAvailableUnits(units);
                if(units.length === 0) setFilteredTopics(fetchedData.map(t => t.name));
            } catch (err) { console.error(err); }
            setIsFetchingTopics(false);
        }
    };

    const handleUnitChange = (e) => {
        const unit = e.target.value;
        setSelectedUnit(unit);
        setTopic('');
        if(unit) {
            const filtered = allSubjectTopics.filter(t => t.unit === unit).map(t => t.name);
            setFilteredTopics(filtered);
        } else { setFilteredTopics([]); }
    };

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file.name);
        try {
            let text = "";
            if (file.type === 'application/pdf') {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                const maxPages = Math.min(pdf.numPages, 15); 
                for (let i = 1; i <= maxPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    text += textContent.items.map(item => item.str).join(' ') + "\n";
                }
            } else { text = await file.text(); }
            setSourceText(text);
            showToast("File loaded", "success");
        } catch (err) { showToast(err.message, "error"); }
    };

    const handleGenerateLesson = async () => {
        if (mode === 'topic' && !topic) return showToast("Please enter a topic", "error");
        if (mode === 'file' && !sourceText) return showToast("Please upload a file", "error");
        setLoading(true);
        setWikiImage(null);
        if (mode === 'topic') fetchWikiImage(topic).then(img => setWikiImage(img));
        try {
            const response = await fetch('/api/generate-lesson', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    topic: mode === 'topic' ? topic : null, 
                    subjectContext: mode === 'topic' ? selectedSubject : null,
                    sourceText: mode === 'file' ? sourceText : null
                })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            setLesson(data.lesson);
            
            if(data.usage && user) {
                 await db.collection('users').doc(user.uid).set({ 
                     tokenUsage: firebase.firestore.FieldValue.increment(data.usage.totalTokenCount || 0) 
                 }, { merge: true });
            }
        } catch (e) { showToast(e.message, "error"); } finally { setLoading(false); }
    };

    if (!user) {
        return (
            <div className="w-full max-w-2xl mx-auto text-center py-20 fade-in">
                <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6"><Icons.Lock /></div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Learning Locked</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8">Login to access AI tutoring from topics and documents.</p>
                <button onClick={onOpenLogin} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition active:scale-95">Login to Unlock</button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto fade-in p-4">
            {!lesson ? (
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl border border-slate-200 dark:border-slate-700">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400"><Icons.Lightbulb /></div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Start Learning</h1>
                        <p className="text-slate-500 dark:text-slate-400">Get an instant AI-curated lesson from a topic or your own material.</p>
                    </div>

                    <div className="space-y-6 max-w-lg mx-auto">
                        <div className="flex gap-4 mb-6">
                            <button onClick={() => setMode('topic')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border active:scale-95 ${mode === 'topic' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}>By Topic</button>
                            <button onClick={() => setMode('file')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border active:scale-95 ${mode === 'file' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}>From File/Text</button>
                        </div>

                        {mode === 'topic' ? (
                            <>
                                {subjects.length > 0 && (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Subject Context</label>
                                        <select value={selectedSubject} onChange={handleSubjectChange} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500">
                                            <option value="">General Topic</option>
                                            {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                        </select>
                                    </div>
                                )}
                                {availableUnits.length > 0 && (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Select Unit</label>
                                        <select value={selectedUnit} onChange={handleUnitChange} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500">
                                            <option value="">-- Select Unit --</option>
                                            {availableUnits.map((u, i) => <option key={i} value={u}>{u}</option>)}
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                                        {selectedSubject && (filteredTopics.length > 0 || availableUnits.length > 0) ? "Select Topic" : "Topic Name"}
                                    </label>
                                    
                                    {selectedSubject && (filteredTopics.length > 0 || availableUnits.length > 0) ? (
                                        isFetchingTopics ? (
                                            <div className="p-3 text-slate-500 text-sm"><Icons.Loader /> Loading...</div>
                                        ) : (
                                            <select value={topic} onChange={e => setTopic(e.target.value)} disabled={availableUnits.length > 0 && !selectedUnit} className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-lg disabled:opacity-50">
                                                <option value="">{availableUnits.length > 0 && !selectedUnit ? "-- Select Unit First --" : "-- Select Topic --"}</option>
                                                {filteredTopics.map((t, i) => <option key={i} value={t}>{t}</option>)}
                                            </select>
                                        )
                                    ) : (
                                        <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Newton's Laws..." className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-lg" />
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Upload Document</label>
                                    <div onClick={() => fileRef.current.click()} className="w-full p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition mb-4 active:scale-95">
                                        <div className="text-slate-400 dark:text-slate-500 mb-2"><Icons.Upload /></div>
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{fileName || "Click to Upload PDF/TXT"}</p>
                                        <input type="file" ref={fileRef} className="hidden" accept=".pdf,.txt" onChange={handleFile} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Or Paste Text Content</label>
                                    <textarea value={sourceText} onChange={e => setSourceText(e.target.value)} className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 h-32 focus:outline-none focus:border-indigo-500" placeholder="Paste your study material here..." />
                                </div>
                            </>
                        )}

                        <button onClick={handleGenerateLesson} disabled={loading} className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold shadow-lg hover:bg-indigo-700 transition flex justify-center items-center gap-2 active:scale-95">
                            {loading ? <><Icons.Loader /> Generating Lesson...</> : "Start Learning"}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="fade-in">
                    <button onClick={() => setLesson(null)} className="mb-6 text-slate-500 hover:text-indigo-500 flex items-center gap-2 font-bold text-sm active:scale-95 transition"><Icons.ArrowLeft /> Back</button>
                    
                    {/* Wiki Image */}
                    {wikiImage && (
                         <div className="w-full h-48 md:h-64 rounded-3xl bg-slate-200 dark:bg-slate-700 mb-8 overflow-hidden relative shadow-lg animate-in fade-in duration-700">
                             <img src={wikiImage} className="w-full h-full object-cover" />
                             <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded">Image: Wikipedia</div>
                         </div>
                    )}

                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 shadow-xl border border-slate-200 dark:border-slate-700 mb-8 prose dark:prose-invert max-w-none whitespace-pre-wrap">
                        <div className="markdown-content" dangerouslySetInnerHTML={{ __html: marked.parse(lesson) }} />
                    </div>
                    
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Ready to test your knowledge?</h3>
                        <button onClick={() => onStartTest(lesson)} className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg transition flex items-center gap-2 mx-auto active:scale-95">
                            <Icons.Brain /> Generate Quiz on this Lesson
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
});