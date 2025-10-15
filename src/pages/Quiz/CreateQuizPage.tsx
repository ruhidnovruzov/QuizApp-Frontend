// src/pages/CreateQuizPage.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';
import Label from '../../components/form/Label';
import Button from '../../components/ui/button/Button';
import { get, post } from '../../api/service';
import Swal from 'sweetalert2';
import { PlusCircle, X, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import moment from 'moment';


// --- Məlumat Tipləri ---
interface Subject { id: number; name: string; }

interface Option {
    text: string;
    is_correct: boolean;
}

interface Question {
    id: number; // Frontend üçün id
    text: string;
    // type: 'Closed'; // Sabit olduğu üçün ləğv olundu
    max_score: number; // Frontenddə dinamik hesablanacaq
    difficulty: 'Easy' | 'Medium' | 'Hard';
    options: Option[];
}

interface QuizFormData {
    title: string;
    subject_id: string | number;
    start_time: string;
    end_time: string;
    questions: Question[];
}

const useUserRole = () => ({ isTeacherOrAdmin: true });

// Ayrı komponent: render zamanı identitet dəyişməsin deyə kənara çıxarıldı
const QuestionItem: React.FC<{
    question: Question;
    questionIndex: number;
    totalQuestions: number;
    onDeleteQuestion: (id: number) => void;
    onQuestionChange: (id: number, field: 'text' | 'difficulty', value: string) => void;
    onOptionChange: (qId: number, index: number, text: string) => void;
    onCorrectOptionChange: (qId: number, index: number) => void;
    onDeleteOption: (qId: number, index: number) => void;
    onAddOption: (qId: number) => void;
}> = ({
    question,
    questionIndex,
    totalQuestions,
    onDeleteQuestion,
    onQuestionChange,
    onOptionChange,
    onCorrectOptionChange,
    onDeleteOption,
    onAddOption,
}) => {
        const scorePerQuestion = (100 / Math.max(totalQuestions, 1)).toFixed(2);
        const displayScore = questionIndex === 0 && totalQuestions > 0
            ? (100 - (totalQuestions - 1) * parseFloat(scorePerQuestion)).toFixed(2)
            : scorePerQuestion;

        return (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm mb-4">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Sual #{questionIndex + 1}
                    </h3>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteQuestion(question.id)}
                        title="Sualı Sil"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>

                {/* Sual Mətni */}
                <div className="mb-3">
                    <Label htmlFor={`q-text-${question.id}`}>Sual Mətni *</Label>
                    <input
                        id={`q-text-${question.id}`}
                        name="text"
                        value={question.text}
                        onChange={(e) => onQuestionChange(question.id, 'text', e.target.value)}
                        placeholder="Sualınızı daxil edin"
                        className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm"
                        autoFocus={false}
                    />
                </div>

                {/* Bal və Çətinlik */}
                <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="col-span-1 p-3 bg-green-50 dark:bg-green-900 rounded-lg text-center">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Bu Sualın Balı:</p>
                        <p className="text-xl font-extrabold text-green-700 dark:text-green-300">
                            {displayScore}
                        </p>
                    </div>

                    <div className="col-span-2">
                        <Label htmlFor={`q-difficulty-${question.id}`}>Çətinlik</Label>
                        <Select
                            id={`q-difficulty-${question.id}`}
                            name="difficulty"
                            value={question.difficulty}
                            onChange={(e) => onQuestionChange(question.id, 'difficulty', e.target.value as 'Easy' | 'Medium' | 'Hard')}
                            options={[
                                { value: "Easy", label: "Asan" },
                                { value: "Medium", label: "Orta" },
                                { value: "Hard", label: "Çətin" }
                            ]}
                            placeholder="Çətinlik seçin"
                        />

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
                                onChange={() => onCorrectOptionChange(question.id, index)}
                                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500"
                            />
                            <Input
                                id={`opt-text-${question.id}-${index}`}
                                value={option.text}
                                onChange={(e) => onOptionChange(question.id, index, e.target.value)}
                                placeholder={`Seçim ${index + 1} mətnini daxil edin`}
                                className={option.is_correct ? 'border-green-500 ring-1 ring-green-500' : ''}
                            />
                            {question.options.length > 2 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onDeleteOption(question.id, index)}
                                    title="Seçimi Sil"
                                >
                                    <X className="w-4 h-4 text-red-500" />
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onAddOption(question.id)}
                        className="mt-2 text-blue-600 dark:text-blue-400"
                    >
                        <PlusCircle className="w-4 h-4 mr-1" /> Seçim Əlavə Et
                    </Button>
                </div>
            </div>
        );
    };

