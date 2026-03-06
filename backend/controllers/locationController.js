const Location = require("../models/Location");
const { locationValidator } = require("../utils/validators");

// POST /api/locations
const createLocation = async (req, res, next) => {
  try {
    const { error } = locationValidator.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const location = await Location.create({
      ...req.body,
      organizationId: req.user.organizationId,
    });

    res.status(201).json(location);
  } catch (error) {
    next(error);
  }
};

// GET /api/locations
const getLocations = async (req, res, next) => {
  try {
    const { type, parentLocationId } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (parentLocationId) filter.parentLocationId = parentLocationId;

    const locations = await Location.find(filter)
      .populate("parentLocationId", "name type")
      .sort({ name: 1 });

    res.json(locations);
  } catch (error) {
    next(error);
  }
};

// GET /api/locations/tree (hierarchical)
const getLocationTree = async (req, res, next) => {
  try {
    const locations = await Location.find({ isDeleted: false }).lean();

    // Build tree structure
    const map = {};
    locations.forEach((loc) => {
      map[loc._id] = { ...loc, children: [] };
    });

    const tree = [];
    locations.forEach((loc) => {
      if (loc.parentLocationId && map[loc.parentLocationId]) {
        map[loc.parentLocationId].children.push(map[loc._id]);
      } else {
        tree.push(map[loc._id]);
      }
    });

    res.json(tree);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/locations/:id
const updateLocation = async (req, res, next) => {
  try {
    const location = await Location.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!location) return res.status(404).json({ message: "Location not found" });

    res.json(location);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/locations/:id (soft delete)
const deleteLocation = async (req, res, next) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) return res.status(404).json({ message: "Location not found" });

    location.isDeleted = true;
    await location.save();

    res.json({ message: "Location deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createLocation, getLocations, getLocationTree, updateLocation, deleteLocation };
