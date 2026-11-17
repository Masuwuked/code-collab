import React, { useState, useRef, useEffect, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import ACTIONS from '../Actions';
import Client from '../components/Client';
import Editor from '../components/Editor';
import ChatDrawer from '../components/ChatDrawer';
import AIAssistantDrawer from '../components/AIAssistantDrawer';
import ConsoleOutput from '../components/ConsoleOutput';
import { initSocket } from '../socket';

const TEMPLATES = {
  javascript: `// JavaScript (Node.js)\n\nfunction main() {\n  console.log("Hello from JavaScript!");\n}\n\nmain();\n`,
  java: `// Java (JDK 25)\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java (JDK 25)!");\n    }\n}\n`
};

const EditorPage = () => {
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);
  const consoleRef = useRef(null);
  const [language, setLanguage] = useState('javascript');
  const [codeValue, setCodeValue] = useState(TEMPLATES.javascript);
  const codeRef = useRef(TEMPLATES.javascript);
  const location = useLocation();
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);

  useEffect(() => {
    let currentSocket = null;

    const init = async () => {
      currentSocket = await initSocket();
      socketRef.current = currentSocket;
      setSocket(currentSocket);

      const handleErrors = (e) => {
        console.error('Socket error:', e);
        toast.error('Socket connection failed. Please ensure the backend is running.');
        navigate('/');
      };

      currentSocket.on('connect_error', handleErrors);
      currentSocket.on('connect_failed', handleErrors);

      // Join room
      currentSocket.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username
      });

      // User joined event
      currentSocket.on(ACTIONS.JOINED, ({ clients: connectedClients, username, socketId }) => {
        if (username !== location.state?.username) {
          toast.success(`${username} joined the workspace.`);
        }

        const uniqueClients = connectedClients.filter(
          (c, idx, arr) => idx === arr.findIndex((x) => x.socketId === c.socketId)
        );
        setClients(uniqueClients);

        // Sync current code to the newly joined client
        currentSocket.emit(ACTIONS.SYNC_CODE, {
          code: codeRef.current,
          socketId
        });
      });

      // User disconnected event
      currentSocket.on(ACTIONS.DISCONNECTED, ({ username, socketId, clients: updatedClients }) => {
        toast.success(`${username || 'A member'} left the workspace.`);
        if (updatedClients) {
          const uniqueClients = updatedClients.filter(
            (c, idx, arr) => idx === arr.findIndex((x) => x.socketId === c.socketId)
          );
          setClients(uniqueClients);
        } else {
          setClients((prev) => prev.filter((client) => client.socketId !== socketId));
        }
      });
    };

    if (location.state?.username) {
      init();
    }

    return () => {
      if (currentSocket) {
        currentSocket.disconnect();
        currentSocket.off(ACTIONS.JOINED);
        currentSocket.off(ACTIONS.DISCONNECTED);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, location.state?.username, navigate]);

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success('Room ID copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy Room ID');
    }
  };

  const leaveRoom = () => {
    navigate('/');
  };

  const handleRunCode = useCallback(() => {
    setIsConsoleExpanded(true);
    setTimeout(() => {
      consoleRef.current?.run(codeRef.current, language);
    }, 50);
  }, [language]);

  const toggleConsole = useCallback(() => {
    setIsConsoleExpanded((prev) => !prev);
  }, []);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    const template = TEMPLATES[newLang] || '';
    codeRef.current = template;
    setCodeValue(template);
    toast.success(`Switched to ${newLang === 'java' ? 'Java (JDK 25)' : 'JavaScript'}`);
  };

  if (!location.state) {
    return <Navigate to="/" />;
  }

  const filename = language === 'java' ? 'Main.java' : 'index.js';

  return (
    <div className="mainWrap">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      {/* Left Navigation Sidebar */}
      <aside className="aside">
        <div className="asideInner">
          <div className="brandLogoWrap">
            <div className="logoBadge">
              <span className="logoText">CodeCollab</span>
            </div>
            <div className="subTagline">Real-Time Workspace</div>
          </div>

          <div className="roomInfoBadge">
            <span className="roomLabel">Room ID</span>
            <div className="roomIdSnippet" onClick={copyRoomId} title="Click to copy">
              <code>{roomId.slice(0, 10)}...</code>
              <span className="copyTinyText">Copy</span>
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

        {/* Sidebar Footer Controls */}
        <div className="asideFooter">
          <button className="btn sideActionBtn chatBtn" onClick={() => setIsChatOpen(true)}>
            Team Chat
          </button>
          <button className="btn sideActionBtn copyBtn" onClick={copyRoomId}>
            Copy Room ID
          </button>
          <button className="btn sideActionBtn leaveBtn" onClick={leaveRoom}>
            Leave Room
          </button>
        </div>
      </aside>

      {/* Central Editor Area */}
      <main className="editorWrap">
        <header className="workspaceToolbar">
          <div className="toolbarLeft">
            <span className="editorFileTab">{filename}</span>
            <div className="langSelectWrap">
              <select
                className="langSelect"
                value={language}
                onChange={handleLanguageChange}
              >
                <option value="javascript">JavaScript</option>
                <option value="java">Java (JDK 25)</option>
              </select>
            </div>
            <button className="toolBtn runHeaderBtn" onClick={handleRunCode}>
              Run Code
            </button>
            <button className={`toolBtn ${isConsoleExpanded ? 'active' : ''}`} onClick={toggleConsole}>
              Terminal
            </button>
          </div>
          <div className="toolbarRight">
            <button className="toolBtn" onClick={copyRoomId}>
              Copy Invite
            </button>
            <button className="toolBtn copilotBtn" onClick={() => setIsAiOpen(true)}>
              Copilot
            </button>
            <button className="toolBtn" onClick={() => setIsChatOpen(true)}>
              Chat
            </button>
          </div>
        </header>

        <div className="editorCore">
          <Editor
            socket={socket}
            roomId={roomId}
            initialCode={codeValue}
            language={language}
            onCodeChange={(newCode) => {
              codeRef.current = newCode;
            }}
            onRun={handleRunCode}
          />
        </div>

        {/* In-Browser Execution Terminal */}
        <ConsoleOutput
          ref={consoleRef}
          getCode={() => codeRef.current}
          language={language}
          isExpanded={isConsoleExpanded}
          onToggle={toggleConsole}
        />
      </main>

      {/* AI Copilot Drawer */}
      <AIAssistantDrawer
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        code={codeRef.current}
      />

      {/* Team Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        socket={socket}
        roomId={roomId}
        username={location.state?.username}
      />
    </div>
  );
};

export default EditorPage;
