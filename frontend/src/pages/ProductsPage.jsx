import React, { useState } from 'react';
import ProductTable from '../components/ProductTable';
import ForecastChartPanel from '../components/ForecastChartPanel';

export default function ProductsPage({ onNavigate }) {
  const [selectedProduct, setSelectedProduct] = useState('85123A');

  const handleSelectProduct = (sku) => {
    setSelectedProduct(sku);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <ForecastChartPanel selectedProduct={selectedProduct} />
      <ProductTable onSelectProduct={handleSelectProduct} />
    </>
  );
}
