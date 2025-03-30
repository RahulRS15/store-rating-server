const Store = require("../model/Store");
const User = require("../model/User");

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude password
        const stores = await Store.find(); // No need to exclude password if it's not in schema

        res.status(200).json({ users, stores }); // Return as separate objects
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
