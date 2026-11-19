import React from 'react';

const ForecastChart = ({ forecast = [] }) => {
  return (
    <div className="card forecast-chart">
      <h3>Demand Forecast (Next 7 Days)</h3>
      {forecast.length === 0 ? (
        <p style={{ marginTop: '12px', color: '#64748b' }}>No forecast data available.</p>
      ) : (
        <table className="forecast-table">
          <thead>
            <tr>
              <th>Timeline</th>
              <th>Predicted Demand (Units)</th>
              <th>Confidence Range</th>
            </tr>
          </thead>
          <tbody>
            {forecast.map((item, idx) => (
              <tr key={idx}>
                <td>{item.date}</td>
                <td><strong>{item.predicted_demand}</strong></td>
                <td>{item.lower_bound} - {item.upper_bound}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ForecastChart;
