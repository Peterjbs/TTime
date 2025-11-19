/**
 * TTime.js - Two Player Timer
 * 
 * Function Order and Organization:
 * 1. Configuration and State (initialization)
 * 2. Utility Functions (helpers)
 * 3. Timer Logic (core functionality)
 * 4. UI Updates (rendering)
 * 5. Event Handlers (user interaction)
 * 6. Initialization (DOM ready)
 * 
 * Potential Failure Points:
 * - DOM elements not found
 * - setInterval failures
 * - Invalid time states
 * 
 * Heavy Load Operations:
 * - Frequent DOM updates (every 100ms during timer)
 */

// ========================================
// 1. CONFIGURATION AND STATE
// ========================================

const TimerState = {
    player1Time: 0,  // in milliseconds
    player2Time: 0,  // in milliseconds
    activePlayer: null,  // 1 or 2
    intervalId: null,
    isRunning: false
};

const Config = {
    UPDATE_INTERVAL: 100,  // Update every 100ms for smooth display
    MAX_TIME: 3600000  // 1 hour max to prevent overflow
};

// ========================================
// 2. UTILITY FUNCTIONS
// ========================================

/**
 * Format time in milliseconds to MM:SS format
 * @param {number} ms - Time in milliseconds
 * @returns {string} Formatted time string
 * @throws {Error} If ms is not a valid number
 */
