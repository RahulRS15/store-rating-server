const jwt = require('jsonwebtoken');
const User = require('../model/User');
const JWT_SECRET = "thetaskisbeinginprocess";

const protect = async (req, res, next) => {
  const token = req.header('auth-token');

  if (!token) {
    return res.status(401).json({ error: "Please authenticate using a valid token" });
  }

  try {
    const decodedUser = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decodedUser.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ error: "User not found" });
    }

    next(); // ✅ Only called when authentication succeeds
  } catch (error) {
    return res.status(401).json({ error: 'Not authorized, token failed' });
  }
};

module.exports = { protect };
