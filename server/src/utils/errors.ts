export class AppError extends Error {
  constructor(public statusCode: number, message: string, public code = 'APP_ERROR') { super(message); }
}
export class NotFoundError extends AppError {
  constructor(resource: string, id: string) { super(404, `${resource} not found: ${id}`, 'NOT_FOUND'); }
}
export class ValidationError extends AppError {
  constructor(message: string) { super(400, message, 'VALIDATION_ERROR'); }
}
