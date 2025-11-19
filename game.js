/**
 * game.js - Quadrant Timers Game System
 * 
 * Function Order and Organization:
 * 1. Configuration and State Management
 * 2. Utility Functions
 * 3. Video Management
 * 4. Timer and Event System
 * 5. UI Management
 * 6. Player/Quadrant Control
 * 7. Event Handlers
 * 8. Initialization
 * 
 * Potential Failure Points:
 * - Video loading failures
 * - File picker API not supported
 * - Fullscreen API failures
 * - Timer synchronization issues
 * - Memory leaks from video elements
 * 
 * Heavy Load Operations:
 * - Video decoding and playback (2 simultaneous videos)
 * - Frequent timer updates (multiple timers per quadrant)
 * - DOM manipulation for overlays and effects
 * - File system access for video loading
 */

// ========================================
// 1. CONFIGURATION AND STATE MANAGEMENT
// ========================================

const AppConfig = {
    MIN_VIDEOS: 4,
    UPDATE_INTERVAL: 100,  // ms
    VALIDATION_TIME: 10,   // seconds
    RESTART_TIME: 20,      // seconds
    ACTION_CHOICE_TIME: 20, // seconds
    GRID_CHOICE_TIME: 20,   // seconds
    BREATH_COUNT_TIME: 10,  // seconds
    MAX_VIDEOS: 100  // Prevent memory issues
};

const AppState = {
    videos: [],  // Array of video file objects
    quadrants: {},  // State for each quadrant (q1, q2)
    globalRunning: false,
    initialized: false
};

// Quadrant state template
function createQuadrantState() {
    return {
        currentVideo: null,
        videoElement: null,
        theme: null,
        score: 0,
        running: false,
        muted: true,
        timers: {},
        currentPhase: null,
        availableVideos: []
    };
}

// ========================================
// 2. UTILITY FUNCTIONS
// ========================================

/**
 * Safe querySelector with error handling
 * @param {string} selector - CSS selector
 * @param {HTMLElement} context - Optional context element
 * @returns {HTMLElement|null}
 */
function safeQuery(selector, context = document) {
    try {
        return context.querySelector(selector);
    } catch (error) {
        console.error(`Error querying "${selector}":`, error);
        return null;
    }
}

/**
 * Safe querySelectorAll with error handling
 * @param {string} selector - CSS selector
 * @param {HTMLElement} context - Optional context element
 * @returns {NodeList}
 */
function safeQueryAll(selector, context = document) {
    try {
        return context.querySelectorAll(selector);
    } catch (error) {
        console.error(`Error querying all "${selector}":`, error);
        return [];
    }
}

/**
 * Validate browser feature support
 * POTENTIAL FAILURE POINT: Older browsers may not support required APIs
 * @returns {Object} Support status for each feature
 */
function checkBrowserSupport() {
    const support = {
        video: !!document.createElement('video').canPlayType,
        filePicker: 'webkitdirectory' in document.createElement('input'),
        fullscreen: !!(document.fullscreenEnabled || document.webkitFullscreenEnabled),
        warnings: []
    };
    
    if (!support.video) {
        support.warnings.push('Video playback not supported');
    }
    if (!support.filePicker) {
        support.warnings.push('Folder picker not fully supported (use file input)');
    }
    if (!support.fullscreen) {
        support.warnings.push('Fullscreen API not supported');
    }
    
    return support;
}

/**
 * Debounce function to limit heavy operations
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Safely parse integer with fallback
 * @param {*} value - Value to parse
 * @param {number} fallback - Fallback value
 * @returns {number}
 */
function safeParseInt(value, fallback = 0) {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? fallback : parsed;
}

// ========================================
// 3. VIDEO MANAGEMENT
// ========================================

/**
 * Load videos from file picker
 * HEAVY LOAD: File system access and video metadata loading
 * POTENTIAL FAILURE POINT: User cancels, no videos selected, incompatible formats
 * @param {FileList} files - Files from input element
 */
