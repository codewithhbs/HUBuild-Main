import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';
import { GetData } from '../utils/sessionStoreage';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

const ENDPOINT = 'https://api.dessobuild.com';

export const SocketProvider = ({ children }) => {
    const socket = useMemo(() => io(ENDPOINT, {
        autoConnect: false,
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        pingTimeout: 30000,
        pingInterval: 25000,
    }), []);

    useEffect(() => {
        const storedUser = GetData('user');
        const userData = storedUser ? JSON.parse(storedUser) : null;

        // console.log("✅ userData from session:", userData);

        socket.connect();

        socket.on('connect', () => {
            console.log('✅ Socket connected:', socket.id);

            if (userData) {
                socket.emit('send_socket_id', {
                    socketId: socket.id,
                    role: userData.role,
                    userId: userData._id,
                });
            }
        });

        socket.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
        });

        socket.on('connect_error', (err) => {
            console.error('⚠️ Socket connect_error:', err?.message);
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