import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminRequestsPage() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const fetchAllRequests = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/requests/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data);
    } catch (error) {
      console.error('Ошибка при загрузке заявок:', error);
      alert('Не удалось загрузить заявки.');
    }
  };

  const handleApprove = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        `http://localhost:5000/api/requests/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Заявка одобрена! Пользователь получил уведомление.');
      fetchAllRequests();
    } catch (error) {
      console.error('Ошибка при одобрении:', error);
      alert('Не удалось одобрить заявку.');
    }
  };

  const handleReject = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        `http://localhost:5000/api/requests/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Заявка отклонена! Пользователь получил уведомление.');
      fetchAllRequests();
    } catch (error) {
      console.error('Ошибка при отклонении:', error);
      alert('Не удалось отклонить заявку.');
    }
  };

  const handleGenerateContract = async (requestId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        `http://localhost:5000/api/requests/${requestId}/generate-contract`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Договор успешно сгенерирован! ${response.data.message}`);
      fetchAllRequests();
    } catch (error) {
      console.error('Ошибка при генерации договора:', error);
      alert('Не удалось сформировать договор.');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: 'auto', paddingTop: '50px' }}>
      <h2>Заявки арендаторов (Администратор)</h2>
      {requests.length === 0 && <p>Нет заявок.</p>}
      {requests.map((req) => (
        <div
          key={req.id}
          style={{
            border: '1px solid #ccc',
            borderRadius: '6px',
            padding: '15px',
            marginBottom: '10px',
            backgroundColor: '#fafafa'
          }}
        >
          <p><strong>Пользователь:</strong> {req.user_full_name} ({req.user_email})</p>
          <p><strong>Помещение №</strong> {req.room_number} — этаж {req.floor}, {req.area} м², {req.price}₸, {req.room_type}</p>
          <p><strong>Период:</strong> {req.start_date} — {req.end_date}</p>
          <p><strong>Комментарий:</strong> {req.comment || '—'}</p>
          <p><strong>Статус заявки:</strong> {req.status}</p>

          {req.status === 'pending' && (
            <div style={{ marginTop: '10px' }}>
              <button
                onClick={() => handleApprove(req.id)}
                style={{
                  marginRight: '10px',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  backgroundColor: '#2ecc71',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Одобрить
              </button>
              <button
                onClick={() => handleReject(req.id)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Отклонить
              </button>
            </div>
          )}

          {req.status === 'approved' && (
            <div style={{ marginTop: '10px' }}>
              <button
                onClick={() => handleGenerateContract(req.id)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                📄 Сформировать договор
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default AdminRequestsPage;