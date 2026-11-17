import React, { useEffect, useRef } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/clike/clike';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';

const Editor = ({ socket, roomId, onCodeChange, initialCode, language = 'javascript', onRun }) => {
  const editorRef = useRef(null);
  const textAreaRef = useRef(null);
  const isInternalChange = useRef(false);
  const socketRef = useRef(socket);

  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  useEffect(() => {
    if (!textAreaRef.current) return;

    const initialMode = language === 'java' ? 'text/x-java' : { name: 'javascript', json: true };

    editorRef.current = Codemirror.fromTextArea(textAreaRef.current, {
      mode: initialMode,
      theme: 'dracula',
      autoCloseTags: true,
      autoCloseBrackets: true,
      lineNumbers: true,
      lineWrapping: true,
      extraKeys: {
        'Ctrl-Enter': () => {
          if (onRun) onRun();
        },
        'Cmd-Enter': () => {
          if (onRun) onRun();
        }
      }
    });

    editorRef.current.on('change', (instance, changes) => {
      const { origin } = changes;
      const code = instance.getValue();
      onCodeChange(code);

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

  // Update mode when language prop changes
  useEffect(() => {
    if (editorRef.current) {
      const mode = language === 'java' ? 'text/x-java' : { name: 'javascript', json: true };
      editorRef.current.setOption('mode', mode);
    }
  }, [language]);

  // Update code when initialCode changes (e.g. language template switch)
  useEffect(() => {
    if (editorRef.current && initialCode !== undefined && initialCode !== editorRef.current.getValue()) {
      isInternalChange.current = true;
      editorRef.current.setValue(initialCode);
      isInternalChange.current = false;
      if (socketRef.current) {
        socketRef.current.emit(ACTIONS.CODE_CHANGE, {
          roomId,
          code: initialCode,
        });
      }
    }
  }, [initialCode, roomId]);

  // Sync incoming code changes from socket peers
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
