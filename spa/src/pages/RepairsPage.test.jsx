import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RepairsPage from './RepairsPage';
import { useAuth } from '../context/AuthContext';
import useResource from '../hooks/useResource';
import { carsApi, clientsApi, centersApi } from '../services/api';

jest.mock('../context/AuthContext');
jest.mock('../hooks/useResource');
jest.mock('../services/api', () => ({
    carsApi: { getAll: jest.fn() },
    clientsApi: { getAll: jest.fn() },
    centersApi: { getAll: jest.fn() },
    repairsApi: {}
}));

describe('RepairsPage Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue({
            credentials: { username: 'admin' },
            isAdmin: true,
            centerId: null // Адмін бачить усі СТО
        });
        carsApi.getAll.mockResolvedValue([]);
        clientsApi.getAll.mockResolvedValue([]);
        centersApi.getAll.mockResolvedValue([]);
    });

    test('рендерить стан завантаження', () => {
        useResource.mockReturnValue({ loading: true });
        render(<RepairsPage />);
        expect(screen.getByText('Завантаження...')).toBeInTheDocument();
    });

    test('рендерить помилку', () => {
        useResource.mockReturnValue({ loading: false, error: 'Мережева помилка' });
        render(<RepairsPage />);
        expect(screen.getByText('Помилка: Мережева помилка')).toBeInTheDocument();
    });

    test('рендерить таблицю ремонтів та застосовує статуси', async () => {
        useResource.mockReturnValue({
            loading: false,
            error: null,
            items: [
                {
                    idRepair: 15,
                    idClient: { firstName: 'Петро', lastName: 'Петренко' },
                    idCar: { brand: 'Ford', model: 'Focus' },
                    idServiceCenter: { name: 'Головне СТО' },
                    acceptenceDate: '2023-11-01',
                    status: 'Виконується'
                }
            ],
            page: 1,
            totalPages: 1,
            goToPage: jest.fn()
        });

        render(<RepairsPage />);

        await waitFor(() => {
            expect(screen.getByText('Петро Петренко')).toBeInTheDocument();
            expect(screen.getByText('Ford Focus')).toBeInTheDocument();
            expect(screen.getByText('Головне СТО')).toBeInTheDocument();
            expect(screen.getByText('Виконується')).toBeInTheDocument();
        });
    });

    test('відкриває модальне вікно редагування при кліку на "Ред."', async () => {
        useResource.mockReturnValue({
            loading: false,
            error: null,
            items: [{ idRepair: 99, status: 'Прийнято' }]
        });

        render(<RepairsPage />);
        
        // Знаходимо і клікаємо кнопку "Ред."
        const editBtn = screen.getByRole('button', { name: 'Ред.' });
        fireEvent.click(editBtn);

        await waitFor(() => {
            // Має з'явитися модалка редагування
            expect(screen.getByText('Ремонт #99')).toBeInTheDocument();
        });
    });
});