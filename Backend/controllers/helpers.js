export function getFileType(mimeOrExt = '') {
  const val = String(mimeOrExt || '').toLowerCase();
  const ext = val.includes('/') ? val.split('/').pop() : val.replace(/^\./, '');
  if (!ext) return 'other';

  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
  const pdfExts = ['pdf'];
  const pptExts = ['ppt', 'pptx'];
  const docExts = ['doc', 'docx', 'msword', 'vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const xlsExts = ['xls', 'xlsx', 'vnd.ms-excel', 'vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

  if (imageExts.includes(ext)) return 'image';
  if (pdfExts.includes(ext)) return 'pdf';
  if (pptExts.includes(ext)) return 'pptx';
  if (docExts.includes(ext)) return 'docx';
  if (xlsExts.includes(ext)) return 'xlsx';
  return 'other';
}

export function getFileUrl(file) {
  if (!file) return null;
  
  // If it's an S3 URL (location), return as is
  if (file.location) return file.location;
  
  // If it's already a URL, return as is
  if (file.url && (file.url.startsWith('http://') || file.url.startsWith('https://'))) {
    return file.url;
  }
  
  // If it's a local file path, convert to URL
  if (file.path) {
    // Check if it's already a URL path
    if (file.path.startsWith('/uploads/') || file.path.startsWith('uploads/')) {
      const cleanPath = file.path.replace(/\\/g, '/').replace(/^uploads\//, '/uploads/');
      const baseURL = process.env.BACKEND_URL || 'http://localhost:5000';
      return `${baseURL}${cleanPath}`;
    }
    // If it's a full Windows path, extract just the filename
    const filename = file.path.split(/[/\\]/).pop();
    const baseURL = process.env.BACKEND_URL || 'http://localhost:5000';
    return `${baseURL}/uploads/${filename}`;
  }
  
  // If it's just a filename
  if (file.filename) {
    const baseURL = process.env.BACKEND_URL || 'http://localhost:5000';
    return `${baseURL}/uploads/${file.filename}`;
  }
  
  return null;
}

export function getFileKey(file) {
  if (!file) return null;
  return file.key || file.filename || file.originalname || null;
}