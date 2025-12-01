const { useState, useEffect, useCallback } = React;

// Connect to Global Window Objects (Loaded from js/ folder)
const { LoginModal, EditSubjectModal, AddSubjectModal, Toast } = window;
const { ProfileDashboard, QuickGenerator, SubjectDashboard, HistoryDashboard, LearnDashboard } = window;
const { QuizView, ResultView } = window;
const Icons = window.Icons;
const auth = window.auth;
const db = window.db;

const App = () => {
    // --- STATE MANAGEMENT ---
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState('dark');
    const [activeTab, setActiveTab] = useState('generator'); 
    const [view, setView] = useState('home');
    
    // Data & Modals
    const [subjects, setSubjects] = useState([]);
    const [activeSubject, setActiveSubject] = useState(null);
    const [activeTopics, setActiveTopics] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [learnInitData, setLearnInitData] = useState(null);
    
    // Quiz Data
    const [quizData, setQuizData] = useState([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [progressText, setProgressText] = useState('');
    const [currentTopicName, setCurrentTopicName] = useState('');
    
    // Notifications
    const [toast, setToast] = useState(null);
    const showToast = (msg, type='success') => setToast({ message: msg, type });

    // --- AUTH & INIT ---
    useEffect(() => {
        if(!auth) return;
        const unsubscribe = auth.onAuthStateChanged((u) => {
            setUser(u);
            if(u) {
                setShowLoginModal(false);
                fetchSubjects(u.uid);
                trackSession(u.uid);
            }
        });
        return unsubscribe;
    }, []);
    
    const trackSession = async (uid) => {
        let deviceId = localStorage.getItem('did');
        if (!deviceId) {
            deviceId = Math.random().toString(36).substring(2);
            localStorage.setItem('did', deviceId);
        }
        await db.collection('users').doc(uid).collection('sessions').doc(deviceId).set({
            deviceId, ua: navigator.userAgent, lastSeen: new Date()
        }, { merge: true });
    };

    // --- ACTIONS ---
    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    
    const handleLogin = async () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        try { await auth.signInWithPopup(provider); } 
        catch (e) { showToast(e.message, "error"); }
    };

    const handleLogout = () => {
        auth.signOut();
        setSubjects([]);
        setActiveTab('generator');
        showToast("Logged out", "success");
    };

    const fetchSubjects = async (uid) => {
        const snap = await db.collection('users').doc(uid).collection('subjects').get();
        setSubjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    // --- CRUD LOGIC (Create, Read, Update, Delete) ---
    const handleCreateSubject = async (name, topicsList, usage) => {
        setShowAddModal(false);
        if(!user) return;
        
        const subRef = await db.collection('users').doc(user.uid).collection('subjects').add({
            name: name, totalTopics: topicsList.length, completed: 0, createdAt: new Date() 
        });

        if(usage) {
             await db.collection('users').doc(user.uid).set({ 
                 tokenUsage: firebase.firestore.FieldValue.increment(usage.totalTokenCount || 0) 
             }, { merge: true });
        }

        const batch = db.batch();
        topicsList.forEach(unitObj => {
            unitObj.topics.forEach(topicName => {
                const ref = subRef.collection('topics').doc();
                batch.set(ref, { name: topicName, unit: unitObj.unit, completed: false, learned: false, score: 0 });
            });
        });
        
        await subRef.update({ totalTopics: topicsList.reduce((acc, u) => acc + u.topics.length, 0) });
        await batch.commit();
        fetchSubjects(user.uid);
        showToast("Subject created!", "success");
    };

    const handleDeleteSubject = async (id) => {
        if(!confirm("Delete this subject?")) return;
        // Client-side delete simulation for subcollections
        const topicsSnap = await db.collection('users').doc(user.uid).collection('subjects').doc(id).collection('topics').get();
        const batch = db.batch();
        topicsSnap.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        
        await db.collection('users').doc(user.uid).collection('subjects').doc(id).delete();
        fetchSubjects(user.uid);
        showToast("Subject deleted", "success");
    };

    const handleSelectSubject = async (sub) => {
        setActiveSubject(sub);
        const snap = await db.collection('users').doc(user.uid).collection('subjects').doc(sub.id).collection('topics').get();
        setActiveTopics(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setView('subject-detail');
    };

    // --- QUIZ & LEARN LOGIC ---
    const saveQuizResult = async (s, t) => {
        if (!user) return;
        try {
            await db.collection('users').doc(user.uid).collection('history').add({ 
                topic: currentTopicName || "Unknown", score: s, total: t, date: new Date(), 
                type: 'quiz', quizData: quizData, userAnswers: answers 
            });

            const tokenUsage = quizData.usage || { totalTokenCount: 0 };
            await db.collection('users').doc(user.uid).set({
                tokenUsage: firebase.firestore.FieldValue.increment(tokenUsage.totalTokenCount || 0),
                stats: { totalQuizzes: firebase.firestore.FieldValue.increment(1), avgScore: 0 } 
            }, { merge: true });
        } catch (err) { console.error(err); }
    };

    const handleTopicComplete = async (score, total) => {
        if (!user || !activeSubject) return;
        const percentage = Math.round((score/total)*100);
        const topicObj = activeTopics.find(t => t.name === currentTopicName);
        
        if(topicObj) {
             await db.collection('users').doc(user.uid).collection('subjects').doc(activeSubject.id).collection('topics').doc(topicObj.id).update({ completed: true, score: percentage });
             // Simple progress tick (Ideally recalculate fully)
             const newCompleted = activeSubject.completed + (topicObj.completed ? 0 : 1);
             await db.collection('users').doc(user.uid).collection('subjects').doc(activeSubject.id).update({ completed: newCompleted });
             fetchSubjects(user.uid);
        }
        saveQuizResult(score, total); 
    };

    const handleSelectHistory = (item) => {
        if(!item.quizData) return showToast("Data unavailable", "error");
        setQuizData(item.quizData); setAnswers(item.userAnswers); setScore(item.score); setView('history-review'); 
    };

    const handleLearnTopic = async (topicName, subjectName, topicId) => {
        if(user) {
             await db.collection('users').doc(user.uid).collection('history').add({ type: 'learn', topic: topicName, subject: subjectName, date: new Date() });
        }
        if(topicId && activeSubject) {
            await db.collection('users').doc(user.uid).collection('subjects').doc(activeSubject.id).collection('topics').doc(topicId).update({ learned: true });
            setActiveTopics(prev => prev.map(t => t.id === topicId ? { ...t, learned: true } : t));
        }
        setLearnInitData({ topic: topicName, subject: subjectName });
        setActiveTab('learn'); setView('home');
    };

    // AI Generation
    const generateQuiz = async ({ mode, topic, sourceText, difficulty, numQuestions }) => {
        setLoading(true); setError(''); setCurrentTopicName(mode === 'topic' ? topic : "File Upload");
        try {
            const response = await fetch('/api/generate-quiz', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: mode === 'topic' ? topic : "File", sourceText: mode === 'file' ? sourceText : null, difficulty, numQuestions })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            
            const qData = data.quiz;
            qData.usage = data.usage; 
            setQuizData(qData); setCurrentQ(0); setScore(0); setAnswers({}); setView('quiz');
        } catch (err) { setError(err.message); showToast(err.message, "error"); } finally { setLoading(false); }
    };

    // Progress Text Animation
    useEffect(() => { 
        if (!loading) return; 
        const texts = ["Reading Content...", "Analyzing Logic...", "Drafting Questions...", "Finalizing..."]; 
        let i = 0; const interval = setInterval(() => { setProgressText(texts[i % texts.length]); i++; }, 800); 
        return () => clearInterval(interval); 
    }, [loading]);

    return (
        <div className={theme}>
            <div className="min-h-screen bg-slate-100 dark:bg-[#0f172a] text-slate-900 dark:text-white transition-colors duration-300 font-sans relative flex flex-col">
                
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

                {/* HEADER & NAV */}
                <div className="px-6 py-4 flex justify-between items-center bg-white dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 dark:border-slate-700 shadow-sm">
                     <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2 font-bold text-xl tracking-tight cursor-pointer" onClick={() => { setActiveTab('generator'); setView('home'); }}>
                            <span className="text-indigo-600 dark:text-[#00ffc8]"><Icons.Brain /></span> GenQuiz AI
                        </div>
                        <div className="hidden md:flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                            {['generator', 'subjects', 'history', 'learn'].map(tab => (
                                <button key={tab} onClick={() => { setActiveTab(tab); setView('home'); }} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all active:scale-95 capitalize ${activeTab === tab ? 'bg-white dark:bg-[#00ffc8] text-slate-900 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-500'}`}>
                                    {tab === 'generator' ? 'Quick Quiz' : tab}
                                </button>
                            ))}
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition active:rotate-12">{theme === 'dark' ? <Icons.Sun /> : <Icons.Moon />}</button>
                        {user ? (
                            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                                <button onClick={() => { setActiveTab('profile'); setView('home'); }} className="relative group"><img src={user.photoURL} className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600 transition-transform group-hover:scale-110" /></button>
                                <button onClick={handleLogout} className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition active:scale-95"><Icons.LogOut /></button>
                            </div>
                        ) : (
                            <button onClick={() => setShowLoginModal(true)} className="text-sm font-bold text-indigo-600 dark:text-[#00ffc8] hover:underline">Login</button>
                        )}
                     </div>
                </div>

                {/* MOBILE BOTTOM TABS */}
                <div className="md:hidden px-4 py-3 bg-white dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-700 sticky top-[73px] z-30 flex gap-2 justify-center shadow-sm overflow-x-auto no-scrollbar">
                     {['generator', 'subjects', 'history', 'learn'].map(tab => (
                        <button key={tab} onClick={() => { setActiveTab(tab); setView('home'); }} className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 capitalize ${activeTab === tab ? 'bg-indigo-100 dark:bg-[#00ffc8]/10 text-indigo-600 dark:text-[#00ffc8] ring-1 ring-indigo-500 dark:ring-[#00ffc8]' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                            {tab === 'generator' ? 'Quick Quiz' : tab}
                        </button>
                     ))}
                </div>

                {/* MAIN CONTENT RENDERING */}
                <div className="flex-1 p-4 md:p-8 flex flex-col items-center w-full max-w-7xl mx-auto">
                    
                    {/* Global Modals */}
                    {showAddModal && <AddSubjectModal onClose={() => setShowAddModal(false)} onSave={handleCreateSubject} showToast={showToast} />}
                    {showEditModal && <EditSubjectModal user={user} subject={editingSubject} onClose={() => setShowEditModal(false)} onUpdate={() => fetchSubjects(user.uid)} showToast={showToast} />}
                    {showLoginModal && <LoginModal onLogin={handleLogin} onClose={() => setShowLoginModal(false)} />}

                    {/* View Routing Logic */}
                    {view === 'home' && (
                        activeTab === 'generator' ? (<QuickGenerator onGenerate={generateQuiz} loading={loading} error={error} progressText={progressText} />) : 
                        activeTab === 'subjects' ? (<SubjectDashboard user={user} subjects={subjects} onSelectSubject={handleSelectSubject} onAddSubject={() => setShowAddModal(true)} onDeleteSubject={handleDeleteSubject} onEditSubject={(sub) => { setEditingSubject(sub); setShowEditModal(true); }} onOpenLogin={() => setShowLoginModal(true)} />) : 
                        activeTab === 'history' ? (<HistoryDashboard user={user} onOpenLogin={() => setShowLoginModal(true)} onSelectHistory={handleSelectHistory} />) : 
                        activeTab === 'learn' ? (<LearnDashboard user={user} subjects={subjects} initialData={learnInitData} onStartTest={(lessonText) => generateQuiz({ mode: 'file', sourceText: lessonText, topic: 'Lesson Quiz', difficulty: 'Medium', numQuestions: 5 })} onOpenLogin={() => setShowLoginModal(true)} showToast={showToast} />) : 
                        (<ProfileDashboard user={user} onUpdateProfile={() => setUser({...user})} showToast={showToast} />)
                    )}

                    {/* Detailed Views */}
                    {view === 'subject-detail' && <SubjectDetail subject={activeSubject} topics={activeTopics} onBack={() => setView('home')} onStartTopic={generateQuiz} onLearnTopic={handleLearnTopic} />}
                    
                    {view === 'quiz' && (<QuizView quizData={quizData} currentQ={currentQ} answers={answers} onAnswer={(label) => { const correctLabel = quizData[currentQ].correctAnswer; setAnswers({...answers, [currentQ]: label}); if(label === correctLabel) setScore(s => s+1); }} onNext={() => { if(currentQ < quizData.length -1) setCurrentQ(c => c+1); else { if(user && activeSubject) { const finalScore = Object.keys(answers).reduce((acc, qIdx) => { return acc + (answers[qIdx] === quizData[qIdx].correctAnswer ? 1 : 0); }, 0); handleTopicComplete(finalScore, quizData.length); } else if(user) { const finalScore = Object.keys(answers).reduce((acc, qIdx) => { return acc + (answers[qIdx] === quizData[qIdx].correctAnswer ? 1 : 0); }, 0); saveQuizResult(finalScore, quizData.length); } setView('result'); } }} onQuit={() => setView(activeSubject ? 'subject-detail' : 'home')} />)}
                    
                    {view === 'result' && (<ResultView score={score} total={quizData.length} user={user} quizData={quizData} userAnswers={answers} onRetry={() => setView('home')} onOpenLogin={() => setShowLoginModal(true)} saveResult={null} isReviewMode={false} />)}
                    
                    {view === 'history-review' && (<ResultView score={score} total={quizData.length} user={user} quizData={quizData} userAnswers={answers} onRetry={() => { setActiveTab('history'); setView('home'); }} saveResult={null} isReviewMode={true} />)}
                
                </div>
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);