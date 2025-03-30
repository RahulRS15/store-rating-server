const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "thetaskisbeinginprocess";

// ------------- Register user
exports.registerUser = async (req, res) => {
  const { name, email, address, password,role } = req.body;
  console.log(req.body);
  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    //------hash password here--------
    const salt = await bcrypt.genSalt(10);
    const pass = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      address,
      password: pass,
      role
    });

    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message:"User added Successfully!!"
    });
  } catch (error) {
    res.status(500).json({ message: "Server error",error });
  }
};

// ---------- Login user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: "false",
        error: "Please try to login with correct credentials",
      });
    }

    const passCompare = await bcrypt.compare(password, user.password);
    if (!passCompare) {
      return res
        .status(400)
        .json({
          success: "false",
          error: "Please try to login with correct credentials",
        });
    }


    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
