/// <reference path="./types/global.d.ts" />

import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import session from "express-session";
import cors from 'cors'

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(
  session({
    secret: "your-session-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

interface User {
  id: number;
  username: string;
  password: string;
  permissions: string[];
}

const users: User[] = []; // This will act as our in-memory user store

const SECRET_KEY = "your-secret-key"; // Replace with your own secret key
const REFRESH_SECRET_KEY = "your-refresh-secret-key"; // Replace with your own refresh secret key

const generateAccessToken = (user: User) => {
  return jwt.sign(
    { userId: user.id, permissions: user.permissions },
    SECRET_KEY,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (user: User) => {
  return jwt.sign({ userId: user.id }, REFRESH_SECRET_KEY, { expiresIn: "7d" });
};

// Registration endpoint
app.post("/register", async (req: Request, res: Response) => {
  const { username, password, permissions } = req.body;

  if (!username || !password || !permissions) {
    return res
      .status(400)
      .send("Username, password, and permissions are required");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user: User = {
    id: users.length + 1,
    username,
    password: hashedPassword,
    permissions,
  };

  users.push(user);

  res.status(201).send("User registered");
});

// Login endpoint
app.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const user = users.find((u) => u.username === username);

  if (!user) {
    return res.status(400).send("Invalid username or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).send("Invalid username or password");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  req.session.refreshToken = refreshToken;

  res.send({ accessToken, refreshToken });
});

// Refresh token endpoint
app.post("/refresh-token", (req: Request, res: Response) => {
  const refreshToken = req.session.refreshToken;

  if (!refreshToken) {
    return res.status(401).send("Access denied. No refresh token provided.");
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET_KEY) as any;
    const user = users.find((u) => u.id === decoded.userId);

    if (!user) {
      return res.status(401).send("Invalid refresh token");
    }

    const accessToken = generateAccessToken(user);

    res.send({ accessToken });
  } catch (ex) {
    res.status(400).send("Invalid refresh token");
  }
});

// Authentication middleware
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).send("Access denied. No token provided.");
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as any;
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).send("Invalid token");
  }
};

// Authorization middleware
const authorize = (permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userPermissions = req.user.permissions;
    const hasPermission = permissions.every((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).send("Forbidden");
    }

    next();
  };
};

// Protected route example
app.get(
  "/protected",
  authMiddleware,
  authorize(["read"]),
  (req: Request, res: Response) => {
    res.send("This is a protected route");
  }
);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
