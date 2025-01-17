import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

// Type for valid error codes
type ErrorCode = "P2002" | "P2003" | "P2025" | "default" | "general" | "unknown";

// Centralized error messages
const errorMessages: Record<ErrorCode, (param: string) => string> = {
  P2002: (record: string) => `A ${record} with the same details already exists. Please use unique values.`,
  P2003: (record: string) =>`Cannot delete the ${record} as it is referenced by another record. Please remove dependent records first.`,
  P2025: (record: string) => `The ${record} you are trying to delete does not exist.`,
  default: (method: string) => `Failed to process the ${method} request. Please verify the input data and try again.`,
  general: () => "An unexpected error occurred. Please try again later.",
  unknown: () => "An unknown error occurred. Please contact support if the problem persists.",
};

const handlePrismaError = (
  error: any,
  { message, record }: { message: string; record: string },
  next: Function
) => {
  const methodName = message.includes("create")
    ? "create"
    : message.includes("update")
    ? "update"
    : "request"; // Simplified method detection

  // Default dynamic message
  let dynamicMessage = message || errorMessages.default(methodName);

  // Handle Prisma-specific errors
  if (error instanceof PrismaClientKnownRequestError) {
    console.error("Prisma error:", error.code, error.message);

    const errorCode = error.code as ErrorCode; // Cast to specific error code type
    // If the errorCode exists in the errorMessages, use it
    if (errorMessages[errorCode]) {
      dynamicMessage = errorMessages[errorCode](record || "record");
    } else {
      // If the error code is unknown, use the unknown error message format
      dynamicMessage = errorMessages["unknown"](record || "record");
    }
  }
  // Handle other JavaScript errors
  else if (error instanceof Error) {
    console.error("General error:", error.stack);
    dynamicMessage = message || errorMessages.general(record || "record");
  }
  // Handle unknown errors
  else {
    console.error("Unknown error:", error);
    dynamicMessage = message || errorMessages.unknown(record || "record");
  }

  next(new Error(dynamicMessage)); // Pass the error message to the next middleware
};

export default handlePrismaError;
