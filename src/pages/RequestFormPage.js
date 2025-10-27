import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

function RequestFormPage() {
  const { roomId } = useParams();
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    comment: '',
    iin: ''
  });
  const [error, setError] = useState('');
  const [totalCost, setTotalCost] = useState(0);
  const [roomInfo, setRoomInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoomInfo = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/rooms/${roomId}`);
        setRoomInfo(res.data);
      } catch (err) {
        console.error('Ошибка загрузки информации о помещении:', err);
      }
    };
    fetchRoomInfo();
  }, [roomId]);

  useEffect(() => {
    if (formData.start_date && formData.end_date && roomInfo?.price) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (start < today) {
        setError('Дата начала аренды не может быть в прошлом');
        return;
      }
      
      if (end <= start) {
        setError('Дата окончания должна быть позже даты начала');
        return;
      }

      // Вычисляем разницу в месяцах
      const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                     (end.getMonth() - start.getMonth()) + 
                     (end.getDate() >= start.getDate() ? 0 : -1);
      
      // Минимально 1 месяц
      const totalMonths = Math.max(1, months);
      setTotalCost(totalMonths * roomInfo.price);
    }
  }, [formData.start_date, formData.end_date, roomInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Валидация ИИН (12 цифр)
    if (!/^\d{12}$/.test(formData.iin)) {
      setError('ИИН должен состоять из 12 цифр');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      await axios.post(
        'http://localhost:5000/api/requests',
        {
          room_id: roomId,
          start_date: formData.start_date,
          end_date: formData.end_date,
          comment: formData.comment,
          iin: formData.iin
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Заявка успешно подана!');
      navigate('/requests');
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || 'Ошибка при подаче заявки!');
    }
  };

  return (
    <div style={{ 
      maxWidth: '500px', 
      margin: 'auto', 
      padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      marginTop: '50px'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Подача заявки на аренду</h2>
      
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
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>Дата начала аренды:</label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            required
            min={new Date().toISOString().split('T')[0]}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        
        <div>
          <label>Дата окончания аренды:</label>
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            required
            min={formData.start_date || new Date().toISOString().split('T')[0]}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        
        {roomInfo && totalCost > 0 && (
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '4px',
            border: '1px solid #dee2e6'
          }}>
            <p><strong>Стоимость аренды:</strong> {totalCost}₸ ({roomInfo.price}₸ × {Math.round(totalCost / roomInfo.price)} мес.)</p>
          </div>
        )}
        
        <div>
          <label>ИИН (12 цифр):</label>
          <input
            type="text"
            name="iin"
            value={formData.iin}
            onChange={handleChange}
            required
            pattern="\d{12}"
            maxLength="12"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        
        <div>
          <label>Комментарий:</label>
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '8px', 
              borderRadius: '4px', 
              border: '1px solid #ddd',
              minHeight: '100px'
            }}
          />
        </div>
        
        <button 
          type="submit"
          style={{
            padding: '10px 15px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            marginTop: '10px'
          }}
        >
          Отправить заявку
        </button>
      </form>
    </div>
  );
}

export default RequestFormPage;