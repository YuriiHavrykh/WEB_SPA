import React, { useState } from 'react';
import Pagination from '../components/Pagination';
import { useAuth } from '../context/AuthContext';
import useResource from '../hooks/useResource';
import {
    centersApi,
} from '../services/api';
import CenterModal from '../components/CenterModal';

function CentersPage() {
    const { credentials, isAdmin } = useAuth();
    const {
        items, loading, error, create, update, remove,
        page, totalPages, goToPage,
    } = useResource(credentials, centersApi);
    const [selected, setSelected] = useState(null);

    const handleSave = async (data) => {
        if (selected === 'new') {
            await create(data);
        } else {
            await update(selected.idServiceCenter, data);
        }
    };

    if (loading) return <p className="page-status">Завантаження...</p>;
    if (error) return <p className="page-status page-status--error">{`Помилка: ${error}`}</p>;

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-header__title">Сервісні центри (СТО)</h1>
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
                        <th>Назва</th>
                        <th>Адреса</th>
                        <th>Телефон</th>
                        {isAdmin && <th>Дії</th>}
                    </tr>
                </thead>
                <tbody>
                    {items.map((c, i) => (
                        <tr key={c.idServiceCenter}>
                            <td>{i + 1}</td>
                            <td>{c.name}</td>
                            <td>{c.address}</td>
                            <td>{c.phoneNumber}</td>
                            {isAdmin && (
                                <td>
                                    <button
                                        type="button"
                                        className="btn btn--sm btn--outline"
                                        onClick={() => setSelected(c)}
                                    >
                                        Редагувати
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                    {items.length === 0 && (
                        <tr>
                            <td colSpan={isAdmin ? 5 : 4} className="table__empty">
                                Немає СТО
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {selected !== null && isAdmin && (
                <CenterModal
                    item={selected === 'new' ? null : selected}
                    onSave={handleSave}
                    onDelete={remove}
                    onClose={() => setSelected(null)}
                />
            )}
            <Pagination page={page} totalPages={totalPages} onPage={goToPage} />
        </div>
    );
}

export default CentersPage;
