
// Import raw JSON (Vite supports JSON imports)
import rawData from './lenscrafter_output.json';
import { LensCrafterAdapter } from './LensCrafterAdapter.js';

// Adapt immediately
export const airailLive = LensCrafterAdapter.adapt(rawData);
