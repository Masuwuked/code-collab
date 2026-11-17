import React, { useEffect, useRef } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';

const Editor = ({ socket, roomId, onCodeChange, initialCode }) => {
  const editorRef = useRef(null);
  const textAreaRef = useRef(null);
  const isInternalChange = useRef(false);
  const socketRef = useRef(socket);

  // Keep socketRef updated
  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  // Initialize CodeMirror instance
  useEffect(() => {
    if (!textAreaRef.current) return;

    editorRef.current = Codemirror.fromTextArea(textAreaRef.current, {
      mode: { name: 'javascript', json: true },
      theme: 'dracula',
      autoCloseTags: true,
      autoCloseBrackets: true,
      lineNumbers: true,
      lineWrapping: true,
    });

    // Listen to local user changes
    editorRef.current.on('change', (instance, changes) => {
      const { origin } = changes;
      const code = instance.getValue();
      onCodeChange(code);

      // Only emit if this change was typed by the user, NOT set by an incoming socket event
      if (origin !== 'setValue' && !isInternalChange.current) {
        if (socketRef.current) {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }
      }
    });

    if (initialCode) {
      editorRef.current.setValue(initialCode);
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.toTextArea();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for remote code changes whenever socket is connected
  useEffect(() => {
    if (!socket) return;

    const handleRemoteCodeChange = ({ code }) => {
      if (code !== null && editorRef.current) {
        if (code !== editorRef.current.getValue()) {
          const cursor = editorRef.current.getCursor();
          isInternalChange.current = true;
          editorRef.current.setValue(code);
          editorRef.current.setCursor(cursor);
          isInternalChange.current = false;
        }
      }
    };

    socket.on(ACTIONS.CODE_CHANGE, handleRemoteCodeChange);

    return () => {
      socket.off(ACTIONS.CODE_CHANGE, handleRemoteCodeChange);
    };
  }, [socket]);

  return <textarea ref={textAreaRef} id="realtimeEditor" />;
};

export default Editor;
