import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function AdminAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/payments/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.data || !res.data.yearlyStats || !res.data.roomPopularity) {
          throw new Error('Неверный формат данных');
        }
        
        setStats(res.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError(error.message || 'Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const calculateNetProfit = (totalRevenue) => {
    const revenueWithoutVAT = totalRevenue / 1.12;
    const corporateTax = revenueWithoutVAT * 0.20;
    return revenueWithoutVAT - corporateTax;
  };

  const handleGenerateTaxReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/admin/generate-tax-report',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert(`Отчет для налоговой успешно сгенерирован! ${response.data.message}`);
      
      if (response.data.reportUrl) {
        window.open(`http://localhost:5000${response.data.reportUrl}`, '_blank');
      }
    } catch (error) {
      console.error('Ошибка при генерации отчета:', error);
      alert('Не удалось сформировать отчет для налоговой.');
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Загрузка данных...</div>;
  if (error) return <div style={{ padding: '40px', color: 'red', textAlign: 'center' }}>{error}</div>;
  if (!stats) return <div style={{ padding: '40px', textAlign: 'center' }}>Нет данных для отображения</div>;

  const chartData = stats.yearlyStats.map(year => ({
    year: year.year,
    Выручка: year.total_amount,
    'Чистая прибыль': calculateNetProfit(year.total_amount)
  }));

  const roomTypeData = stats.roomPopularity.reduce((acc, room) => {
    const existingType = acc.find(item => item.name === room.type);
    if (existingType) {
      existingType.value += room.total_revenue;
    } else {
      acc.push({ name: room.type, value: room.total_revenue });
    }
    return acc;
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ marginBottom: '24px' }}>Аналитика аренды</h2>
      
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        padding: '24px', 
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginTop: 0 }}>Финансовая аналитика</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #e5e7eb' }}>Год</th>
              <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #e5e7eb' }}>Выручка</th>
              <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #e5e7eb' }}>Без НДС</th>
              <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #e5e7eb' }}>КПН (20%)</th>
              <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #e5e7eb' }}>Чистая прибыль</th>
            </tr>
          </thead>
          <tbody>
            {stats.yearlyStats.map(year => {
              const revenueWithoutVAT = year.total_amount / 1.12;
              const corporateTax = revenueWithoutVAT * 0.20;
              const netProfit = revenueWithoutVAT - corporateTax;
              
              return (
                <tr key={year.year} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>{year.year}</td>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>{year.total_amount.toFixed(2)}₸</td>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>{revenueWithoutVAT.toFixed(2)}₸</td>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>{corporateTax.toFixed(2)}₸</td>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>{netProfit.toFixed(2)}₸</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '24px',
        marginBottom: '24px'
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0 }}>Выручка по годам</h3>
          <div style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toFixed(2)}₸`} />
                <Legend />
                <Bar dataKey="Выручка" fill="#3b82f6" />
                <Bar dataKey="Чистая прибыль" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0 }}>Распределение по типам</h3>
          <div style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roomTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {roomTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(2)}₸`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginTop: 0 }}>Популярность помещений</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #e5e7eb' }}>Помещение</th>
              <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #e5e7eb' }}>Тип</th>
              <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #e5e7eb' }}>Количество аренд</th>
              <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #e5e7eb' }}>Общая выручка</th>
            </tr>
          </thead>
          <tbody>
            {stats.roomPopularity.map(room => (
              <tr key={room.room_number} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>№{room.room_number}</td>
                <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>{room.type}</td>
                <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>{room.rental_count}</td>
                <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>{room.total_revenue.toFixed(2)}₸</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginTop: '24px'
      }}>
        <h3 style={{ marginTop: 0 }}>Отчеты для налоговой</h3>
        <button
          onClick={handleGenerateTaxReport}
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
          Сформировать отчет для налоговой
        </button>
        <p style={{ marginTop: '10px', color: '#666' }}>
          Отчет содержит данные о текущих арендаторах: ФИО, ИИН, площадь и стоимость аренды.
        </p>
      </div>
    </div>
  );
}

export default AdminAnalyticsPage;