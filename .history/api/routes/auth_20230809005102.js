import { Router } from "express";
import { appFirebase, db, storage, auth } from "../routes/firebase.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import validateToken from "../models/authMiddleware.js";

dotenv.config();

const usersCollection = db.collection("Users");
const router = Router();

router.post("/register", async (req, res) => {
  console.log(req.body.email);
  console.log(req.body.password);

  try {
    const userCredential = await appFirebase
      .auth()
      .createUserWithEmailAndPassword(req.body.email, req.body.password);
    const user = userCredential.user;
    console.log(user.uid);

    const userData = {
      member_id: user.uid,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      dateOfBirth: req.body.dateOfBirth,
      status: req.body.status ?? 'active',
      statusUser: req.body.statusUser ?? 'USER',
      typePets: req.body.typePets ?? [],
      profilePicture: "",
      coverPicture: "",
      followings: [],
      followers: [],
    };

    // Remove undefined values from userData
    // const cleanedUserData = Object.fromEntries(
    //   Object.entries(userData).filter(([_, value]) => value !== undefined)
    // );

    const userRef = usersCollection.doc(user.uid);
    await userRef.set(userData);

    const token = jwt.sign({ userId: user.uid }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ userId: user.uid, token: token });
  } catch (error) {
    res.status(500).json(error);
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log("errorCode", errorCode);
    console.log("errorMessage", errorMessage);
    throw error;
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  // console.log("email", email);
  // console.log("password", password);
  try {
    const userCredential = await appFirebase
      .auth()
      .signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    console.log(`User ${user.uid}`);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate the JWT token
    const token = jwt.sign({ userId: user.uid }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ userId: user.uid, token: token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/loginFacebook", async (req, res) => {
  const { provider } = req.body;

  firebase
  .auth()
  .signInWithPopup(provider)
  .then((result) => {
    // Handle the authentication result
    if (result.credential) {
      // Do something with the credential if needed
    }

    const user = result.user;

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const token = jwt.sign({ userId: user.uid }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ userId: user.uid, token: token });
  }) .catch ((error) => {
    console.error("Facebook login error:", error);

    if (error.code === "auth/account-exists-with-different-credential") {
      return res.status(400).json({ error: "Account already exists with a different credential" });
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/logout", (req, res) => {
  appFirebase
    .auth()
    .signOut()
    .then(() => {
      res.status(200).json({ message: "Logout successful" });
    })
    .catch((error) => {
      res.status(500).json({ error: "Logout failed" });
    });
});

router.get("/protected", validateToken, (req, res) => {
  const userId = req.user.uid;
  console.log(`Accessing user with ID: ${userId}`);

  res.send(`Protected route accessed by user with ID: ${userId}`);
});

router.get("/test", async (req, res) => {
  res.send("user");
});

export default router;
