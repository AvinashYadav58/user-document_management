// roles.guard.spec.ts
import { RolesGuard } from './roles.gaurd';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockContext = {
    switchToHttp: () => ({
      getRequest: () => ({
        user: { role: 'admin' },
      }),
    }),
    getHandler: jest.fn(),
  } as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = {
      get: jest.fn(),
    } as unknown as Reflector;

    guard = new RolesGuard(reflector);
  });

  it('should return true if route is public', () => {
    (reflector.get as jest.Mock).mockReturnValue(true);
    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should return true if no roles are required', () => {
    (reflector.get as jest.Mock).mockReturnValueOnce(false); // isPublic = false
    (reflector.get as jest.Mock).mockReturnValueOnce(undefined); // no roles set
    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should return true if user has one of the required roles', () => {
    (reflector.get as jest.Mock).mockReturnValueOnce(false); // isPublic = false
    (reflector.get as jest.Mock).mockReturnValueOnce(['admin']); // requiredRoles = ['admin']
    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should return false if user does not have the required role', () => {
    const contextWithUser = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: 'user' },
        }),
      }),
      getHandler: jest.fn(),
    } as unknown as ExecutionContext;

    (reflector.get as jest.Mock).mockReturnValueOnce(false); // isPublic = false
    (reflector.get as jest.Mock).mockReturnValueOnce(['admin']); // requiredRoles = ['admin']
    const result = guard.canActivate(contextWithUser);
    expect(result).toBe(false);
  });

  it('should return false if no user is attached to request', () => {
    const contextWithNoUser = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
      getHandler: jest.fn(),
    } as unknown as ExecutionContext;

    (reflector.get as jest.Mock).mockReturnValueOnce(false); // isPublic = false
    (reflector.get as jest.Mock).mockReturnValueOnce(['admin']); // requiredRoles = ['admin']
    const result = guard.canActivate(contextWithNoUser);
    expect(result).toBe(false);
  });
});
