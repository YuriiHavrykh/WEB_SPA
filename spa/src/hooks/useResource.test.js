import { renderHook, act } from '@testing-library/react';
import useResource from './useResource';

// Створюємо заглушку для API
const mockApi = {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
};

const mockCredentials = { username: 'test', password: '123' };

describe('useResource Hook', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('ініціалізується правильними дефолтними значеннями та робить перший запит', async () => {
        mockApi.getAll.mockResolvedValueOnce({ results: [{ id: 1, name: 'Item 1' }], count: 10 });

        const { result } = renderHook(() => useResource(mockCredentials, mockApi));

        expect(result.current.loading).toBe(true);
        expect(result.current.items).toEqual([]);

        // Чекаємо завершення асинхронних дій
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(mockApi.getAll).toHaveBeenCalledWith(mockCredentials, 1);
        expect(result.current.loading).toBe(false);
        expect(result.current.items).toHaveLength(1);
        expect(result.current.totalPages).toBe(2); // 10 елементів / 5 PAGE_SIZE
    });

    test('обробляє помилку завантаження', async () => {
        mockApi.getAll.mockRejectedValueOnce(new Error('Network error'));

        const { result } = renderHook(() => useResource(mockCredentials, mockApi));

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(result.current.error).toBe('Network error');
        expect(result.current.items).toEqual([]);
    });

    test('змінює сторінку через goToPage', async () => {
        mockApi.getAll.mockResolvedValue({ results: [], count: 20 });

        const { result } = renderHook(() => useResource(mockCredentials, mockApi));

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        await act(async () => {
            result.current.goToPage(3);
        });

        expect(result.current.page).toBe(3);
        expect(mockApi.getAll).toHaveBeenCalledWith(mockCredentials, 3);
    });

    test('методи create та remove викликають відповідні API та оновлюють дані', async () => {
        mockApi.getAll.mockResolvedValue({ results: [], count: 0 });
        mockApi.create.mockResolvedValueOnce({});
        mockApi.remove.mockResolvedValueOnce({});

        const { result } = renderHook(() => useResource(mockCredentials, mockApi));

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        await act(async () => {
            await result.current.create({ name: 'New Item' });
        });

        expect(mockApi.create).toHaveBeenCalledWith(mockCredentials, { name: 'New Item' });
        expect(mockApi.getAll).toHaveBeenCalledTimes(2); // 1 при старті + 1 після створення

        await act(async () => {
            await result.current.remove(1);
        });

        expect(mockApi.remove).toHaveBeenCalledWith(mockCredentials, 1);
        expect(mockApi.getAll).toHaveBeenCalledTimes(3); // 1 при старті + 1 після create + 1 після remove
    });
});