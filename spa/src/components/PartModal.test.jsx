import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PartModal from './PartModal';

describe('PartModal Component', () => {
    const mockOnSave = jest.fn();
    const mockOnDelete = jest.fn();
    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        window.confirm = jest.fn(() => true);
    });

    test('дозволяє зберегти нову запчастину', async () => {
        render(<PartModal onSave={mockOnSave} onClose={mockOnClose} onDelete={mockOnDelete} />);

        fireEvent.change(screen.getByLabelText('Назва'), { target: { name: 'partName', value: 'Свічка' } });
        fireEvent.change(screen.getByLabelText('Виробник'), { target: { name: 'manufacturer', value: 'Bosch' } });
        fireEvent.change(screen.getByLabelText('Ціна (грн)'), { target: { name: 'cost', value: '450' } });

        fireEvent.click(screen.getByRole('button', { name: 'Створити' }));

        await waitFor(() => {
            expect(mockOnSave).toHaveBeenCalledWith({
                partName: 'Свічка',
                manufacturer: 'Bosch',
                cost: 450
            });
        });
    });

    test('дозволяє видалити запчастину при редагуванні', async () => {
        const item = { idPart: 10, partName: 'Масляний фільтр' };
        render(<PartModal item={item} onSave={mockOnSave} onClose={mockOnClose} onDelete={mockOnDelete} />);

        fireEvent.click(screen.getByRole('button', { name: 'Видалити' }));

        await waitFor(() => expect(mockOnDelete).toHaveBeenCalledWith(10));
    });
});