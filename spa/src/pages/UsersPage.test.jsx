import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UsersPage from './UsersPage';
import { useAuth } from '../context/AuthContext';
import useUsers from '../hooks/useEmployees';

// Мокаємо хуки, щоб не робити реальні запити
jest.mock('../context/AuthContext');
jest.mock('../hooks/useEmployees');

describe('UsersPage Component', () => {
    const mockCreate = jest.fn();
    const mockUpdate = jest.fn();
    const mockRemove = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        // За замовчуванням користувач є адміном
        useAuth.mockReturnValue({
            credentials: { username: 'admin', password: '123' },
            isAdmin: true,
            user: { id: 1, username: 'admin' }
        });
    });

    test('рендерить стан завантаження', () => {
        useUsers.mockReturnValue({ loading: true });
        render(<UsersPage />);
        expect(screen.getByText('Завантаження...')).toBeInTheDocument();
    });

    test('рендерить повідомлення про помилку', () => {
        useUsers.mockReturnValue({ loading: false, error: 'Помилка доступу' });
        render(<UsersPage />);
        expect(screen.getByText('Помилка: Помилка доступу')).toBeInTheDocument();
    });

    test('рендерить таблицю користувачів', () => {
        useUsers.mockReturnValue({
            loading: false,
            error: null,
            users: [
                { id: 1, username: 'admin', email: 'admin@test.com', role: 'admin', isActive: true },
                { id: 2, username: 'manager_1', email: 'mgr@test.com', role: 'manager', isActive: false }
            ],
            create: mockCreate,
            update: mockUpdate,
            remove: mockRemove
        });

        render(<UsersPage />);

        // Перевіряємо заголовки та користувачів
        expect(screen.getByText('Користувачі системи')).toBeInTheDocument();
        expect(screen.getByText('manager_1')).toBeInTheDocument();
        expect(screen.getByText('mgr@test.com')).toBeInTheDocument();
        expect(screen.getByText('inactive')).toBeInTheDocument();
    });

    test('відкриває модальне вікно створення користувача при кліку на "+ Додати"', () => {
        useUsers.mockReturnValue({ loading: false, error: null, users: [] });
        render(<UsersPage />);

        const addButton = screen.getByRole('button', { name: '+ Додати' });
        fireEvent.click(addButton);

        // Перевіряємо, що модалка відкрилась (шукаємо заголовок модалки)
        expect(screen.getByText('Новий користувач')).toBeInTheDocument();
    });
});