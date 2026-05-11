import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PartsPage from './PartsPage';
import { useAuth } from '../context/AuthContext';
import useResource from '../hooks/useResource';

jest.mock('../context/AuthContext');
jest.mock('../hooks/useResource');

describe('PartsPage Component', () => {
    test('рендерить список запчастин з цінами', () => {
        useAuth.mockReturnValue({ credentials: {}, isAdmin: true });
        useResource.mockReturnValue({
            items: [
                { idPart: 1, partName: 'Гальмівні колодки', manufacturer: 'Brembo', cost: '1500.50' }
            ],
            loading: false,
            error: null,
            page: 1, totalPages: 1, goToPage: jest.fn()
        });

        render(<PartsPage />);

        expect(screen.getByText('Гальмівні колодки')).toBeInTheDocument();
        expect(screen.getByText('Brembo')).toBeInTheDocument();
        expect(screen.getByText('1500.50 грн')).toBeInTheDocument();
    });

    test('показує повідомлення про порожній каталог', () => {
        useAuth.mockReturnValue({ credentials: {}, isAdmin: false });
        useResource.mockReturnValue({ items: [], loading: false, error: null });

        render(<PartsPage />);
        expect(screen.getByText('Каталог порожній')).toBeInTheDocument();
    });
});