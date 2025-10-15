// src/pages/DepartmentPage.tsx (SweetAlert2 ilə Yenilənmiş Versiya)

import React, { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DepartmentModal from "../../components/ui/modal/DepartmentModal"; 
import { get, del } from "../../api/service"; 
import { SquarePen, Trash2, PlusCircle, Loader2, Zap } from "lucide-react"; 
// SweetAlert2 importu
import Swal from 'sweetalert2';


// --- Məlumat Tipləri ---
interface Department {
    id: number;
    name: string;
}

const DepartmentPage: React.FC = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Modal Vəziyyəti
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

    // --- 1. GET (Məlumatı API-dən yüklə) ---
    const fetchDepartments = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await get('/departments'); 
            setDepartments(response.data); 
            
        } catch (err: any) {
            const msg = err.response?.data?.message || "Kafedraları yükləmək mümkün olmadı.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    // --- 2. DELETE (Kafedranı Sil) ---
    const handleDelete = async (id: number) => {
        
        // SweetAlert2 Təsdiq Pəncərəsi
        const result = await Swal.fire({
            title: "Əminsiniz?",
            text: "Bu kafedra silindikdən sonra geri qaytarıla bilməyəcək!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Bəli, Sil!",
            cancelButtonText: "Xeyr, Ləğv Et",
               customClass: {
                //popupa zindex vermeliyem 99999
                popup: 'z-[99999]'
            },
        });

        if (!result.isConfirmed) {
            return; // Ləğv edildi
        }
        
        // Silinmə Əməliyyatı
        try {
            await del(`/departments/${id}`);
            fetchDepartments(); 

            // Uğur Mesajı
            Swal.fire({
                title: "Silindi!",
                text: "Kafedra uğurla silindi.",
                icon: "success",
                timer: 2000,
                showConfirmButton: false
            });

        } catch (err: any) {
             const msg = err.response?.data?.message || "Silinmə zamanı xəta baş verdi.";
             
             // Xəta Mesajı
             Swal.fire({
                title: "Xəta!",
                text: msg,
                icon: "error",
             });
        }
    };
    
    // --- Modal Məntiqi (Dəyişiklik Yoxdur) ---
    const openCreateModal = () => {
        setSelectedDepartment(null); 
        setIsModalOpen(true);
    };
    
    const openEditModal = (department: Department) => {
        setSelectedDepartment(department); 
        setIsModalOpen(true);
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDepartment(null);
    };
    
    
    // --- Render Məntiqi (Dəyişiklik Yoxdur) ---
    if (loading && departments.length === 0) {
        return <div className="flex justify-center items-center h-48 text-lg text-gray-700 dark:text-gray-400"><Loader2 className="animate-spin mr-2" /> Kafedralar yüklənir...</div>;
    }

    if (error) {
        return <div className="text-red-600 p-4 bg-red-100 rounded-lg">{error}</div>;
    }


    return (
        <>
            <PageBreadcrumb pageTitle="Kafedralar" />
            
            <div className="mb-4 flex justify-end">
                 <button
                    onClick={openCreateModal}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Kafedra Yarat
                </button>
            </div>

            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Kafedra Adı</th>
                            <th scope="col" className="px-6 py-3">Əməliyyatlar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments.map((dept) => (
                            <tr 
                                key={dept.id}
                                className="odd:bg-white even:bg-gray-100 odd:dark:bg-gray-900 even:dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-150"
                            >
                                <th 
                                    scope="row" 
                                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                >
                                    {dept.name}
                                </th>
                                <td className="px-6 py-4 flex space-x-3">
                                    <button 
                                        onClick={() => openEditModal(dept)} 
                                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline inline-flex items-center"
                                        title="Redaktə et"
                                    >
                                        <SquarePen className="w-4 h-4 mr-1" /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(dept.id)}
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
                 {departments.length === 0 && !loading && (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                        Heç bir kafedra tapılmadı.
                    </div>
                )}
            </div>
            
            {/* Modal Komponenti */}
            <DepartmentModal
                isOpen={isModalOpen}
                onClose={closeModal}
                currentDepartment={selectedDepartment}
                onSuccess={fetchDepartments} 
            />
        </>
    );
};

export default DepartmentPage;