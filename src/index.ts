import express, { Express, Request, Response } from "express";
import { PORT } from "./secrets";
import rootRouter from "./routes";
import { PrismaClient } from "@prisma/client";
import { errorMiddleware } from "./middlewares/errors";
import { SignUpSchema } from "./schema/users";
const cors = require("cors");

const app: Express = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Working");
});

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000", // Allow this origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
    credentials: true, // Allow cookies if needed
  })
);

app.use("/api", rootRouter);

export const prismaClient = new PrismaClient({
  log: ["query"],
}).$extends({
  query: {
    user: {
      create({ args, query }) {
        args.data = SignUpSchema.parse(args.data);
        return query(args);
      },
    },
  },
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log("App working");
});
