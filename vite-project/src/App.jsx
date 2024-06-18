import React, { useState, useEffect } from 'react';
import TransactionsTable from './components/TransactionsTable';
import Statistics from './components/Statistics';
import BarChart from './components/BarChart';
import PieChart from './components/PieChart';

const App = () => {
  const [month, setMonth] = useState('March');
  const [combinedData, setCombinedData] = useState({ transactions: [], statistics: {}, barChart: [], pieChart: [] });

  useEffect(() => {
    fetchCombinedData();
  }, [month]);

  const fetchCombinedData = async () => {
    const response = await fetch(`http://localhost:5000/api/combined?month=${month}`);
    const data = await response.json();
    setCombinedData(data);
  };

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Transactions Dashboard</h1>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border border-gray-300 rounded p-2"
        >
          {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((monthOption) => (
            <option key={monthOption} value={monthOption}>{monthOption}</option>
          ))}
        </select>
      </header>
      <TransactionsTable transactions={combinedData.transactions} />
      <Statistics statistics={combinedData.statistics} />
      <div className="flex flex-wrap mt-4">
        <div className="w-full md:w-1/2 p-2">
          <BarChart data={combinedData.barChart} />
        </div>
        <div className="w-full md:w-1/2 p-2">
          <PieChart data={combinedData.pieChart} />
        </div>
      </div>
    </div>
  );
};

export default App;
