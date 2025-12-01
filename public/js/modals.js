// public/js/modals.js
const { useState, useEffect, useRef } = React;

// --- TOAST COMPONENT ---
window.Toast = ({ message, type, onClose }) => {
    const Icons = window.Icons;

    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const colors = type === 'error' ? 'bg-red-500' : 'bg-green-500';

    return (
        <div className={`fixed bottom-10 left-1/2 transform -translate-x-1/2 ${colors} text-white px-6 py-3 rounded-full shadow-xl z-[100] flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-300`}>
            {type === 'error' ? <Icons.Cross /> : <Icons.Check />}
            <span className="text-sm font-bold">{message}</span>
        </div>
    );
};

// --- LOGIN MODAL ---
window.LoginModal = React.memo(({ onLogin, onClose }) => {
    const Icons = window.Icons;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm fade-in p-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8 max-w-md w-[95%] md:w-full text-center relative animate-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-red-500">✕</button>
                <div className="w-16 h-16 bg-indigo-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6"><Icons.Brain /></div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Login Required</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8">Sign in to save subjects and track progress.</p>
                <button onClick={onLogin} className="w-full py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl font-bold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-3 shadow-sm active:scale-95 hover:shadow-md">
                    <Icons.Google /> Sign in with Google
                </button>
            </div>
        </div>
    );
});

// --- ADD SUBJECT MODAL ---
window.AddSubjectModal = React.memo(({ onClose, onSave, showToast }) => {
    const Icons = window.Icons;
    const [name, setName] = useState('');
    const [syllabus, setSyllabus] = useState('');
    const [parsing, setParsing] = useState(false);
    const [fileName, setFileName] = useState('');
    const fileRef = useRef(null);

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file.name);
        setParsing(true);
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
            } else {
                text = await file.text();
            }
            setSyllabus(text);
            showToast("File loaded", "success");
        } catch (err) {
            showToast("File error: " + err.message, "error");
        } finally {
            setParsing(false);
        }
    };

    const handleSubmit = async () => {
        if (!name || !syllabus) return showToast("Please fill all fields.", "error");
        setParsing(true);
        try {
            const response = await fetch('/api/parse-syllabus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ syllabusText: syllabus })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            onSave(name, data.syllabusData, data.usage);
            showToast("Subject created!", "success");
        } catch (err) {
            showToast(err.message, "error");
            setParsing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm fade-in p-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Add New Subject</h2>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Subject Name</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 mb-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" placeholder="e.g. Physics" />
                
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Syllabus Source</label>
                <div onClick={() => fileRef.current.click()} className="w-full p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-all mb-4">
                    <div className="text-slate-400 dark:text-slate-500 mb-2"><Icons.Upload /></div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{fileName || "Click to Upload (PDF/TXT)"}</p>
                    <input type="file" ref={fileRef} className="hidden" accept=".pdf,.txt" onChange={handleFile} />
                </div>
                
                <textarea value={syllabus} onChange={e => setSyllabus(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 mb-6 h-24 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" placeholder="Or paste text..." />
                
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all">Cancel</button>
                    <button onClick={handleSubmit} disabled={parsing} className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 flex justify-center items-center gap-2 active:scale-95 transition-all shadow-lg hover:shadow-indigo-500/25">
                        {parsing ? <><Icons.Loader /> Processing...</> : "Create Subject"}
                    </button>
                </div>
            </div>
        </div>
    );
});

// --- EDIT SUBJECT MODAL ---
window.EditSubjectModal = React.memo(({ user, subject, onClose, onUpdate, showToast }) => {
    const Icons = window.Icons;
    const db = window.db;
    const [name, setName] = useState(subject.name);
    const [syllabus, setSyllabus] = useState('');
    const [parsing, setParsing] = useState(false);
    const [topics, setTopics] = useState([]);
    const [loadingTopics, setLoadingTopics] = useState(true);
    const fileRef = useRef(null);

    useEffect(() => {
        const fetchTopics = async () => {
            const snap = await db.collection('users').doc(user.uid).collection('subjects').doc(subject.id).collection('topics').get();
            setTopics(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoadingTopics(false);
        };
        fetchTopics();
    }, [subject, user.uid]);

    const handleDeleteTopic = async (topicId) => {
        if (!confirm("Delete this topic?")) return;
        await db.collection('users').doc(user.uid).collection('subjects').doc(subject.id).collection('topics').doc(topicId).delete();
        setTopics(prev => prev.filter(t => t.id !== topicId));
        showToast("Topic deleted", "success");
    };

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setParsing(true);
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
            } else {
                text = await file.text();
            }
            setSyllabus(text);
            showToast("File read successfully", "success");
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setParsing(false);
        }
    };

    const handleSave = async () => {
        setParsing(true);
        if (name !== subject.name) {
            await db.collection('users').doc(user.uid).collection('subjects').doc(subject.id).update({ name });
        }
        if (syllabus) {
            try {
                const response = await fetch('/api/parse-syllabus', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ syllabusText: syllabus })
                });
                const data = await response.json();
                if (data.error) throw new Error(data.error);

                const batch = db.batch();
                const subRef = db.collection('users').doc(user.uid).collection('subjects').doc(subject.id);
                let newCount = 0;

                if (data.usage) {
                    await db.collection('users').doc(user.uid).set({
                        tokenUsage: firebase.firestore.FieldValue.increment(data.usage.totalTokenCount || 0)
                    }, { merge: true });
                }

                data.syllabusData.forEach(unitObj => {
                    unitObj.topics.forEach(tName => {
                        const ref = subRef.collection('topics').doc();
                        batch.set(ref, { name: tName, unit: unitObj.unit, completed: false, learned: false, score: 0 });
                        newCount++;
                    });
                });
                await batch.commit();
                await subRef.update({ totalTopics: subject.totalTopics + newCount });
                showToast("Subject updated", "success");
            } catch (err) {
                showToast(err.message, "error");
            }
        } else {
             showToast("Saved changes", "success");
        }
        setParsing(false);
        onUpdate();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm fade-in p-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Edit Subject</h2>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Subject Name</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 mb-6 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" />

                <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Add New Content (Optional)</label>
                    <div className="flex gap-2 mb-2">
                        <div onClick={() => fileRef.current.click()} className="flex-1 p-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 text-sm transition-colors"><Icons.Upload /> &nbsp; Upload File</div>
                        <input type="file" ref={fileRef} className="hidden" onChange={handleFile} />
                    </div>
                    <textarea value={syllabus} onChange={e => setSyllabus(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 h-20 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" placeholder="Paste text to append..." />
                </div>
                
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Manage Topics ({topics.length})</label>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 mb-6 max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700">
                    {loadingTopics ? <Icons.Loader /> : topics.map(t => (
                        <div key={t.id} className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700 last:border-0">
                            <span className="text-sm text-slate-700 dark:text-slate-300">{t.name} <span className="text-[10px] text-slate-400 bg-slate-200 dark:bg-slate-800 px-1 rounded ml-2">{t.unit}</span></span>
                            <button onClick={() => handleDeleteTopic(t.id)} className="text-red-400 hover:text-red-600 p-1 transition-colors"><Icons.Cross /></button>
                        </div>
                    ))}
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all">Close</button>
                    <button onClick={handleSave} disabled={parsing} className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 flex justify-center items-center gap-2 active:scale-95 transition-all shadow-lg hover:shadow-indigo-500/25">
                        {parsing ? <><Icons.Loader /> Saving...</> : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
});