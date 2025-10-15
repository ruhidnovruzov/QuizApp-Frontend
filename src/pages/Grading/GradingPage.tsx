import React, { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { get } from "../../api/service";
import { Loader2, TrendingUp, User, Users, BookOpen } from "lucide-react";
import Swal from 'sweetalert2';
import { Link } from "react-router-dom"; // Səhifə yönləndirməsi üçün

// Məlumat Tipləri
interface QuizResult {
    id: number;
    initial_score: number;
    final_score: number;
    is_graded: boolean;
    quiz_id: number;
    student_id: number;
    quiz: {
        id: number;
        title: string;
        total_max_score: number;
        is_graded: boolean; // Bu, Quiz-in deyil, QuizResult-un olmalıdır, API-dəki uyğunsuzluğu nəzərə alırıq.
    };
    student: {
        first_name: string;
        last_name: string;
        email: string;
        group: { name: string };
    };
}

// Rol məlumatını useAuth-dan gəldiyini fərz edirik
const useUserRole = () => {
    // Təlim məqsədilə:
    const role = 'Teacher'; // və ya 'Admin'
    return {
        isTeacher: role === 'Teacher',
        isAdmin: role === 'Admin',
    };
};

const GradingPage: React.FC = () => {
    // Bu hissədə sizin real `useAuth` hook-unuz olmalıdır
    // Mən `useUserRole` mock-unu istifadə edirəm.
    const { isAdmin } = useUserRole(); 
    
    const [results, setResults] = useState<QuizResult[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Backend-də isAdmin/isTeacher yoxlaması edildiyi üçün sadəcə bu endpoint-i çağırırıq
            const response = await get('/grading/results'); 
            setResults(response.data);
        } catch (err: any) {
            Swal.fire({
                title: 'Xəta!',
                text: err.response?.data?.message || "Nəticələri yükləmək mümkün olmadı.",
                icon: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const pageTitle = isAdmin ? "Bütün Qiymətləndirmə Nəticələri" : "Qiymətləndirilməli Nəticələr";

    if (loading && results.length === 0) {
        return <div className="flex justify-center items-center h-48 text-lg text-gray-700 dark:text-gray-400"><Loader2 className="animate-spin mr-2" /> Nəticələr yüklənir...</div>;
    }

    return (
        <>
            <PageBreadcrumb pageTitle={pageTitle} />

            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">ID</th>
                            <th scope="col" className="px-6 py-3">Tələbə (Qrup)</th>
                            <th scope="col" className="px-6 py-3">Quiz Adı</th>
                            <th scope="col" className="px-6 py-3">Əldə Edilən Bal</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Əməliyyatlar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((result) => {
                            const isGraded = result.is_graded;
                            const scoreDisplay = isGraded 
                                ? `${result.final_score.toFixed(2)} / ${result.quiz.total_max_score.toFixed(2)}`
                                : `${result.initial_score.toFixed(2)} / ${result.quiz.total_max_score.toFixed(2)}*`;

                            return (
                                <tr key={result.id} className="odd:bg-white even:bg-gray-100 odd:dark:bg-gray-900 even:dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-150">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {result.id}
                                    </th>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <User className="w-4 h-4 mr-1 text-indigo-500" />
                                            {result.student.first_name} {result.student.last_name} 
                                            <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-gray-200 text-gray-800 rounded-full dark:bg-gray-600 dark:text-gray-200">
                                                <Users className="w-3 h-3 inline mr-1" /> {result.student.group.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                                        <BookOpen className="w-4 h-4 mr-2 text-blue-500" /> {result.quiz.title}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`font-bold ${isGraded ? 'text-green-600' : 'text-orange-500 dark:text-orange-400'}`}>
                                            {scoreDisplay}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${isGraded ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'}`}>
                                            {isGraded ? 'Tam Qiymətləndirilib' : 'Qiymətləndirilmə Gözləyir'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link
                                            to={`/grading/${result.id}`}
                                            className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition duration-150 
                                            ${isGraded ? 'text-gray-600 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-700' : 'text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'}`}
                                        >
                                            <TrendingUp className="w-4 h-4 mr-1" /> 
                                            {isGraded ? 'Nəticəyə Bax' : 'Qiymətləndir'}
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {results.length === 0 && !loading && (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                        Qiymətləndirilməli heç bir nəticə tapılmadı.
                    </div>
                )}
                <div className="p-4 text-xs text-gray-500 dark:text-gray-400 border-t bg-gray-50 dark:bg-gray-800">
                    * * ilə işarələnmiş bal, yalnız qapalı sualların avtomatik hesablanmış ilkin balıdır. Yekun bal üçün açıq sualların qiymətləndirilməsi tələb olunur.
                </div>
            </div>
        </>
    );
};

export default GradingPage;