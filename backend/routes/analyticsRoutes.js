const router = require("express").Router();
const { protect } = require("../middleware/auth");
const { checkPermission } = require("../middleware/rbac");
const { getDashboardStats } = require("../controllers/analyticsController");

router.use(protect);

router.get("/dashboard", checkPermission("VIEW_REPORTS"), getDashboardStats);

module.exports = router;
