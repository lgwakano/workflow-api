import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "./config/passport";
import userRoutes from "./routes/userRoutes";
import customerRoutes from "./routes/customerRoute";
import jobRoutes from "./routes/jobRoute";
import jobQuestionAnswerRoute from "./routes/jobQuestionAnswerRoute";
import questionRoute from "./routes/questionRoute";

const app = express();
const corsOptions = require("cors");

app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Allow requests from specific origins
app.use(
  corsOptions({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define Routes
app.use("/customers", customerRoutes);
app.use("/users", userRoutes);
app.use("/questions", questionRoute);
app.use("/jobs", jobRoutes); // Centralize all job-related routes under the /jobs base path

app.listen(3001, () => {
  //TODO: port should be a env variable
  console.log("App listening on port 3001");
});
