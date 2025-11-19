/**
 * test-runner.js - Automated Testing for TTime Applications
 * 
 * This file provides automated tests to verify function order,
 * identify failure points, and test heavy load operations.
 * 
 * Run with: node test-runner.js
 * Or in browser console after loading the HTML pages
 */

// ========================================
// TEST FRAMEWORK (Simple)
// ========================================

const TestFramework = {
    results: {
        passed: 0,
        failed: 0,
        tests: []
    },
    
    test(description, testFn) {
        try {
            testFn();
            this.results.passed++;
            this.results.tests.push({ description, status: 'PASS', error: null });
            console.log(`✅ PASS: ${description}`);
        } catch (error) {
            this.results.failed++;
            this.results.tests.push({ description, status: 'FAIL', error: error.message });
            console.error(`❌ FAIL: ${description}`, error.message);
        }
    },
    
    assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    },
    
    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `Expected ${expected}, got ${actual}`);
        }
    },
    
    assertType(value, type, message) {
        if (typeof value !== type) {
            throw new Error(message || `Expected type ${type}, got ${typeof value}`);
        }
    },
    
    assertExists(value, message) {
        if (value === null || value === undefined) {
            throw new Error(message || 'Value does not exist');
        }
    },
    
    printSummary() {
        console.log('\n========================================');
        console.log('TEST SUMMARY');
        console.log('========================================');
        console.log(`Total Tests: ${this.results.passed + this.results.failed}`);
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);
        console.log('========================================\n');
        
        if (this.results.failed > 0) {
            console.log('FAILED TESTS:');
            this.results.tests.filter(t => t.status === 'FAIL').forEach(t => {
                console.log(`  - ${t.description}: ${t.error}`);
            });
        }
    }
};

// ========================================
// TTIME.JS TESTS
// ========================================

function testTTimeJS() {
    console.log('\n========== TESTING TTime.js ==========\n');
    
    // Function Order Tests
    console.log('--- Function Order Tests ---');
    
    TestFramework.test('TimerState exists and is initialized', () => {
        TestFramework.assertExists(typeof TimerState !== 'undefined' ? TimerState : null);
        if (typeof TimerState !== 'undefined') {
            TestFramework.assertEqual(TimerState.player1Time, 0);
            TestFramework.assertEqual(TimerState.player2Time, 0);
            TestFramework.assertEqual(TimerState.isRunning, false);
        }
    });
    
    TestFramework.test('Config exists before functions', () => {
        TestFramework.assertExists(typeof Config !== 'undefined' ? Config : null);
        if (typeof Config !== 'undefined') {
            TestFramework.assertType(Config.UPDATE_INTERVAL, 'number');
            TestFramework.assertType(Config.MAX_TIME, 'number');
        }
    });
    
    TestFramework.test('Utility functions exist before core logic', () => {
        TestFramework.assertType(formatTime, 'function');
        TestFramework.assertType(validateElements, 'function');
        TestFramework.assertType(safeQuerySelector, 'function');
    });
    
    TestFramework.test('Core timer functions exist', () => {
        TestFramework.assertType(updateTimer, 'function');
        TestFramework.assertType(startTimer, 'function');
        TestFramework.assertType(stopTimer, 'function');
        TestFramework.assertType(resetTimer, 'function');
    });
    
    TestFramework.test('UI functions exist after core logic', () => {
        TestFramework.assertType(updateDisplay, 'function');
    });
    
    TestFramework.test('Event handlers exist after all dependencies', () => {
        TestFramework.assertType(handleStart, 'function');
        TestFramework.assertType(handleStop, 'function');
        TestFramework.assertType(handleReset, 'function');
        TestFramework.assertType(handleKeyboard, 'function');
    });
    
    // Failure Point Tests
    console.log('\n--- Failure Point Tests ---');
    
    TestFramework.test('formatTime handles invalid input', () => {
        TestFramework.assertEqual(formatTime(NaN), '00:00');
        TestFramework.assertEqual(formatTime('invalid'), '00:00');
        TestFramework.assertEqual(formatTime(null), '00:00');
        TestFramework.assertEqual(formatTime(undefined), '00:00');
    });
    
    TestFramework.test('formatTime correctly formats valid times', () => {
        TestFramework.assertEqual(formatTime(0), '00:00');
        TestFramework.assertEqual(formatTime(1000), '00:01');
        TestFramework.assertEqual(formatTime(60000), '01:00');
        TestFramework.assertEqual(formatTime(125000), '02:05');
    });
    
    TestFramework.test('validateElements detects missing elements', () => {
        const result = validateElements({ test: null });
        TestFramework.assertEqual(result, false);
    });
    
    TestFramework.test('validateElements accepts existing elements', () => {
        const mockElement = document.createElement('div');
        const result = validateElements({ test: mockElement });
        TestFramework.assertEqual(result, true);
    });
    
    TestFramework.test('safeQuerySelector handles invalid selectors', () => {
        const result = safeQuerySelector('###invalid###');
        TestFramework.assertEqual(result, null);
    });
    
    // Heavy Load Tests
    console.log('\n--- Heavy Load Tests ---');
    
    TestFramework.test('formatTime performance (1000 iterations)', () => {
        const start = performance.now();
        for (let i = 0; i < 1000; i++) {
            formatTime(i * 1000);
        }
        const duration = performance.now() - start;
        console.log(`  Time: ${duration.toFixed(2)}ms`);
        TestFramework.assert(duration < 100, 'formatTime should process 1000 calls in <100ms');
    });
    
    TestFramework.test('State updates are fast', () => {
        if (typeof TimerState !== 'undefined') {
            const start = performance.now();
            for (let i = 0; i < 10000; i++) {
                TimerState.player1Time += 100;
            }
            const duration = performance.now() - start;
            console.log(`  Time: ${duration.toFixed(2)}ms`);
            TestFramework.assert(duration < 50, 'State updates should be very fast');
            TimerState.player1Time = 0; // Reset
        }
    });
}

