const db = require("../database/pg.database");

exports.createTransaction = async (transaction) => {
	try {
		const {rows} = await db.query(
			"INSERT INTO transactions (user_id, category_id, amount, description, date) VALUES ($1, $2, $3, $4, $5) RETURNING *",
			[
				transaction.user_id,
				transaction.category_id,
				transaction.amount,
				transaction.description,
				transaction.date,
			]
		);
		return rows[0];
	} catch (error) {
		throw error;
	}
};

exports.getTransactionsByUserId = async (userId, limit = 20, offset = 0) => {
	try {
		const {rows} = await db.query(
			`SELECT t.*, c.name as category_name, c.type as category_type 
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1
       ORDER BY t.date DESC
       LIMIT $2 OFFSET $3`,
			[userId, limit, offset]
		);
		return rows;
	} catch (error) {
		throw error;
	}
};

exports.getTransactionById = async (id) => {
	try {
		const {rows} = await db.query(
			`SELECT t.*, c.name as category_name, c.type as category_type
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.id = $1`,
			[id]
		);
		return rows[0];
	} catch (error) {
		throw error;
	}
};

exports.updateTransaction = async (id, transaction) => {
	try {
		const {rows} = await db.query(
			`UPDATE transactions 
       SET category_id = $1, amount = $2, description = $3, date = $4
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
			[
				transaction.category_id,
				transaction.amount,
				transaction.description,
				transaction.date,
				id,
				transaction.user_id,
			]
		);
		return rows[0];
	} catch (error) {
		throw error;
	}
};

exports.deleteTransaction = async (id, userId) => {
	try {
		await db.query(
			"DELETE FROM transactions WHERE id = $1 AND user_id = $2",
			[id, userId]
		);
		return true;
	} catch (error) {
		throw error;
	}
};

exports.getTransactionsByDateRange = async (userId, startDate, endDate) => {
	try {
		const {rows} = await db.query(
			`SELECT t.*, c.name as category_name, c.type as category_type
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1 AND t.date BETWEEN $2 AND $3
       ORDER BY t.date DESC`,
			[userId, startDate, endDate]
		);
		return rows;
	} catch (error) {
		throw error;
	}
};

exports.getTotalsByCategory = async (userId, startDate, endDate) => {
	try {
		const {rows} = await db.query(
			`SELECT c.id, c.name, c.type, SUM(t.amount) as total
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1 AND t.date BETWEEN $2 AND $3
       GROUP BY c.id, c.name, c.type
       ORDER BY c.type, total DESC`,
			[userId, startDate, endDate]
		);
		return rows;
	} catch (error) {
		throw error;
	}
};

exports.getMonthlyTotals = async (userId, year) => {
	try {
		const {rows} = await db.query(
			`SELECT 
         EXTRACT(MONTH FROM t.date) as month,
         c.type,
         SUM(t.amount) as total
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1 AND EXTRACT(YEAR FROM t.date) = $2
       GROUP BY EXTRACT(MONTH FROM t.date), c.type
       ORDER BY month, c.type`,
			[userId, year]
		);
		return rows;
	} catch (error) {
		throw error;
	}
};
