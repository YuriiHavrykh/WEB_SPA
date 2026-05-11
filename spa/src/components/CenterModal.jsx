import React, { useState, useEffect } from 'react';

const EMPTY = {
    name: '',
    address: '',
    phoneNumber: '',
};

function CenterModal({
    item, onSave, onDelete, onClose,
}) {
    const isEdit = !!item;
    const [form, setForm] = useState(EMPTY);
    const [error, setError] = useState('');

    useEffect(() => {
        setForm(item ? {
            name: item.name || '',
            address: item.address || '',
            phoneNumber: item.phoneNumber || '',
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
                name: form.name,
                address: form.address,
                phoneNumber: form.phoneNumber,
            });
            onClose();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Видалити СТО "${item.name}"?`)) return;
        try {
            await onDelete(item.idServiceCenter);
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
                        {isEdit ? 'Редагувати СТО' : 'Нове СТО'}
                    </h2>
                    <button type="button" className="modal__close" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="modal__body">
                    <div className="field">
                        <label className="field__label" htmlFor="ctr-name">Назва</label>
                        <input
                            id="ctr-name"
                            name="name"
                            className="field__input"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="ctr-address">Адреса</label>
                        <input
                            id="ctr-address"
                            name="address"
                            className="field__input"
                            value={form.address}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="ctr-phone">Телефон</label>
                        <input
                            id="ctr-phone"
                            name="phoneNumber"
                            className="field__input"
                            value={form.phoneNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {error && <p className="form-error">{error}</p>}

                    <div className="modal__actions">
                        <button type="submit" className="btn btn--primary">
                            {isEdit ? 'Зберегти' : 'Створити'}
                        </button>
                        {isEdit && (
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

export default CenterModal;
