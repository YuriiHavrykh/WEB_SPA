import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EmployeeModal from './EmployeeModal';

describe('EmployeeModal Component', () => {
    const mockOnSave = jest.fn();
    const mockOnDelete = jest.fn();
    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        window.confirm = jest.fn(() => true);
    });

    test('створює нового користувача (від імені адміна)', async () => {
        render(<EmployeeModal onSave={mockOnSave} onClose={mockOnClose} onDelete={mockOnDelete} isAdmin={true} currentUserId={1} />);

        fireEvent.change(screen.getByLabelText('Логін'), { target: { name: 'username', value: 'new_user' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { name: 'email', value: 'test@test.com' } });
        fireEvent.change(screen.getByLabelText('Пароль'), { target: { name: 'password', value: '12345' } });
        fireEvent.change(screen.getByLabelText('Роль'), { target: { name: 'role', value: 'manager' } });

        fireEvent.click(screen.getByRole('button', { name: 'Створити' }));

        await waitFor(() => {
            expect(mockOnSave).toHaveBeenCalledWith({
                username: 'new_user',
                email: 'test@test.com',
                password: '12345',
                role: 'manager',
                isActive: true
            });
        });
    });

    test('дозволяє адміну видалити іншого користувача', async () => {
        const user = { id: 2, username: 'manager_1' };
        render(<EmployeeModal user={user} onSave={mockOnSave} onClose={mockOnClose} onDelete={mockOnDelete} isAdmin={true} currentUserId={1} />);

        fireEvent.click(screen.getByRole('button', { name: 'Видалити' }));

        await waitFor(() => expect(mockOnDelete).toHaveBeenCalledWith(2));
    });
});