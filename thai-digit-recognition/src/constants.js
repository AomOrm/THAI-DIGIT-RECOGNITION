// Thai digit classes recognised by the model (๑๖–๒๐ = 16–20)
const CLASSES = ['๑๖', '๑๗', '๑๘', '๑๙', '๒๐'];

// Mapping from Thai numeral string to its Arabic equivalent
const ARABIC = {
  '๑๖': '16',
  '๑๗': '17',
  '๑๘': '18',
  '๑๙': '19',
  '๒๐': '20',
};

// Number of samples to collect per class in the dataset collection tab
const COLLECTION_TARGET = 100;
