// import { Test, TestingModule } from '@nestjs/testing';
// import { JwtStrategy } from './jwt.strategy';
// import { UsersRepository } from './users.repository';
// import { ConfigService } from '@nestjs/config';

// describe('JwtStrategy', () => {
//   let jwtStrategy: JwtStrategy;
//   let usersRepository: UsersRepository;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         JwtStrategy,
//         {
//           provide: UsersRepository,
//           useValue: {
//             findOne: jest.fn(),
//           },
//         },
//         {
//           provide: ConfigService,
//           useValue: {
//             get: jest.fn().mockReturnValue('testSecret'),
//           },
//         },
//       ],
//     }).compile();

//     jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
//     usersRepository = module.get<UsersRepository>(UsersRepository);
//   });

//   it('should be defined', () => {
//     expect(jwtStrategy).toBeDefined();
//   });

//   describe('validate', () => {
//     it('should throw UnauthorizedException if user is not found', async () => {
//       jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);
//       const payload = { username: 'test' };

//       await expect(jwtStrategy.validate(payload)).rejects.toThrow('User not found');
//     });

//     it('should return the user if found', async () => {
//       const user = { username: 'test', role: 'user' };
//       jest.spyOn(usersRepository, 'findOne').mockResolvedValue(user);
//       const payload = { username: 'test' };

//       const result = await jwtStrategy.validate(payload);
//       expect(result).toEqual(user);
//     });
//   });
// });
