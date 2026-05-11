import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RepairModal from './RepairModal';

describe('RepairModal Component', () => {
    const mockOnSave = jest.fn();
    const mockOnDelete = jest.fn();
    const mockOnClose = jest.fn();

    const mockCars = [{ idCar: 1, brand: 'VW', model: 'Golf', licensePlate: 'BC1234' }];
    const mockClients = [{ idClient: 1, firstName: 'Іван', lastName: 'Іванов' }];
    const mockCenters = [{ idServiceCenter: 1, name: 'СТО Головне' }];

    beforeEach(() => {
        jest.clearAllMocks();
        window.confirm = jest.fn(() => true);
    });

    test('рендерить форму створення нового ремонту', () => {
        render(
            <RepairModal 
                onSave={mockOnSave} onClose={mockOnClose} onDelete={mockOnDelete}
                cars={mockCars} clients={mockClients} centers={mockCenters} isAdmin={true}
            />
        );
        expect(screen.getByText('Новий ремонт')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Створити' })).toBeInTheDocument();
    });

    test('рендерить форму редагування та заповнює поля', () => {
        const item = {
            idRepair: 10,
            idCar: 1,
            idClient: 1,
            idServiceCenter: 1,
            acceptenceDate: '2023-10-10',
            status: 'Прийнято'
        };
        render(
            <RepairModal 
                item={item} onSave={mockOnSave} onClose={mockOnClose} onDelete={mockOnDelete}
                cars={mockCars} clients={mockClients} centers={mockCenters} isAdmin={true}
            />
        );
        expect(screen.getByText('Ремонт #10')).toBeInTheDocument();
        expect(screen.getByDisplayValue('2023-10-10')).toBeInTheDocument();
    });

    test('дозволяє зберегти новий ремонт', async () => {
        render(
            <RepairModal 
                onSave={mockOnSave} onClose={mockOnClose} onDelete={mockOnDelete}
                cars={mockCars} clients={mockClients} centers={mockCenters} isAdmin={true}
            />
        );

        fireEvent.change(screen.getByLabelText('Клієнт'), { target: { name: 'idClient', value: '1' } });
        fireEvent.change(screen.getByLabelText('Автомобіль'), { target: { name: 'idCar', value: '1' } });
        fireEvent.change(screen.getByLabelText('СТО'), { target: { name: 'idServiceCenter', value: '1' } });
        fireEvent.change(screen.getByLabelText('Дата прийому'), { target: { name: 'acceptenceDate', value: '2023-10-15' } });

        fireEvent.click(screen.getByRole('button', { name: 'Створити' }));

        await waitFor(() => {
            expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
                idClient: 1,
                idCar: 1,
                idServiceCenter: 1,
                acceptenceDate: '2023-10-15',
                status: 'Прийнято'
            }));
        });
    });

    test('дозволяє адміністратору видалити ремонт', async () => {
        const item = { idRepair: 99 };
        render(
            <RepairModal 
                item={item} onSave={mockOnSave} onClose={mockOnClose} onDelete={mockOnDelete}
                cars={mockCars} clients={mockClients} centers={mockCenters} isAdmin={true}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: 'Видалити' }));
        expect(window.confirm).toHaveBeenCalled();
        
        await waitFor(() => {
            expect(mockOnDelete).toHaveBeenCalledWith(99);
        });
    });
});