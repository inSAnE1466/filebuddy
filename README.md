# FileBuddy Buddy buddy buddy  BUDDY

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Your friendly command-line file conversion sidekick. FileBuddy is a simple, powerful, and extensible CLI tool built with Node.js to handle common file conversions, saving you from sketchy websites and cumbersome software.

## The Goal

In a world of subscriptions and ad-filled online tools, sometimes you just want a simple utility that works locally, quickly, and privately. FileBuddy was created to solve common, everyday conversion tasks without the hassle.

-   **Private:** All conversions happen on your machine. Your files and links are never sent to a third-party server.
-   **Fast:** Uses highly optimized, modern libraries for quick conversions.
-   **Extensible:** Built with a modular structure, making it easy to add new conversion types in the future.

## Current Features

-   **YouTube to MP3:** Download the audio from any YouTube video directly as an MP3 file.
-   **Image Conversion:** Convert between common image formats like PNG, JPG, WEBP, and more.

## A Note on Ethical Use

FileBuddy is a tool, and like any tool, it should be used responsibly. The YouTube-to-MP3 functionality is intended for legitimate, personal-use cases under the principles of "fair use" or "fair dealing," such as:

-   **Time-Shifting:** Saving audio from a freely available stream to listen to at a more convenient time (e.g., on a run or swim with local-storage headphones).
-   **Personal Archiving:** Creating a personal, private backup of content you have the right to access.

**You, the user, are solely responsible for respecting copyright and adhering to the Terms of Service of any platform you use FileBuddy with.** Please do not use this tool to pirate copyrighted material. The developers of FileBuddy do not condone piracy and are not liable for any misuse of this software.

## Tech Stack

-   **Runtime:** [Node.js](https://nodejs.org/)
-   **CLI Framework:** [Yargs](https://yargs.js.org/) for robust command-line argument parsing.
-   **YouTube Core:** [ytdl-core](https://github.com/fent/node-ytdl-core) for interfacing with YouTube.
-   **Audio/Video Conversion:** [FFmpeg](https://ffmpeg.org/) (via `fluent-ffmpeg` and `ffmpeg-static`) for reliable media transcoding.
-   **Image Processing:** [Sharp](https://sharp.pixelplumbing.com/) for high-performance image manipulation.
-   **Terminal UX:** [Chalk](https://github.com/chalk/chalk) for beautiful terminal output.

## Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/filebuddy.git
    cd filebuddy
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Make it a Global Command (Recommended):**
    This allows you to run `filebuddy` from anywhere in your terminal.
    ```bash
    npm link
    ```

## Usage

The basic command structure is `filebuddy convert <source> [destination]`.

#### YouTube to MP3

```bash
# FileBuddy will automatically detect the YouTube URL
# The output file will be named after the video title (e.g., "Video Title.mp3")
filebuddy convert "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

# You can also specify a custom output name
filebuddy convert "https://www.youtube.com/watch?v=dQw4w9WgXcQ" my-song.mp3
```

#### Image Conversion

```bash
# Sharp is smart enough to infer the output type from the extension
# This will convert my-image.png to my-image.jpg
filebuddy convert my-image.png my-image.jpg

# Convert a PNG to a WEBP
filebuddy convert photo.png photo.webp
```

## Roadmap

-   [ ] **Interactive Mode:** An interactive TUI (Terminal User Interface) for users who prefer a guided experience over CLI flags.
-   [ ] **Video to GIF Conversion:** Add support for converting short video clips to animated GIFs.
-   [ ] **Batch Processing:** Allow converting a whole folder of files at once.

## Contributing

This is an open-source project. Contributions, issues, and feature requests are welcome!

## License

This project is licensed under the MIT License. See the [LICENSE.md](LICENSE.md) file for details.