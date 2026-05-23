import { readFileSync } from 'fs';

// Lê JSON tolerando BOM (alguns editores no Windows gravam U+FEFF no início,
// e JSON.parse rejeita). Use em todo lugar que lê state.json e afins.
export function readJsonSafe(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8').replace(/^﻿/, ''));
}
