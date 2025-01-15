import express from "express";
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customerController";

const router = express.Router();

// Customer Routes
router.get("/", getAllCustomers); // Fetch all customers
router.get("/:id", getCustomerById); // Fetch a single customer by ID
router.post("/", createCustomer); // Create a new customer
router.put("/:id", updateCustomer); // Update a customer by ID
router.delete("/:id", deleteCustomer); // Delete a customer by ID

export default router;
