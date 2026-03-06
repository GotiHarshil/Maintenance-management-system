const router = require("express").Router();
const { protect } = require("../middleware/auth");
const { checkPermission } = require("../middleware/rbac");
const {
  createLocation,
  getLocations,
  getLocationTree,
  updateLocation,
  deleteLocation,
} = require("../controllers/locationController");

router.use(protect);

router.post("/", checkPermission("MANAGE_LOCATIONS"), createLocation);
router.get("/", getLocations);
router.get("/tree", getLocationTree);
router.patch("/:id", checkPermission("MANAGE_LOCATIONS"), updateLocation);
router.delete("/:id", checkPermission("MANAGE_LOCATIONS"), deleteLocation);

module.exports = router;
