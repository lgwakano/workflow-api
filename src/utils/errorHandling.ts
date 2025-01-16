import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// Type for valid error codes
type ErrorCode = 'P2002' | 'P2003' | 'default' | 'general' | 'unknown';

// Centralized error messages
const errorMessages: Record<ErrorCode, (param: string) => string> = {
  P2002: (record: string) => `A ${record} with the same details already exists.`,
  P2003: (record: string) => `Invalid foreign key reference for ${record}.`,
  default: (method: string) => `Failed to process the ${method} request. Please verify the input data.`,
  general: () => 'An unexpected error occurred. Please try again later.',
  unknown: () => 'An unknown error occurred. Please try again later.'
};

const handlePrismaError = (error: any, { message, record }: { message: string, record: string }, next: Function) => {
  const methodName = message.includes('create') ? 'create' : message.includes('update') ? 'update' : 'request'; // Simplified method detection

  // Default dynamic message
  let dynamicMessage = message || errorMessages.default(methodName);

  // Handle Prisma-specific errors
  if (error instanceof PrismaClientKnownRequestError) {
    console.error('Prisma error:', error.code, error.message);
    
    const errorCode = error.code as ErrorCode; // Cast to specific error code type
    dynamicMessage = errorMessages[errorCode](record || 'record');
  }
  // Handle other JavaScript errors
  else if (error instanceof Error) {
    console.error('General error:', error.stack);
    dynamicMessage = message || errorMessages.general(record || 'record');
  }
  // Handle unknown errors
  else {
    console.error('Unknown error:', error);
    dynamicMessage = message || errorMessages.unknown(record || 'record');
  }

  next(new Error(dynamicMessage));  // Pass the error message to the next middleware
};

export default handlePrismaError;

  
