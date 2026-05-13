import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: '.',

    // Where to find tests
    testMatch: [
        '<rootDir>/tests/**/*.test.ts',
        '<rootDir>/tests/**/*.spec.ts',
    ],

    // Path aliases — mirrors tsconfig paths but rooted from /src
    moduleNameMapper: {
        '^@shared/(.*)$': '<rootDir>/src/shared/$1',
        '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    },

    // ts-jest config
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: {
                // Use src as rootDir so paths resolve correctly during tests
                rootDir: './src',
            },
        }],
    },

    // Setup file that runs once before all test suites
    globalSetup: '<rootDir>/tests/helpers/global-setup.ts',
    globalTeardown: '<rootDir>/tests/helpers/global-teardown.ts',

    setupFiles: ['<rootDir>/tests/helpers/setup-env.ts'],

    // Coverage
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/server.ts',
        '!src/shared/docs/**',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'clover'],

    // Timeouts — integration tests hitting real/in-memory DB can be slow
    testTimeout: 30000,

    // Run tests serially to avoid port/DB conflicts — use --runInBand CLI flag
    // (runInBand is a CLI flag, not a config key)

    verbose: true,
};

export default config;
