import { Router, Request, Response, response } from "express";
import prisma from "../../prisma";
import { body, validationResult } from "express-validator";
import registrationValidator from "../validators/registration-validator";
import resetPasswordValidator from "../validators/reset-password-validator";
import { getAdminAccessToken, getUserByEmail } from "../services/keycloak-admin";
import axios from "axios";
import { keycloakProtect } from "../middlewares/keycloakProtect";
import jwt from "jsonwebtoken";
import emailValidator from "@validators/email-exist-validator";

export const route = Router();

//keycloak rest-api register
route.post(
  "/register",
  registrationValidator,
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
      await axios.post(
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
route.post("/login", async (request: Request, response: Response) => {
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
route.post(
  "/logout",
  keycloakProtect,
  async (request: any, response: Response, next) => {
    const userInfo = request.userInfo;
    try {
      const accessToken = (await getAdminAccessToken()) ?? "";

      const revokeTokenUrl = `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users/${userInfo.sub}/logout`;
      const res = await axios.post(revokeTokenUrl, null, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (res.status === 204) {
        // Successful logout
        return response.sendStatus(204);
      } else {
        // Error occurred during logout
        return response.status(res.status).json(res.data);
      }
    } catch (error) {
      return response.json({ status: 500, error }).status(500);
    }
  }
);

// keycloak backend channel logout

route.post("/logout-event", (req, res) => {
  return res.status(200).json({ status: 200 });
});

// update password
route.post(
  "/set-password",
  keycloakProtect,
  async (request: any, response: Response) => {
    const { password } = request.body;
    const userInfo: any = request?.userInfo;

    const url = `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users/${userInfo.id}`;

    const token = await getAdminAccessToken();

    await axios.put(
      url,
      {
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
    return response.json({ status: 200 }).status(200);
  }
);

// forgot password
route.post("/forgot-password", (request: Request, response: Response) => {
  try {
    const expiresInHours = 24;
    const secretKey = "your_secret_key";
    const email = request.body;
    // check if email exist
    const token = jwt.sign({ email }, secretKey, {
      expiresIn: expiresInHours * 60 * 60,
    });

    const url = `${process.env.FRONTEND_URL}?token=${token}`;

    return response.json({ status: 200 }).status(200);
  } catch (error) {
    return response.json({ status: 500 }).status(400);
  }
});

// set new password
route.put(
  "/set-password",
  resetPasswordValidator,
  async (request: any, response: Response) => {
    try {
      const { password } = request.body;
      const token: any = request?.query.token;
      const secretKey = "your_secret_key";
      const decoded: any = jwt.verify(token, secretKey);
      const email = decoded?.email;
      const userId = await getUserByEmail(email);
      const url = `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users/${userId}`;

      const access_token = await getAdminAccessToken();

      await axios.put(
        url,
        {
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
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      return response.json({ status: 200 }).status(200);
    } catch (error) {
      return response.json({ status: 500 }).status(500);
    }
  }
);

// verify email
route.get("/verify-email", async (request: Request, response) => {
  const token = request.query.token;

  if (token) {
    return response.json({ status: 403, message: "token missing" }).status(403);
  }

  const userId = "";
  // token verification
  try {
    const accessToken = await getAdminAccessToken();

    await axios.put(
      `${process.env.KEYCLOAK_URL}/auth/admin/realms/{realm}/users/${userId}`,
      {
        emailVerified: true,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.json({ status: 200 }).status(200);
  } catch (error) {
    return response.json({ status: 500 }).status(500);
  }
});

// get token using refresh token
route.post("/token", async (request: Request, response: Response) => {
  const refresh_token = request.body.refresh_token;

  if (!refresh_token) {
    return response.sendStatus(403);
  }
  try {
    const url = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_CLIENT_ID}/protocol/openid-connect/token`;

    const { data } = await axios.post(
      url,
      {
        grant_type: "refresh_token",
        client_id: process.env.KEYCLOAK_CLIENT_ID ?? "",
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET ?? "",
        refresh_token,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    response.json({ data });
  } catch (error) {
    response.status(500).json({ error: 'Failed to refresh token' });
  }
});


route.post('/login/magiclink',emailValidator ,async (request:Request, response:Response) => {
  try {
    const email = request.body.email; 



    const kcresponse = await axios.post(
      `${process.env.KEYCLOAK_URL}/auth/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
      null,
      {
        params: {
          grant_type: 'password',
          client_id: process.env.KEYCLOAK_CLIENT_ID,
          username: email,
          password: 'magic-link',
        },
      }
    );

    // Check the response status and send the magic link via email
    if (kcresponse.status === 200) {
      const accessToken = kcresponse.data.access_token;

     const url =  `${process.env.FRONTEND_APP_URL}/login/magiclink?token=${accessToken}`;
      // send  email


    } else {
      return response.status(500).json({ error: 'Failed to send magic link email' });
    }
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'Failed to send magic link email' });
  }
});
