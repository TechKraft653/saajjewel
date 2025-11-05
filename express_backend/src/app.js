require("dotenv").config({ path: __dirname + "/../.env" });
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const offersRoutes = require("./routes/offers.routes");
const userRoutes = require("./routes/user.routes");
const productRoutes = require("./routes/product.routes");
const orderRoutes = require("./routes/order.routes");
const customerRoutes = require("./routes/customer.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const contactRoutes = require("./routes/contact.routes");

// Connect to MongoDB
let isMongoConnected = false;
connectDB().then(result => {
  isMongoConnected = result;
  if (!isMongoConnected) {
    console.log("WARNING: MongoDB not available. Some features may be limited.");
  }
});

const app = express();

// Configure CORS with more permissive settings for development
const replitDomain = process.env.REPLIT_DOMAINS 
  ? `https://${process.env.REPLIT_DOMAINS}` 
  : null;

const corsOrigins = [
  "http://localhost:3000", 
  "http://localhost:5000",
  "http://localhost:5173"
];

if (replitDomain) {
  corsOrigins.push(replitDomain);
}

const corsOrigin = process.env.CORS_ORIGIN || corsOrigins.join(",");
let corsOptions;
if (corsOrigin.includes(",")) {
  const whitelist = corsOrigin.split(",").map((s) => s.trim());
  corsOptions = {
    origin: function (origin, callback) {
      // allow requests with no origin like server-to-server or curl
      if (!origin) return callback(null, true);
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
  };
} else {
  corsOptions = { origin: corsOrigin, credentials: true, optionsSuccessStatus: 200 };
}

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Increase payload limit for image uploads
app.use(passport.initialize());

// Log Pinecone connection
console.log(
  `Pinecone API Key provided: ${!!process.env.PINECONE_API_KEY}`
);
console.log(
  `Connecting to Pinecone index: ${
    process.env.PINECONE_INDEX_NAME || "saajjewels-index"
  }`
);

// Mount OAuth routes at root level
// app.use("/", authRoutes); // Remove this duplicate mounting

// Mount other auth routes under /auth
app.use("/auth", authRoutes);

// Mount offers routes
app.use("/offers", offersRoutes);

// Mount order routes first (before user routes to avoid conflicts)
app.use("/api/orders", orderRoutes);
// Mount user routes (but not for /orders endpoint which conflicts)
app.use("/api/users", userRoutes);
app.use("/api", productRoutes);

// Mount contact routes
app.use("/api/contact", contactRoutes);

// Mount customer routes (admin only)
app.use("/api/admin/customers", customerRoutes);

// Mount analytics routes (admin only)
app.use("/api/admin/analytics", analyticsRoutes);

// Basic health check
app.get("/", (req, res) => res.json({ 
  status: "ok", 
  mongodb: isMongoConnected ? "connected" : "not available",
  message: isMongoConnected ? "All systems operational" : "Running in limited mode - MongoDB not available"
}));

// Simple test endpoint
app.get("/test", (req, res) => {
  console.log("Test endpoint called");
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    message: "Test endpoint working"
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on 0.0.0.0:${PORT}`));