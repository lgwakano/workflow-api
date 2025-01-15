// A utility to validate if the id is a valid number (for jobId, etc.)
export const validateId = (id: string): number | null => {
    const parsedId = parseInt(id, 10);
    return isNaN(parsedId) || parsedId <= 0 ? null : parsedId;
  };
  