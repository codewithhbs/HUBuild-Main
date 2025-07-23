// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
// Replace 10.13.2 with latest version of the Firebase JS SDK.
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
    apiKey: "AIzaSyAgSZRrHiMRWzbii-f2AEZtJ27EWK00YPE",
    authDomain: "helpubuild-ee5bd.firebaseapp.com",
    projectId: "helpubuild-ee5bd",
    storageBucket: "helpubuild-ee5bd.firebasestorage.app",
    messagingSenderId: "223656793899",
    appId: "1:223656793899:web:4628883dd4db620a84176e"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();



// messaging.onBackgroundMessage((payload) => {
//     console.log(
//       '[firebase-messaging-sw.js] Received background message ',
//       payload
//     );
//     // Customize notification here
//     const notificationTitle = payload.notification.title;
//     const notificationOptions = {
//       body: payload.notification.body,
//       icon: payload.notification.image,
//     };
  
//     self.registration.showNotification(notificationTitle, notificationOptions);
//   });

React.useEffect(() => {
  onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);

    // Display a custom notification or toast
    toast.info(`${payload.notification.title}: ${payload.notification.body}`);
  });
}, []);