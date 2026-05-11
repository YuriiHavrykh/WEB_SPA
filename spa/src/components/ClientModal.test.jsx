import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClientModal from './ClientModal';

describe('ClientModal Component', () => {
    const mockOnSave = jest.fn();
    const mockOnDelete = jest.fn();
    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        window.confirm = jest.fn(() => true);
    });

    test('дозволяє зберегти нового клієнта', async () => {
        render(<ClientModal onSave={mockOnSave} onClose={mockOnClose} onDelete={mockOnDelete} isAdmin={true} />);

        fireEvent.change(screen.getByLabelText("Ім'я"), { target: { name: 'firstName', value: 'Іван' } });
        fireEvent.change(screen.getByLabelText('Прізвище'), { target: { name: 'lastName', value: 'Франко' } });
        fireEvent.change(screen.getByLabelText('Телефон'), { target: { name: 'phoneNumber', value: '0501112233' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { name: 'email', value: 'ivan@test.com' } });

        fireEvent.click(screen.getByRole('button', { name: 'Створити' }));

        await waitFor(() => {
            expect(mockOnSave).toHaveBeenCalledWith({
                firstName: 'Іван',
                lastName: 'Франко',
                phoneNumber: '0501112233',
                email: 'ivan@test.com'
            });
        });
    });

    test('дозволяє видалити клієнта при редагуванні', async () => {
        const item = { idClient: 2, firstName: 'Тарас', lastName: 'Шевченко' };
        render(<ClientModal item={item} onSave={mockOnSave} onClose={mockOnClose} onDelete={mockOnDelete} isAdmin={true} />);

        fireEvent.click(screen.getByRole('button', { name: 'Видалити' }));
        expect(window.confirm).toHaveBeenCalledWith('Видалити клієнта "Тарас Шевченко"?');

        await waitFor(() => expect(mockOnDelete).toHaveBeenCalledWith(2));
    });
});