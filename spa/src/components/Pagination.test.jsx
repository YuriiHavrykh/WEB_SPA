import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Pagination from './Pagination';

describe('Pagination Component', () => {
    const mockOnPage = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('не рендериться, якщо totalPages <= 1', () => {
        const { container } = render(<Pagination page={1} totalPages={1} onPage={mockOnPage} />);
        expect(container).toBeEmptyDOMElement();
    });

    test('рендерить правильну кількість кнопок та активну сторінку', () => {
        render(<Pagination page={3} totalPages={5} onPage={mockOnPage} />);
        
        // Перевіряємо наявність кнопок "назад" та "вперед"
        expect(screen.getByText('‹')).toBeInTheDocument();
        expect(screen.getByText('›')).toBeInTheDocument();

        // Перевіряємо, що поточна сторінка має активний клас
        const activeBtn = screen.getByText('3');
        expect(activeBtn).toHaveClass('pagination__btn--active');
    });

    test('кнопка "назад" вимкнена на першій сторінці', () => {
        render(<Pagination page={1} totalPages={5} onPage={mockOnPage} />);
        expect(screen.getByText('‹')).toBeDisabled();
    });

    test('кнопка "вперед" вимкнена на останній сторінці', () => {
        render(<Pagination page={5} totalPages={5} onPage={mockOnPage} />);
        expect(screen.getByText('›')).toBeDisabled();
    });

    test('викликає onPage з правильним аргументом при кліку', () => {
        render(<Pagination page={2} totalPages={5} onPage={mockOnPage} />);
        
        fireEvent.click(screen.getByText('3'));
        expect(mockOnPage).toHaveBeenCalledWith(3);

        fireEvent.click(screen.getByText('‹'));
        expect(mockOnPage).toHaveBeenCalledWith(1);
    });

    test('рендерить крапки для скорочення списку сторінок', () => {
        render(<Pagination page={5} totalPages={10} onPage={mockOnPage} />);
        const dots = screen.getAllByText('…');
        expect(dots.length).toBe(2); // Крапки повинні бути з обох боків (напр., 1 ... 3 4 5 6 7 ... 10)
    });
});