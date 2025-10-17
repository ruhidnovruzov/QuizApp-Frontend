import React, { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import SubjectModal from "../../components/ui/modal/SubjectModal";
import { get, del } from "../../api/service";
// Yeni ikonlar əlavə edildi
import { SquarePen, Trash2, PlusCircle, Loader2, BookOpen, User, Tag, Building2, Hash, Users } from "lucide-react"; 
import Swal from 'sweetalert2';

// Fərz edirik ki, bu, sizin AuthContext-inizdən gəlir
import { useAuth } from "../../context/AuthContext"; 

// --- Məlumat Tipləri ---
interface Subject {
    id: number;
    name: string;
    group_id: number;
    teacher_id: number;

    // Əlaqəli məlumatlar
    group: { 
        name: string;
        department: { name: string };
    };
    teacher: { 
        first_name: string; 
        last_name: string; 
    };
}

interface Group { id: number; name: string; }
interface Teacher { id: number; first_name: string; last_name: string; }


const SubjectPage: React.FC = () => {
    const { role } = useAuth();
    const isAdmin = role === 'Admin';
    const isTeacher = role === 'Teacher';

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);

    const [loading, setLoading] = useState(false);
    const [refDataLoading, setRefDataLoading] = useState(false); // Groups/Teachers üçün

    // Modal Vəziyyəti
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

    // --- 1. Məlumatları API-dən yüklə (Fənlər) ---
    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const endpoint = '/subjects'; 
            
            const response = await get(endpoint);
            setSubjects(response.data);
        } catch (err: any) {
            Swal.fire({
                title: 'Xəta!',
                text: err.response?.data?.message || "Fənləri yükləmək mümkün olmadı.",
                icon: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    // Qrupları və Müəllimləri çəkən funksiya (Modal üçün)
    const fetchRefData = async () => {
        // YALNIZ İLK DƏFƏ ÇƏKİLƏNDƏ SORĞU ATSIN
        if ((groups.length > 0 && teachers.length > 0) || !isAdmin) {
             return; 
        }

        setRefDataLoading(true);
        try {
            const [groupsResponse, teachersResponse] = await Promise.all([
                get('/groups'),
                get('/users/teachers') 
            ]);

            setGroups(groupsResponse.data);
            setTeachers(teachersResponse.data);

        } catch (err: any) {
            console.error("Qrupları və Müəllimləri yükləmə xətası:", err); 
        } finally {
            setRefDataLoading(false);
        }
    };

    // Səhifə yüklənəndə yalnız fənləri çəkirik.
    useEffect(() => {
        fetchSubjects();
    }, [isAdmin, isTeacher]); 

    // --- 2. DELETE (Fənni Sil) - Yalnız Admin icazəlidir ---
    const handleDelete = async (id: number, name: string) => {
        if (!isAdmin) {
             Swal.fire({ title: "İcazə yoxdur!", text: "Fənni silmək üçün Admin olmalısınız.", icon: "warning" });
             return;
        }

        const result = await Swal.fire({
            title: "Əminsiniz?",
            text: `"${name}" fənni silindikdən sonra geri qaytarıla bilməyəcək.`,
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
            await del(`/subjects/${id}`);
            fetchSubjects();

            Swal.fire({ title: "Silindi!", text: "Fənn uğurla silindi.", icon: "success", timer: 2000, showConfirmButton: false });

        } catch (err: any) {
            const msg = err.response?.data?.message || "Silinmə zamanı xəta baş verdi.";
            Swal.fire({ title: "Xəta!", text: msg, icon: "error" });
        }
    };

    // --- Modal Məntiqi ---
    const openCreateModal = () => {
        if (!isAdmin) return;
        setSelectedSubject(null);
        setIsModalOpen(true);
        
        fetchRefData();
    };

    const openEditModal = (subject: Subject) => {
        if (!isAdmin) return;
        setSelectedSubject(subject);
        setIsModalOpen(true);
        
        fetchRefData();
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedSubject(null);
    };


    if (loading && subjects.length === 0) {
        return <div className="flex justify-center items-center h-48 text-lg text-gray-700 dark:text-gray-400"><Loader2 className="animate-spin mr-2" /> Fənlər yüklənir...</div>;
    }
    
    // --- Mobil/Kart Görünüşü Komponenti ---
    const MobileSubjectCard: React.FC<{ subject: Subject }> = ({ subject }) => (
        <div key={subject.id} className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4 mb-4 border border-gray-200 dark:border-gray-700">
            
            {/* Başlıq və ID */}
            <div className="flex justify-between items-start mb-3 border-b pb-2 dark:border-gray-700">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-indigo-500" />
                    {subject.name}
                </h3>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center mt-1 p-1 px-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <Hash className="w-3 h-3 mr-1" />
                    ID: {subject.id}
                </span>
            </div>

            {/* Əsas Məlumatlar */}
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 mb-4">
                <div className="flex items-center">
                    <User className="w-4 h-4 mr-2 text-green-600" />
                    <span className="font-medium">Müəllim:</span>
                    <span className="ml-2 font-semibold">{subject.teacher.first_name} {subject.teacher.last_name}</span>
                </div>
                
                <div className="flex items-center">
                    <Tag className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="font-medium">Qrup:</span>
                    <span className="ml-2">{subject.group?.name || 'Yoxdur'}</span>
                </div>
                
                <div className="flex items-center">
                    <Building2 className="w-4 h-4 mr-2 text-orange-500" />
                    <span className="font-medium">Kafedra:</span>
                    <span className="ml-2">{subject.group?.department?.name || 'Məlum deyil'}</span>
                </div>
            </div>

            {/* Əməliyyatlar (Yalnız Admin üçün) */}
            {isAdmin && (
                <div className="flex justify-end space-x-3 pt-3 border-t dark:border-gray-700">
                    <button 
                        onClick={() => openEditModal(subject)} 
                        className="font-medium text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 inline-flex items-center transition duration-150"
                        title="Redaktə et"
                    >
                        <SquarePen className="w-4 h-4 mr-1" /> Redaktə
                    </button>
                    <button
                        onClick={() => handleDelete(subject.id, subject.name)}
                        className="font-medium text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 inline-flex items-center transition duration-150"
                        title="Sil"
                    >
                        <Trash2 className="w-4 h-4 mr-1" /> Sil
                    </button>
                </div>
            )}
        </div>
    );
    // ---------------------------------------------


    return (
        <>
            <PageBreadcrumb pageTitle={isTeacher ? "Fənnlərim" : "Fənlər"} />

            {/* Yalnız Admin üçün görünən "Yeni Fənn Yarat" düyməsi */}
            {isAdmin && (
                <div className="mb-4 flex justify-end">
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Yeni Fənn Yarat
                    </button>
                </div>
            )}

            {/* --- 1. DESKTOP CƏDVƏL GÖRÜNÜŞÜ (Mobil ekranlarda gizlət) --- */}
            <div className="hidden md:block relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">ID</th>
                            <th scope="col" className="px-6 py-3">Fənn Adı</th>
                            <th scope="col" className="px-6 py-3">Qrup</th>
                            <th scope="col" className="px-6 py-3">Kafedra</th>
                            <th scope="col" className="px-6 py-3">Müəllim</th>
                            {/* Əməliyyatlar sütunu yalnız Admin üçün */}
                            {isAdmin && <th scope="col" className="px-6 py-3">Əməliyyatlar</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.map((subject) => (
                            <tr key={subject.id} className="odd:bg-white even:bg-gray-100 odd:dark:bg-gray-900 even:dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-150">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {subject.id}
                                </th>
                                <td className="px-6 py-4 flex items-center">
                                    <BookOpen className="w-4 h-4 mr-2 text-blue-500" />
                                    {subject.name}
                                </td>
                                <td className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">{subject.group?.name}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                    {subject.group?.department?.name || 'Məlum deyil'}
                                </td>
                                <td className="px-6 py-4 flex items-center">
                                    <User className="w-4 h-4 mr-1 text-green-500" />
                                    {subject.teacher.first_name} {subject.teacher.last_name}
                                </td>

                                {/* Əməliyyatlar hücrəsi yalnız Admin üçün */}
                                {isAdmin && (
                                    <td className="px-6 py-4">
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => openEditModal(subject)}
                                                className="font-medium text-blue-600 dark:text-blue-500 hover:underline inline-flex items-center"
                                                title="Redaktə et"
                                            >
                                                <SquarePen className="w-4 h-4 mr-1" /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(subject.id, subject.name)}
                                                className="font-medium text-red-600 dark:text-red-500 hover:underline inline-flex items-center"
                                                title="Sil"
                                            >
                                                <Trash2 className="w-4 h-4 mr-1" /> Delete
                                            </button>
                                        </div>
                                    </td>
    
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {subjects.length === 0 && !loading && (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                        Heç bir fənn tapılmadı. 
                        {isTeacher && 'Sizə təyin olunmuş fənn yoxdur.'}
                        {isAdmin && 'Yuxarıdakı düymədən yeni fənn yarada bilərsiniz.'}
                    </div>
                )}
            </div>

            {/* --- 2. MOBİL KART GÖRÜNÜŞÜ (Yalnız mobil ekranlarda göstər - md və ondan yuxarıda gizlət) --- */}
            <div className="md:hidden">
                {subjects.map((subject) => (
                    <MobileSubjectCard key={subject.id} subject={subject} />
                ))}
                {subjects.length === 0 && !loading && (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        Heç bir fənn tapılmadı.
                        {isTeacher && 'Sizə təyin olunmuş fənn yoxdur.'}
                        {isAdmin && 'Yuxarıdakı düymədən yeni fənn yarada bilərsiniz.'}
                    </div>
                )}
            </div>

            {/* Modal Komponenti - Yalnız Admin tərəfindən istifadə ediləcək */}
            {isAdmin && (
                <SubjectModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    currentSubject={selectedSubject}
                    onSuccess={fetchSubjects} 
                    groups={groups} 
                    teachers={teachers} 
                    isAdmin={isAdmin}
                    refDataLoading={refDataLoading} 
                />
            )}
        </>
    );
};

export default SubjectPage;