import React, { useState, forwardRef, useImperativeHandle } from 'react';

const ConsoleOutput = forwardRef(({ code, language = 'javascript', isExpanded, onToggle, getCode }, ref) => {
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);

  const runCode = async (codeOverride, langOverride) => {
    let activeCode = codeOverride;
    if (typeof activeCode !== 'string' && getCode) {
      activeCode = getCode();
    }
    if (typeof activeCode !== 'string') {
      activeCode = code;
    }
    const activeLang = typeof langOverride === 'string' ? langOverride : language;

    if (!activeCode || !activeCode.trim()) {
      setLogs([{ type: 'warn', text: 'No code to execute. Write some code first.' }]);
      return;
    }

    setIsRunning(true);
    setLogs([{ type: 'info', text: `Compiling and executing (${activeLang.toUpperCase()})...` }]);

    const clientStart = performance.now();

    try {
      // Call backend execution endpoint
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          language: activeLang,
          code: activeCode
        })
      });

      if (response.ok) {
        const data = await response.json();
        const duration = data.duration !== undefined ? data.duration : (performance.now() - clientStart).toFixed(2);
        setExecutionTime(duration);

        if (data.success) {
          setLogs([
            {
              type: 'log',
              text: data.output || '(Process finished with no output)'
            }
          ]);
        } else {
          setLogs([
            {
              type: 'error',
              text: data.output || 'Execution error'
            }
          ]);
        }
      } else {
        throw new Error(`HTTP ${response.status}: Execution endpoint unavailable`);
      }
    } catch (err) {
      // Fallback in-browser execution for JavaScript if backend is unreachable
      if (activeLang === 'javascript') {
        const capturedLogs = [];
        const originalLog = console.log;
        const originalError = console.error;

        console.log = (...args) => {
          capturedLogs.push({
            type: 'log',
            text: args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))).join(' ')
          });
          originalLog.apply(console, args);
        };

        console.error = (...args) => {
          capturedLogs.push({
            type: 'error',
            text: args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))).join(' ')
          });
          originalError.apply(console, args);
        };

        try {
          // eslint-disable-next-line no-new-func
          const runnable = new Function(activeCode);
          const result = runnable();
          if (result !== undefined) {
            capturedLogs.push({
              type: 'return',
              text: `Result: ${typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)}`
            });
          }
          setLogs(capturedLogs.length > 0 ? capturedLogs : [{ type: 'log', text: '(Executed locally with no output)' }]);
        } catch (e) {
          setLogs([{ type: 'error', text: `Runtime Exception: ${e.message}` }]);
        } finally {
          console.log = originalLog;
          console.error = originalError;
          setExecutionTime((performance.now() - clientStart).toFixed(2));
        }
      } else {
        setLogs([
          {
            type: 'error',
            text: `Execution failed: ${err.message}. Make sure the backend server is running ('node server.js').`
          }
        ]);
        setExecutionTime((performance.now() - clientStart).toFixed(2));
      }
    } finally {
      setIsRunning(false);
    }
  };

  useImperativeHandle(ref, () => ({
    run: (codeToRun, langToRun) => {
      runCode(codeToRun, langToRun);
    }
  }));

  const clearConsole = () => {
    setLogs([]);
    setExecutionTime(null);
  };

  return (
    <div className={`consoleContainer ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="consoleHeader">
        <div className="consoleTitle" onClick={onToggle}>
          <span className="terminalLabel">Terminal ({language.toUpperCase()})</span>
          {executionTime && (
            <span className="execBadge">{executionTime} ms</span>
          )}
        </div>
        <div className="consoleControls">
          <button className="runCodeBtn" onClick={() => runCode()} disabled={isRunning}>
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
          <button className="clearConsoleBtn" onClick={clearConsole} title="Clear Terminal">
            Clear
          </button>
          <button className="toggleConsoleBtn" onClick={onToggle}>
            {isExpanded ? 'Hide' : 'Show Terminal'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="consoleBody">
          {logs.length === 0 ? (
            <div className="consoleEmpty">
              Terminal ready. Click 'Run Code' or press Ctrl+Enter to execute.
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className={`consoleRow ${log.type}`}>
                <span className="consolePrompt">
                  {log.type === 'error' ? 'x' : log.type === 'warn' ? '!' : log.type === 'info' ? '*' : '>'}
                </span>
                <pre className="consoleText">{log.text}</pre>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
});

export default ConsoleOutput;
