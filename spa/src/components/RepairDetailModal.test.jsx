import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RepairDetailModal from './RepairDetailModal';
import { repairDetailsApi, servicesApi, partsApi } from '../services/api';

// Заглушка (mock) для API
jest.mock('../services/api', () => ({
    repairDetailsApi: { getAll: jest.fn(), create: jest.fn(), remove: jest.fn() },
    servicesApi: { getAll: jest.fn() },
    partsApi: { getAll: jest.fn() }
}));

describe('RepairDetailModal Component', () => {
    const mockOnClose = jest.fn();
    const mockCredentials = { username: 'test', password: '123' };
    const mockRepair = { idRepair: 1 };

    beforeEach(() => {
        jest.clearAllMocks();
        window.confirm = jest.fn(() => true);
        
        // Повертаємо порожні дані за замовчуванням
        repairDetailsApi.getAll.mockResolvedValue([]);
        servicesApi.getAll.mockResolvedValue([{ idService: 1, serviceName: 'Миття', baseCost: 100 }]);
        partsApi.getAll.mockResolvedValue([{ idPart: 1, partName: 'Фільтр', cost: 200 }]);
    });

    test('рендерить стан завантаження, а потім дані', async () => {
        render(<RepairDetailModal repair={mockRepair} credentials={mockCredentials} onClose={mockOnClose} />);
        
        expect(screen.getByText('Завантаження...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByText('Завантаження...')).not.toBeInTheDocument();
            expect(screen.getByText('Деталі ремонту #1')).toBeInTheDocument();
            expect(screen.getByText('Немає позицій')).toBeInTheDocument();
        });
    });

    test('додає нову послугу', async () => {
        repairDetailsApi.create.mockResolvedValue({ idRepairDetail: 10, idService: 1, count: 2, idRepair: 1 });
        
        render(<RepairDetailModal repair={mockRepair} credentials={mockCredentials} onClose={mockOnClose} />);
        
        await waitFor(() => {
            expect(screen.queryByText('Завантаження...')).not.toBeInTheDocument();
        });

        // Вибираємо тип "Послуга"
        fireEvent.change(screen.getByLabelText('Тип'), { target: { name: 'type', value: 'service' } });
        // Вибираємо конкретну послугу
        fireEvent.change(screen.getByLabelText('Послуга'), { target: { name: 'idService', value: '1' } });
        // Змінюємо кількість
        fireEvent.change(screen.getByLabelText('Кількість'), { target: { name: 'count', value: '2' } });

        fireEvent.click(screen.getByRole('button', { name: '+ Додати' }));

        await waitFor(() => {
            expect(repairDetailsApi.create).toHaveBeenCalledWith(mockCredentials, expect.objectContaining({
                idRepair: 1,
                idService: 1,
                count: 2
            }));
            // Після додавання на екрані має з'явитись наша послуга
            expect(screen.getByText('Миття')).toBeInTheDocument();
        });
    });

    test('відображає помилку, якщо форма відправлена без вибору послуги', async () => {
        render(<RepairDetailModal repair={mockRepair} credentials={mockCredentials} onClose={mockOnClose} />);
        
        await waitFor(() => expect(screen.queryByText('Завантаження...')).not.toBeInTheDocument());

        fireEvent.click(screen.getByRole('button', { name: '+ Додати' }));

        await waitFor(() => {
            expect(screen.getByText('Оберіть послугу')).toBeInTheDocument();
        });
    });
});