const CreateQuizPage: React.FC = () => {
    const navigate = useNavigate();
    const { isTeacherOrAdmin } = useUserRole();

    // YENİLƏNMİŞ Qeyd: Açıq sual yoxdur, max_score daxil edilmir.
    // const DEFAULT_QUESTION_SCORE = 100; // istifadə olunmur

    // State-lər
    const [formData, setFormData] = useState<QuizFormData>({
        title: '',
        subject_id: '',
        start_time: moment().format('YYYY-MM-DDTHH:mm'),
        end_time: moment().add(1, 'hour').format('YYYY-MM-DDTHH:mm'),
        questions: [],
    });
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const nextQuestionIdRef = useRef(0);

    // Yeni: Müəllimin quizləri və import üçün seçilmiş quiz
    const [myQuizzes, setMyQuizzes] = useState<{ id: number; title: string }[]>([]);
    const [selectedQuizToImport, setSelectedQuizToImport] = useState<string>('');
    const [importingQuestions, setImportingQuestions] = useState(false);
    // Müəllimin quizlərini yüklə
    const fetchMyQuizzes = useCallback(async () => {
        try {
            const response = await get('/quizzes/my-quiz-list');
            if (response.data && Array.isArray(response.data.quizzes)) {
                setMyQuizzes(response.data.quizzes);
            }
        } catch (err) {
            // Xəta olsa, sadəcə siyahı boş qalsın
        }
    }, []);


    // YENİ: Ümumi balı avtomatik hesablayan funksiya
    const calculateTotalScore = (questions: Question[]) => {
        if (questions.length === 0) return 0;

        const scorePerQuestion = 100 / questions.length;
        // Bütün sualların balını yeni hesablanmış dəyərlə yeniləyir
        return questions.reduce((sum) => sum + scorePerQuestion, 0);
    };

    // const totalScore = calculateTotalScore(formData.questions); // istifadə olunmur

    // --- 1. Məlumatları Yüklə (Fənlər) ---
    const fetchSubjects = useCallback(async () => {
        try {
            const response = await get('/subjects');
            setSubjects(response.data);
            if (response.data.length > 0) {
                // --- ❌ BU HİSSƏDƏKİ İLK DƏYƏRİN TƏYİN OLUNMASINI SİLİN VƏ YA ŞƏRHƏ ALIN ---
                // setFormData(prev => ({ 
                //     ...prev, 
                //     subject_id: response.data[0].id // İlk fənni default seçməyi ləğv etdik
                // }));
            }
        } catch (err) {
            Swal.fire({
                title: 'Xəta!',
                text: "Fənləri yükləmək mümkün olmadı. Lütfən yenidən cəhd edin.",
                icon: "error"
            });
        }
    }, []);

    useEffect(() => {
        fetchSubjects();
        fetchMyQuizzes();
    }, [fetchSubjects, fetchMyQuizzes]);
    // Quizdən sualları import et
    const handleImportQuizQuestions = async (quizIdStr: string) => {
        setSelectedQuizToImport(quizIdStr);
        if (!quizIdStr) return;
        setImportingQuestions(true);
        setError(null);
        try {
            const quizId = Number(quizIdStr);
            if (isNaN(quizId)) {
                setError('Seçilmiş quiz ID-si yanlışdır.');
                setImportingQuestions(false);
                return;
            }
            // Quizin suallarını al
            const resp = await get(`/quizzes/${quizId}`);
            if (resp.data && Array.isArray(resp.data.questions)) {
                // Import olunan suallara yeni frontend id ver
                let nextId = nextQuestionIdRef.current;
                const importedQuestions = resp.data.questions.map((q: any, idx: number) => {
                    nextId += 1;
                    return {
                        id: nextId,
                        text: q.text,
                        max_score: 0,
                        difficulty: q.difficulty || 'Medium',
                        options: (q.options || q.closedOptions || []).map((opt: any) => ({
                            text: opt.text,
                            is_correct: opt.is_correct
                        }))
                    };
                });
                nextQuestionIdRef.current = nextId;
                setFormData(prev => ({
                    ...prev,
                    questions: importedQuestions
                }));
            } else {
                setError('Seçilmiş quizdə suallar tapılmadı.');
            }
        } catch (err) {
            setError('Quiz sualları import edilə bilmədi.');
        } finally {
            setImportingQuestions(false);
        }
    };

    // --- 2. Ümumi Form Dəyişikliyi ---
    const handleQuizChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // --- 3. Sual İdarəetməsi ---

    const handleAddQuestion = () => {
        const newId = nextQuestionIdRef.current + 1;
        nextQuestionIdRef.current = newId;
        const newQuestion: Question = {
            id: newId,
            text: '',
            // type: 'Closed', // Sabit olaraq qalır
            max_score: 0, // Backenddə hesablanacaq
            difficulty: 'Medium',
            options: [
                { text: 'Cavab A', is_correct: true },
                { text: 'Cavab B', is_correct: false },
                { text: 'Cavab C', is_correct: false }
            ],
        };

        setFormData(prev => ({
            ...prev,
            questions: [...prev.questions, newQuestion],
        }));
    };

    const handleDeleteQuestion = (id: number) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.filter(q => q.id !== id),
        }));
    };

    const handleQuestionChange = (id: number, field: 'text' | 'difficulty', value: string) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.map(q =>
                q.id === id ? {
                    ...q,
                    [field]: value,
                } : q
            ),
        }));
    };

    // --- 4. Cavab Seçimi İdarəetməsi ---

    const handleOptionChange = (qId: number, index: number, text: string) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.map(q => {
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
            ...prev,
            questions: prev.questions.map(q => {
                if (q.id === qId) {
                    const newOptions = q.options.map((opt, i) => ({
                        ...opt,
                        is_correct: i === index, // Yalnız seçiləni doğru et
                    }));
                    return { ...q, options: newOptions };
                }
                return q;
            }),
        }));
    };

    const handleAddOption = (qId: number) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.map(q => {
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
            ...prev,
            questions: prev.questions.map(q => {
                if (q.id === qId && q.options.length > 2) { // Ən az 2 seçim saxla
                    const newOptions = q.options.filter((_, i) => i !== index);
                    // Əgər silinən düzgün idisə, ən birinci qalanı düzgün et
                    if (q.options[index].is_correct && newOptions.length > 0) {
                        newOptions[0].is_correct = true;
                    }
                    return { ...q, options: newOptions };
                }
                return q;
            }),
        }));
    };

    // --- 5. Formu Göndərmə ---

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // 5.1. Əsas Sahə Validasiyası
        if (!formData.title || !formData.subject_id || !formData.start_time || !formData.end_time || formData.questions.length === 0) {
            setError("Zəhmət olmasa, başlıq, fənn, vaxtları daxil edin və ən azı bir sual əlavə edin.");
            setLoading(false);
            return;
        }

        // 5.2. Sual Məzmunu Validasiyası
        const invalidQuestion = formData.questions.find(q =>
            !q.text.trim() || q.options.filter(opt => opt.text.trim()).length < 2 || q.options.filter(opt => opt.is_correct).length !== 1
        );
        if (invalidQuestion) {
            setError("Bütün sualların mətni təyin edilməli, ən az 2 cavab seçimi olmalı və düzgün cavab **tək** olmalıdır.");
            setLoading(false);
            return;
        }

        try {
            // API-yə göndərilən data (backenddə score hesablanacaq)
            const dataToSend = {
                ...formData,
                subject_id: Number(formData.subject_id),
                questions: formData.questions.map(q => ({
                    text: q.text,
                    type: 'Closed', // Sabit
                    // max_score: q.max_score, // Ləğv olundu
                    difficulty: q.difficulty,
                    options: q.options.map(opt => ({
                        text: opt.text,
                        is_correct: opt.is_correct
                    }))
                }))
            };

            await post('/quizzes', dataToSend);

            Swal.fire({
                title: 'Uğurlu!',
                text: `Quiz uğurla yaradıldı.`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                customClass: { popup: 'z-[99999]' }
            });

            navigate('/quizzes');

        } catch (err: any) {
            const msg = err.response?.data?.message || 'Quiz yaratma zamanı xəta baş verdi.';
            setError(msg);

        } finally {
            setLoading(false);
        }
    };

    // --- Render Hissəsi ---


    return (
        <>
            <PageBreadcrumb pageTitle="Yeni Quiz Yarat" />

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
                    <h2 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-400">1. Əsas Məlumatlar</h2>

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
                            <Select
                                id="subject_id"
                                name="subject_id"
                                value={formData.subject_id}
                                onChange={handleQuizChange}
                                disabled={subjects.length === 0 || loading}
                                options={subjects.map(sub => ({
                                    value: String(sub.id),
                                    label: sub.name
                                }))}
                                placeholder="Fənn seçin"
                            />
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

                        {/* Quizdən sualları import et */}
                        <div className="md:col-span-4">
                            <Label htmlFor="import_quiz">Əvvəlki Quizdən Sualları Import Et</Label>
                            <Select
                                id="import_quiz"
                                name="import_quiz"
                                value={selectedQuizToImport}
                                onChange={e => handleImportQuizQuestions(e.target.value)}
                                options={[
                                    { value: '', label: 'Quiz seçin (import etmək üçün)' },
                                    ...myQuizzes.map(q => ({ value: String(q.id), label: q.title }))
                                ]}
                                disabled={loading || importingQuestions}
                            />
                            {importingQuestions && (
                                <div className="text-xs text-blue-500 mt-1">Suallar import olunur...</div>
                            )}
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
                        <Button type="button" onClick={handleAddQuestion} disabled={loading} variant="primary">
                            <PlusCircle className="w-5 h-5 mr-1" /> Sual Əlavə Et
                        </Button>
                    </div>

                    <div className="mt-4 space-y-4">
                        {formData.questions.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                Quiz-ə heç bir sual əlavə edilməyib.
                            </div>
                        ) : (
                            formData.questions.map((q, idx) => (
                                <QuestionItem
                                    key={q.id}
                                    question={q}
                                    questionIndex={idx}
                                    totalQuestions={formData.questions.length}
                                    onDeleteQuestion={handleDeleteQuestion}
                                    onQuestionChange={handleQuestionChange}
                                    onOptionChange={handleOptionChange}
                                    onCorrectOptionChange={handleCorrectOptionChange}
                                    onDeleteOption={handleDeleteOption}
                                    onAddOption={handleAddOption}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Yarat Buttonu */}
                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={loading || formData.questions.length === 0}>
                        {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : 'Quiz-i Yarat'}
                    </Button>
                </div>

            </form>
        </>
    );
};

export default CreateQuizPage;