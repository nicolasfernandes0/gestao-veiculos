// firebase-config.js

// Importações da API modular
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDKyfzvvy3vwXvmy2t_g2D2nLDR9Nm1x2I",
  authDomain: "gerenciamento-veiculos-6df88.firebaseapp.com",
  projectId: "gerenciamento-veiculos-6df88",
  storageBucket: "gerenciamento-veiculos-6df88.appspot.com", // Corrigido: .app → .appspot.com
  messagingSenderId: "636653603303",
  appId: "1:636653603303:web:e03e445d48fb87ee6f1542"
};

// Inicializa o app Firebase
const app = initializeApp(firebaseConfig);

// Inicializa os serviços
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Exporta os serviços para uso em outros arquivos
export { db, storage, auth };
