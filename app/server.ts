import express, { Express } from "express";

import dotenv from "dotenv";
import { route as authRoute } from "./routes/auth";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/auth", authRoute);

app.listen(port, () => {
  console.log(
    `⚡️[server]: Server is running at http://localhost:${port} \n\n`
  );
});
