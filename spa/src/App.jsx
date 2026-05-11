import React from 'react';
import {
    BrowserRouter, Routes, Route, Navigate,
} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import UsersPage from './pages/UsersPage';
import EmployeesPage from './pages/EmployeesPage';
import ClientsPage from './pages/ClientsPage';
import CarsPage from './pages/CarsPage';
import RepairsPage from './pages/RepairsPage';
import PartsPage from './pages/PartsPage';
import CentersPage from './pages/CentersPage';
import './styles/index.css';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    <Route
                        path="/"
                        element={(
                            <PrivateRoute>
                                <Layout />
                            </PrivateRoute>
                        )}
                    >
                        <Route index element={<Navigate to="/repairs" replace />} />
                        <Route path="users" element={<UsersPage />} />
                        <Route path="employees" element={<EmployeesPage />} />
                        <Route path="clients" element={<ClientsPage />} />
                        <Route path="cars" element={<CarsPage />} />
                        <Route path="repairs" element={<RepairsPage />} />
                        <Route path="parts" element={<PartsPage />} />
                        <Route path="centers" element={<CentersPage />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/repairs" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
