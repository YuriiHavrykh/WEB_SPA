import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { centersApi } from '../services/api';

const NAV_LINKS = [
    { to: '/users', label: 'Користувачі', adminOnly: true },
    { to: '/employees', label: 'Персонал' },
    { to: '/clients', label: 'Клієнти' },
    { to: '/cars', label: 'Авто' },
    { to: '/repairs', label: 'Ремонти' },
    { to: '/parts', label: 'Каталог' },
    { to: '/centers', label: 'СТО' },
];

function Navbar() {
    const {
        user, logout, isAdmin, centerId, setCenter, credentials,
    } = useAuth();
    const navigate = useNavigate();
    const [centers, setCenters] = useState([]);

    useEffect(() => {
        if (credentials) {
            centersApi.getAll(credentials, 1)
                .then((d) => setCenters(d.results || d)).catch(() => {});
        }
    }, [credentials]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const activeClass = ({ isActive }) => (isActive ? 'nav-link nav-link--active' : 'nav-link');

    return (
        <header className="navbar">
            <div className="navbar__inner">
                <span className="navbar__logo">
                    Auto
                    <span>Service</span>
                    Manager
                </span>

                <nav className="navbar__nav">
                    {NAV_LINKS.filter((l) => !l.adminOnly || isAdmin).map((l) => (
                        <NavLink key={l.to} to={l.to} className={activeClass}>
                            {l.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="navbar__user">
                    <div className="center-selector">
                        <label className="center-selector__label" htmlFor="nav-center">
                            СТО:
                        </label>
                        <select
                            id="nav-center"
                            className="center-selector__select"
                            value={centerId || ''}
                            onChange={(e) => setCenter(Number(e.target.value) || null)}
                        >
                            <option value="">Всі</option>
                            {centers.map((c) => (
                                <option key={c.idServiceCenter} value={c.idServiceCenter}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <span className="navbar__username">{user?.username}</span>
                    <span className="navbar__role">{user?.role}</span>
                    <button type="button" className="btn btn--logout" onClick={handleLogout}>
                        Вийти
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Navbar;
