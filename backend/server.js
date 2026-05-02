const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = 'warehouse_secret_key';

mongoose.connect('mongodb://127.0.0.1:27017/warehouse')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, enum: ['admin', 'customer'], default: 'customer' }
});

const ProductSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  cost: Number,
  discount: Number,
  stock: Number,
  barcode: String
});

const OrderSchema = new mongoose.Schema({
  customer: { id: String, name: String, email: String },
  items: [{ name: String, barcode: String, price: Number, qty: Number, total: Number }],
  totalAmount: Number,
  totalItems: Number,
  receiptNo: String,
  date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Product = mongoose.model('Product', ProductSchema);
const Order = mongoose.model('Order', OrderSchema);

const auth = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  next();
};

app.post('/api/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already exists' });
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, role: role || 'customer' });
  res.json({ message: 'User created', user: { name: user.name, email: user.email, role: user.role } });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'User not found' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: 'Wrong password' });
  const token = jwt.sign({ id: user._id, name: user.name, email: user.email, role: user.role }, SECRET, { expiresIn: '1d' });
  res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
});
app.get('/api/products/search', auth, async (req, res) => {
  const q = req.query.q || '';
  const products = await Product.find({
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { barcode: { $regex: q, $options: 'i' } }
    ]
  }).limit(10);
  res.json(products);
});

app.put('/api/orders/:id', auth, adminOnly, async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(order);
});

app.delete('/api/orders/:id', auth, adminOnly, async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ message: 'Order deleted' });
});


app.post('/api/change-password', auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);
  const match = await bcrypt.compare(oldPassword, user.password);
  if (!match) return res.status(400).json({ message: 'Old password is incorrect' });
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: 'Password changed successfully' });
});

app.post('/api/reset-password', auth, adminOnly, async (req, res) => {
  const { userId, newPassword } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: 'Password reset successfully' });
});

app.get('/api/customers/passwords', auth, adminOnly, async (req, res) => {
  const customers = await User.find({ role: 'customer' }).select('-__v');
  res.json(customers);
});

app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.post('/api/products', auth, adminOnly, async (req, res) => {
  const item = new Product(req.body);
  await item.save();
  res.json(item);
});

app.delete('/api/products/:id', auth, adminOnly, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

app.post('/api/orders', auth, async (req, res) => {
  const order = await Order.create(req.body);
  res.json(order);
});

app.get('/api/orders', auth, adminOnly, async (req, res) => {
  const orders = await Order.find().sort({ date: -1 });
  res.json(orders);
});

app.get('/api/orders/my', auth, async (req, res) => {
  const orders = await Order.find({ 'customer.id': req.user.id }).sort({ date: -1 });
  res.json(orders);
});

app.get('/api/customers', auth, adminOnly, async (req, res) => {
  const customers = await User.find({ role: 'customer' }).select('-password');
  res.json(customers);
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});