import { Reflector } from '@nestjs/core';
import { Role } from '../enums';

/** Declare which roles are allowed to access a route or controller. */
export const Roles = Reflector.createDecorator<Role[]>();
