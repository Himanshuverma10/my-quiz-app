// public/js/views.js
const { useState, useEffect } = React;

// --- QUIZ VIEW ---
window.QuizView = React.memo(({ quizData, currentQ, answers, onAnswer, onNext, onQuit }) => {
    // Access Helpers INSIDE component to prevent "undefined" error
    const Icons = window.Icons;
    const { getLabel, cleanOptionText } = window.Helpers;

    const q = quizData[currentQ];
    const answered = answers[currentQ];
    const progress = ((currentQ + 1) / quizData.length) * 100;

    return (
        <div className="w-full max-w-2xl mx-auto fade-in bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="h-1.5 bg-slate-100 dark:bg-slate-900 w-full">
                <div className="h-full bg-indigo-500 dark:bg-[#10b981] transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="p-8 md:p-10">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-bold text-indigo-500 dark:text-[#10b981] bg-indigo-50 dark:bg-[#10b981]/10 px-3 py-1 rounded-full uppercase tracking-widest">
                        Q{currentQ + 1} / {quizData.length}
                    </span>
                    <button onClick={onQuit} className="text-slate-400 hover:text-red-500 text-xs font-bold uppercase tracking-widest active:scale-95 transition">Quit</button>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 leading-snug">{q.question}</h2>
                
                <div className="space-y-3">
                    {q.options.map((optText, i) => {
                        const label = getLabel(i); 
                        const content = cleanOptionText(optText);
                        const isSel = answers[currentQ] === label;
                        const isRight = label === q.correctAnswer; 
                        
                        let containerStyle = "w-full flex items-stretch rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95 ";
                        let labelStyle = "w-12 flex items-center justify-center font-bold text-lg border-r-2 ";
                        let textStyle = "flex-1 p-4 text-left font-medium text-sm flex items-center ";
                        
                        if (answered) {
                            if (isRight) {
                                containerStyle += "border-green-500 bg-green-50 dark:bg-green-900/20"; 
                                labelStyle += "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 border-green-500"; 
                                textStyle += "text-green-800 dark:text-green-300";
                            } else if (isSel) {
                                containerStyle += "border-red-500 bg-red-50 dark:bg-red-900/20"; 
                                labelStyle += "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border-red-500"; 
                                textStyle += "text-red-800 dark:text-red-300";
                            } else {
                                containerStyle += "border-slate-200 dark:border-slate-700 opacity-50"; 
                                labelStyle += "bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-500"; 
                                textStyle += "text-slate-500 dark:text-slate-400";
                            }
                        } else {
                            containerStyle += "border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-[#10b981] bg-white dark:bg-slate-800"; 
                            labelStyle += "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 group-hover:text-indigo-500"; 
                            textStyle += "text-slate-700 dark:text-slate-300";
                        }

                        return (
                            <div key={i} onClick={() => !answered && onAnswer(label)} className={containerStyle}>
                                <div className={labelStyle}>{label}</div>
                                <div className={textStyle}>{content}</div>
                            </div>
                        );
                    })}
                </div>
                
                {answered && (
                    <div className="mt-6 p-4 rounded-xl bg-indigo-50 dark:bg-slate-900 border border-indigo-100 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-sm animate-in fade-in slide-in-from-bottom-2">
                        <strong className="text-indigo-600 dark:text-[#10b981] block text-xs uppercase mb-1">Insight</strong>
                        {q.explanation}
                    </div>
                )}
            </div>
            
            {answered && (
                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                    <button onClick={onNext} className="px-8 py-3 bg-indigo-600 dark:bg-[#10b981] text-white dark:text-slate-900 rounded-xl font-bold shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition transform">
                        {currentQ < quizData.length - 1 ? "Next" : "Finish"} <Icons.ArrowRight />
                    </button>
                </div>
            )}
        </div>
    );
});

