import { body } from "express-validator";
import prisma from "../../prisma";


const validator = [
    body("email", "Email is required")
    .isEmail()
    .custom(async (value) => {
      // Check if a user with the same email already exists
      const user = await prisma.user.findFirst({ where: { email: value } });
      if (user) {
            return true;
      }
      throw new Error("Email doesnt exists");
    }),

];


export default validator;
