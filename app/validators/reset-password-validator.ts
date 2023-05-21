import { body } from "express-validator";


const validator =[
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
]

export default validator;