async function loadVideos(files) {
    try {
        console.log('Loading videos...', files.length, 'files selected');
        
        if (!files || files.length === 0) {
            updateStatus('No files selected');
            return;
        }
        
        // Filter video files only
        const videoFiles = Array.from(files).filter(file => 
            file.type.startsWith('video/')
        );
        
        if (videoFiles.length < AppConfig.MIN_VIDEOS) {
            updateStatus(`Need at least ${AppConfig.MIN_VIDEOS} videos, found ${videoFiles.length}`);
            return;
        }
        
        if (videoFiles.length > AppConfig.MAX_VIDEOS) {
            console.warn(`Too many videos (${videoFiles.length}), limiting to ${AppConfig.MAX_VIDEOS}`);
            videoFiles.splice(AppConfig.MAX_VIDEOS);
        }
        
        // Store video files
        AppState.videos = videoFiles.map((file, index) => ({
            file,
            url: URL.createObjectURL(file),
            name: file.name,
            index
        }));
        
        console.log(`Loaded ${AppState.videos.length} videos`);
        updateStatus(`${AppState.videos.length} videos loaded. Click Start to begin.`);
        
        // Enable start button
        const startBtn = safeQuery('#btnStart');
        if (startBtn) {
            startBtn.disabled = false;
        }
        
    } catch (error) {
        console.error('Error loading videos:', error);
        updateStatus('Error loading videos');
    }
}

/**
 * Cleanup video URLs to prevent memory leaks
 * IMPORTANT: Call this when removing videos
 */
function cleanupVideoUrls() {
    try {
        AppState.videos.forEach(video => {
            if (video.url) {
                URL.revokeObjectURL(video.url);
            }
        });
        console.log('Video URLs cleaned up');
    } catch (error) {
        console.error('Error cleaning up video URLs:', error);
    }
}

/**
 * Set video source for a quadrant
 * HEAVY LOAD: Video loading and decoding
 * @param {string} quadId - Quadrant ID (q1, q2)
 * @param {Object} videoData - Video data object
 */
async function setQuadrantVideo(quadId, videoData) {
    try {
        const quadrant = safeQuery(`#${quadId}`);
        if (!quadrant) {
            console.error(`Quadrant ${quadId} not found`);
            return;
        }
        
        const videoElement = safeQuery('.quad-video', quadrant);
        if (!videoElement) {
            console.error(`Video element not found in ${quadId}`);
            return;
        }
        
        // Stop current video
        videoElement.pause();
        
        // Set new source
        videoElement.src = videoData.url;
        videoElement.load();
        
        // Update state
        if (!AppState.quadrants[quadId]) {
            AppState.quadrants[quadId] = createQuadrantState();
        }
        AppState.quadrants[quadId].currentVideo = videoData;
        AppState.quadrants[quadId].videoElement = videoElement;
        
        console.log(`Video set for ${quadId}:`, videoData.name);
        
        // Try to play (may fail due to autoplay policies)
        try {
            await videoElement.play();
        } catch (playError) {
            console.warn(`Autoplay prevented for ${quadId}:`, playError.message);
        }
        
    } catch (error) {
        console.error(`Error setting video for ${quadId}:`, error);
    }
}

/**
 * Shuffle to next video for quadrant
 * @param {string} quadId - Quadrant ID
 */
function shuffleVideo(quadId) {
    try {
        if (AppState.videos.length === 0) {
            console.warn('No videos available to shuffle');
            return;
        }
        
        const state = AppState.quadrants[quadId];
        if (!state) {
            console.error(`Quadrant state not found: ${quadId}`);
            return;
        }
        
        // Get random video different from current
        let randomVideo;
        do {
            randomVideo = AppState.videos[Math.floor(Math.random() * AppState.videos.length)];
        } while (randomVideo === state.currentVideo && AppState.videos.length > 1);
        
        setQuadrantVideo(quadId, randomVideo);
        
    } catch (error) {
        console.error(`Error shuffling video for ${quadId}:`, error);
    }
}

// ========================================
// 4. TIMER AND EVENT SYSTEM
// ========================================

/**
 * Create a countdown timer
 * HEAVY LOAD: Frequent DOM updates
 * @param {HTMLElement} element - Element to update
 * @param {number} seconds - Initial seconds
 * @param {Function} onComplete - Callback when timer reaches 0
 * @returns {Object} Timer control object
 */
