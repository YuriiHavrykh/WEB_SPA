import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CentersPage from './CentersPage';
import { useAuth } from '../context/AuthContext';
import useResource from '../hooks/useResource';

jest.mock('../context/AuthContext');
jest.mock('../hooks/useResource');

describe('CentersPage Component', () => {
    test('рендерить таблицю СТО та приховує кнопку "Додати" для не-адміна', () => {
        useAuth.mockReturnValue({ credentials: {}, isAdmin: false });
        useResource.mockReturnValue({
            items: [{ idServiceCenter: 1, name: 'СТО Захід', address: 'вул. Зелена', phoneNumber: '067123' }],
            loading: false, error: null
        });

        render(<CentersPage />);
        expect(screen.getByText('СТО Захід')).toBeInTheDocument();
        expect(screen.queryByText('+ Додати')).not.toBeInTheDocument();
    });
});