export default function ProductSelector({ stockCode, setStockCode, currentStock, setCurrentStock }) {
  return (
    <div className="selector">
      <input
        type="text"
        placeholder="Enter StockCode (e.g. 85123A)"
        value={stockCode}
        onChange={e => setStockCode(e.target.value)}
        className="input"
      />
      <label>Current Stock:</label>
      <input
        type="number"
        value={currentStock}
        onChange={e => setCurrentStock(Number(e.target.value))}
        className="input"
        min={0}
      />
    </div>
  );
}