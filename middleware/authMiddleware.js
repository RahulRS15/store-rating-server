const jwt = require('jsonwebtoken');
const User = require('../model/User');
const JWT_SECRET = "thetaskisbeinginprocess";

const protect = async (req, res, next) => {
   const token = req.header('auth-token');

    if (!token) {
        res.status(401).send({ error: "Please authenticate using a valid token" });
    }

    try {
      const decodedUser = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decodedUser.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ error,message: 'Not authorized, token failed' });
    }

//   console.log("iutput ",req.header);

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
