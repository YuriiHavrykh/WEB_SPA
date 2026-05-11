import React, { useState } from 'react';
import Pagination from '../components/Pagination';
import { useAuth } from '../context/AuthContext';
import useResource from '../hooks/useResource';
import {
    clientsApi,
} from '../services/api';
import ClientModal from '../components/ClientModal';

function ClientsPage() {
    const { credentials, isAdmin } = useAuth();
    const {
        items, loading, error, create, update, remove,
        page, totalPages, goToPage,
    } = useResource(credentials, clientsApi);
    const [selected, setSelected] = useState(null);

    const handleSave = async (data) => {
        if (selected === 'new') {
            await create(data);
        } else {
            await update(selected.idClient, data);
        }
    };

    if (loading) return <p className="page-status">Завантаження...</p>;
    if (error) return <p className="page-status page-status--error">{`Помилка: ${error}`}</p>;

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-header__title">Клієнти</h1>
                <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => setSelected('new')}
                >
                    + Додати
                </button>
            </div>

            <table className="table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Ім&apos;я</th>
                        <th>Прізвище</th>
                        <th>Телефон</th>
                        <th>Email</th>
                        <th>Дії</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((c, i) => (
                        <tr key={c.idClient}>
                            <td>{i + 1}</td>
                            <td>{c.firstName}</td>
                            <td>{c.lastName}</td>
                            <td>{c.phoneNumber}</td>
                            <td>{c.email || '—'}</td>
                            <td>
                                <button
                                    type="button"
                                    className="btn btn--sm btn--outline"
                                    onClick={() => setSelected(c)}
                                >
                                    Редагувати
                                </button>
                            </td>
                        </tr>
                    ))}
                    {items.length === 0 && (
                        <tr>
                            <td colSpan="6" className="table__empty">Немає клієнтів</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {selected !== null && (
                <ClientModal
                    item={selected === 'new' ? null : selected}
                    onSave={handleSave}
                    onDelete={remove}
                    onClose={() => setSelected(null)}
                    isAdmin={isAdmin}
                />
            )}
            <Pagination page={page} totalPages={totalPages} onPage={goToPage} />
        </div>
    );
}

export default ClientsPage;
