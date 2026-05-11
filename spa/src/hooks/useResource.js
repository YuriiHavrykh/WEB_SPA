import { useState, useEffect, useCallback } from 'react';

const PAGE_SIZE = 5;

const useResource = (credentials, api) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchPage = useCallback(async (targetPage) => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getAll(credentials, targetPage);
            const results = Array.isArray(data) ? data : (data.results || []);
            const total = data.count !== undefined
                ? Math.ceil(data.count / PAGE_SIZE)
                : 1;

            if (targetPage > total && total > 0) {
                setPage(total);
                return;
            }

            setItems(results);
            setTotalPages(total || 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [credentials, api]);

    useEffect(() => {
        fetchPage(page);
    }, [fetchPage, page]);

    const goToPage = (p) => setPage(p);

    const create = async (data) => {
        await api.create(credentials, data);
        await fetchPage(page);
    };

    const update = async (id, data) => {
        await api.update(credentials, id, data);
        await fetchPage(page);
    };

    const remove = async (id) => {
        await api.remove(credentials, id);
        await fetchPage(page);
    };

    return {
        items,
        loading,
        error,
        create,
        update,
        remove,
        refresh: fetchPage,
        page,
        totalPages,
        goToPage,
    };
};

export default useResource;
