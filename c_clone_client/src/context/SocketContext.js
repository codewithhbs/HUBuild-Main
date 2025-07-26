import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';
import { GetData } from '../utils/sessionStoreage';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

const ENDPOINT = 'https://www.testapi.helpubuild.in';

export const SocketProvider = ({ children }) => {
    const socket = useMemo(() => io(ENDPOINT, {
        autoConnect: false,
        transports: ['websocket'],
    }), []);

    useEffect(() => {
        const storedUser = GetData('user');
        const userData = storedUser ? JSON.parse(storedUser) : null;

        // console.log("✅ userData from session:", userData);

        socket.connect();

        socket.on('connection', () => {
            console.log('✅ Socket connected:', socket.id);

            if (userData) {
                socket.emit('send_socket_id', {
                    socketId: socket.id,
                    role: userData.role,
                    userId: userData._id,
                });
            }
        });

        socket.on('disconnect', () => {
            console.log('❌ Socket disconnected');
        });

        return () => {
            socket.disconnect();
        };
    }, [socket]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};