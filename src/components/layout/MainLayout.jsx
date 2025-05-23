import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  Beaker, 
  Briefcase, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown,
  Bell, 
  User,
  FileText,
  Wrench,
  FlaskConical,
  ArrowLeftToLine,
  ArrowRightToLine,
} from 'lucide-react';
import ThemeConstants from '../../constants/ThemeConstants';
// Importaremos el logo condicionalmente para evitar errores
const logoPath = '/logoC.jpg';

const LAYOUT_TYPE_KEY = 'canagrosa-layout-type';

const MainLayout = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estado para controlar si se muestra como sidebar o header
  const [isHeaderMode, setIsHeaderMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Estado para el menú desplegable activo (solo uno a la vez)
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Carga la preferencia de diseño al inicio
  useEffect(() => {
    const savedLayoutType = localStorage.getItem(LAYOUT_TYPE_KEY);
    if (savedLayoutType) {
      setIsHeaderMode(savedLayoutType === 'header');
    }
  }, []);

  // Detectar tamaño de pantalla para responsive
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // En móvil, forzar modo header y cerrar sidebar
      if (mobile) {
        setIsHeaderMode(true);
        setSidebarOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    // Detectar tamaño inicial
    handleResize();
    
    // Escuchar cambios de tamaño
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cierra los menús desplegables al cambiar de ruta y actualiza el título
  useEffect(() => {
    setActiveDropdown(null);
    
    // Actualizar título de la página según la ruta
    const { section, subsection } = getSectionInfo();
    const pageTitle = subsection ? `${subsection} - Canagrosa` : `${section} - Canagrosa`;
    document.title = pageTitle;
  }, [location.pathname]);

  // Guarda la preferencia de diseño cuando cambia
  const toggleLayoutMode = () => {
    const newMode = !isHeaderMode;
    setIsHeaderMode(newMode);
    localStorage.setItem(LAYOUT_TYPE_KEY, newMode ? 'header' : 'sidebar');
    
    // Si cambiamos a modo header, aseguramos que la barra lateral esté cerrada
    if (newMode) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Función modificada para permitir solo un menú abierto a la vez
  const toggleDropdown = (menuId) => {
    if (activeDropdown === menuId) {
      setActiveDropdown(null); // Cerrar el menú activo si ya está abierto
    } else {
      setActiveDropdown(menuId); // Abrir el nuevo menú y cerrar el anterior
    }
  };

  // Estructura de navegación simplificada
  // Función para obtener la información de sección y subsección
  const getSectionInfo = () => {
    const path = location.pathname;
    
    // Dashboard
    if (path === '/') {
      return { section: 'Dashboard', subsection: null };
    }
    
    // Sección Mantenimiento
    if (path.includes('/clientes')) {
      return { section: 'Mantenimiento', subsection: 'Clientes' };
    }
    
    if (path.includes('/usuarios')) {
      return { section: 'Mantenimiento', subsection: 'Usuarios' };
    }
    
    // Sección Laboratorio
    if (path.includes('/muestras')) {
      return { section: 'Laboratorio', subsection: 'Muestras' };
    }
    
    // Rutas de autenticación
    if (path.includes('/login')) {
      return { section: 'Autenticación', subsection: 'Iniciar Sesión' };
    }
    
    // Fallback para rutas no definidas
    return { section: 'Aplicación', subsection: null };
  };

  const navStructure = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <FileText size={20} />,
      path: '/',
      active: location.pathname === '/'
    },
    {
      id: 'maintenance',
      label: 'Mantenimiento',
      icon: <Wrench size={20} />,
      hasSubmenu: true,
      active: location.pathname.includes('/clientes') || location.pathname.includes('/usuarios'),
      submenuOpen: activeDropdown === 'maintenance',
      onClick: () => toggleDropdown('maintenance'),
      submenu: [
        {
          id: 'clients',
          label: 'Clientes',
          icon: <Briefcase size={18} />,
          path: '/clientes',
          active: location.pathname === '/clientes'
        },
        {
          id: 'users',
          label: 'Usuarios',
          icon: <Users size={18} />,
          path: '/usuarios',
          active: location.pathname === '/usuarios'
        }
      ]
    },
    {
      id: 'laboratory',
      label: 'Laboratorio',
      icon: <FlaskConical size={20} />,
      hasSubmenu: true,
      active: location.pathname.includes('/muestras'),
      submenuOpen: activeDropdown === 'laboratory',
      onClick: () => toggleDropdown('laboratory'),
      submenu: [
        {
          id: 'samples',
          label: 'Muestras',
          icon: <Beaker size={18} />,
          path: '/muestras',
          active: location.pathname === '/muestras'
        }
      ]
    }
  ];

  // Renderizado del layout según el modo (sidebar o header)
  if (isHeaderMode) {
    return (
      <div className={`flex flex-col h-screen ${ThemeConstants.bgColors.page}`}>
        {/* Header Navigation */}
        <header className={`${ThemeConstants.bgColors.header} ${ThemeConstants.shadows.sm} sticky top-0 z-40`}>
          <div className="flex justify-between items-center h-16 px-2 sm:px-4">
            {/* Logo */}
            <div className='h-full bg-white flex items-center justify-center'>
              <img src={logoPath} alt="CANAGROSA Logo" className="h-6 sm:h-8 mx-2 sm:mx-5" />
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:block">
              <ul className="flex space-x-1">
                {navStructure.map(item => (
                  <li key={item.id} className="relative group">
                    <button
                      onClick={item.path ? () => navigate(item.path) : item.onClick}
                      className={`flex items-center px-2 xl:px-3 py-2 text-sm ${ThemeConstants.rounded.md} ${
                        item.active ? 'bg-blue-700' : 'hover:bg-slate-700'
                      }`}
                    >
                      <span className="mr-1 xl:mr-2">{item.icon}</span>
                      <span className="hidden xl:inline">{item.label}</span>
                      {item.hasSubmenu && (
                        <ChevronDown 
                          size={14} 
                          className={`ml-1 ${ThemeConstants.transitions.default} ${
                            item.submenuOpen ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </button>

                    {/* Dropdown for top-level menu items */}
                    {item.hasSubmenu && item.submenuOpen && (
                      <div className={`absolute left-0 mt-1 w-48 ${ThemeConstants.bgColors.sidebar} ${ThemeConstants.rounded.md} ${ThemeConstants.shadows.lg} z-50 py-1`}>
                        {item.submenu.map(subItem => (
                          <button
                            key={subItem.id}
                            onClick={() => navigate(subItem.path)}
                            className={`flex items-center w-full px-4 py-2 text-left text-sm ${
                              subItem.active ? 'bg-slate-700' : 'hover:bg-slate-700'
                            }`}
                          >
                            <span className="mr-2">{subItem.icon}</span>
                            <span>{subItem.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Mobile menu button */}
            <button 
              className="lg:hidden p-2 rounded-md text-slate-200 hover:bg-slate-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu size={20} />
            </button>
            
            {/* User Section - Right Side */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Layout Toggle - Desktop Only */}
              {!isMobile && (
                <button 
                  onClick={toggleLayoutMode}
                  className={`hidden sm:block p-2 ${ThemeConstants.rounded.full} hover:bg-slate-600 text-slate-200`}
                  title="Cambiar a modo barra lateral"
                >
                  <ArrowLeftToLine size={20} />
                </button>
              )}
              
              {/* Notifications - Hidden on mobile */}
              <button className={`hidden sm:block p-2 ${ThemeConstants.rounded.full} hover:bg-slate-600 text-slate-200`}>
                <Bell size={20} />
              </button>
              
              {/* User Menu */}
              <div className="relative">
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)} 
                  className="flex items-center space-x-1 sm:space-x-3 focus:outline-none text-slate-200"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    <User size={16} className="sm:w-4 sm:h-4" />
                  </div>
                  <span className="font-medium hidden sm:inline text-sm">{currentUser?.USUARIO || 'Usuario'}</span>
                  <ChevronDown size={14} className="text-slate-300" />
                </button>
                
                {userMenuOpen && (
                  <div className={`absolute right-0 mt-2 w-48 ${ThemeConstants.bgColors.card} ${ThemeConstants.rounded.md} ${ThemeConstants.shadows.lg} py-1 z-50 ${ThemeConstants.borders.card}`}>
                    <button className={`block w-full text-left px-4 py-2 text-sm ${ThemeConstants.textColors.primary} hover:bg-slate-100`}>
                      Perfil
                    </button>
                    <button className={`block w-full text-left px-4 py-2 text-sm ${ThemeConstants.textColors.primary} hover:bg-slate-100`}>
                      Configuración
                    </button>
                    <div className="border-t border-slate-200"></div>
                    <button 
                      onClick={handleLogout}
                      className={`block w-full text-left px-4 py-2 text-sm ${ThemeConstants.textColors.primary} hover:bg-slate-100`}
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className={`lg:hidden ${ThemeConstants.bgColors.sidebar} border-t border-slate-600 py-2`}>
              <nav className="px-4">
                {navStructure.map(item => (
                  <div key={item.id} className="mb-2">
                    {item.hasSubmenu ? (
                      <>
                        <button
                          onClick={item.onClick}
                          className={`flex items-center justify-between w-full p-3 text-sm ${ThemeConstants.rounded.md} ${
                            item.active ? 'bg-blue-700' : 'hover:bg-slate-700'
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="mr-3">{item.icon}</span>
                            <span>{item.label}</span>
                          </div>
                          <ChevronDown 
                            size={16} 
                            className={`${ThemeConstants.transitions.default} ${
                              item.submenuOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        
                        {item.submenuOpen && (
                          <div className="pl-6 mt-1 space-y-1">
                            {item.submenu.map(subItem => (
                              <button
                                key={subItem.id}
                                onClick={() => {
                                  navigate(subItem.path);
                                  setIsMobileMenuOpen(false);
                                }}
                                className={`flex items-center w-full p-2 text-sm ${ThemeConstants.rounded.md} ${
                                  subItem.active ? 'bg-slate-700' : 'hover:bg-slate-700'
                                }`}
                              >
                                <span className="mr-3">{subItem.icon}</span>
                                <span>{subItem.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          navigate(item.path);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`flex items-center w-full p-3 text-sm ${ThemeConstants.rounded.md} ${
                          item.active ? 'bg-blue-700' : 'hover:bg-slate-700'
                        }`}
                      >
                        <span className="mr-3">{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          )}
        </header>
        
        {/* Page Content */}
        <main className={`flex-1 overflow-hidden p-2 sm:p-4 lg:p-6 ${ThemeConstants.textColors.primary}`}
              style={{ height: isMobileMenuOpen ? 'calc(100vh - 240px)' : 'calc(100vh - 64px)' }}>
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${ThemeConstants.bgColors.page}`}>
      {/* Overlay para móvil cuando sidebar está abierto */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`${ThemeConstants.bgColors.sidebar} ${ThemeConstants.textColors.sidebar} fixed h-full z-40 ${ThemeConstants.transitions.default} ${
          sidebarOpen ? (isMobile ? 'w-64' : 'w-64') : (isMobile ? '-translate-x-full w-64' : 'w-20')
        }`}
      >
        <div className="flex items-center justify-between p-3.5 bg-white border-b border-white-700">
          <div className={`${sidebarOpen ? 'block' : 'hidden'}`}>
            <img src={logoPath} alt="CANAGROSA Logo" className="h-8" />
          </div>
          <div className="flex items-center">
        {sidebarOpen && (
                      <button 
              onClick={toggleLayoutMode}
              className={`p-1 mr-2 ${ThemeConstants.rounded.md}  text-slate-700 cursor-pointer hover:text-slate-500 focus:outline-none`}
              title="Cambiar a modo cabecera"
            >
              <ArrowRightToLine size={20} />
            </button>
        )}
            <button 
              onClick={toggleSidebar}
              className={`p-1 ${ThemeConstants.rounded.md} text-slate-700  cursor-pointer hover:text-slate-500 focus:outline-none`}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        
        <nav className="mt-6">
          <ul className="px-2">
            {/* Dashboard item */}
            {navStructure.map(item => (
              <li key={item.id} className="mb-2">
                {item.hasSubmenu ? (
                  <>
                    <button
                      onClick={item.onClick}
                      className={`flex items-center justify-between w-full p-3 ${ThemeConstants.rounded.md} ${
                        item.active ? 'bg-blue-700' : 'hover:bg-slate-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="mr-3">{item.icon}</span>
                        {sidebarOpen && <span>{item.label}</span>}
                      </div>
                      {sidebarOpen && (
                        <ChevronDown 
                          size={16} 
                          className={`${ThemeConstants.transitions.default} ${
                            item.submenuOpen ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </button>
                    
                    {item.submenuOpen && sidebarOpen && (
                      <ul className="pl-6 mt-1 space-y-1">
                        {item.submenu.map(subItem => (
                          <li key={subItem.id}>
                            <button
                              onClick={() => navigate(subItem.path)}
                              className={`flex items-center w-full p-2 ${ThemeConstants.rounded.md} ${
                                subItem.active ? 'bg-slate-700' : 'hover:bg-slate-700'
                              }`}
                            >
                              <span className="mr-3">{subItem.icon}</span>
                              <span>{subItem.label}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => navigate(item.path)}
                    className={`flex items-center w-full p-3 ${ThemeConstants.rounded.md} ${
                      item.active ? 'bg-blue-700' : 'hover:bg-slate-700'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {sidebarOpen && <span>{item.label}</span>}
                  </button>
                )}
              </li>
            ))}
            
            <li className="mt-8">
              <button
                onClick={handleLogout}
                className={`flex items-center w-full p-3 ${ThemeConstants.rounded.md} hover:bg-slate-700`}
              >
                <span className="mr-3"><LogOut size={20} /></span>
                {sidebarOpen && <span>Cerrar Sesión</span>}
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${ThemeConstants.transitions.default} ${
        isMobile ? 'ml-0' : (sidebarOpen ? 'ml-64' : 'ml-20')
      }`}>
        {/* Top Navigation Bar */}
        <header className={`${ThemeConstants.bgColors.header} ${ThemeConstants.shadows.sm} sticky top-0 z-30`}>
          <div className="flex justify-between items-center px-3 sm:px-6 py-3">
            <h1 className={`text-lg sm:text-xl font-semibold ${ThemeConstants.textColors.header} truncate`}>
              {(() => {
                const { section, subsection } = getSectionInfo();
                return subsection ? `${section} : ${subsection}` : section;
              })()}
            </h1>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Notifications - Hidden on mobile */}
              <button className={`hidden sm:block p-2 ${ThemeConstants.rounded.full} hover:bg-slate-600`}>
                <Bell size={20} className="text-slate-200" />
              </button>
              
              {/* User Menu */}
              <div className="relative">
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)} 
                  className="flex items-center space-x-1 sm:space-x-3 focus:outline-none text-slate-200"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    <User size={16} className="sm:w-4 sm:h-4" />
                  </div>
                  <span className="font-medium hidden sm:inline text-sm">{currentUser?.USUARIO || 'Usuario'}</span>
                  <ChevronDown size={14} className="text-slate-300" />
                </button>
                
                {userMenuOpen && (
                  <div className={`absolute right-0 mt-2 w-48 ${ThemeConstants.bgColors.card} ${ThemeConstants.rounded.md} ${ThemeConstants.shadows.lg} py-1 z-50 ${ThemeConstants.borders.card}`}>
                    <button className={`block w-full text-left px-4 py-2 ${ThemeConstants.textColors.primary} hover:bg-slate-100`}>
                      Perfil
                    </button>
                    <button className={`block w-full text-left px-4 py-2 ${ThemeConstants.textColors.primary} hover:bg-slate-100`}>
                      Configuración
                    </button>
                    <div className="border-t border-slate-200"></div>
                    <button 
                      onClick={handleLogout}
                      className={`block w-full text-left px-4 py-2 ${ThemeConstants.textColors.primary} hover:bg-slate-100`}
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className={`flex-1 overflow-hidden p-2 sm:p-4 lg:p-6 ${ThemeConstants.textColors.primary}`}
              style={{ height: 'calc(100vh - 64px)' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;