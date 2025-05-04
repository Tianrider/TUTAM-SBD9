require("dotenv").config();
const {Pool} = require("pg");

const pool = new Pool({
	connectionString: process.env.PG_CONNECTION_STRING,
});

const connect = async () => {
	try {
		await pool.connect();
		console.log("Connected to database");
	} catch (error) {
		console.error("Failed to connect to database", error);
	}
};

connect();

const query = async (query, values) => {
	try {
		const res = await pool.query(query, values);
		return res;
	} catch (error) {
		console.error("Failed to query", error);
		throw error;
	}
};

module.exports = {
	query,
};
