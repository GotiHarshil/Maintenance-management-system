const router = require("express").Router();
const { protect } = require("../middleware/auth");
const { checkPermission, checkRole } = require("../middleware/rbac");
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getTechnicians,
} = require("../controllers/userController");

router.use(protect);

router.get("/", checkPermission("MANAGE_USERS"), getUsers);
router.get("/technicians", checkRole("ADMIN"), getTechnicians);
router.get("/:id", checkPermission("MANAGE_USERS"), getUserById);
router.patch("/:id", checkPermission("MANAGE_USERS"), updateUser);
router.delete("/:id", checkPermission("MANAGE_USERS"), deleteUser);

module.exports = router;