function createCountdownTimer(element, seconds, onComplete) {
    let remaining = seconds;
    let intervalId = null;
    
    const timer = {
        start() {
            if (intervalId) {
                console.warn('Timer already running');
                return;
            }
            
            try {
                const update = () => {
                    if (element) {
                        element.textContent = remaining;
                    }
                    
                    if (remaining <= 0) {
                        this.stop();
                        if (onComplete) {
                            onComplete();
                        }
                        return;
                    }
                    
                    remaining--;
                };
                
                // Initial update
                update();
                
                // Start interval
                intervalId = setInterval(update, 1000);
            } catch (error) {
                console.error('Error starting countdown timer:', error);
                this.stop();
            }
        },
        
        stop() {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        },
        
        reset(newSeconds) {
            this.stop();
            remaining = newSeconds;
            if (element) {
                element.textContent = remaining;
            }
        },
        
        getRemaining() {
            return remaining;
        }
    };
    
    return timer;
}

/**
 * Stop all timers for a quadrant
 * @param {string} quadId - Quadrant ID
 */
function stopQuadrantTimers(quadId) {
    try {
        const state = AppState.quadrants[quadId];
        if (!state || !state.timers) {
            return;
        }
        
        Object.values(state.timers).forEach(timer => {
            if (timer && timer.stop) {
                timer.stop();
            }
        });
        
        console.log(`Stopped all timers for ${quadId}`);
    } catch (error) {
        console.error(`Error stopping timers for ${quadId}:`, error);
    }
}

// ========================================
// 5. UI MANAGEMENT
// ========================================

/**
 * Update status message
 * @param {string} message - Status message
 */
function updateStatus(message) {
    try {
        const statusElement = safeQuery('#status');
        if (statusElement) {
            statusElement.textContent = message;
        }
        console.log('Status:', message);
    } catch (error) {
        console.error('Error updating status:', error);
    }
}

/**
 * Show/hide overlay
 * @param {string} quadId - Quadrant ID
 * @param {string} overlayClass - Overlay class name
 * @param {boolean} show - Show or hide
 */
function toggleOverlay(quadId, overlayClass, show) {
    try {
        const quadrant = safeQuery(`#${quadId}`);
        if (!quadrant) return;
        
        const overlay = safeQuery(`.${overlayClass}`, quadrant);
        if (!overlay) return;
        
        if (show) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    } catch (error) {
        console.error(`Error toggling overlay ${overlayClass} in ${quadId}:`, error);
    }
}

/**
 * Update score display
 * @param {string} quadId - Quadrant ID
 * @param {number} newScore - New score value
 */
function updateScore(quadId, newScore) {
    try {
        const quadrant = safeQuery(`#${quadId}`);
        if (!quadrant) return;
        
        const scoreElement = safeQuery('.tally', quadrant);
        if (scoreElement) {
            scoreElement.textContent = `Score: ${newScore}`;
        }
        
        if (AppState.quadrants[quadId]) {
            AppState.quadrants[quadId].score = newScore;
        }
    } catch (error) {
        console.error(`Error updating score for ${quadId}:`, error);
    }
}

/**
 * Show event effect overlay
 * HEAVY LOAD: CSS animations
 * @param {string} quadId - Quadrant ID
 * @param {string} effectType - Effect type (light, smoke, etc)
 * @param {number} duration - Duration in ms
 */
function showEventEffect(quadId, effectType, duration = 2000) {
    try {
        const quadrant = safeQuery(`#${quadId}`);
        if (!quadrant) return;
        
        const overlay = safeQuery(`.event-overlay-${effectType}`, quadrant);
        if (!overlay) {
            console.warn(`Effect overlay not found: ${effectType}`);
            return;
        }
        
        // Show overlay
        overlay.classList.add('active');
        
        // Auto-hide after duration
        setTimeout(() => {
            overlay.classList.remove('active');
        }, duration);
        
    } catch (error) {
        console.error(`Error showing effect ${effectType} in ${quadId}:`, error);
    }
}

// ========================================
// 6. PLAYER/QUADRANT CONTROL
// ========================================

/**
 * Start a quadrant/player
 * @param {string} quadId - Quadrant ID
 */
function startQuadrant(quadId) {
    try {
        if (!AppState.quadrants[quadId]) {
            AppState.quadrants[quadId] = createQuadrantState();
        }
        
        const state = AppState.quadrants[quadId];
        
        // Assign random video if none assigned
        if (!state.currentVideo && AppState.videos.length > 0) {
            shuffleVideo(quadId);
        }
        
        // Start video playback
        if (state.videoElement) {
            state.videoElement.play().catch(error => {
                console.warn(`Video playback failed for ${quadId}:`, error);
            });
        }
        
        state.running = true;
        
        // Hide chooseTint overlay
        toggleOverlay(quadId, 'chooseTint', false);
        
        console.log(`Started ${quadId}`);
        
    } catch (error) {
        console.error(`Error starting ${quadId}:`, error);
    }
}

