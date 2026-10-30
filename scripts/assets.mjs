import { parse } from 'node:path';

// Asset name = file name without extension, lowercased, "(" -> "-", ")" dropped:
//   background_06(01).png -> background_06-01, character_17-MATEO.png -> character_17-mateo
export const assetName = file =>
  parse(file).name.toLowerCase().replace(/\(/g, '-').replace(/\)/g, '');
