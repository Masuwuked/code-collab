/**
 * CodeCollab - Minimal AI Copilot Engine
 */

import { analyzeCodeQuality } from './mlAnalyzer';

export async function askCodeAssistant(action, code, customPrompt = '') {
  const analysis = analyzeCodeQuality(code);

  await new Promise(resolve => setTimeout(resolve, 300));

  if (!code || code.trim().length === 0) {
    return {
      title: 'Empty Document',
      content: 'Write or paste code into the editor to run the Copilot analysis.'
    };
  }

  switch (action) {
    case 'EXPLAIN': {
      return {
        title: 'Code Architecture & Complexity Analysis',
        content: `Lines of Code: ${analysis.loc} (${analysis.nonBlankLoc} logical)
Estimated Time Complexity: ${analysis.bigO.notation} (${analysis.bigO.category})
Cyclomatic Complexity: M = ${analysis.cyclomaticComplexity}
Maintainability Index: ${analysis.maintainabilityIndex} / 100

Explanation:
${analysis.bigO.explanation}

The program defines ${analysis.halstead.vocabulary} unique symbols with an estimated Halstead volume of ${analysis.halstead.volume}.`
      };
    }

    case 'OPTIMIZE': {
      const suggestions = [];
      if (analysis.cyclomaticComplexity > 6) {
        suggestions.push('- Reduce conditional branch nesting by using guard clauses (early returns).');
      }
      if (analysis.maxNesting > 2) {
        suggestions.push('- Max nesting depth is ' + analysis.maxNesting + '. Extract deeply nested blocks into helper routines.');
      }
      if (analysis.bigO.notation === 'O(n²)' || analysis.bigO.notation === 'O(n³)') {
        suggestions.push('- Convert nested loops into single-pass lookups using Map or Set to reach O(n) linear performance.');
      }
      if (suggestions.length === 0) {
        suggestions.push('- Code structure is optimal. Ensure inputs are bounded to prevent memory pressure.');
      }

      return {
        title: 'Optimization Suggestions',
        content: `Current Complexity: ${analysis.bigO.notation}
Halstead Volume: ${analysis.halstead.volume}

Recommended Refactorings:
${suggestions.join('\n')}

Example Refactoring Pattern:
// 1. Guard clauses for early exit
// 2. High-order functions (map, filter, reduce) or Map/Set lookups for O(1) checks`
      };
    }

    case 'BUGS': {
      return {
        title: 'Code Defect & Security Audit',
        content: `Identified Issues: ${analysis.codeSmells.length}

${analysis.codeSmells.length === 0 
  ? 'No critical antipatterns found. Code follows standard conventions.'
  : analysis.codeSmells.map(s => `[Line ${s.line}] ${s.type} (${s.severity.toUpperCase()}): ${s.message}`).join('\n')}

Quality Checklist:
- Error Handling: ${analysis.codeSmells.some(s => s.type.includes('Error')) ? 'Empty catch block detected' : 'OK'}
- Type Safety: ${analysis.codeSmells.some(s => s.type.includes('Coercion')) ? 'Use strict equality (===)' : 'OK'}
- Security Injection: ${analysis.codeSmells.some(s => s.severity === 'critical') ? 'Action required' : 'OK'}`
      };
    }

    case 'TESTS': {
      return {
        title: 'Generated Unit Tests (Jest)',
        content: `describe('Automated Test Suite', () => {
  test('executes standard input successfully', () => {
    expect(() => {
      // Execute main routine
    }).not.toThrow();
  });

  test('handles edge cases gracefully (null, empty, zero)', () => {
    const edgeCases = [null, undefined, '', 0, []];
    edgeCases.forEach(input => {
      // Verify defensive input handling
    });
  });

  test('completes within target latency (< 50ms)', () => {
    const start = performance.now();
    // Run execution
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(50);
  });
});`
      };
    }

    case 'CUSTOM':
    default: {
      return {
        title: `Query: "${customPrompt.slice(0, 30)}"`,
        content: `Response for: "${customPrompt}"

Context:
- File Length: ${analysis.loc} lines
- Complexity: ${analysis.bigO.notation}

Recommendations:
1. Validate inputs prior to execution.
2. Keep state mutations isolated to pure functions.
3. Use async/await for asynchronous routines.`
      };
    }
  }
}
