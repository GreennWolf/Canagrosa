import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../services/dashboardService';
import { 
  Beaker, Users, Briefcase, Clock, AlertTriangle, TrendingUp, Calendar,
  CheckCircle, AlertCircle, Plus, BarChart3, Activity, RefreshCw, Eye,
  ArrowUp, ArrowDown, Minus, TestTube, Building, Search
} from 'lucide-react';

// Componente para métricas principales
const MetricCard = ({ title, value, icon, color, trend, onClick, loading }) => {
  const getTrendIcon = () => {
    if (!trend || trend === 0) return <Minus size={14} className="text-gray-500" />;
    return trend > 0 ? <ArrowUp size={14} className="text-green-500" /> : <ArrowDown size={14} className="text-red-500" />;
  };

  const getTrendColor = () => {
    if (!trend || trend === 0) return 'text-gray-500';
    return trend > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer hover:border-blue-300' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-2">{title}</p>
          {loading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
          ) : (
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{value.toLocaleString()}</h3>
          )}
          {trend !== undefined && !loading && (
            <div className="flex items-center space-x-1">
              {getTrendIcon()}
              <span className={`text-sm font-medium ${getTrendColor()}`}>
                {Math.abs(trend)}%
              </span>
              <span className="text-xs text-gray-500">vs mes anterior</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-${color}-50`}>
          {React.cloneElement(icon, { className: `text-${color}-600`, size: 24 })}
        </div>
      </div>
    </div>
  );
};

// Componente para gráfico de barras simple
const SimpleBarChart = ({ data, height = 120 }) => {
  const maxValue = Math.max(...data.map(d => d.cantidad));
  
  return (
    <div className="flex items-end justify-between space-x-2" style={{ height }}>
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center flex-1">
          <div 
            className="w-full bg-blue-500 rounded-t-md min-h-[4px] transition-all duration-300 hover:bg-blue-600"
            style={{ height: `${(item.cantidad / maxValue) * (height - 30)}px` }}
            title={`${item.dia}: ${item.cantidad} muestras`}
          />
          <span className="text-xs text-gray-600 mt-2">{item.dia}</span>
        </div>
      ))}
    </div>
  );
};

// Componente para gráfico circular simple
const SimplePieChart = ({ data, size = 120 }) => {
  const total = data.reduce((sum, item) => sum + item.cantidad, 0);
  let cumulativePercentage = 0;
  
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  
  return (
    <div className="flex items-center space-x-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={(size - 8) / 2}
            fill="none"
            stroke="#F3F4F6"
            strokeWidth="8"
          />
          {data.map((item, index) => {
            const percentage = (item.cantidad / total) * 100;
            const strokeDasharray = `${percentage} ${100 - percentage}`;
            const strokeDashoffset = -cumulativePercentage;
            cumulativePercentage += percentage;
            
            return (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={(size - 8) / 2}
                fill="none"
                stroke={colors[index % colors.length]}
                strokeWidth="8"
                strokeDasharray={`${Math.PI * (size - 8)} ${Math.PI * (size - 8)}`}
                strokeDashoffset={`${Math.PI * (size - 8) * (1 - percentage / 100 - cumulativePercentage / 100 + percentage / 100)}`}
                className="transition-all duration-300"
              />
            );
          })}
        </svg>
      </div>
      <div className="flex-1">
        {data.slice(0, 4).map((item, index) => (
          <div key={index} className="flex items-center justify-between py-1">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-sm text-gray-700 truncate">{item.nombre}</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{item.cantidad}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente para actividad reciente
const ActivityItem = ({ item }) => {
  const getIcon = () => {
    switch (item.tipo) {
      case 'recepcion':
        return <TestTube size={16} className="text-blue-600" />;
      case 'resultado':
        return <CheckCircle size={16} className="text-green-600" />;
      default:
        return <Activity size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className="flex items-start space-x-3 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded-lg px-2 transition-colors">
      <div className="mt-1 p-1 rounded-full bg-gray-100">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900 truncate">{item.referencia}</p>
          {item.urgente && (
            <span className="flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
              <AlertTriangle size={10} className="mr-1" />
              Urgente
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 truncate">{item.cliente}</p>
        <p className="text-xs text-gray-500">
          {new Date(item.fecha).toLocaleDateString('es-ES')}
        </p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metricas, setMetricas] = useState({});
  const [distribucionAnalisis, setDistribucionAnalisis] = useState([]);
  const [topClientes, setTopClientes] = useState([]);
  const [tendenciaSemanal, setTendenciaSemanal] = useState([]);
  const [actividadReciente, setActividadReciente] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [
        metricasData,
        distribucionData,
        topClientesData,
        tendenciaData,
        actividadData
      ] = await Promise.all([
        dashboardService.obtenerMetricasPrincipales(),
        dashboardService.obtenerDistribucionAnalisis(),
        dashboardService.obtenerTopClientes(),
        dashboardService.obtenerTendenciaSemanal(),
        dashboardService.obtenerActividadReciente()
      ]);

      setMetricas(metricasData);
      setDistribucionAnalisis(distribucionData);
      setTopClientes(topClientesData);
      setTendenciaSemanal(tendenciaData);
      setActividadReciente(actividadData);
      setLastUpdated(new Date());
      
    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err);
      setError('No se pudieron cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
            <div>
              <h3 className="text-red-800 font-medium">Error al cargar el dashboard</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button 
                onClick={cargarDatos}
                className="mt-3 text-sm text-red-800 hover:text-red-900 font-medium"
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Panel de control del laboratorio - {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Actualizado: {lastUpdated.toLocaleTimeString('es-ES')}
            </span>
          )}
          <button
            onClick={cargarDatos}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Muestras"
          value={metricas.totalMuestras || 0}
          icon={<Beaker />}
          color="blue"
          onClick={() => navigate('/muestras')}
          loading={loading}
        />
        <MetricCard
          title="Este Mes"
          value={metricas.muestrasEstesMes || 0}
          icon={<Calendar />}
          color="green"
          trend={metricas.tendenciaMensual}
          onClick={() => navigate('/muestras')}
          loading={loading}
        />
        <MetricCard
          title="Urgentes"
          value={metricas.muestrasUrgentes || 0}
          icon={<AlertTriangle />}
          color="red"
          onClick={() => navigate('/muestras')}
          loading={loading}
        />
        <MetricCard
          title="Clientes Activos"
          value={metricas.totalClientes || 0}
          icon={<Building />}
          color="purple"
          onClick={() => navigate('/clientes')}
          loading={loading}
        />
      </div>

      {/* Sección principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tendencia semanal */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Actividad Semanal</h3>
            <BarChart3 size={20} className="text-gray-500" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <SimpleBarChart data={tendenciaSemanal} />
          )}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Muestras recibidas en los últimos 7 días
            </p>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Acciones Rápidas</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/muestras?modal=nueva')}
              className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500 rounded-lg group-hover:bg-blue-600 transition-colors">
                  <Plus size={16} className="text-white" />
                </div>
                <span className="font-medium text-gray-900">Nueva Muestra</span>
              </div>
              <TestTube size={16} className="text-blue-600" />
            </button>
            
            <button
              onClick={() => navigate('/clientes?modal=nuevo')}
              className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500 rounded-lg group-hover:bg-green-600 transition-colors">
                  <Plus size={16} className="text-white" />
                </div>
                <span className="font-medium text-gray-900">Nuevo Cliente</span>
              </div>
              <Building size={16} className="text-green-600" />
            </button>
            
            <button
              onClick={() => navigate('/muestras')}
              className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500 rounded-lg group-hover:bg-purple-600 transition-colors">
                  <Search size={16} className="text-white" />
                </div>
                <span className="font-medium text-gray-900">Buscar Muestras</span>
              </div>
              <Eye size={16} className="text-purple-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Sección inferior */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribución por análisis */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Tipos de Análisis</h3>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <SimplePieChart data={distribucionAnalisis} />
          )}
        </div>

        {/* Top clientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Clientes</h3>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {topClientes.map((cliente, index) => (
                <div key={cliente.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 truncate">{cliente.nombre}</span>
                  </div>
                  <span className="text-sm text-gray-600">{cliente.cantidad}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actividad reciente */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Actividad Reciente</h3>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : actividadReciente.length > 0 ? (
            <div className="space-y-2">
              {actividadReciente.map((item) => (
                <ActivityItem key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay actividad reciente</p>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;