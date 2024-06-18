import React from 'react';

const Statistics = ({ statistics }) => {
  return (
    <div className="flex justify-around my-4 p-4 bg-gray-100 rounded">
      <div>Total Sales Amount: <span className="font-bold">${statistics.total}</span></div>
      <div>Total Sold Items: <span className="font-bold">{statistics.soldItems}</span></div>
      <div>Total Not Sold Items: <span className="font-bold">{statistics.notSoldItems}</span></div>
    </div>
  );
};

export default Statistics;
