import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/prisma';

// Get all customers
const getAllCustomers = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
  try {
    const customers = await prisma.customer.findMany();
    return res.json(customers);
  } catch (error) {
    console.error('Error in getAllCustomers:', error);
    next(error instanceof Error ? error.message : 'Unknown error occurred while retrieving customers');
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get customer by ID
const getCustomerById = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
  const { id } = req.params;

  try {
    const customer = await prisma.customer.findUnique({
      where: { id: Number(id) },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    return res.json(customer);
  } catch (error) {
    console.error(`Error in getCustomerById for id ${id}:`, error);
    next(error instanceof Error ? error.message : `Unknown error occurred for customer with id ${id}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new customer
const createCustomer = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
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
    console.error('Error in createCustomer:', error);
    next(error instanceof Error ? error.message : 'Unknown error occurred while creating customer');
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Update an existing customer
const updateCustomer = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
  const { id } = req.params;

  try {
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: Number(id) },
    });

    if (!existingCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: Number(id) },
      data: { ...req.body }, // Only update fields provided in req.body
    });

    return res.json(updatedCustomer);
  } catch (error) {
    console.error('Error in updateCustomer:', error);
    next(error instanceof Error ? error.message : 'Unknown error occurred while updating customer');
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a customer
const deleteCustomer = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
  const { id } = req.params;

  try {
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: Number(id) },
    });

    if (!existingCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    await prisma.customer.delete({
      where: { id: Number(id) },
    });

    return res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error in deleteCustomer:', error);
    next(error instanceof Error ? error.message : 'Unknown error occurred while deleting customer');
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export { getAllCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer };
