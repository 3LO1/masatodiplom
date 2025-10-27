import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const navigate = useNavigate();
    const { auth, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <nav style={{
            backgroundColor: '#2c3e50',
            padding: '10px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 1000
        }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Link 
                    to="/rooms" 
                    style={{ 
                        color: 'white', 
                        textDecoration: 'none', 
                        marginRight: '20px', 
                        fontWeight: 'bold',
                        fontSize: '1.2rem'
                    }}
                >
                    MASATO
                </Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <Link 
                    to="/rooms" 
                    style={{ 
                        color: 'white', 
                        textDecoration: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        transition: 'background-color 0.3s'
                    }}
                    className="nav-link"
                >
                    Каталог
                </Link>

                <Link 
                    to="/requests" 
                    style={{ 
                        color: 'white', 
                        textDecoration: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        transition: 'background-color 0.3s'
                    }}
                    className="nav-link"
                >
                    Мои заявки
                </Link>

                {auth.role === 'admin' && (
                    <>
                        <Link 
                            to="/admin/requests" 
                            style={{ 
                                color: 'white', 
                                textDecoration: 'none',
                                padding: '5px 10px',
                                borderRadius: '4px',
                                transition: 'background-color 0.3s'
                            }}
                            className="nav-link"
                        >
                            Заявки
                        </Link>
                        <Link 
                            to="/admin/analytics" 
                            style={{ 
                                color: 'white', 
                                textDecoration: 'none',
                                padding: '5px 10px',
                                borderRadius: '4px',
                                transition: 'background-color 0.3s'
                            }}
                            className="nav-link"
                        >
                            Аналитика
                        </Link>
                    </>
                )}

                {auth.token && (
                    <Link 
                        to="/profile" 
                        style={{ 
                            color: 'white', 
                            textDecoration: 'none',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            transition: 'background-color 0.3s'
                        }}
                        className="nav-link"
                    >
                        {auth.full_name || 'Профиль'}
                    </Link>
                )}

                {auth.token ? (
                    <button 
                        onClick={handleLogout}
                        style={{
                            backgroundColor: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            padding: '5px 15px',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            fontSize: '0.9rem',
                            transition: 'background-color 0.3s'
                        }}
                        className="logout-btn"
                    >
                        Выйти
                    </button>
                ) : (
                    <Link 
                        to="/login" 
                        style={{ 
                            backgroundColor: '#27ae60',
                            color: 'white',
                            textDecoration: 'none',
                            padding: '5px 15px',
                            borderRadius: '4px',
                            fontSize: '0.9rem'
                        }}
                    >
                        Войти
                    </Link>
                )}
            </div>
        </nav>
    );
}

export default Navbar;