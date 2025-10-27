// src/pages/RequestsPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function RequestsPage() {
  const { auth } = useAuth();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/requests', {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Ошибка при получении заявок:', error);
      alert('Ошибка при загрузке заявок!');
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.post(
        `http://localhost:5000/api/requests/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      fetchRequests();
    } catch (error) {
      console.error('Ошибка при одобрении заявки:', error);
      alert('Не удалось одобрить заявку');
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.post(
        `http://localhost:5000/api/requests/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      fetchRequests();
    } catch (error) {
      console.error('Ошибка при отклонении заявки:', error);
      alert('Не удалось отклонить заявку');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: 'auto', paddingTop: '50px' }}>
      <h2>Заявки</h2>
      {requests.length === 0 && <p>Заявок пока нет.</p>}
      {requests.map(req => (
        <div
          key={req.id}
          style={{
            border: '1px solid #ccc',
            padding: '15px',
            marginBottom: '10px',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9'
          }}
        >
          <h3>Помещение №{req.room_number}</h3>
          <p><strong>Пользователь:</strong> {req.user_full_name || req.user_email}</p>
          <p><strong>Период:</strong> {req.start_date} — {req.end_date}</p>
          <p><strong>Комментарий:</strong> {req.comment || '—'}</p>
          <p><strong>Статус:</strong> {req.status}</p>

          {auth.role === 'admin' && req.status === 'pending' && (
            <div style={{ marginTop: '10px' }}>
              <button
                onClick={() => handleApprove(req.id)}
                style={{ marginRight: '10px' }}
              >
                Подтвердить
              </button>
              <button onClick={() => handleReject(req.id)}>
                Отклонить
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default RequestsPage;