// src/pages/Student/TakeQuizPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { get, post } from "../../api/service";
import { Loader2, Send, Clock, AlertTriangle } from "lucide-react";
import Swal from 'sweetalert2';

// --- TİPLƏR ---

// Tələbənin cavab forması üçün tip
interface AnswerInput {
    question_id: number;
    closed_option_id: number | null; // Closed sual üçün
    open_answer_text: string | null; // Open sual üçün (Verilən cavab mətni)
}

// Backend-dən gələn sual tipi (Düzgün cavab yoxdur)
interface Question {
    id: number;
    text: string;
    type: 'Open' | 'Closed';
    max_score: number;
    options: { id: number; text: string }[];
}

interface QuizData {
    id: number;
    title: string;
    total_max_score: number;
    questions: Question[];
    start_time: string;
    end_time: string; // Vaxtı hesablamaq üçün lazım
    subject: { name: string };
    teacher: { first_name: string; last_name: string };
}

// --- KOMPONENT ---

const TakeQuizPage: React.FC = () => {
    const { id: quizIdParam } = useParams<{ id: string }>();
    const quizId = parseInt(quizIdParam || '0');
    const navigate = useNavigate();

    const [quizData, setQuizData] = useState<QuizData | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Bütün cavabları saxlayan əsas state
    const [answers, setAnswers] = useState<AnswerInput[]>([]);
    
    // Timer state-i (saniyə ilə)
    const [timeLeft, setTimeLeft] = useState<number | null>(null); 

    // Quiz Məlumatlarını gətiririk
    const fetchQuizData = async () => {
        setLoading(true);
        if (quizId === 0) {
            navigate('/student/quizzes');
            return;
        }

        try {
            // '/quiz-taking/available' bütün aktiv quizləri gətirir. Biz buradan ID ilə axtarırıq.
            const response = await get('/take-quiz/available');
            const targetQuiz = response.data.find((q: QuizData) => q.id === quizId);

            if (!targetQuiz) {
                 throw new Error("Quiz tapılmadı, vaxtı keçib və ya siz artıq iştirak etmisiniz.");
            }
            
            setQuizData(targetQuiz);

            // Vaxt hesablanması: Bitmə vaxtı - İndiki vaxt
            const endTime = new Date(targetQuiz.end_time).getTime();
            const now = new Date().getTime();
            const remainingTime = Math.floor((endTime - now) / 1000); // saniyə

            if (remainingTime <= 0) {
                // Vaxt artıq bitibsə
                Swal.fire({
                    title: 'Vaxt bitib!',
                    text: 'Bu Quiz-in vaxtı artıq bitib. Səhifə yönləndirilir.',
                    icon: "error"
                });
                navigate('/student/quizzes');
                return;
            }

            setTimeLeft(remainingTime);
            
            // Cavabları ilkin dəyərlərlə doldururuq
            const initialAnswers: AnswerInput[] = targetQuiz.questions.map((q: Question) => ({
                question_id: q.id,
                closed_option_id: null,
                open_answer_text: q.type === 'Open' ? '' : null,
            }));
            setAnswers(initialAnswers);

        } catch (err: any) {
            Swal.fire({
                title: 'Xəta!',
                text: err.message || err.response?.data?.message || "Quiz məlumatlarını yükləmək mümkün olmadı.",
                icon: "error"
            });
            navigate('/student/quizzes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuizData();
    }, [quizId]);


    // handleSubmitQuiz useCallback olduğu üçün buraya əlavə etmək daha düzgündür

    // Cavabları dəyişdirmə funksiyası
    const handleAnswerChange = (questionId: number, type: 'Closed' | 'Open', value: string | number | null) => {
        setAnswers(prevAnswers => 
            prevAnswers.map(ans => {
                if (ans.question_id === questionId) {
                    if (type === 'Closed' && typeof value === 'number') {
                        // Qapalı sual cavabı
                        return { ...ans, closed_option_id: value, open_answer_text: null };
                    }
                    if (type === 'Open' && typeof value === 'string') {
                        // Açıq sual cavabı
                        return { ...ans, open_answer_text: value, closed_option_id: null };
                    }
                }
                return ans;
            })
        );
    };

    

    // Quiz-i göndər funksiyası
const handleSubmitQuiz = useCallback(async (isAutoSubmit = false) => {
        if (submitting) return;

        // Təsdiq sorğusu (avtomatik göndərmə deyilsə)
        if (!isAutoSubmit) {
            const confirmation = await Swal.fire({
                title: 'Əminsiniz?',
                text: "Cavabları göndərdikdən sonra düzəliş edə bilməyəcəksiniz. İştirak etdiyiniz qəbul ediləcək.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Bəli, Göndər',
                cancelButtonText: 'Xeyr, Geri Qayıt'
            });
            if (!confirmation.isConfirmed) return;
        }

        setSubmitting(true);
        
        // Yalnız cavab verilmiş sualları göndəririk (backend tələbinə uyğun)
        const cleanedAnswers = answers.filter(ans => 
            ans.closed_option_id !== null || (ans.open_answer_text && ans.open_answer_text.trim() !== '')
        ).map(ans => ({
            question_id: ans.question_id,
            closed_option_id: ans.closed_option_id,
            open_answer_text: ans.open_answer_text
        })); 

        try {
            await post('/take-quiz/submit', { 
                quiz_id: quizId,
                answers: cleanedAnswers
            });
            
            Swal.fire({
                title: 'Uğurlu!',
                text: isAutoSubmit ? 'Vaxtınız bitdi. Cavablarınız avtomatik göndərildi!' : 'Cavablarınız uğurla göndərildi!',
                icon: 'success',
                timer: 3000,
                showConfirmButton: false
            });
            navigate('/student/my-results'); // Nəticələr səhifəsinə yönləndir
        } catch (err: any) {
            Swal.fire({
                title: 'Xəta!',
                text: err.response?.data?.message || 'Cavabları göndərmək mümkün olmadı. Zəhmət olmasa yenidən cəhd edin.',
                icon: 'error'
            });
        } finally {
            setSubmitting(false);
        }
  }, [answers, quizId, navigate]);


      // TIMER LOGİKASI
useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitting) return;

    const timer = setInterval(() => {
        setTimeLeft(prevTime => {
            if (prevTime !== null && prevTime <= 1) {
                clearInterval(timer);
                handleSubmitQuiz(true); // Vaxt bitdikdə avtomatik göndər
                return 0;
            }
            return prevTime !== null ? prevTime - 1 : 0;
        });
    }, 1000);

    return () => clearInterval(timer);
}, [timeLeft, submitting, handleSubmitQuiz]);

    // TimeLeft formatını dəyişmək
    const formatTime = (totalSeconds: number | null) => {
        if (totalSeconds === null || totalSeconds < 0) return '00:00';
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    if (loading || !quizData || timeLeft === null) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin mr-2" /> Quiz hazırlanır...</div>;
    }

    // Açıq sual sayını tapırıq
    const openQuestionsCount = quizData.questions.filter(q => q.type === 'Open').length;

    return (
        <>
            <PageBreadcrumb pageTitle={`Quiz: ${quizData.title}`} />
            
            {/* Timer və Məlumat Paneli (Sticky) */}
            <div className="sticky top-0 z-10 p-4 bg-white dark:bg-gray-800 shadow-md mb-6 rounded-lg flex justify-between items-center border-b-2 border-indigo-500">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    {quizData.title}
                </h3>
                
                {/* Timer */}
                <div className={`flex items-center text-lg font-extrabold p-2 rounded-lg ${timeLeft <= 60 ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-100 text-indigo-700 dark:bg-gray-700 dark:text-indigo-300'}`}>
                    <Clock className="w-5 h-5 mr-2" /> 
                    Qalan Vaxt: {formatTime(timeLeft)}
                </div>
            </div>

            {/* Açıq sual Xəbərdarlığı */}
            {openQuestionsCount > 0 && (
                <div className="p-3 mb-6 bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200 rounded-lg flex items-center shadow-sm">
                    <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <p className="text-sm font-medium">
                        **{openQuestionsCount} Açıq Sual** var. Bu sualların balı müəllim tərəfindən ayrıca qiymətləndiriləcək. İlkin nəticə yalnız çoxseçimli suallara əsasən hesablanacaq.
                    </p>
                </div>
            )}


            {/* Sual Forması */}
            <form onSubmit={(e) => { e.preventDefault(); handleSubmitQuiz(false); }}>
                <div className="space-y-8">
                    {quizData.questions.map((q, index) => {
                        const currentAnswer = answers.find(a => a.question_id === q.id);

                        return (
                            <div key={q.id} className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl border-t-4 border-indigo-600">
                            <p className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-2 flex justify-between">
    <span>Sual {index + 1}</span>
    <span className="text-indigo-700 dark:text-indigo-400 font-bold">
        {Number(q.max_score).toFixed(2)} Bal
    </span>
</p>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{q.text}</h4>

                                {q.type === 'Closed' ? (
                                    // Qapalı Sual (Çoxseçimli)
                                    <div className="space-y-3">
                                        {q.options.map(option => (
                                            <label key={option.id} className={`flex items-center p-3 border rounded-lg cursor-pointer transition duration-150 ease-in-out ${currentAnswer?.closed_option_id === option.id ? 'bg-indigo-50 border-indigo-500 dark:bg-indigo-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-700'}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`question-${q.id}`}
                                                    value={option.id}
                                                    checked={currentAnswer?.closed_option_id === option.id}
                                                    onChange={() => handleAnswerChange(q.id, 'Closed', option.id)}
                                                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                                    disabled={submitting}
                                                />
                                                <span className="ml-3 text-gray-700 dark:text-gray-300 font-medium">
                                                    {option.text}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    // Açıq Sual
                                    <div>
                                        <textarea
                                            rows={5}
                                            value={currentAnswer?.open_answer_text || ''}
                                            onChange={(e) => handleAnswerChange(q.id, 'Open', e.target.value)}
                                            placeholder="Cavabınızı buraya yazın..."
                                            className="w-full p-4 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm resize-none"
                                            disabled={submitting}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Göndər Düyməsi (Fixed Footer) */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t shadow-2xl flex justify-center z-20">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center px-8 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition duration-150 shadow-lg transform hover:scale-105"
                    >
                        {submitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
                        Cavabları Göndər
                    </button>
                </div>
            </form>
            
            {/* Boşluq (Fixed footer-in arxasında qalmaması üçün) */}
            <div className="h-24"></div> 
        </>
    );
};

export default TakeQuizPage;