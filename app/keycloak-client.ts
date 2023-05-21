import axios from "axios";
import jwksRsa from "jwks-rsa";
import jwt from "jsonwebtoken";
const tokenIssuer = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`;
const jwksUri = `${tokenIssuer}/protocol/openid-connect/certs`;

const client = jwksRsa({
  jwksUri,
});

export const verifyJWTOnline = (token: string) => {
  const url = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/userinfo`;
  return axios.get(url, {
    headers: {
      Authorization: token,
    },
  });
};

export const verifyJWTOffline = (token: string) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getKey, (err, decoded) => {
      if (err) reject(err);
      resolve(decoded);
    });
  });
};

function getKey(header: any, callback: (arg1: any, arg2: any) => any) {
  client.getSigningKey(header.kid, (err, key?: any) => {
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}
