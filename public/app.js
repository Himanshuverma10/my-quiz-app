const { useState, useRef, useEffect } = React;

// --- Minimal Icons (Stroke styles updated) ---
const Icons = {
    Brain: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-600"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>,
    ArrowRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
    Loader: () => <svg className="animate-spin text-indigo-600" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
    Check: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    Cross: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    Upload: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
};

// --- 1. SETUP VIEW (Clean Minimalist) ---
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
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f8fafc]">
            
            {/* Main Card */}
            <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10 fade-in"> 
                
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-xl mb-4">
                        <Icons.Brain />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">GenQuiz AI</h1>
                    <p className="text-slate-500 mt-2 text-sm">Generate quizzes from any topic or file in seconds.</p>
                </div>

                {/* Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
                    <button onClick={() => setMode('topic')} className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${mode==='topic' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Topic</button>
                    <button onClick={() => setMode('file')} className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${mode==='file' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Upload File</button>
                </div>

                {/* Inputs */}
                <div className="space-y-6">
                    {mode === 'topic' ? (
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">What should we quiz you on?</label>
                            <input
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g. Quantum Physics, History of Rome..."
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                            />
                        </div>
                    ) : (
                        <div>
                             <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Source Material</label>
                            <div onClick={() => fileRef.current.click()} className={`w-full p-8 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition hover:bg-slate-50 ${fileName ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200'}`}>
                                <div className="mb-2 text-slate-400"><Icons.Upload /></div>
                                <p className="text-sm font-medium text-slate-600">{fileName || "Drop PDF or TXT here"}</p>
                            </div>
                            <input type="file" ref={fileRef} className="hidden" accept=".pdf,.txt" onChange={handleFile} />
                        </div>
                    )}
                    
                    {/* Controls Row */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Difficulty</label>
                            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-indigo-500">
                                <option>Easy</option>
                                <option>Medium</option>
                                <option>Hard</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Questions: {numQuestions}</label>
                            <input type="range" min="3" max="15" value={numQuestions} onChange={(e) => setNumQuestions(parseInt(e.target.value))} className="mt-3" />
                        </div>
                    </div>
                </div>

                {error && <div className="mt-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm text-center border border-red-100">{error}</div>}

                <button 
                    onClick={() => onGenerate({ mode, topic, sourceText, difficulty, numQuestions })}
                    disabled={loading}
                    className="mt-8 w-full py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg shadow-slate-200 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                >
                    {loading ? <><Icons.Loader /> Generating...</> : "Start Quiz"}
                </button>
                
                {loading && (
                    <p className="mt-4 text-center text-xs text-slate-400 animate-pulse">{progressText}</p>
                )}
            </div>
        </div>
    );
};

// --- 2. QUIZ VIEW (Clean Card) ---
const QuizView = ({ quizData, currentQ, answers, onAnswer, score, onNext, onQuit }) => {
    const q = quizData[currentQ];
    const answered = answers[currentQ];
    const progress = ((currentQ + 1) / quizData.length) * 100;
    
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#f8fafc]">
            <div className="max-w-2xl w-full bg-white shadow-xl shadow-slate-200/60 rounded-2xl overflow-hidden border border-slate-100 fade-in">
                
                {/* Progress Line */}
                <div className="h-1 bg-slate-100 w-full">
                    <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
                
                <div className="p-8 md:p-12">
                    <div className="flex justify-between items-center mb-8">
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
                            Question {currentQ + 1} / {quizData.length}
                        </span>
                        <button onClick={onQuit} className="text-slate-400 hover:text-red-500 text-xs font-bold uppercase tracking-widest transition">Exit</button>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 leading-snug">{q.question}</h2>
                    
                    <div className="space-y-3">
                        {q.options.map((opt, i) => {
                            const isSelected = answers[currentQ] === opt;
                            const isCorrect = opt === q.correctAnswer;
                            let style = "w-full p-4 md:p-5 rounded-xl text-left font-medium border transition-all duration-200 text-sm md:text-base ";
                            
                            if (answered) {
                                if (isCorrect) style += "border-green-500 bg-green-50 text-green-700";
                                else if (isSelected) style += "border-red-500 bg-red-50 text-red-700";
                                else style += "border-slate-100 text-slate-400 opacity-60";
                            } else {
                                style += "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700";
                            }

                            return <button key={i} disabled={!!answered} onClick={() => onAnswer(opt)} className={style}>{opt}</button>;
                        })}
                    </div>

                    {answered && (
                        <div className="mt-8 p-5 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 text-sm leading-relaxed fade-in">
                            <strong className="block text-slate-800 text-xs uppercase tracking-wide mb-2">Explanation</strong>
                            {q.explanation}
                        </div>
                    )}
                </div>
                
                {answered && (
                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <button onClick={onNext} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 flex items-center gap-2 transition">
                            {currentQ < quizData.length - 1 ? "Next Question" : "See Results"} <Icons.ArrowRight />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- 3. RESULT VIEW (Clean Dashboard) ---
const ResultView = ({ score, total, quizData, userAnswers, onRetry }) => {
    const percentage = Math.round((score / total) * 100);
    let message = "Keep Practicing!";
    if (percentage > 80) message = "Excellent Work!";
    else if (percentage > 50) message = "Good Effort!";
    
    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 flex justify-center">
            <div className="max-w-3xl w-full fade-in">
                
                {/* Score Card */}
                <div className="bg-white rounded-2xl p-10 text-center shadow-lg shadow-slate-200/50 border border-slate-100 mb-8">
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-4">{message}</p>
                    <h2 className="text-6xl font-black text-slate-900 mb-2">{percentage}%</h2>
                    <p className="text-slate-500 font-medium mb-8">You scored {score} out of {total}</p>
                    
                    <button onClick={onRetry} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md transition">
                        Create New Quiz
                    </button>
                </div>

                {/* Analysis */}
                <div className="space-y-4">
                    <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs ml-2 mb-4">Review Answers</h3>
                    
                    {quizData.map((q, index) => {
                        const userAns = userAnswers[index];
                        const isCorrect = userAns === q.correctAnswer;
                        
                        return (
                            <div key={index} className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {isCorrect ? <Icons.Check /> : <Icons.Cross />}
                                    </div>
                                    <div className="w-full">
                                        <h4 className="text-lg font-bold text-slate-800 mb-3">{q.question}</h4>
                                        
                                        <div className="flex flex-wrap gap-3 mb-4 text-sm">
                                            <div className={`px-3 py-2 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                                                <span className="font-bold text-xs opacity-70 block">YOUR ANSWER</span> {userAns}
                                            </div>
                                            {!isCorrect && (
                                                <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                                                    <span className="font-bold text-xs opacity-70 block">CORRECT ANSWER</span> {q.correctAnswer}
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-sm text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                                            <span className="font-bold text-slate-700 mr-1">Note:</span>
                                            {q.explanation}
                                        </p>
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

    useEffect(() => {
        if (!loading) return;
        const texts = ["Processing Request...", "Consulting AI Model...", "Drafting Questions...", "Finalizing Quiz..."];
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