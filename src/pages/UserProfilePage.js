// UserProfilePage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const UserProfilePage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentRequestId, setPaymentRequestId] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [selectedMonths, setSelectedMonths] = useState(1);
  const [contractDetails, setContractDetails] = useState(null);
  const { auth } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const [userRes, contractsRes, notificationsRes, paymentsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/users/info', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/contracts/my', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/notifications', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/payments', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        setUserInfo(userRes.data);
        setContracts(contractsRes.data);
        setNotifications(notificationsRes.data);
        setPayments(paymentsRes.data);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      }
    };

    if (auth.token) {
      fetchData();
    }
  }, [auth.token]);

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('Ошибка при обновлении уведомления:', error);
    }
  };

  const handleShowPaymentForm = async (contractId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `http://localhost:5000/api/contracts/${contractId}/details`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Рассчитываем количество месяцев аренды
      const startDate = new Date(res.data.start_date);
      const endDate = new Date(res.data.end_date);
      const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                         (endDate.getMonth() - startDate.getMonth()) + 1;
      
      setContractDetails({
        ...res.data,
        monthly_price: res.data.monthly_price,
        totalMonths: monthsDiff
      });
      setPaymentRequestId(res.data.request_id);
      setSelectedMonths(1);
      setPaymentAmount((res.data.monthly_price * 1).toFixed(2));
      setShowPaymentForm(true);
    } catch (error) {
      console.error('Ошибка при получении данных договора:', error);
      alert('Не удалось загрузить данные договора');
    }
  };

  const handleMonthsChange = (e) => {
    const months = parseInt(e.target.value);
    setSelectedMonths(months);
    setPaymentAmount((contractDetails.monthly_price * months).toFixed(2));
  };

  const handlePayment = async () => {
    if (!paymentRequestId || !paymentAmount) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/payments',
        { request_id: paymentRequestId, amount: paymentAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Платеж успешно проведен!');
      setShowPaymentForm(false);
      
      // Обновляем данные
      const paymentsRes = await axios.get('http://localhost:5000/api/payments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(paymentsRes.data);
    } catch (error) {
      console.error('Ошибка при проведении платежа:', error);
      alert('Ошибка при проведении платежа!');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>Личный кабинет</h2>
      
      {userInfo ? (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#444' }}>Добро пожаловать, {userInfo.full_name}!</h3>
          <p>Email: {userInfo.email}</p>
        </div>
      ) : (
        <p>Загрузка данных...</p>
      )}

      <h3 style={{ color: '#444', marginBottom: '15px' }}>Ваши уведомления</h3>
      
      {notifications.length === 0 ? (
        <p>У вас пока нет уведомлений.</p>
      ) : (
        notifications.map(notification => (
          <div 
            key={notification.id} 
            style={{ 
              marginBottom: '10px', 
              padding: '15px', 
              border: '1px solid #ddd',
              borderRadius: '5px',
              backgroundColor: notification.is_read ? '#f9f9f9' : '#e6f7ff'
            }}
          >
            <p>{notification.message}</p>
            <small>{new Date(notification.created_at).toLocaleString()}</small>
            {!notification.is_read && (
              <button 
                onClick={() => markAsRead(notification.id)}
                style={{
                  marginLeft: '10px',
                  padding: '5px 10px',
                  backgroundColor: '#1890ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Прочитано
              </button>
            )}
          </div>
        ))
      )}

      <h3 style={{ color: '#444', marginTop: '30px', marginBottom: '15px' }}>Ваши договоры аренды</h3>
      
      {contracts.length === 0 ? (
        <p>У вас пока нет договоров аренды.</p>
      ) : (
        contracts.map(contract => {
          const contractPayment = payments.find(p => p.request_id === contract.request_id);
          return (
            <div 
              key={contract.id} 
              style={{ 
                marginBottom: '20px', 
                padding: '15px', 
                border: '1px solid #ddd',
                borderRadius: '5px',
                backgroundColor: '#f9f9f9'
              }}
            >
              <h4>Договор №{contract.id}</h4>
              <p>Дата создания: {new Date(contract.created_at).toLocaleDateString()}</p>
              <p><strong>Помещение:</strong> №{contract.room_number}</p>
              <p><strong>Месячная плата:</strong> {contract.monthly_price}₸</p>
              <p><strong>Срок аренды:</strong> {new Date(contract.start_date).toLocaleDateString()} - {new Date(contract.end_date).toLocaleDateString()}</p>
              {contract.file_url && (
                <a 
                  href={`http://localhost:5000${contract.file_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    marginTop: '10px',
                    padding: '8px 15px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px'
                  }}
                >
                  Скачать договор (PDF)
                </a>
              )}
              {contractPayment ? (
                <div style={{ marginTop: '10px' }}>
                  <p><strong>Статус оплаты:</strong> Оплачено ({contractPayment.amount}₸)</p>
                  <p><strong>Дата оплаты:</strong> {new Date(contractPayment.payment_date).toLocaleDateString()}</p>
                </div>
              ) : (
                <button 
                  onClick={() => handleShowPaymentForm(contract.id)}
                  style={{
                    display: 'block',
                    marginTop: '10px',
                    padding: '8px 15px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Оплатить
                </button>
              )}
            </div>
          );
        })
      )}

      <h3 style={{ color: '#444', marginTop: '30px', marginBottom: '15px' }}>История платежей</h3>
      
      {payments.length === 0 ? (
        <p>У вас пока нет платежей.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>ID</th>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Сумма</th>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Дата</th>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Статус</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{payment.id}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{payment.amount}₸</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {new Date(payment.payment_date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{payment.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showPaymentForm && contractDetails && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '400px',
            maxWidth: '90%'
          }}>
            <h3 style={{ marginTop: 0 }}>Оплата аренды</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <p><strong>Помещение:</strong> №{contractDetails.room_number}</p>
              <p><strong>Срок аренды:</strong> {new Date(contractDetails.start_date).toLocaleDateString()} - {new Date(contractDetails.end_date).toLocaleDateString()}</p>
              <p><strong>Месячная плата:</strong> {contractDetails.monthly_price}₸</p>
              <p><strong>Общий срок аренды:</strong> {contractDetails.totalMonths} месяцев</p>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Оплатить за:</label>
              <select
                value={selectedMonths}
                onChange={handleMonthsChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                {Array.from({length: contractDetails.totalMonths}, (_, i) => i + 1).map(months => (
                  <option key={months} value={months}>
                    {months} месяц(ев)
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Сумма к оплате:</label>
              <input
                type="text"
                value={`${paymentAmount}₸`}
                readOnly
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setShowPaymentForm(false)}
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Отмена
              </button>
              <button 
                onClick={handlePayment}
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Подтвердить оплату
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;