const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ Updated CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "https://spend-smart-frontend2-vmeq.vercel.app",
  process.env.FRONTEND_URL,
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ CORS blocked origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/expenses", require("./routes/expenses"));
app.use("/api/budgets", require("./routes/budgets"));

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/spendsmart";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(
      `🔗 Connection: ${MONGODB_URI.replace(/\/\/.*@/, "//***:***@")}`
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.log("\n💡 Troubleshooting:");
    console.log("   1. Make sure MongoDB service is running");
    console.log("   2. Check your MONGODB_URI in .env file");
    console.log("   3. Verify MongoDB is accessible on localhost:27017");
    process.exit(1);
  });

mongoose.connection.on("disconnected", () => {
  console.log("⚠️  MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB error:", err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
