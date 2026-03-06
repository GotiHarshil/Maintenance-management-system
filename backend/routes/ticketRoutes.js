const router = require("express").Router();
const { protect } = require("../middleware/auth");
const { checkPermission, checkRole } = require("../middleware/rbac");
const {
  createTicket,
  getTickets,
  getTicketById,
  updateTicketStatus,
  getTicketHistory,
  deleteTicket,
} = require("../controllers/ticketController");

router.use(protect);

router.post("/", checkPermission("CREATE_TICKET"), createTicket);
router.get("/", getTickets);
router.get("/:id", getTicketById);
router.patch("/:id/status", updateTicketStatus);
router.get("/:id/history", getTicketHistory);
router.delete("/:id", checkRole("ADMIN"), deleteTicket);

module.exports = router;
