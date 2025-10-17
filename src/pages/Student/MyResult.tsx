// src/pages/Student/MyResultDetail.tsx (RESPONSIVE VERSION)

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { get } from "../../api/service";
import { Loader2, CheckCircle, XCircle, ChevronLeft, MinusCircle, User, Zap, Target } from "lucide-react";
import Swal from 'sweetalert2';

// --- TİPLƏR (Dəyişmədi) ---

interface StudentAnswer {
    question_id: number;
    closed_option_id: number | null;
    given_text: string | null; 
    score_gained: number | string; 
}

interface QuestionOption {
    id: number;
    text: string;
    is_correct: boolean; 
}

interface DetailedQuestion {
    id: number;
    text: string;
    type: 'Open' | 'Closed';
    max_score: number | string; 
    options: QuestionOption[]; 
    correct_answer?: { id: number; text: string } | null; 
    student_answer: StudentAnswer | null;
}

interface DetailData {
    result_id: number;
    quiz_title: string;
    student_name: string;
    total_score_achieved: number | string;
    total_max_score: number | string;
    questions: DetailedQuestion[];
}

// --- KOMPONENT ---

const MyResultDetail: React.FC = () => {
    const { resultId } = useParams<{ resultId: string }>();
    const navigate = useNavigate();
    
    const [data, setData] = useState<DetailData | null>(null);
    const [loading, setLoading] = useState(true);

    const result_id = parseInt(resultId || '0');

    const fetchData = async () => {
        setLoading(true);
        if (result_id === 0) {
            navigate('/student/my-results'); 
            return;
        }

        try {
            const response = await get(`/quizzes/results/detail/${result_id}`); 
            setData(response.data);
        } catch (err: any) {
            Swal.fire({
                title: 'Xəta!',
                text: err.response?.data?.message || "Detallı nəticələri yükləmək mümkün olmadı.",
                icon: "error"
            });
            navigate(-1); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [result_id]);
    
    const getQuestionNumber = (index: number) => index + 1;

    // Cavab statusunu təyin edən funksiya
    const getAnswerStatus = (q: DetailedQuestion) => {
        const studentScore = q.student_answer ? Number(q.student_answer.score_gained) : 0;
        
        if (!q.student_answer) {
            return { icon: MinusCircle, color: 'text-gray-500', text: 'Cavab verilməyib' };
        }

        if (q.type === 'Closed') {
            if (studentScore > 0) {
                 return { icon: CheckCircle, color: 'text-green-600', text: 'Düzgün Cavab' };
            }
            if (q.student_answer.closed_option_id !== null) {
                return { icon: XCircle, color: 'text-red-600', text: 'Səhv Cavab' };
            }
        }
        
        if (q.type === 'Open') {
            if (studentScore > 0) {
                return { icon: CheckCircle, color: 'text-orange-600', text: 'Qiymətləndirilib' };
            }
            if (q.student_answer.given_text) {
                return { icon: MinusCircle, color: 'text-yellow-600', text: 'Qiymətləndirmə gözlənilir' };
            }
        }
        
        return { icon: MinusCircle, color: 'text-gray-500', text: 'Cavab verilməyib' };
    };

    if (loading) {
        return <div className="flex justify-center items-center h-96 text-lg text-gray-700 dark:text-gray-400"><Loader2 className="animate-spin mr-2" /> Detallar yüklənir...</div>;
    }

    if (!data) {
        return (
            <div className="p-6 text-center text-red-500">
                Detallı nəticə məlumatı tapılmadı.
            </div>
        );
    }
    
    const canViewCorrectAnswer = data.questions.some(q => q.type === 'Closed' && q.options.some(opt => opt.is_correct));


    return (
        <>
            <PageBreadcrumb pageTitle={`${data.quiz_title} Detalları`} /> {/* Başlığı qısaltmaq */}
            
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 mb-4 font-medium transition text-sm sm:text-base" // Mobile üçün kiçik font
            >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Nəticələr Siyahısına Qayıt
            </button>


            {/* --- ÜMUMİ MƏLUMAT KARTI (Responsive) --- */}
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg mb-6 border-t-4 border-indigo-600">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-yellow-500" /> {data.quiz_title}
                </h2>
                {/* Mobildə column, böyükdə grid */}
                <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <p className="flex items-center">
                        <User className="w-4 h-4 mr-1.5 text-gray-500" />
                        <strong className='font-semibold'>Tələbə:</strong> <span className='ml-1.5'>{data.student_name}</span>
                    </p>
                    <p className="flex items-center">
                        <Target className="w-4 h-4 mr-1.5 text-red-500" />
                        <strong className='font-semibold'>Maks Bal:</strong> <span className='ml-1.5'>{Number(data.total_max_score).toFixed(2)}</span>
                    </p>
                    <p className="font-extrabold text-green-600 dark:text-green-400 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1.5" />
                        <strong className='font-semibold'>Əldə Edilən Bal:</strong> <span className='ml-1.5 text-base'>{Number(data.total_score_achieved).toFixed(2)}</span>
                    </p>
                </div>
            </div>

            {/* --- SUALLARIN DETALLI KARTI (Responsive) --- */}
            <div className="space-y-6">
                {data.questions.map((q, index) => {
                    const status = getAnswerStatus(q);
                    const studentAnswer = q.student_answer;
                    const earnedScore = studentAnswer ? Number(studentAnswer.score_gained).toFixed(2) : '0.00';

                    return (
                        <div key={q.id} className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border-l-4 sm:border-l-8" style={{ borderColor: status.color.replace('text-', '#').replace('-600', '600').replace('-500', '500').replace('yellow-600', 'FFC107') }}>
                            
                            {/* Sual Başlığı və Ballar Bloku */}
                            <div className="flex flex-col sm:flex-row justify-between items-start mb-3 sm:mb-4 border-b pb-3 dark:border-gray-700">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-0">
                                    {getQuestionNumber(index)}. {q.text} 
                                </h3>
                                <div className="text-left sm:text-right flex-shrink-0 sm:ml-4 text-sm">
                                    <span className="font-bold block text-gray-700 dark:text-gray-300">Maks Bal: {Number(q.max_score).toFixed(2)}</span>
                                    <span className={`font-extrabold block text-base ${status.color}`}>Qazanılan Bal: {earnedScore}</span>
                                </div>
                            </div>

                            {/* Status Bar */}
                            <div className={`flex items-center p-3 rounded-lg ${status.color.replace('text-', 'bg-') + '/10'} mb-4 border border-current`}>
                                <status.icon className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 ${status.color}`} />
                                <span className={`font-medium ${status.color} text-sm`}>{status.text}</span>
                            </div>


                            {/* Qapalı Suallar */}
                            {q.type === 'Closed' && (
                                <div className="space-y-1 sm:space-y-2 pl-3 sm:pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                                    <h4 className="font-bold text-gray-700 dark:text-gray-200 mt-3 mb-2 text-sm">Cavablar:</h4>
                                    {q.options.map(option => {
                                        const isStudentChoice = studentAnswer?.closed_option_id === option.id;
                                        const isCorrect = canViewCorrectAnswer && option.is_correct; 
                                        
                                        let optionClass = 'p-2 rounded-md transition duration-150 flex items-center text-sm';
                                        
                                        if (isCorrect && isStudentChoice) {
                                            optionClass += ' bg-green-100 dark:bg-green-900/40 border border-green-500 font-bold text-green-800 dark:text-green-200';
                                        } else if (isStudentChoice && !isCorrect) {
                                            optionClass += ' bg-red-100 dark:bg-red-900/40 border border-red-500 font-bold text-red-800 dark:text-red-200';
                                        } else if (isCorrect && !isStudentChoice) {
                                             optionClass += ' bg-green-100 dark:bg-green-900/40 border border-green-500 font-medium text-green-800 dark:text-green-200';
                                        }
                                         else {
                                            optionClass += ' bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
                                        }

                                        return (
                                            <div key={option.id} className={optionClass}>
                                                {isCorrect && <CheckCircle className="w-4 h-4 inline mr-2 text-green-600 flex-shrink-0" />}
                                                {isStudentChoice && !isCorrect && <XCircle className="w-4 h-4 inline mr-2 text-red-600 flex-shrink-0" />}
                                                
                                                {!isCorrect && !isStudentChoice && <div className="w-4 h-4 mr-2 flex-shrink-0"></div>} 
                                                
                                                <span className='break-words'>{option.text}</span>
                                                {isCorrect && <span className="ml-2 text-xs font-normal flex-shrink-0">(Düzgün)</span>}
                                                {isStudentChoice && !isCorrect && <span className="ml-2 text-xs font-normal flex-shrink-0">(Sizin)</span>}
                                            </div>
                                        );
                                    })}
                                    
                                    {!canViewCorrectAnswer && (
                                        <div className="mt-4 p-2 text-xs text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 rounded">
                                            Qeyd: Düzgün cavablar hal-hazırda sistem tərəfindən görünmür.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Açıq Suallar */}
                            {q.type === 'Open' && (
                                <div className="mt-4">
                                    <h4 className="font-bold text-gray-700 dark:text-gray-200 mb-2 text-sm">Tələbənin Cavabı:</h4>
                                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600">
                                        {studentAnswer?.given_text || 'Tələbə cavab verməyib.'}
                                    </div>
                                    
                                    <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                                        * Açıq sualların balı müəllim tərəfindən təyin olunur.
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            <div className="h-10"></div>
        </>
    );
};

export default MyResultDetail;