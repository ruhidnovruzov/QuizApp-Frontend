// src/pages/UserPage.tsx (RESPONSIVE VERSION)

import React, { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import UserModal from "../../components/ui/modal/UserModal";
import { get, del } from "../../api/service"; 
// Əlavə ikonlar import edilir
import { SquarePen, Trash2, PlusCircle, Loader2, User as UserIcon, Mail, Tag, Hash, Shield } from "lucide-react"; 
import Swal from 'sweetalert2';


// --- Məlumat Tipləri ---
interface Group {
    id: number;
    name: string;
}

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: 'Admin' | 'Teacher' | 'Student';
    // Backenddən gələn data structure
    group: { name: string } | null; 
    // Front-end redaktə üçün və cədvəldə göstərmək üçün əlavə sahələr
    group_id?: number | null; 
    group_name?: string;
}

const UserPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    
    const [loading, setLoading] = useState(false);
    const [groupsLoading, setGroupsLoading] = useState(false); // Groups üçün loading
    const [error, setError] = useState<string | null>(null);

    // Modal Vəziyyəti
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // --- Məlumatların çəkilməsi və Birləşdirilməsi ---
    const fetchData = async () => {
        setLoading(true);
        // Grupları çəkilənə qədər loading göstəririk, çünki modalda istifadə olunur
        if (groups.length === 0) setGroupsLoading(true); 
        setError(null);

        try {
            const [usersResponse, groupsResponse] = await Promise.all([
                get('/users'), 
                get('/groups') 
            ]); 
            
            setGroups(groupsResponse.data);
            setGroupsLoading(false);

            // Redaktə üçün Group ID-ni tapmaq üçün Map yaradırıq
            const groupsNameMap = new Map(groupsResponse.data.map((g: Group) => [g.name, g.id])); 
            
            const processedUsers: User[] = usersResponse.data.map((user: any) => {
                const groupNameFromAPI = user.group?.name; 
                
                // Redaktə modala ötürülmək üçün lazım olan group_id-ni tapırıq
                const groupId = groupNameFromAPI ? groupsNameMap.get(groupNameFromAPI) || null : null;
                
                return {
                    ...user,
                    group_name: groupNameFromAPI || null, // Cədvəldə göstərmək üçün
                    group_id: groupId, // Redaktə modala göndərmək üçün
                };
            });
            
            setUsers(processedUsers); 
            
        } catch (err: any) {
            const msg = err.response?.data?.message || "Məlumatları yükləmək mümkün olmadı.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- DELETE (İstifadəçini Sil) ---
    const handleDelete = async (id: number, name: string) => {
        
        const result = await Swal.fire({
            title: "Əminsiniz?",
            text: `"${name}" adlı istifadəçi silindikdən sonra geri qaytarıla bilməyəcək!`,
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
            await del(`/users/${id}`);
            fetchData(); // Uğurlu silinmədən sonra məlumatları yenidən yüklə

            Swal.fire({
                title: "Silindi!",
                text: "İstifadəçi uğurla silindi.",
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
        setSelectedUser(null); 
        setIsModalOpen(true);
    };
    
    const openEditModal = (user: User) => {
        setSelectedUser(user); 
        setIsModalOpen(true);
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };
    
    
    // Role əsaslı rəngləmə funksiyası (UI üçün)
    const getRoleBadge = (role: string) => {
        let color = 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        if (role === 'Admin') color = 'bg-red-200 text-red-800 dark:bg-red-800/30 dark:text-red-300';
        else if (role === 'Teacher') color = 'bg-blue-200 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300';
        else if (role === 'Student') color = 'bg-green-200 text-green-800 dark:bg-green-800/30 dark:text-green-300';

        return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>{role}</span>;
    };
    
    
    // --- Mobil/Kart Görünüşü Komponenti ---
    const MobileUserCard: React.FC<{ user: User }> = ({ user }) => (
        <div key={user.id} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-3 border border-gray-200 dark:border-gray-700">
            
            {/* Ad Soyad və ID */}
            <div className="flex justify-between items-center mb-3 border-b pb-2 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                    <UserIcon className="w-5 h-5 mr-2 text-indigo-500" />
                    {user.first_name} {user.last_name}
                </h3>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center">
                    <Hash className="w-3 h-3 mr-1" /> {user.id}
                </span>
            </div>

            {/* Əsas Məlumatlar */}
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="font-medium">Email:</span>
                    </div>
                    <span className="ml-2 font-medium break-all">{user.email}</span>
                </div>
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-red-500" />
                        <span className="font-medium">Rol:</span>
                    </div>
                    {getRoleBadge(user.role)}
                </div>
                
                {user.role === 'Student' && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Tag className="w-4 h-4 mr-2 text-blue-500" />
                            <span className="font-medium">Qrup:</span>
                        </div>
                        <span className="ml-2">{user.group_name || 'Qeyd edilməyib'}</span>
                    </div>
                )}
            </div>

            {/* Əməliyyatlar */}
            <div className="flex justify-end space-x-3 pt-3 border-t dark:border-gray-700">
                <button 
                    onClick={() => openEditModal(user)} 
                    className="font-medium text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 inline-flex items-center transition duration-150"
                    title="Redaktə et"
                >
                    <SquarePen className="w-4 h-4 mr-1" /> Redaktə
                </button>
                <button
                    onClick={() => handleDelete(user.id, `${user.first_name} ${user.last_name}`)}
                    className="font-medium text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 inline-flex items-center transition duration-150"
                    title="Sil"
                >
                    <Trash2 className="w-4 h-4 mr-1" /> Sil
                </button>
            </div>
        </div>
    );
    // ---------------------------------------------

    
    // --- Render Məntiqi ---
    if (loading && users.length === 0) {
        return <div className="flex justify-center items-center h-48 text-lg text-gray-700 dark:text-gray-400"><Loader2 className="animate-spin mr-2" /> İstifadəçilər yüklənir...</div>;
    }

    if (error) {
         return <div className="text-red-600 p-4 bg-red-100 rounded-lg">{error}</div>;
    }


    return (
        <>
            <PageBreadcrumb pageTitle="İstifadəçilər" />
            
            <div className="mb-4 flex justify-end">
                 <button
                    onClick={openCreateModal}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    disabled={groupsLoading} // Qruplar yüklənirsə düyməni deaktiv et
                >
                    {groupsLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <PlusCircle className="w-5 h-5 mr-2" />}
                    İstifadəçi Yarat
                </button>
            </div>

            {/* --- 1. DESKTOP CƏDVƏL GÖRÜNÜŞÜ (Mobil ekranlarda gizlət) --- */}
            <div className="hidden md:block relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Adı Soyadı</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">Rol</th>
                            <th scope="col" className="px-6 py-3">Qrup</th>
                            <th scope="col" className="px-6 py-3">Əməliyyatlar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                             <tr 
                                key={user.id} 
                                className="odd:bg-white even:bg-gray-100 odd:dark:bg-gray-900 even:dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-150"
                            >
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {user.first_name} {user.last_name}
                                </th>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                                <td className="px-6 py-4">
                                    {user.role === 'Student' ? user.group_name || 'Qeyd edilməyib' : '—'}
                                </td>
                                
                                <td className="px-6 py-4 flex space-x-3">
                                    <button 
                                        onClick={() => openEditModal(user)} 
                                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline inline-flex items-center"
                                        title="Redaktə et"
                                    >
                                        <SquarePen className="w-4 h-4 mr-1" /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id, `${user.first_name} ${user.last_name}`)}
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
                 {users.length === 0 && !loading && (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                        Heç bir istifadəçi tapılmadı.
                    </div>
                )}
            </div>
            
            {/* --- 2. MOBİL KART GÖRÜNÜŞÜ (Yalnız mobil ekranlarda göstər - md və ondan yuxarıda gizlət) --- */}
            <div className="md:hidden">
                {users.map((user) => (
                    <MobileUserCard key={user.id} user={user} />
                ))}
                {users.length === 0 && !loading && (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        Heç bir istifadəçi tapılmadı.
                    </div>
                )}
            </div>
            
            {/* Modal Komponenti */}
            <UserModal
                isOpen={isModalOpen}
                onClose={closeModal}
                currentUser={selectedUser}
                onSuccess={fetchData} 
                groups={groups} 
            />
        </>
    );
};

export default UserPage;