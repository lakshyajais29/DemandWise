// Mock / demo data for DemandWise dashboard
// Clearly separated from live API data

export const DEMO_PRODUCTS = [
  { id: '85123A', name: 'WHITE HANGING HEART T-LIGHT HOLDER', category: 'Home Decor' },
  { id: '71053',  name: 'WHITE METAL LANTERN',                category: 'Lighting'   },
  { id: '84406B', name: 'CREAM CUPID HEARTS COAT HANGER',    category: 'Storage'    },
  { id: '84029G', name: 'KNITTED UNION FLAG HOT WATER BOTTLE', category: 'Textiles' },
  { id: '22752',  name: 'SET 7 BABUSHKA NESTING BOXES',      category: 'Toys'       },
  { id: '21730',  name: 'GLASS STAR FROSTED T-LIGHT HOLDER', category: 'Home Decor' },
  { id: '22633',  name: 'HAND WARMER UNION JACK',            category: 'Accessories'},
  { id: '85099B', name: 'JUMBO BAG RED RETROSPOT',           category: 'Bags'       },
  { id: '47566',  name: 'PARTY BUNTING',                     category: 'Events'     },
  { id: '22086',  name: 'PAPER CHAIN KIT VINTAGE CHRISTMAS', category: 'Seasonal'   },
];

export const DEMO_KPI = {
  totalProducts:    { value: '1,247',  delta: '+12', dir: 'up',      vs: 'vs last month' },
  unitsSold:        { value: '84,310', delta: '+8.4%', dir: 'up',    vs: 'vs last 30d'  },
  forecastedDemand: { value: '11,240', delta: '+3.1%', dir: 'up',    vs: 'next 7 days'  },
  currentInventory: { value: '62,580', delta: '-2.3%', dir: 'down',  vs: 'vs last week' },
  lowStockProducts: { value: '23',     delta: '+5',   dir: 'down',   vs: 'need reorder' },
  forecastAccuracy: { value: '91.4%',  delta: '+1.2%', dir: 'up',    vs: 'vs last model' },
};

export const DEMO_TABLE_DATA = [
  { stockCode: '85123A', name: 'White Hanging Heart T-Light Holder', unitsSold: 2458, predictedDemand: 312, currentStock: 85,  status: 'Low Stock'  },
  { stockCode: '71053',  name: 'White Metal Lantern',                unitsSold: 1876, predictedDemand: 198, currentStock: 440, status: 'Healthy'    },
  { stockCode: '84406B', name: 'Cream Cupid Hearts Coat Hanger',    unitsSold: 1540, predictedDemand: 171, currentStock: 22,  status: 'Low Stock'  },
  { stockCode: '84029G', name: 'Knitted Union Flag Hot Water Bottle',unitsSold: 1320, predictedDemand: 155, currentStock: 310, status: 'Healthy'    },
  { stockCode: '22752',  name: 'Set 7 Babushka Nesting Boxes',      unitsSold: 1210, predictedDemand: 130, currentStock: 680, status: 'Overstocked'},
  { stockCode: '21730',  name: 'Glass Star Frosted T-Light Holder', unitsSold: 1120, predictedDemand: 118, currentStock: 55,  status: 'Low Stock'  },
  { stockCode: '22633',  name: 'Hand Warmer Union Jack',            unitsSold: 980,  predictedDemand: 105, currentStock: 200, status: 'Healthy'    },
  { stockCode: '85099B', name: 'Jumbo Bag Red Retrospot',           unitsSold: 870,  predictedDemand: 92,  currentStock: 490, status: 'Overstocked'},
  { stockCode: '47566',  name: 'Party Bunting',                     unitsSold: 760,  predictedDemand: 83,  currentStock: 160, status: 'Healthy'    },
  { stockCode: '22086',  name: 'Paper Chain Kit Vintage Christmas', unitsSold: 650,  predictedDemand: 72,  currentStock: 15,  status: 'Low Stock'  },
  { stockCode: '20685',  name: 'Red Retrospot Charlotte Bag',       unitsSold: 580,  predictedDemand: 64,  currentStock: 94,  status: 'Healthy'    },
  { stockCode: '21212',  name: 'Pack of 72 Retrospot Cake Cases',   unitsSold: 540,  predictedDemand: 60,  currentStock: 310, status: 'Healthy'    },
];

