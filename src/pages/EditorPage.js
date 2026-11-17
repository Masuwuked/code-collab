import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import ACTIONS from '../Actions';
import Client from '../components/Client';
import Editor from '../components/Editor';
import MetricsPanel from '../components/MetricsPanel';
import ConsoleOutput from '../components/ConsoleOutput';
import AIAssistantDrawer from '../components/AIAssistantDrawer';
import ChatDrawer from '../components/ChatDrawer';
import { initSocket } from '../socket';
import { analyzeCodeQuality } from '../utils/mlAnalyzer';
import { SAMPLE_CODES } from '../utils/sampleCodes';

const EditorPage = () => {
  const socketRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [code, setCode] = useState(SAMPLE_CODES.binarySearch);
  const [showMetrics, setShowMetrics] = useState(true);
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiDefaultAction, setAiDefaultAction] = useState('EXPLAIN');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const metrics = useMemo(() => {
    return analyzeCodeQuality(code);
  }, [code]);

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();

      const handleErrors = (e) => {
        console.error('Socket error:', e);
        toast.error('Socket connection failed. Please ensure the backend server is running.');
        navigate('/');
      };

      socketRef.current.on('connect_error', handleErrors);
      socketRef.current.on('connect_failed', handleErrors);

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username
      });

      socketRef.current.on(ACTIONS.JOINED, ({ clients: connectedClients, username, socketId }) => {
        if (username !== location.state?.username) {
          toast.success(`${username} joined the workspace.`);
        }

        const uniqueClients = connectedClients.filter(
          (c, idx, arr) => idx === arr.findIndex((x) => x.socketId === c.socketId)
        );
        setClients(uniqueClients);

        socketRef.current.emit(ACTIONS.SYNC_CODE, {
          code,
          socketId
        });
      });

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ username, socketId }) => {
        toast.success(`${username || 'A member'} left the workspace.`);
        setClients((prev) => prev.filter((client) => client.socketId !== socketId));
      });
    };

    if (location.state?.username) {
      init();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, location.state?.username, navigate]);

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success('Room ID copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy Room ID');
    }
  };

  const leaveRoom = () => {
    navigate('/');
  };

  const handleOpenAi = (action = 'EXPLAIN') => {
    setAiDefaultAction(action);
    setIsAiOpen(true);
  };

  const loadSample = (key) => {
    if (SAMPLE_CODES[key]) {
      setCode(SAMPLE_CODES[key]);
      toast.success('Loaded ' + key + ' demo code!');
    }
  };

  const toggleConsole = useCallback(() => {
    setIsConsoleExpanded((prev) => !prev);
  }, []);

  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <div className="mainWrap">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      <aside className="aside">
        <div className="asideInner">
          <div className="brandLogoWrap">
            <div className="logoBadge">
              <span className="logoSpark">⚡</span>
              <span className="logoText">CodeCollab<span className="logoAccent">AI</span></span>
            </div>
            <div className="subTagline">Intelligent Real-Time IDE</div>
          </div>

          <div className="roomInfoBadge">
            <span className="roomLabel">Active Room:</span>
            <div className="roomIdSnippet" onClick={copyRoomId} title="Click to copy">
              <code>{roomId.slice(0, 8)}...</code>
              <span className="copyTinyIcon">📋</span>
            </div>
          </div>

          <div className="sidebarDivider"></div>

          <div className="collaboratorsHeader">
            <span>Collaborators ({clients.length})</span>
          </div>

          <div className="clientsList">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>

        <div className="asideFooter">
          <button className="btn sideActionBtn chatBtn" onClick={() => setIsChatOpen(true)}>
            💬 Team Chat
          </button>
          <button className="btn sideActionBtn copyBtn" onClick={copyRoomId}>
            📋 Copy Room ID
          </button>
          <button className="btn sideActionBtn leaveBtn" onClick={leaveRoom}>
            🚪 Leave Room
          </button>
        </div>
      </aside>

      <main className="editorWrap">
        <header className="workspaceToolbar">
          <div className="toolbarLeft">
            <span className="editorFileTab">index.js</span>
            <div className="sampleSelectWrap">
              <label htmlFor="samplePicker">Demo Presets:</label>
              <select 
                id="samplePicker" 
                className="samplePicker"
                onChange={(e) => loadSample(e.target.value)}
                defaultValue="binarySearch"
              >
                <option value="binarySearch">⚡ Binary Search (O(log n))</option>
                <option value="highComplexity">⚠️ Nested Matrix & Smells (O(n²))</option>
                <option value="cleanQuickSort">🚀 QuickSort (Divide & Conquer)</option>
              </select>
            </div>
          </div>

          <div className="toolbarRight">
            <button 
              className={`toolBtn ${showMetrics ? 'active' : ''}`}
              onClick={() => setShowMetrics(!showMetrics)}
            >
              📊 ML Metrics {showMetrics ? 'ON' : 'OFF'}
            </button>

            <button 
              className="toolBtn aiTriggerBtn"
              onClick={() => handleOpenAi('EXPLAIN')}
            >
              🤖 AI Copilot
            </button>

            <button 
              className="toolBtn runHeaderBtn"
              onClick={toggleConsole}
            >
              ▶ Terminal
            </button>
          </div>
        </header>

        <div className="editorCore">
          <Editor
            socketRef={socketRef}
            roomId={roomId}
            codeValue={code}
            onCodeChange={(newCode) => setCode(newCode)}
            onRunShortcut={() => setIsConsoleExpanded(true)}
          />
        </div>

        {showMetrics && (
          <MetricsPanel
            metrics={metrics}
            onOpenAssistant={handleOpenAi}
          />
        )}

        <ConsoleOutput
          code={code}
          isExpanded={isConsoleExpanded}
          onToggle={toggleConsole}
        />
      </main>

      <AIAssistantDrawer
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        code={code}
        defaultAction={aiDefaultAction}
      />

      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        socketRef={socketRef}
        roomId={roomId}
        username={location.state?.username}
      />
    </div>
  );
};

export default EditorPage;
