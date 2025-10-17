// src/pages/Student/StudentResults.tsx (RESPONSIVE VERSION)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { get } from "../../api/service";
// Yeni ikonlar əlavə edildi
import { Loader2, Eye, Calendar, Trophy, Send, Hash, Target, CheckCircle } from "lucide-react"; 
import Swal from 'sweetalert2';

// --- TİPLƏR ---
interface Result {
    id: number;
    quiz_title: string;
    total_max_score: number | string;
    total_score: number | string;
    createdAt: string; // Təqdim tarixi
}

// --- KOMPONENT ---

const StudentResults: React.FC = () => {
    const navigate = useNavigate();
    
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(true);

    // API-dən tələbənin öz nəticələrini gətiririk
    const fetchResults = async () => {
        setLoading(true);
        try {
            const response = await get('/quizzes/my-results'); 
            setResults(response.data.results || []);
        } catch (err: any) {
            Swal.fire({
                title: 'Xəta!',
                text: err.response?.data?.message || "Nəticələri yükləmək mümkün olmadı.",
                icon: "error"
            });
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();
    }, []);

    // Təqdim Tarixini formatlayan köməkçi funksiya
    const formatSubmissionDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('az-AZ', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    };
    
    // Detallı nəticə səhifəsinə yönləndirmə funksiyası
    const handleViewDetails = (resultId: number) => {
        navigate(`/student/results/detail/${resultId}`);
    };

    // --- Mobil/Kart Görünüşü Komponenti ---
    const MobileResultCard: React.FC<{ result: Result }> = ({ result }) => {
        // Bal qiymətlərini formatlayırıq
        const score = Number(result.total_score).toFixed(2);
        const maxScore = Number(result.total_max_score).toFixed(2);

        return (
            <div key={result.id} className="bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 mb-4 flex flex-col">
                
                {/* 1. Başlıq və ID */}
                <div className="flex justify-between items-center border-b pb-2 mb-3 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex-1 mr-2">
                        {result.quiz_title}
                    </h3>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center p-1 px-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                         ID: {result.id}
                    </span>
                </div>

                {/* 2. Ballar (Grid formatında) */}
                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                    
                    {/* Maksimum Bal */}
                    <div className="flex items-center">
                        <Target className="w-4 h-4 mr-2 text-red-500" />
                        <span className="font-medium">Maks. Bal:</span>
                        <span className="ml-2 font-bold">{maxScore}</span>
                    </div>

                    {/* Əldə Edilən Bal */}
                    <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        <span className="font-medium">Nəticə:</span>
                        <span className="ml-2 font-extrabold text-green-600 dark:text-green-400 text-lg">{score}</span>
                    </div>

                    {/* Təqdim Tarixi */}
                    <div className="flex items-center col-span-2">
                        <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                        <span className="font-medium">Təqdim Tarixi:</span>
                        <span className="ml-2 text-xs font-medium">{formatSubmissionDate(result.createdAt)}</span>
                    </div>
                </div>

                {/* 3. Əməliyyat Düyməsi */}
                <div className="mt-2 pt-2 border-t dark:border-gray-700">
                    <button
                        onClick={() => handleViewDetails(result.id)}
                        className="w-full text-center inline-flex items-center justify-center px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md font-semibold text-sm"
                        title="Cavab Detallarına Bax"
                    >
                        <Eye className="w-5 h-5 mr-2" />
                        Detalına Bax
                    </button>
                </div>
            </div>
        );
    };
    // ---------------------------------------------


    if (loading) {
        return <div className="flex justify-center items-center h-96 text-lg text-gray-700 dark:text-gray-400"><Loader2 className="animate-spin mr-2" /> Nəticələr yüklənir...</div>;
    }

    return (
        <>
            <PageBreadcrumb pageTitle="Mənim Quiz Nəticələrim" />
            
            <div className="bg-white dark:bg-gray-800 p-2 rounded-xl shadow-lg mb-8 border-t-4 border-indigo-600">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center mb-4">
                    <Trophy className="w-6 h-6 mr-2 text-yellow-500" /> İştirak etdiyim Quizlər
                </h2>
                
                {results.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400 border rounded-lg">
                        Heç bir quiz nəticəsi tapılmadı. Ola bilsin ki, hələ heç bir quizə iştirak etməmisiniz.
                    </div>
                ) : (
                    <>
                        {/* 1. DESKTOP CƏDVƏL GÖRÜNÜŞÜ */}
                        <div className="hidden md:block relative overflow-x-auto shadow-md sm:rounded-lg">
                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Quiz Adı</th>
                                        <th scope="col" className="px-6 py-3">Maks. Bal</th>
                                        <th scope="col" className="px-6 py-3">Əldə Edilən Bal</th>
                                        <th scope="col" className="px-6 py-3">Təqdim Tarixi</th>
                                        <th scope="col" className="px-6 py-3">Əməliyyat</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map((result) => (
                                        <tr key={result.id} className="odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-150">
                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                {result.quiz_title}
                                            </th>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                                {Number(result.total_max_score).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-lg font-extrabold text-green-600 dark:text-green-400">
                                                {Number(result.total_score).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                                                    <Calendar className="w-4 h-4 mr-1 text-indigo-500" />
                                                    {formatSubmissionDate(result.createdAt)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleViewDetails(result.id)}
                                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium flex items-center"
                                                    title="Cavab Detallarına Bax"
                                                >
                                                    <Eye className="w-5 h-5 mr-1" />
                                                    Detal
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* 2. MOBİL KART GÖRÜNÜŞÜ */}
                        <div className="md:hidden">
                            {results.map((result) => (
                                <MobileResultCard key={result.id} result={result} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default StudentResults;