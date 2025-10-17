import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { get } from "../../api/service";
// Yeni ikonlar əlavə edildi
import { Loader2, Zap, Clock, User, BookOpen, ChevronRight, Tag, ListChecks, Calendar, AlertTriangle } from "lucide-react"; 
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

    // Vaxt formatı funksiyası (daha qısa, mobil üçün uyğun)
    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' });
    };


    if (loading && quizzes.length === 0) {
        return <div className="flex justify-center items-center h-48 text-lg text-gray-700 dark:text-gray-400"><Loader2 className="animate-spin mr-2" /> Aktiv Quizlər yüklənir...</div>;
    }
    
    // --- Responsive Kart Komponenti ---
    const QuizCard: React.FC<{ quiz: AvailableQuiz }> = ({ quiz }) => {
        const totalQuestions = quiz.questions.length;
        const openQuestionsCount = quiz.questions.filter(q => q.type === 'Open').length;
        
        // Mobile və Desktop üçün əsas kart dizaynı
        return (
            <div key={quiz.id} className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition duration-300 flex flex-col">
                
                {/* 1. BAŞLIQ VƏ FƏNN */}
                <div className="border-b pb-3 mb-3 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center">
                        <Zap className="w-5 h-5 mr-2 text-yellow-500" /> {quiz.title}
                    </h2>
                    <p className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
                        <BookOpen className="w-4 h-4 mr-1.5" /> {quiz.subject.name}
                    </p>
                </div>

                {/* 2. STATİSTİKA (Grid formatında - mobildə alt-alta, böyükdə yan-yana) */}
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400 flex-1">
                    
                    {/* Sual Sayı */}
                    <div className="flex items-center">
                        <ListChecks className="w-4 h-4 mr-1.5 text-indigo-500" /> 
                        <span>Sual Sayı: <span className="font-semibold text-gray-800 dark:text-gray-200">{totalQuestions}</span></span>
                    </div>

                    {/* Maks. Bal */}
                    <div className="flex items-center">
                        <Tag className="w-4 h-4 mr-1.5 text-green-600" /> 
                        <span>Maks. Bal: <span className="font-semibold text-green-600 dark:text-green-400">{parseFloat(quiz.total_max_score as string).toFixed(2)}</span></span>
                    </div>

                    {/* Müddət */}
                    <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1.5 text-orange-500" /> 
                        <span>Müddət: <span className="font-semibold text-gray-800 dark:text-gray-200">{quiz.duration_minutes} dəq</span></span>
                    </div>
                    
                    {/* Müəllim */}
                    <div className="flex items-center">
                        <User className="w-4 h-4 mr-1.5 text-gray-500" /> 
                        <span>Müəllim: <span className="font-semibold">{quiz.teacher.first_name} {quiz.teacher.last_name}</span></span>
                    </div>

                </div>

                {/* 3. BİTMƏ VAXTI */}
                <div className="mt-3 pt-3 border-t dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">
                    <p className="flex items-center font-medium text-red-600 dark:text-red-400">
                        <Calendar className="w-4 h-4 mr-1.5" /> 
                        Bitmə Tarixi: <span className="ml-1 font-bold">{formatDate(quiz.end_time)}</span>
                        <span className="ml-2">saat: <span className="font-bold">{formatTime(quiz.end_time)}</span></span>
                    </p>
                    
                    {/* Açıq suallar xəbərdarlığı */}
                    {openQuestionsCount > 0 && (
                        <p className="text-orange-600 dark:text-orange-400 mt-1 font-medium flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-1.5" />
                            {openQuestionsCount} açıq sual var. Nəticəni müəllim təsdiqləyəcək.
                        </p>
                    )}
                </div>

                {/* 4. DÜYMƏ (Həmişə tam en) */}
                <Link
                    to={`/student/quiz/take/${quiz.id}`}
                    className="mt-4 w-full text-center inline-flex items-center justify-center px-4 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition duration-150 shadow-md transform hover:scale-[1.01] font-semibold"
                >
                    <Zap className="w-5 h-5 mr-2" />
                    Quiz-ə Başla
                    <ChevronRight className="w-4 h-4 ml-2" />
                </Link>

            </div>
        );
    };
    // ---------------------------------------------


    return (
        <>
            <PageBreadcrumb pageTitle="Aktiv Quizlər" />

            <div className="space-y-4">
                {quizzes.length === 0 && !loading ? (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400 border rounded-lg bg-white dark:bg-gray-800 shadow-md">
                        Hal-hazırda qoşula biləcəyiniz aktiv Quiz tapılmadı.
                    </div>
                ) : (
                    // Kartları həm mobil, həm də desktopda alt-alta göstəririk, çünki bu siyahı formatıdır
                    quizzes.map((quiz) => (
                        <QuizCard key={quiz.id} quiz={quiz} />
                    ))
                )}
            </div>
        </>
    );
};

export default StudentQuizListPage;