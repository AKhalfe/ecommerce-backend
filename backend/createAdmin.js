const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/warehouse')
  .then(() => console.log('Connected'))
  .catch(err => console.log(err));

const User = mongoose.model('User', new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String
}));

async function createAdmin() {
  const hashed = await bcrypt.hash('admin123', 10);
  await User.create({
    name: 'Admin',
    email: 'admin@warehouse.com',
    password: hashed,
    role: 'admin'
  });
  console.log('Admin created successfully!');
  process.exit();
}

createAdmin();