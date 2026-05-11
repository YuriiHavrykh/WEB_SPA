import React, { useState, useEffect } from 'react';

const EMPTY = {
    partName: '',
    manufacturer: '',
    cost: '',
};

function PartModal({
    item, onSave, onDelete, onClose,
}) {
    const isEdit = !!item;
    const [form, setForm] = useState(EMPTY);
    const [error, setError] = useState('');

    useEffect(() => {
        setForm(item ? {
            partName: item.partName || '',
            manufacturer: item.manufacturer || '',
            cost: item.cost || '',
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
                partName: form.partName,
                manufacturer: form.manufacturer,
                cost: parseFloat(form.cost),
            });
            onClose();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Видалити запчастину "${item.partName}"?`)) return;
        try {
            await onDelete(item.idPart);
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
                        {isEdit ? 'Редагувати запчастину' : 'Нова запчастина'}
                    </h2>
                    <button type="button" className="modal__close" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="modal__body">
                    <div className="field">
                        <label className="field__label" htmlFor="part-name">Назва</label>
                        <input
                            id="part-name"
                            name="partName"
                            className="field__input"
                            value={form.partName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="field">
                            <label className="field__label" htmlFor="part-mfg">Виробник</label>
                            <input
                                id="part-mfg"
                                name="manufacturer"
                                className="field__input"
                                value={form.manufacturer}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="field">
                            <label className="field__label" htmlFor="part-cost">Ціна (грн)</label>
                            <input
                                id="part-cost"
                                name="cost"
                                type="number"
                                min="0"
                                step="0.01"
                                className="field__input"
                                value={form.cost}
                                onChange={handleChange}
                                required
                            />
                        </div>
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

export default PartModal;
