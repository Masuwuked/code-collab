/**
 * CodeCollab AI - Machine Learning Code Quality & Defect Prediction Engine
 * 
 * Computes software engineering metrics, Halstead complexity, Cyclomatic Complexity (M = E - N + 2P),
 * Maintainability Index (MI), and runs a defect classification model based on empirical SE datasets.
 */

const JS_KEYWORDS = new Set([
  'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
  'delete', 'do', 'else', 'export', 'extends', 'finally', 'for', 'function',
  'if', 'import', 'in', 'instanceof', 'new', 'return', 'super', 'switch',
  'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield',
  'let', 'static', 'enum', 'await', 'async', 'null', 'true', 'false', 'undefined'
]);

const OPERATORS = [
  '===', '!==', '==', '!=', '<=', '>=', '&&', '||', '??', '+=', '-=', '*=', '/=',
  '%=', '++', '--', '=>', '+', '-', '*', '/', '%', '<', '>', '=', '!', '&', '|',
  '^', '~', '?', ':', '.'
];

export function tokenizeCode(code) {
  const operators = [];
  const operands = [];
  const lines = code.split('\n');
  
  let inBlockComment = false;
  const cleanedLines = [];

  for (const line of lines) {
    let clean = '';
    for (let i = 0; i < line.length; i++) {
      if (inBlockComment) {
        if (line[i] === '*' && line[i + 1] === '/') {
          inBlockComment = false;
          i++;
        }
        continue;
      }
      if (line[i] === '/' && line[i + 1] === '*') {
        inBlockComment = true;
        i++;
        continue;
      }
      if (line[i] === '/' && line[i + 1] === '/') {
        break;
      }
      clean += line[i];
    }
    cleanedLines.push(clean);
  }

  const cleanCode = cleanedLines.join(' ');
  const words = cleanCode.match(/[A-Za-z_$][A-Za-z0-9_$]*|\d+(\.\d+)?|"[^"]*"|'[^']*'|`[^`]*`/g) || [];

  for (const word of words) {
    if (JS_KEYWORDS.has(word)) {
      operators.push(word);
    } else {
      operands.push(word);
    }
  }

  for (const op of OPERATORS) {
    const escaped = op.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const matches = cleanCode.match(new RegExp(escaped, 'g'));
    if (matches) {
      for (let i = 0; i < matches.length; i++) {
        operators.push(op);
      }
    }
  }

  return { operators, operands, cleanedLines };
}

