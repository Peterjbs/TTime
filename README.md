# TTime - Timer Applications

This repository contains two timer applications with comprehensive function organization, error handling, and performance optimizations.

## 📁 Files

### HTML Files
- **TTime.html** - Simple two-player timer interface
- **Ttime.html** - Advanced quadrant timer system with video support

### JavaScript Files
- **TTime.js** - Logic for simple timer (336 lines)
- **game.js** - Logic for quadrant timer system (1054 lines)
- **test-runner.js** - Automated test suite

### CSS Files
- **TTimeBase.css** - Base styling for simple timer
- **TTimeStyleNeoNoir.css** - Neo-noir theme with animations
- **game.css** - Complete styling for quadrant timer system

### Documentation
- **FUNCTION_ORDER_ANALYSIS.md** - Comprehensive analysis of function organization, failure points, and performance

## 🚀 Quick Start

### Simple Timer (TTime.html)
1. Open `TTime.html` in a web browser
2. Click "Start" to begin timing Player 1
3. Click "Stop" to pause the timer
4. Click "Reset" to clear both timers

**Keyboard Shortcuts:**
- `Space` - Start/Stop timer
- `R` - Reset timer
- `S` - Switch active player

### Quadrant Timer (Ttime.html)
1. Open `Ttime.html` in a web browser
2. Click "🎬 Pick videos" and select a folder with 4+ video files
3. Click "▶︎ Start" to begin
4. Select a video for each quadrant
5. Click individual "START" buttons to begin each player's session

## ✅ Function Order Verification

Both JavaScript files follow the correct function organization pattern:

### TTime.js Order
1. **Configuration and State** (Lines 15-31)
2. **Utility Functions** (Lines 37-85)
3. **Timer Logic** (Lines 91-184)
4. **UI Updates** (Lines 190-214)
5. **Event Handlers** (Lines 220-284)
6. **Initialization** (Lines 290-334)

✓ All functions are defined before they are used
✓ No circular dependencies
✓ Clear separation of concerns

### game.js Order
1. **Configuration and State** (Lines 20-51)
2. **Utility Functions** (Lines 57-142)
3. **Video Management** (Lines 148-320)
4. **Timer and Event System** (Lines 326-409)
5. **UI Management** (Lines 415-512)
6. **Player/Quadrant Control** (Lines 518-678)
7. **Event Handlers** (Lines 684-890)
8. **Initialization** (Lines 896-1054)

✓ All dependencies loaded in correct order
✓ Proper encapsulation and modularity
✓ Memory leak prevention implemented

## ⚠️ Potential Failure Points

### TTime.js (6 identified)
1. **DOM Element Availability** - Handled with validation
2. **setInterval Throttling** - Accepted behavior
3. **Numeric Overflow** - MAX_TIME limit enforced
4. **Event Listener Leaks** - Cleanup on unload
5. **Invalid State Transitions** - State checks prevent
6. **Keyboard Conflicts** - preventDefault() used

### game.js (9 identified)
1. **Video Loading Failures** - File type filtering + error handling
2. **File Picker API Support** - Browser detection with warnings
3. **Video Memory Issues** - MAX_VIDEOS limit + URL cleanup
4. **Fullscreen API Failures** - Try/catch + user messaging
5. **Autoplay Policy** - Catch and require user interaction
6. **Timer Synchronization** - Individual timer management
7. **Memory Leaks** - cleanupVideoUrls() on unload
8. **Race Conditions** - State checks in functions
9. **DOM Query Performance** - Safe query functions

## 📊 Heavy Load Operations

### TTime.js
- **Critical**: DOM updates every 100ms (2 elements, optimized)
- **Impact**: Low - direct textContent updates

### game.js
- **Critical**: 
  - 2 simultaneous video streams (GPU decode)
  - Multiple countdown timers (DOM updates/second)
- **Heavy**:
  - File system access for video loading
  - Video grid population (8 preview videos)
- **Optimizations**:
  - Videos pause when tab hidden
  - Video URL cleanup prevents leaks
  - Limited to 100 videos maximum
  - Metadata preload only

## 🧪 Testing

### Automated Tests
Load `test-runner.js` after the main JavaScript files:

```html
<!-- For TTime.html -->
<script src="TTime.js"></script>
<script src="test-runner.js"></script>

<!-- For Ttime.html -->
<script src="game.js"></script>
<script src="test-runner.js"></script>
```

Or run in browser console:
```javascript
// Load the test file, then run:
runAllTests();
```

### Manual Testing

#### TTime.js Checklist
- [ ] Timer displays "00:00" on load
- [ ] Start button increments timer
- [ ] Stop button pauses timer
- [ ] Reset button clears to "00:00"
- [ ] Keyboard shortcuts work (Space, R, S)
- [ ] Timer accuracy after tab switch
- [ ] Rapid start clicks don't break timer
- [ ] No console errors

#### game.js Checklist
- [ ] Status message displays on load
- [ ] Folder picker accepts videos
- [ ] Warning with <4 videos
- [ ] Success with 4+ videos
- [ ] Video playback in quadrants
- [ ] All controls work (shuffle, sound, fullscreen, etc.)
- [ ] Memory usage reasonable with many videos
- [ ] Videos pause/resume on tab switch
- [ ] No console errors

## 📈 Performance Benchmarks

### Expected Performance (60 FPS = 16.67ms/frame)

**TTime.js**
- updateDisplay(): < 1ms ✓
- updateTimer(): < 0.1ms ✓
- Full update cycle: < 2ms ✓
- Memory usage: < 5MB ✓

**game.js**
- Single video playback: 10-30ms/frame (acceptable)
- Dual video playback: 20-60ms/frame (acceptable)
- Timer updates: < 1ms per timer ✓
- Video loading: 100-500ms per video (I/O bound) ✓
- Memory usage: 50-200MB (acceptable)

## 📝 Code Quality

### Error Handling
- ✅ All DOM queries wrapped in try/catch
- ✅ Invalid inputs handled gracefully
- ✅ User-friendly error messages
- ✅ Console logging for debugging

### Performance Optimization
- ✅ Direct DOM manipulation (no layout thrashing)
- ✅ Debounce utility available
- ✅ Memory cleanup on page unload
- ✅ Tab visibility detection
- ✅ Video limit enforcement

### Best Practices
- ✅ Consistent naming conventions
- ✅ Comprehensive documentation
- ✅ Separation of concerns
- ✅ No global namespace pollution
- ✅ Responsive design

## 🔍 Analysis Report

For detailed analysis including:
- Complete function call flows
- Failure point mitigations
- Performance optimization recommendations
- Test suite specifications

See: **[FUNCTION_ORDER_ANALYSIS.md](./FUNCTION_ORDER_ANALYSIS.md)**

## 🛠️ Browser Support

### Required Features
- HTML5 Video
- ES6 JavaScript
- CSS3 (Grid, Flexbox, Animations)
- File API (for video loading)

### Optional Features
- Fullscreen API (enhanced UX)
- webkitdirectory (folder picker)

### Tested Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 License

This project is provided as-is for educational and testing purposes.

## 🤝 Contributing

This is a test project for function order analysis and failure point identification. See `FUNCTION_ORDER_ANALYSIS.md` for the comprehensive testing and analysis report.
