// Import the Firebase initialization and Messaging SDK
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

const firebaseConfig = {
  apiKey: 'AIzaSyAcwtSryk3XfnoabYNO5uIcjbXIaWkoPjI',
  authDomain: 'cryptophunks-auction-house.firebaseapp.com',
  projectId: 'cryptophunks-auction-house',
  storageBucket: 'cryptophunks-auction-house.appspot.com',
  messagingSenderId: '356196458803',
  appId: '1:356196458803:web:9d9de545fd5c3db0a29e46',
};

// Initialize Firebase with your configuration
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle incoming messages. Called when:
// - a message is received while the app has focus
// - the user clicks on an app notification created by a service worker
//   `messaging.onBackgroundMessage` handler.
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon,
  };

  // Show the notification
  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});
