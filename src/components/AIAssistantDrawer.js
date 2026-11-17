import React, { useState } from 'react';
import { askCodeAssistant } from '../utils/aiAssistant';

const AIAssistantDrawer = ({ isOpen, onClose, code }) => {
  const [activeAction, setActiveAction] = useState('EXPLAIN');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');

  const runAction = async (action, customText = '') => {
    setActiveAction(action);
    setLoading(true);
    setResponse(null);
    try {
      const res = await askCodeAssistant(action, code, customText);
      setResponse(res);
    } catch (err) {
      setResponse({
        title: 'Error',
        content: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    runAction('CUSTOM', prompt);
  };

  if (!isOpen) return null;

  return (
    <div className="aiDrawerOverlay">
      <div className="aiDrawer">
        <div className="aiDrawerHeader">
          <div className="aiHeaderTitle">
            <h3>AI Copilot</h3>
          </div>
          <button className="closeDrawerBtn" onClick={onClose}>✕</button>
        </div>

        <div className="aiActionTabs">
          <button
            className={`aiTabBtn ${activeAction === 'EXPLAIN' ? 'active' : ''}`}
            onClick={() => runAction('EXPLAIN')}
          >
            Explain
          </button>
          <button
            className={`aiTabBtn ${activeAction === 'BUGS' ? 'active' : ''}`}
            onClick={() => runAction('BUGS')}
          >
            Find Bugs
          </button>
          <button
            className={`aiTabBtn ${activeAction === 'OPTIMIZE' ? 'active' : ''}`}
            onClick={() => runAction('OPTIMIZE')}
          >
            Optimize
          </button>
          <button
            className={`aiTabBtn ${activeAction === 'TESTS' ? 'active' : ''}`}
            onClick={() => runAction('TESTS')}
          >
            Unit Tests
          </button>
        </div>

        <div className="aiDrawerContent">
          {loading && (
            <div className="aiLoadingState">
              <div className="aiSpinner"></div>
              <p>Analyzing code structure...</p>
            </div>
          )}

          {!loading && !response && (
            <div className="aiPromptIntro">
              <h4>Select an action</h4>
              <p>Choose an analysis mode above or ask a question below.</p>
            </div>
          )}

          {!loading && response && (
            <div className="aiResultBox">
              <h4 className="aiResultTitle">{response.title}</h4>
              <div className="aiResultMarkdown">
                <pre>{response.content}</pre>
              </div>
            </div>
          )}
        </div>

        <form className="aiInputForm" onSubmit={handleCustomSubmit}>
          <input
            type="text"
            className="aiTextInput"
            placeholder="Ask Copilot about this code..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button type="submit" className="aiSubmitBtn" disabled={loading}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistantDrawer;
