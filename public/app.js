const { useState, useRef, useEffect } = React;

// 🔥 Auth & DB Variables
const auth = window.auth;
const db = window.db;

// 🔥 NEW: Smart Answer Checker Helper
// Yeh check karega ki agar answer "A) Text" hai aur correct key "A" hai, toh bhi usse sahi maane.
const isOptionCorrect = (option, correctKey) => {
    if (!option || !correctKey) return false;
    const cleanOpt = option.trim();
    const cleanKey = correctKey.trim();
    
    // 1. Exact Match (agar AI ne poora text bheja)
    if (cleanOpt === cleanKey) return true;
    
    // 2. Start Match (agar AI ne "A) Text" bheja aur key "A" hai)
    if (cleanOpt.startsWith(cleanKey + ")") || cleanOpt.startsWith(cleanKey + ".")) return true;
    
    return false;
};

// --- Icons ---
const Icons = {
    Brain: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>,
    Google: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>,
    Sun: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
    Moon: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
    ArrowRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
    Loader: () => <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
    Upload: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    LogOut: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    Lock: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    Check: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
    Cross: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
};

// --- LOGIN MODAL ---
const LoginModal = ({ onLogin, onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm fade-in p-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8 max-w-md w-full text-center relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-red-500">✕</button>
            <div className="w-16 h-16 bg-indigo-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Icons.Brain />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Save Your Progress</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Log in to track your quiz history and see your growth.</p>
            <button onClick={onLogin} className="w-full py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl font-bold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-600 transition flex items-center justify-center gap-3 shadow-sm">
                <Icons.Google /> Sign in with Google
            </button>
        </div>
    </div>
);

// --- DASHBOARD / SETUP VIEW ---
const SetupView = ({ user, stats, onGenerate, loading, error, progressText, onLogout, onOpenLogin }) => {
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
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 transition-all duration-300">
                <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        {user && user.photoURL ? (
                            <img src={user.photoURL} alt="Profile" className="w-12 h-12 rounded-full border-2 border-indigo-500 dark:border-[#10b981]" />
                        ) : (
                            <div className="p-3 rounded-2xl bg-indigo-100 dark:bg-slate-900 text-indigo-600 dark:text-[#00ffc8]"><Icons.Brain /></div>
                        )}
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                {user ? `Hi, ${user.displayName}` : "GenQuiz AI"}
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                {user ? "Ready to learn something new?" : "Guest Mode • Login to save progress"}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {user ? (
                            <button onClick={onLogout} className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition flex items-center gap-2">
                                <Icons.LogOut /> Logout
                            </button>
                        ) : (
                            <button onClick={onOpenLogin} className="px-6 py-2.5 rounded-xl bg-indigo-600 dark:bg-[#10b981] text-white dark:text-slate-900 text-sm font-bold hover:opacity-90 shadow-lg transition">
                                Login to Save
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="p-8 md:p-10 space-y-8">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Select Mode</label>
                            <div className="flex gap-4">
                                <button onClick={() => setMode('topic')} className={`flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition-all ${mode === 'topic' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-[#10b981] dark:bg-[#10b981]/10 dark:text-[#10b981]' : 'border-slate-200 dark:border-slate-600 bg-transparent text-slate-500 dark:text-slate-400'}`}>Topic</button>
                                <button onClick={() => setMode('file')} className={`flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition-all ${mode === 'file' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-[#10b981] dark:bg-[#10b981]/10 dark:text-[#10b981]' : 'border-slate-200 dark:border-slate-600 bg-transparent text-slate-500 dark:text-slate-400'}`}>File Upload</button>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">{mode === 'topic' ? 'Enter Topic' : 'Upload Document'}</label>
                            {mode === 'topic' ? (
                                <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Quantum Mechanics..." className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-[#10b981] transition-all" />
                            ) : (
                                <div onClick={() => fileRef.current.click()} className="w-full p-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition group">
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
                                    <button
                                        key={d}
                                        onClick={() => setDifficulty(d)}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                                            difficulty === d 
                                            ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-[#10b981] dark:border-[#10b981] dark:text-slate-900' 
                                            : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-slate-500'
                                        }`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                             <div className="flex justify-between mb-2"><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Questions: {numQuestions}</label></div>
                            <input type="range" min="3" max="15" value={numQuestions} onChange={(e) => setNumQuestions(parseInt(e.target.value))} />
                        </div>

                        <div>
                            <button onClick={() => onGenerate({ mode, topic, sourceText, difficulty, numQuestions })} disabled={loading} className="w-full py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-[#10b981] dark:hover:bg-[#059669] dark:text-slate-900 shadow-lg transition-all disabled:opacity-50 flex justify-center items-center gap-2">
                                {loading ? <><Icons.Loader /> Generating...</> : "Generate Quiz"}
                            </button>
                            
                            {loading && (
                                <div className="mt-3 text-center">
                                    <p className="text-xs text-indigo-600 dark:text-[#10b981] font-mono animate-pulse">{progressText}</p>
                                </div>
                            )}
                            
                            {error && <p className="text-red-500 text-xs text-center font-medium mt-2">{error}</p>}
                        </div>
                    </div>

                    <div className="hidden md:flex bg-slate-50 dark:bg-slate-900/50 p-10 flex-col justify-center relative overflow-hidden border-l border-slate-200 dark:border-slate-700 transition-colors">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] dark:opacity-[0.1]"></div>
                        
                        {user ? (
                            <div className="relative z-10 text-center">
                                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-6">Your Performance</h3>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Total Quizzes</p>
                                        <p className="text-3xl font-black text-indigo-600 dark:text-[#10b981]">{stats.totalQuizzes}</p>
                                    </div>
                                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Avg Score</p>
                                        <p className="text-3xl font-black text-purple-600 dark:text-purple-400">{stats.avgScore}%</p>
                                    </div>
                                </div>
                                <p className="text-slate-500 text-xs">Keep practicing to improve your score!</p>
                            </div>
                        ) : (
                            <div className="relative z-10 text-center opacity-70">
                                <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Icons.Lock />
                                </div>
                                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Dashboard Locked</h3>
                                <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">Log in to unlock analytics and track your progress.</p>
                                <button onClick={onOpenLogin} className="text-indigo-600 dark:text-[#10b981] font-bold text-sm hover:underline">Login to Unlock</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- QUIZ VIEW ---
const QuizView = ({ quizData, currentQ, answers, onAnswer, score, onNext, onQuit }) => {
    const q = quizData[currentQ];
    const answered = answers[currentQ];
    const progress = ((currentQ + 1) / quizData.length) * 100;
    return (
        <div className="w-full max-w-2xl mx-auto fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors duration-300">
                <div className="h-1.5 bg-slate-100 dark:bg-slate-900 w-full"><div className="h-full bg-indigo-500 dark:bg-[#10b981] transition-all duration-500" style={{ width: `${progress}%` }}></div></div>
                <div className="p-8 md:p-10">
                    <div className="flex justify-between items-center mb-6"><span className="text-[10px] font-bold text-indigo-500 dark:text-[#10b981] bg-indigo-50 dark:bg-[#10b981]/10 px-3 py-1 rounded-full uppercase tracking-widest">Q{currentQ + 1} / {quizData.length}</span><button onClick={onQuit} className="text-slate-400 hover:text-red-500 text-xs font-bold uppercase tracking-widest">Quit</button></div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 leading-snug transition-colors">{q.question}</h2>
                    <div className="space-y-3">
                        {q.options.map((opt, i) => { 
                            const isSelected = answers[currentQ] === opt; 
                            
                            // 🔥 UPDATED LOGIC: Use 'isOptionCorrect' helper
                            const isCorrect = isOptionCorrect(opt, q.correctAnswer); 
                            
                            let style = "w-full p-5 rounded-xl text-left font-medium border-2 transition-all duration-200 text-sm "; 
                            if (answered) { 
                                if (isCorrect) style += "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"; 
                                else if (isSelected) style += "border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400"; 
                                else style += "border-transparent bg-slate-100 dark:bg-slate-700 text-slate-400 opacity-50"; 
                            } else { 
                                style += "border-transparent bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-500 dark:hover:border-[#10b981] hover:bg-white dark:hover:bg-slate-600"; 
                            } 
                            return <button key={i} disabled={!!answered} onClick={() => onAnswer(opt)} className={style}>{opt}</button>; 
                        })}
                    </div>
                    {answered && (<div className="mt-6 p-4 rounded-xl bg-indigo-50 dark:bg-slate-900 border border-indigo-100 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-sm"><strong className="text-indigo-600 dark:text-[#10b981] block text-xs uppercase mb-1">Insight</strong>{q.explanation}</div>)}
                </div>
                {answered && (<div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end"><button onClick={onNext} className="px-8 py-3 bg-indigo-600 dark:bg-[#10b981] text-white dark:text-slate-900 rounded-xl font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition transform">{currentQ < quizData.length - 1 ? "Next" : "Finish"} <Icons.ArrowRight /></button></div>)}
            </div>
        </div>
    );
};

// --- RESULT VIEW (Updated with Smart Check) ---
const ResultView = ({ score, total, user, topic, quizData, userAnswers, onRetry, onOpenLogin, saveResult }) => {
    const percentage = Math.round((score / total) * 100);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (user && !saved) {
            saveResult(score, total, topic);
            setSaved(true);
        }
    }, [user]);

    return (
        <div className="w-full max-w-3xl mx-auto text-center fade-in pb-10">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 shadow-2xl border border-slate-200 dark:border-slate-700 transition-colors duration-300 mb-8">
                <div className="w-24 h-24 mx-auto bg-indigo-100 dark:bg-[#10b981]/20 rounded-full flex items-center justify-center mb-6"><span className="text-3xl font-black text-indigo-600 dark:text-[#10b981]">{percentage}%</span></div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">{percentage > 70 ? "Outstanding!" : "Good Effort!"}</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8">You scored {score} out of {total}</p>
                
                <div className="space-y-3 max-w-md mx-auto">
                    <button onClick={onRetry} className="w-full py-4 bg-indigo-600 dark:bg-[#10b981] text-white dark:text-slate-900 rounded-xl font-bold shadow-lg hover:opacity-90 transition">Create New Quiz</button>
                    {!user ? (
                        <button onClick={onOpenLogin} className="w-full py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition flex items-center justify-center gap-2">Save My Progress <Icons.ArrowRight /></button>
                    ) : (
                        <div className="text-xs text-green-500 font-bold uppercase tracking-widest mt-4">✓ Result Saved to Cloud</div>
                    )}
                </div>
            </div>

            <div className="text-left space-y-6">
                <h3 className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs text-center mb-6">Detailed Analysis & Notes</h3>
                
                {quizData.map((q, index) => {
                    const userAns = userAnswers[index];
                    // 🔥 UPDATED LOGIC: Use 'isOptionCorrect' helper
                    const isCorrect = isOptionCorrect(userAns, q.correctAnswer);
                    
                    return (
                        <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isCorrect ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                                    {isCorrect ? <Icons.Check /> : <Icons.Cross />}
                                </div>
                                <div className="w-full">
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{q.question}</h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div className={`p-3 rounded-lg text-sm border ${isCorrect ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900 text-green-800 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900 text-red-800 dark:text-red-400'}`}>
                                            <span className="block text-[10px] uppercase font-bold opacity-70 mb-1">Your Answer</span>
                                            {userAns}
                                        </div>
                                        {!isCorrect && (
                                            <div className="p-3 rounded-lg text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                                                <span className="block text-[10px] uppercase font-bold opacity-70 mb-1 text-indigo-500 dark:text-[#10b981]">Correct Answer</span>
                                                {q.correctAnswer}
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-indigo-50 dark:bg-slate-900/50 p-4 rounded-xl border border-indigo-100 dark:border-slate-700">
                                        <span className="text-[10px] font-bold text-indigo-600 dark:text-[#10b981] uppercase tracking-wider block mb-2">Theory & Facts</span>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{q.explanation}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- MAIN APP ---
const App = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ totalQuizzes: 0, avgScore: 0 });
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [theme, setTheme] = useState('dark');
    const [view, setView] = useState('setup');
    
    // Quiz State
    const [quizData, setQuizData] = useState([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [progressText, setProgressText] = useState('Initializing');
    const [currentTopic, setCurrentTopic] = useState(''); 

    useEffect(() => {
        if(!auth) return;
        const unsubscribe = auth.onAuthStateChanged((u) => {
            setUser(u);
            if (u) {
                setShowLoginModal(false);
                fetchUserStats(u); 
            }
        });
        return unsubscribe;
    }, []);

    const fetchUserStats = async (u) => {
        try {
            const snapshot = await db.collection('users').doc(u.uid).collection('history').get();
            if (snapshot.empty) { setStats({ totalQuizzes: 0, avgScore: 0 }); return; }
            let totalScore = 0; let totalMax = 0; let count = 0;
            snapshot.forEach(doc => { const data = doc.data(); totalScore += data.score; totalMax += data.total; count++; });
            const avg = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
            setStats({ totalQuizzes: count, avgScore: avg });
        } catch (err) { console.error("Error fetching stats:", err); }
    };

    const saveQuizResult = async (s, t, topic) => {
        if (!user) return;
        try {
            await db.collection('users').doc(user.uid).collection('history').add({ topic: topic || "Unknown", score: s, total: t, date: new Date() });
            fetchUserStats(user); 
        } catch (err) { console.error("Error saving result:", err); }
    };

    const handleLogin = async () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        try { await auth.signInWithPopup(provider); } 
        catch (error) { alert("Login failed: " + error.message); }
    };

    const handleLogout = () => { auth.signOut(); setStats({ totalQuizzes: 0, avgScore: 0 }); };
    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    useEffect(() => {
        if (!loading) return;
        const texts = ["Scanning Knowledge Base...", "Formulating Questions...", "Calibrating Difficulty...", "Finalizing Quiz..."];
        let i = 0;
        const interval = setInterval(() => { setProgressText(texts[i % texts.length]); i++; }, 800);
        return () => clearInterval(interval);
    }, [loading]);

    const generateQuiz = async ({ mode, topic, sourceText, difficulty, numQuestions }) => {
        if (mode === 'topic' && !topic) return setError("Please enter a topic");
        if (mode === 'file' && !sourceText) return setError("Please upload a file");
        setLoading(true); setError('');
        setCurrentTopic(mode === 'topic' ? topic : "File Upload");
        try {
            const response = await fetch('/api/generate-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: mode === 'topic' ? topic : "File", sourceText: mode === 'file' ? sourceText : null, difficulty, numQuestions })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            setQuizData(data); setView('quiz'); setCurrentQ(0); setScore(0); setAnswers({});
        } catch (err) { setError("Error: " + err.message); } finally { setLoading(false); }
    };

    // 🔥 UPDATED LOGIC: Use 'isOptionCorrect' helper
    const handleAnswer = (opt) => { 
        const correct = quizData[currentQ].correctAnswer; 
        setAnswers({ ...answers, [currentQ]: opt }); 
        if (isOptionCorrect(opt, correct)) setScore(s => s + 1); 
    };
    
    const handleNext = () => { if (currentQ < quizData.length - 1) setCurrentQ(c => c + 1); else setView('result'); };

    return (
        <div className={theme}>
            <div className="min-h-screen w-full bg-slate-100 dark:bg-[#0f172a] text-slate-900 dark:text-white transition-colors duration-500 flex flex-col p-4 md:p-8 relative font-sans">
                {showLoginModal && <LoginModal onLogin={handleLogin} onClose={() => setShowLoginModal(false)} />}
                <div className="absolute top-6 right-6 z-50">
                    <button onClick={toggleTheme} className="p-3 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 hover:scale-110 transition">
                        {theme === 'dark' ? <Icons.Sun /> : <Icons.Moon />}
                    </button>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    {view === 'setup' && (<SetupView user={user} stats={stats} onGenerate={generateQuiz} loading={loading} error={error} progressText={progressText} onLogout={handleLogout} onOpenLogin={() => setShowLoginModal(true)} />)}
                    {view === 'quiz' && (<QuizView quizData={quizData} currentQ={currentQ} answers={answers} onAnswer={handleAnswer} score={score} onNext={handleNext} onQuit={() => setView('setup')} />)}
                    {view === 'result' && (<ResultView score={score} total={quizData.length} user={user} topic={currentTopic} quizData={quizData} userAnswers={answers} saveResult={saveQuizResult} onRetry={() => setView('setup')} onOpenLogin={() => setShowLoginModal(true)} />)}
                </div>
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);