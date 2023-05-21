import axios from "axios";
import { cache } from "./cache";

export const getAdminAccessToken = async () => {
  let token = cache.get("access_token");
  if (!token) {
    const body = {
      grant_type: "client_credentials",
      client_id: process.env.KEYCLOAK_CLIENT_ID ?? "",
      client_secret: process.env.KEYCLOAK_CLIENT_SECRET ?? "",
    };
    const url = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;
    const response = await axios.post(url, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    token = response.data.access_token;
    cache.set("access_token", token, 60 * 5);
  }
  return token;
};

export const getUserByEmail = async (email: string) => {
  try {
    const access_token = await getAdminAccessToken();

    const response = await axios.get(
      `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users?email=${email}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    const users = response.data;
    if (users.length > 0) {
      const userId = users[0].id;
      return userId;
    }
    return null; // User not found
  } catch (error) {
    console.error("Error retrieving user:", error);
    throw error;
  }
};
