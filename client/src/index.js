import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { SocketProvider } from './context/SocketContext';
// import { Provider } from 'react-redux';
// import { store } from './store/store';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <SocketProvider>
      <App />
    </SocketProvider>
  );
  

