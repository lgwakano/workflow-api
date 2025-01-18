import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/prisma';
import handlePrismaError from "../utils/errorHandling";
import passport from 'passport';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Passport local use
export async function authenticate(username: string, password: string, done: any) {
  try {
    //console.log("authenticate! ", username, password);

    const user = await prisma.user.findFirst({
      where: {
        username: username,
      },
    });

    if (!user) {
      return done(null, false, { message: "Incorrect username" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return done(null, false, { message: "Incorrect password" });
    }
    return done(null, user);
  } catch (error) {
    handlePrismaError(error, { message: "Failed to authenticate user.", record: "user" }, done);
  }
}

// Login controller
const login = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
  try {
    passport.authenticate('local', async (err: any, user: any, info: any) => {
      if (err) { 
        return next(err); // Pass the error to the next middleware
      }
      if (!user) { 
        return res.status(401).json({ message: info.message }); // User not found
      }

      // Generate JWT (consider moving the secret key to an environment variable)
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET as string,
        { expiresIn: '1h' }
      );

      // Return the login response with the token
      return res.json({ message: "Login successful", user, token });
    })(req, res, next); // Explicitly pass the request, response, and next to authenticate
  } catch (error) {
    handlePrismaError(
      error,
      { message: "Failed on login.", record: "login" },
      next
    );
    return undefined;
  }
};


// Get all users
const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
  try {
    const users = await prisma.user.findMany();
    return res.json(users);
  } catch (error) {
    handlePrismaError(
      error,
      { message: "Failed to fetch all users.", record: "user" },
      next
    );
  }
};

// Get user by ID
const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    handlePrismaError(
      error,
      { message: `Failed to fetch User with id ${id}.`, record: "user" },
      next
    );
  }
};

// Create a new user
const createUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        ...req.body,
        password: hashedPassword,
      },
    });

    return res.status(201).json(newUser);
  } catch (error) {
    handlePrismaError(
      error,
      { message: `Failed to create user.`, record: "user" },
      next
    );
  }
};

// Update an existing user
const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
  const { id } = req.params;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: { ...req.body }, // Only update fields provided in req.body
    });

    return res.json(updatedUser);
  } catch (error) {
    handlePrismaError(
      error,
      { message: `Failed to update user.`, record: "user" },
      next
    );
  }
};

// Delete a user
const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
  const { id } = req.params;

  try {
    await prisma.user.delete({
      where: { id: Number(id) },
    });

    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    handlePrismaError(
      error,
      { message: `Failed to delete user.`, record: "user" },
      next
    );
  }
};

export { getAllUsers, getUserById, createUser, updateUser, deleteUser, login };
