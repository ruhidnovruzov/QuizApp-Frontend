// src/pages/Grading/StudentResultDetail.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { get } from "../../api/service";
import { Loader2, CheckCircle, XCircle, ChevronLeft, MinusCircle } from "lucide-react";
import Swal from 'sweetalert2';

// --- TİPLƏR ---

interface StudentAnswer {
    question_id: number;
    closed_option_id: number | null;
    open_answer_text: string | null;
    score_earned: number | string;
}

interface QuestionOption {
    id: number;
    text: string;
}

interface DetailedQuestion {
    id: number;
    text: string;
    type: 'Open' | 'Closed';
    max_score: number;
    options: QuestionOption[]; // Closed üçün variantlar
    correct_answer: { id: number; text: string } | null; // Düzgün cavab (yalnız Closed)
    student_answer: StudentAnswer | null; // Tələbənin verdiyi cavab və qazandığı bal
}

interface DetailData {
    result_id: number;
    quiz_title: string;
    student_name: string;
    total_score_achieved: number | string;
    total_max_score: number;
    questions: DetailedQuestion[];
}

// --- KOMPONENT ---

const StudentResultDetail: React.FC = () => {
    const { resultId } = useParams<{ resultId: string }>();
    const navigate = useNavigate();
    
    const [data, setData] = useState<DetailData | null>(null);
    const [loading, setLoading] = useState(true);

    const result_id = parseInt(resultId || '0');

    // API-dən detallı nəticələri gətiririk
    const fetchData = async () => {
        setLoading(true);
        if (result_id === 0) {
            navigate('/teacher/results');
            return;
        }

        try {
            // Backend endpoint-i: GET /api/quizzes/results/detail/:resultId
            const response = await get(`/quizzes/results/detail/${result_id}`); 
            setData(response.data);
        } catch (err: any) {
            Swal.fire({
                title: 'Xəta!',
                text: err.response?.data?.message || "Detallı nəticələri yükləmək mümkün olmadı. API mövcud deyil və ya icazə yoxdur.",
                icon: "error"
            });
            navigate(-1); // Bir səhifə geri get
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [result_id]);
    
    // Sualların nömrələnməsi (1-dən başlayaraq)
    const getQuestionNumber = (index: number) => index + 1;

    // Cavab statusunu təyin edən funksiya
    const getAnswerStatus = (q: DetailedQuestion) => {
        const status = {
            icon: MinusCircle,
            color: 'text-gray-500',
            text: 'Cavab verilməyib'
        };

        if (!q.student_answer || (q.student_answer.closed_option_id === null && !q.student_answer.open_answer_text)) {
            return status;
        }

        if (q.type === 'Closed') {
            const isCorrect = q.student_answer.closed_option_id === q.correct_answer?.id;
            return isCorrect 
                ? { icon: CheckCircle, color: 'text-green-600', text: 'Düzgün Cavab' }
                : { icon: XCircle, color: 'text-red-600', text: 'Səhv Cavab' };
        }
        
        // Open suallar müəllim tərəfindən yoxlanılmalıdır
        if (q.type === 'Open') {
            const score = Number(q.student_answer.score_earned);
            if (score > 0) {
                return { icon: CheckCircle, color: 'text-orange-500', text: 'Qiymətləndirilib' };
            }
            return { icon: MinusCircle, color: 'text-yellow-600', text: 'Qiymətləndirmə gözlənilir' };
        }
        
        return status;
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

    return (
        <>
            <PageBreadcrumb pageTitle={`${data.student_name} - ${data.quiz_title} Nəticə Detalları`} />
            
            {/* Geri Qayıt Düyməsi */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 mb-6 font-medium transition"
            >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Nəticələr Siyahısına Qayıt
            </button>


            {/* Nəticə Xülasəsi Paneli */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8 border-t-4 border-indigo-600">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{data.quiz_title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-700 dark:text-gray-300">
                    <p><strong>Tələbə:</strong> {data.student_name}</p>
                    <p><strong>Ümumi Maksimum Bal:</strong> {Number(data.total_max_score).toFixed(2)}</p>
                    <p className="font-extrabold text-green-600 dark:text-green-400">
                        <strong>Əldə Edilən Bal:</strong> {Number(data.total_score_achieved).toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Sualların Detallı Siyahısı */}
            <div className="space-y-8">
                {data.questions.map((q, index) => {
                    const status = getAnswerStatus(q);
                    const studentAnswer = q.student_answer;
                    
                    // Qazanılan balı tapın
                    const earnedScore = studentAnswer ? Number(studentAnswer.score_earned).toFixed(2) : '0.00';

                    return (
                        <div key={q.id} className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border-l-8" style={{ borderColor: status.color.replace('text-', '#').replace('-600', '600').replace('-500', '500').replace('yellow-600', 'FFC107') }}>
                            
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {getQuestionNumber(index)}. {q.text} 
                                </h3>
                                <div className="text-right flex-shrink-0 ml-4">
                                    <span className="font-bold block text-sm text-gray-700 dark:text-gray-300">Maks Bal: {Number(q.max_score).toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Cavab Statusu */}
                            <div className={`flex items-center p-3 rounded-lg ${status.color.replace('text-', 'bg-') + '/10'} mb-4 border border-current`}>
                                <status.icon className={`w-5 h-5 mr-2 ${status.color}`} />
                                <span className={`font-medium ${status.color}`}>{status.text}</span>
                            </div>


                            {q.type === 'Closed' && (
                                <div className="space-y-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                                    <h4 className="font-bold text-gray-700 dark:text-gray-200 mt-4 mb-2">Variantlar:</h4>
                                    {q.options.map(option => {
                                        const isStudentChoice = studentAnswer?.closed_option_id === option.id;
                                        const isCorrect = q.correct_answer?.id === option.id;
                                        
                                        let optionClass = 'p-2 rounded-md transition duration-150';
                                        
                                        if (isCorrect) {
                                            optionClass += ' bg-green-100 dark:bg-green-900/40 border border-green-500 font-bold text-green-800 dark:text-green-200';
                                        } else if (isStudentChoice) {
                                            optionClass += ' bg-red-100 dark:bg-red-900/40 border border-red-500 font-bold text-red-800 dark:text-red-200';
                                        } else {
                                            optionClass += ' bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
                                        }

                                        return (
                                            <div key={option.id} className={optionClass}>
                                                {isCorrect && <CheckCircle className="w-4 h-4 inline mr-2 text-green-600" />}
                                                {isStudentChoice && !isCorrect && <XCircle className="w-4 h-4 inline mr-2 text-red-600" />}
                                                {option.text}
                                                {isCorrect && <span className="ml-2 text-xs font-normal">(Düzgün Cavab)</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {q.type === 'Open' && (
                                <div className="mt-4">
                                    <h4 className="font-bold text-gray-700 dark:text-gray-200 mb-2">Tələbənin Cavabı:</h4>
                                    <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg whitespace-pre-wrap text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600">
                                        {studentAnswer?.open_answer_text || 'Tələbə cavab verməyib.'}
                                    </div>
                                    
                                    {/* TODO: Gələcəkdə burada qiymətləndirmə (grading) interfeysi ola bilər. */}
                                    <div className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
                                        * Açıq suallar üçün balı ayrıca yoxlayıb daxil etməlisiniz.
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {/* Səhifənin sonunda boşluq */}
            <div className="h-10"></div>
        </>
    );
};

export default StudentResultDetail;