/**
 * Stop a quadrant/player
 * @param {string} quadId - Quadrant ID
 */
function stopQuadrant(quadId) {
    try {
        const state = AppState.quadrants[quadId];
        if (!state) return;
        
        // Pause video
        if (state.videoElement) {
            state.videoElement.pause();
        }
        
        // Stop all timers
        stopQuadrantTimers(quadId);
        
        state.running = false;
        
        console.log(`Stopped ${quadId}`);
        
    } catch (error) {
        console.error(`Error stopping ${quadId}:`, error);
    }
}

/**
 * Reset a quadrant
 * @param {string} quadId - Quadrant ID
 */
function resetQuadrant(quadId) {
    try {
        stopQuadrant(quadId);
        
        const state = AppState.quadrants[quadId];
        if (state) {
            state.score = 0;
            updateScore(quadId, 0);
            
            // Hide all overlays
            const quadrant = safeQuery(`#${quadId}`);
            if (quadrant) {
                const overlays = safeQueryAll('.special-overlay, .event-overlay', quadrant);
                overlays.forEach(overlay => {
                    overlay.classList.remove('active');
                });
            }
        }
        
        console.log(`Reset ${quadId}`);
        
    } catch (error) {
        console.error(`Error resetting ${quadId}:`, error);
    }
}

/**
 * Toggle mute for quadrant
 * @param {string} quadId - Quadrant ID
 */
function toggleQuadrantMute(quadId) {
    try {
        const state = AppState.quadrants[quadId];
        if (!state || !state.videoElement) return;
        
        state.muted = !state.muted;
        state.videoElement.muted = state.muted;
        
        // Update button icon/state
        const quadrant = safeQuery(`#${quadId}`);
        const btn = safeQuery('.btnSound', quadrant);
        if (btn) {
            btn.textContent = state.muted ? '🔈' : '🔊';
        }
        
        console.log(`${quadId} muted:`, state.muted);
        
    } catch (error) {
        console.error(`Error toggling mute for ${quadId}:`, error);
    }
}

/**
 * Toggle fullscreen for quadrant
 * POTENTIAL FAILURE POINT: Fullscreen API may fail or be denied
 * @param {string} quadId - Quadrant ID
 */
async function toggleQuadrantFullscreen(quadId) {
    try {
        const quadrant = safeQuery(`#${quadId}`);
        if (!quadrant) return;
        
        if (document.fullscreenElement || document.webkitFullscreenElement) {
            // Exit fullscreen
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                await document.webkitExitFullscreen();
            }
        } else {
            // Enter fullscreen
            if (quadrant.requestFullscreen) {
                await quadrant.requestFullscreen();
            } else if (quadrant.webkitRequestFullscreen) {
                await quadrant.webkitRequestFullscreen();
            }
        }
    } catch (error) {
        console.error(`Error toggling fullscreen for ${quadId}:`, error);
        updateStatus('Fullscreen not available');
    }
}

// ========================================
// 7. EVENT HANDLERS
// ========================================

/**
 * Handle folder picker change
 * HEAVY LOAD: File system access
 */
function handleFolderPicker(event) {
    const files = event.target.files;
    loadVideos(files);
}

/**
 * Handle global start button
 */
function handleGlobalStart() {
    try {
        if (AppState.videos.length < AppConfig.MIN_VIDEOS) {
            updateStatus(`Need at least ${AppConfig.MIN_VIDEOS} videos to start`);
            return;
        }
        
        AppState.globalRunning = true;
        
        // Show chooseTint overlays for both quadrants
        toggleOverlay('q1', 'chooseTint', true);
        toggleOverlay('q2', 'chooseTint', true);
        
        // Populate video grids
        populateVideoGrid('q1');
        populateVideoGrid('q2');
        
        updateStatus('Select theme and video for each player');
        
    } catch (error) {
        console.error('Error in global start:', error);
        updateStatus('Error starting game');
    }
}

/**
 * Handle global stop button
 */
function handleGlobalStop() {
    try {
        AppState.globalRunning = false;
        
        stopQuadrant('q1');
        stopQuadrant('q2');
        
        updateStatus('Game stopped');
        
    } catch (error) {
        console.error('Error in global stop:', error);
    }
}

