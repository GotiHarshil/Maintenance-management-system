const router = require("express").Router();
const { protect } = require("../middleware/auth");
const { checkPermission } = require("../middleware/rbac");
const {
  recordPayment,
  getPaymentsByInvoice,
} = require("../controllers/paymentController");

router.use(protect);

router.post("/", checkPermission("RECORD_PAYMENT"), recordPayment);
router.get("/invoice/:invoiceId", getPaymentsByInvoice);

module.exports = router;
