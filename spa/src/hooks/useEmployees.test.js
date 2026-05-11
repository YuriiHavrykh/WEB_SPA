import { renderHook, act } from '@testing-library/react';
import useUsers from './useEmployees';
import * as api from '../services/api';

// Заглушка (mock) для модуля api
jest.mock('../services/api', () => ({
    getUsers: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
}));

describe('useUsers Hook', () => {
    const mockCredentials = { username: 'admin', password: '123' };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('завантажує користувачів при ініціалізації', async () => {
        const mockData = [{ id: 1, username: 'test1' }];
        api.getUsers.mockResolvedValueOnce(mockData);

        const { result } = renderHook(() => useUsers(mockCredentials));

        expect(result.current.loading).toBe(true);

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(api.getUsers).toHaveBeenCalledWith(mockCredentials);
        expect(result.current.users).toEqual(mockData);
        expect(result.current.loading).toBe(false);
    });

    test('обробляє помилку завантаження', async () => {
        api.getUsers.mockRejectedValueOnce(new Error('API Error'));

        const { result } = renderHook(() => useUsers(mockCredentials));

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(result.current.error).toBe('API Error');
    });

    test('виконує створення, оновлення та видалення з подальшим оновленням списку', async () => {
        api.getUsers.mockResolvedValue([]);
        api.createUser.mockResolvedValue({});
        api.updateUser.mockResolvedValue({});
        api.deleteUser.mockResolvedValue({});

        const { result } = renderHook(() => useUsers(mockCredentials));

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        await act(async () => {
            await result.current.create({ username: 'new' });
        });
        expect(api.createUser).toHaveBeenCalledWith(mockCredentials, { username: 'new' });

        await act(async () => {
            await result.current.update(1, { role: 'admin' });
        });
        expect(api.updateUser).toHaveBeenCalledWith(mockCredentials, 1, { role: 'admin' });

        await act(async () => {
            await result.current.remove(1);
        });
        expect(api.deleteUser).toHaveBeenCalledWith(mockCredentials, 1);

        // getUsers викликається 1 раз на старті + 3 рази після кожної операції
        expect(api.getUsers).toHaveBeenCalledTimes(4);
    });
});