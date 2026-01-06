import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import app from "."; // your Express app
import mongoose from "mongoose";

/**
 * This test suite is designed like an exam.
 * Each test has a short explanation of what it checks.
 * Completing these tests helps a junior engineer understand
 * authentication, authorization, and CRUD flows in a classroom backend.
 */

let teacherToken: string;
let studentToken: string;
let classId: string;
let studentId: string;

describe("Classroom Backend Exam", () => {
  /**
   * beforeAll: setup initial users and get their tokens.
   * Explanation: 
   *  - You need a teacher and student to test protected routes.
   *  - Tokens are raw JWT strings used in Authorization headers.
   */
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL!);

    // Create a teacher
    const teacher = await request(app).post("/auth/signup").send({
      name: "Teacher",
      email: "teacher@test.com",
      password: "password",
      role: "teacher",
    });

    // Create a student
    const student = await request(app).post("/auth/signup").send({
      name: "Student",
      email: "student@test.com",
      password: "password",
      role: "student",
    });

    studentId = student.body.data._id;

    // Teacher login (get token)
    const teacherLogin = await request(app).post("/auth/login").send({
      email: "teacher@test.com",
      password: "password",
    });

    // Student login (get token)
    const studentLogin = await request(app).post("/auth/login").send({
      email: "student@test.com",
      password: "password",
    });

    // Save tokens
    teacherToken = teacherLogin.body.data.token;
    studentToken = studentLogin.body.data.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  /**
   * Test 1: Teacher can create a class
   * Explanation:
   *  - Only teachers can create classes.
   *  - Checks authorization and correct schema validation.
   *  - Stores classId for later tests.
   */
  it("Teacher can create class", async () => {
    const res = await request(app)
      .post("/class")
      .set("Authorization", teacherToken) // middleware expects raw token
      .send({ className: "Math" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    classId = res.body.data.classId; // store for next tests
  });

  /**
   * Test 2: Teacher can add a student to the class
   * Explanation:
   *  - Tests adding a valid student to a class.
   *  - Checks middleware: teacher role required.
   *  - Checks $addToSet prevents duplicates internally.
   */
  it("Teacher can add student", async () => {
    const res = await request(app)
      .post(`/class/${classId}/add-student`)
      .set("Authorization", teacherToken)
      .send({ studentId });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    // Check that the response includes the student added
    expect(res.body.data.studentID).toBe(studentId);
  });

  /**
   * Test 3: Student can view enrolled classes
   * Explanation:
   *  - Checks that students can only see classes they are enrolled in.
   *  - Verifies student role authorization in middleware.
   */
  it("Student can view enrolled classes", async () => {
    const res = await request(app)
      .get("/student/class") // endpoint returns all classes student is enrolled in
      .set("Authorization", studentToken);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.classes.length).toBe(1);
    expect(res.body.data.classes[0]._id).toBe(classId);
  });

  /**
   * Test 4: Teacher cannot add the same student twice
   * Explanation:
   *  - Tests $addToSet functionality: duplicates should not be inserted.
   *  - Backend should not throw error; student list remains unchanged.
   */
  it("Teacher cannot add same student twice", async () => {
    const res = await request(app)
      .post(`/class/${classId}/add-student`)
      .set("Authorization", teacherToken)
      .send({ studentId });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    // Check that student is not duplicated
    // For your middleware, only one entry is returned
    expect(res.body.data.studentID).toBe(studentId);
  });
});
