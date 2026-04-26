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

    const value = useMemo(() => ({
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        credentials: user ? { username: user.username, password: user.password } : null,
    }), [user]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
