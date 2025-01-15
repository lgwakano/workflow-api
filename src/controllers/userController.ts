import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/prisma';
import passport from 'passport';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Passport local use
export async function authenticate(username: string, password: string, done: any) {
  try {
    console.log("authenticate! ", username, password);

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
    return done(error);
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
    console.error('Error in Login:', error);
    next(error instanceof Error ? error.message : 'Unknown error occurred'); // Propagate error to error handler
    return res.status(500).json({ error: 'Internal server error' });
  }
};


// Get all users
const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
  try {
    const users = await prisma.user.findMany();
    return res.json(users);
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    next(error instanceof Error ? error.message : 'Unknown error occurred');
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user by ID
const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
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
    console.error(`Error in getUserById for id ${id}:`, error);
    next(error instanceof Error ? error.message : `Unknown error occurred for user with id ${id}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new user
const createUser = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
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
    console.error('Error in createUser:', error);
    next(error instanceof Error ? error.message : 'Unknown error occurred while creating user');
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Update an existing user
const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
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
    console.error('Error in updateUser:', error);
    next(error instanceof Error ? error.message : 'Unknown error occurred while updating user');
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a user
const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
  const { id } = req.params;

  try {
    await prisma.user.delete({
      where: { id: Number(id) },
    });

    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    next(error instanceof Error ? error.message : 'Unknown error occurred while deleting user');
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export { getAllUsers, getUserById, createUser, updateUser, deleteUser, login };
