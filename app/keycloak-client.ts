import axios from "axios";

export const verifyJWT =  (token: string) => {
    console.log(token)
    const url = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/userinfo`;
    return axios.get(url, {
      headers: {
        Authorization: token,
      },
    });
};
