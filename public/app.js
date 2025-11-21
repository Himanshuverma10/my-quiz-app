const { useState, useRef, useEffect } = React;

// 🔥 Auth & DB Variables
const auth = window.auth;
const db = window.db;

// Helper: Check if option is correct
const isOptionCorrect = (option, correctKey) => {
    if (!option || !correctKey) return false;
    const cleanOpt = option.trim();
    const cleanKey = correctKey.trim();
    if (cleanOpt === cleanKey) return true;
    if (cleanOpt.startsWith(cleanKey + ")") || cleanOpt.startsWith(cleanKey + ".")) return true;
    return false;
};

// --- Icons ---
const Icons = {
    Brain: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>,
    Google: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>,
    Sun: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
    Moon: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
    ArrowRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
    Loader: () => <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
    Upload: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    LogOut: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    Lock: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    Check: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
    Cross: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    Plus: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    Book: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    CheckCircle: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    Play: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
    ArrowLeft: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
    Zap: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
};

// --- ADD SUBJECT MODAL ---
const AddSubjectModal = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [syllabus, setSyllabus] = useState('');
    const [parsing, setParsing] = useState(false);

    const handleSubmit = async () => {
        if (!name || !syllabus) return alert("Please fill all fields");
        setParsing(true);
        try {
            const response = await fetch('/api/parse-syllabus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ syllabusText: syllabus })
            });
            const data = await response.json();
            if(data.error) throw new Error(data.error);
            onSave(name, data.topics);
        } catch (err) {
            alert("Error parsing syllabus: " + err.message);
            setParsing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm fade-in p-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Add New Subject</h2>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Subject Name</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 mb-4" placeholder="e.g. Physics" />
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Paste Syllabus</label>
                <textarea value={syllabus} onChange={e => setSyllabus(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 mb-6 h-32" placeholder="Unit 1: Motion, Unit 2: Force..." />
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">Cancel</button>
                    <button onClick={handleSubmit} disabled={parsing} className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 flex justify-center items-center gap-2">
                        {parsing ? <Icons.Loader /> : "Create Subject"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- LOGIN MODAL ---
const LoginModal = ({ onLogin, onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm fade-in p-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8 max-w-md w-full text-center relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-red-500">✕</button>
            <div className="w-16 h-16 bg-indigo-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6"><Icons.Brain /></div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Login Required</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Sign in to save subjects, track syllabus, and keep your history.</p>
            <button onClick={onLogin} className="w-full py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl font-bold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-600 transition flex items-center justify-center gap-3 shadow-sm">
                <Icons.Google /> Sign in with Google
            </button>
        </div>
    </div>
);

// --- TAB 1: QUICK GENERATOR (Open for All) ---
const QuickGenerator = ({ onGenerate, loading, error, progressText }) => {
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
                                    <button key={d} onClick={() => setDifficulty(d)} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${difficulty === d ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-[#10b981] dark:border-[#10b981] dark:text-slate-900' : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-slate-500'}`}>{d}</button>
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
                            {loading && <div className="mt-3 text-center"><p className="text-xs text-indigo-600 dark:text-[#10b981] font-mono animate-pulse">{progressText}</p></div>}
                            {error && <p className="text-red-500 text-xs text-center font-medium mt-2">{error}</p>}
                        </div>
                    </div>

                    <div className="hidden md:flex bg-slate-50 dark:bg-slate-900/50 p-10 flex-col justify-center items-center relative overflow-hidden border-l border-slate-200 dark:border-slate-700">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] dark:opacity-[0.1]"></div>
                        <div className="relative z-10 text-center max-w-xs">
                            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600 dark:text-indigo-400"><Icons.Brain /></div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">AI-Powered Learning</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Generate quizzes instantly from any topic or document. Login to save your progress.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- TAB 2: SUBJECT DASHBOARD (Users Only) ---
const SubjectDashboard = ({ user, subjects, onSelectSubject, onAddSubject, onOpenLogin }) => {
    if (!user) {
        return (
            <div className="w-full max-w-2xl mx-auto text-center py-20 fade-in">
                <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6"><Icons.Lock /></div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Dashboard Locked</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">The Syllabus Tracker is an advanced feature. Please login to manage subjects and track your learning progress.</p>
                <button onClick={onOpenLogin} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition">Login to Unlock</button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto fade-in p-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Subjects</h1>
                <button onClick={onAddSubject} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg transition transform hover:scale-105">
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
                        <div key={sub.id} onClick={() => onSelectSubject(sub)} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-indigo-500 dark:hover:border-[#10b981] transition group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition"><Icons.Book /></div>
                                <span className="text-xs font-bold text-slate-400">{sub.totalTopics} Topics</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{sub.name}</h3>
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 dark:bg-[#10b981]" style={{ width: `${(sub.completed / sub.totalTopics) * 100}%` }}></div>
                            </div>
                            <p className="text-xs text-slate-400 mt-2 text-right">{sub.completed} / {sub.totalTopics} Done</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const SubjectDetail = ({ subject, topics, onBack, onStartTopic }) => (
    <div className="w-full max-w-4xl mx-auto fade-in p-4">
        <button onClick={onBack} className="mb-6 text-slate-500 hover:text-indigo-500 flex items-center gap-2 font-bold text-sm"><Icons.ArrowLeft /> Back to Dashboard</button>
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-700 mb-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{subject.name}</h1>
            <p className="text-slate-500 dark:text-slate-400">Select a topic to start a quiz.</p>
        </div>
        <div className="space-y-3">
            {topics.map((topic, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition">
                    <div className="flex items-center gap-4">
                        <span className="text-slate-300 font-mono font-bold text-sm">{(index + 1).toString().padStart(2, '0')}</span>
                        <h4 className={`font-bold ${topic.completed ? 'text-green-600 dark:text-green-400 line-through opacity-70' : 'text-slate-800 dark:text-slate-200'}`}>{topic.name}</h4>
                    </div>
                    {topic.completed ? (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-bold bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-lg"><Icons.CheckCircle /> Score: {topic.score}%</div>
                    ) : (
                        <button onClick={() => onStartTopic(topic.name)} className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg font-bold text-sm hover:bg-indigo-600 hover:text-white transition flex items-center gap-2"><Icons.Play /> Start Quiz</button>
                    )}
                </div>
            ))}
        </div>
    </div>
);

// --- REUSABLE QUIZ & RESULT VIEWS ---
const QuizView = ({ quizData, currentQ, answers, onAnswer, onNext, onQuit }) => {
    const q = quizData[currentQ];
    const answered = answers[currentQ];
    const progress = ((currentQ + 1) / quizData.length) * 100;
    return (
        <div className="w-full max-w-2xl mx-auto fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                 <div className="h-1.5 bg-slate-100 dark:bg-slate-900 w-full"><div className="h-full bg-indigo-500 dark:bg-[#10b981] transition-all duration-500" style={{ width: `${progress}%` }}></div></div>
                <div className="p-8 md:p-10">
                    <div className="flex justify-between items-center mb-6"><span className="text-[10px] font-bold text-indigo-500 dark:text-[#10b981] bg-indigo-50 dark:bg-[#10b981]/10 px-3 py-1 rounded-full uppercase tracking-widest">Q{currentQ + 1} / {quizData.length}</span><button onClick={onQuit} className="text-slate-400 hover:text-red-500 text-xs font-bold uppercase tracking-widest">Quit</button></div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 leading-snug">{q.question}</h2>
                    <div className="space-y-3">
                        {q.options.map((opt, i) => {
                            const isSel = answers[currentQ] === opt;
                            const isRight = isOptionCorrect(opt, q.correctAnswer);
                            let cls = "w-full p-5 rounded-xl text-left font-medium border-2 transition-all duration-200 text-sm ";
                            if (answered) {
                                if (isRight) cls += "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400";
                                else if (isSel) cls += "border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400";
                                else cls += "border-transparent bg-slate-100 dark:bg-slate-700 text-slate-400 opacity-50";
                            } else cls += "border-transparent bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-500 dark:hover:border-[#10b981] hover:bg-white dark:hover:bg-slate-600";
                            return <button key={i} disabled={!!answered} onClick={() => onAnswer(opt)} className={cls}>{opt}</button>;
                        })}
                    </div>
                    {answered && <div className="mt-6 p-4 rounded-xl bg-indigo-50 dark:bg-slate-900 border border-indigo-100 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-sm"><strong className="text-indigo-600 dark:text-[#10b981] block text-xs uppercase mb-1">Insight</strong>{q.explanation}</div>}
                </div>
                {answered && <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end"><button onClick={onNext} className="px-8 py-3 bg-indigo-600 dark:bg-[#10b981] text-white dark:text-slate-900 rounded-xl font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition transform">{currentQ < quizData.length - 1 ? "Next" : "Finish"} <Icons.ArrowRight /></button></div>}
            </div>
        </div>
    );
};

const ResultView = ({ score, total, user, quizData, userAnswers, onRetry, onOpenLogin }) => {
    const percentage = Math.round((score / total) * 100);
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
                    ) : (<div className="text-xs text-green-500 font-bold uppercase tracking-widest mt-4">✓ Result Saved</div>)}
                </div>
            </div>
            <div className="text-left space-y-6">
                <h3 className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs text-center mb-6">Detailed Analysis</h3>
                {quizData.map((q, index) => {
                    const userAns = userAnswers[index];
                    const isCorrect = isOptionCorrect(userAns, q.correctAnswer);
                    return (
                        <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isCorrect ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>{isCorrect ? <Icons.Check /> : <Icons.Cross />}</div>
                                <div className="w-full">
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{q.question}</h4>
                                    <div className="bg-indigo-50 dark:bg-slate-900/50 p-4 rounded-xl border border-indigo-100 dark:border-slate-700">
                                        <span className="text-[10px] font-bold text-indigo-600 dark:text-[#10b981] uppercase tracking-wider block mb-2">Theory</span>
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
    const [theme, setTheme] = useState('dark');
    const [activeTab, setActiveTab] = useState('generator'); // 'generator', 'subjects'
    const [view, setView] = useState('home'); // 'home', 'subject-detail', 'quiz', 'result'
    
    // Data State
    const [subjects, setSubjects] = useState([]);
    const [activeSubject, setActiveSubject] = useState(null);
    const [activeTopics, setActiveTopics] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Quiz State
    const [quizData, setQuizData] = useState([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [progressText, setProgressText] = useState('');
    const [currentTopicName, setCurrentTopicName] = useState('');
    
    // Auth Listener
    useEffect(() => {
        if(!auth) return;
        auth.onAuthStateChanged((u) => {
            setUser(u);
            if(u) { setShowLoginModal(false); fetchSubjects(u.uid); }
        });
    }, []);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    const handleLogin = async () => { const provider = new firebase.auth.GoogleAuthProvider(); try { await auth.signInWithPopup(provider); } catch (e) { alert(e.message); } };
    const handleLogout = () => { auth.signOut(); setSubjects([]); setActiveTab('generator'); };

    // Firestore Logic
    const fetchSubjects = async (uid) => {
        const snap = await db.collection('users').doc(uid).collection('subjects').get();
        setSubjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const handleCreateSubject = async (name, topicsList) => {
        setShowAddModal(false);
        if(!user) return;
        const subRef = await db.collection('users').doc(user.uid).collection('subjects').add({ name: name, totalTopics: topicsList.length, completed: 0, createdAt: new Date() });
        const batch = db.batch();
        topicsList.forEach(topicName => { const ref = subRef.collection('topics').doc(); batch.set(ref, { name: topicName, completed: false, score: 0 }); });
        await batch.commit();
        fetchSubjects(user.uid);
    };

    const handleSelectSubject = async (sub) => {
        setActiveSubject(sub);
        const snap = await db.collection('users').doc(user.uid).collection('subjects').doc(sub.id).collection('topics').get();
        setActiveTopics(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setView('subject-detail');
    };

    const handleTopicComplete = async (score, total) => {
        if (!user || !activeSubject) return;
        const percentage = Math.round((score/total)*100);
        const topicObj = activeTopics.find(t => t.name === currentTopicName);
        if(topicObj) {
             await db.collection('users').doc(user.uid).collection('subjects').doc(activeSubject.id).collection('topics').doc(topicObj.id).update({ completed: true, score: percentage });
             const newCompleted = activeSubject.completed + (topicObj.completed ? 0 : 1);
             await db.collection('users').doc(user.uid).collection('subjects').doc(activeSubject.id).update({ completed: newCompleted });
             fetchSubjects(user.uid);
        }
    };

    // Quiz Logic
    useEffect(() => { if (!loading) return; const texts = ["Scanning Knowledge Base...", "Formulating Questions...", "Finalizing Quiz..."]; let i = 0; const interval = setInterval(() => { setProgressText(texts[i % texts.length]); i++; }, 800); return () => clearInterval(interval); }, [loading]);

    const generateQuiz = async ({ mode, topic, sourceText, difficulty, numQuestions }) => {
        setLoading(true); setError(''); setCurrentTopicName(mode === 'topic' ? topic : "Uploaded File");
        try {
            const response = await fetch('/api/generate-quiz', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: mode === 'topic' ? topic : "File", sourceText: mode === 'file' ? sourceText : null, difficulty, numQuestions })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            setQuizData(data); setCurrentQ(0); setScore(0); setAnswers({}); setView('quiz');
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    };

    // Main Render
    return (
        <div className={theme}>
            <div className="min-h-screen bg-slate-100 dark:bg-[#0f172a] text-slate-900 dark:text-white transition-colors duration-300 font-sans relative flex flex-col">
                
                {/* Header / Nav */}
                <div className="px-6 py-4 flex justify-between items-center bg-white dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 dark:border-slate-700">
                     <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2 font-bold text-xl tracking-tight"><span className="text-indigo-600 dark:text-[#00ffc8]"><Icons.Brain /></span> GenQuiz AI</div>
                        <div className="hidden md:flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                            <button onClick={() => { setActiveTab('generator'); setView('home'); }} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'generator' ? 'bg-white dark:bg-[#00ffc8] text-slate-900 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>Quick Quiz</button>
                            <button onClick={() => { setActiveTab('subjects'); setView('home'); }} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'subjects' ? 'bg-white dark:bg-[#00ffc8] text-slate-900 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>My Subjects</button>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition">{theme === 'dark' ? <Icons.Sun /> : <Icons.Moon />}</button>
                        {user ? (
                            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                                <img src={user.photoURL} className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600" />
                                <button onClick={handleLogout} className="text-xs font-bold text-red-500 hover:text-red-600">Logout</button>
                            </div>
                        ) : (
                            <button onClick={() => setShowLoginModal(true)} className="text-sm font-bold text-indigo-600 dark:text-[#00ffc8] hover:underline">Login</button>
                        )}
                     </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 md:p-8 flex flex-col items-center">
                    {showAddModal && <AddSubjectModal onClose={() => setShowAddModal(false)} onSave={handleCreateSubject} />}
                    {showLoginModal && <LoginModal onLogin={handleLogin} onClose={() => setShowLoginModal(false)} />}

                    {view === 'home' && (
                        activeTab === 'generator' ? (
                            <QuickGenerator onGenerate={generateQuiz} loading={loading} error={error} progressText={progressText} />
                        ) : (
                            <SubjectDashboard user={user} subjects={subjects} onSelectSubject={handleSelectSubject} onAddSubject={() => setShowAddModal(true)} onOpenLogin={() => setShowLoginModal(true)} />
                        )
                    )}

                    {view === 'subject-detail' && <SubjectDetail subject={activeSubject} topics={activeTopics} onBack={() => setView('home')} onStartTopic={generateQuiz} />}
                    
                    {view === 'quiz' && (
                         <QuizView quizData={quizData} currentQ={currentQ} answers={answers} 
                            onAnswer={(opt) => {
                                const correct = quizData[currentQ].correctAnswer;
                                setAnswers({...answers, [currentQ]: opt});
                                if(isOptionCorrect(opt, correct)) setScore(s => s+1);
                            }}
                            onNext={() => {
                                if(currentQ < quizData.length -1) setCurrentQ(c => c+1);
                                else {
                                    if(user && activeSubject) handleTopicComplete(score + (isOptionCorrect(answers[currentQ], quizData[currentQ].correctAnswer)?1:0), quizData.length);
                                    setView('result');
                                }
                            }}
                            onQuit={() => setView(activeSubject ? 'subject-detail' : 'home')}
                         />
                    )}

                    {view === 'result' && (
                        <ResultView score={score} total={quizData.length} user={user} quizData={quizData} userAnswers={answers}
                            onRetry={() => setView(activeSubject ? 'subject-detail' : 'home')}
                            onOpenLogin={() => setShowLoginModal(true)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);