// src/components/modals/SubjectModal.tsx

import React, { useState, useEffect } from 'react';
import { post, put } from '../../../api/service'; // get artıq burada lazım deyil
import Input from '../../form/input/InputField';
import Label from '../../form/Label';
import Button from '../button/Button';
import Swal from 'sweetalert2';

// --- Məlumat Tipləri ---
interface Group {
    id: number;
    name: string;
}

interface Teacher {
    id: number;
    first_name: string;
    last_name: string;
}

interface SubjectData {
    id?: number;
    name: string;
    group_id: string | number | undefined;
    teacher_id: string | number | undefined;
    // Redaktə rejimində dəyərlər də string olaraq gələ bilər
    group?: { name: string; department: { name: string } };
    teacher?: { first_name: string; last_name: string };
}

interface SubjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentSubject: SubjectData | null; // Redaktə üçün
    onSuccess: () => void;

    // Parent tərəfindən ötürüləcək siyahılar
    groups: Group[];
    teachers: Teacher[];
    isAdmin: boolean;
}

const SubjectModal: React.FC<SubjectModalProps> = ({ isOpen, onClose, currentSubject, onSuccess, groups, teachers, isAdmin }) => {
    const isEdit = !!currentSubject;
    const [formData, setFormData] = useState<SubjectData>({ name: '', group_id: '', teacher_id: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Modal açılan kimi datanı doldur
    useEffect(() => {
        if (isEdit && currentSubject) {
            setFormData({
                name: currentSubject.name,
                // group_id və teacher_id-ni string-ə çeviririk ki, select düzgün işləsin
                group_id: String(currentSubject.group_id),
                teacher_id: currentSubject.teacher_id ? String(currentSubject.teacher_id) : '',
            });
        } else {
            setFormData({ name: '', group_id: '', teacher_id: '' });
        }
    }, [currentSubject, isEdit]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Native select istifadə edəcəyik, əlavə helper lazım deyil

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validasiya
        // group_id üçün boş string ('') dəyəri də false olaraq qəbul edilir
        if (!formData.name.trim() || !formData.group_id || (isAdmin && !formData.teacher_id)) {
            setError("Fənn adı, Qrup və Müəllim (Admin üçün) seçimi məcburidir.");
            setLoading(false);
            return;
        }

        try {
            const actionText = isEdit ? 'redaktə edildi' : 'yaradıldı';

            // API-ə göndəriləcək data
            const dataToSend: any = {
                name: formData.name,
                // ID-ləri tam ədədə (Number) çevirib göndəririk
                group_id: Number(formData.group_id),
            };

            // Admin redaktə edirsə, Müəllim ID-si göndərilir
            if (isAdmin && formData.teacher_id) {
                dataToSend.teacher_id = Number(formData.teacher_id);
            }

            if (isEdit && currentSubject?.id) {
                await put(`/subjects/${currentSubject.id}`, dataToSend);
            } else {
                await post('/subjects', dataToSend);
            }

            Swal.fire({
                title: 'Uğurlu!',
                text: `Fənn uğurla ${actionText}.`,
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

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {isEdit ? 'Fənni Redaktə Et' : 'Yeni Fənn Yarat'}
                </h2>

                {error && (
                    <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Fənn Adı */}
                    <div>
                        <Label htmlFor="name">Fənn Adı *</Label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Məsələn: Tətbiqi Kriptoqrafiya"
                        />
                    </div>

                    {/* Qrup Seçimi */}
                    <div>
                        <Label htmlFor="group_id">Qrup *</Label>
                        <select
                            id="group_id"
                            name="group_id"
                            value={String(formData.group_id ?? '')}
                            onChange={handleChange}
                            disabled={loading || groups.length === 0}
                            className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm bg-white dark:bg-gray-800"
                        >
                            <option value="">Qrup seçin</option>
                            {groups.map(group => (
                                <option key={group.id} value={String(group.id)}>{group.name}</option>
                            ))}
                        </select>
                        {groups.length === 0 && <p className="text-xs text-red-500 mt-1">Qrup məlumatları yüklənməyib.</p>}
                    </div>

                    {/* Müəllim Seçimi (Yalnız Admin üçün) */}
                    {isAdmin && (
                        <div>
                            <Label htmlFor="teacher_id">Müəllim *</Label>
                            <select
                                id="teacher_id"
                                name="teacher_id"
                                value={String(formData.teacher_id ?? '')}
                                onChange={handleChange}
                                disabled={loading || teachers.length === 0}
                                className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm bg-white dark:bg-gray-800"
                            >
                                <option value="">Müəllim seçin</option>
                                {teachers.map(teacher => (
                                    <option key={teacher.id} value={String(teacher.id)}>{`${teacher.first_name} ${teacher.last_name}`}</option>
                                ))}
                            </select>
                            {teachers.length === 0 && <p className="text-xs text-red-500 mt-1">Müəllim məlumatları yüklənməyib.</p>}
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
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

export default SubjectModal;