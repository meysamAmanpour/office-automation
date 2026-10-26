import Joi from "joi"

export const validateLettersReport = Joi.object({
  search: Joi.string().allow("").optional(),

  companyId: Joi.string().allow("").optional(),

  departmentId: Joi.string().allow("").optional(),

  type: Joi.string().valid("INCOMING", "OUTGOING", "INTERNAL").optional(),

  status: Joi.string().valid("DRAFT", "SENT").optional(),

  priority: Joi.string().valid("LOW", "NORMAL", "HIGH", "URGENT").optional(),

  dateFrom: Joi.date().optional(),

  dateTo: Joi.date().optional(),

  page: Joi.number().integer().min(1).default(1),

  limit: Joi.number().integer().min(1).max(100).default(10),
})
