import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { checkCredentials } from '../services/api';

function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Реальний запит до Django — повертає дані поточного юзера
            const me = await checkCredentials({ username, password });

            // Зберігаємо всі дані включно з паролем для Basic Auth
            login({
                id: me.id,
                username: me.username,
                email: me.email,
                role: me.role,
                password,
            });
            navigate('/users');
        } catch {
            setError('Невірний логін або пароль');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h1 className="login-card__title">AutoService</h1>
                <p className="login-card__subtitle">Система управління</p>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="field">
                        <label className="field__label" htmlFor="username">Логін</label>
                        <input
                            id="username"
                            className="field__input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="password">Пароль</label>
                        <input
                            id="password"
                            type="password"
                            className="field__input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {error && <p className="form-error">{error}</p>}

                    <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
                        {loading ? 'Перевірка...' : 'Увійти'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;
