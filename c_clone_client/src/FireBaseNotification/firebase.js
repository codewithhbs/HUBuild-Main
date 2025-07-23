import { initializeApp } from "firebase/app";
import { getMessaging,getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAgSZRrHiMRWzbii-f2AEZtJ27EWK00YPE",
  authDomain: "helpubuild-ee5bd.firebaseapp.com",
  projectId: "helpubuild-ee5bd",
  storageBucket: "helpubuild-ee5bd.firebasestorage.app",
  messagingSenderId: "223656793899",
  appId: "1:223656793899:web:4628883dd4db620a84176e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const generateToken = async () => {
    const permission = await Notification.requestPermission()
    console.log(permission)
    if(permission === 'granted'){
        const token = await getToken(messaging,{
            vapidKey: "BPT79qgYpTApYxL9txXtagkXTQmBAcvohwpHvh1BGXE8ROcHxug9uopoerkYyhJ_6lATpCtvMiIrp0uh0TNRf-U"
        })
        console.log(token)
    }
}