/**
 * Handle mute all button
 */
function handleMuteAll() {
    try {
        const allMuted = AppState.quadrants.q1?.muted && AppState.quadrants.q2?.muted;
        
        ['q1', 'q2'].forEach(quadId => {
            const state = AppState.quadrants[quadId];
            if (state && state.videoElement) {
                state.muted = !allMuted;
                state.videoElement.muted = !allMuted;
            }
        });
        
        const btn = safeQuery('#btnMuteAll');
        if (btn) {
            btn.textContent = allMuted ? '🔊' : '🔇';
        }
        
    } catch (error) {
        console.error('Error in mute all:', error);
    }
}

/**
 * Handle fullscreen all button
 * POTENTIAL FAILURE POINT: Fullscreen API may fail
 */
async function handleFullscreenAll() {
    try {
        const stage = safeQuery('.stage');
        if (!stage) return;
        
        if (document.fullscreenElement || document.webkitFullscreenElement) {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                await document.webkitExitFullscreen();
            }
        } else {
            if (stage.requestFullscreen) {
                await stage.requestFullscreen();
            } else if (stage.webkitRequestFullscreen) {
                await stage.webkitRequestFullscreen();
            }
        }
    } catch (error) {
        console.error('Error toggling fullscreen:', error);
        updateStatus('Fullscreen not available');
    }
}

/**
 * Populate video grid for quadrant selection
 * @param {string} quadId - Quadrant ID
 */
function populateVideoGrid(quadId) {
    try {
        const quadrant = safeQuery(`#${quadId}`);
        if (!quadrant) return;
        
        const grid = safeQuery('.start-grid', quadrant);
        if (!grid) return;
        
        const items = safeQueryAll('.choose-grid-item', grid);
        
        // Get 4 random videos
        const selectedVideos = [];
        const availableIndices = [...Array(AppState.videos.length).keys()];
        
        for (let i = 0; i < Math.min(4, AppState.videos.length); i++) {
            const randomIndex = Math.floor(Math.random() * availableIndices.length);
            const videoIndex = availableIndices.splice(randomIndex, 1)[0];
            selectedVideos.push(AppState.videos[videoIndex]);
        }
        
        // Populate grid items
        items.forEach((item, index) => {
            if (index < selectedVideos.length) {
                const video = selectedVideos[index];
                const videoEl = safeQuery('video', item);
                const label = safeQuery('.item-label', item);
                
                if (videoEl) {
                    videoEl.src = video.url;
                    videoEl.load();
                }
                
                if (label) {
                    label.textContent = video.name;
                }
                
                // Add click handler
                item.onclick = () => selectVideoForQuadrant(quadId, video);
            }
        });
        
    } catch (error) {
        console.error(`Error populating video grid for ${quadId}:`, error);
    }
}

/**
 * Select video for quadrant from grid
 * @param {string} quadId - Quadrant ID
 * @param {Object} videoData - Selected video data
 */
function selectVideoForQuadrant(quadId, videoData) {
    try {
        setQuadrantVideo(quadId, videoData);
        console.log(`Video selected for ${quadId}:`, videoData.name);
    } catch (error) {
        console.error(`Error selecting video for ${quadId}:`, error);
    }
}

// ========================================
// 8. INITIALIZATION
// ========================================

/**
 * Setup quadrant event handlers
 * @param {string} quadId - Quadrant ID
 */
