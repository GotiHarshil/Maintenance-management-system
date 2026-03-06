const User = require("../models/User");
const Role = require("../models/Role");

// GET /api/users
const getUsers = async (req, res, next) => {
  try {
    const { role, isActive, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (role) {
      const roleDoc = await Role.findOne({ name: role });
      if (roleDoc) filter.roleId = roleDoc._id;
    }
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const users = await User.find(filter)
      .populate("roleId", "name permissions")
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("roleId", "name permissions")
      .select("-passwordHash");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/users/:id
const updateUser = async (req, res, next) => {
  try {
    const { fullName, phone, isActive, roleId, profileImage } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (isActive !== undefined) user.isActive = isActive;
    if (roleId) user.roleId = roleId;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    const updated = await User.findById(user._id)
      .populate("roleId", "name permissions")
      .select("-passwordHash");

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/:id (soft delete)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isDeleted = true;
    user.deletedAt = new Date();
    user.isActive = false;
    await user.save();

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/technicians (for assignment dropdown)
const getTechnicians = async (req, res, next) => {
  try {
    const techRole = await Role.findOne({ name: "TECHNICIAN" });
    if (!techRole) return res.json([]);

    const technicians = await User.find({
      roleId: techRole._id,
      isActive: true,
    }).select("fullName email phone");

    res.json(technicians);
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getUserById, updateUser, deleteUser, getTechnicians };
