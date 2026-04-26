const BASE = '/api';

// Формує заголовок Basic Auth
const authHeader = (credentials) => {
    const encoded = btoa(`${credentials.username}:${credentials.password}`);
    return {
        'Content-Type': 'application/json',
        Authorization: `Basic ${encoded}`,
    };
};

// Обробляє відповідь сервера
const handleResponse = async (res) => {
    if (res.status === 204) return null;
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.detail || `HTTP ${res.status}`);
    }
    return res.json();
};

// Перевіряє credentials — використовується при логіні
export const checkCredentials = (credentials) => fetch(`${BASE}/users/me/`, {
    headers: authHeader(credentials),
}).then(handleResponse);

// CRUD для користувачів системи
export const getUsers = (credentials) => fetch(`${BASE}/users/`, {
    headers: authHeader(credentials),
}).then(handleResponse);

export const createUser = (credentials, data) => fetch(`${BASE}/users/`, {
    method: 'POST',
    headers: authHeader(credentials),
    body: JSON.stringify(data),
}).then(handleResponse);

export const updateUser = (credentials, id, data) => fetch(`${BASE}/users/${id}/`, {
    method: 'PUT',
    headers: authHeader(credentials),
    body: JSON.stringify(data),
}).then(handleResponse);

export const deleteUser = (credentials, id) => fetch(`${BASE}/users/${id}/`, {
    method: 'DELETE',
    headers: authHeader(credentials),
}).then(handleResponse);
