const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const razorpayRoutes = require('./razorpayRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api/razorpay', razorpayRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on 0.0.0.0:${PORT}`);
});