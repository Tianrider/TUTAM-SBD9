const {verifyToken} = require("../utils/jwt");
const baseResponse = require("../utils/baseResponse");

const authMiddleware = (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return baseResponse(res, false, 401, "No token provided", null);
		}

		const token = authHeader.split(" ")[1];
		const decoded = verifyToken(token);

		req.user = decoded;
		next();
	} catch (error) {
		return baseResponse(res, false, 401, "Invalid token", null);
	}
};

module.exports = authMiddleware;
