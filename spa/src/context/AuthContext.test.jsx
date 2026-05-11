import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from './AuthContext';

// Тестовий компонент для доступу до контексту
const TestComponent = () => {
    const { user, login, logout, setCenter, isAuthenticated, isAdmin } = useAuth();

    return (
        <div>
            <span data-testid="auth-status">{isAuthenticated ? 'Logged In' : 'Logged Out'}</span>
            <span data-testid="admin-status">{isAdmin ? 'Admin' : 'Not Admin'}</span>
            <span data-testid="username">{user?.username || 'Guest'}</span>
            <span data-testid="center-id">{user?.centerId || 'None'}</span>
            <button onClick={() => login({ username: 'testuser', password: '123', role: 'manager' })}>Login</button>
            <button onClick={() => login({ username: 'admin', role: 'admin' })}>Login Admin</button>
            <button onClick={() => setCenter(5)}>Set Center</button>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

describe('AuthContext', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('ініціалізується порожнім станом', () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged Out');
        expect(screen.getByTestId('username')).toHaveTextContent('Guest');
    });

    test('дозволяє користувачу увійти та зберігає в localStorage', () => {
        render(<AuthProvider><TestComponent /></AuthProvider>);
        
        act(() => {
            screen.getByText('Login').click();
        });

        expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged In');
        expect(screen.getByTestId('username')).toHaveTextContent('testuser');
        expect(screen.getByTestId('admin-status')).toHaveTextContent('Not Admin');
        expect(JSON.parse(localStorage.getItem('auth')).username).toBe('testuser');
    });

    test('правильно визначає роль адміністратора', () => {
        render(<AuthProvider><TestComponent /></AuthProvider>);
        
        act(() => {
            screen.getByText('Login Admin').click();
        });

        expect(screen.getByTestId('admin-status')).toHaveTextContent('Admin');
    });

    test('дозволяє оновити прив\'язку до СТО (setCenter)', () => {
        render(<AuthProvider><TestComponent /></AuthProvider>);
        
        act(() => {
            screen.getByText('Login').click();
        });
        
        act(() => {
            screen.getByText('Set Center').click();
        });

        expect(screen.getByTestId('center-id')).toHaveTextContent('5');
        expect(JSON.parse(localStorage.getItem('auth')).centerId).toBe(5);
    });

    test('дозволяє користувачу вийти та очищає localStorage', () => {
        render(<AuthProvider><TestComponent /></AuthProvider>);
        
        act(() => {
            screen.getByText('Login').click();
        });
        act(() => {
            screen.getByText('Logout').click();
        });

        expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged Out');
        expect(localStorage.getItem('auth')).toBeNull();
    });
});