import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      login(res.data.token); // Просто передаем токен в AuthContext
      navigate('/rooms');
    } catch (err) {
      console.error('Ошибка входа:', err);
      setError(err.response?.data?.message || 'Неверный логин или пароль');
    }
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: 'auto',
      padding: '20px',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      borderRadius: '8px'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
        Вход в систему
      </h2>

      {error && (
        <div style={{
          color: 'red',
          marginBottom: '15px',
          padding: '10px',
          backgroundColor: '#ffeeee',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            placeholder="Введите ваш email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />
        </div>

        <div>
          <label>Пароль:</label>
          <input
            type="password"
            placeholder="Введите пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            backgroundColor: '#3498db',
            color: 'white',
            padding: '10px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            marginTop: '10px'
          }}
        >
          Войти
        </button>
      </form>

      <p style={{ marginTop: '15px', textAlign: 'center' }}>
        Нет аккаунта? <Link to="/register" style={{ color: '#3498db' }}>Зарегистрироваться</Link>
      </p>
    </div>
  );
}

export default LoginPage;