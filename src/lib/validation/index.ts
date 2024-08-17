import { z } from 'zod'

export const RegValidation = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters long"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const LoginValidation = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
})

export const PostValidation = z.object({
  topic: z.string().min(1, "Topic is required").max(100, "Too many characters"),
  content: z.string().min(1, "Content is required").max(150, "Too many characters"),
  location: z.string().min(1, "Location is required").max(100, "Too many characters")
})

export const CommentValidation = z.object({
  content: z.string().min(1, "Content is required").max(100, "Too many characters"),
})