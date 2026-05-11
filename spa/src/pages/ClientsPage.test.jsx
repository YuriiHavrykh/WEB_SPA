import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClientsPage from './ClientsPage';
import { useAuth } from '../context/AuthContext';
import useResource from '../hooks/useResource';

jest.mock('../context/AuthContext');
jest.mock('../hooks/useResource');

describe('ClientsPage Component', () => {
    test('відображає повідомлення, якщо клієнтів немає', () => {
        useAuth.mockReturnValue({ credentials: {}, isAdmin: true });
        useResource.mockReturnValue({ items: [], loading: false, error: null });

        render(<ClientsPage />);
        expect(screen.getByText('Немає клієнтів')).toBeInTheDocument();
    });
});