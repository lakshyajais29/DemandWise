export default function InventoryCard({ label, value, unit, color }) {
  return (
    <div className="card" style={{ borderTop: `4px solid ${color}` }}>
      <p className="card-label">{label}</p>
      <p className="card-value" style={{ color }}>{value}</p>
      {unit && <p className="card-unit">{unit}</p>}
    </div>
  );
}