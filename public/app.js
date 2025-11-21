const { useState, useRef, useEffect } = React;

// --- Icons ---
const Icons = {
    Brain: () => <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#00ffc8" strokeWidth="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>,
    ArrowRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
    Trophy: () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
    Loader: () => <svg className="animate-spin text-purple-400" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
    Check: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
    Cross: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
};

// --- 1. SETUP VIEW (New Cyberpunk Design) ---
const SetupView = ({ onGenerate, loading, error, progressText }) => {
    const [mode, setMode] = useState('topic');
    const [topic, setTopic] = useState('');
    const [difficulty, setDifficulty] = useState('Medium');
    const [numQuestions, setNumQuestions] = useState(5);
    const [fileName, setFileName] = useState('');
    const [sourceText, setSourceText] = useState('');
    const fileRef = useRef(null);
    const cardRef = useRef(null);

    // 3D Tilt Effect logic moved here for app.js
    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / 40) * -1;
        const rotateY = (x - centerX) / 40;
        cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleMouseLeave = () => {
        if (cardRef.current) cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
    };

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file.name);
        if (file.type === 'application/pdf') {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                let fullText = "";
                const maxPages = Math.min(pdf.numPages, 15); 
                for (let i = 1; i <= maxPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += textContent.items.map(item => item.str).join(' ') + "\n";
                }
                setSourceText(fullText);
            } catch (err) { alert("Error reading PDF: " + err.message); }
        } else {
            const text = await file.text();
            setSourceText(text);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 bg-[#050505] text-white" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            {/* ✨ Animated neon gradient background + moving neon grid */}
            <div className="absolute inset-0 -z-20 opacity-20 animate-grid-move bg-[radial-gradient(circle,rgba(0,255,200,0.35)_1px,transparent_1px)] [background-size:40px_40px]" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#2a0034] via-[#38002e] to-[#1a001f] animate-pulse-slow opacity-40" />

            {/* 🔵 Floating neon blobs */}
            <div className="absolute -top-20 left-10 w-96 h-96 rounded-full bg-[#ff2ec4] blur-[140px] opacity-50 animate-float-slow" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-[#ff7b00] blur-[180px] opacity-40 animate-float-slower" />

            {/* 🔥 Neon 3D Glass Card */}
            <div ref={cardRef} className="max-w-4xl w-full p-[2px] rounded-3xl bg-gradient-to-r from-purple-500 to-blue-500 shadow-[0_0_40px_rgba(138,43,226,0.6)] relative z-10 tilt-card"> 
                <div className="bg-black/80 backdrop-blur-2xl rounded-3xl p-8 md:p-12 border border-white/10 shadow-[0_0_25px_rgba(0,255,255,0.2)]"> 
                    
                    <div className="text-center mb-10">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shadow-[0_0_15px_rgba(0,255,200,0.3)]">
                                <Icons.Brain />
                            </div>
                        </div>
                        <h1 className="text-5xl font-black text-center drop-shadow-[0_0_10px_rgba(0,255,255,0.7)] tracking-tight text-white">GenQuiz AI</h1>
                        <p className="text-center text-gray-400 mt-2 font-medium tracking-widest text-sm">CYBERPUNK EDITION • 2.5 PRO</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* ◼ Mode Selector Card */}
                        <div className="p-8 rounded-2xl bg-black/40 border border-purple-500/30 shadow-[0_0_20px_rgba(138,43,226,0.15)] flex flex-col justify-between">
                            <div>
                                <h2 className="text-sm font-bold mb-4 text-purple-300 uppercase tracking-wider">Setup Configuration</h2>

                                <div className="flex gap-3 mb-6">
                                    <button onClick={() => setMode('topic')} className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 ${mode==='topic' ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.6)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>Topic</button>
                                    <button onClick={() => setMode('file')} className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 ${mode==='file' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.6)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>File</button>
                                </div>

                                {mode === 'topic' ? (
                                    <input
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder="Enter topic (e.g., Quantum Physics)..."
                                        className="w-full p-4 rounded-xl bg-black/40 border border-purple-500/30 placeholder-purple-300/30 focus:outline-none focus:border-purple-400 focus:shadow-[0_0_10px_rgba(168,85,247,0.3)] text-white transition"
                                    />
                                ) : (
                                    <>
                                        <div onClick={() => fileRef.current.click()} className={`w-full p-8 rounded-xl border-2 border-dashed text-center cursor-pointer transition ${fileName ? 'border-blue-500 bg-blue-500/10 text-blue-300' : 'border-blue-500/30 bg-black/20 text-gray-500 hover:border-blue-400'}`}>
                                            <p className="text-sm font-bold">{fileName || "Click to Upload PDF/TXT"}</p>
                                        </div>
                                        <input type="file" ref={fileRef} className="hidden" accept=".pdf,.txt" onChange={handleFile} />
                                    </>
                                )}
                                
                                <div className="mt-6">
                                    <div className="flex justify-between mb-2 text-xs font-bold text-gray-400 uppercase">
                                        <span>Difficulty</span>
                                        <span className="text-purple-400">{difficulty}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        {['Easy', 'Medium', 'Hard'].map(d => (
                                            <button key={d} onClick={() => setDifficulty(d)} className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${difficulty === d ? 'border-purple-500 bg-purple-500/20 text-white' : 'border-gray-700 bg-transparent text-gray-500'}`}>{d}</button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <div className="flex justify-between mb-2 text-xs font-bold text-gray-400 uppercase">
                                        <span>Questions: {numQuestions}</span>
                                    </div>
                                    <input type="range" min="3" max="15" value={numQuestions} onChange={(e) => setNumQuestions(parseInt(e.target.value))} />
                                </div>
                            </div>

                            {error && <div className="mt-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-xs text-center">{error}</div>}

                            <button 
                                onClick={() => onGenerate({ mode, topic, sourceText, difficulty, numQuestions })}
                                disabled={loading}
                                className="mt-6 w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 shadow-[0_0_20px_rgba(120,80,255,0.4)] font-bold text-white hover:shadow-[0_0_30px_rgba(120,80,255,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {loading ? <><Icons.Loader /> Processing...</> : "GENERATE QUIZ"}
                            </button>
                            
                            {loading && (
                                <div className="mt-3 text-center">
                                    <p className="text-[10px] text-blue-400 font-mono animate-pulse">{progressText}</p>
                                </div>
                            )}
                        </div>

                        {/* ◼ Live Preview Card */}
                        <div className="hidden md:flex p-8 rounded-2xl bg-black/40 border border-blue-500/30 shadow-[0_0_20px_rgba(80,120,255,0.15)] flex-col justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                            <h2 className="text-sm font-bold mb-6 text-blue-300 uppercase tracking-wider z-10">Live Simulation</h2>

                            <div className="p-5 rounded-xl bg-gradient-to-br from-black/60 to-blue-900/20 border border-blue-500/30 shadow-inner backdrop-blur-sm z-10">
                                <p className="font-semibold text-white text-sm mb-4">Q1: {topic ? `Questions about "${topic}" will appear here.` : "AI generated questions will appear here."}</p>

                                <div className="space-y-2 text-xs">
                                    <div className="p-3 rounded-lg bg-black/50 border border-purple-500/20 text-gray-400">A. Plausible Distractor</div>
                                    <div className="p-3 rounded-lg bg-blue-900/30 border border-blue-400/50 text-blue-200 shadow-[0_0_10px_rgba(0,150,255,0.2)] font-bold">B. Correct Answer</div>
                                    <div className="p-3 rounded-lg bg-black/50 border border-purple-500/20 text-gray-400">C. Another Option</div>
                                </div>
                            </div>

                            <div className="mt-6 text-xs text-blue-300/70 p-4 border rounded-xl bg-blue-900/10 border-blue-500/20 z-10">
                                <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> AI Model Active</p>
                                <p className="mt-1 opacity-70">Explanations & theory breakdown included.</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 2. QUIZ VIEW (Dark Mode) ---
const QuizView = ({ quizData, currentQ, answers, onAnswer, score, onNext, onQuit }) => {
    const q = quizData[currentQ];
    const answered = answers[currentQ];
    const progress = ((currentQ + 1) / quizData.length) * 100;
    
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#050505]">
            <div className="max-w-2xl w-full bg-[#0f172a] shadow-2xl rounded-3xl overflow-hidden border border-slate-700 relative z-10">
                {/* Progress Bar */}
                <div className="h-1.5 bg-slate-800 w-full">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 shadow-[0_0_10px_rgba(138,43,226,0.7)]" style={{ width: `${progress}%` }}></div>
                </div>
                
                <div className="p-8 md:p-10">
                    <div className="flex justify-between items-center mb-8">
                        <span className="text-[10px] font-bold text-blue-400 bg-blue-900/20 px-3 py-1 rounded-full uppercase tracking-widest border border-blue-500/20">
                            Question {currentQ + 1} / {quizData.length}
                        </span>
                        <button onClick={onQuit} className="text-slate-500 hover:text-red-400 font-bold text-[10px] uppercase tracking-widest transition">Quit</button>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-8 leading-snug">{q.question}</h2>
                    
                    <div className="space-y-3">
                        {q.options.map((opt, i) => {
                            const isSelected = answers[currentQ] === opt;
                            const isCorrect = opt === q.correctAnswer;
                            let style = "w-full p-5 rounded-xl text-left font-medium border transition-all duration-200 ";
                            
                            if (answered) {
                                if (isCorrect) style += "border-green-500 bg-green-500/10 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]";
                                else if (isSelected) style += "border-red-500 bg-red-500/10 text-red-400";
                                else style += "border-slate-700 bg-slate-800/50 text-slate-500 opacity-50";
                            } else {
                                style += "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-purple-500 hover:bg-purple-500/10 hover:text-white";
                            }

                            return <button key={i} disabled={!!answered} onClick={() => onAnswer(opt)} className={style}>{opt}</button>;
                        })}
                    </div>

                    {answered && (
                        <div className="mt-8 p-5 bg-blue-900/10 text-blue-200 rounded-2xl border border-blue-500/20 text-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <strong className="block text-blue-400 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_5px_blue]"></span> Theory Insight
                            </strong>
                            <p className="leading-relaxed opacity-90">{q.explanation}</p>
                        </div>
                    )}
                </div>
                
                <div className="p-6 bg-slate-900/50 border-t border-slate-800 flex justify-end">
                    {answered && (
                        <button onClick={onNext} className="px-8 py-3 bg-white text-black rounded-xl font-bold shadow-lg hover:bg-gray-200 flex items-center gap-2 transition transform active:scale-95">
                            {currentQ < quizData.length - 1 ? "Next Question" : "Finish Quiz"} <Icons.ArrowRight />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- 3. RESULT VIEW (Dark Mode) ---
const ResultView = ({ score, total, quizData, userAnswers, onRetry }) => {
    const percentage = Math.round((score / total) * 100);
    
    return (
        <div className="min-h-screen bg-[#050505] p-6 text-white">
            <div className="max-w-4xl mx-auto">
                
                {/* Score Card */}
                <div className="bg-[#0f172a] rounded-[2.5rem] p-10 text-center border border-slate-700 shadow-[0_0_50px_rgba(0,0,0,0.5)] mb-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
                    <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-slate-700">
                        <Icons.Trophy />
                    </div>
                    <h2 className="text-7xl font-black text-white mb-2 tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{percentage}%</h2>
                    <p className="text-slate-400 font-medium text-lg mb-8">You scored <span className="text-white font-bold">{score}</span> out of {total}</p>
                    
                    <button onClick={onRetry} className="px-10 py-4 bg-white text-black hover:bg-gray-200 rounded-2xl font-bold shadow-lg transition transform hover:scale-105">
                        Create New Quiz
                    </button>
                </div>

                {/* Analysis */}
                <div className="space-y-6">
                    <h3 className="text-gray-500 font-bold uppercase tracking-widest text-xs text-center mb-8">Performance Breakdown</h3>
                    
                    {quizData.map((q, index) => {
                        const userAns = userAnswers[index];
                        const isCorrect = userAns === q.correctAnswer;
                        
                        return (
                            <div key={index} className={`bg-[#0f172a] rounded-2xl p-6 border ${isCorrect ? 'border-green-500/30' : 'border-red-500/30'}`}>
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {isCorrect ? <Icons.Check /> : <Icons.Cross />}
                                    </div>
                                    <div className="w-full">
                                        <h4 className="text-lg font-bold text-white mb-4">{q.question}</h4>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div className={`p-3 rounded-lg text-sm border ${isCorrect ? 'bg-green-500/10 border-green-500/50 text-green-300' : 'bg-red-500/10 border-red-500/50 text-red-300'}`}>
                                                <span className="block text-[10px] uppercase font-bold opacity-70 mb-1">Your Answer</span>
                                                {userAns}
                                            </div>
                                            {!isCorrect && (
                                                <div className="p-3 rounded-lg text-sm bg-slate-800 border border-slate-700 text-slate-300">
                                                    <span className="block text-[10px] uppercase font-bold opacity-70 mb-1 text-blue-400">Correct Answer</span>
                                                    {q.correctAnswer}
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-2">Deep Dive</span>
                                            <p className="text-sm text-slate-400 leading-relaxed">{q.explanation}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// --- MAIN APP ---
const App = () => {
    const [view, setView] = useState('setup');
    const [quizData, setQuizData] = useState([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [progressText, setProgressText] = useState('Initializing');

    // Fake progress steps for UI effect
    useEffect(() => {
        if (!loading) return;
        const texts = ["INITIALIZING AI...", "SCANNING KNOWLEDGE BASE...", "GENERATING QUESTIONS...", "FINALIZING QUIZ..."];
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
        <React.Fragment>
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
            {view === 'result' && <ResultView score={score} total={quizData.length} quizData={quizData} userAnswers={answers} onRetry={() => setView('setup')} />}
        </React.Fragment>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);