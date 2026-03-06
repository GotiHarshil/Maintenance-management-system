const router = require("express").Router();
const { protect } = require("../middleware/auth");
const { checkPermission } = require("../middleware/rbac");
const {
  createAsset,
  getAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
} = require("../controllers/assetController");

router.use(protect);

router.post("/", checkPermission("MANAGE_ASSETS"), createAsset);
router.get("/", getAssets);
router.get("/:id", getAssetById);
router.patch("/:id", checkPermission("MANAGE_ASSETS"), updateAsset);
router.delete("/:id", checkPermission("MANAGE_ASSETS"), deleteAsset);

module.exports = router;
