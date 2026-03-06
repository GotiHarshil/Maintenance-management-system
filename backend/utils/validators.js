const Joi = require("joi");

const ticketValidator = Joi.object({
  title: Joi.string().trim().max(200).required(),
  description: Joi.string().trim().max(2000).required(),
  category: Joi.string()
    .valid(
      "ELECTRICAL", "PLUMBING", "HVAC", "STRUCTURAL",
      "CLEANING", "IT_NETWORK", "FURNITURE", "SECURITY", "OTHER"
    )
    .required(),
  priority: Joi.string()
    .valid("LOW", "MEDIUM", "HIGH", "EMERGENCY")
    .default("MEDIUM"),
  locationId: Joi.string().required(),
  assetId: Joi.string().optional().allow(null, ""),
});

const estimateValidator = Joi.object({
  ticketId: Joi.string().required(),
  visitCost: Joi.number().min(0).default(0),
  laborCost: Joi.number().min(0).default(0),
  materialCost: Joi.number().min(0).default(0),
  otherCost: Joi.number().min(0).default(0),
  totalEstimatedCost: Joi.number().min(0).optional(),
  lineItems: Joi.array().items(
    Joi.object({
      description: Joi.string().required(),
      category: Joi.string().valid("VISIT", "LABOR", "MATERIAL", "OTHER").required(),
      quantity: Joi.number().min(0).default(1),
      unitCost: Joi.number().min(0).required(),
      totalCost: Joi.number().min(0).required(),
    })
  ).optional(),
});

const registerValidator = Joi.object({
  fullName: Joi.string().trim().max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(7).max(20).required(),
  password: Joi.string().min(8).required(),
  roleId: Joi.string().required(),
});

const loginValidator = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const statusUpdateValidator = Joi.object({
  newStatus: Joi.string().required(),
  reason: Joi.string().optional().allow(""),
  assignedTo: Joi.string().optional().allow(null, ""),
});

const workLogValidator = Joi.object({
  ticketId: Joi.string().required(),
  workDescription: Joi.string().trim().max(2000).required(),
  hoursWorked: Joi.number().min(0.25).required(),
  materialsUsed: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      quantity: Joi.number().min(0).required(),
      cost: Joi.number().min(0).required(),
    })
  ).default([]),
});

const locationValidator = Joi.object({
  name: Joi.string().trim().required(),
  type: Joi.string().valid("BUILDING", "FLOOR", "ROOM", "ZONE", "CAMPUS").required(),
  parentLocationId: Joi.string().optional().allow(null, ""),
  description: Joi.string().optional().allow(""),
});

const paymentValidator = Joi.object({
  invoiceId: Joi.string().required(),
  paymentMethod: Joi.string().valid("CASH", "CARD", "BANK_TRANSFER", "UPI", "CHEQUE").required(),
  transactionId: Joi.string().optional().allow(null, ""),
  amountPaid: Joi.number().min(0).required(),
  notes: Joi.string().optional().allow(""),
});

module.exports = {
  ticketValidator,
  estimateValidator,
  registerValidator,
  loginValidator,
  statusUpdateValidator,
  workLogValidator,
  locationValidator,
  paymentValidator,
};