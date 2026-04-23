const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/warehouse')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const ProductSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  discount: Number,
  stock: Number,
  barcode: String
});

const Product = mongoose.model('Product', ProductSchema);

app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.post('/api/products', async (req, res) => {
  const item = new Product(req.body);
  await item.save();
  res.json(item);
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});