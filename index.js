import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import "dotenv/config";
import "./database.js";
import { User } from "./models/index.js";
import jwt from "jsonwebtoken";

const app = express();
const port = process.env.PORT || 5003;

//to convert body into JSON
app.use(express.json());

// to allow cross origin request
app.use(
  cors({
    origin: ["http://localhost:5173", "https://e-commerce-website-project-1.netlify.app"], // Replace with your frontend's URL
    credentials: true, // Allow credentials
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// signup api
app.post("/api/v1/signup", async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      res.status(400).send({ message: "Parameters missing" });
      return;
    }

    const user = await User.findOne({ email: req.body.email });

    if (user) {
      res.status(400).send({ message: "Email already exist!" });
    }

    // paasword ko encrypte krnay k liye
    const encryptedPassword = await bcrypt.hash(req.body.password, 10);
    // console.log("encryptedPassword",encryptedPassword);

    const result = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: encryptedPassword,
    });

    res.status(201).send({ data: result, message: "Signup  successfully!" });
  } catch (error) {
    res.status(400).send("network error");
  }
}),
  // login api
  app.post("/api/v1/login", async (req, res) => {
    try {
      // const obj = {
      //   email: req.body.email,
      //   password: req.body.password,
      // };
      //  console.log("obfrgh",obj);

      const result = await User.findOne({ email: req.body.email });

      if (!result) {
        res.status(404).send({ data: result, message: "user not found!" });
        return;
      }

      // password ko bcrypt compare krnay k liye
      const match = await bcrypt.compare(req.body.password, result.password);

      if (!match) {
        res.status(400).send({ message: "password not matched!" });
        return;
      }
      const token = jwt.sign(
        {
          _id: result._id,
          email: result.email,
        },
        "SECRET@!@#$549583ufdf", // ye env ma save hoga
        { expiresIn: "7d" }
      );

      res
        .cookie("my-token", token, {
          expires: new Date(Date.now() + 86400000 * 7),
          secure: true,
          httpOnly: true,
        })
        .status(200)
        .send({ user: result, token: token, message: "Login Successfully" });
    } catch (error) {
      res.status(400).send(error.message);
    }

    // npm i jsonwebtoken
  });

// no route found api
app.use((req, res) => {
  res.status(404).send({ message: "no route found!" });
}),
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
