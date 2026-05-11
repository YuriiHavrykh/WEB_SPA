import React, { useState, useEffect } from 'react';

const EMPTY = {
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
};

function ClientModal({
    item, onSave, onDelete, onClose, isAdmin,
}) {
    const isEdit = !!item;
    const [form, setForm] = useState(EMPTY);
    const [error, setError] = useState('');

    useEffect(() => {
        setForm(item ? {
            firstName: item.firstName || '',
            lastName: item.lastName || '',
            phoneNumber: item.phoneNumber || '',
            email: item.email || '',
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
                firstName: form.firstName,
                lastName: form.lastName,
                phoneNumber: form.phoneNumber,
                email: form.email || null,
            });
            onClose();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Видалити клієнта "${item.firstName} ${item.lastName}"?`)) return;
        try {
            await onDelete(item.idClient);
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
                        {isEdit ? 'Редагувати клієнта' : 'Новий клієнт'}
                    </h2>
                    <button type="button" className="modal__close" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="modal__body">
                    <div className="form-row">
                        <div className="field">
                            <label className="field__label" htmlFor="cl-firstName">Ім&apos;я</label>
                            <input
                                id="cl-firstName"
                                name="firstName"
                                className="field__input"
                                value={form.firstName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="field">
                            <label className="field__label" htmlFor="cl-lastName">Прізвище</label>
                            <input
                                id="cl-lastName"
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
                            <label className="field__label" htmlFor="cl-phone">Телефон</label>
                            <input
                                id="cl-phone"
                                name="phoneNumber"
                                className="field__input"
                                value={form.phoneNumber}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="field">
                            <label className="field__label" htmlFor="cl-email">Email</label>
                            <input
                                id="cl-email"
                                name="email"
                                type="email"
                                className="field__input"
                                value={form.email}
                                onChange={handleChange}
                            />
                        </div>
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

export default ClientModal;
