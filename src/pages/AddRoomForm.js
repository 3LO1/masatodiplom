import React, { useState } from 'react';
import axios from 'axios';

function AddRoomForm({ onRoomAdded }) {
  const [formData, setFormData] = useState({
    room_number: '',
    floor: '',
    area: '',
    price: '',
    type: 'офис',
    photo_url: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/rooms',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess('Помещение успешно добавлено!');
      if (onRoomAdded) onRoomAdded(response.data);
      
      // Очистка формы
      setFormData({
        room_number: '',
        floor: '',
        area: '',
        price: '',
        type: 'офис',
        photo_url: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при добавлении помещения');
    }
  };

  return (
    <div style={{ 
      margin: '20px 0', 
      padding: '20px', 
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3 style={{ marginTop: 0 }}>Добавить новое помещение</h3>
      {error && <div style={{ color: 'red', margin: '10px 0' }}>{error}</div>}
      {success && <div style={{ color: 'green', margin: '10px 0' }}>{success}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>Номер помещения:</label>
          <input
            type="text"
            name="room_number"
            value={formData.room_number}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        
        <div>
          <label>Этаж:</label>
          <input
            type="number"
            name="floor"
            value={formData.floor}
            onChange={handleChange}
            required
            min="1"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        
        <div>
          <label>Площадь (м²):</label>
          <input
            type="number"
            step="0.01"
            name="area"
            value={formData.area}
            onChange={handleChange}
            required
            min="0"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        
        <div>
          <label>Цена (₸):</label>
          <input
            type="number"
            step="0.01"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        
        <div>
          <label>Тип:</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="офис">Офис</option>
            <option value="студия">Студия</option>
            <option value="апартаменты">Апартаменты</option>
          </select>
        </div>
        
        <div>
          <label>Ссылка на фото (необязательно):</label>
          <input
            type="url"
            name="photo_url"
            value={formData.photo_url}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
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
            fontSize: '16px'
          }}
        >
          Добавить помещение
        </button>
      </form>
    </div>
  );
}

export default AddRoomForm;