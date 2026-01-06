import request from "supertest";
import { describe, it, expect, beforeAll } from "vitest";
import { app } from "./server";

let teacherToken: string;
let studentToken: string;
let classId: string;
let studentId: string;
describe("Classroom Backend Exam", () => {
beforeAll(async () => {
const teacher = await request(app).post("/auth/signup").send({
name: "Teacher",
email: "teacher@test.com",
password: "password",
role: "teacher"
});
const student = await request(app).post("/auth/signup").send({
name: "Student",
email: "student@test.com",
password: "password",
role: "student"
});
studentId = student.body.data._id;
const teacherLogin = await request(app).post("/auth/login").send({
email: "teacher@test.com",
password: "password"
});
const studentLogin = await request(app).post("/auth/login").send({
email: "student@test.com",
password: "password"
});
teacherToken = teacherLogin.body.token;
studentToken = studentLogin.body.token;
});
it("Teacher can create class", async () => {
const res = await request(app)
.post("/class")
.set("Authorization", `Bearer ${teacherToken}`)
.send({ className: "Math" });
expect(res.status).toBe(201);
classId = res.body.data._id;
});
it("Teacher can add student", async () => {
const res = await request(app)
.post(`/class/${classId}/add-student`)
.set("Authorization", `Bearer ${teacherToken}`)
.send({ studentId });
expect(res.status).toBe(200);
expect(res.body.data.studentIds.length).toBe(1);
});
it("Student can view enrolled classes", async () => {
const res = await request(app)
.get("/student/classes")
.set("Authorization", `Bearer ${studentToken}`);
expect(res.status).toBe(200);
expect(res.body.data.length).toBe(1);
});
it("Teacher cannot add same student twice", async () => {
const res = await request(app)
.post(`/class/${classId}/add-student`)
.set("Authorization", `Bearer ${teacherToken}`)
.send({ studentId });
expect(res.body.data.studentIds.length).toBe(1);
});
});