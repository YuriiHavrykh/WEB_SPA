import React, { useState, useEffect } from 'react';

const EMPTY = {
    brand: '',
    model: '',
    yearOfRelease: '',
    vin: '',
    licensePlate: '',
};

function CarModal({
    item, onSave, onDelete, onClose, isAdmin,
}) {
    const isEdit = !!item;
    const [form, setForm] = useState(EMPTY);
    const [error, setError] = useState('');

    useEffect(() => {
        setForm(item ? {
            brand: item.brand || '',
            model: item.model || '',
            yearOfRelease: item.yearOfRelease || '',
            vin: item.vin || '',
            licensePlate: item.licensePlate || '',
        } : EMPTY);
    }, [item]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await onSave({
                brand: form.brand,
                model: form.model,
                yearOfRelease: Number(form.yearOfRelease),
                vin: form.vin,
                licensePlate: form.licensePlate,
            });
            onClose();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Видалити авто "${item.brand} ${item.model} (${item.licensePlate})"?`)) return;
        try {
            await onDelete(item.idCar);
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
                        {isEdit ? 'Редагувати авто' : 'Нове авто'}
                    </h2>
                    <button type="button" className="modal__close" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="modal__body">
                    <div className="form-row">
                        <div className="field">
                            <label className="field__label" htmlFor="car-brand">Марка</label>
                            <input
                                id="car-brand"
                                name="brand"
                                className="field__input"
                                value={form.brand}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="field">
                            <label className="field__label" htmlFor="car-model">Модель</label>
                            <input
                                id="car-model"
                                name="model"
                                className="field__input"
                                value={form.model}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="field">
                            <label className="field__label" htmlFor="car-year">Рік випуску</label>
                            <input
                                id="car-year"
                                name="yearOfRelease"
                                type="number"
                                min="1900"
                                max="2099"
                                className="field__input"
                                value={form.yearOfRelease}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="field">
                            <label className="field__label" htmlFor="car-plate">Держ. номер</label>
                            <input
                                id="car-plate"
                                name="licensePlate"
                                className="field__input"
                                value={form.licensePlate}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="car-vin">VIN-код</label>
                        <input
                            id="car-vin"
                            name="vin"
                            className="field__input"
                            value={form.vin}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {error && <p className="form-error">{error}</p>}

                    <div className="modal__actions">
                        <button type="submit" className="btn btn--primary">
                            {isEdit ? 'Зберегти' : 'Створити'}
                        </button>
                        {isEdit && isAdmin && (
                            <button type="button" className="btn btn--danger" onClick={handleDelete}>
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

export default CarModal;
