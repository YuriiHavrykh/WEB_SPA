import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CarModal from './CarModal';

describe('CarModal Component', () => {
    const mockOnSave = jest.fn();
    const mockOnDelete = jest.fn();
    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        window.confirm = jest.fn(() => true);
    });

    test('дозволяє зберегти нове авто', async () => {
        render(<CarModal onSave={mockOnSave} onClose={mockOnClose} onDelete={mockOnDelete} isAdmin={true} />);
        
        fireEvent.change(screen.getByLabelText('Марка'), { target: { name: 'brand', value: 'Volkswagen' } });
        fireEvent.change(screen.getByLabelText('Модель'), { target: { name: 'model', value: 'Passat' } });
        fireEvent.change(screen.getByLabelText('Рік випуску'), { target: { name: 'yearOfRelease', value: '2015' } });
        fireEvent.change(screen.getByLabelText('Держ. номер'), { target: { name: 'licensePlate', value: 'BC0000AA' } });
        fireEvent.change(screen.getByLabelText('VIN-код'), { target: { name: 'vin', value: 'WVW123456789' } });

        fireEvent.click(screen.getByRole('button', { name: 'Створити' }));

        await waitFor(() => {
            expect(mockOnSave).toHaveBeenCalledWith({
                brand: 'Volkswagen',
                model: 'Passat',
                yearOfRelease: 2015,
                licensePlate: 'BC0000AA',
                vin: 'WVW123456789'
            });
        });
    });

    test('кнопка видалення доступна адміністратору при редагуванні', async () => {
        const item = { idCar: 3, brand: 'Audi', model: 'A4', licensePlate: 'AA1111BB' };
        
        render(<CarModal item={item} onSave={mockOnSave} onClose={mockOnClose} onDelete={mockOnDelete} isAdmin={true} />);
        
        fireEvent.click(screen.getByRole('button', { name: 'Видалити' }));
        expect(window.confirm).toHaveBeenCalledWith('Видалити авто "Audi A4 (AA1111BB)"?');
        
        await waitFor(() => {
            expect(mockOnDelete).toHaveBeenCalledWith(3);
        });
    });
});