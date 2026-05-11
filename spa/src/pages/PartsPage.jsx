import React, { useState } from 'react';
import Pagination from '../components/Pagination';
import { useAuth } from '../context/AuthContext';
import useResource from '../hooks/useResource';
import {
    partsApi,
} from '../services/api';
import PartModal from '../components/PartModal';

function PartsPage() {
    const { credentials, isAdmin } = useAuth();
    const {
        items, loading, error, create, update, remove,
        page, totalPages, goToPage,
    } = useResource(credentials, partsApi);
    const [selected, setSelected] = useState(null);

    const handleSave = async (data) => {
        if (selected === 'new') {
            await create(data);
        } else {
            await update(selected.idPart, data);
        }
    };

    if (loading) return <p className="page-status">Завантаження...</p>;
    if (error) return <p className="page-status page-status--error">{`Помилка: ${error}`}</p>;

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-header__title">Каталог запчастин</h1>
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
                        <th>Виробник</th>
                        <th>Ціна</th>
                        {isAdmin && <th>Дії</th>}
                    </tr>
                </thead>
                <tbody>
                    {items.map((p, i) => (
                        <tr key={p.idPart}>
                            <td>{i + 1}</td>
                            <td>{p.partName}</td>
                            <td>{p.manufacturer}</td>
                            <td>{`${parseFloat(p.cost).toFixed(2)} грн`}</td>
                            {isAdmin && (
                                <td>
                                    <button
                                        type="button"
                                        className="btn btn--sm btn--outline"
                                        onClick={() => setSelected(p)}
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
                                Каталог порожній
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {selected !== null && isAdmin && (
                <PartModal
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

export default PartsPage;