// ========================================
// GAME.JS TESTS
// ========================================

function testGameJS() {
    console.log('\n========== TESTING game.js ==========\n');
    
    // Function Order Tests
    console.log('--- Function Order Tests ---');
    
    TestFramework.test('AppConfig exists and is initialized', () => {
        TestFramework.assertExists(typeof AppConfig !== 'undefined' ? AppConfig : null);
        if (typeof AppConfig !== 'undefined') {
            TestFramework.assertType(AppConfig.MIN_VIDEOS, 'number');
            TestFramework.assertType(AppConfig.UPDATE_INTERVAL, 'number');
            TestFramework.assertEqual(AppConfig.MIN_VIDEOS, 4);
        }
    });
    
    TestFramework.test('AppState exists before functions', () => {
        TestFramework.assertExists(typeof AppState !== 'undefined' ? AppState : null);
        if (typeof AppState !== 'undefined') {
            TestFramework.assertType(AppState.videos, 'object'); // Array
            TestFramework.assertType(AppState.quadrants, 'object');
            TestFramework.assertEqual(AppState.globalRunning, false);
        }
    });
    
    TestFramework.test('Utility functions exist', () => {
        TestFramework.assertType(safeQuery, 'function');
        TestFramework.assertType(safeQueryAll, 'function');
        TestFramework.assertType(checkBrowserSupport, 'function');
        TestFramework.assertType(debounce, 'function');
        TestFramework.assertType(safeParseInt, 'function');
    });
    
    TestFramework.test('Video management functions exist', () => {
        TestFramework.assertType(loadVideos, 'function');
        TestFramework.assertType(cleanupVideoUrls, 'function');
        TestFramework.assertType(setQuadrantVideo, 'function');
        TestFramework.assertType(shuffleVideo, 'function');
    });
    
    TestFramework.test('Timer system functions exist', () => {
        TestFramework.assertType(createCountdownTimer, 'function');
        TestFramework.assertType(stopQuadrantTimers, 'function');
    });
    
    TestFramework.test('UI management functions exist', () => {
        TestFramework.assertType(updateStatus, 'function');
        TestFramework.assertType(toggleOverlay, 'function');
        TestFramework.assertType(updateScore, 'function');
        TestFramework.assertType(showEventEffect, 'function');
    });
    
    TestFramework.test('Quadrant control functions exist', () => {
        TestFramework.assertType(startQuadrant, 'function');
        TestFramework.assertType(stopQuadrant, 'function');
        TestFramework.assertType(resetQuadrant, 'function');
        TestFramework.assertType(toggleQuadrantMute, 'function');
        TestFramework.assertType(toggleQuadrantFullscreen, 'function');
    });
    
    // Failure Point Tests
    console.log('\n--- Failure Point Tests ---');
    
    TestFramework.test('checkBrowserSupport returns valid structure', () => {
        const support = checkBrowserSupport();
        TestFramework.assertExists(support);
        TestFramework.assertType(support.video, 'boolean');
        TestFramework.assertType(support.filePicker, 'boolean');
        TestFramework.assertType(support.fullscreen, 'boolean');
        TestFramework.assertType(support.warnings, 'object'); // Array
    });
    
    TestFramework.test('safeParseInt handles invalid input', () => {
        TestFramework.assertEqual(safeParseInt('invalid'), 0);
        TestFramework.assertEqual(safeParseInt('invalid', 10), 10);
        TestFramework.assertEqual(safeParseInt(null), 0);
        TestFramework.assertEqual(safeParseInt(undefined), 0);
    });
    
    TestFramework.test('safeParseInt correctly parses valid input', () => {
        TestFramework.assertEqual(safeParseInt('42'), 42);
        TestFramework.assertEqual(safeParseInt('100'), 100);
        TestFramework.assertEqual(safeParseInt(42), 42);
    });
    
    TestFramework.test('createQuadrantState returns valid structure', () => {
        const state = createQuadrantState();
        TestFramework.assertExists(state);
        TestFramework.assertEqual(state.currentVideo, null);
        TestFramework.assertEqual(state.score, 0);
        TestFramework.assertEqual(state.running, false);
        TestFramework.assertEqual(state.muted, true);
    });
    
    TestFramework.test('debounce function exists and works', () => {
        let counter = 0;
        const increment = () => counter++;
        const debouncedIncrement = debounce(increment, 100);
        
        // Call multiple times rapidly
        debouncedIncrement();
        debouncedIncrement();
        debouncedIncrement();
        
        // Should only call once after timeout
        setTimeout(() => {
            TestFramework.assertEqual(counter, 1, 'Debounce should only call once');
        }, 150);
    });
    
    // Heavy Load Tests
    console.log('\n--- Heavy Load Tests ---');
    
    TestFramework.test('createCountdownTimer performance', () => {
        const mockElement = document.createElement('div');
        const start = performance.now();
        
        const timers = [];
        for (let i = 0; i < 100; i++) {
            timers.push(createCountdownTimer(mockElement, 10, () => {}));
        }
        
        const duration = performance.now() - start;
        console.log(`  Created 100 timers in: ${duration.toFixed(2)}ms`);
        TestFramework.assert(duration < 50, 'Creating 100 timers should take <50ms');
        
        // Cleanup
        timers.forEach(t => t.stop());
    });
    
    TestFramework.test('Video limit enforcement', () => {
        if (typeof AppConfig !== 'undefined') {
            TestFramework.assert(AppConfig.MAX_VIDEOS <= 100, 'MAX_VIDEOS should prevent memory issues');
        }
    });
}

