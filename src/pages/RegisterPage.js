import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/auth/register', { 
                full_name: fullName,
                email, 
                password 
            });
            alert('Регистрация успешна!');
            navigate('/login');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Ошибка регистрации!');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: 'auto', paddingTop: '50px' }}>
            <h2>Регистрация</h2>
            <form onSubmit={handleRegister}>
                <div style={{ marginBottom: '15px' }}>
                    <label>ФИО:</label>
                    <input 
                        type="text" 
                        placeholder="Иванов Иван Иванович"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Email:</label>
                    <input 
                        type="email" 
                        placeholder="example@mail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Пароль:</label>
                    <input 
                        type="password" 
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <button 
                    type="submit"
                    style={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        padding: '10px 15px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Зарегистрироваться
                </button>
            </form>
            <p style={{ marginTop: '15px' }}>
                Уже есть аккаунт? <a href="/login" style={{ color: '#4CAF50' }}>Войти</a>
            </p>
        </div>
    );
}

export default RegisterPage;