import React, { useState } from 'react';
import { askCodeAssistant } from '../utils/aiAssistant';

const AIAssistantDrawer = ({ isOpen, onClose, code, defaultAction = 'EXPLAIN' }) => {
  const [activeTab, setActiveTab] = useState(defaultAction);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  const handleAction = async (action, prompt = '') => {
    setActiveTab(action);
    setLoading(true);
    setResponse(null);
    try {
      const res = await askCodeAssistant(action, code, prompt);
      setResponse(res);
    } catch (err) {
      setResponse({
        title: 'Error',
        content: 'Failed to process AI response: ' + err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    handleAction('CUSTOM', customPrompt);
  };

  if (!isOpen) return null;

  return (
    <div className="aiDrawerOverlay">
      <div className="aiDrawer">
        <div className="aiDrawerHeader">
          <div className="aiHeaderTitle">
            <span className="aiPulse">🤖</span>
            <h3>AI Copilot & Code Intelligence</h3>
          </div>
          <button className="closeDrawerBtn" onClick={onClose}>✕</button>
        </div>

        <div className="aiActionTabs">
          <button 
            className={`aiTabBtn ${activeTab === 'EXPLAIN' ? 'active' : ''}`}
            onClick={() => handleAction('EXPLAIN')}
          >
            🧠 Explain & Big-O
          </button>
          <button 
            className={`aiTabBtn ${activeTab === 'SECURITY' ? 'active' : ''}`}
            onClick={() => handleAction('SECURITY')}
          >
            🛡️ Security Audit
          </button>
          <button 
            className={`aiTabBtn ${activeTab === 'OPTIMIZE' ? 'active' : ''}`}
            onClick={() => handleAction('OPTIMIZE')}
          >
            ⚡ Refactor & Optimize
          </button>
          <button 
            className={`aiTabBtn ${activeTab === 'TESTS' ? 'active' : ''}`}
            onClick={() => handleAction('TESTS')}
          >
            🧪 Generate Tests
          </button>
        </div>

        <div className="aiDrawerContent">
          {loading && (
            <div className="aiLoadingState">
              <div className="aiSpinner"></div>
              <p>Analyzing AST structure, control flow graphs, and feature weights...</p>
            </div>
          )}

          {!loading && !response && (
            <div className="aiPromptIntro">
              <div className="introIcon">💡</div>
              <h4>Select an AI Analysis Mode</h4>
              <p>Choose an automated action above or ask a custom question about the current code below.</p>
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
            placeholder="Ask AI Copilot about the code..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
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
