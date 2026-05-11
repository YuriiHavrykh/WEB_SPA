import React, { useState, useEffect } from 'react';

export const REPAIR_STATUSES = [
    { value: 'Прийнято', label: 'Прийнято' },
    { value: 'Виконується', label: 'Виконується' },
    { value: 'Завершено', label: 'Завершено' },
    { value: 'Скасовано', label: 'Скасовано' },
];

const EMPTY = {
    idCar: '',
    idClient: '',
    idServiceCenter: '',
    acceptenceDate: '',
    completionDate: '',
    status: 'Прийнято',
};

function RepairModal({
    item, onSave, onDelete, onClose, cars, clients, centers, isAdmin, defaultCenterId,
}) {
    const isEdit = !!item;
    const [form, setForm] = useState(EMPTY);
    const [error, setError] = useState('');

    // Якщо авто/клієнт з ремонту не потрапили в список (API повертає лише 100)
    // — додаємо їх вручну щоб select міг показати вибране значення
    const carsList = React.useMemo(() => {
        if (!item?.idCar) return cars;
        const exists = cars.some((c) => c.idCar === item.idCar.idCar);
        return exists ? cars : [item.idCar, ...cars];
    }, [cars, item]);

    const clientsList = React.useMemo(() => {
        if (!item?.idClient) return clients;
        const exists = clients.some((c) => c.idClient === item.idClient.idClient);
        return exists ? clients : [item.idClient, ...clients];
    }, [clients, item]);

    useEffect(() => {
        if (item) {
            setForm({
                idCar: String(item.idCar?.idCar ?? item.idCar ?? ''),
                idClient: String(item.idClient?.idClient ?? item.idClient ?? ''),
                idServiceCenter: String(
                    item.idServiceCenter?.idServiceCenter ?? item.idServiceCenter ?? '',
                ),
                acceptenceDate: item.acceptenceDate || '',
                completionDate: item.completionDate || '',
                status: item.status || 'Прийнято',
            });
        } else {
            setForm({
                ...EMPTY,
                idServiceCenter: defaultCenterId ? String(defaultCenterId) : '',
            });
        }
    }, [item, defaultCenterId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await onSave({
                idCar: Number(form.idCar),
                idClient: Number(form.idClient),
                idServiceCenter: Number(form.idServiceCenter),
                acceptenceDate: form.acceptenceDate,
                completionDate: form.completionDate || null,
                status: form.status,
            });
            onClose();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Видалити ремонт #${item.idRepair}?`)) return;
        try {
            await onDelete(item.idRepair);
            onClose();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal__header">
                    <h2 className="modal__title">
                        {isEdit ? `Ремонт #${item.idRepair}` : 'Новий ремонт'}
                    </h2>
                    <button type="button" className="modal__close" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="modal__body">
                    <div className="field">
                        <label className="field__label" htmlFor="rep-client">Клієнт</label>
                        <select
                            id="rep-client"
                            name="idClient"
                            className="field__input"
                            value={form.idClient}
                            onChange={handleChange}
                            required
                        >
                            <option value="">— Оберіть клієнта —</option>
                            {clientsList.map((c) => (
                                <option key={c.idClient} value={String(c.idClient)}>
                                    {`${c.firstName} ${c.lastName}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="rep-car">Автомобіль</label>
                        <select
                            id="rep-car"
                            name="idCar"
                            className="field__input"
                            value={form.idCar}
                            onChange={handleChange}
                            required
                        >
                            <option value="">— Оберіть авто —</option>
                            {carsList.map((c) => (
                                <option key={c.idCar} value={String(c.idCar)}>
                                    {`${c.brand} ${c.model} (${c.licensePlate})`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="rep-center">СТО</label>
                        <select
                            id="rep-center"
                            name="idServiceCenter"
                            className="field__input"
                            value={form.idServiceCenter}
                            onChange={handleChange}
                            required
                            disabled={!isAdmin && !!defaultCenterId}
                        >
                            <option value="">— Оберіть СТО —</option>
                            {centers.map((c) => (
                                <option key={c.idServiceCenter} value={String(c.idServiceCenter)}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="field">
                            <label className="field__label" htmlFor="rep-accept">
                                Дата прийому
                            </label>
                            <input
                                id="rep-accept"
                                name="acceptenceDate"
                                type="date"
                                className="field__input"
                                value={form.acceptenceDate}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="field">
                            <label className="field__label" htmlFor="rep-complete">
                                Дата завершення
                            </label>
                            <input
                                id="rep-complete"
                                name="completionDate"
                                type="date"
                                className="field__input"
                                value={form.completionDate}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="rep-status">Статус</label>
                        <select
                            id="rep-status"
                            name="status"
                            className="field__input"
                            value={form.status}
                            onChange={handleChange}
                        >
                            {REPAIR_STATUSES.map((s) => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>

                    {error && <p className="form-error">{error}</p>}

                    <div className="modal__actions">
                        <button type="submit" className="btn btn--primary">
                            {isEdit ? 'Зберегти' : 'Створити'}
                        </button>
                        {isEdit && isAdmin && (
                            <button
                                type="button"
                                className="btn btn--danger"
                                onClick={handleDelete}
                            >
                                Видалити
                            </button>
                        )}
                        <button type="button" className="btn btn--outline" onClick={onClose}>
                            Скасувати
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default RepairModal;
