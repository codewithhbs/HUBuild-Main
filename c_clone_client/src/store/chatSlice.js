import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  notifications: [],
  activeChat: null,
  isConnected: false,
  unreadCount: 0
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.push(action.payload);
      state.unreadCount += 1;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
    }
  }
});

export const {
  setMessages,
  addMessage,
  setActiveChat,
  addNotification,
  clearNotifications,
  setConnectionStatus
} = chatSlice.actions;

export default chatSlice.reducer;