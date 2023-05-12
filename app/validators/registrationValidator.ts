import { body } from "express-validator";
import prisma from "../../prisma";
const validator = [
  body("username")
    .not()
    .isEmpty()
    .withMessage("username is required")
    .custom(async (value) => {
      // Check if a user with the same username already exists
      const user = await prisma.user.findFirst({ where: { username: value } });
      if (user) {
        throw new Error("Email already exists");
      }
      return true;
    }),
  body("email", "Email is required")
    .isEmail()
    .custom(async (value) => {
      // Check if a user with the same email already exists
      const user = await prisma.user.findFirst({ where: { email: value } });
      if (user) {
        throw new Error("Email already exists");
      }
      return true;
    }),
  body("password")
    .not()
    .isEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 16 })
    .withMessage("Password is must be minimum 8 character")
    .custom((val, { req }) => {
      if (val !== req.body.confirm_password) {
        throw new Error("Passwords don't match");
      } else {
        return val;
      }
    }),
];
export default validator;
