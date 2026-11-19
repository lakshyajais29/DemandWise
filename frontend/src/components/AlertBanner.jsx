export default function AlertBanner({ status, message }) {
  if (!message) return null;
  const color = status === 'Low Stock' ? '#fee2e2' : status === 'Overstock' ? '#fef3c7' : '#dcfce7';
  const border = status === 'Low Stock' ? '#dc2626' : status === 'Overstock' ? '#d97706' : '#16a34a';
  return (
    <div style={{ background: color, border: `1px solid ${border}`, padding: '12px 16px', borderRadius: 8, margin: '12px 0' }}>
      <strong>{status}:</strong> {message}
    </div>
  );
}