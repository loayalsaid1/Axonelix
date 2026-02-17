import { Param, ParseIntPipe } from '@nestjs/common';

/**
 * Parameter decorator that extracts and parses 'id' from route params as an integer
 * Usage: findOne(@paramIntId() id: number)
 * Equivalent to: findOne(@Param('id', ParseIntPipe) id: number)
 */
export const paramIntId = () => Param('id', ParseIntPipe);
