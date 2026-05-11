import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EmployeesPage from './EmployeesPage';
import { useAuth } from '../context/AuthContext';
import useResource from '../hooks/useResource';
import { centersApi, positionsApi } from '../services/api';

jest.mock('../context/AuthContext');
jest.mock('../hooks/useResource');
jest.mock('../services/api', () => ({
    centersApi: { getAll: jest.fn() },
    positionsApi: { getAll: jest.fn() },
    employeesApi: {}
}));

describe('EmployeesPage Component', () => {
    test('завантажує та відображає персонал з посадами', async () => {
        useAuth.mockReturnValue({ credentials: {}, isAdmin: true, centerId: null });
        useResource.mockReturnValue({
            items: [{ idEmployee: 1, firstName: 'Іван', lastName: 'Сірко', idPosition: { positionName: 'Майстер' } }],
            loading: false, error: null
        });
        centersApi.getAll.mockResolvedValue([]);
        positionsApi.getAll.mockResolvedValue([]);

        render(<EmployeesPage />);
        
        await waitFor(() => {
            expect(screen.getByText('Іван Сірко')).toBeInTheDocument();
            expect(screen.getByText('Майстер')).toBeInTheDocument();
        });
    });
});