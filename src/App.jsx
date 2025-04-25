import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';

// App Pages
import Dashboard from './pages/Dashboard';
import ClientList from './pages/clients/ClientList';
import ClientDetail from './pages/clients/ClientDetail';
import ClientForm from './pages/clients/ClientForm';
import SampleList from './pages/samples/SampleList';
import SampleForm from './pages/samples/SampleForm';
import UsersList from './pages/users/UsersList';

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import DataProvider from './contexts/DataProvider';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : 
        <AuthLayout>
          <Login />
        </AuthLayout>
      } />
      
      {/* App Routes - All Protected */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* Client Routes */}
      <Route path="/clientes" element={
        <ProtectedRoute>
          <MainLayout>
            <ClientList />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/clientes/nuevo" element={
        <ProtectedRoute>
          <MainLayout>
            <ClientForm isEdit={false} />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/clientes/editar/:id" element={
        <ProtectedRoute>
          <MainLayout>
            <ClientForm isEdit={true} />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/clientes/:id" element={
        <ProtectedRoute>
          <MainLayout>
            <ClientDetail />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* Sample Routes */}
      <Route path="/muestras" element={
        <ProtectedRoute>
          <MainLayout>
            <SampleList />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/muestras/nueva" element={
        <ProtectedRoute>
          <MainLayout>
            <SampleForm />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* Users Routes */}
      <Route path="/usuarios" element={
        <ProtectedRoute>
          <MainLayout>
            <UsersList />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* 404 Route */}
      <Route path="*" element={
        <ProtectedRoute>
          <MainLayout>
            <div className="flex flex-col items-center justify-center h-full">
              <h1 className="text-4xl font-bold text-gray-800">404</h1>
              <p className="text-gray-600">Página no encontrada</p>
            </div>
          </MainLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <AppRoutes />
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;