import { Request, Response, NextFunction } from "express";
import prisma from "../prisma/prisma";
import handlePrismaError from "../utils/errorHandling";

// Get all customers
const getAllCustomers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | undefined> => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy:{
        name:'asc',
      }
    });
    return res.json(customers);
  } catch (error) {
    handlePrismaError(
      error,
      {
        message: "Failed to fetch all customers.",
        record: "customer",
      },
      next
    );
  }
};

// Get customer by ID
const getCustomerById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | undefined> => {
  const { id } = req.params;

  try {
    const customer = await prisma.customer.findUnique({
      where: { id: Number(id) },
    });

    if (!customer) {
      const errorMessage = `Customer with id ${id} not found.`;
      console.warn(errorMessage);
      return res.status(404).json({ error: errorMessage });
    }

    return res.json(customer);
  } catch (error) {
    handlePrismaError(
      error,
      {
        message: `Failed to fetch customer with id ${id}.`,
        record: "customer",
      },
      next
    );
  }
};

// Create a new customer
const createCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | undefined> => {
  const { name, phone, email, address, contactName } = req.body;

  try {
    const newCustomer = await prisma.customer.create({
      data: {
        name,
        phone,
        email,
        address,
        contactName,
      },
    });

    return res.status(201).json(newCustomer);
  } catch (error) {
    handlePrismaError(
      error,
      { message: "Failed to create customer.", record: "customer" },
      next
    );
  }
};

// Update an existing customer
const updateCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | undefined> => {
  const { id } = req.params;

  try {
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: Number(id) },
    });

    if (!existingCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: Number(id) },
      data: { ...req.body }, // Only update fields provided in req.body
    });

    return res.json(updatedCustomer);
  } catch (error) {
    handlePrismaError(
      error,
      {
        message: `Failed to update customer with id ${id}.`,
        record: "customer",
      },
      next
    );
  }
};

// Delete a customer
const deleteCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | undefined> => {
  const { id } = req.params;

  try {
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: Number(id) },
    });

    if (!existingCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    await prisma.customer.delete({
      where: { id: Number(id) },
    });

    return res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    handlePrismaError(
      error,
      {
        message: `Failed to delete customer with id ${id}.`,
        record: "customer",
      },
      next
    );
  }
};

export {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
