import React, { useState } from 'react';
import ProductTable from '../components/ProductTable';
import Dashboard from '../components/Dashboard';

export default function ProductsPage({ onNavigate }) {
  const [selectedProduct, setSelectedProduct] = useState('85123A');

  const handleSelectProduct = (sku) => {
    setSelectedProduct(sku);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Interactive Forecast Dashboard for selected product */}
      <Dashboard defaultSku={selectedProduct} />

      {/* Full Catalog Table */}
      <ProductTable onSelectProduct={handleSelectProduct} />
    </div>
  );
}
