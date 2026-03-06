const router = require("express").Router();
const { protect } = require("../middleware/auth");
const { checkPermission, checkRole } = require("../middleware/rbac");
const {
  createEstimate,
  getEstimatesByTicket,
  approveEstimate,
  rejectEstimate,
} = require("../controllers/estimateController");

router.use(protect);

router.post("/", checkPermission("SUBMIT_ESTIMATE"), createEstimate);
router.get("/ticket/:ticketId", getEstimatesByTicket);
router.patch("/:id/approve", checkPermission("APPROVE_ESTIMATE"), approveEstimate);
router.patch("/:id/reject", checkPermission("REJECT_ESTIMATE"), rejectEstimate);

module.exports = router;