// --- RESULT VIEW (Updated with Export & Share) ---
window.ResultView = React.memo(({ score, total, user, quizData, userAnswers, onRetry, onOpenLogin, saveResult, isReviewMode, topicName }) => {
    // Import Helpers
    const Icons = window.Icons;
    const { downloadPDF, shareResult } = window.Helpers;
    
    const percentage = Math.round((score / total) * 100);
    const [saved, setSaved] = useState(false);

    // Auto-save logic
    useEffect(() => {
        if (user && !saved && !isReviewMode && saveResult) {
            saveResult(score, total);
            setSaved(true);
        }
    }, [user]);

    // Handlers
    const handleDownload = () => {
        // Use "Quiz Result" as title if topicName is missing
        const title = topicName || "Quiz Result";
        downloadPDF(title, score, total, quizData, userAnswers);
    };

    const handleShare = () => {
        const title = topicName || "Quiz";
        shareResult(title, score, total);
    };

    return (
        <div className="w-full max-w-3xl mx-auto text-center fade-in pb-10">
            
            {/* Score Card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 shadow-2xl border border-slate-200 dark:border-slate-700 transition-colors duration-300 mb-8">
                <div className="w-24 h-24 mx-auto bg-indigo-100 dark:bg-[#10b981]/20 rounded-full flex items-center justify-center mb-6">
                    <span className="text-3xl font-black text-indigo-600 dark:text-[#10b981]">{percentage}%</span>
                </div>
                
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">
                    {isReviewMode ? "Quiz Review" : (percentage > 70 ? "Outstanding!" : "Good Effort!")}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8">You scored {score} out of {total}</p>
                
                {/* 🔥 ACTION BUTTONS ROW 1: Download & Share */}
                <div className="flex justify-center gap-3 mb-6">
                    <button onClick={handleDownload} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition flex items-center gap-2">
                        <Icons.Download /> PDF
                    </button>
                    <button onClick={handleShare} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition flex items-center gap-2">
                        <Icons.Share /> Share
                    </button>
                </div>

                {/* ACTION BUTTONS ROW 2: Navigation */}
                <div className="space-y-3 max-w-md mx-auto">
                    <button onClick={onRetry} className="w-full py-4 bg-indigo-600 dark:bg-[#10b981] text-white dark:text-slate-900 rounded-xl font-bold shadow-lg hover:opacity-90 transition active:scale-95">
                        {isReviewMode ? "Back to History" : "Create New Quiz"}
                    </button>
                    
                    {!user && !isReviewMode && (
                        <button onClick={onOpenLogin} className="w-full py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition flex items-center justify-center gap-2 active:scale-95">
                            Save My Progress <Icons.ArrowRight />
                        </button>
                    )}
                    
                    {user && !isReviewMode && (
                        <div className="text-xs text-green-500 font-bold uppercase tracking-widest mt-4">✓ Result Saved</div>
                    )}
                </div>
            </div>

            {/* Detailed Analysis (Same as before) */}
            <div className="text-left space-y-6">
                <h3 className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs text-center mb-6">Detailed Analysis</h3>
                {quizData.map((q, index) => {
                    const userLabel = userAnswers[index]; 
                    const correctLabel = q.correctAnswer;
                    const isCorrect = userLabel === correctLabel;

                    return (
                        <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:scale-[1.01] transition-transform duration-200">
                            <div className="flex items-start gap-4">
                                <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${isCorrect ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                                    {isCorrect ? <Icons.Check /> : <Icons.Cross />}
                                </div>
                                <div className="w-full">
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{q.question}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div className={`p-3 rounded-lg text-sm border flex gap-3 items-center ${isCorrect ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900 text-green-800 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900 text-red-800 dark:text-red-400'}`}>
                                            <div className="font-bold px-2 py-1 rounded bg-white/50 dark:bg-black/20">{userLabel || "-"}</div>
                                            <span className="font-medium opacity-90">Your Answer</span>
                                        </div>
                                        {!isCorrect && (
                                             <div className="p-3 rounded-lg text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 flex gap-3 items-center">
                                                <div className="font-bold px-2 py-1 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400">{correctLabel}</div>
                                                <span className="font-medium opacity-90">Correct Answer</span>
                                            </div>
                                        )}
                                    </div>
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
});