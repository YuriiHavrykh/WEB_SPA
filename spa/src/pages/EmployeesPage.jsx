import React, { useState, useEffect } from 'react';
import Pagination from '../components/Pagination';
import { useAuth } from '../context/AuthContext';
import useResource from '../hooks/useResource';
import {
    employeesApi, centersApi, positionsApi,
} from '../services/api';
import EmployeeStaffModal from '../components/EmployeeStaffModal';

function EmployeesPage() {
    const { credentials, isAdmin, centerId } = useAuth();
    const {
        items, loading, error, create, update, remove,
        page, totalPages, goToPage,
    } = useResource(credentials, employeesApi);
    const [centers, setCenters] = useState([]);
    const [positions, setPositions] = useState([]);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        centersApi.getAll(credentials, 1)
            .then((d) => setCenters(d.results || d)).catch(() => {});
        positionsApi.getAll(credentials, 1)
            .then((d) => setPositions(d.results || d)).catch(() => {});
    }, [credentials]);

    // Фільтр по СТО: працює для всіх ролей якщо centerId вибрано
    const visible = centerId
        ? items.filter((e) => {
            const id = e.idServiceCenter?.idServiceCenter ?? e.idServiceCenter;
            return id === centerId;
        })
        : items;

    const handleSave = async (data) => {
        if (selected === 'new') {
            await create(data);
        } else {
            await update(selected.idEmployee, data);
        }
    };

    if (loading) return <p className="page-status">Завантаження...</p>;
    if (error) return <p className="page-status page-status--error">{`Помилка: ${error}`}</p>;

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-header__title">Персонал</h1>
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
                        <th>Ім&apos;я</th>
                        <th>Посада</th>
                        <th>Телефон</th>
                        <th>Email</th>
                        <th>СТО</th>
                        <th>Дії</th>
                    </tr>
                </thead>
                <tbody>
                    {visible.map((emp, i) => (
                        <tr key={emp.idEmployee}>
                            <td>{i + 1}</td>
                            <td>{`${emp.firstName} ${emp.lastName}`}</td>
                            <td>{emp.idPosition?.positionName ?? '—'}</td>
                            <td>{emp.phoneNumber}</td>
                            <td>{emp.email || '—'}</td>
                            <td>{emp.idServiceCenter?.name ?? '—'}</td>
                            <td>
                                <button
                                    type="button"
                                    className="btn btn--sm btn--outline"
                                    onClick={() => setSelected(emp)}
                                >
                                    Редагувати
                                </button>
                            </td>
                        </tr>
                    ))}
                    {visible.length === 0 && (
                        <tr>
                            <td colSpan="7" className="table__empty">Немає співробітників</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {selected !== null && (
                <EmployeeStaffModal
                    item={selected === 'new' ? null : selected}
                    onSave={handleSave}
                    onDelete={remove}
                    onClose={() => setSelected(null)}
                    positions={positions}
                    centers={centers}
                    isAdmin={isAdmin}
                />
            )}
            <Pagination page={page} totalPages={totalPages} onPage={goToPage} />
        </div>
    );
}

export default EmployeesPage;
