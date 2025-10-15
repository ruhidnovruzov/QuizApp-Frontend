// src/pages/Quiz/QuizResultsDetailPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { get } from "../../api/service";
import { Loader2, TrendingUp, User, Users, Trophy, Eye } from "lucide-react";
import Swal from 'sweetalert2';

// Məlumat Tipləri
// ...existing code...
interface ResultDetail {
    id: number;
    total_score: number | string;
    createdAt?: string; // tarix sahəsini əlavə et
    student: {
        first_name: string;
        last_name: string;
        email: string;
        group: { name: string };
    };
}
// ...existing code...

interface QuizResultsData {
    quiz_title: string;
    results: ResultDetail[];
}

const QuizResultsDetailPage: React.FC = () => {
    // URL-dən Quiz ID-sini alırıq
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();

    const [data, setData] = useState<QuizResultsData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        if (!quizId) return;

        try {
            // Backend endpoint-i çağırılır: GET /api/quiz/results/:quizId
            const response = await get(`/quizzes/results/${quizId}`);
            setData(response.data);
        } catch (err: any) {
            Swal.fire({
                title: 'Xəta!',
                text: err.response?.data?.message || "Quiz nəticələrini yükləmək mümkün olmadı.",
                icon: "error"
            });
            // Nəticə tapılmazsa və ya icazə yoxdursa, geri yönləndiririk
            navigate('/teacher/quizzes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [quizId]);

    if (loading) {
        return <div className="flex justify-center items-center h-96 text-lg text-gray-700 dark:text-gray-400"><Loader2 className="animate-spin mr-2" /> Nəticələr yüklənir...</div>;
    }

    if (!data || data.results.length === 0) {
        return (
            <>
                <PageBreadcrumb pageTitle={data?.quiz_title ? `${data.quiz_title} Nəticələri` : "Quiz Nəticələri"} />
                <div className="p-6 text-center text-gray-500 dark:text-gray-400 border rounded-lg bg-white dark:bg-gray-800 shadow-md">
                    Bu Quiz üçün heç bir nəticə tapılmadı. Tələbələr hələ iştirak etməyib.
                </div>
            </>
        );
    }

    const quizTitle = data.quiz_title;

    // Nəticələri ballara görə çeşidləyirik (Backend-də də var, amma frontend-də də təkrar yoxlama zərər verməz)
    const sortedResults = [...data.results].sort((a, b) => Number(b.total_score) - Number(a.total_score));

    return (
        <>
            <PageBreadcrumb pageTitle={`${quizTitle} - Tələbə Nəticələri`} />

            <div className="flex items-center justify-between mb-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg shadow-inner">
                <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-200 flex items-center">
                    <Trophy className="w-6 h-6 mr-2 text-yellow-500" /> {quizTitle} Nəticələri
                </h2>
                <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    Toplam İştirakçı: {sortedResults.length}
                </span>
            </div>

            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Yer</th>
                            <th scope="col" className="px-6 py-3">Tələbə</th>
                            <th scope="col" className="px-6 py-3">Qrup</th>
                            <th scope="col" className="px-6 py-3">Əldə Edilən Bal</th>
                            <th scope="col" className="px-6 py-3">Təqdim Tarixi</th>
                            <th scope="col" className="px-6 py-3">Əməliyyat</th>

                        </tr>
                    </thead>
                    <tbody>
                        {sortedResults.map((result, index) => {
                            const isTop = index < 3;
                            return (
                                <tr key={result.id} className={`border-b ${isTop ? 'bg-yellow-50 dark:bg-yellow-900/50 font-semibold' : 'odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800'} hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-150`}>
                                    <td className="px-6 py-4">
                                        <span className={`text-lg font-bold ${index === 0 ? 'text-yellow-600' : index === 1 ? 'text-gray-500' : index === 2 ? 'text-amber-700' : 'text-gray-500 dark:text-gray-400'}`}>
                                            #{index + 1}
                                        </span>
                                    </td>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        <div className="flex items-center">
                                            <User className="w-4 h-4 mr-1 text-indigo-500" />
                                            {result.student.first_name} {result.student.last_name}
                                        </div>
                                    </th>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full dark:bg-blue-800 dark:text-blue-100">
                                            <Users className="w-3 h-3 inline mr-1" /> {result.student.group.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-lg font-extrabold text-green-600 dark:text-green-400">
                                        {Number(result.total_score).toFixed(2)} Bal
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                        {result.createdAt
                                            ? new Date(result.createdAt).toLocaleString('az-AZ', {
                                                timeZone: 'Asia/Baku',
                                                hour12: false,
                                            })
                                            : '-'}                </td>
                                            <td className="px-6 py-4">
    <button
        onClick={() => navigate(`/teacher/results/detail/${result.id}`)}
        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition duration-150 flex items-center"
        title="Tələbənin cavablarına bax"
    >
        <Eye className="w-5 h-5 mr-1" />
        Detal
    </button>
</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default QuizResultsDetailPage;