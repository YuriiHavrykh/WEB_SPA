import React, {
    createContext, useContext, useState, useMemo,
} from 'react';

const AuthContext = createContext(null);

const loadSaved = () => {
    try {
        const raw = localStorage.getItem('auth');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(loadSaved);

    const login = (userData) => {
        localStorage.setItem('auth', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('auth');
        setUser(null);
    };

    // Прив'язка менеджера до конкретного СТО (зберігається разом з auth)
    const setCenter = (centerId) => {
        setUser((prev) => {
            const updated = { ...prev, centerId };
            localStorage.setItem('auth', JSON.stringify(updated));
            return updated;
        });
    };

    const value = useMemo(() => ({
        user,
        login,
        logout,
        setCenter,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        centerId: user?.centerId ?? null,
        credentials: user ? { username: user.username, password: user.password } : null,
    }), [user]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