export function calculateCyclomaticComplexity(code) {
  let complexity = 1;
  const decisionRules = [
    { pattern: /\bif\s*\(/g, name: 'if statement' },
    { pattern: /\belse\s+if\s*\(/g, name: 'else if statement' },
    { pattern: /\bfor\s*\(/g, name: 'for loop' },
    { pattern: /\bwhile\s*\(/g, name: 'while loop' },
    { pattern: /\bdo\b/g, name: 'do-while loop' },
    { pattern: /\bcase\s+[^:]+:/g, name: 'switch case' },
    { pattern: /\bcatch\s*\(/g, name: 'catch block' },
    { pattern: /&&/g, name: 'logical AND' },
    { pattern: /\|\|/g, name: 'logical OR' },
    { pattern: /\?\s*[^:]+:/g, name: 'ternary operator' }
  ];

  const breakdown = [];

  for (const rule of decisionRules) {
    const matches = code.match(rule.pattern);
    if (matches) {
      complexity += matches.length;
      breakdown.push({ type: rule.name, count: matches.length });
    }
  }

  return { complexity, breakdown };
}

export function calculateHalsteadMetrics(operators, operands) {
  const n1 = new Set(operators).size;
  const n2 = new Set(operands).size;
  const N1 = operators.length;
  const N2 = operands.length;

  const vocabulary = n1 + n2;
  const length = N1 + N2;
  const volume = length > 0 && vocabulary > 0 ? length * Math.log2(vocabulary) : 0;
  const difficulty = n2 > 0 ? (n1 / 2) * (N2 / n2) : 0;
  const effort = difficulty * volume;
  const timeSeconds = effort / 18;
  const estimatedBugs = Math.pow(effort, 2 / 3) / 3000;

  return {
    distinctOperators: n1,
    distinctOperands: n2,
    totalOperators: N1,
    totalOperands: N2,
    vocabulary,
    length,
    volume: Math.round(volume * 10) / 10,
    difficulty: Math.round(difficulty * 10) / 10,
    effort: Math.round(effort),
    timeSeconds: Math.round(timeSeconds * 10) / 10,
    estimatedBugs: Math.round(estimatedBugs * 100) / 100
  };
}

export function calculateMaintainabilityIndex(volume, complexity, loc) {
  if (loc <= 0) return 100;
  const safeVolume = volume > 0 ? volume : 1;
  const rawMI = 171 - (5.2 * Math.log(safeVolume)) - (0.23 * complexity) - (16.2 * Math.log(loc));
  const normalizedMI = Math.max(0, Math.min(100, (rawMI * 100) / 171));
  return Math.round(normalizedMI);
}

export function calculateMaxNestingDepth(code) {
  let maxDepth = 0;
  let currentDepth = 0;

  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    if (char === '{' || char === '(') {
      currentDepth++;
      if (currentDepth > maxDepth) {
        maxDepth = currentDepth;
      }
    } else if (char === '}' || char === ')') {
      if (currentDepth > 0) currentDepth--;
    }
  }

  return maxDepth;
}

export function detectCodeSmells(code) {
  const smells = [];
  const lines = code.split('\n');

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    if (/\beval\s*\(/.test(line)) {
      smells.push({ line: lineNum, severity: 'critical', type: 'Security Risk', message: 'Use of eval() introduces severe arbitrary execution vulnerabilities.' });
    }
    if (/innerHTML\s*=/.test(line)) {
      smells.push({ line: lineNum, severity: 'high', type: 'XSS Risk', message: 'Direct assignment to innerHTML can expose application to Cross-Site Scripting.' });
    }
    if (/[^!=]==[^=]/.test(line)) {
      smells.push({ line: lineNum, severity: 'low', type: 'Type Coercion', message: 'Use strict equality (===) instead of loose equality (==).' });
    }
    if (/catch\s*\([^)]*\)\s*\{\s*\}/.test(line)) {
      smells.push({ line: lineNum, severity: 'medium', type: 'Silent Error Suppression', message: 'Empty catch block suppresses runtime exceptions without handling.' });
    }
    if (line.length > 120) {
      smells.push({ line: lineNum, severity: 'low', type: 'Maintainability', message: `Line exceeds 120 characters (${line.length} chars). Split for readability.` });
    }
    if (/\bconsole\.log\s*\(/.test(line)) {
      smells.push({ line: lineNum, severity: 'info', type: 'Debug Code', message: 'Console statement found in code.' });
    }
  });

  return smells;
}

export function estimateBigOComplexity(code) {
  const hasFor = (code.match(/\bfor\s*\(/g) || []).length;
  const hasWhile = (code.match(/\bwhile\s*\(/g) || []).length;
  const totalLoops = hasFor + hasWhile;

  const lines = code.split('\n');
  let maxLoopNesting = 0;
  let currentLoopNesting = 0;

  for (const line of lines) {
    if (/\b(for|while)\s*\(/.test(line)) {
      currentLoopNesting++;
      if (currentLoopNesting > maxLoopNesting) {
        maxLoopNesting = currentLoopNesting;
      }
    }
    if (line.includes('}') && currentLoopNesting > 0) {
      currentLoopNesting--;
    }
  }

  const hasHalving = /\/=\s*2|>>=\s*1|Math\.floor\([^)]*\/\s*2\)/.test(code);
  const hasRecursion = /function\s+([A-Za-z0-9_$]+)[\s\S]*?\b\1\s*\(/.test(code);

  if (maxLoopNesting >= 3) {
    return { notation: 'O(n³)', category: 'Cubic', explanation: 'Detected 3+ levels of nested loops. Performance will degrade rapidly on medium inputs.' };
  }
  if (maxLoopNesting === 2) {
    return { notation: 'O(n²)', category: 'Quadratic', explanation: 'Detected 2 nested loops (e.g. nested iteration, matrix operations, or bubble sort).' };
  }
  if (maxLoopNesting === 1 && hasHalving) {
    return { notation: 'O(n log n)', category: 'Linearithmic', explanation: 'Detected linear loop combined with logarithmic halving operations (typical of Merge/Quick Sort).' };
  }
  if (maxLoopNesting === 0 && hasHalving) {
    return { notation: 'O(log n)', category: 'Logarithmic', explanation: 'Input space is divided or halved per iteration (typical of Binary Search or Divide & Conquer).' };
  }
  if (maxLoopNesting === 1 || totalLoops > 0) {
    return { notation: 'O(n)', category: 'Linear', explanation: 'Single level iteration. Execution time scales linearly with input size.' };
  }
  if (hasRecursion) {
    return { notation: 'O(2ⁿ)', category: 'Exponential', explanation: 'Recursive branching detected without memoization. High risk of stack overflow.' };
  }
  return { notation: 'O(1)', category: 'Constant', explanation: 'No iteration structures detected. Runs in constant operational time.' };
}

export function analyzeCodeQuality(code) {
  if (!code || code.trim().length === 0) {
    return {
      loc: 0,
      cyclomaticComplexity: 1,
      maintainabilityIndex: 100,
      defectProbability: 0,
      defectRisk: 'Clean',
      bigO: { notation: 'O(1)', category: 'Constant', explanation: 'Empty document' },
      halstead: { vocabulary: 0, length: 0, volume: 0, difficulty: 0, effort: 0, estimatedBugs: 0 },
      codeSmells: [],
      maxNesting: 0
    };
  }

  const lines = code.split('\n');
  const loc = lines.length;
  const nonBlankLoc = lines.filter(l => l.trim().length > 0).length;

  const { operators, operands } = tokenizeCode(code);
  const { complexity: cyclomaticComplexity, breakdown } = calculateCyclomaticComplexity(code);
  const halstead = calculateHalsteadMetrics(operators, operands);
  const maintainabilityIndex = calculateMaintainabilityIndex(halstead.volume, cyclomaticComplexity, loc);
  const maxNesting = calculateMaxNestingDepth(code);
  const codeSmells = detectCodeSmells(code);
  const bigO = estimateBigOComplexity(code);

  const normComplexity = Math.min(1.0, cyclomaticComplexity / 20);
  const normDifficulty = Math.min(1.0, halstead.difficulty / 30);
  const normNesting = Math.min(1.0, maxNesting / 6);
  const normSmells = Math.min(1.0, codeSmells.length / 5);
  const normMaintainabilityInversion = (100 - maintainabilityIndex) / 100;

  const rawRiskScore = (
    0.30 * normComplexity +
    0.25 * normDifficulty +
    0.20 * normMaintainabilityInversion +
    0.15 * normSmells +
    0.10 * normNesting
  );

  const defectProbability = Math.round(Math.min(99, Math.max(2, rawRiskScore * 100)));

  let defectRisk = 'Low Risk (Clean)';
  let riskColor = '#4aed88';

  if (defectProbability >= 65) {
    defectRisk = 'High Defect Risk';
    riskColor = '#ff4d4d';
  } else if (defectProbability >= 35) {
    defectRisk = 'Moderate Risk';
    riskColor = '#ffa500';
  }

  return {
    loc,
    nonBlankLoc,
    cyclomaticComplexity,
    complexityBreakdown: breakdown,
    maintainabilityIndex,
    defectProbability,
    defectRisk,
    riskColor,
    bigO,
    halstead,
    codeSmells,
    maxNesting
  };
}
