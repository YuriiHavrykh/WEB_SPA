import React, { useState, useEffect } from 'react';

const EMPTY_FORM = {
    username: '',
    email: '',
    password: '',
    role: 'manager',
    isActive: 'true',
};

function UserModal({
    user, onSave, onDelete, onClose, isAdmin, currentUserId,
}) {
    const isEdit = !!user;
    const isSelf = !!user && user.id === currentUserId;
    const isReadOnly = !isAdmin;

    const [form, setForm] = useState(EMPTY_FORM);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setForm({
                username: user.username || '',
                email: user.email || '',
                password: '',
                role: user.role || 'manager',
                isActive: user.isActive ? 'true' : 'false',
            });
        } else {
            setForm(EMPTY_FORM);
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const data = {
                email: form.email,
                role: form.role,
                isActive: form.isActive === 'true',
            };
            if (!isEdit) {
                data.username = form.username;
            }
            if (form.password) {
                data.password = form.password;
            }
            await onSave(data);
            onClose();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Видалити користувача "${user.username}"?`)) return;
        try {
            await onDelete(user.id);
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
                        {isEdit ? 'Користувач' : 'Новий користувач'}
                    </h2>
                    <button type="button" className="modal__close" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="modal__body">
                    <div className="field">
                        <label className="field__label" htmlFor="username">Логін</label>
                        <input
                            id="username"
                            name="username"
                            className="field__input"
                            value={form.username}
                            onChange={handleChange}
                            disabled={isEdit || isReadOnly}
                            required={!isEdit}
                        />
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="field__input"
                            value={form.email}
                            onChange={handleChange}
                            disabled={isReadOnly}
                        />
                    </div>

                    {!isReadOnly && (
                        <div className="field">
                            <label className="field__label" htmlFor="password">
                                {isEdit ? 'Новий пароль (залиш порожнім щоб не змінювати)' : 'Пароль'}
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                className="field__input"
                                value={form.password}
                                onChange={handleChange}
                                required={!isEdit}
                            />
                        </div>
                    )}

                    <div className="field">
                        <label className="field__label" htmlFor="role">Роль</label>
                        <select
                            id="role"
                            name="role"
                            className="field__input"
                            value={form.role}
                            onChange={handleChange}
                            disabled={isSelf || isReadOnly}
                        >
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                        </select>
                        {isSelf && (
                            <p className="field__hint">Не можна змінити власну роль</p>
                        )}
                    </div>

                    {isEdit && (
                        <div className="field">
                            <label className="field__label" htmlFor="isActive">Статус</label>
                            <select
                                id="isActive"
                                name="isActive"
                                className="field__input"
                                value={form.isActive}
                                onChange={handleChange}
                                disabled={isSelf || isReadOnly}
                            >
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                            {isSelf && (
                                <p className="field__hint">Не можна деактивувати власний акаунт</p>
                            )}
                        </div>
                    )}

                    {isReadOnly && (
                        <p className="field__hint field__hint--info">
                            Тільки адміністратор може змінювати дані користувачів
                        </p>
                    )}

                    {error && <p className="form-error">{error}</p>}

                    <div className="modal__actions">
                        {!isReadOnly && (
                            <button type="submit" className="btn btn--primary">
                                {isEdit ? 'Зберегти' : 'Створити'}
                            </button>
                        )}
                        {isEdit && isAdmin && !isSelf && (
                            <button type="button" className="btn btn--danger" onClick={handleDelete}>
                                Видалити
                            </button>
                        )}
                        <button type="button" className="btn btn--outline" onClick={onClose}>
                            {isReadOnly ? 'Закрити' : 'Скасувати'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UserModal;
