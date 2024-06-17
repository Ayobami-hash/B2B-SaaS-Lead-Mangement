require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const upload = multer({ dest: 'uploads/' });
// const dbConfig = require('./config/db.config');

const app = express();


// app.use(cors(corsOptions));
var allowlist = ['https://b2-b-saa-s-lead-mangement.vercel.app', 'http://localhost:3000']
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (allowlist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false } // disable CORS for this request
  }
  callback(null, corsOptions) // callback expects two parameters: error and options
}

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors(corsOptionsDelegate));
app.use(cookieParser()); 

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    console.log(MONGODB_URI);
  });

// Import and use routes
const companyRoutes = require('./routes/company.routes');
const leadRoutes = require('./routes/lead.routes');
const usersRouter = require('./routes/user.routes');
const csvRouter = require('./routes/uploadCSVRoute');



app.use('/api', csvRouter);
app.use('/api/companies', companyRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/users', usersRouter);


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

