/**
 * @author John Waweru
 * @license Livinggoods Copyright 2018
 *
 * This is just a loader for lib/jest.config.ts
 */

module.exports = {
    verbose: true,
    clearMocks: true,
    bail: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['html'],
    globals: {
        '__DEV__': true
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    notify: true,
    notifyMode: 'failure-change',
    roots: [
        '<rootDir>',
    ],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/coverage/',
        '<rootDir>/dist/',
        '<rootDir>/out/',
        '<rootDir>/lib/',
    ],
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts$',
    timers: 'fake',
    globals: {
        'ts-jest': {
            diagnostics: false
        }
    }
}
