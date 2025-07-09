# Memory Link Game - Sound Effects Documentation

## Overview
The Memory Link game now includes immersive sound effects to enhance the gaming experience. All sounds are generated using the Web Audio API, ensuring instant availability without requiring external audio files.

## Sound Effects Added

### Game Flow Sounds
- **Countdown Sound** (`countdown`): A sharp beep that plays during the "3, 2, 1" countdown
- **Game Start** (`gameStart`): An ascending tone that plays when the game begins after "GO!"
- **Level Complete** (`levelComplete`): A harmonious chord that celebrates completing a level
- **Game Over** (`gameOver`): A descending tone that plays when the player makes a mistake

### Interaction Sounds
- **Button Hover** (`buttonClick`): A subtle tone when hovering over buttons during input phase
- **Correct Click** (`correctClick`): A pleasant tone when clicking the correct button in sequence
- **Wrong Click** (`wrongClick`): A harsh, distinctive sound when clicking the wrong button
- **Sequence Show** (`sequenceShow`): A crisp tone that plays for each button during pattern display

### Special Event Sounds
- **Risk/Reward Modal** (`riskReward`): A contemplative tone when the risk/reward decision appears
- **Cash Out** (`cashOut`): A triumphant chord when successfully cashing out

## Sound Controls

### Settings Menu
The game includes comprehensive sound controls accessible through the Settings button:

1. **Sound Toggle**: Enable or disable all sound effects
2. **Volume Slider**: Adjust the master volume from 0% to 100%
3. **Test Sound Button**: Preview the sound effects with the current volume setting

### Persistence
- Volume and sound enable/disable settings are saved in localStorage
- Settings persist across browser sessions
- Default volume is set to 50%

## Technical Implementation

### Sound Manager
- **File**: `/js/sound-manager.js`
- **Class**: `SoundManager`
- Uses Web Audio API for real-time sound generation
- Automatically handles browser audio context policies
- Graceful degradation if audio is not supported

### Integration
- Sounds are triggered at key moments during gameplay
- Volume control affects all sounds uniformly
- Sounds respect the user's enable/disable preference
- Audio context is resumed automatically when needed

## Usage Tips

1. **First Time Playing**: You may need to interact with the page once before sounds can play (browser security requirement)
2. **Volume Control**: Use the settings menu to adjust volume to your preference
3. **Disable Sounds**: Toggle off sound effects if you prefer silent gameplay
4. **Test Audio**: Use the "Test Sound" button to verify your audio setup

## Browser Compatibility
- Works in all modern browsers that support Web Audio API
- Chrome, Firefox, Safari, Edge (latest versions)
- Graceful fallback for browsers without audio support
