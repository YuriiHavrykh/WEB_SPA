const BASE_URL = 'http://127.0.0.1:8000/api';

const getAuthHeader = () => {
    try {
        const raw = localStorage.getItem('auth');
        if (!raw) return {};
        const { username, password } = JSON.parse(raw);
        const encoded = btoa(`${username}:${password}`);
        return { Authorization: `Basic ${encoded}` };
    } catch {
        return {};
    }
};

const fetchData = async (endpoint, options = {}) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
        },
        ...options,
    });

    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
    }

    return response.json();
};

export default fetchData;