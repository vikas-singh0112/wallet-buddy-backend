import z from "zod";

export const signUpSchema = z.object({
  firstName: z.string().trim().min(3, "First name is required"),
  lastName: z.string().trim().min(3, "First name is required"),
  email: z.email("Invalid email format").trim(),
  phone: z
    .string()
    .trim()
    .min(7, "phone no must be at least 7 digits")
    .max(15, "phone no too big"),
  password: z.string().trim().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.email("Invalid email format").trim(),
  password: z.string().trim().min(8, "Password must be at least 8 characters"),
});
