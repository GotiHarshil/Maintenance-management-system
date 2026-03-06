const router = require("express").Router();
const { protect } = require("../middleware/auth");
const { checkPermission } = require("../middleware/rbac");
const {
  generateInvoice,
  getInvoices,
  getInvoiceById,
} = require("../controllers/invoiceController");

router.use(protect);

router.post("/", checkPermission("GENERATE_INVOICE"), generateInvoice);
router.get("/", checkPermission("VIEW_REPORTS"), getInvoices);
router.get("/:id", getInvoiceById);

module.exports = router;
