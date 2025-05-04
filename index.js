require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Import routes
const userRoute = require("./routes/user.route");
const categoryRoute = require("./routes/category.route");
const transactionRoute = require("./routes/transaction.route");

// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
	origin: "*"
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	credentials: true,
	allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Normalize URL paths to prevent double-slash issues
app.use((req, res, next) => {
	if (req.path.length > 1 && req.path.indexOf("//") !== -1) {
		const normalizedPath = req.path.replace(/\/+/g, "/");
		return res.redirect(
			301,
			normalizedPath +
				(req.url.includes("?")
					? req.url.substring(req.url.indexOf("?"))
					: "")
		);
	}
	next();
});

// Health check endpoint
app.get("/health", async (req, res) => {
	const db = require("./database/pg.database");

	// Check database connection
	const isDatabaseHealthy = await checkDatabaseHealth(db);

	const health = {
		uptime: process.uptime(),
		timestamp: Date.now(),
		services: {
			database: isDatabaseHealthy,
		},
	};

	res.status(isDatabaseHealthy ? 200 : 503).json(health);
});

// API routes
app.use("/api/users", userRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/transactions", transactionRoute);

// Root route
app.get("/", (req, res) => {
	res.send("Expense Tracker API is running");
});

// Database health check
async function checkDatabaseHealth(db) {
	try {
		const result = await db.query("SELECT 1");
		return result && result.rows && result.rows.length > 0;
	} catch (error) {
		console.error("Database health check failed:", error);
		return false;
	}
}

// Start server
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
