import z from 'zod'
export const SignupSchema = z.object({
    name:z.string(),
    email:z.email(),
    password:z.string().min(6),
    role:z.enum(["teacher","student"])
})

export const LoginSchema = z.object({
    email:z.email(),
    password:z.string()
})

export const ClassSchema = z.object({
    className:z.string()
})

export const AddStudentSchema = z.object({
    studentId:z.string()
})