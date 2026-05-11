import {
    checkCredentials,
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    carsApi,
} from './api';

// Мокаємо глобальний fetch
global.fetch = jest.fn();

describe('API Services', () => {
    const mockCredentials = { username: 'testuser', password: 'password123' };
    // btoa('testuser:password123') === 'dGVzdHVzZXI6cGFzc3dvcmQxMjM='
    const expectedHeaders = {
        'Content-Type': 'application/json',
        Authorization: 'Basic dGVzdHVzZXI6cGFzc3dvcmQxMjM=',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Успішні запити та handleResponse', () => {
        test('повертає JSON при успішному запиті', async () => {
            const mockData = { id: 1, name: 'Test' };
            fetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => mockData,
            });

            const result = await checkCredentials(mockCredentials);
            
            expect(fetch).toHaveBeenCalledWith('/api/users/me/', { headers: expectedHeaders });
            expect(result).toEqual(mockData);
        });

        test('повертає null при статусі 204 (No Content)', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                status: 204,
            });

            const result = await deleteUser(mockCredentials, 1);
            
            expect(fetch).toHaveBeenCalledWith('/api/users/1/', {
                method: 'DELETE',
                headers: expectedHeaders,
            });
            expect(result).toBeNull();
        });
    });

    describe('Обробка помилок (formatDrfErrors)', () => {
        test('обробляє просту текстову помилку', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                json: async () => 'Проста помилка',
            });

            await expect(getUsers(mockCredentials)).rejects.toThrow('Проста помилка');
        });

        test('обробляє помилку у полі detail', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: async () => ({ detail: 'Неавторизовано' }),
            });

            await expect(getUsers(mockCredentials)).rejects.toThrow('Неавторизовано');
        });

        test('обробляє помилку у полі error', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 403,
                json: async () => ({ error: 'Доступ заборонено' }),
            });

            await expect(getUsers(mockCredentials)).rejects.toThrow('Доступ заборонено');
        });

        test('форматує помилки полів DRF (словник масивів)', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                json: async () => ({
                    username: ['Це поле обов\'язкове.'],
                    password: ['Занадто короткий', 'Потрібні цифри']
                }),
            });

            await expect(createUser(mockCredentials, {})).rejects.toThrow(
                'username: Це поле обов\'язкове. | password: Занадто короткий, Потрібні цифри'
            );
        });

        test('повертає базову HTTP помилку, якщо JSON не парситься', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: async () => Promise.reject(new Error('SyntaxError')),
            });

            await expect(getUsers(mockCredentials)).rejects.toThrow('HTTP 500');
        });
    });

    describe('Фабрика CRUD (makeApi)', () => {
        test('getAll додає параметр сторінки', async () => {
            fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
            
            await carsApi.getAll(mockCredentials, 2);
            expect(fetch).toHaveBeenCalledWith('/api/cars/?page=2', { headers: expectedHeaders });
        });

        test('create відправляє POST запит з тілом', async () => {
            fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1 }) });
            
            await carsApi.create(mockCredentials, { brand: 'BMW' });
            expect(fetch).toHaveBeenCalledWith('/api/cars/', {
                method: 'POST',
                headers: expectedHeaders,
                body: JSON.stringify({ brand: 'BMW' }),
            });
        });

        test('update відправляє PUT запит з тілом', async () => {
            fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
            
            await carsApi.update(mockCredentials, 5, { brand: 'Audi' });
            expect(fetch).toHaveBeenCalledWith('/api/cars/5/', {
                method: 'PUT',
                headers: expectedHeaders,
                body: JSON.stringify({ brand: 'Audi' }),
            });
        });

        test('remove відправляє DELETE запит', async () => {
            fetch.mockResolvedValueOnce({ ok: true, status: 204 });
            
            await carsApi.remove(mockCredentials, 5);
            expect(fetch).toHaveBeenCalledWith('/api/cars/5/', {
                method: 'DELETE',
                headers: expectedHeaders,
            });
        });
    });

    describe('Специфічні методи користувачів', () => {
        test('updateUser відправляє PUT запит', async () => {
            fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
            
            await updateUser(mockCredentials, 10, { role: 'admin' });
            expect(fetch).toHaveBeenCalledWith('/api/users/10/', {
                method: 'PUT',
                headers: expectedHeaders,
                body: JSON.stringify({ role: 'admin' }),
            });
        });
    });
});