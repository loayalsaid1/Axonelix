import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseError } from 'pg';

@Catch(DatabaseError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  catch(exception: DatabaseError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // Handle specific PostgreSQL error codes
    switch (exception.code) {
      case '23505': // unique_violation
        throw new ConflictException(
          this.getUniqueConstraintMessage(exception),
        );
      
      case '23503': // foreign_key_violation
        throw new BadRequestException(
          'Referenced resource does not exist',
        );
      
      case '23502': // not_null_violation
        throw new BadRequestException(
          `Required field '${exception.column}' cannot be null`,
        );
      
      case '23514': // check_violation
        throw new BadRequestException(
          'Data does not meet validation requirements',
        );
      
      default:
        // Let other database errors be handled by the global exception filter
        throw exception;
    }
  }

  private getUniqueConstraintMessage(exception: DatabaseError): string {
    // Extract a more meaningful message from the constraint error
    const detail = exception.detail || '';
    const constraintName = exception.constraint || '';

    // Try to parse the detail message for a cleaner error
    if (detail.includes('already exists')) {
      return detail.replace(/Key \((.*?)\)=/, 'A record with this $1');
    }

    if (constraintName) {
      return `Duplicate value violates unique constraint: ${constraintName}`;
    }

    return 'A record with this value already exists';
  }
}
