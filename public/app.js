const { useState, useRef, useEffect } = React;

// --- Icons ---
const Icons = {
    Brain: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>,
    Google: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>,
    Sun: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
    Moon: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
    ArrowRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
    Loader: () => <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
    Upload: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    LogOut: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
};

// --- NEW: LOGIN VIEW ---
const LoginView = ({ onLogin }) => {
    return (
        <div className="w-full max-w-md mx-auto fade-in px-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-10 text-center">
                <div className="w-20 h-20 bg-indigo-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Icons.Brain />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8">Sign in to track your progress and manage subjects.</p>
                
                <button onClick={onLogin} className="w-full py-4 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl font-bold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-600 transition flex items-center justify-center gap-3">
                    <Icons.Google /> Sign in with Google
                </button>
            </div>
        </div>
    );
};

// --- 1. DASHBOARD / SETUP VIEW ---
// Merged previous "SetupView" into a Dashboard for now.
// In Phase 2, we will split this into "My Subjects" vs "Create Quiz".
const SetupView = ({ user, onGenerate, loading, error, progressText, onLogout }) => {
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
                
                {/* Header with User Profile */}
                <div className="p-8 border-b border-slate-100 dark:border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        {user.photoURL ? (
                            <img src={user.photoURL} alt="Profile" className="w-12 h-12 rounded-full border-2 border-indigo-500 dark:border-[#10b981]" />
                        ) : (
                            <div className="p-3 rounded-2xl bg-indigo-100 dark:bg-slate-900 text-indigo-600 dark:text-[#00ffc8]"><Icons.Brain /></div>
                        )}
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Hi, {user.displayName || 'Scholar'}</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ready to learn something new?</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={onLogout} className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition flex items-center gap-2">
                            <Icons.LogOut /> Logout
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2">
                    
                    {/* LEFT: Inputs */}
                    <div className="p-8 md:p-10 space-y-8">
                        {/* ... Same Input Logic as before ... */}
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
                             <div className="flex justify-between mb-2"><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Questions: {numQuestions}</label></div>
                            <input type="range" min="3" max="15" value={numQuestions} onChange={(e) => setNumQuestions(parseInt(e.target.value))} />
                        </div>

                        <button onClick={() => onGenerate({ mode, topic, sourceText, difficulty, numQuestions })} disabled={loading} className="w-full py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-[#10b981] dark:hover:bg-[#059669] dark:text-slate-900 shadow-lg transition-all disabled:opacity-50 flex justify-center items-center gap-2">
                            {loading ? <><Icons.Loader /> Generating...</> : "Generate Quiz"}
                        </button>
                        {error && <p className="text-red-500 text-xs text-center font-medium mt-2">{error}</p>}
                    </div>

                    {/* RIGHT: Preview Area */}
                    <div className="hidden md:flex bg-slate-50 dark:bg-slate-900/50 p-10 flex-col justify-center relative overflow-hidden border-l border-slate-200 dark:border-slate-700 transition-colors">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] dark:opacity-[0.1]"></div>
                        <div className="relative z-10 text-center">
                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Your Progress</h3>
                            <p className="text-slate-500 text-sm mb-6">Start a quiz to see analytics here.</p>
                            <div className="h-12 w-full bg-slate-200 dark:bg-slate-700/50 rounded-lg mb-4"></div>
                            <div className="h-12 w-full bg-slate-200 dark:bg-slate-700/50 rounded-lg"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- QUIZ & RESULT VIEW (Same as before, kept brief for brevity) ---
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
                    <div className="space-y-3">{q.options.map((opt, i) => { const isSelected = answers[currentQ] === opt; const isCorrect = opt === q.correctAnswer; let style = "w-full p-5 rounded-xl text-left font-medium border-2 transition-all duration-200 text-sm "; if (answered) { if (isCorrect) style += "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"; else if (isSelected) style += "border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400"; else style += "border-transparent bg-slate-100 dark:bg-slate-700 text-slate-400 opacity-50"; } else { style += "border-transparent bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-500 dark:hover:border-[#10b981] hover:bg-white dark:hover:bg-slate-600"; } return <button key={i} disabled={!!answered} onClick={() => onAnswer(opt)} className={style}>{opt}</button>; })}</div>
                    {answered && (<div className="mt-6 p-4 rounded-xl bg-indigo-50 dark:bg-slate-900 border border-indigo-100 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-sm"><strong className="text-indigo-600 dark:text-[#10b981] block text-xs uppercase mb-1">Insight</strong>{q.explanation}</div>)}
                </div>
                {answered && (<div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end"><button onClick={onNext} className="px-8 py-3 bg-indigo-600 dark:bg-[#10b981] text-white dark:text-slate-900 rounded-xl font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition transform">{currentQ < quizData.length - 1 ? "Next" : "Finish"} <Icons.ArrowRight /></button></div>)}
            </div>
        </div>
    );
};

const ResultView = ({ score, total, onRetry }) => {
    const percentage = Math.round((score / total) * 100);
    return (
        <div className="w-full max-w-md mx-auto text-center fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 shadow-2xl border border-slate-200 dark:border-slate-700 transition-colors duration-300">
                <div className="w-24 h-24 mx-auto bg-indigo-100 dark:bg-[#10b981]/20 rounded-full flex items-center justify-center mb-6"><span className="text-3xl font-black text-indigo-600 dark:text-[#10b981]">{percentage}%</span></div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">{percentage > 70 ? "Outstanding!" : "Good Effort!"}</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8">You scored {score} out of {total}</p>
                <button onClick={onRetry} className="w-full py-4 bg-indigo-600 dark:bg-[#10b981] text-white dark:text-slate-900 rounded-xl font-bold shadow-lg hover:opacity-90 transition">Start New Quiz</button>
            </div>
        </div>
    );
};

// --- MAIN APP WITH AUTH ---
const App = () => {
    const [user, setUser] = useState(null); // User State
    const [authLoading, setAuthLoading] = useState(true);
    const [theme, setTheme] = useState('dark');
    const [view, setView] = useState('setup');
    const [quizData, setQuizData] = useState([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [progressText, setProgressText] = useState('Initializing');

    // 1. Listen for Auth State Changes
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((u) => {
            setUser(u);
            setAuthLoading(false);
        });
        return unsubscribe;
    }, []);

    // 2. Login Function
    const handleLogin = async () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            await auth.signInWithPopup(provider);
        } catch (error) {
            console.error("Login failed", error);
            alert("Login failed: " + error.message);
        }
    };

    // 3. Logout Function
    const handleLogout = () => auth.signOut();

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    // ... (Generate Quiz Logic remains same) ...
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

    const handleAnswer = (opt) => { const correct = quizData[currentQ].correctAnswer; setAnswers({ ...answers, [currentQ]: opt }); if (opt === correct) setScore(s => s + 1); };
    const handleNext = () => { if (currentQ < quizData.length - 1) setCurrentQ(c => c + 1); else setView('result'); };

    // 4. Render
    if (authLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white"><Icons.Loader /></div>;

    return (
        <div className={theme}>
            <div className="min-h-screen w-full bg-slate-100 dark:bg-[#0f172a] text-slate-900 dark:text-white transition-colors duration-500 flex flex-col p-4 md:p-8 relative font-sans">
                <div className="absolute top-6 right-6 z-50">
                    <button onClick={toggleTheme} className="p-3 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 hover:scale-110 transition">
                        {theme === 'dark' ? <Icons.Sun /> : <Icons.Moon />}
                    </button>
                </div>

                <div className="flex-1 flex items-center justify-center">
                    {/* Logic: If not logged in, show LoginView. Else show the App. */}
                    {!user ? (
                        <LoginView onLogin={handleLogin} />
                    ) : (
                        <>
                            {view === 'setup' && <SetupView user={user} onGenerate={generateQuiz} loading={loading} error={error} progressText={progressText} onLogout={handleLogout} />}
                            {view === 'quiz' && <QuizView quizData={quizData} currentQ={currentQ} answers={answers} onAnswer={handleAnswer} score={score} onNext={handleNext} onQuit={() => setView('setup')} />}
                            {view === 'result' && <ResultView score={score} total={quizData.length} onRetry={() => setView('setup')} />}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);