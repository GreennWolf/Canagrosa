import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataProvider';
import { ModalProvider } from './contexts/ModalContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Páginas de autenticación
import Login from './pages/auth/Login';

// Páginas principales
import Dashboard from './pages/Dashboard';

// Módulo de clientes
import ClientList from './pages/clients/ClientList';
import ClientDetail from './components/clients/ClientDetail';
import ClientForm from './components/clients/ClientForm';

// Módulo de muestras
import SampleList from './pages/samples/SampleList';
import SampleForm from './pages/samples/SampleForm';

// Módulo de usuarios
import UsersList from './pages/users/UsersList';

function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <ModalProvider>
            <Routes>
              {/* Rutas de autenticación */}
              <Route path="/login" element={
                <AuthLayout>
                  <Login />
                </AuthLayout>
              } />
              
              {/* Rutas protegidas */}
              <Route path="/" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
              
              {/* Rutas de clientes */}
              <Route path="/clientes" element={<ProtectedRoute><MainLayout><ClientList /></MainLayout></ProtectedRoute>} />
              <Route path="/clientes/:id" element={<ProtectedRoute><MainLayout><ClientDetail /></MainLayout></ProtectedRoute>} />
              <Route path="/clientes/nuevo" element={<ProtectedRoute><MainLayout><ClientForm /></MainLayout></ProtectedRoute>} />
              <Route path="/clientes/editar/:id" element={<ProtectedRoute><MainLayout><ClientForm isEdit={true} /></MainLayout></ProtectedRoute>} />
              
              {/* Rutas de muestras */}
              <Route path="/muestras" element={<ProtectedRoute><MainLayout><SampleList /></MainLayout></ProtectedRoute>} />
              <Route path="/muestras/nueva" element={<ProtectedRoute><MainLayout><SampleForm /></MainLayout></ProtectedRoute>} />
              
              {/* Rutas de usuarios */}
              <Route path="/usuarios" element={<ProtectedRoute><MainLayout><UsersList /></MainLayout></ProtectedRoute>} />
              
              {/* Ruta por defecto */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ModalProvider>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;