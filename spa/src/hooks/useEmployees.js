import { useState, useEffect, useCallback } from 'react';
import {
    getUsers, createUser, updateUser, deleteUser,
} from '../services/api';

const useUsers = (credentials) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getUsers(credentials);
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [credentials]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const create = async (data) => {
        await createUser(credentials, data);
        await fetchUsers();
    };

    const update = async (id, data) => {
        await updateUser(credentials, id, data);
        await fetchUsers();
    };

    const remove = async (id) => {
        await deleteUser(credentials, id);
        await fetchUsers();
    };

    return {
        users, loading, error, create, update, remove,
    };
};

export default useUsers;
