// Excluded patterns for files we don't want to process
export const EXCLUDED_PATTERNS = [
  // Build and Dependencies
  /node_modules/,
  /bower_components/,
  /dist/,
  /build/,
  /\.next/,
  /\.git/,
  /\.svn/,
  /\.DS_Store/,
  
  // Binary and Compiled files
  /\.exe$/,
  /\.dll$/,
  /\.so$/,
  /\.dylib$/,
  /\.bin$/,
  /\.dat$/,
  /\.db$/,
  /\.sqlite$/,
  
  // Images
  /\.(jpg|jpeg|png|gif|bmp|ico|webp)$/i,
  
  // Audio/Video
  /\.(mp3|wav|ogg|mp4|avi|mov|wmv)$/i,
  
  // Archives
  /\.(zip|rar|7z|tar|gz)$/i,
  
  // Other binary formats
  /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i
];

// Check if a file should be excluded
export const shouldExcludeFile = (filename) => {
  return EXCLUDED_PATTERNS.some(pattern => pattern.test(filename));
};

// Generate a unique blob name for a file
export const generateBlobName = (projectId, filePath) => {
  // Remove leading slashes and normalize path separators
  const normalizedPath = filePath.replace(/^[\/\\]+/, '').replace(/\\/g, '/');
  return `${projectId}/${normalizedPath}`;
};

// Get content type for a file
export const getContentType = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const textTypes = {
    'txt': 'text/plain',
    'js': 'text/javascript',
    'jsx': 'text/javascript',
    'ts': 'text/typescript',
    'tsx': 'text/typescript',
    'json': 'application/json',
    'md': 'text/markdown',
    'css': 'text/css',
    'scss': 'text/scss',
    'html': 'text/html',
    'xml': 'text/xml',
    'yaml': 'text/yaml',
    'yml': 'text/yaml',
    'py': 'text/x-python',
    'rb': 'text/x-ruby',
    'php': 'text/x-php',
    'java': 'text/x-java',
    'c': 'text/x-c',
    'cpp': 'text/x-c++',
    'go': 'text/x-go',
    'rs': 'text/x-rust',
  };
  
  return textTypes[ext] || 'text/plain';
};
