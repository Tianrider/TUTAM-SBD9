const db = require("../database/pg.database");
const {hashPassword} = require("../utils/passwordHashing");

exports.registerUser = async (user) => {
	try {
		const hashedPassword = await hashPassword(user.password);
		const {rows} = await db.query(
			"INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at",
			[user.username, user.email, hashedPassword]
		);
		return rows[0];
	} catch (error) {
		throw error;
	}
};

exports.getUserByEmail = async (email) => {
	try {
		const {rows} = await db.query("SELECT * FROM users WHERE email = $1", [
			email,
		]);
		return rows[0];
	} catch (error) {
		throw error;
	}
};

exports.getUserByUsername = async (username) => {
	try {
		const {rows} = await db.query(
			"SELECT * FROM users WHERE username = $1",
			[username]
		);
		return rows[0];
	} catch (error) {
		throw error;
	}
};

exports.getUserById = async (id) => {
	try {
		const {rows} = await db.query("SELECT * FROM users WHERE id = $1", [
			id,
		]);
		return rows[0];
	} catch (error) {
		throw error;
	}
};

exports.updateUser = async (id, user) => {
	try {
		let updateQuery = "UPDATE users SET ";
		const values = [];
		let paramCount = 1;

		if (user.username) {
			updateQuery += `username = $${paramCount}, `;
			values.push(user.username);
			paramCount++;
		}

		if (user.email) {
			updateQuery += `email = $${paramCount}, `;
			values.push(user.email);
			paramCount++;
		}

		if (user.password) {
			const hashedPassword = await hashPassword(user.password);
			updateQuery += `password_hash = $${paramCount}, `;
			values.push(hashedPassword);
			paramCount++;
		}

		// Remove trailing comma and space
		updateQuery = updateQuery.slice(0, -2);

		updateQuery += ` WHERE id = $${paramCount} RETURNING id, username, email, created_at`;
		values.push(id);

		const {rows} = await db.query(updateQuery, values);
		return rows[0];
	} catch (error) {
		throw error;
	}
};

exports.deleteUser = async (id) => {
	try {
		await db.query("DELETE FROM users WHERE id = $1", [id]);
		return true;
	} catch (error) {
		throw error;
	}
};
