const Store = require("../model/Store");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "thetaskisbeinginprocess";

// -------------- Create a new store --------------------
//TODO: add role - store owner
exports.createStore = async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    // Check if the store already exists
    let store = await Store.findOne({ email });
    if (store) {
      return res.status(400).json({ message: "Store already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new store
    const storeOwner = new Store({
      name,
      email,
      password: hashedPassword,
      address,
    });

    await storeOwner.save();
    const token = jwt.sign(
      { id: storeOwner._id, role: "storeOwner" },
      JWT_SECRET
    );
    res.status(201).json({
      token,
      storeOwner,
      message:"Store added Successfully!!"
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

// --------- login store owner -------------
exports.loginStoreOwner = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  try {
    const storeOwner = await Store.findOne({ email });
    
    if (!storeOwner) {
      return res.status(400).json({
        success: "false",
        error: "Please try to login with correct credentials",
      });
    }
    
    const passCompare = await bcrypt.compare(password, storeOwner.password);
    if (!passCompare) {
      return res.status(400).json({
        success: "false",
        error: "Please try to login with correct credentials",
      });
    }

    const storeOwnerData = await Store.findOne({ email }).populate("ratings.user", "name").select('-password');
    const token = jwt.sign({ id: storeOwner._id }, JWT_SECRET);

    res.json({
      token,
      user: {
        id: storeOwner._id,
        role: storeOwner.role,
      },
      storeOwnerData
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// --------------- Get all stores --------------------
exports.getStores = async (req, res) => {
  try {
    const stores = await Store.find({}).populate("ratings.user", "name").select('-password');
    // console.log(stores);
    res.status(201).json(stores);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// --------------- Submit a rating ------------------
exports.submitRating = async (req, res) => {
  const { storeId } = req.params;
  const score = req.body.score;
  const userId = req.user._id; // coming after token verified from protected middleware

  try {
    const store = await Store.findById(storeId);

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    const existingRating = store.ratings.find(
      (r) => r.user.toString() === userId.toString()
    );

    if (existingRating) {
      return res.status(400).json({
        message:
          "You have already rated this store. Please modify your rating instead.",
      });
    }

    store.ratings.push({ user: userId, score });
    await store.save();

    res.json({
      message: "Rating submitted successfully!",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ------------ Modify a rating
exports.modifyRating = async (req, res) => {
  const { storeId } = req.params;
  const score = req.body.score;
  const userId = req.user._id;

  try {
    const store = await Store.findById(storeId);

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    const ratingIndex = store.ratings.findIndex(
      (r) => r.user.toString() === userId.toString()
    );

    if (ratingIndex === -1) {
      return res.status(400).json({
        message:
          "You have not rated this store yet. Please submit a rating first.",
      });
    }

    store.ratings[ratingIndex] = { user: userId, score };
    await store.save();

    res.json({
      message: "Rating updated successfully!",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
