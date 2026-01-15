import z from "zod";

const yearRejex = /^\d{4}$/;

const createTransactionSchema = z.object({
  amount: z
    .number()
    .positive()
    .refine(
      (amt) => Number(amt.toFixed(2)) === amt,
      "Amount must have at most 2 decimal places"
    ),
  description: z.string().min(1).trim().toLowerCase(),
  type: z.enum(["INCOME", "EXPENSE"]),
  categoryName: z.string().min(3).trim().toLowerCase(),
});

const getTransactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  month: z
    .string()
    .optional()
    .refine(
      (val) => !val || (Number(val) >= 1 && Number(val) <= 12),
      "enter a valid month"
    )
    .transform((val) => (val ? Number(val) : undefined)),
  year: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{4}$/.test(val), {
      message: "Year must be a 4-digit number",
    })
    .transform((val) => (val ? Number(val) : undefined)),

  categoryName: z.string().toLowerCase().optional(),
});
export { createTransactionSchema, getTransactionSchema };
