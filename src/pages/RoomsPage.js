import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AddRoomForm from './AddRoomForm';
import EditRoomForm from './EditRoomForm';

function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [floorFilter, setFloorFilter] = useState('');
  const [minArea, setMinArea] = useState('');
  const [maxArea, setMaxArea] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingRoom, setEditingRoom] = useState(null);
  const { auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/rooms');
      setRooms(res.data);
      setFilteredRooms(res.data);
    } catch (err) {
      console.error('Ошибка загрузки помещений:', err);
      alert('Ошибка загрузки помещений!');
    }
  };

  const applyFilters = () => {
    let filtered = [...rooms];
    if (floorFilter) filtered = filtered.filter(r => r.floor === +floorFilter);
    if (minArea) filtered = filtered.filter(r => +r.area >= +minArea);
    if (maxArea) filtered = filtered.filter(r => +r.area <= +maxArea);
    if (minPrice) filtered = filtered.filter(r => +r.price >= +minPrice);
    if (maxPrice) filtered = filtered.filter(r => +r.price <= +maxPrice);
    if (statusFilter) filtered = filtered.filter(r => r.status === statusFilter);
    setFilteredRooms(filtered);
  };

  const handleRoomAdded = (newRoom) => {
    setRooms([newRoom, ...rooms]);
    setFilteredRooms([newRoom, ...filteredRooms]);
  };

  const handleRoomUpdated = (updatedRoom) => {
    setRooms(rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r));
    setFilteredRooms(filteredRooms.map(r => r.id === updatedRoom.id ? updatedRoom : r));
    setEditingRoom(null);
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Вы уверены, что хотите удалить это помещение?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(rooms.filter(r => r.id !== roomId));
      setFilteredRooms(filteredRooms.filter(r => r.id !== roomId));
    } catch (err) {
      console.error('Ошибка при удалении помещения:', err);
      alert('Ошибка при удалении помещения!');
    }
  };

  const handleRequestClick = roomId => {
    if (!auth.token) {
      navigate('/login', { state: { from: `/rooms/${roomId}/request` } });
    } else {
      navigate(`/rooms/${roomId}/request`);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: 'auto', padding: '20px 0' }}>
      <h2>Все помещения</h2>

      {auth.role === 'admin' && <AddRoomForm onRoomAdded={handleRoomAdded} />}

      {editingRoom && (
        <EditRoomForm 
          room={editingRoom} 
          onCancel={() => setEditingRoom(null)}
          onRoomUpdated={handleRoomUpdated}
        />
      )}

      {/* Фильтры */}
      <div style={{ 
        margin: '20px 0', 
        padding: '15px', 
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#f5f5f5'
      }}>
        <h4 style={{ marginTop: 0 }}>Фильтры</h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
          gap: '10px',
          alignItems: 'end'
        }}>
          <div>
            <label>Этаж:</label>
            <input
              type="number"
              value={floorFilter}
              onChange={e => setFloorFilter(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div>
            <label>Мин. площадь:</label>
            <input
              type="number"
              value={minArea}
              onChange={e => setMinArea(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div>
            <label>Макс. площадь:</label>
            <input
              type="number"
              value={maxArea}
              onChange={e => setMaxArea(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div>
            <label>Мин. цена:</label>
            <input
              type="number"
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div>
            <label>Макс. цена:</label>
            <input
              type="number"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div>
            <label>Статус:</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="">Все</option>
              <option value="available">Доступно</option>
              <option value="occupied">Занято</option>
            </select>
          </div>
          <button 
            onClick={applyFilters}
            style={{
              padding: '8px 15px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Применить
          </button>
        </div>
      </div>

      {/* Список помещений */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {filteredRooms.length === 0 ? (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center' }}>Нет подходящих помещений</p>
        ) : (
          filteredRooms.map(room => (
            <div
              key={room.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '15px',
                backgroundColor: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                position: 'relative'
              }}
            >
              {auth.role === 'admin' && (
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px' }}>
                  <button
                    onClick={() => setEditingRoom(room)}
                    style={{
                      padding: '5px 8px',
                      backgroundColor: '#FFC107',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteRoom(room.id)}
                    style={{
                      padding: '5px 8px',
                      backgroundColor: '#F44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              )}
              
              <h3 style={{ marginTop: 0 }}>Помещение №{room.room_number}</h3>
              <p><strong>Этаж:</strong> {room.floor}</p>
              <p><strong>Площадь:</strong> {room.area} м²</p>
              <p><strong>Стоимость:</strong> {room.price}₸</p>
              <p><strong>Тип:</strong> {room.type}</p>
              <p>
                <strong>Статус:</strong>{' '}
                <span style={{ 
                  color: room.status === 'available' ? 'green' : 'red',
                  fontWeight: 'bold'
                }}>
                  {room.status === 'available' ? 'Доступно' : 'Занято'}
                </span>
              </p>
              
              {room.status === 'occupied' && (
                <>
                  <p><strong>Занято до:</strong> {new Date(room.end_date).toLocaleDateString()}</p>
                  {auth.role === 'admin' && room.tenant_name && (
                    <>
                      <p><strong>Арендатор:</strong> {room.tenant_name}</p>
                      <p><strong>Контакт:</strong> {room.tenant_email}</p>
                    </>
                  )}
                </>
              )}
              
              {room.photo_url && (
                <img
                  src={room.photo_url}
                  alt="Фото помещения"
                  style={{ 
                    width: '100%', 
                    height: '200px',
                    objectFit: 'cover',
                    marginTop: '10px',
                    borderRadius: '4px'
                  }}
                />
              )}
              {room.status === 'available' && (
                <button
                  onClick={() => handleRequestClick(room.id)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginTop: '15px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Подать заявку
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RoomsPage;