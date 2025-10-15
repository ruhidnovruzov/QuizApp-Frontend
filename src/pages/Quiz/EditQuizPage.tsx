// src/pages/EditQuizPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import Input from '../../components/form/input/InputField';
// import Select from '../../components/form/Select'; // <-- Ləğv edildi
import Label from '../../components/form/Label';
import Button from '../../components/ui/button/Button'; 
import { get, put } from '../../api/service'; 
import Swal from 'sweetalert2';
import { PlusCircle, X, Trash2, ArrowLeft, Loader2, Edit } from 'lucide-react';
import moment from 'moment';

// CSS classları üçün sadə bir helper
const selectClass = "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";


// --- Məlumat Tipləri ---
interface Subject { id: number; name: string; }

interface Option {
    id?: number; 
    text: string;
    is_correct: boolean;
}

interface Question {
    id: number; 
    text: string;
    max_score: number; 
    difficulty: 'Easy' | 'Medium' | 'Hard';
    options: Option[]; 
}

interface QuizDataFromServer {
    id: number;
    title: string;
    subject_id: number;
    start_time: string;
    end_time: string;
    questions: {
        id: number;
        text: string;
        max_score: string; 
        difficulty: 'Easy' | 'Medium' | 'Hard';
        options: Option[]; 
    }[];
}

interface QuizFormData {
    title: string;
    subject_id: string | number; // String və ya number ola bilər
    start_time: string;
    end_time: string;
    questions: Question[];
}

const useUserRole = () => ({ isTeacherOrAdmin: true }); 

const EditQuizPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>(); 
    const quizId = Number(id);

    const [formData, setFormData] = useState<QuizFormData | null>(null);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [questionIdCounter, setQuestionIdCounter] = useState(0); 

    const calculateTotalScore = (questions: Question[]) => {
        if (questions.length === 0) return 0;
        return 100; // Bal həmişə 100 olacaq
    };

    const totalScore = formData ? calculateTotalScore(formData.questions) : 0;
    
    // --- 1. Məlumatları Yüklə (Fənlər və Quiz) ---
    const fetchQuizData = useCallback(async () => {
        if (isNaN(quizId)) {
            setError("Yanlış Quiz ID formatı.");
            setLoading(false);
            return;
        }

        try {
            // Fənləri yüklə
            const subjectsResponse = await get('/subjects'); 
            setSubjects(subjectsResponse.data);

            // Quiz məlumatlarını yüklə
            const quizResponse = await get(`/quizzes/${quizId}`);
            const quizData: QuizDataFromServer = quizResponse.data;
            
            // Yüklənmiş datanı Form State-ə uyğunlaşdırırıq
            const mappedQuestions: Question[] = quizData.questions.map(q => ({
                id: q.id, 
                text: q.text,
                max_score: 0, 
                difficulty: q.difficulty,
                options: q.options || [], 
            }));
            
            const maxId = mappedQuestions.length > 0 
                ? Math.max(...mappedQuestions.map(q => q.id)) 
                : 0;
            setQuestionIdCounter(maxId + 1);

            setFormData({
                title: quizData.title,
                // Düzəliş: subject_id API-dən number gəlir, onu stringə çeviririk ki, SELECT elementinin value-su ilə uyğunlaşsın
                subject_id: String(quizData.subject_id),
                start_time: moment(quizData.start_time).format('YYYY-MM-DDTHH:mm'),
                end_time: moment(quizData.end_time).format('YYYY-MM-DDTHH:mm'),
                questions: mappedQuestions,
            });

        } catch (err: any) {
            const msg = err.response?.data?.message || 'Quiz məlumatlarını yükləmək mümkün olmadı.';
            setError(msg);
            Swal.fire({ title: 'Xəta!', text: msg, icon: "error" });
            navigate('/quizzes');
        } finally {
            setLoading(false);
        }
    }, [quizId, navigate]);
    
    useEffect(() => {
        fetchQuizData();
    }, [fetchQuizData]);

    if (loading || !formData) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <span className="ml-3 text-lg font-medium text-gray-700 dark:text-gray-300">Yüklənir...</span>
            </div>
        );
    }


    // --- 2. Ümumi Form Dəyişikliyi ---
    const handleQuizChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev!,
            [e.target.name]: e.target.value,
        }));
    };

    // --- 3. Sual İdarəetməsi ---
    
    const handleAddQuestion = () => {
        setQuestionIdCounter(prev => prev + 1);
        const newQuestion: Question = {
            id: questionIdCounter,
            text: '',
            max_score: 0, 
            difficulty: 'Medium',
            options: [{ text: 'Cavab A', is_correct: true }, { text: 'Cavab B', is_correct: false }, { text: 'Cavab C', is_correct: false }],
        };

        setFormData(prev => ({
            ...prev!,
            questions: [...prev!.questions, newQuestion],
        }));
    };
    
    const handleDeleteQuestion = (id: number) => {
        setFormData(prev => ({
            ...prev!,
            questions: prev!.questions.filter(q => q.id !== id),
        }));
    };
    
    const handleQuestionChange = (id: number, field: 'text' | 'difficulty', value: string) => {
        setFormData(prev => ({
            ...prev!,
            questions: prev!.questions.map(q => 
                q.id === id ? { 
                    ...q, 
                    [field]: value as 'Easy' | 'Medium' | 'Hard', // Tipi dəqiqləşdiririk
                } : q
            ),
        }));
    };

    // --- 4. Cavab Seçimi İdarəetməsi ---
    
    const handleOptionChange = (qId: number, index: number, text: string) => {
        setFormData(prev => ({
            ...prev!,
            questions: prev!.questions.map(q => {
                if (q.id === qId) {
                    const newOptions = [...q.options];
                    newOptions[index].text = text;
                    return { ...q, options: newOptions };
                }
                return q;
            }),
        }));
    };
    
    const handleCorrectOptionChange = (qId: number, index: number) => {
        setFormData(prev => ({
            ...prev!,
            questions: prev!.questions.map(q => {
                if (q.id === qId) {
                    const newOptions = q.options.map((opt, i) => ({
                        ...opt,
                        is_correct: i === index, 
                    }));
                    return { ...q, options: newOptions };
                }
                return q;
            }),
        }));
    };
    
    const handleAddOption = (qId: number) => {
         setFormData(prev => ({
            ...prev!,
            questions: prev!.questions.map(q => {
                if (q.id === qId) {
                    return { 
                        ...q, 
                        options: [...q.options, { text: '', is_correct: false }] 
                    };
                }
                return q;
            }),
        }));
    };
    
    const handleDeleteOption = (qId: number, index: number) => {
        setFormData(prev => ({
            ...prev!,
            questions: prev!.questions.map(q => {
                if (q.id === qId && q.options.length > 2) { 
                    const newOptions = q.options.filter((_, i) => i !== index);
                    if (q.options[index].is_correct && newOptions.length > 0) {
                        newOptions[0].is_correct = true;
                    }
                    return { ...q, options: newOptions };
                }
                return q;
            }),
        }));
    };

    // --- 5. Formu Göndərmə (PUT əməliyyatı) ---
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        // Validasiya
        if (!formData.title || !formData.subject_id || !formData.start_time || !formData.end_time || formData.questions.length === 0) {
            setError("Zəhmət olmasa, başlıq, fənn, vaxtları daxil edin və ən azı bir sual əlavə edin.");
            setIsSaving(false);
            return;
        }

        const invalidQuestion = formData.questions.find(q => 
            !q.text.trim() || q.options.filter(opt => opt.text.trim()).length < 2 || q.options.filter(opt => opt.is_correct).length !== 1
        );
        if (invalidQuestion) {
            setError("Bütün sualların mətni təyin edilməli, ən az 2 cavab seçimi olmalı və düzgün cavab **tək** olmalıdır.");
            setIsSaving(false);
            return;
        }

        try {
            // API-yə göndərilən data
            const dataToSend = {
                title: formData.title,
                subject_id: Number(formData.subject_id),
                start_time: formData.start_time,
                end_time: formData.end_time,
                questions: formData.questions.map(q => ({
                    id: q.id > 0 && q.id < questionIdCounter ? q.id : undefined, 
                    text: q.text,
                    type: 'Closed', 
                    difficulty: q.difficulty,
                    options: q.options.map(opt => ({
                        id: opt.id || undefined, 
                        text: opt.text,
                        is_correct: opt.is_correct
                    }))
                }))
            };

            await put(`/quizzes/${quizId}`, dataToSend);
            
            Swal.fire({
                title: 'Uğurlu!',
                text: `Quiz uğurla yeniləndi.`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                customClass: { popup: 'z-[99999]' }
            });
            
            navigate('/quizzes'); 

        } catch (err: any) {
            const msg = err.response?.data?.message || 'Quiz yeniləmə zamanı xəta baş verdi.';
            setError(msg);
            
        } finally {
            setIsSaving(false);
        }
    };
    
    // --- Render Hissəsi üçün Sual Komponenti ---
    
    const QuestionItem: React.FC<{ question: Question }> = ({ question }) => {
        const scorePerQuestion = (100 / formData.questions.length).toFixed(2);
        const questionIndex = formData.questions.findIndex(q => q.id === question.id);
        
        const displayScore = questionIndex === 0 && formData.questions.length > 0
            ? (100 - (formData.questions.length - 1) * parseFloat(scorePerQuestion)).toFixed(2)
            : scorePerQuestion;
            
        return (
            <div key={question.id} className="bg-gray-50 dark:bg-gray-700 p-4 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm mb-4">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Sual #{questionIndex + 1}
                    </h3>
                    <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleDeleteQuestion(question.id)}
                        title="Sualı Sil"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
                
                {/* Sual Mətni */}
                <div className="mb-3">
                    <Label htmlFor={`q-text-${question.id}`}>Sual Mətni *</Label>
                    <Input
                        id={`q-text-${question.id}`}
                        value={question.text}
                        onChange={(e) => handleQuestionChange(question.id, 'text', e.target.value)}
                        placeholder="Sualınızı daxil edin"
                    />
                </div>
                
                {/* Bal və Çətinlik */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="col-span-1 p-3 bg-green-50 dark:bg-green-900 rounded-lg text-center">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Bu Sualın Balı:</p>
                        <p className="text-xl font-extrabold text-green-700 dark:text-green-300">
                            {displayScore}
                        </p>
                    </div>
                    
                    <div className="md:col-span-2">
                        <Label htmlFor={`q-difficulty-${question.id}`}>Çətinlik *</Label>
                        {/* Düzəliş: Xüsusi komponent yerinə sadə HTML select */}
                        <select
                            id={`q-difficulty-${question.id}`}
                            name="difficulty"
                            value={question.difficulty} // Dəyər API-dən gələn ("Medium") ilə uyğun gəlir
                            onChange={(e) => handleQuestionChange(question.id, 'difficulty', e.target.value)}
                            className={selectClass}
                        >
                            {/* Option dəyərləri API-dən gələn dəyərlərlə tam uyğun olmalıdır */}
                            <option value="Easy">Asan</option>
                            <option value="Medium">Orta</option>
                            <option value="Hard">Çətin</option>
                        </select>
                    </div>
                </div>
                
                {/* Cavab Seçimləri */}
                <div className="mt-4 border-t pt-4 border-gray-200 dark:border-gray-600">
                    <h4 className="text-md font-semibold mb-2 text-gray-800 dark:text-gray-200">Cavab Seçimləri (Yalnız birini düzgün seçin) *</h4>
                    {question.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                            <input
                                type="radio"
                                id={`q-${question.id}-opt-${index}`}
                                name={`correct_option_${question.id}`}
                                checked={option.is_correct}
                                onChange={() => handleCorrectOptionChange(question.id, index)}
                                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500"
                            />
                            <Input
                                id={`opt-text-${question.id}-${index}`}
                                value={option.text}
                                onChange={(e) => handleOptionChange(question.id, index, e.target.value)}
                                placeholder={`Seçim ${index + 1} mətnini daxil edin`}
                                className={option.is_correct ? 'border-green-500 ring-1 ring-green-500' : ''}
                            />
                            {question.options.length > 2 && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleDeleteOption(question.id, index)}
                                    title="Seçimi Sil"
                                >
                                    <X className="w-4 h-4 text-red-500" />
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleAddOption(question.id)}
                        className="mt-2 text-blue-600 dark:text-blue-400"
                    >
                        <PlusCircle className="w-4 h-4 mr-1" /> Seçim Əlavə Et
                    </Button>
                </div>
            </div>
        );
    };


    return (
        <>
            <PageBreadcrumb pageTitle={`Quiz Redaktə (${quizId})`} />
            
            <button
                onClick={() => navigate('/quizzes')}
                className="inline-flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 mb-4"
            >
                <ArrowLeft className="w-4 h-4 mr-1" /> Quiz Siyahısına Qayıt
            </button>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Error Mesajı */}
                {error && (
                    <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-300" role="alert">{error}</div>
                )}
                
                {/* 1. Quiz Parametrləri */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-blue-200 dark:border-blue-700">
                    <h2 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-400 flex items-center">
                        <Edit className="w-5 h-5 mr-2" /> 1. Əsas Məlumatlar
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Başlıq */}
                        <div className="md:col-span-2">
                            <Label htmlFor="title">Quiz Başlığı *</Label>
                            <Input
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleQuizChange}
                                placeholder="Məsələn: Viza İmtahanı - 1-ci Hissə"
                            />
                        </div>
                        
                        {/* Fənn Seçimi */}
                        <div className="md:col-span-2">
                            <Label htmlFor="subject_id">Fənn *</Label>
                            {/* Düzəliş: Xüsusi komponent yerinə sadə HTML select */}
                            <select
                                id="subject_id"
                                name="subject_id"
                                value={formData.subject_id} // value olaraq string (məsələn: "1") istifadə olunur
                                onChange={handleQuizChange}
                                disabled={subjects.length === 0 || isSaving}
                                className={selectClass}
                            >
                                <option value="" disabled>Fənn seçin</option>
                                {subjects.map(sub => (
                                    <option key={sub.id} value={String(sub.id)}>
                                        {sub.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Başlama Vaxtı */}
                        <div>
                            <Label htmlFor="start_time">Başlama Vaxtı *</Label>
                            <Input
                                id="start_time"
                                name="start_time"
                                type="datetime-local"
                                value={formData.start_time}
                                onChange={handleQuizChange}
                            />
                        </div>
                        
                        {/* Bitmə Vaxtı */}
                        <div>
                            <Label htmlFor="end_time">Bitmə Vaxtı *</Label>
                            <Input
                                id="end_time"
                                name="end_time"
                                type="datetime-local"
                                value={formData.end_time}
                                onChange={handleQuizChange}
                            />
                        </div>
                        
                        {/* Ümumi Bal Göstəricisi */}
                        <div className="md:col-span-2 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg text-center">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Quiz Ümumi Balı:</p>
                            <p className={`text-2xl font-extrabold text-green-600`}>
                                100.00 Bal
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Sual Sayı: {formData.questions.length} | Hər sualın balı avtomatik hesablanır.
                            </p>
                        </div>
                        
                    </div>
                </div>
                
                {/* 2. Suallar Hissəsi */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-300 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">2. Suallar ({formData.questions.length})</h2>
                        <Button type="button" onClick={handleAddQuestion} disabled={isSaving} variant="primary">
                            <PlusCircle className="w-5 h-5 mr-1" /> Sual Əlavə Et
                        </Button>
                    </div>

                    <div className="mt-4 space-y-4">
                        {formData.questions.length === 0 ? (
                             <div className="p-4 text-center text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                Quiz-ə heç bir sual əlavə edilməyib.
                            </div>
                        ) : (
                            formData.questions.map(q => <QuestionItem key={q.id} question={q} />)
                        )}
                    </div>
                </div>

                {/* Yaddaş Buttonu */}
                 <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isSaving || formData.questions.length === 0} variant="success">
                        {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : 'Quiz-i YENİLƏ'}
                    </Button>
                </div>
                
            </form>
        </>
    );
};

export default EditQuizPage;