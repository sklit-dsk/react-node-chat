import React, { useReducer } from 'react';
import socket from './socket';
import reducer from './reducer';
import JoinBlock from './components/JoinBlock';
import Chat from './components/Chat';

function App() {
    const [state, dispatch] = useReducer(reducer, {
        joined: false,
        roomId: null,
        userName: null,
    });

    const onLogin = (obj) => {
        dispatch({ type: 'JOINED', payload: obj });
        socket.emit('ROOM:JOIN', obj);
    };

    React.useEffect(() => {
      socket.on('ROOM:JOINED', (users) => {
        console.log('Users in room:', users);
      });
    }, []);

    window.socket = socket;

    return <div className="wrapper">{!state.joined ? <JoinBlock onLogin={onLogin} /> : <Chat /> }</div>;
}

export default App;
