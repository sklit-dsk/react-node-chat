import axios from 'axios';
// import socket from '../socket';
import { useState } from 'react';

function JoinBlock({ onLogin }) {
    const [roomId, setRoomId] = useState('');
    const [userName, setUserName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const joinRoom = async () => {
        if (!roomId || !userName) {
            return alert('Please enter room ID and your name');
        }

        const obj = {
            roomId,
            userName,
        };
        setIsLoading(true);
        await axios.post('http://localhost:9999/rooms', obj);
        onLogin(obj);
    }

    return (
        <div className="join-block">
            <input
                type="text"
                placeholder="Enter room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
            />
            <input
                type="text"
                placeholder="Your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
            />
            <button disabled={isLoading} onClick={joinRoom} className="btn btn-success">{isLoading ? 'Loading...' : 'Join in'}</button>
            
        </div>
    );
}

export default JoinBlock;
