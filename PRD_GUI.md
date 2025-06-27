# PRD: FileBuddy GUI Drag-Drop Interface

## Objective
Create a native desktop GUI for FileBuddy with drag-drop functionality, format selection dropdowns, and instant conversion with desktop output.

## Success Criteria
- [ ] Native desktop app (not browser-based)
- [ ] Drag-and-drop file interface
- [ ] Format selection dropdowns (input/output)
- [ ] Instant conversion on file drop
- [ ] Auto-save converted files to Desktop
- [ ] Progress indication during conversion
- [ ] Support all core formats (YouTube, images, documents)

## User Experience Flow
1. **Launch App**: Clean, minimal interface with drop zone
2. **Select Formats**: Dropdown menus for input/output format selection
3. **Drop File/URL**: Drag file or paste URL into drop zone
4. **Instant Conversion**: Conversion begins immediately on drop
5. **Desktop Output**: Converted file automatically saves to ~/Desktop
6. **Completion Feedback**: Success notification with file location

## Interface Design

### Main Window
```
┌─────────────────────────────────────┐
│  FileBuddy - File Converter         │
├─────────────────────────────────────┤
│ Input:  [YouTube URL ▼] [Auto-detect]│
│ Output: [MP3 ▼]         [Desktop ▼] │
├─────────────────────────────────────┤
│                                     │
│     📁 Drop files here or           │
│        paste YouTube URLs           │
│                                     │
│     [Currently: Auto-detect mode]   │
├─────────────────────────────────────┤
│ ████████████░░░ 75% Converting...   │
│ ✓ song.mp3 saved to Desktop        │
└─────────────────────────────────────┘
```

### Format Support Matrix
| Input Type | Supported Outputs |
|------------|------------------|
| YouTube URL | MP3, WAV, M4A |
| PNG/JPG/WEBP | PNG, JPG, WEBP, GIF, TIFF, AVIF |
| DOCX/DOC | PDF, TXT, HTML |
| Video (MP4/AVI) | MP3, GIF, MP4 |

### Technical Implementation

#### Framework Choice: Tauri
- **Why Tauri**: Native performance, small bundle size, secure
- **Frontend**: HTML/CSS/JS (lightweight, familiar)
- **Backend**: Node.js integration for existing converters
- **Bundle Size**: <10MB (vs Electron's ~100MB+)

#### Core Features
1. **Drag-Drop Handler**
   - File system access for local files
   - URL detection for YouTube links
   - Multi-file support for batch processing

2. **Format Detection & Selection**
   - Auto-detect input format from file extension/URL
   - Smart output format suggestions
   - Manual override via dropdowns

3. **Conversion Engine**
   - Reuse existing CLI converters
   - Progress tracking with visual feedback
   - Background processing (non-blocking UI)

4. **File Management**
   - Default save location: ~/Desktop
   - Configurable output directory
   - Auto-naming with conflict resolution

#### Advanced Features
- **Batch Processing**: Drop multiple files for bulk conversion
- **Format Presets**: Quick buttons for common conversions
- **History**: Recently converted files list
- **Settings**: Output location, quality preferences
- **System Integration**: Right-click "Convert with FileBuddy"

## Technical Architecture

### App Structure
```
filebuddy-gui/
├── src-tauri/          # Rust backend
│   ├── tauri.conf.json # App configuration
│   ├── Cargo.toml      # Rust dependencies
│   └── src/main.rs     # Tauri app entry
├── src/                # Frontend
│   ├── index.html      # Main interface
│   ├── style.css       # UI styling
│   ├── app.js          # UI logic
│   └── converter.js    # Conversion integration
└── package.json        # Node.js dependencies
```

### Key Dependencies
- **Tauri**: Native app framework
- **Existing converters**: Reuse CLI modules
- **File system APIs**: For drag-drop and desktop saving

## Development Phases

### Phase 1: Basic GUI (MVP)
- [ ] Tauri app setup with drag-drop zone
- [ ] Integration with existing YouTube converter
- [ ] Basic file output to Desktop
- [ ] Simple progress indication

### Phase 2: Format Selection
- [ ] Input/output format dropdowns
- [ ] Image converter integration
- [ ] Auto-format detection
- [ ] Better UI polish

### Phase 3: Advanced Features
- [ ] Document conversion (.docx → .pdf)
- [ ] Batch processing support
- [ ] Settings panel
- [ ] System notifications

### Phase 4: Distribution
- [ ] App signing and notarization
- [ ] Installation packages (DMG, MSI, AppImage)
- [ ] Auto-updater integration

## Questions for Clarification
1. **Platform Priority**: macOS first, then Windows/Linux? Or cross-platform from start?
2. **Output Location**: Always Desktop, or configurable with Desktop as default?
3. **File Naming**: Auto-generate names or prompt user for custom names?
4. **Batch Processing**: Handle multiple files dropped simultaneously?
5. **YouTube Quality**: Default to highest quality or provide quality selection?

## Success Metrics
- [ ] App launches in <3 seconds
- [ ] File conversion completes in same time as CLI version
- [ ] Zero-click conversion (drop → immediate processing)
- [ ] Files reliably saved to Desktop with clear naming
- [ ] Works offline (except YouTube downloads)