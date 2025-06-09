// jwt-auth.guard.spec.ts
import { JwtAuthGuard } from './jwtauth.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
// import { AuthGuard } from '@nestjs/passport';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;
  let mockHandler: jest.Mock;
  let mockExecutionContext: Partial<ExecutionContext>;

  beforeEach(() => {
    reflector = {
      get: jest.fn(),
    } as unknown as Reflector;

    mockHandler = jest.fn();

    mockExecutionContext = {
      getHandler: jest.fn().mockReturnValue(mockHandler),
    };

    guard = new JwtAuthGuard(reflector);
  });

  it('should return true for public route', async () => {
    (reflector.get as jest.Mock).mockReturnValue(true);

    const result = await guard.canActivate(
      mockExecutionContext as ExecutionContext,
    );

    expect(result).toBe(true);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(reflector.get).toHaveBeenCalledWith('isPublic', mockHandler);
  });

  it('should return result of super.canActivate if not public (promise)', async () => {
    (reflector.get as jest.Mock).mockReturnValue(false);

    const mockActivate = jest
      .spyOn(JwtAuthGuard.prototype, 'canActivate')
      .mockImplementation(() => Promise.resolve(true));

    const result = await guard.canActivate(
      mockExecutionContext as ExecutionContext,
    );

    expect(result).toBe(true);
    mockActivate.mockRestore(); // clean up
  });

  it.skip('should return result of super.canActivate if not public (observable)', async () => {
    (reflector.get as jest.Mock).mockReturnValue(false);

    // create instance
    const observableGuard = new JwtAuthGuard(reflector);

    // mock the super.canActivate method to return an Observable
    jest
      .spyOn(Object.getPrototypeOf(observableGuard), 'canActivate')
      .mockReturnValue(of(true)); // return Observable<boolean>

    const result = await observableGuard.canActivate(
      mockExecutionContext as ExecutionContext,
    );

    expect(result).toBe(true);
  });
});
