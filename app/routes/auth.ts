import { Router, Request, Response } from "express";
import prisma from "../../prisma";
import { validationResult } from "express-validator";
import VALIDATOR from "../validators/registrationValidator";
import { getAdminAccessToken } from "../keycloak";
import axios from "axios";

export const authRoute = Router();

authRoute.post(
  "/register",
  VALIDATOR,
  async (request: Request, response: Response) => {
    try {
      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        // Validation failed
        return response.status(400).json({ errors: errors.array() });
      }

      const { body } = request;

      const { username, first_name, last_name, email, password } = body;

      // create user in keycloak

      const kc_response = await axios.post(
        `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users`,
        {
          username,
          email,
          enabled: true,
          credentials: [
            {
              type: "password",
              value: password,
              temporary: false,
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await getAdminAccessToken()}`,
          },
        }
      );

      // create user
      prisma.user.create({
        data: {
          username,
          first_name,
          last_name,
          email,
        },
      });

    } catch (error) {
      // handling error
      console.log(error);
    }
  }
);
