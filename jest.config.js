module.exports = {
  testEnvironment: "node",
  // setupFilesAfterEnv: ["<rootDir>/src/shared/tests/jest.setup.js"],
  globalTeardown: "<rootDir>/src/shared/tests/jest.teardown.js",
  globalSetup: "<rootDir>/src/shared/tests/jest.setup.js",
  testTimeout: 30000,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  maxWorkers: 1,

  moduleNameMapper: {
    "@src(.*)": "<rootDir>/src/$1",
    "@models": "<rootDir>/src/shared/database/models",
    "@utils/(.*)": "<rootDir>/src/shared/utils/$1",
    "@features/(.*)": "<rootDir>/src/features/$1",
  },
};
