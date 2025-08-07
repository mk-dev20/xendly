export const getFlagImage = (filename: string): any => {
  switch (filename.toLowerCase()) {
    case 'ke.png':
      return require('@/assets/images/ke.png');
    case 'ug.png':
      return require('@/assets/images/ug.png');
    case 'tz.png':
      return require('@/assets/images/tz.png');
    case 'rw.png':
      return require('@/assets/images/rw.png');
    case 'br.png':
      return require('@/assets/images/br.png');
    default:
      return require('@/assets/images/xlm.png'); // fallback
  }
};
