const router = require("express").Router();
const { protect } = require("../middleware/auth");
const { checkRole } = require("../middleware/rbac");
const {
  createWorkLog,
  getWorkLogsByTicket,
  getMyWorkLogs,
} = require("../controllers/workLogController");

router.use(protect);

router.post("/", checkRole("TECHNICIAN"), createWorkLog);
router.get("/my", checkRole("TECHNICIAN"), getMyWorkLogs);
router.get("/ticket/:ticketId", getWorkLogsByTicket);

module.exports = router;
