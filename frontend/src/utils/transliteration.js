/**
 * Transliterates Arabic text to English phonetic representation.
 * Handles common name patterns and provides fallback mapping.
 */
export const transliterateArabic = (text) => {
  if (!text) return '';

  const charMapping = {
    'أ': 'A', 'إ': 'E', 'آ': 'A', 'ا': 'A',
    'ب': 'B',
    'ت': 'T',
    'ث': 'Th',
    'ج': 'G', // Egyptian 'G'
    'ح': 'H',
    'خ': 'Kh',
    'د': 'D',
    'ذ': 'Dh',
    'ر': 'R',
    'ز': 'Z',
    'س': 'S',
    'ش': 'Sh',
    'ص': 'S',
    'ض': 'D',
    'ط': 'T',
    'ظ': 'Z',
    'ع': 'A',
    'غ': 'Gh',
    'ف': 'F',
    'ق': 'Q',
    'ك': 'K',
    'ل': 'L',
    'م': 'M',
    'ن': 'N',
    'ه': 'H',
    'و': 'W',
    'ي': 'Y', 'ى': 'A',
    'ة': 'a',
    'ء': "'",
    'ئ': 'E',
    'ؤ': 'O',
    ' ': ' '
  };

  const nameMapping = {
    'محمد': 'Mohamed',
    'أحمد': 'Ahmed',
    'محمود': 'Mahmoud',
    'عبدالمنعم': 'Abdalmonem',
    'علي': 'Ali',
    'خالد': 'Khaled',
    'عبدالرحمن': 'Abdalrahman',
    'عبد': 'Abd'
  };

  // Split into words to handle common names and "Abd" prefixes
  const words = text.trim().split(/\s+/);
  
  const transliteratedWords = words.map(word => {
    // Direct dictionary match
    if (nameMapping[word]) return nameMapping[word];

    // Handle "Abdel" prefixes
    if (word.startsWith('عبد')) {
        const remaining = word.slice(3);
        const mappedRemaining = nameMapping[remaining] || 
                                remaining.split('').map(c => charMapping[c] || c).join('');
        return 'Abd' + mappedRemaining.toLowerCase();
    }

    // Phonetic fallback
    return word.split('').map(char => charMapping[char] || char).join('');
  });

  // Final formatting (Title Case)
  return transliteratedWords
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
};
