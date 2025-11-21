const { useState, useRef, useEffect } = React;

// --- Icons ---
const Icons = {
    Brain: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>,
    Sun: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
    Moon: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
    ArrowRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
    Loader: () => <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
    Check: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="3" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg>,
    Cross: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="3" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    Upload: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
};

// --- 1. SETUP VIEW (Restored Dashboard Look) ---
const SetupView = ({ onGenerate, loading, error, progressText }) => {
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
        // Basic Text reading logic (expand for PDF if needed)
        const text = await file.text();
        setSourceText(text);
    };

    return (
        <div className="w-full max-w-5xl mx-auto fade-in">
            {/* Dashboard Card */}
            <div className="bg-white dark:bg-[#1e293b] rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors duration-300">
                
                {/* Header Area */}
                <div className="p-8 border-b border-slate-100 dark:border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-indigo-100 dark:bg-[#0f172a] text-indigo-600 dark:text-[#00ffc8] shadow-inner">
                            <Icons.Brain />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">GenQuiz AI</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Neon Edition • 2.5 Pro</p>
                        </div>
                    </div>

                    {/* Difficulty Toggle Pills */}
                    <div className="flex p-1 bg-slate-100 dark:bg-[#0f172a] rounded-xl">
                        {['Easy', 'Medium', 'Hard'].map((d) => (
                            <button
                                key={d}
                                onClick={() => setDifficulty(d)}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                                    difficulty === d 
                                    ? 'bg-white dark:bg-[#10b981] text-slate-800 dark:text-slate-900 shadow-sm' 
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2">
                    
                    {/* LEFT: Controls */}
                    <div className="p-8 md:p-10 space-y-8">
                        
                        {/* Mode Switcher */}
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Select Mode</label>
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setMode('topic')}
                                    className={`flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                                        mode === 'topic' 
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-[#10b981] dark:bg-[#10b981]/10 dark:text-[#10b981]' 
                                        : 'border-slate-200 dark:border-slate-700 bg-transparent text-slate-500 dark:text-slate-400'
                                    }`}
                                >
                                    Topic
                                </button>
                                <button 
                                    onClick={() => setMode('file')}
                                    className={`flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                                        mode === 'file' 
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-[#10b981] dark:bg-[#10b981]/10 dark:text-[#10b981]' 
                                        : 'border-slate-200 dark:border-slate-700 bg-transparent text-slate-500 dark:text-slate-400'
                                    }`}
                                >
                                    File Upload
                                </button>
                            </div>
                        </div>

                        {/* Input Area */}
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">
                                {mode === 'topic' ? 'Enter Topic' : 'Upload Document'}
                            </label>
                            
                            {mode === 'topic' ? (
                                <input
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g. Quantum Mechanics..."
                                    className="w-full p-4 bg-slate-50 dark:bg-[#0f172a] border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-[#10b981] transition-all"
                                />
                            ) : (
                                <div onClick={() => fileRef.current.click()} className="w-full p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group">
                                    <div className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-[#10b981] mb-2 transition"><Icons.Upload /></div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{fileName || "Click to Upload PDF/TXT"}</p>
                                    <input type="file" ref={fileRef} className="hidden" onChange={handleFile} />
                                </div>
                            )}
                        </div>

                        {/* Slider */}
                        <div>
                             <div className="flex justify-between mb-4">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Questions</label>
                                <span className="text-xs font-bold text-indigo-600 dark:text-[#10b981]">{numQuestions}</span>
                             </div>
                            <input type="range" min="3" max="15" value={numQuestions} onChange={(e) => setNumQuestions(parseInt(e.target.value))} />
                        </div>

                        {/* Action Button */}
                        <button 
                            onClick={() => onGenerate({ mode, topic, sourceText, difficulty, numQuestions })}
                            disabled={loading}
                            className="w-full py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-[#10b981] dark:hover:bg-[#059669] dark:text-slate-900 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {loading ? <><Icons.Loader /> Generating...</> : "Generate Quiz"}
                        </button>
                        
                        {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}
                    </div>

                    {/* RIGHT: Preview / Decoration (Matching Image) */}
                    <div className="hidden md:flex bg-slate-50 dark:bg-[#0f172a]/50 p-10 flex-col justify-center relative overflow-hidden border-l border-slate-200 dark:border-slate-700">
                        {/* Decorative skeleton UI to match the "Preview" in the image */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.1]"></div>
                        
                        <div className="relative z-10 opacity-60 dark:opacity-80 space-y-4 select-none pointer-events-none">
                            <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded mb-8"></div>
                            <div className="h-12 w-full bg-slate-200 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-700 rounded-lg"></div>
                            <div className="h-12 w-full bg-indigo-100 dark:bg-[#10b981]/20 border border-indigo-300 dark:border-[#10b981]/50 rounded-lg flex items-center px-4">
                                <div className="h-2 w-2 bg-indigo-500 dark:bg-[#10b981] rounded-full animate-pulse"></div>
                            </div>
                            <div className="h-12 w-full bg-slate-200 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-700 rounded-lg"></div>
                        </div>

                        <div className="relative z-10 mt-10 text-center">
                            <p className="text-xs font-mono text-indigo-400 dark:text-[#10b981] mb-2">
                                {loading ? progressText : "AI MODEL READY"}
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

// --- 2. QUIZ VIEW ---
const QuizView = ({ quizData, currentQ, answers, onAnswer, score, onNext, onQuit }) => {
    const q = quizData[currentQ];
    const answered = answers[currentQ];
    const progress = ((currentQ + 1) / quizData.length) * 100;
    
    return (
        <div className="w-full max-w-2xl mx-auto fade-in">
            <div className="bg-white dark:bg-[#1e293b] rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 w-full">
                    <div className="h-full bg-indigo-500 dark:bg-[#10b981] transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
                
                <div className="p-8 md:p-10">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-[10px] font-bold text-indigo-500 dark:text-[#10b981] bg-indigo-50 dark:bg-[#10b981]/10 px-3 py-1 rounded-full uppercase tracking-widest">
                            Q{currentQ + 1} / {quizData.length}
                        </span>
                        <button onClick={onQuit} className="text-slate-400 hover:text-red-500 text-xs font-bold uppercase tracking-widest">Quit</button>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 leading-snug">{q.question}</h2>
                    
                    <div className="space-y-3">
                        {q.options.map((opt, i) => {
                            const isSelected = answers[currentQ] === opt;
                            const isCorrect = opt === q.correctAnswer;
                            let style = "w-full p-5 rounded-xl text-left font-medium border-2 transition-all duration-200 text-sm ";
                            
                            if (answered) {
                                if (isCorrect) style += "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400";
                                else if (isSelected) style += "border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400";
                                else style += "border-transparent bg-slate-100 dark:bg-slate-800 text-slate-400 opacity-50";
                            } else {
                                style += "border-transparent bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-500 dark:hover:border-[#10b981] hover:bg-white dark:hover:bg-slate-700";
                            }

                            return <button key={i} disabled={!!answered} onClick={() => onAnswer(opt)} className={style}>{opt}</button>;
                        })}
                    </div>

                    {answered && (
                        <div className="mt-6 p-4 rounded-xl bg-indigo-50 dark:bg-[#0f172a] border border-indigo-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm animate-pulse">
                            <strong className="text-indigo-600 dark:text-[#10b981] block text-xs uppercase mb-1">Insight</strong>
                            {q.explanation}
                        </div>
                    )}
                </div>
                
                {answered && (
                    <div className="p-6 bg-slate-50 dark:bg-[#0f172a]/50 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                        <button onClick={onNext} className="px-8 py-3 bg-indigo-600 dark:bg-[#10b981] text-white dark:text-slate-900 rounded-xl font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition transform">
                            {currentQ < quizData.length - 1 ? "Next" : "Finish"} <Icons.ArrowRight />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- 3. RESULT VIEW ---
const ResultView = ({ score, total, onRetry }) => {
    const percentage = Math.round((score / total) * 100);
    
    return (
        <div className="w-full max-w-md mx-auto text-center fade-in">
            <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-10 shadow-2xl border border-slate-200 dark:border-slate-700">
                <div className="w-24 h-24 mx-auto bg-indigo-100 dark:bg-[#10b981]/20 rounded-full flex items-center justify-center mb-6">
                    <span className="text-3xl font-black text-indigo-600 dark:text-[#10b981]">{percentage}%</span>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    {percentage > 70 ? "Outstanding!" : "Good Effort!"}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8">You scored {score} out of {total}</p>
                
                <button onClick={onRetry} className="w-full py-4 bg-indigo-600 dark:bg-[#10b981] text-white dark:text-slate-900 rounded-xl font-bold shadow-lg hover:opacity-90 transition">
                    Start New Quiz
                </button>
            </div>
        </div>
    );
};

// --- MAIN APP WRAPPER ---
const App = () => {
    // Default to dark to match your image request
    const [theme, setTheme] = useState('dark');
    const [view, setView] = useState('setup');
    const [quizData, setQuizData] = useState([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [progressText, setProgressText] = useState('Initializing');

    // Toggle Theme Helper
    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    // Progress Text Animation
    useEffect(() => {
        if (!loading) return;
        const texts = ["Scanning Knowledge Base...", "Formulating Questions...", "Calibrating Difficulty...", "Finalizing Quiz..."];
        let i = 0;
        const interval = setInterval(() => {
            setProgressText(texts[i % texts.length]);
            i++;
        }, 800);
        return () => clearInterval(interval);
    }, [loading]);

    const generateQuiz = async ({ mode, topic, sourceText, difficulty, numQuestions }) => {
        if (mode === 'topic' && !topic) return setError("Please enter a topic");
        if (mode === 'file' && !sourceText) return setError("Please upload a file");
        
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/generate-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    topic: mode === 'topic' ? topic : "File Content",
                    sourceText: mode === 'file' ? sourceText : null,
                    difficulty,
                    numQuestions
                })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            setQuizData(data);
            setView('quiz');
            setCurrentQ(0);
            setScore(0);
            setAnswers({});
        } catch (err) {
            setError("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (opt) => {
        const correct = quizData[currentQ].correctAnswer;
        setAnswers({ ...answers, [currentQ]: opt });
        if (opt === correct) setScore(s => s + 1);
    };

    const handleNext = () => {
        if (currentQ < quizData.length - 1) setCurrentQ(c => c + 1);
        else setView('result');
    };

    return (
        <div className={theme}>
            <div className="min-h-screen w-full bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white transition-colors duration-300 flex flex-col p-4 md:p-8 relative">
                
                {/* Theme Toggle (Top Right) */}
                <div className="absolute top-6 right-6 z-50">
                    <button 
                        onClick={toggleTheme} 
                        className="p-3 rounded-full bg-white dark:bg-[#1e293b] text-slate-600 dark:text-[#00ffc8] shadow-lg hover:scale-110 transition"
                    >
                        {theme === 'dark' ? <Icons.Sun /> : <Icons.Moon />}
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex items-center justify-center">
                    {view === 'setup' && <SetupView onGenerate={generateQuiz} loading={loading} error={error} progressText={progressText} />}
                    
                    {view === 'quiz' && (
                        <QuizView 
                            quizData={quizData} 
                            currentQ={currentQ} 
                            answers={answers} 
                            onAnswer={handleAnswer} 
                            score={score} 
                            onNext={handleNext}
                            onQuit={() => setView('setup')}
                        />
                    )}
                    
                    {view === 'result' && <ResultView score={score} total={quizData.length} onRetry={() => setView('setup')} />}
                </div>
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);