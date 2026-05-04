// Thai digit classes recognised by the model (๑๑–๑๕ = 11–15)
const CLASSES = ['๑๑', '๑๒', '๑๓', '๑๔', '๑๕'];

// Mapping from Thai numeral string to its Arabic equivalent
const ARABIC = {
  '๑๑': '11',
  '๑๒': '12',
  '๑๓': '13',
  '๑๔': '14',
  '๑๕': '15',
};

// Number of samples to collect per class in the dataset collection tab
const COLLECTION_TARGET = 50;
