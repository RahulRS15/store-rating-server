const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const storeRoutes = require('./routes/store');
const adminRoutes = require('./routes/admin');
const connectDB = require('./db');

connectDB();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

// Routes
app.use('/auth', authRoutes);
app.use('/store', storeRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
