const transactionRepository = require("../repositories/transaction.repository");
const categoryRepository = require("../repositories/category.repository");
const baseResponse = require("../utils/baseResponse");

exports.createTransaction = async (req, res) => {
	try {
		const userId = req.user.id;
		const {category_id, amount, description, date} = req.body;

		if (!category_id || !amount || !date) {
			return baseResponse(
				res,
				false,
				400,
				"Missing required fields",
				null
			);
		}

		if (amount <= 0) {
			return baseResponse(
				res,
				false,
				400,
				"Amount must be greater than 0",
				null
			);
		}

		// Verify category exists and belongs to user
		const category = await categoryRepository.getCategoryById(category_id);
		if (!category) {
			return baseResponse(res, false, 404, "Category not found", null);
		}

		if (category.user_id !== userId) {
			return baseResponse(
				res,
				false,
				403,
				"Not authorized to use this category",
				null
			);
		}

		const newTransaction = await transactionRepository.createTransaction({
			user_id: userId,
			category_id,
			amount,
			description: description || null,
			date,
		});

		return baseResponse(
			res,
			true,
			201,
			"Transaction created successfully",
			newTransaction
		);
	} catch (error) {
		console.error("Create transaction error:", error);
		return baseResponse(res, false, 500, "Server error", null);
	}
};

exports.getTransactions = async (req, res) => {
	try {
		const userId = req.user.id;
		const {limit, offset, start_date, end_date} = req.query;

		let transactions;

		if (start_date && end_date) {
			transactions =
				await transactionRepository.getTransactionsByDateRange(
					userId,
					start_date,
					end_date
				);
		} else {
			const limitVal = limit ? parseInt(limit) : 20;
			const offsetVal = offset ? parseInt(offset) : 0;

			transactions = await transactionRepository.getTransactionsByUserId(
				userId,
				limitVal,
				offsetVal
			);
		}

		return baseResponse(
			res,
			true,
			200,
			"Transactions retrieved successfully",
			transactions
		);
	} catch (error) {
		console.error("Get transactions error:", error);
		return baseResponse(res, false, 500, "Server error", null);
	}
};

exports.getTransactionById = async (req, res) => {
	try {
		const userId = req.user.id;
		const transactionId = req.params.id;

		const transaction = await transactionRepository.getTransactionById(
			transactionId
		);

		if (!transaction) {
			return baseResponse(res, false, 404, "Transaction not found", null);
		}

		if (transaction.user_id !== userId) {
			return baseResponse(
				res,
				false,
				403,
				"Not authorized to access this transaction",
				null
			);
		}

		return baseResponse(
			res,
			true,
			200,
			"Transaction retrieved successfully",
			transaction
		);
	} catch (error) {
		console.error("Get transaction error:", error);
		return baseResponse(res, false, 500, "Server error", null);
	}
};

exports.updateTransaction = async (req, res) => {
	try {
		const userId = req.user.id;
		const transactionId = req.params.id;
		const {category_id, amount, description, date} = req.body;

		if (!category_id && !amount && !description && !date) {
			return baseResponse(res, false, 400, "No fields to update", null);
		}

		if (amount && amount <= 0) {
			return baseResponse(
				res,
				false,
				400,
				"Amount must be greater than 0",
				null
			);
		}

		const transaction = await transactionRepository.getTransactionById(
			transactionId
		);

		if (!transaction) {
			return baseResponse(res, false, 404, "Transaction not found", null);
		}

		if (transaction.user_id !== userId) {
			return baseResponse(
				res,
				false,
				403,
				"Not authorized to update this transaction",
				null
			);
		}

		// If category is being updated, verify it belongs to user
		if (category_id && category_id !== transaction.category_id) {
			const category = await categoryRepository.getCategoryById(
				category_id
			);
			if (!category) {
				return baseResponse(
					res,
					false,
					404,
					"Category not found",
					null
				);
			}

			if (category.user_id !== userId) {
				return baseResponse(
					res,
					false,
					403,
					"Not authorized to use this category",
					null
				);
			}
		}

		const updatedTransaction =
			await transactionRepository.updateTransaction(transactionId, {
				user_id: userId,
				category_id: category_id || transaction.category_id,
				amount: amount || transaction.amount,
				description:
					description !== undefined
						? description
						: transaction.description,
				date: date || transaction.date,
			});

		return baseResponse(
			res,
			true,
			200,
			"Transaction updated successfully",
			updatedTransaction
		);
	} catch (error) {
		console.error("Update transaction error:", error);
		return baseResponse(res, false, 500, "Server error", null);
	}
};

exports.deleteTransaction = async (req, res) => {
	try {
		const userId = req.user.id;
		const transactionId = req.params.id;

		const transaction = await transactionRepository.getTransactionById(
			transactionId
		);

		if (!transaction) {
			return baseResponse(res, false, 404, "Transaction not found", null);
		}

		if (transaction.user_id !== userId) {
			return baseResponse(
				res,
				false,
				403,
				"Not authorized to delete this transaction",
				null
			);
		}

		await transactionRepository.deleteTransaction(transactionId, userId);

		return baseResponse(
			res,
			true,
			200,
			"Transaction deleted successfully",
			null
		);
	} catch (error) {
		console.error("Delete transaction error:", error);
		return baseResponse(res, false, 500, "Server error", null);
	}
};

exports.getTotalsByCategory = async (req, res) => {
	try {
		const userId = req.user.id;
		const {start_date, end_date} = req.query;

		if (!start_date || !end_date) {
			return baseResponse(
				res,
				false,
				400,
				"Start date and end date are required",
				null
			);
		}

		const totals = await transactionRepository.getTotalsByCategory(
			userId,
			start_date,
			end_date
		);

		return baseResponse(
			res,
			true,
			200,
			"Category totals retrieved successfully",
			totals
		);
	} catch (error) {
		console.error("Get category totals error:", error);
		return baseResponse(res, false, 500, "Server error", null);
	}
};

exports.getMonthlyTotals = async (req, res) => {
	try {
		const userId = req.user.id;
		const {year} = req.query;

		if (!year) {
			return baseResponse(
				res,
				false,
				400,
				"Year parameter is required",
				null
			);
		}

		const totals = await transactionRepository.getMonthlyTotals(
			userId,
			year
		);

		// Transform the result to a more usable format
		const monthlyData = Array(12)
			.fill()
			.map((_, i) => ({
				month: i + 1,
				income: 0,
				expense: 0,
			}));

		totals.forEach((item) => {
			const monthIndex = parseInt(item.month) - 1;
			if (item.type === "income") {
				monthlyData[monthIndex].income = parseFloat(item.total);
			} else if (item.type === "expense") {
				monthlyData[monthIndex].expense = parseFloat(item.total);
			}
		});

		return baseResponse(
			res,
			true,
			200,
			"Monthly totals retrieved successfully",
			monthlyData
		);
	} catch (error) {
		console.error("Get monthly totals error:", error);
		return baseResponse(res, false, 500, "Server error", null);
	}
};
