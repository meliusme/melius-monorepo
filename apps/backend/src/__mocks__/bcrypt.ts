// Manual Jest mock for bcrypt — avoids native binary requirement in test env.
// Each test that needs specific bcrypt behaviour should override these with jest.fn()

const bcrypt = {
  hash: jest.fn(async (data: string, _rounds: number) => `hashed:${data}`),
  compare: jest.fn(async (data: string, hashed: string) => hashed === `hashed:${data}`),
  genSalt: jest.fn(async () => 'salt'),
};

module.exports = bcrypt;
