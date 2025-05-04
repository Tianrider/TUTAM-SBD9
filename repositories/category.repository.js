const db = require("../database/pg.database");

exports.createCategory = async (category) => {
	try {
		const {rows} = await db.query(
			"INSERT INTO categories (user_id, name, type) VALUES ($1, $2, $3) RETURNING *",
			[category.user_id, category.name, category.type]
		);
		return rows[0];
	} catch (error) {
		throw error;
	}
};

exports.getCategoriesByUserId = async (userId) => {
	try {
		const {rows} = await db.query(
			"SELECT * FROM categories WHERE user_id = $1 ORDER BY name",
			[userId]
		);
		return rows;
	} catch (error) {
		throw error;
	}
};

exports.getCategoryById = async (id) => {
	try {
		const {rows} = await db.query(
			"SELECT * FROM categories WHERE id = $1",
			[id]
		);
		return rows[0];
	} catch (error) {
		throw error;
	}
};

exports.updateCategory = async (id, category) => {
	try {
		const {rows} = await db.query(
			"UPDATE categories SET name = $1, type = $2 WHERE id = $3 AND user_id = $4 RETURNING *",
			[category.name, category.type, id, category.user_id]
		);
		return rows[0];
	} catch (error) {
		throw error;
	}
};

exports.deleteCategory = async (id, userId) => {
	try {
		await db.query(
			"DELETE FROM categories WHERE id = $1 AND user_id = $2",
			[id, userId]
		);
		return true;
	} catch (error) {
		throw error;
	}
};

exports.getCategoriesByType = async (userId, type) => {
	try {
		const {rows} = await db.query(
			"SELECT * FROM categories WHERE user_id = $1 AND type = $2 ORDER BY name",
			[userId, type]
		);
		return rows;
	} catch (error) {
		throw error;
	}
};
