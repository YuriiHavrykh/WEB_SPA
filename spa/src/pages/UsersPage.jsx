import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import useUsers from '../hooks/useEmployees';
import UserModal from '../components/EmployeeModal';

function UsersPage() {
    const { credentials, isAdmin, user } = useAuth();
    const {
        users, loading, error, create, update, remove,
    } = useUsers(credentials);

    // null = закрита, 'new' = створення, об'єкт = редагування
    const [selected, setSelected] = useState(null);

    const handleSave = async (data) => {
        if (selected === 'new') {
            await create(data);
        } else {
            await update(selected.id, data);
        }
    };

    if (loading) {
        return <p className="page-status">Завантаження...</p>;
    }
    if (error) {
        return (
            <p className="page-status page-status--error">
                {'Помилка: '}
                {error}
            </p>
        );
    }

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-header__title">Користувачі системи</h1>
                {isAdmin && (
                    <button
                        type="button"
                        className="btn btn--primary"
                        onClick={() => setSelected('new')}
                    >
                        + Додати
                    </button>
                )}
            </div>

            <table className="table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Логін</th>
                        <th>Email</th>
                        <th>Роль</th>
                        <th>Статус</th>
                        <th>Дії</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u, i) => (
                        <tr key={u.id}>
                            <td>{i + 1}</td>
                            <td>
                                {u.username}
                                {u.id === user?.id && (
                                    <span className="badge badge--me">я</span>
                                )}
                            </td>
                            <td>{u.email || '—'}</td>
                            <td>
                                <span className={`badge ${u.role === 'admin' ? 'badge--admin' : 'badge--manager'}`}>
                                    {u.role}
                                </span>
                            </td>
                            <td>
                                <span className={`badge ${u.isActive ? 'badge--active' : 'badge--inactive'}`}>
                                    {u.isActive ? 'active' : 'inactive'}
                                </span>
                            </td>
                            <td>
                                <button
                                    type="button"
                                    className="btn btn--sm btn--outline"
                                    onClick={() => setSelected(u)}
                                >
                                    {isAdmin ? 'Редагувати' : 'Переглянути'}
                                </button>
                            </td>
                        </tr>
                    ))}
                    {users.length === 0 && (
                        <tr>
                            <td colSpan="6" className="table__empty">Немає користувачів</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {selected !== null && (
                <UserModal
                    user={selected === 'new' ? null : selected}
                    onSave={handleSave}
                    onDelete={remove}
                    onClose={() => setSelected(null)}
                    isAdmin={isAdmin}
                    currentUserId={user?.id}
                />
            )}
        </div>
    );
}

export default UsersPage;
