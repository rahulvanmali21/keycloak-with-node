import axios from "axios";
import KeycloakAdminClient from "@keycloak/keycloak-admin-client";
export const getAdminAccessToken = async () => {
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
  return response.data.access_token;
};  
