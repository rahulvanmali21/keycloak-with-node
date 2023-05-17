import { Router, Request, Response, response } from "express";
import prisma from "../../prisma";
import { validationResult } from "express-validator";
import VALIDATOR from "../validators/registrationValidator";
import { getAdminAccessToken } from "../keycloak-admin";
import axios from "axios";
import { verifyJWT } from "../keycloak-client";

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
      const token = await getAdminAccessToken();

      const url = `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users`;
      const kc_response = await axios.post(
        url,
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
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // create user
      await prisma.user.create({
        data: {
          username,
          first_name,
          last_name,
          email,
        },
      });

      return response.status(201).json({ msg: "success" });
    } catch (error: any) {
      // handling error
      return response.send(error);
    }
  }
);

//keycloak rest-api login
authRoute.post("/login", async (request: Request, response: Response) => {
  const { email, password } = request.body;
  const url = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_CLIENT_ID}/protocol/openid-connect/token`;

  try {
    const kc_response = await axios.post(
      url,
      {
        grant_type: "password",
        client_id: process.env.KEYCLOAK_CLIENT_ID ?? "",
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET ?? "",
        username: email,
        password: password,
      },
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    return response.json(kc_response.data).status(200);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return response.status(401).json({ message: "invalid credentials" });
    }
    return response.status(500).json({ error });
  }
});

// keycloak rest-api logout
authRoute.post("/logout", async (request: Request, response: Response) => {
  const accessToken = request.headers.authorization;
  if (!accessToken) {
    return response.json({status:400}).status(400);
  }
  try {
    const revokeTokenUrl = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/logout`;
    await axios.post(revokeTokenUrl, null, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.json({status:200}).status(200);

  } catch (error) {
    return response.json({status:500,error}).status(500);
  }
});

