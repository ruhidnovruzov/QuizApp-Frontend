// src/context/AuthContext.tsx

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { getProfile } from '../api/service';

// Rolların tipləri
export type UserRole = 'Admin' | 'Teacher' | 'Student' | null;

interface UserProfile {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: UserRole;
    department?: { name: string };
    group?: { name: string };
}

interface AuthContextType {
    user: UserProfile | null;
    isAuthenticated: boolean;
    role: UserRole;
    loading: boolean;
    login: (token: string) => void;
    logout: () => void;
    fetchProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const isAuthenticated = !!user;
    const role: UserRole = user?.role || null;

    // 1. Profil məlumatlarını API-dən gətirir
    const fetchProfile = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const response = await getProfile();
            setUser(response.data);
        } catch (error) {
            console.error('Profil gətirilə bilmədi, token silindi.', error);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };
    
    // 2. Login prosesi: Tokeni yaddaşa yazır və profili gətirir
    const handleLogin = (token: string) => {
        localStorage.setItem('token', token);
        fetchProfile();
    };

    // 3. Logout prosesi
    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        // Tətbiqi yenidən yükləyə bilərik ki, tamamilə təmizlənsin
        window.location.href = '/signin'; 
    };

    // Tətbiq yükləndikdə profili gətir
    useEffect(() => {
        fetchProfile();
    }, []);

    const contextValue: AuthContextType = {
        user,
        isAuthenticated,
        role,
        loading,
        login: handleLogin,
        logout: handleLogout,
        fetchProfile
    };

    // Yüklənənə qədər boş səhifə göstərmək (və ya loader)
    if (loading) {
        return <div>Yüklənir...</div>; 
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Context-i istifadə etmək üçün hook
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};