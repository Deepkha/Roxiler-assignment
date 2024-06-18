const express = require('express');
const mongoose = require('mongoose');
const fetch = require('node-fetch');
const app = express();
const port = 3000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/mern', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const transactionSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  category: String,
  dateOfSale: Date,
  sold: Boolean,
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Middleware
app.use(express.json());

// Helper function to get the start and end dates of a month
const getMonthDateRange = (month) => {
  const year = new Date().getFullYear(); // use current year
  const start = new Date(`${year}-${month}-01`);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  return { start, end };
};

// Initialize the database
app.get('/api/init', async (req, res) => {
  const response = await fetch('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
  const data = await response.json();
  await Transaction.deleteMany({});
  await Transaction.insertMany(data);
  res.send({ message: 'Database initialized' });
});

// List all transactions with search and pagination
app.get('/api/transactions', async (req, res) => {
  const { page = 1, perPage = 10, search = '', month } = req.query;
  const { start, end } = getMonthDateRange(month);

  const transactions = await Transaction.find({
    dateOfSale: { $gte: start, $lt: end },
  });

  const filteredTransactions = transactions.filter(transaction =>
    transaction.title.toLowerCase().includes(search.toLowerCase()) ||
    transaction.description.toLowerCase().includes(search.toLowerCase()) ||
    transaction.price.toString().includes(search)
  );

  const paginatedTransactions = filteredTransactions.slice((page - 1) * perPage, page * perPage);

  res.json(paginatedTransactions);
});

// Statistics API
app.get('/api/statistics', async (req, res) => {
  const { month } = req.query;
  const { start, end } = getMonthDateRange(month);
  const transactions = await Transaction.find({ dateOfSale: { $gte: start, $lt: end } });
  const totalSalesAmount = transactions.reduce((sum, transaction) => sum + transaction.price, 0);
  const soldItems = transactions.filter((transaction) => transaction.sold).length;
  const notSoldItems = transactions.filter((transaction) => !transaction.sold).length;
  res.json({ total: totalSalesAmount, soldItems, notSoldItems });
});

// Bar chart API
app.get('/api/barchart', async (req, res) => {
  const { month } = req.query;
  const { start, end } = getMonthDateRange(month);
  const transactions = await Transaction.find({ dateOfSale: { $gte: start, $lt: end } });
  const priceRanges = [
    { range: '0-100', min: 0, max: 100 },
    { range: '101-200', min: 101, max: 200 },
    { range: '201-300', min: 201, max: 300 },
    { range: '301-400', min: 301, max: 400 },
    { range: '401-500', min: 401, max: 500 },
    { range: '501-600', min: 501, max: 600 },
    { range: '601-700', min: 601, max: 700 },
    { range: '701-800', min: 701, max: 800 },
    { range: '801-900', min: 801, max: 900 },
    { range: '901-above', min: 901, max: Infinity },
  ];
  const result = priceRanges.map((range) => ({
    _id: range.range,
    count: transactions.filter((transaction) => transaction.price >= range.min && transaction.price <= range.max).length,
  }));
  res.json(result);
});

// Pie chart API
app.get('/api/piechart', async (req, res) => {
  const { month } = req.query;
  const { start, end } = getMonthDateRange(month);
  const transactions = await Transaction.find({ dateOfSale: { $gte: start, $lt: end } });
  const categories = transactions.reduce((acc, transaction) => {
    acc[transaction.category] = (acc[transaction.category] || 0) + 1;
    return acc;
  }, {});
  const result = Object.keys(categories).map((category) => ({ _id: category, count: categories[category] }));
  res.json(result);
});

// Combined API
app.get('/api/combined', async (req, res) => {
  const { month } = req.query;
  const { start, end } = getMonthDateRange(month);
  const [transactions, statistics, barChart, pieChart] = await Promise.all([
    Transaction.find({ dateOfSale: { $gte: start, $lt: end } }),
    (async () => {
      const transactions = await Transaction.find({ dateOfSale: { $gte: start, $lt: end } });
      const totalSalesAmount = transactions.reduce((sum, transaction) => sum + transaction.price, 0);
      const soldItems = transactions.filter((transaction) => transaction.sold).length;
      const notSoldItems = transactions.filter((transaction) => !transaction.sold).length;
      return { total: totalSalesAmount, soldItems, notSoldItems };
    })(),
    (async () => {
      const transactions = await Transaction.find({ dateOfSale: { $gte: start, $lt: end } });
      const priceRanges = [
        { range: '0-100', min: 0, max: 100 },
        { range: '101-200', min: 101, max: 200 },
        { range: '201-300', min: 201, max: 300 },
        { range: '301-400', min: 301, max: 400 },
        { range: '401-500', min: 401, max: 500 },
        { range: '501-600', min: 501, max: 600 },
        { range: '601-700', min: 601, max: 700 },
        { range: '701-800', min: 701, max: 800 },
        { range: '801-900', min: 801, max: 900 },
        { range: '901-above', min: 901, max: Infinity },
      ];
      return priceRanges.map((range) => ({
        _id: range.range,
        count: transactions.filter((transaction) => transaction.price >= range.min && transaction.price <= range.max).length,
      }));
    })(),
    (async () => {
      const transactions = await Transaction.find({ dateOfSale: { $gte: start, $lt: end } });
      const categories = transactions.reduce((acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + 1;
        return acc;
      }, {});
      return Object.keys(categories).map((category) => ({ _id: category, count: categories[category] }));
    })(),
  ]);
  res.json({ transactions, statistics, barChart, pieChart });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
