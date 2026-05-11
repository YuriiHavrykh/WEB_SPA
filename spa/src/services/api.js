const BASE = '/api';

const authHeader = (credentials) => {
    const encoded = btoa(`${credentials.username}:${credentials.password}`);
    return {
        'Content-Type': 'application/json',
        Authorization: `Basic ${encoded}`,
    };
};

const formatDrfErrors = (data) => {
    if (typeof data === 'string') return data;
    if (data.detail) return data.detail;
    if (data.error) return data.error;
    // DRF field-level errors: { fieldName: ["msg1", "msg2"], ... }
    return Object.entries(data)
        .map(([field, msgs]) => `${field}: ${[].concat(msgs).join(', ')}`)
        .join(' | ');
};

const handleResponse = async (res) => {
    if (res.status === 204) return null;
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(formatDrfErrors(data) || `HTTP ${res.status}`);
    }
    return res.json();
};

// ── Автентифікація ──────────────────────────────────────────────────────────
export const checkCredentials = (credentials) => fetch(`${BASE}/users/me/`, {
    headers: authHeader(credentials),
}).then(handleResponse);

// ── Системні користувачі ────────────────────────────────────────────────────
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

// ── Фабрика CRUD для решти ресурсів ────────────────────────────────────────
const makeApi = (path) => ({
    getAll: (credentials, page = 1) => fetch(
        `${BASE}/${path}/?page=${page}`,
        { headers: authHeader(credentials) },
    ).then(handleResponse),

    create: (credentials, data) => fetch(`${BASE}/${path}/`, {
        method: 'POST',
        headers: authHeader(credentials),
        body: JSON.stringify(data),
    }).then(handleResponse),

    update: (credentials, id, data) => fetch(`${BASE}/${path}/${id}/`, {
        method: 'PUT',
        headers: authHeader(credentials),
        body: JSON.stringify(data),
    }).then(handleResponse),

    remove: (credentials, id) => fetch(`${BASE}/${path}/${id}/`, {
        method: 'DELETE',
        headers: authHeader(credentials),
    }).then(handleResponse),
});

export const employeesApi = makeApi('employees');
export const clientsApi = makeApi('clients');
export const carsApi = makeApi('cars');
export const partsApi = makeApi('parts');
export const repairsApi = makeApi('repairs');
export const repairDetailsApi = makeApi('repair-details');
export const centersApi = makeApi('service-centers');
export const positionsApi = makeApi('positions');
export const servicesApi = makeApi('services');
