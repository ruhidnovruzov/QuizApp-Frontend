// src/pages/QuizPage.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { get, del } from "../../api/service"; // post və put lazım deyil
import { PlusCircle, SquarePen, Trash2, Loader2, BookOpen, Clock } from "lucide-react"; 
import Swal from 'sweetalert2';
import moment from 'moment'; // Tarix formatı üçün (və ya başqa bir kitabxana)

// --- Məlumat Tipləri ---
interface Quiz {
    id: number;
    title: string;
    total_max_score: number;
    start_time: string; // ISO 8601 formatı
    end_time: string;   // ISO 8601 formatı
    subject: { 
        name: string; 
        group: { name: string };
    };
    _count: {
        questions: number;
        results: number;
    };
}

// Fərz edirik ki, bu funksiya cari istifadəçi rolunu döndərir (məs: Auth Contextdən)
const useUserRole = () => {
    // Gerçək tətbiqdə Auth Contextdən gəlməlidir.
    return { 
        isAdmin: true, // Təlim məqsədilə
        isTeacher: true 
    };
};

const QuizPage: React.FC = () => {
    const navigate = useNavigate();
    const { isAdmin, isTeacher } = useUserRole();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Yalnız Admin və Müəllim bu səhifəyə daxil ola bilər (Routing-də yoxlanılmalıdır)
    if (!isAdmin && !isTeacher) {
        // Burada istifadəçini Dashboard-a və ya 403 səhifəsinə yönləndirmək lazımdır.
    }


    // --- 1. Quizləri API-dən yüklə ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await get('/quizzes'); 
            setQuizzes(response.data); 
        } catch (err: any) {
            Swal.fire({
                title: 'Xəta!',
                text: err.response?.data?.message || "Quizləri yükləmək mümkün olmadı.",
                icon: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);


    // --- 2. DELETE (Quiz-i Sil) ---
    const handleDelete = async (id: number, title: string) => {
        
        const result = await Swal.fire({
            title: "Əminsiniz?",
            text: `"${title}" Quiz-i silindikdə, ona aid bütün suallar və cavab nəticələri silinəcək!`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Bəli, Sil!",
            cancelButtonText: "Xeyr, Ləğv Et",
            customClass: { popup: 'z-[99999]' }
        });

        if (!result.isConfirmed) return; 
        
        try {
            await del(`/quizzes/${id}`); // Təbii ki, bu DELETE əməliyyatını backenddə hazırlamaq lazımdır.
            fetchData(); 

            Swal.fire({ title: "Silindi!", text: "Quiz uğurla silindi.", icon: "success", timer: 2000, showConfirmButton: false });

        } catch (err: any) {
            const msg = err.response?.data?.message || "Silinmə zamanı xəta baş verdi. (Bəlkə də hələ backenddə delete funksiyası yoxdur?)";
            Swal.fire({ title: "Xəta!", text: msg, icon: "error" });
        }
    };
    
    // Tarix/Vaxt formatlaşdırma funksiyası
    const formatDateTime = (isoString: string) => {
        return moment(isoString).format('DD MMM HH:mm');
    };

    // Vəziyyəti yoxlayan funksiya
    const getStatus = (start: string, end: string) => {
        const now = moment();
        const startTime = moment(start);
        const endTime = moment(end);

        if (now.isBefore(startTime)) {
            return { text: 'Gözlənilir', className: 'bg-yellow-100 text-yellow-800' };
        } else if (now.isBetween(startTime, endTime)) {
            return { text: 'Aktiv', className: 'bg-green-100 text-green-800' };
        } else {
            return { text: 'Bitib', className: 'bg-red-100 text-red-800' };
        }
    };


    if (loading && quizzes.length === 0) {
        return <div className="flex justify-center items-center h-48 text-lg text-gray-700 dark:text-gray-400"><Loader2 className="animate-spin mr-2" /> Quizlər yüklənir...</div>;
    }

    return (
        <>
            <PageBreadcrumb pageTitle="Quiz İdarəetməsi" />
            
            <div className="mb-4 flex justify-end">
                 <button
                    onClick={() => navigate('/quizzes/create')} // Naviqasiya təmin edilir
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Yeni Quiz Yarat
                </button>
            </div>

            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Başlıq</th>
                            <th scope="col" className="px-6 py-3">Fənn / Qrup</th>
                            <th scope="col" className="px-6 py-3">Bal / Sual Sayı</th>
                            <th scope="col" className="px-6 py-3">Başlama / Bitmə</th>
                            <th scope="col" className="px-6 py-3">Vəziyyət</th>
                            <th scope="col" className="px-6 py-3">Əməliyyatlar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quizzes.map((quiz) => {
                            const status = getStatus(quiz.start_time, quiz.end_time);
                            
                            return (
                                <tr key={quiz.id} className="odd:bg-white even:bg-gray-100 odd:dark:bg-gray-900 even:dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-150">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {quiz.title}
                                    </th>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold">{quiz.subject.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Qrup: {quiz.subject.group.name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-green-600 dark:text-green-400">{quiz.total_max_score} Bal</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{quiz._count.questions} Sual</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                        <Clock className="w-4 h-4 inline mr-1 text-blue-500" /> {formatDateTime(quiz.start_time)} - {formatDateTime(quiz.end_time)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.className}`}>
                                            {status.text}
                                        </span>
                                    </td>
                                    
                                    <td className="px-6 py-4 flex space-x-3">
                                      <button 
                                            onClick={() => navigate(`/teacher/quizzes/results/${quiz.id}`)} 
                                            className="font-medium text-purple-600 dark:text-purple-500 hover:underline inline-flex items-center"
                                            title="Nəticələrə bax"
                                        >
                                            <BookOpen className="w-4 h-4 mr-1" /> Results
                                      </button>
                                        <button 
                                            onClick={() => navigate(`/quizzes/edit/${quiz.id}`)} 
                                            className="font-medium text-blue-600 dark:text-blue-500 hover:underline inline-flex items-center"
                                            title="Redaktə et"
                                        >
                                            <SquarePen className="w-4 h-4 mr-1" /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(quiz.id, quiz.title)}
                                            className="font-medium text-red-600 dark:text-red-500 hover:underline inline-flex items-center"
                                            title="Sil"
                                        >
                                            <Trash2 className="w-4 h-4 mr-1" /> Delete
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                 {quizzes.length === 0 && !loading && (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                        Heç bir quiz tapılmadı. Yeni bir quiz yaradın.
                    </div>
                )}
            </div>
            
        </>
    );
};

export default QuizPage;