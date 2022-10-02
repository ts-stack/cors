module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>.+dist/.+'],
  projects: [ '<rootDir>/test/jest.config.ts'],
};
