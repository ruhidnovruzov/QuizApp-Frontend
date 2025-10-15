// src/components/common/AuthGuard.tsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '../../context/AuthContext';

interface AuthGuardProps {
    children: React.ReactElement;
    allowedRoles: UserRole[]; // Bu roldan olan istifadəçilərə icazə verilir
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles }) => {
    const { isAuthenticated, role, loading } = useAuth();

    if (loading) {
        // Hələlik yüklənmə prosesi gedirsə, boş bir loader göstər
        return <div>Yüklənir...</div>; 
    }

    // 1. Authentikasiya yoxdursa, login səhifəsinə yönləndir
    if (!isAuthenticated) {
        return <Navigate to="/signin" replace />;
    }
    
    // 2. Rol yoxlanışı
    if (role && !allowedRoles.includes(role)) {
        // İcazə yoxdursa, əsas səhifəyə (Home) yönləndir
        // Yaxşı olardı ki, ayrıca 403 Forbidden səhifəsinə yönləndirilsin
        return <Navigate to="/" replace />; 
    }

    return children;
};

export default AuthGuard;