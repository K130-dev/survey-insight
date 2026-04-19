export function calculateChiSquare(observed: number[][]): { chiSquare: number, df: number, pValue: number, valid: boolean } {
  if (!observed || observed.length === 0 || observed[0].length === 0) {
    return { chiSquare: 0, df: 0, pValue: 1, valid: false };
  }

  const numRows = observed.length;
  const numCols = observed[0].length;
  
  // Need at least 2x2 table
  if (numRows < 2 || numCols < 2) {
    return { chiSquare: 0, df: 0, pValue: 1, valid: false };
  }
  
  let total = 0;
  const rowTotals = new Array(numRows).fill(0);
  const colTotals = new Array(numCols).fill(0);
  
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      const val = observed[i][j] || 0;
      total += val;
      rowTotals[i] += val;
      colTotals[j] += val;
    }
  }
  
  if (total === 0) {
    return { chiSquare: 0, df: 0, pValue: 1, valid: false };
  }
  
  let chiSquare = 0;
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      const expected = (rowTotals[i] * colTotals[j]) / total;
      if (expected > 0) {
        chiSquare += Math.pow((observed[i][j] || 0) - expected, 2) / expected;
      }
    }
  }
  
  const df = (numRows - 1) * (numCols - 1);
  
  // Approximation for p-value using chi-square distribution
  const pValue = 1 - chiSquareCDF(chiSquare, df);
  
  return { chiSquare, df, pValue, valid: true };
}

// Simple approximation for Chi-Square CDF
function chiSquareCDF(x: number, k: number): number {
  if (x < 0 || k < 1) return 0;
  if (k === 1) return 2 * normalCDF(Math.sqrt(x)) - 1;
  if (k === 2) return 1 - Math.exp(-x / 2);
  
  // For larger k, use Wilson-Hilferty transformation
  const z = (Math.pow(x / k, 1/3) - (1 - 2 / (9 * k))) / Math.sqrt(2 / (9 * k));
  return normalCDF(z);
}

function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}
