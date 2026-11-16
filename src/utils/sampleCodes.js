export const SAMPLE_CODES = {
  binarySearch: `// Sample 1: Binary Search (O(log n) Logarithmic Time)
// Notice how the ML Engine detects O(log n) and a clean Cyclomatic Complexity (M = 3)

function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] === target) {
      return mid; // Element found at index
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1; // Target not found
}

// Demo Execution
const dataset = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
const targetValue = 23;
const index = binarySearch(dataset, targetValue);

console.log("Dataset:", dataset);
console.log("Searching for:", targetValue);
console.log("Result Index:", index);
`,

  highComplexity: `// Sample 2: Nested Matrix Multiplication (O(n^2) Quadratic & Code Smells)
// Notice how the ML Engine triggers HIGH DEFECT RISK, high Cyclomatic Complexity, and flags anti-patterns!

function processMatrixPairs(matrixA, matrixB) {
  var total = 0;
  // Anti-pattern 1: Loose equality (smell)
  if (matrixA.length == 0) {
    return 0;
  }

  // Nested Loop Layer 1
  for (var i = 0; i < matrixA.length; i++) {
    // Nested Loop Layer 2 (Quadratic O(n^2))
    for (var j = 0; j < matrixB.length; j++) {
      if (matrixA[i] > 10) {
        if (matrixB[j] < 50) {
          total += matrixA[i] * matrixB[j];
        } else {
          total += matrixB[j];
        }
      }
    }
  }

  // Anti-pattern 2: Empty catch block (silent error suppression)
  try {
    console.log("Processing finished.");
  } catch (err) {}

  return total;
}

const res = processMatrixPairs([12, 15, 8, 20], [5, 45, 60, 2]);
console.log("Computed Total:", res);
`,

  cleanQuickSort: `// Sample 3: Quick Sort Algorithm (Divide & Conquer)
// Clean recursive implementation with optimal algorithmic structure

function quickSort(arr) {
  if (arr.length <= 1) {
    return arr;
  }

  const pivot = arr[arr.length - 1];
  const left = [];
  const right = [];

  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] < pivot) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }

  return [...quickSort(left), pivot, ...quickSort(right)];
}

const unsorted = [64, 34, 25, 12, 22, 11, 90, 5];
console.log("Unsorted Array:", unsorted);
console.log("Sorted Array:  ", quickSort(unsorted));
`
};
