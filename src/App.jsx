import React, { lazy, Suspense } from 'react';
import ErrorBoundary from './components/common/ErrorBoundary';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataProvider';
import { ModalProvider } from './contexts/ModalContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Loader } from 'lucide-react';

// Componentes con lazy loading
const MainLayout = lazy(() => import('./components/layout/MainLayout'));
const AuthLayout = lazy(() => import('./components/layout/AuthLayout'));

// Páginas de autenticación
const Login = lazy(() => import('./pages/auth/Login'));

// Páginas principales
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Módulo de clientes
const ClientList = lazy(() => import('./pages/clients/ClientList'));
const EnhancedClientList = lazy(() => import('./pages/clients/EnhancedClientList'));
const ClientDetail = lazy(() => import('./components/clients/ClientDetail'));
const ClientForm = lazy(() => import('./components/clients/ClientForm'));

// Módulo de muestras
const SampleList = lazy(() => import('./pages/samples/SampleList'));
const EnhancedSampleList = lazy(() => import('./pages/samples/EnhancedSampleList'));

// Módulo de usuarios
const EnhancedUsersList = lazy(() => import('./pages/users/EnhancedUsersList'));

// Componente de carga
const LoadingScreen = () => (
  <div className="h-screen w-full flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center">
      <Loader className="animate-spin text-blue-500 mb-3" size={30} />
      <span className="text-gray-700">Cargando...</span>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <DataProvider>
            <ModalProvider>
              <Routes>
              {/* Rutas de autenticación */}
              <Route path="/login" element={
                <Suspense fallback={<LoadingScreen />}>
                  <AuthLayout>
                    <Login />
                  </AuthLayout>
                </Suspense>
              } />
              
              {/* Rutas protegidas */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingScreen />}>
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                  </Suspense>
                </ProtectedRoute>
              } />
              
              {/* Rutas de clientes */}
              <Route path="/clientes" element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingScreen />}>
                    <MainLayout>
                      <EnhancedClientList />
                    </MainLayout>
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/clientes/:id" element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingScreen />}>
                    <MainLayout>
                      <ClientDetail />
                    </MainLayout>
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/clientes/nuevo" element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingScreen />}>
                    <MainLayout>
                      <ClientForm />
                    </MainLayout>
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/clientes/editar/:id" element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingScreen />}>
                    <MainLayout>
                      <ClientForm isEdit={true} />
                    </MainLayout>
                  </Suspense>
                </ProtectedRoute>
              } />
              
              {/* Rutas de muestras */}
              <Route path="/muestras" element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingScreen />}>
                    <MainLayout>
                      <EnhancedSampleList />
                    </MainLayout>
                  </Suspense>
                </ProtectedRoute>
              } />
              
              {/* Rutas de usuarios */}
              <Route path="/usuarios" element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingScreen />}>
                    <MainLayout>
                      <EnhancedUsersList />
                    </MainLayout>
                  </Suspense>
                </ProtectedRoute>
              } />
              
              {/* Ruta por defecto */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ModalProvider>
        </DataProvider>
      </AuthProvider>
    </Router>
    </ErrorBoundary>
  );
}

export default App;