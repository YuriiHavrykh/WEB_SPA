import React, { useState } from 'react';
import Pagination from '../components/Pagination';
import { useAuth } from '../context/AuthContext';
import useResource from '../hooks/useResource';
import {
    carsApi,
} from '../services/api';
import CarModal from '../components/CarModal';

function CarsPage() {
    const { credentials, isAdmin } = useAuth();
    const {
        items, loading, error, create, update, remove,
        page, totalPages, goToPage,
    } = useResource(credentials, carsApi);
    const [selected, setSelected] = useState(null);

    const handleSave = async (data) => {
        if (selected === 'new') {
            await create(data);
        } else {
            await update(selected.idCar, data);
        }
    };

    if (loading) return <p className="page-status">Завантаження...</p>;
    if (error) return <p className="page-status page-status--error">{`Помилка: ${error}`}</p>;

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-header__title">Автомобілі</h1>
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
                        <th>Марка та модель</th>
                        <th>Рік</th>
                        <th>VIN</th>
                        <th>Держ. номер</th>
                        <th>Дії</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((car, i) => (
                        <tr key={car.idCar}>
                            <td>{i + 1}</td>
                            <td>{`${car.brand} ${car.model}`}</td>
                            <td>{car.yearOfRelease}</td>
                            <td className="text-mono">{car.vin}</td>
                            <td>{car.licensePlate}</td>
                            <td>
                                <button
                                    type="button"
                                    className="btn btn--sm btn--outline"
                                    onClick={() => setSelected(car)}
                                >
                                    Редагувати
                                </button>
                            </td>
                        </tr>
                    ))}
                    {items.length === 0 && (
                        <tr>
                            <td colSpan="6" className="table__empty">Немає автомобілів</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {selected !== null && (
                <CarModal
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

export default CarsPage;
