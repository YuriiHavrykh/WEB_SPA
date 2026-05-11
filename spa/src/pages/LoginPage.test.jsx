import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import { useAuth } from '../context/AuthContext';
import { checkCredentials } from '../services/api';

// Мокаємо залежності
jest.mock('../context/AuthContext');
jest.mock('../services/api');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('LoginPage Component', () => {
    const mockLogin = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue({ login: mockLogin });
    });

    test('успішний вхід перенаправляє користувача', async () => {
        const mockUserData = { id: 1, username: 'user1', email: 'u@t.com', role: 'admin' };
        checkCredentials.mockResolvedValueOnce(mockUserData);

        render(<BrowserRouter><LoginPage /></BrowserRouter>);

        fireEvent.change(screen.getByLabelText('Логін'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: 'Увійти' }));

        await waitFor(() => {
            expect(checkCredentials).toHaveBeenCalledWith({ username: 'testuser', password: 'password123' });
            expect(mockLogin).toHaveBeenCalledWith({ ...mockUserData, password: 'password123' });
            expect(mockNavigate).toHaveBeenCalledWith('/users');
        });
    });

    test('відображає помилку при невірних облікових даних', async () => {
        checkCredentials.mockRejectedValueOnce(new Error('Unauthorized'));

        render(<BrowserRouter><LoginPage /></BrowserRouter>);

        fireEvent.change(screen.getByLabelText('Логін'), { target: { value: 'wrong' } });
        fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: 'wrong' } });
        fireEvent.click(screen.getByRole('button', { name: 'Увійти' }));

        await waitFor(() => {
            expect(screen.getByText('Невірний логін або пароль')).toBeInTheDocument();
        });
    });
});