import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Home from './pages/Home';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import PredictionMonitor from './pages/admin/PredictionMonitor';

const ProtectedRoute = ({ children }) => {
    const { token } = useAuth();
    return token ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
    const { token, isAdmin } = useAuth();
    if (!token) return <Navigate to="/login" />;
    if (!isAdmin) return <Navigate to="/dashboard" />;
    return children;
};

const Layout = ({ children }) => {
    const { token } = useAuth();
    return (
        <div className="d-flex flex-column min-vh-100">
            <Navbar />
            <div className="container-fluid">
                <div className="row">
                    {token && (
                        <div className="col-md-2 p-0 bg-dark sidebar-container">
                            <Sidebar />
                        </div>
                    )}
                    <main className={token ? "col-md-10 ms-sm-auto px-4 py-4" : "col-12 px-4 py-4"}>
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
};

function App() {
    return (
        <ToastProvider>
        <AuthProvider>
            <Router>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/history" element={
                            <ProtectedRoute>
                                <History />
                            </ProtectedRoute>
                        } />
                        <Route path="/analytics" element={
                            <ProtectedRoute>
                                <Analytics />
                            </ProtectedRoute>
                        } />
                        <Route path="/profile" element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        } />
                        {/* Admin Routes */}
                        <Route path="/admin" element={
                            <AdminRoute>
                                <AdminDashboard />
                            </AdminRoute>
                        } />
                        <Route path="/admin/users" element={
                            <AdminRoute>
                                <UserManagement />
                            </AdminRoute>
                        } />
                        <Route path="/admin/predictions" element={
                            <AdminRoute>
                                <PredictionMonitor />
                            </AdminRoute>
                        } />
                    </Routes>
                </Layout>
            </Router>
        </AuthProvider>
        </ToastProvider>
    );
}

export default App;
