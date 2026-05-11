import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import { centersApi } from '../services/api';

// Мокаємо контекст та API
jest.mock('../context/AuthContext', () => ({
    useAuth: jest.fn(),
}));
jest.mock('../services/api', () => ({
    centersApi: { getAll: jest.fn() },
}));

// Мокаємо useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('Navbar Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        centersApi.getAll.mockResolvedValue([{ idServiceCenter: 1, name: 'СТО Львів' }]);
    });

    test('рендерить навігацію для адміністратора (з меню "Користувачі")', async () => {
        useAuth.mockReturnValue({
            user: { username: 'admin_user', role: 'admin' },
            logout: jest.fn(),
            isAdmin: true,
            centerId: null,
            setCenter: jest.fn(),
            credentials: { username: 'admin_user' },
        });

        render(<BrowserRouter><Navbar /></BrowserRouter>);
        
        expect(screen.getByText('admin_user')).toBeInTheDocument();
        expect(screen.getByText('Користувачі')).toBeInTheDocument();
        
        await waitFor(() => {
            expect(screen.getByText('СТО Львів')).toBeInTheDocument();
        });
    });

    test('приховує меню "Користувачі" для звичайного менеджера та обробляє вихід', () => {
        const mockLogout = jest.fn();
        useAuth.mockReturnValue({
            user: { username: 'manager_user', role: 'manager' },
            logout: mockLogout,
            isAdmin: false,
            centerId: null,
            setCenter: jest.fn(),
            credentials: null,
        });

        render(<BrowserRouter><Navbar /></BrowserRouter>);
        
        expect(screen.queryByText('Користувачі')).not.toBeInTheDocument();
        expect(screen.getByText('manager_user')).toBeInTheDocument();

        // Тестуємо кнопку виходу
        fireEvent.click(screen.getByText('Вийти'));
        expect(mockLogout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
});