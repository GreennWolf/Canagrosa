import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import clientesService from '../services/clientesService';
import muestrasService from '../services/muestrasService';
import { 
  Beaker, 
  Users, 
  Briefcase, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import ThemeConstants from '../constants/ThemeConstants';

const DashboardCard = ({ title, value, icon, color, onClick }) => {
  return (
    <div 
      className={`${ThemeConstants.bgColors.card} ${ThemeConstants.rounded.lg} ${ThemeConstants.shadows.md} p-6 hover:${ThemeConstants.shadows.lg} ${ThemeConstants.transitions.default} ${onClick ? 'cursor-pointer' : ''} ${ThemeConstants.borders.card}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`${ThemeConstants.text.sm} ${ThemeConstants.textColors.light} mb-1`}>{title}</p>
          <h3 className={`text-2xl font-bold ${ThemeConstants.textColors.primary}`}>{value}</h3>
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          {React.cloneElement(icon, { className: `text-${color}-600`, size: 24 })}
        </div>
      </div>
    </div>
  );
};

const RecentActivityItem = ({ title, description, time, type }) => {
  const getIcon = () => {
    switch (type) {
      case 'sample':
        return <Beaker size={16} className="text-blue-600" />;
      case 'client':
        return <Briefcase size={16} className="text-green-600" />;
      case 'user':
        return <Users size={16} className="text-purple-600" />;
      default:
        return <Clock size={16} className="text-slate-600" />;
    }
  };

  return (
    <div className="flex items-start space-x-3 py-3 border-b border-slate-200 last:border-0">
      <div className="mt-1">{getIcon()}</div>
      <div>
        <h4 className={`${ThemeConstants.text.sm} font-medium ${ThemeConstants.textColors.primary}`}>{title}</h4>
        <p className={`${ThemeConstants.text.xs} ${ThemeConstants.textColors.secondary} mt-1`}>{description}</p>
        <p className={`${ThemeConstants.text.xs} ${ThemeConstants.textColors.light} mt-1`}>{time}</p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalClients: 0,
    totalSamples: 0,
    pendingSamples: 0,
    urgentSamples: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // En una aplicación real, tendrías un endpoint de dashboard
        // Aquí simulamos llamando a múltiples endpoints

        // Obtener total de clientes
        const clientes = await clientesService.obtenerTodos();
        
        // Obtener muestras
        const muestras = await muestrasService.obtenerTodas();
        
        // Calcular estadísticas basadas en las respuestas
        const muestrasUrgentes = muestras.filter(muestra => muestra.URGENTE === 1);
        
        // Simular muestras pendientes (esto sería determinado por la lógica de negocio)
        // En una app real, podrías tener un campo de estado u otra forma de determinar esto
        const muestrasPendientes = muestras.slice(0, Math.floor(muestras.length * 0.3));
        
        setStats({
          totalClients: clientes.length,
          totalSamples: muestras.length,
          pendingSamples: muestrasPendientes.length,
          urgentSamples: muestrasUrgentes.length
        });
        
        // Crear actividad reciente simulada
        // En una app real, podrías tener un registro de actividad o tabla de auditoría
        const actividadRecienteMock = [
          {
            id: 1,
            title: 'Nueva muestra registrada',
            description: 'Se ha registrado una nueva muestra para Cliente XYZ',
            time: '10 minutos atrás',
            type: 'sample'
          },
          {
            id: 2,
            title: 'Cliente actualizado',
            description: 'Se actualizaron los datos del cliente ABC Corp',
            time: '2 horas atrás',
            type: 'client'
          },
          {
            id: 3,
            title: 'Muestra marcada como urgente',
            description: 'La muestra #12345 ha sido marcada como urgente',
            time: '3 horas atrás',
            type: 'sample'
          },
          {
            id: 4,
            title: 'Nuevo usuario',
            description: 'Se ha creado la cuenta de usuario para Juan Pérez',
            time: '1 día atrás',
            type: 'user'
          },
          {
            id: 5,
            title: 'Resultados disponibles',
            description: 'Los resultados de la muestra #54321 están listos',
            time: '1 día atrás',
            type: 'sample'
          }
        ];
        
        setRecentActivity(actividadRecienteMock);
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
        setError('No se pudo cargar los datos del dashboard. Por favor, intente de nuevo más tarde.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className={`${ThemeConstants.states.error} p-4 ${ThemeConstants.rounded.md} ${ThemeConstants.borders.default} max-w-lg`}>
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${ThemeConstants.textColors.primary}`}>Panel de Control</h2>
        <div className={`flex items-center space-x-2 ${ThemeConstants.text.sm} ${ThemeConstants.textColors.secondary}`}>
          <Calendar size={16} />
          <span>{new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="Clientes Totales" 
          value={stats.totalClients} 
          icon={<Briefcase />} 
          color="blue"
          onClick={() => navigate('/clientes')}
        />
        <DashboardCard 
          title="Muestras Totales" 
          value={stats.totalSamples} 
          icon={<Beaker />} 
          color="green"
          onClick={() => navigate('/muestras')}
        />
        <DashboardCard 
          title="Muestras Pendientes" 
          value={stats.pendingSamples} 
          icon={<Clock />} 
          color="yellow"
          onClick={() => navigate('/muestras')}
        />
        <DashboardCard 
          title="Muestras Urgentes" 
          value={stats.urgentSamples} 
          icon={<AlertTriangle />} 
          color="red"
          onClick={() => navigate('/muestras')}
        />
      </div>
      
      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className={`lg:col-span-1 ${ThemeConstants.bgColors.card} ${ThemeConstants.rounded.lg} ${ThemeConstants.shadows.md} p-6 ${ThemeConstants.borders.card}`}>
          <h3 className={`text-lg font-medium mb-4 ${ThemeConstants.textColors.primary}`}>Acciones Rápidas</h3>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/clientes/nuevo')}
              className={`w-full flex items-center justify-between p-3 ${ThemeConstants.rounded.md} hover:bg-slate-100 ${ThemeConstants.borders.default}`}
            >
              <span className={`font-medium ${ThemeConstants.textColors.primary}`}>Nuevo Cliente</span>
              <Briefcase size={18} className="text-blue-600" />
            </button>
            <button 
              onClick={() => navigate('/muestras/nueva')}
              className={`w-full flex items-center justify-between p-3 ${ThemeConstants.rounded.md} hover:bg-slate-100 ${ThemeConstants.borders.default}`}
            >
              <span className={`font-medium ${ThemeConstants.textColors.primary}`}>Nueva Muestra</span>
              <Beaker size={18} className="text-green-600" />
            </button>
            <button 
              className={`w-full flex items-center justify-between p-3 ${ThemeConstants.rounded.md} hover:bg-slate-100 ${ThemeConstants.borders.default}`}
            >
              <span className={`font-medium ${ThemeConstants.textColors.primary}`}>Generar Informes</span>
              <TrendingUp size={18} className="text-purple-600" />
            </button>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className={`lg:col-span-2 ${ThemeConstants.bgColors.card} ${ThemeConstants.rounded.lg} ${ThemeConstants.shadows.md} p-6 ${ThemeConstants.borders.card}`}>
          <h3 className={`text-lg font-medium mb-4 ${ThemeConstants.textColors.primary}`}>Actividad Reciente</h3>
          {recentActivity.length > 0 ? (
            <div className="overflow-hidden">
              {recentActivity.map((activity) => (
                <RecentActivityItem 
                  key={activity.id}
                  title={activity.title}
                  description={activity.description}
                  time={activity.time}
                  type={activity.type}
                />
              ))}
            </div>
          ) : (
            <p className={`${ThemeConstants.textColors.secondary} text-center py-4`}>No hay actividad reciente</p>
          )}
        </div>
      </div>
      
      {/* Status Overview */}
      <div className={`${ThemeConstants.bgColors.card} ${ThemeConstants.rounded.lg} ${ThemeConstants.shadows.md} p-6 ${ThemeConstants.borders.card}`}>
        <h3 className={`text-lg font-medium mb-4 ${ThemeConstants.textColors.primary}`}>Estado del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`flex items-center space-x-3 p-4 ${ThemeConstants.states.success} ${ThemeConstants.rounded.md}`}>
            <CheckCircle className="text-green-600" size={24} />
            <div>
              <h4 className={`font-medium ${ThemeConstants.textColors.primary}`}>API</h4>
              <p className={`${ThemeConstants.text.sm} ${ThemeConstants.textColors.secondary}`}>Funcionando correctamente</p>
            </div>
          </div>
          <div className={`flex items-center space-x-3 p-4 ${ThemeConstants.states.success} ${ThemeConstants.rounded.md}`}>
            <CheckCircle className="text-green-600" size={24} />
            <div>
              <h4 className={`font-medium ${ThemeConstants.textColors.primary}`}>Base de Datos</h4>
              <p className={`${ThemeConstants.text.sm} ${ThemeConstants.textColors.secondary}`}>Conectada y operativa</p>
            </div>
          </div>
          <div className={`flex items-center space-x-3 p-4 ${ThemeConstants.states.success} ${ThemeConstants.rounded.md}`}>
            <CheckCircle className="text-green-600" size={24} />
            <div>
              <h4 className={`font-medium ${ThemeConstants.textColors.primary}`}>Servicios</h4>
              <p className={`${ThemeConstants.text.sm} ${ThemeConstants.textColors.secondary}`}>Todos los servicios activos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;