// src/components/modals/UserModal.tsx (YENİLƏNMİŞ VERSİYA - Qrup Seçimi əlavə olundu)

import React, { useState, useEffect } from 'react';
import { post, put } from '../../../api/service'; 
import Input from '../../form/input/InputField';
import Label from '../../form/Label';
import Button from '../button/Button';
import Swal from 'sweetalert2';

// --- Əlavə Məlumat Tipləri ---
interface Group {
    id: number;
    name: string;
}

interface User {
    id?: number; 
    first_name: string;
    last_name: string;
    email: string;
    role: 'Admin' | 'Teacher' | 'Student'; 
    group_id: number | null; // Tələbədirsə mütləq olmalıdır
    password?: string; 
}

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User | null; 
    onSuccess: () => void; 
    // Qrupları yuxarı səviyyədən (UserPage-dən) alırıq
    groups: Group[]; 
}

// Mövcud rol seçimləri
const ROLE_OPTIONS = [
    { label: 'Admin', value: 'Admin' },
    { label: 'Müəllim', value: 'Teacher' },
    { label: 'Tələbə', value: 'Student' },
];

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, currentUser, onSuccess, groups }) => {
    const isEdit = !!currentUser; 
    const [formData, setFormData] = useState<User>({
        first_name: '',
        last_name: '',
        email: '',
        role: 'Student',
        group_id: null,
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Modal açılan kimi datanı doldur
    useEffect(() => {
        if (isEdit && currentUser) {
            setFormData({
                ...currentUser,
                group_id: currentUser.group_id || null, // Əgər yoxdursa null qoyuruq
                password: '', 
            });
        } else {
            setFormData({
                first_name: '', last_name: '', email: '', role: 'Student', group_id: null, password: ''
            });
        }
    }, [currentUser, isEdit]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'select-one' && name === 'group_id' ? (value === '' ? null : parseInt(value)) : value,
        }));
    };
    
    // Rol dəyişdikdə group_id-ni təmizlə
    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
         const newRole = e.target.value as 'Admin' | 'Teacher' | 'Student';
         setFormData(prev => ({
            ...prev,
            role: newRole,
            group_id: newRole !== 'Student' ? null : prev.group_id // Tələbə deyilsə qrupu sil
        }));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // --- VALIDASIYA ---
        if (!formData.first_name || !formData.email || (!isEdit && !formData.password)) {
            setError("Ad, Email və (Yeni İstifadəçi üçün) Şifrə boş qala bilməz.");
            setLoading(false);
            return;
        }
        
        if (formData.role === 'Student' && !formData.group_id) {
             setError("Tələbə üçün Qrup seçimi mütləqdir.");
             setLoading(false);
             return;
        }

        try {
            const actionText = isEdit ? 'redaktə edildi' : 'yaradıldı';
            
            // API-ə göndəriləcək data
            const dataToSend = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                role: formData.role,
                // group_id yalnız Student rolunda göndərilir, əks halda null və ya göndərilmir
                group_id: formData.role === 'Student' ? formData.group_id : null, 
                ...(formData.password && { password: formData.password }) 
            }; 
            
            if (isEdit && formData.id) {
                await put(`/users/${formData.id}`, dataToSend);
            } else {
                await post('/users', dataToSend);
            }
            
            Swal.fire({
                title: 'Uğurlu!',
                text: `İstifadəçi uğurla ${actionText}.`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                customClass: { popup: 'z-[99999]' }
            });
            
            onSuccess(); 
            onClose();

        } catch (err: any) {
            const msg = err.response?.data?.message || 'Əməliyyat zamanı xəta baş verdi.';
            setError(msg);
            
        } finally {
            setLoading(false);
        }
    };

    const isStudent = formData.role === 'Student';

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {isEdit ? 'İstifadəçini Redaktə Et' : 'Yeni İstifadəçi Yarat'}
                </h2>
                
                {error && (
                    <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Ad */}
                    <div>
                        <Label>Ad *</Label>
                        <Input 
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            placeholder="Ad"
                        />
                    </div>

                    {/* Soyad */}
                    <div>
                        <Label>Soyad</Label>
                        <Input 
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            placeholder="Soyad"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <Label>Email *</Label>
                        <Input 
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="user@example.com"
                        />
                    </div>

                    {/* Rol (Dropdown) */}
                    <div>
                        <Label>Rol *</Label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleRoleChange} // Xüsusi rol dəyişmə funksiyası
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                            {ROLE_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Qrup (Yalnız Tələbə üçün görünür) */}
                    {isStudent && (
                         <div>
                            <Label>Qrup *</Label>
                            <select
                                name="group_id"
                                value={formData.group_id || ''} // Boş dəyər kimi '' istifadə edirik
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="" disabled>Qrup Seçin</option>
                                {groups.map(group => (
                                    <option key={group.id} value={group.id}>
                                        {group.name}
                                    </option>
                                ))}
                            </select>
                             {groups.length === 0 && (
                                <p className="text-sm text-red-500 mt-1">
                                    Xəbərdarlıq: Sistemdə heç bir Qrup yoxdur!
                                </p>
                            )}
                        </div>
                    )}

                    {/* Şifrə */}
                    <div>
                        <Label>Şifrə {isEdit ? '(Dəyişmək istəyirsinizsə daxil edin)' : '*'}</Label>
                        <Input 
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder={isEdit ? 'Yeni şifrə' : 'Şifrə'}
                        />
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                            Ləğv Et
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Yüklənir...' : (isEdit ? 'Yadda Saxla' : 'Yarat')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;