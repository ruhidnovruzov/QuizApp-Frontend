// src/components/modals/GroupModal.tsx (YENİLƏNMİŞ)

import React, { useState, useEffect } from 'react';
import { post, put } from '../../../api/service';
import Input from '../../form/input/InputField';
import Label from '../../form/Label';
import Button from '../button/Button';
import Swal from 'sweetalert2';
// Select komponentini istifadə etmirik, native select istifadə edəcəyik

// --- Məlumat Tipləri ---
interface Department {
    id: number;
    name: string;
}

interface Group {
    id?: number;
    name: string;
    department_id?: number | null; // Qrupun aid olduğu kafedranın ID-si (Edit üçün gəlir)
}

interface GroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentGroup: Group | null;
    onSuccess: () => void;
    departments: Department[]; // YENİ: Kafedra siyahısı
    departmentsLoading: boolean; // YENİ: Kafedra yüklənmə vəziyyəti
}

const GroupModal: React.FC<GroupModalProps> = ({ isOpen, onClose, currentGroup, onSuccess, departments, departmentsLoading }) => {
    const isEdit = !!currentGroup;
    // department_id-ni string kimi saxlayırıq, çünki select inputu string qaytarır.
    const [formData, setFormData] = useState<{ name: string, department_id: string | number | undefined }>({ name: '', department_id: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Modal açılan kimi datanı doldur
    useEffect(() => {
        if (isEdit && currentGroup) {
            // Edit zamanı kafedra ID-sini stringə çevirib forma datasına qoyuruq.
            setFormData({
                name: currentGroup.name,
                department_id: currentGroup.department_id ? String(currentGroup.department_id) : '',
            });
        } else {
            setFormData({ name: '', department_id: '' });
        }
    }, [currentGroup, isEdit]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validasiya
        if (!formData.name.trim() || !formData.department_id) {
            setError("Qrup adı və Kafedra seçimi məcburidir.");
            setLoading(false);
            return;
        }

        try {
            const actionText = isEdit ? 'redaktə edildi' : 'yaradıldı';

            // API-ə göndəriləcək data (department_id-ni nömrəyə çeviririk)
            const dataToSend = {
                name: formData.name,
                department_id: Number(formData.department_id) // ID-ni nömrə formatına çeviririk
            };

            if (isEdit && currentGroup?.id) {
                // PUT API çağırışı (Redaktə)
                await put(`/groups/${currentGroup.id}`, dataToSend);
            } else {
                // POST API çağırışı (Yarat)
                await post('/groups', dataToSend);
            }

            Swal.fire({
                title: 'Uğurlu!',
                text: `Qrup uğurla ${actionText}.`,
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
                    {isEdit ? 'Qrupu Redaktə Et' : 'Yeni Qrup Yarat'}
                </h2>

                {error && (
                    <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Kafedra Seçimi */}
                    <div>
                        <Label htmlFor="department_id">Kafedra *</Label>
                        <select
                            id="department_id"
                            name="department_id"
                            value={String(formData.department_id ?? '')}
                            onChange={handleChange}
                            disabled={loading || departmentsLoading}
                            className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm bg-white dark:bg-gray-800"
                        >
                            <option value="">Kafedra seçin</option>
                            {(!departmentsLoading ? departments : []).map(dep => (
                                <option key={dep.id} value={String(dep.id)}>{dep.name}</option>
                            ))}
                            {departmentsLoading && <option value="" disabled>Yüklənir...</option>}
                        </select>
                    </div>

                    {/* Qrup Adı */}
                    <div>
                        <Label htmlFor="name">Qrup Adı *</Label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Məsələn: 642a3"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Ləğv Et
                        </Button>
                        <Button type="submit" disabled={loading || departmentsLoading}>
                            {loading ? 'Yüklənir...' : (isEdit ? 'Yadda Saxla' : 'Yarat')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GroupModal;