import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EmployeeStaffModal from './EmployeeStaffModal';

describe('EmployeeStaffModal Component', () => {
    const mockOnSave = jest.fn();
    const mockOnDelete = jest.fn();
    const mockOnClose = jest.fn();

    const mockPositions = [{ idPosition: 1, positionName: 'Механік' }];
    const mockCenters = [{ idServiceCenter: 2, name: 'Головне СТО' }];

    beforeEach(() => {
        jest.clearAllMocks();
        window.confirm = jest.fn(() => true);
    });

    test('рендерить форму створення нового співробітника', () => {
        render(
            <EmployeeStaffModal 
                onSave={mockOnSave} onClose={mockOnClose} onDelete={mockOnDelete}
                positions={mockPositions} centers={mockCenters} isAdmin={true}
            />
        );
        expect(screen.getByText('Новий співробітник')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Створити' })).toBeInTheDocument();
    });

    test('дозволяє зберегти нового співробітника', async () => {
        render(
            <EmployeeStaffModal 
                onSave={mockOnSave} onClose={mockOnClose} onDelete={mockOnDelete}
                positions={mockPositions} centers={mockCenters} isAdmin={true}
            />
        );

        fireEvent.change(screen.getByLabelText("Ім'я"), { target: { name: 'firstName', value: 'Олег' } });
        fireEvent.change(screen.getByLabelText('Прізвище'), { target: { name: 'lastName', value: 'Петренко' } });
        fireEvent.change(screen.getByLabelText('Телефон'), { target: { name: 'phoneNumber', value: '0991234567' } });
        fireEvent.change(screen.getByLabelText('Посада'), { target: { name: 'idPosition', value: '1' } });
        fireEvent.change(screen.getByLabelText('СТО'), { target: { name: 'idServiceCenter', value: '2' } });
        fireEvent.click(screen.getByRole('button', { name: 'Створити' }));

        await waitFor(() => {
            expect(mockOnSave).toHaveBeenCalledWith({
                firstName: 'Олег',
                lastName: 'Петренко',
                phoneNumber: '0991234567',
                email: null,
                idPosition: 1,
                idServiceCenter: 2,
            });
        });
    });

    test('дозволяє адміністратору видалити співробітника', async () => {
        const item = { idEmployee: 5, firstName: 'Іван', lastName: 'Іванов' };
        render(
            <EmployeeStaffModal 
                item={item} onSave={mockOnSave} onClose={mockOnClose} onDelete={mockOnDelete}
                positions={mockPositions} centers={mockCenters} isAdmin={true}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: 'Видалити' }));
        expect(window.confirm).toHaveBeenCalledWith('Видалити "Іван Іванов"?');
        
        await waitFor(() => {
            expect(mockOnDelete).toHaveBeenCalledWith(5);
        });
    });
});