import React from 'react';
import {
    BrowserRouter, Routes, Route, Navigate,
} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import UsersPage from './pages/UsersPage';
import './styles/index.css';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Публічний маршрут */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* Захищені маршрути */}
                    <Route
                        path="/"
                        element={(
                            <PrivateRoute>
                                <Layout />
                            </PrivateRoute>
                        )}
                    >
                        <Route index element={<Navigate to="/users" replace />} />
                        <Route path="users" element={<UsersPage />} />
                    </Route>

                    {/* Будь-який інший шлях — на users */}
                    <Route path="*" element={<Navigate to="/users" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
