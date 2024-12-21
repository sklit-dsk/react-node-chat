import React, { useReducer } from 'react';
import socket from './socket';
import reducer from './reducer';
import JoinBlock from './components/JoinBlock';
import Chat from './components/Chat';
import axios from 'axios';

function App() {
    const [state, dispatch] = useReducer(reducer, {
        joined: false,
        roomId: null,
        userName: null,
        users: [],
        messages: [],
    });

    const setUsers = (users) => {
        dispatch({ type: 'SET_USERS', payload: users });
    };

    const addMessage = (message) => {
        dispatch({ type: 'NEW_MESSAGES', payload: message, });
    };

    const onLogin = async (obj) => {
        dispatch({ type: 'JOINED', payload: obj });
        socket.emit('ROOM:JOIN', obj);
        const { data } = await axios.get(`/rooms/${obj.roomId}`);
        // setUsers(data.users);
        dispatch({ type: 'SET_DATA', payload: data });
    };

    React.useEffect(() => {
        socket.on('ROOM:SET_USERS', setUsers);
        socket.on('ROOM:NEW_MESSAGES', addMessage);

        return () => {
            socket.off('ROOM:SET_USERS', setUsers);
            socket.off('ROOM:NEW_MESSAGES', addMessage);
        }
    }, []);

    window.socket = socket;

    return (
        <div className="wrapper">
            {!state.joined ? <JoinBlock onLogin={onLogin} /> : <Chat {...state} onAddMessage={addMessage} />}
        </div>
    );
}

export default App;
