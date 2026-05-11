import React, { useState, useEffect } from 'react';
import Pagination from '../components/Pagination';
import { useAuth } from '../context/AuthContext';
import useResource from '../hooks/useResource';
import {
    repairsApi, carsApi, clientsApi, centersApi,
} from '../services/api';
import RepairModal from '../components/RepairModal';
import RepairDetailModal from '../components/RepairDetailModal';

const statusLabel = (val) => val || '—';

const statusClass = (val) => {
    const map = {
        Прийнято: 'badge--status-pending',
        Виконується: 'badge--status-progress',
        Завершено: 'badge--status-done',
        Скасовано: 'badge--status-cancel',
    };
    return map[val] || 'badge--status-pending';
};

function RepairsPage() {
    const { credentials, isAdmin, centerId } = useAuth();
    const {
        items, loading, error, create, update, remove,
        page, totalPages, goToPage,
    } = useResource(credentials, repairsApi);
    const [cars, setCars] = useState([]);
    const [clients, setClients] = useState([]);
    const [centers, setCenters] = useState([]);
    const [selected, setSelected] = useState(null);
    const [detailRepair, setDetailRepair] = useState(null);

    useEffect(() => {
        carsApi.getAll(credentials, 1)
            .then((d) => setCars(d.results || d)).catch(() => {});
        clientsApi.getAll(credentials, 1)
            .then((d) => setClients(d.results || d)).catch(() => {});
        centersApi.getAll(credentials, 1)
            .then((d) => setCenters(d.results || d)).catch(() => {});
    }, [credentials]);

    // Фільтр по СТО (працює і для admin і для manager)
    const visible = !centerId
        ? items
        : items.filter((r) => {
            const id = r.idServiceCenter?.idServiceCenter ?? r.idServiceCenter;
            return id === centerId;
        });

    const handleSave = async (data) => {
        if (selected === 'new') {
            await create(data);
        } else {
            await update(selected.idRepair, data);
        }
    };

    if (loading) return <p className="page-status">Завантаження...</p>;
    if (error) return <p className="page-status page-status--error">{`Помилка: ${error}`}</p>;

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-header__title">Ремонти</h1>
                <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => setSelected('new')}
                >
                    + Новий ремонт
                </button>
            </div>

            <table className="table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Клієнт</th>
                        <th>Авто</th>
                        <th>СТО</th>
                        <th>Прийнято</th>
                        <th>Завершено</th>
                        <th>Статус</th>
                        <th>Дії</th>
                    </tr>
                </thead>
                <tbody>
                    {visible.map((r) => (
                        <tr key={r.idRepair}>
                            <td>{r.idRepair}</td>
                            <td>
                                {r.idClient
                                    ? `${r.idClient.firstName} ${r.idClient.lastName}`
                                    : '—'}
                            </td>
                            <td>
                                {r.idCar
                                    ? `${r.idCar.brand} ${r.idCar.model}`
                                    : '—'}
                            </td>
                            <td>{r.idServiceCenter?.name ?? '—'}</td>
                            <td>{r.acceptenceDate}</td>
                            <td>{r.completionDate || '—'}</td>
                            <td>
                                <span className={`badge ${statusClass(r.status)}`}>
                                    {statusLabel(r.status)}
                                </span>
                            </td>
                            <td className="actions-cell">
                                <button
                                    type="button"
                                    className="btn btn--sm btn--outline"
                                    onClick={() => setSelected(r)}
                                >
                                    Ред.
                                </button>
                                <button
                                    type="button"
                                    className="btn btn--sm btn--primary"
                                    onClick={() => setDetailRepair(r)}
                                >
                                    Деталі
                                </button>
                            </td>
                        </tr>
                    ))}
                    {visible.length === 0 && (
                        <tr>
                            <td colSpan="8" className="table__empty">Немає ремонтів</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {selected !== null && (
                <RepairModal
                    item={selected === 'new' ? null : selected}
                    onSave={handleSave}
                    onDelete={remove}
                    onClose={() => setSelected(null)}
                    cars={cars}
                    clients={clients}
                    centers={centers}
                    isAdmin={isAdmin}
                    defaultCenterId={centerId}
                />
            )}

            {detailRepair !== null && (
                <RepairDetailModal
                    repair={detailRepair}
                    credentials={credentials}
                    onClose={() => setDetailRepair(null)}
                />
            )}
            <Pagination page={page} totalPages={totalPages} onPage={goToPage} />
        </div>
    );
}

export default RepairsPage;
