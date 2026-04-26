import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="navbar">
            <span className="navbar__logo">AutoService</span>

            <nav className="navbar__nav">
                <NavLink
                    to="/users"
                    className={({ isActive }) => (isActive ? 'nav-link nav-link--active' : 'nav-link')}
                >
                    Користувачі
                </NavLink>
                <a href="/web/html/users.html" className="nav-link">Персонал</a>
                <a href="/web/html/repairs.html" className="nav-link">Ремонти</a>
                <a href="/web/html/parts.html" className="nav-link">Каталог</a>
                <a href="/web/html/centers.html" className="nav-link">СТО</a>
            </nav>

            <div className="navbar__user">
                <span className="navbar__username">{user?.username}</span>
                <span className="navbar__role">{user?.role}</span>
                <button type="button" className="btn btn--outline" onClick={handleLogout}>
                    Вийти
                </button>
            </div>
        </header>
    );
}

export default Navbar;
