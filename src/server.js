require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const authRoutes = require('./routes/auth');

app.use('/auth', authRoutes);

const tenantRoutes = require('./routes/tenant');
app.use('/tenant', tenantRoutes);

const poiRoutes = require('./routes/poi');
app.use('/poi', poiRoutes);

app.get('/', (req, res) => {
  res.send('Tenant SuperApp API is running');
});

app.listen(port, () => {
  console.log('Server is running on port ' + port);
});
