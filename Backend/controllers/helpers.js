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
  return file.location || file.url || file.path || null;
}

export function getFileKey(file) {
  if (!file) return null;
  return file.key || file.filename || file.originalname || null;
}