import React, { useState, useEffect } from 'react';

const EMPTY = {
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    idPosition: '',
    idServiceCenter: '',
};

function EmployeeStaffModal({
    item, onSave, onDelete, onClose, positions, centers, isAdmin,
}) {
    const isEdit = !!item;
    const [form, setForm] = useState(EMPTY);
    const [error, setError] = useState('');

    useEffect(() => {
        if (item) {
            setForm({
                firstName: item.firstName || '',
                lastName: item.lastName || '',
                phoneNumber: item.phoneNumber || '',
                email: item.email || '',
                idPosition: item.idPosition?.idPosition ?? item.idPosition ?? '',
                idServiceCenter: item.idServiceCenter?.idServiceCenter ?? item.idServiceCenter ?? '',
            });
        } else {
            setForm(EMPTY);
        }
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
                firstName: form.firstName,
                lastName: form.lastName,
                phoneNumber: form.phoneNumber,
                email: form.email || null,
                idPosition: Number(form.idPosition),
                idServiceCenter: Number(form.idServiceCenter),
            });
            onClose();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Видалити "${item.firstName} ${item.lastName}"?`)) return;
        try {
            await onDelete(item.idEmployee);
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
                        {isEdit ? 'Редагувати співробітника' : 'Новий співробітник'}
                    </h2>
                    <button type="button" className="modal__close" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="modal__body">
                    <div className="form-row">
                        <div className="field">
                            <label className="field__label" htmlFor="emp-firstName">Ім&apos;я</label>
                            <input
                                id="emp-firstName"
                                name="firstName"
                                className="field__input"
                                value={form.firstName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="field">
                            <label className="field__label" htmlFor="emp-lastName">Прізвище</label>
                            <input
                                id="emp-lastName"
                                name="lastName"
                                className="field__input"
                                value={form.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="field">
                            <label className="field__label" htmlFor="emp-phone">Телефон</label>
                            <input
                                id="emp-phone"
                                name="phoneNumber"
                                className="field__input"
                                value={form.phoneNumber}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="field">
                            <label className="field__label" htmlFor="emp-email">Email</label>
                            <input
                                id="emp-email"
                                name="email"
                                type="email"
                                className="field__input"
                                value={form.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="emp-position">Посада</label>
                        <select
                            id="emp-position"
                            name="idPosition"
                            className="field__input"
                            value={form.idPosition}
                            onChange={handleChange}
                            required
                        >
                            <option value="">— Оберіть посаду —</option>
                            {positions.map((p) => (
                                <option key={p.idPosition} value={p.idPosition}>
                                    {p.positionName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="emp-center">СТО</label>
                        <select
                            id="emp-center"
                            name="idServiceCenter"
                            className="field__input"
                            value={form.idServiceCenter}
                            onChange={handleChange}
                            required
                            disabled={!isAdmin}
                        >
                            <option value="">— Оберіть СТО —</option>
                            {centers.map((c) => (
                                <option key={c.idServiceCenter} value={c.idServiceCenter}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
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

export default EmployeeStaffModal;
