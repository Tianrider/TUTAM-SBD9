const userRepository = require("../repositories/user.repository");
const baseResponse = require("../utils/baseResponse");
const {compareHashedPassword} = require("../utils/passwordHashing");
const {generateToken} = require("../utils/jwt");

exports.register = async (req, res) => {
	try {
		const {username, email, password} = req.body;

		if (!username || !email || !password) {
			return baseResponse(
				res,
				false,
				400,
				"Missing required fields",
				null
			);
		}

		const existingEmail = await userRepository.getUserByEmail(email);
		if (existingEmail) {
			return baseResponse(res, false, 400, "Email already in use", null);
		}

		const existingUsername = await userRepository.getUserByUsername(
			username
		);
		if (existingUsername) {
			return baseResponse(
				res,
				false,
				400,
				"Username already in use",
				null
			);
		}

		const newUser = await userRepository.registerUser({
			username,
			email,
			password,
		});

		return baseResponse(
			res,
			true,
			201,
			"User registered successfully",
			newUser
		);
	} catch (error) {
		console.error("Registration error:", error);
		return baseResponse(res, false, 500, "Server error", null);
	}
};

exports.login = async (req, res) => {
	try {
		const {email, password} = req.body;

		if (!email || !password) {
			return baseResponse(
				res,
				false,
				400,
				"Missing email or password",
				null
			);
		}

		const user = await userRepository.getUserByEmail(email);
		if (!user) {
			return baseResponse(res, false, 401, "Invalid credentials", null);
		}

		const isPasswordValid = await compareHashedPassword(
			password,
			user.password_hash
		);
		if (!isPasswordValid) {
			return baseResponse(res, false, 401, "Invalid credentials", null);
		}

		const token = generateToken(user);
		const userData = {
			id: user.id,
			username: user.username,
			email: user.email,
		};

		return baseResponse(res, true, 200, "Login successful", {
			user: userData,
			token,
		});
	} catch (error) {
		console.error("Login error:", error);
		return baseResponse(res, false, 500, "Server error", null);
	}
};

exports.getProfile = async (req, res) => {
	try {
		const userId = req.user.id;

		const user = await userRepository.getUserById(userId);
		if (!user) {
			return baseResponse(res, false, 404, "User not found", null);
		}

		const userData = {
			id: user.id,
			username: user.username,
			email: user.email,
			created_at: user.created_at,
		};

		return baseResponse(
			res,
			true,
			200,
			"Profile retrieved successfully",
			userData
		);
	} catch (error) {
		console.error("Get profile error:", error);
		return baseResponse(res, false, 500, "Server error", null);
	}
};

exports.updateProfile = async (req, res) => {
	try {
		const userId = req.user.id;
		const updates = req.body;

		// Check if email is being updated and is already in use
		if (updates.email) {
			const existingUser = await userRepository.getUserByEmail(
				updates.email
			);
			if (existingUser && existingUser.id !== userId) {
				return baseResponse(
					res,
					false,
					400,
					"Email already in use",
					null
				);
			}
		}

		// Check if username is being updated and is already in use
		if (updates.username) {
			const existingUser = await userRepository.getUserByUsername(
				updates.username
			);
			if (existingUser && existingUser.id !== userId) {
				return baseResponse(
					res,
					false,
					400,
					"Username already in use",
					null
				);
			}
		}

		const updatedUser = await userRepository.updateUser(userId, updates);
		if (!updatedUser) {
			return baseResponse(res, false, 404, "User not found", null);
		}

		return baseResponse(
			res,
			true,
			200,
			"Profile updated successfully",
			updatedUser
		);
	} catch (error) {
		console.error("Update profile error:", error);
		return baseResponse(res, false, 500, "Server error", null);
	}
};

exports.deleteAccount = async (req, res) => {
	try {
		const userId = req.user.id;

		const success = await userRepository.deleteUser(userId);
		if (!success) {
			return baseResponse(res, false, 404, "User not found", null);
		}

		return baseResponse(
			res,
			true,
			200,
			"Account deleted successfully",
			null
		);
	} catch (error) {
		console.error("Delete account error:", error);
		return baseResponse(res, false, 500, "Server error", null);
	}
};

exports.validateToken = async (req, res) => {
	try {
		// If the request reaches here through the auth middleware, the token is valid
		return baseResponse(res, true, 200, "Token is valid", {
			user: {
				id: req.user.id,
				username: req.user.username,
				email: req.user.email,
			},
		});
	} catch (error) {
		console.error("Token validation error:", error);
		return baseResponse(res, false, 401, "Invalid token", null);
	}
};
