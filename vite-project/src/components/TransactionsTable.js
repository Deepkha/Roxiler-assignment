import React, { useState } from 'react';

const TransactionsTable = ({ transactions }) => {
  const [search, setSearch] = useState('');

  const filteredTransactions = transactions.filter(transaction =>
    transaction.title.toLowerCase().includes(search.toLowerCase()) ||
    transaction.description.toLowerCase().includes(search.toLowerCase()) ||
    transaction.price.toString().includes(search)
  );

  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="Search transactions"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border border-gray-300 rounded p-2 mb-4 w-full"
      />
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Title</th>
            <th className="py-2 px-4 border-b">Description</th>
            <th className="py-2 px-4 border-b">Price</th>
            <th className="py-2 px-4 border-b">Category</th>
            <th className="py-2 px-4 border-b">Date of Sale</th>
            <th className="py-2 px-4 border-b">Sold</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.map(transaction => (
            <tr key={transaction._id}>
              <td className="py-2 px-4 border-b">{transaction.title}</td>
              <td className="py-2 px-4 border-b">{transaction.description}</td>
              <td className="py-2 px-4 border-b">{transaction.price}</td>
              <td className="py-2 px-4 border-b">{transaction.category}</td>
              <td className="py-2 px-4 border-b">{new Date(transaction.dateOfSale).toLocaleDateString()}</td>
              <td className="py-2 px-4 border-b">{transaction.sold ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionsTable;
