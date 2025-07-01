const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const mammoth = require('mammoth');
const puppeteer = require('puppeteer');

// Try LibreOffice first, fall back to mammoth+puppeteer
const convertDocumentToPdf = async (inputPath, outputPath = null) => {
    try {
        const ext = path.extname(inputPath).toLowerCase();
        
        if (!['.doc', '.docx'].includes(ext)) {
            throw new Error('Unsupported document format. Only .doc and .docx files are supported.');
        }

        // Generate output path if not provided
        if (!outputPath) {
            const baseName = path.basename(inputPath, ext);
            const dir = path.dirname(inputPath);
            outputPath = path.join(dir, `${baseName}.pdf`);
        }

        // Try LibreOffice first for perfect formatting preservation
        try {
            await convertWithLibreOffice(inputPath, outputPath);
            return {
                success: true,
                outputPath: outputPath,
                method: 'LibreOffice'
            };
        } catch (libreOfficeError) {
            console.log('LibreOffice conversion failed, falling back to mammoth+puppeteer:', libreOfficeError.message);
            
            // Fallback to mammoth+puppeteer
            await convertWithMammoth(inputPath, outputPath);
            return {
                success: true,
                outputPath: outputPath,
                method: 'mammoth+puppeteer',
                warning: 'Used fallback method - some formatting may be lost'
            };
        }

    } catch (error) {
        throw new Error(`Document conversion failed: ${error.message}`);
    }
};

// LibreOffice conversion (preserves all formatting)
const convertWithLibreOffice = (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
        const outputDir = path.dirname(outputPath);
        const outputName = path.basename(outputPath, '.pdf');
        
        // LibreOffice command: soffice --headless --convert-to pdf --outdir <dir> <file>
        const soffice = spawn('soffice', [
            '--headless',
            '--convert-to', 'pdf',
            '--outdir', outputDir,
            inputPath
        ]);

        let stderr = '';
        
        soffice.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        
        soffice.on('close', (code) => {
            if (code === 0) {
                // LibreOffice creates file with original name + .pdf
                const baseName = path.basename(inputPath, path.extname(inputPath));
                const libreOfficeOutput = path.join(outputDir, `${baseName}.pdf`);
                
                // Rename to desired output path if different
                if (libreOfficeOutput !== outputPath) {
                    require('fs').renameSync(libreOfficeOutput, outputPath);
                }
                
                resolve();
            } else {
                reject(new Error(`LibreOffice conversion failed with code ${code}: ${stderr}`));
            }
        });
        
        soffice.on('error', (error) => {
            reject(new Error(`Failed to start LibreOffice: ${error.message}`));
        });
    });
};

// Fallback mammoth+puppeteer conversion
const convertWithMammoth = async (inputPath, outputPath) => {
    // Convert Word document to HTML
    const result = await mammoth.convertToHtml({ path: inputPath });
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { 
                    font-family: 'Times New Roman', Times, serif; 
                    margin: 40px; 
                    line-height: 1.4; 
                    font-size: 12pt;
                }
                h1, h2, h3, h4, h5, h6 { color: #000; margin: 16px 0 8px 0; }
                p { margin: 8px 0; text-align: justify; }
                table { border-collapse: collapse; width: 100%; margin: 10px 0; }
                td, th { border: 1px solid #ccc; padding: 4px 8px; }
                .bold { font-weight: bold; }
                .italic { font-style: italic; }
                .underline { text-decoration: underline; }
            </style>
        </head>
        <body>
            ${result.value}
        </body>
        </html>
    `;

    // Launch puppeteer and convert HTML to PDF
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    await page.pdf({
        path: outputPath,
        format: 'A4',
        margin: {
            top: '25mm',
            right: '25mm',
            bottom: '25mm',
            left: '25mm'
        },
        printBackground: true
    });

    await browser.close();
};

module.exports = {
    convertDocumentToPdf
};