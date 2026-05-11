import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CarsPage from './CarsPage';
import { useAuth } from '../context/AuthContext';
import useResource from '../hooks/useResource';

jest.mock('../context/AuthContext');
jest.mock('../hooks/useResource');

describe('CarsPage Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue({ credentials: {}, isAdmin: true });
    });

    test('відображає список автомобілів', () => {
        useResource.mockReturnValue({
            items: [{ idCar: 1, brand: 'Toyota', model: 'Camry', yearOfRelease: 2020, vin: 'VIN123', licensePlate: 'AA1111AA' }],
            loading: false,
            error: null,
            page: 1, totalPages: 1, goToPage: jest.fn()
        });

        render(<CarsPage />);
        expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
        expect(screen.getByText('VIN123')).toBeInTheDocument();
    });

    test('відкриває модальне вікно при натисканні "Додати"', () => {
        useResource.mockReturnValue({ items: [], loading: false, error: null });
        render(<CarsPage />);
        
        fireEvent.click(screen.getByText('+ Додати'));
        expect(screen.getByText('Нове авто')).toBeInTheDocument();
    });
});