function setupQuadrantHandlers(quadId) {
    try {
        const quadrant = safeQuery(`#${quadId}`);
        if (!quadrant) {
            console.error(`Quadrant not found: ${quadId}`);
            return;
        }
        
        // Shuffle video button
        const shuffleBtn = safeQuery('.shuffleVideo', quadrant);
        if (shuffleBtn) {
            shuffleBtn.addEventListener('click', () => shuffleVideo(quadId));
        }
        
        // Sound button
        const soundBtn = safeQuery('.btnSound', quadrant);
        if (soundBtn) {
            soundBtn.addEventListener('click', () => toggleQuadrantMute(quadId));
        }
        
        // Fullscreen button
        const fsBtn = safeQuery('.btnFS', quadrant);
        if (fsBtn) {
            fsBtn.addEventListener('click', () => toggleQuadrantFullscreen(quadId));
        }
        
        // Reset button
        const resetBtn = safeQuery('.btnReset', quadrant);
        if (resetBtn) {
            resetBtn.addEventListener('click', () => resetQuadrant(quadId));
        }
        
        // Restart button
        const restartBtn = safeQuery('.btnRestart', quadrant);
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                resetQuadrant(quadId);
                setTimeout(() => startQuadrant(quadId), 100);
            });
        }
        
        // Player start button
        const playerStartBtn = safeQuery('.btn-player-start', quadrant);
        if (playerStartBtn) {
            playerStartBtn.addEventListener('click', () => startQuadrant(quadId));
        }
        
        // Task confirm/fail buttons
        const confirmBtn = safeQuery('.btn-task-confirm', quadrant);
        const failBtn = safeQuery('.btn-task-fail', quadrant);
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                const state = AppState.quadrants[quadId];
                if (state) {
                    updateScore(quadId, state.score + 10);
                }
            });
        }
        
        if (failBtn) {
            failBtn.addEventListener('click', () => {
                const state = AppState.quadrants[quadId];
                if (state) {
                    updateScore(quadId, Math.max(0, state.score - 5));
                }
            });
        }
        
        console.log(`Event handlers setup for ${quadId}`);
        
    } catch (error) {
        console.error(`Error setting up handlers for ${quadId}:`, error);
    }
}

/**
 * Initialize the application
 * POTENTIAL FAILURE POINT: DOM elements missing, browser not supported
 */
function initializeApp() {
    try {
        console.log('Initializing Quadrant Timers...');
        
        // Check browser support
        const support = checkBrowserSupport();
        if (support.warnings.length > 0) {
            console.warn('Browser support warnings:', support.warnings);
            updateStatus(support.warnings.join('; '));
        }
        
        // Get and setup global controls
        const folderPicker = safeQuery('#folderPicker');
        const btnStart = safeQuery('#btnStart');
        const btnStop = safeQuery('#btnStop');
        const btnMuteAll = safeQuery('#btnMuteAll');
        const btnFSAll = safeQuery('#btnFSAll');
        
        if (folderPicker) {
            folderPicker.addEventListener('change', handleFolderPicker);
        }
        
        if (btnStart) {
            btnStart.addEventListener('click', handleGlobalStart);
            btnStart.disabled = true;  // Enable after videos loaded
        }
        
        if (btnStop) {
            btnStop.addEventListener('click', handleGlobalStop);
        }
        
        if (btnMuteAll) {
            btnMuteAll.addEventListener('click', handleMuteAll);
        }
        
        if (btnFSAll) {
            btnFSAll.addEventListener('click', handleFullscreenAll);
        }
        
        // Setup both quadrants
        setupQuadrantHandlers('q1');
        setupQuadrantHandlers('q2');
        
        // Initialize quadrant states
        AppState.quadrants.q1 = createQuadrantState();
        AppState.quadrants.q2 = createQuadrantState();
        
        AppState.initialized = true;
        
        console.log('Quadrant Timers initialized successfully');
        updateStatus('Load ≥4 videos to begin');
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        updateStatus('Initialization failed. Please refresh.');
    }
}

// Wait for DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Cleanup on page unload
// IMPORTANT: Prevent memory leaks from video URLs
window.addEventListener('beforeunload', () => {
    try {
        // Stop all quadrants
        stopQuadrant('q1');
        stopQuadrant('q2');
        
        // Cleanup video URLs
        cleanupVideoUrls();
        
        console.log('Cleanup completed');
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
});

// Handle visibility change to pause/resume videos
// OPTIMIZATION: Pause videos when tab is hidden
document.addEventListener('visibilitychange', () => {
    try {
        if (document.hidden) {
            console.log('Tab hidden - pausing videos');
            ['q1', 'q2'].forEach(quadId => {
                const state = AppState.quadrants[quadId];
                if (state && state.videoElement && state.running) {
                    state.videoElement.pause();
                }
            });
        } else {
            console.log('Tab visible - resuming videos');
            ['q1', 'q2'].forEach(quadId => {
                const state = AppState.quadrants[quadId];
                if (state && state.videoElement && state.running) {
                    state.videoElement.play().catch(error => {
                        console.warn(`Failed to resume video for ${quadId}:`, error);
                    });
                }
            });
        }
    } catch (error) {
        console.error('Error handling visibility change:', error);
    }
});