function formatTime(ms) {
    if (typeof ms !== 'number' || isNaN(ms)) {
        console.error('Invalid time value:', ms);
        return '00:00';
    }
    
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Validate DOM elements exist
 * @param {Object} elements - Object containing DOM element references
 * @returns {boolean} True if all elements exist
 */
function validateElements(elements) {
    for (const [key, element] of Object.entries(elements)) {
        if (!element) {
            console.error(`Required DOM element not found: ${key}`);
            return false;
        }
    }
    return true;
}

/**
 * Safe element query with error handling
 * @param {string} selector - CSS selector
 * @returns {HTMLElement|null} Element or null if not found
 */
function safeQuerySelector(selector) {
    try {
        return document.querySelector(selector);
    } catch (error) {
        console.error(`Error querying selector "${selector}":`, error);
        return null;
    }
}

// ========================================
// 3. TIMER LOGIC (Core Functionality)
// ========================================

/**
 * Update timer for active player
 * HEAVY LOAD: Called every 100ms when timer is running
 * Optimization: Minimal DOM manipulation, state update only
 */
function updateTimer() {
    if (!TimerState.isRunning || !TimerState.activePlayer) {
        return;
    }
    
    try {
        const playerKey = `player${TimerState.activePlayer}Time`;
        TimerState[playerKey] += Config.UPDATE_INTERVAL;
        
        // Check for overflow protection
        if (TimerState[playerKey] > Config.MAX_TIME) {
            console.warn('Maximum time limit reached');
            stopTimer();
            return;
        }
        
        updateDisplay();
    } catch (error) {
        console.error('Error updating timer:', error);
        stopTimer();
    }
}

/**
 * Start the timer
 * POTENTIAL FAILURE POINT: setInterval may fail in background tabs
 */
function startTimer() {
    if (TimerState.isRunning) {
        console.warn('Timer already running');
        return;
    }
    
    try {
        // Default to player 1 if no active player
        if (!TimerState.activePlayer) {
            TimerState.activePlayer = 1;
        }
        
        TimerState.isRunning = true;
        
        // Clear any existing interval (safety check)
        if (TimerState.intervalId) {
            clearInterval(TimerState.intervalId);
        }
        
        TimerState.intervalId = setInterval(updateTimer, Config.UPDATE_INTERVAL);
        
        console.log('Timer started for player', TimerState.activePlayer);
    } catch (error) {
        console.error('Failed to start timer:', error);
        TimerState.isRunning = false;
        alert('Failed to start timer. Please try again.');
    }
}

/**
 * Stop the timer
 */
function stopTimer() {
    if (!TimerState.isRunning) {
        console.warn('Timer not running');
        return;
    }
    
    try {
        TimerState.isRunning = false;
        
        if (TimerState.intervalId) {
            clearInterval(TimerState.intervalId);
            TimerState.intervalId = null;
        }
        
        console.log('Timer stopped');
    } catch (error) {
        console.error('Error stopping timer:', error);
    }
}

/**
 * Reset the timer
 */
function resetTimer() {
    try {
        stopTimer();
        TimerState.player1Time = 0;
        TimerState.player2Time = 0;
        TimerState.activePlayer = null;
        updateDisplay();
        console.log('Timer reset');
    } catch (error) {
        console.error('Error resetting timer:', error);
    }
}

/**
 * Switch active player
 */
function switchPlayer() {
    if (!TimerState.activePlayer) {
        TimerState.activePlayer = 1;
    } else {
        TimerState.activePlayer = TimerState.activePlayer === 1 ? 2 : 1;
    }
    console.log('Switched to player', TimerState.activePlayer);
}

// ========================================
// 4. UI UPDATES (Rendering)
// ========================================

/**
 * Update the display with current timer values
 * HEAVY LOAD: Called frequently (every 100ms when running)
 * Optimization: Direct textContent update, no layout thrashing
 */
function updateDisplay() {
    try {
        const player1Element = safeQuerySelector('#player1-time');
        const player2Element = safeQuerySelector('#player2-time');
        
        if (player1Element) {
            player1Element.textContent = `Player 1: ${formatTime(TimerState.player1Time)}`;
        }
        
        if (player2Element) {
            player2Element.textContent = `Player 2: ${formatTime(TimerState.player2Time)}`;
        }
    } catch (error) {
        console.error('Error updating display:', error);
    }
}

// ========================================
// 5. EVENT HANDLERS (User Interaction)
// ========================================

/**
 * Handle start button click
 * POTENTIAL FAILURE POINT: User interaction during invalid state
 */
function handleStart(event) {
    try {
        event.preventDefault();
        startTimer();
    } catch (error) {
        console.error('Error in start handler:', error);
        alert('Error starting timer');
    }
}

/**
 * Handle stop button click
 */
function handleStop(event) {
    try {
        event.preventDefault();
        stopTimer();
    } catch (error) {
        console.error('Error in stop handler:', error);
    }
}

/**
 * Handle reset button click
 */
function handleReset(event) {
    try {
        event.preventDefault();
        resetTimer();
    } catch (error) {
        console.error('Error in reset handler:', error);
    }
}

/**
 * Handle keyboard shortcuts
 * Enhancement for better UX
 */
function handleKeyboard(event) {
    try {
        switch(event.key.toLowerCase()) {
            case ' ':  // Space bar
                event.preventDefault();
                if (TimerState.isRunning) {
                    stopTimer();
                } else {
                    startTimer();
                }
                break;
            case 'r':
                event.preventDefault();
                resetTimer();
                break;
            case 's':
                event.preventDefault();
                switchPlayer();
                break;
        }
    } catch (error) {
        console.error('Error in keyboard handler:', error);
    }
}

// ========================================
// 6. INITIALIZATION (DOM Ready)
// ========================================

/**
 * Initialize the application
 * POTENTIAL FAILURE POINT: DOM not ready or elements missing
 * This should be called last, after all functions are defined
 */
function initializeApp() {
    try {
        console.log('Initializing Two Player Timer...');
        
        // Get DOM elements
        const elements = {
            startBtn: safeQuerySelector('#start'),
            stopBtn: safeQuerySelector('#stop'),
            resetBtn: safeQuerySelector('#reset'),
            player1Display: safeQuerySelector('#player1-time'),
            player2Display: safeQuerySelector('#player2-time')
        };
        
        // Validate all required elements exist
        if (!validateElements(elements)) {
            throw new Error('Required DOM elements are missing');
        }
        
        // Attach event listeners
        elements.startBtn.addEventListener('click', handleStart);
        elements.stopBtn.addEventListener('click', handleStop);
        elements.resetBtn.addEventListener('click', handleReset);
        document.addEventListener('keydown', handleKeyboard);
        
        // Initialize display
        updateDisplay();
        
        console.log('Two Player Timer initialized successfully');
        console.log('Keyboard shortcuts: Space=Start/Stop, R=Reset, S=Switch Player');
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        alert('Failed to initialize timer. Please refresh the page.');
    }
}

// Wait for DOM to be ready before initializing
// POTENTIAL FAILURE POINT: DOMContentLoaded may not fire in some edge cases
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM already loaded
    initializeApp();
}

// Cleanup on page unload to prevent memory leaks
window.addEventListener('beforeunload', () => {
    stopTimer();
    console.log('Timer cleaned up');
});
