// src/components/modals/DepartmentModal.tsx (SweetAlert2 ilə Yenilənmiş Versiya)

import React, { useState, useEffect } from 'react';
import { post, put } from '../../../api/service'; 
import Input from '../../form/input/InputField';
import Label from '../../form/Label';
import Button from '../button/Button';
// SweetAlert2 importu
import Swal from 'sweetalert2';


// Yalnız ID və Name saxlayırıq
interface Department {
    id?: number; 
    name: string;
}

interface DepartmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentDepartment: Department | null; 
    onSuccess: () => void; 
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({ isOpen, onClose, currentDepartment, onSuccess }) => {
    const isEdit = !!currentDepartment; 
    const [formData, setFormData] = useState<Department>({ name: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Modal açılan kimi datanı doldur
    useEffect(() => {
        if (isEdit && currentDepartment) {
            setFormData({ name: currentDepartment.name, id: currentDepartment.id });
        } else {
            setFormData({ name: '' });
        }
    }, [currentDepartment, isEdit]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Sadə validasiya
        if (!formData.name.trim()) {
            setError("Kafedra Adı boş qala bilməz.");
            setLoading(false);
            return;
        }

        try {
            const actionText = isEdit ? 'redaktə edildi' : 'yaradıldı';
            const dataToSend = { name: formData.name }; 
            
            if (isEdit && formData.id) {
                // PUT API çağırışı (Redaktə)
                await put(`/departments/${formData.id}`, dataToSend);
            } else {
                // POST API çağırışı (Yarat)
                await post('/departments', dataToSend);
            }
            
            // SweetAlert2 Uğur Mesajı
            Swal.fire({
                title: 'Uğurlu!',
                text: `Kafedra uğurla ${actionText}.`,
                icon: 'success',
                timer: 2000, // 2 saniyə sonra avtomatik bağlanır
                showConfirmButton: false
            });
            
            onSuccess(); 
            onClose();

        } catch (err: any) {
            const msg = err.response?.data?.message || 'Əməliyyat zamanı xəta baş verdi.';
            setError(msg);
            
            // Əgər API-dən gələn xətanı modal içində göstərməkdən əlavə, SweetAlert ilə də bildirmək istəsəniz:
            /*
            Swal.fire({
                title: 'Xəta!',
                text: msg,
                icon: 'error',
            });
            */
            
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {isEdit ? 'Kafedranı Redaktə Et' : 'Yeni Kafedra Yarat'}
                </h2>
                
                {/* Error mesajını modalın daxilində göstərmək daha yaxşıdır */}
                {error && (
                    <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Yalnız Kafedra Adı qalır */}
                    <div>
                        <Label>Kafedra Adı *</Label>
                        <Input 
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Məs: Kibertehlükəsizlik"
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

export default DepartmentModal;