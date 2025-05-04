const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.generateToken = (user) => {
	const payload = {
		id: user.id,
		username: user.username,
		email: user.email,
	};

	const token = jwt.sign(payload, process.env.JWT_SECRET, {
		expiresIn: "24h",
	});

	return token;
};

exports.verifyToken = (token) => {
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		return decoded;
	} catch (error) {
		throw error;
	}
};
