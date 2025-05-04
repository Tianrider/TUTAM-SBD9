const categoryRepository = require("../repositories/category.repository");
const baseResponse = require("../utils/baseResponse");

exports.createCategory = async (req, res) => {
	try {
		const userId = req.user.id;
		const {name, type} = req.body;

		if (!name || !type) {
			return baseResponse(
				res,
				false,
				400,
				"Missing required fields",
				null
			);
		}

		if (type !== "income" && type !== "expense") {
			return baseResponse(
				res,
				false,
				400,
				"Type must be either 'income' or 'expense'",
				null
			);
		}

		const newCategory = await categoryRepository.createCategory({
			user_id: userId,
			name,
			type,
		});

		return baseResponse(
			res,
			true,
			201,
			"Category created successfully",
			newCategory
		);
	} catch (error) {
		console.error("Create category error:", error);
		return baseResponse(res, false, 500, "Server error", null);
	}
};

exports.getCategories = async (req, res) => {
	try {
		const userId = req.user.id;
		const {type} = req.query;

		let categories;
		if (type) {
			if (type !== "income" && type !== "expense") {
				return baseResponse(
					res,
					false,
					400,
					"Type must be either 'income' or 'expense'",
					null
				);
			}
			categories = await categoryRepository.getCategoriesByType(
				userId,
				type
			);
		} else {
			categories = await categoryRepository.getCategoriesByUserId(userId);
		}

		return baseResponse(
			res,
			true,
			200,
			"Categories retrieved successfully",
			categories
		);
	} catch (error) {
		console.error("Get categories error:", error);
		return baseResponse(res, false, 500, "Server error", null);
	}
};

exports.getCategoryById = async (req, res) => {
	try {
		const userId = req.user.id;
		const categoryId = req.params.id;

		const category = await categoryRepository.getCategoryById(categoryId);

		if (!category) {
			return baseResponse(res, false, 404, "Category not found", null);
		}

		if (category.user_id !== userId) {
			return baseResponse(
				res,
				false,
				403,
				"Not authorized to access this category",
				null
			);
		}

		return baseResponse(
			res,
			true,
			200,
			"Category retrieved successfully",
			category
		);
	} catch (error) {
		console.error("Get category error:", error);
		return baseResponse(res, false, 500, "Server error", null);
	}
};

exports.updateCategory = async (req, res) => {
	try {
		const userId = req.user.id;
		const categoryId = req.params.id;
		const {name, type} = req.body;

		if (!name && !type) {
			return baseResponse(res, false, 400, "No fields to update", null);
		}

		if (type && type !== "income" && type !== "expense") {
			return baseResponse(
				res,
				false,
				400,
				"Type must be either 'income' or 'expense'",
				null
			);
		}

		const category = await categoryRepository.getCategoryById(categoryId);

		if (!category) {
			return baseResponse(res, false, 404, "Category not found", null);
		}

		if (category.user_id !== userId) {
			return baseResponse(
				res,
				false,
				403,
				"Not authorized to update this category",
				null
			);
		}

		const updatedCategory = await categoryRepository.updateCategory(
			categoryId,
			{
				name: name || category.name,
				type: type || category.type,
				user_id: userId,
			}
		);

		return baseResponse(
			res,
			true,
			200,
			"Category updated successfully",
			updatedCategory
		);
	} catch (error) {
		console.error("Update category error:", error);
		return baseResponse(res, false, 500, "Server error", null);
	}
};

exports.deleteCategory = async (req, res) => {
	try {
		const userId = req.user.id;
		const categoryId = req.params.id;
		const category = await categoryRepository.getCategoryById(categoryId);

		if (!category) {
			return baseResponse(res, false, 404, "Category not found", null);
		}

		if (category.user_id !== userId) {
			return baseResponse(
				res,
				false,
				403,
				"Not authorized to delete this category",
				null
			);
		}

		await categoryRepository.deleteCategory(categoryId, userId);

		return baseResponse(
			res,
			true,
			200,
			"Category deleted successfully",
			null
		);
	} catch (error) {
		console.error("Delete category error:", error);
		return baseResponse(res, false, 500, "Server error", null);
	}
};
