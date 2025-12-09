#!/usr/bin/env node

const express = require('express');
const multer = require('multer');
const path = require('path');
const { spawn } = require('child_process');
const cors = require('cors');
const fs = require('fs');
const os = require('os');

const app = express();
const PORT = 3000;

// Idle timeout configuration (15 minutes)
const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
let lastActivityTime = Date.now();
let idleTimer;

// Function to reset idle timer
function resetIdleTimer() {
    lastActivityTime = Date.now();
    if (idleTimer) {
        clearTimeout(idleTimer);
    }
    idleTimer = setTimeout(() => {
        console.log('Server has been idle for 15 minutes. Shutting down...');
        process.exit(0);
    }, IDLE_TIMEOUT);
}

// Middleware to track activity
app.use((req, res, next) => {
    resetIdleTimer();
    next();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Multer configuration for file uploads
const upload = multer({
    dest: os.tmpdir(),
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});

// Helper function to run FileBuddy CLI
function runFileBuddyCLI(args) {
    return new Promise((resolve, reject) => {
        console.log('Running FileBuddy CLI:', args.join(' '));
        
        const child = spawn('node', ['./index.js', ...args], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: __dirname
        });
        
        let stdout = '';
        let stderr = '';
        
        child.stdout.on('data', (data) => {
            stdout += data.toString();
            console.log('CLI Output:', data.toString().trim());
        });
        
        child.stderr.on('data', (data) => {
            stderr += data.toString();
            console.error('CLI Error:', data.toString().trim());
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                resolve({ stdout, stderr });
            } else {
                reject(new Error(`CLI exited with code ${code}: ${stderr || stdout}`));
            }
        });
        
        child.on('error', (error) => {
            reject(new Error(`Failed to start CLI: ${error.message}`));
        });
    });
}

// API Routes

// Health check
app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'online',
        timestamp: new Date().toISOString(),
        server: 'FileBuddy GUI Server v1.0.0'
    });
});

// File conversion endpoint
app.post('/api/convert/file', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }
        
        const { outputFormat } = req.body;
        const inputPath = req.file.path;
        const originalName = req.file.originalname;

        console.log(`Converting file: ${originalName} to ${outputFormat}`);
        
        // Run FileBuddy CLI with output format
        let result;
        let finalOutputPath;
        
        if (outputFormat === 'pdf') {
            // For PDF conversion, rename temp file with proper extension and specify output path
            const originalExt = path.extname(originalName);
            const tempFileWithExt = inputPath + originalExt;
            fs.renameSync(inputPath, tempFileWithExt);
            
            const baseName = path.basename(originalName, path.extname(originalName));
            finalOutputPath = path.join(os.homedir(), 'Desktop', `${baseName}.pdf`);
            result = await runFileBuddyCLI(['convert', tempFileWithExt, finalOutputPath]);
            
            // Clean up renamed temp file
            fs.unlinkSync(tempFileWithExt);
        } else {
            // For image conversion, rename temp file with proper extension
            const originalExt = path.extname(originalName);
            const tempFileWithExt = inputPath + originalExt;
            fs.renameSync(inputPath, tempFileWithExt);
            
            result = await runFileBuddyCLI(['convert', tempFileWithExt]);
            
            // Clean up renamed temp file
            fs.unlinkSync(tempFileWithExt);
            
            // Extract output path from CLI response
            const outputMatch = result.stdout.match(/Output: (.+)/);
            finalOutputPath = outputMatch ? outputMatch[1].trim() : 'Desktop';
        }
        
        res.json({
            success: true,
            message: 'File converted successfully',
            outputPath: finalOutputPath,
            originalName
        });
        
    } catch (error) {
        console.error('File conversion error:', error.message);
        
        // Clean up temp file if it exists
        if (req.file) {
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            // Also try with extension in case it was renamed
            const originalExt = path.extname(req.file.originalname);
            const tempFileWithExt = req.file.path + originalExt;
            if (fs.existsSync(tempFileWithExt)) {
                fs.unlinkSync(tempFileWithExt);
            }
        }
        
        res.status(500).send(error.message);
    }
});

// YouTube conversion endpoint
app.post('/api/convert/youtube', async (req, res) => {
    try {
        const { url, outputFormat } = req.body;
        
        if (!url) {
            return res.status(400).send('No URL provided');
        }

        console.log(`Converting YouTube URL: ${url} to ${outputFormat}`);
        
        // Run FileBuddy CLI
        const result = await runFileBuddyCLI(['convert', url]);
        
        // Extract title and output path from CLI response
        const titleMatch = result.stdout.match(/Title: (.+)/);
        const outputMatch = result.stdout.match(/Output: (.+)/);
        
        const title = titleMatch ? titleMatch[1].trim() : 'Unknown Video';
        const outputPath = outputMatch ? outputMatch[1].trim() : 'Desktop';
        
        res.json({
            success: true,
            title,
            outputPath,
            message: 'YouTube video converted successfully'
        });
        
    } catch (error) {
        console.error('YouTube conversion error:', error.message);
        res.status(500).send(error.message);
    }
});

// Serve the standalone GUI
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'gui-standalone.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: error.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log('FileBuddy GUI Server started');
    console.log(`Open in browser: http://localhost:${PORT}`);
    console.log(`API endpoint: http://localhost:${PORT}/api`);
    console.log('Drag & drop files or paste YouTube URLs to convert');
    console.log('Files will be saved to your Desktop automatically');
    console.log('Server will auto-shutdown after 15 minutes of inactivity');
    console.log('');
    console.log('Press Ctrl+C to stop the server');
    
    // Start the idle timer
    resetIdleTimer();
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down FileBuddy GUI Server...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nShutting down FileBuddy GUI Server...');
    process.exit(0);
});