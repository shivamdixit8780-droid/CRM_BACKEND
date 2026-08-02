const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');


dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
const contactRoutes = require('./routes/contactRoutes');
app.use('/api/contacts', contactRoutes);
const leadRoutes = require('./routes/leadRoutes');
app.use('/api/leads', leadRoutes);
const customerRoutes = require('./routes/customerRoutes');
app.use('/api/customers', customerRoutes);
const followUpRoutes = require('./routes/followUpRoutes');
app.use('/api/followups', followUpRoutes);
const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);
const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);
const reportRoutes = require('./routes/reportRoutes');
app.use('/api/reports', reportRoutes);
const companySettingsRoutes = require('./routes/companySettingsRoutes');
app.use('/api/company-settings', companySettingsRoutes);
const loginHistoryRoutes = require('./routes/loginHistoryRoutes');
app.use('/api/login-history', loginHistoryRoutes);
const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);
const searchRoutes = require('./routes/searchRoutes');
app.use('/api/search', searchRoutes);

app.get('/', (req, res) => {
  res.send('CRM Backend is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});