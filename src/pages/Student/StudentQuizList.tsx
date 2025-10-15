import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { get } from "../../api/service";
import { Loader2, Zap, Clock, User, BookOpen, ChevronRight } from "lucide-react";
import Swal from 'sweetalert2';

// Məlumat Tipləri
interface QuizQuestion {
    id: number;
    type: 'Open' | 'Closed';
    max_score: number;
}

interface AvailableQuiz {
    id: number;
    title: string;
    total_max_score: number;
    duration_minutes: number;
    start_time: string;
    end_time: string;
    subject: { name: string };
    teacher: { first_name: string; last_name: string };
    questions: QuizQuestion[];
    results: any[]; // getAvailableQuizzes-də filterləmə üçün istifadə olunur
}

const StudentQuizListPage: React.FC = () => {
    const [quizzes, setQuizzes] = useState<AvailableQuiz[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Endpoint: /quiz-taking/available
            const response = await get('/take-quiz/available');
            setQuizzes(response.data);
        } catch (err: any) {
            Swal.fire({
                title: 'Xəta!',
                text: err.response?.data?.message || "Aktiv Quizləri yükləmək mümkün olmadı.",
                icon: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading && quizzes.length === 0) {
        return <div className="flex justify-center items-center h-48 text-lg text-gray-700 dark:text-gray-400"><Loader2 className="animate-spin mr-2" /> Aktiv Quizlər yüklənir...</div>;
    }

    return (
        <>
            <PageBreadcrumb pageTitle="Aktiv Quizlər" />

            <div className="space-y-4">
                {quizzes.length === 0 && !loading ? (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400 border rounded-lg bg-white dark:bg-gray-800 shadow-md">
                        Hal-hazırda qoşula biləcəyiniz aktiv Quiz tapılmadı.
                    </div>
                ) : (
                    quizzes.map((quiz) => {
                        const totalQuestions = quiz.questions.length;
                        const openQuestionsCount = quiz.questions.filter(q => q.type === 'Open').length;
                        const isGradedAutomatically = openQuestionsCount === 0;
                        const timeRemaining = new Date(quiz.end_time).toLocaleString();

                        return (
                            <div key={quiz.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition duration-300">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center mb-1">
                                            <Zap className="w-5 h-5 mr-2 text-yellow-500" /> {quiz.title}
                                        </h2>

                                        {/* Detallar */}
                                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mt-2">
                                            <p className="flex items-center"><BookOpen className="w-4 h-4 mr-1.5" /> Fənn: <span className="font-medium ml-1 text-gray-800 dark:text-gray-200">{quiz.subject.name}</span></p>
                                            <p className="flex items-center"><User className="w-4 h-4 mr-1.5" /> Müəllim: <span className="font-medium ml-1">{quiz.teacher.first_name} {quiz.teacher.last_name}</span></p>
                                            <p className="flex items-center"><Clock className="w-4 h-4 mr-1.5" /> Vaxt: <span className="font-medium ml-1">{quiz.duration_minutes} dəqiqə</span></p>
                                            <p className="flex items-center"><Clock className="w-4 h-4 mr-1.5" /> Bitmə Vaxtı: <span className="font-medium ml-1 text-red-500 dark:text-red-400">{timeRemaining}</span></p>
                                        </div>

                                        {/* Bal məlumatı */}
                                        <div className="mt-3 p-2 bg-blue-50 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                                            <p className="font-semibold">Toplam Sual: {totalQuestions}</p>
                                            <p className="font-semibold">Maksimum Bal: {parseFloat(quiz.total_max_score as string).toFixed(2)}</p>
                                            {/* Açıq suallar varsa, tələbəyə məlumat veririk */}
                                            {openQuestionsCount > 0 && (
                                                <p className="text-orange-600 dark:text-orange-400 mt-1 font-medium">
                                                    ⚠️ {openQuestionsCount} açıq sual var. Yekun bal müəllim tərəfindən hesablanacaq.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Quiz-ə Başla Düyməsi */}
                                    <Link
                                        to={`/student/quiz/take/${quiz.id}`}
                                        className="inline-flex items-center px-6 py-3 mt-4 text-white bg-green-600 rounded-lg hover:bg-green-700 transition duration-150 shadow-md transform hover:scale-105"
                                    >
                                        <Zap className="w-5 h-5 mr-2" />
                                        Quiz-ə Başla
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </>
    );
};

export default StudentQuizListPage;