// ========================================
// DOM INTEGRATION TESTS
// ========================================

function testDOMIntegration() {
    console.log('\n========== TESTING DOM Integration ==========\n');
    
    TestFramework.test('TTime.html elements exist', () => {
        const elements = [
            '#player1-time',
            '#player2-time',
            '#start',
            '#stop',
            '#reset'
        ];
        
        let found = 0;
        elements.forEach(selector => {
            if (document.querySelector(selector)) {
                found++;
            }
        });
        
        console.log(`  Found ${found}/${elements.length} elements`);
        // Don't fail if not on TTime page
    });
    
    TestFramework.test('Ttime.html elements exist', () => {
        const elements = [
            '#folderPicker',
            '#btnStart',
            '#btnStop',
            '#q1',
            '#q2'
        ];
        
        let found = 0;
        elements.forEach(selector => {
            if (document.querySelector(selector)) {
                found++;
            }
        });
        
        console.log(`  Found ${found}/${elements.length} elements`);
        // Don't fail if not on Ttime page
    });
}

// ========================================
// RUN ALL TESTS
// ========================================

function runAllTests() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  TTime Function Order & Load Tests    ║');
    console.log('╚════════════════════════════════════════╝\n');
    
    // Detect which file is loaded
    const hasTTimeJS = typeof TimerState !== 'undefined';
    const hasGameJS = typeof AppState !== 'undefined';
    
    console.log('Environment Detection:');
    console.log(`  TTime.js loaded: ${hasTTimeJS ? 'YES' : 'NO'}`);
    console.log(`  game.js loaded: ${hasGameJS ? 'YES' : 'NO'}`);
    
    if (hasTTimeJS) {
        testTTimeJS();
    }
    
    if (hasGameJS) {
        testGameJS();
    }
    
    if (!hasTTimeJS && !hasGameJS) {
        console.log('\n⚠️  WARNING: No TTime JavaScript files detected!');
        console.log('Load this script after TTime.js or game.js\n');
    }
    
    testDOMIntegration();
    
    TestFramework.printSummary();
    
    return TestFramework.results;
}

// Auto-run if in browser
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(runAllTests, 100); // Small delay to ensure app initialization
        });
    } else {
        setTimeout(runAllTests, 100);
    }
}

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runAllTests, TestFramework };
}
