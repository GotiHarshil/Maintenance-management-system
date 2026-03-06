const Asset = require("../models/Asset");

// POST /api/assets
const createAsset = async (req, res, next) => {
  try {
    const asset = await Asset.create({
      ...req.body,
      organizationId: req.user.organizationId,
    });
    res.status(201).json(asset);
  } catch (error) {
    next(error);
  }
};

// GET /api/assets
const getAssets = async (req, res, next) => {
  try {
    const { locationId, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (locationId) filter.locationId = locationId;
    if (status) filter.status = status;

    const assets = await Asset.find(filter)
      .populate("locationId", "name type")
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Asset.countDocuments(filter);

    res.json({
      assets,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/assets/:id
const getAssetById = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id).populate("locationId");
    if (!asset) return res.status(404).json({ message: "Asset not found" });
    res.json(asset);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/assets/:id
const updateAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!asset) return res.status(404).json({ message: "Asset not found" });
    res.json(asset);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/assets/:id (soft delete)
const deleteAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ message: "Asset not found" });

    asset.isDeleted = true;
    await asset.save();

    res.json({ message: "Asset deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createAsset, getAssets, getAssetById, updateAsset, deleteAsset };
