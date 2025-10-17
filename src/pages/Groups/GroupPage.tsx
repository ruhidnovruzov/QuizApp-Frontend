import React, { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import GroupModal from "../../components/ui/modal/GroupModal";
import { get, del } from "../../api/service"; 
import { SquarePen, Trash2, PlusCircle, Loader2, Users, Tag, Building2, Hash } from "lucide-react"; 
import Swal from 'sweetalert2';

// --- Yeni Məlumat Tipləri ---
interface Department {
    id: number;
    name: string;
}

interface Group {
    id: number;
    name: string;
    department_id: number; // Məcburidir, çünki edit modal üçün lazım olacaq
    
    // API cavabına əsasən:
    _count: {
        users: number; 
    };
    department: { 
        name: string; // Cədvəldə göstərmək üçün
    };
}

const GroupPage: React.FC = () => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    
    const [loading, setLoading] = useState(false);
    const [departmentsLoading, setDepartmentsLoading] = useState(false); 
    const [error, setError] = useState<string | null>(null);

    // Modal Vəziyyəti
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

    // --- 1. GET (Qrupları API-dən yüklə) ---
    // Səhifəyə ilk girişdə yalnız qrupları çəkirik.
    const fetchGroups = async () => {
        setLoading(true);
        setError(null);

        try {
            const groupsResponse = await get('/groups');
            setGroups(groupsResponse.data); 
        } catch (err: any) {
            const msg = err.response?.data?.message || "Qrup məlumatlarını yükləmək mümkün olmadı.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };
    
    // --- 2. GET (Kafedraları API-dən yüklə) ---
    // Bu funksiya yalnız modal açılarkən çağırılacaq.
    const fetchDepartments = async () => {
        // Əgər kafedra məlumatları artıq çəkilibsə, yenidən sorğu atmırıq.
        if (departments.length > 0) {
            return;
        }
        
        setDepartmentsLoading(true);
        try {
            const departmentsResponse = await get('/departments'); 
            setDepartments(departmentsResponse.data);
        } catch (err: any) {
             console.error("Kafedralar yüklənərkən xəta:", err);
             // İstifadəçiyə görünən error state-i dəyişmirik, çünki bu error modalda idarə oluna bilər.
        } finally {
            setDepartmentsLoading(false);
        }
    };

    // Səhifə yüklənəndə yalnız qrupları çəkirik.
    useEffect(() => {
        fetchGroups();
    }, []);

    // --- DELETE (Qrupu Sil) ---
    const handleDelete = async (id: number, name: string) => {
        
        const result = await Swal.fire({
            title: "Əminsiniz?",
            text: `"${name}" adlı qrup silindikdən sonra geri qaytarıla bilməyəcək. Bu qrupa təyin olunmuş tələbələr qrupdan çıxarılacaq.`,
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
            await del(`/groups/${id}`);
            fetchGroups(); // Qrupları yenidən yükləyirik

            Swal.fire({
                title: "Silindi!",
                text: "Qrup uğurla silindi.",
                icon: "success",
                timer: 2000,
                showConfirmButton: false
            });

        } catch (err: any) {
            const msg = err.response?.data?.message || "Silinmə zamanı xəta baş verdi.";
            Swal.fire({ title: "Xəta!", text: msg, icon: "error" });
        }
    };
    
    // --- Modal Məntiqi ---
    const openCreateModal = () => {
        setSelectedGroup(null); 
        setIsModalOpen(true);
        // Kafedraları yalnız modal açılarkən çəkirik
        fetchDepartments(); 
    };
    
    const openEditModal = (group: Group) => {
        setSelectedGroup(group); 
        setIsModalOpen(true);
        // Kafedraları yalnız modal açılarkən çəkirik
        fetchDepartments(); 
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedGroup(null);
    };


    // --- Render Məntiqi ---
    if (loading && groups.length === 0) {
        return <div className="flex justify-center items-center h-48 text-lg text-gray-700 dark:text-gray-400"><Loader2 className="animate-spin mr-2" /> Qruplar yüklənir...</div>;
    }

    if (error) {
         return <div className="text-red-600 p-4 bg-red-100 rounded-lg">{error}</div>;
    }

    // --- Mobil/Kart Görünüşü Komponenti ---
    const MobileGroupCard: React.FC<{ group: Group }> = ({ group }) => (
        <div key={group.id} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-3 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start mb-3 border-b pb-2 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                    <Tag className="w-5 h-5 mr-2 text-blue-500" />
                    {group.name}
                </h3>
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center">
                    <Hash className="w-4 h-4 mr-1" />
                    {group.id}
                </span>
            </div>

            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                <div className="flex items-center">
                    <Building2 className="w-4 h-4 mr-2 text-indigo-500" />
                    <span className="font-medium">Kafedra:</span>
                    <span className="ml-2">{group.department?.name || 'Yoxdur'}</span>
                </div>
                <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-green-500" />
                    <span className="font-medium">Tələbə Sayı:</span>
                    <span className="ml-2 font-bold">{group._count?.users ?? 0}</span>
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t dark:border-gray-700">
                <button 
                    onClick={() => openEditModal(group)} 
                    className="font-medium text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 inline-flex items-center transition duration-150"
                    title="Redaktə et"
                >
                    <SquarePen className="w-4 h-4 mr-1" /> Redaktə
                </button>
                <button
                    onClick={() => handleDelete(group.id, group.name)}
                    className="font-medium text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 inline-flex items-center transition duration-150"
                    title="Sil"
                >
                    <Trash2 className="w-4 h-4 mr-1" /> Sil
                </button>
            </div>
        </div>
    );
    // ---------------------------------------------


    return (
        <>
            <PageBreadcrumb pageTitle="Qruplar" />
            
            <div className="mb-4 flex justify-end">
                 <button
                    onClick={openCreateModal}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Yeni Qrup Yarat
                </button>
            </div>
            
            {/* --- 1. DESKTOP CƏDVƏL GÖRÜNÜŞÜ (Mobil ekranlarda gizlət) --- */}
            <div className="hidden md:block relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">ID</th>
                            <th scope="col" className="px-6 py-3">Qrup Adı</th>
                            <th scope="col" className="px-6 py-3">Kafedra</th>
                            <th scope="col" className="px-6 py-3">Tələbə Sayı</th>
                            <th scope="col" className="px-6 py-3">Əməliyyatlar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groups.map((group) => (
                             <tr 
                                key={group.id} 
                                className="odd:bg-white even:bg-gray-100 odd:dark:bg-gray-900 even:dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-150"
                            >
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {group.id}
                                </th>
                                <td className="px-6 py-4">{group.name}</td>
                                <td className="px-6 py-4">
                                    {/* Kafedra adını göstəririk */}
                                    {group.department?.name || 'Yoxdur'}
                                </td> 
                                <td className="px-6 py-4">
                                    <div className="inline-flex items-center text-gray-600 dark:text-gray-300">
                                        <Users className="w-4 h-4 mr-1" />
                                        {group._count?.users ?? 0}
                                    </div>
                                </td>
                                
                                <td className="px-6 py-4 flex space-x-3">
                                    <button 
                                        onClick={() => openEditModal(group)} 
                                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline inline-flex items-center"
                                        title="Redaktə et"
                                    >
                                        <SquarePen className="w-4 h-4 mr-1" /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(group.id, group.name)}
                                        className="font-medium text-red-600 dark:text-red-500 hover:underline inline-flex items-center"
                                        title="Sil"
                                    >
                                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {groups.length === 0 && !loading && (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                        Heç bir qrup tapılmadı.
                    </div>
                )}
            </div>
            
            {/* --- 2. MOBİL KART GÖRÜNÜŞÜ (Yalnız mobil ekranlarda göstər - md və ondan yuxarıda gizlət) --- */}
            <div className="md:hidden">
                {groups.map((group) => (
                    <MobileGroupCard key={group.id} group={group} />
                ))}
                {groups.length === 0 && !loading && (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        Heç bir qrup tapılmadı.
                    </div>
                )}
            </div>
            
            {/* Modal Komponenti */}
            <GroupModal
                isOpen={isModalOpen}
                onClose={closeModal}
                currentGroup={selectedGroup}
                onSuccess={fetchGroups} // Yeni yaradılan/redaktə edilən qrupdan sonra qrupları yenidən çəkirik
                departments={Array.isArray(departments) ? departments : []}
                departmentsLoading={departmentsLoading}
            />
        </>
    );
};

export default GroupPage;