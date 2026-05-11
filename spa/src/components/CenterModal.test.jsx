import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CenterModal from './CenterModal';

describe('CenterModal Component', () => {
    const mockOnSave = jest.fn();
    const mockOnDelete = jest.fn();
    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        // Заглушка для window.confirm
        window.confirm = jest.fn(() => true);
    });

    test('рендерить форму створення нового СТО, якщо item не передано', () => {
        render(<CenterModal onSave={mockOnSave} onClose={mockOnClose} onDelete={mockOnDelete} />);
        
        expect(screen.getByText('Нове СТО')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Створити' })).toBeInTheDocument();
        // Кнопка видалення не має бути видимою при створенні
        expect(screen.queryByRole('button', { name: 'Видалити' })).not.toBeInTheDocument();
    });

    test('рендерить форму редагування та заповнює поля, якщо передано item', () => {
        const item = { idServiceCenter: 1, name: 'АвтоПлюс', address: 'Київ', phoneNumber: '12345' };
        render(<CenterModal item={item} onSave={mockOnSave} onClose={mockOnClose} onDelete={mockOnDelete} />);
        
        expect(screen.getByText('Редагувати СТО')).toBeInTheDocument();
        expect(screen.getByDisplayValue('АвтоПлюс')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Київ')).toBeInTheDocument();
        expect(screen.getByDisplayValue('12345')).toBeInTheDocument();
    });

    test('викликає onSave з правильними даними при сабміті', async () => {
        render(<CenterModal onSave={mockOnSave} onClose={mockOnClose} onDelete={mockOnDelete} />);
        
        // Вводимо дані
        fireEvent.change(screen.getByLabelText('Назва'), { target: { name: 'name', value: 'СТО Бош' } });
        fireEvent.change(screen.getByLabelText('Адреса'), { target: { name: 'address', value: 'Львів' } });
        fireEvent.change(screen.getByLabelText('Телефон'), { target: { name: 'phoneNumber', value: '0990000000' } });

        // Сабмітимо форму
        fireEvent.click(screen.getByRole('button', { name: 'Створити' }));

        await waitFor(() => {
            expect(mockOnSave).toHaveBeenCalledWith({
                name: 'СТО Бош',
                address: 'Львів',
                phoneNumber: '0990000000',
            });
            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    test('викликає onDelete та підтверджує видалення', async () => {
        const item = { idServiceCenter: 5, name: 'Тест' };
        render(<CenterModal item={item} onSave={mockOnSave} onClose={mockOnClose} onDelete={mockOnDelete} />);
        
        fireEvent.click(screen.getByRole('button', { name: 'Видалити' }));

        expect(window.confirm).toHaveBeenCalledWith('Видалити СТО "Тест"?');
        await waitFor(() => {
            expect(mockOnDelete).toHaveBeenCalledWith(5);
            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    test('відображає помилку, якщо onSave падає', async () => {
        mockOnSave.mockRejectedValueOnce(new Error('Помилка сервера'));
        render(<CenterModal onSave={mockOnSave} onClose={mockOnClose} onDelete={mockOnDelete} />);
        
        fireEvent.change(screen.getByLabelText('Назва'), { target: { name: 'name', value: 'СТО' } });
        fireEvent.click(screen.getByRole('button', { name: 'Створити' }));

        await waitFor(() => {
            expect(screen.getByText('Помилка сервера')).toBeInTheDocument();
        });
    });
});