const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Path to Python parser script
const PARSER_SCRIPT = path.join(__dirname, '../utils/parser/resume_parser.py');

/**
 * Parse resume using Python script
 * @param {string} filePath - Path to the resume file
 * @returns {Promise<object>} - Parsed resume data
 */
function parseWithPython(filePath) {
  return new Promise((resolve, reject) => {
    // Try different Python commands
    const pythonCommands = ['python3', 'python'];
    let currentIndex = 0;

    function tryPython(pythonCmd) {
      const process = spawn(pythonCmd, [PARSER_SCRIPT, filePath]);

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('error', (error) => {
        // If command not found, try next Python command
        if (error.code === 'ENOENT' && currentIndex < pythonCommands.length - 1) {
          currentIndex++;
          tryPython(pythonCommands[currentIndex]);
        } else {
          reject(new Error(`Python not found. Please install Python 3 and required packages.`));
        }
      });

      process.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(stdout);
            resolve(result);
          } catch (parseError) {
            reject(new Error(`Failed to parse Python output: ${parseError.message}`));
          }
        } else {
          reject(new Error(stderr || `Python script exited with code ${code}`));
        }
      });
    }

    tryPython(pythonCommands[currentIndex]);
  });
}

/**
 * Parse resume endpoint handler
 */
const parseResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded' });
    }

    const file = req.file;
    const fileExtension = path.extname(file.originalname).toLowerCase();

    // Validate file type
    if (!['.pdf', '.docx', '.doc'].includes(fileExtension)) {
      // Clean up file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({ error: 'Invalid file type. Please upload a PDF or DOCX file.' });
    }

    // Check if Python parser script exists
    if (!fs.existsSync(PARSER_SCRIPT)) {
      // Clean up file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(500).json({
        error: 'Resume parser not configured properly',
        details: process.env.NODE_ENV === 'development' ? 'Python parser script not found' : undefined
      });
    }

    // Parse using Python script
    const result = await parseWithPython(file.path);

    // Clean up the uploaded file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Failed to parse resume'
      });
    }

  } catch (error) {
    console.error('Resume parsing error:', error);

    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // Check for specific error types
    if (error.message.includes('Python not found')) {
      return res.status(500).json({
        error: 'Resume parsing service not available. Please install Python 3.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    if (error.message.includes('pdfplumber') || error.message.includes('python-docx')) {
      return res.status(500).json({
        error: 'Resume parsing dependencies not installed. Please run: pip install pdfplumber python-docx',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    res.status(500).json({
      error: 'Failed to parse resume. Please try again or fill the form manually.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  parseResume
};