export const DEMO_INVENTORY = [
  { stockCode: '85123A', name: 'White Hanging Heart T-Light Holder', current: 85,  predicted: 312, status: 'Low Stock',   reorder: 227 },
  { stockCode: '84406B', name: 'Cream Cupid Hearts Coat Hanger',    current: 22,  predicted: 171, status: 'Low Stock',   reorder: 149 },
  { stockCode: '21730',  name: 'Glass Star Frosted T-Light Holder', current: 55,  predicted: 118, status: 'Low Stock',   reorder: 63  },
  { stockCode: '22086',  name: 'Paper Chain Kit Vintage Christmas', current: 15,  predicted: 72,  status: 'Low Stock',   reorder: 57  },
  { stockCode: '71053',  name: 'White Metal Lantern',               current: 440, predicted: 198, status: 'Healthy',     reorder: 0   },
  { stockCode: '22633',  name: 'Hand Warmer Union Jack',            current: 200, predicted: 105, status: 'Healthy',     reorder: 0   },
  { stockCode: '22752',  name: 'Set 7 Babushka Nesting Boxes',     current: 680, predicted: 130, status: 'Overstocked', reorder: 0   },
  { stockCode: '85099B', name: 'Jumbo Bag Red Retrospot',          current: 490, predicted: 92,  status: 'Overstocked', reorder: 0   },
];

export const DEMO_ACTIVITY = [
  { id: 1, type: 'forecast', text: 'Forecast generated for SKU 85123A — Low stock alert triggered.',      time: '2 min ago',  color: '#DC2626' },
  { id: 2, type: 'reorder',  text: 'Reorder recommendation: 227 units for White Hanging Heart Holder.',  time: '14 min ago', color: '#D97706' },
  { id: 3, type: 'model',    text: 'Model performance report updated. Accuracy: 91.4%.',                 time: '1 hr ago',   color: '#22c55e' },
  { id: 4, type: 'forecast', text: 'Forecast generated for SKU 71053 — Stock levels healthy.',           time: '3 hr ago',   color: '#22c55e' },
  { id: 5, type: 'alert',    text: 'Overstocked alert: Babushka Nesting Boxes — excess 550 units.',      time: '5 hr ago',   color: '#D97706' },
  { id: 6, type: 'report',   text: 'Monthly demand report exported.',                                    time: '1 day ago',  color: '#817D75' },
];

export const DEMO_TOP_PRODUCTS = [
  { rank: 1, name: 'White Heart T-Light Holder', value: '2,458 units', delta: '+12%'  },
  { rank: 2, name: 'White Metal Lantern',         value: '1,876 units', delta: '+6%'   },
  { rank: 3, name: 'Cream Cupid Coat Hanger',     value: '1,540 units', delta: '+18%'  },
  { rank: 4, name: 'Knitted Union Flag Bottle',   value: '1,320 units', delta: '+3%'   },
  { rank: 5, name: 'Set 7 Babushka Boxes',        value: '1,210 units', delta: '-2%'   },
];

// Generate demo chart data (historical + forecast)
export function generateChartData(days = 30) {
  const data = [];
  const today = new Date();
  const histDays = Math.floor(days * 0.65);
  const futureDays = days - histDays;
  let base = 48;

  for (let i = -histDays; i < futureDays; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const noise = Math.round((Math.random() - 0.5) * 18);
    const weekend = d.getDay() === 0 || d.getDay() === 6 ? -8 : 0;
    const trend = i * 0.3;
    const actual = i < 0 ? Math.max(10, Math.round(base + noise + weekend + trend)) : undefined;
    const predicted = Math.max(10, Math.round(base + noise * 0.5 + weekend + trend + 3));
    data.push({ date: label, actual, predicted });
    base += 0.1;
  }
  return data;
}
