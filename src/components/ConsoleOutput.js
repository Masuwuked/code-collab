import React, { useState, forwardRef, useImperativeHandle } from 'react';

const ConsoleOutput = forwardRef(({ code, isExpanded, onToggle }, ref) => {
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);

  const runCode = () => {
    setIsRunning(true);
    const capturedLogs = [];
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = (...args) => {
      capturedLogs.push({
        type: 'log',
        text: args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))).join(' ')
      });
      originalLog.apply(console, args);
    };

    console.warn = (...args) => {
      capturedLogs.push({
        type: 'warn',
        text: args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))).join(' ')
      });
      originalWarn.apply(console, args);
    };

    console.error = (...args) => {
      capturedLogs.push({
        type: 'error',
        text: args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))).join(' ')
      });
      originalError.apply(console, args);
    };

    const startTime = performance.now();
    try {
      // eslint-disable-next-line no-new-func
      const runnable = new Function(code);
      const result = runnable();
      if (result !== undefined) {
        capturedLogs.push({
          type: 'return',
          text: `Result: ${typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)}`
        });
      }
    } catch (err) {
      capturedLogs.push({
        type: 'error',
        text: `Runtime Exception: ${err.message}`
      });
    } finally {
      const duration = (performance.now() - startTime).toFixed(2);
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      setExecutionTime(duration);
      setLogs(capturedLogs);
      setIsRunning(false);
    }
  };

  useImperativeHandle(ref, () => ({
    run: runCode
  }));

  const clearConsole = () => {
    setLogs([]);
    setExecutionTime(null);
  };

  return (
    <div className={`consoleContainer ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="consoleHeader">
        <div className="consoleTitle" onClick={onToggle}>
          <span className="terminalLabel">Terminal</span>
          {executionTime && (
            <span className="execBadge">{executionTime} ms</span>
          )}
        </div>
        <div className="consoleControls">
          <button className="runCodeBtn" onClick={runCode} disabled={isRunning}>
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
              Terminal ready. Click 'Run Code' or press Ctrl+Enter to execute JavaScript.
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className={`consoleRow ${log.type}`}>
                <span className="consolePrompt">{log.type === 'error' ? 'x' : log.type === 'warn' ? '!' : '>'}</span>
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
