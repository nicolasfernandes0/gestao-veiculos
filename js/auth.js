// js/auth.js
import { auth, db } from './firebase-config.js'; // Garanta que 'db' também está sendo importado
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// Função para login
export async function login(email, senha) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    return userCredential.user;
  } catch (error) {
    console.error("Erro no login:", error);
    throw error;
  }
}

// Função para registrar novo usuário
export async function registrarUsuario(nome, email, senha, tipo) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const uid = userCredential.user.uid;

    // Salva dados adicionais no Firestore
    await setDoc(doc(db, 'usuarios', uid), {
      nome: nome,
      email: email,
      tipo: tipo, // "motorista", "administrador" ou "supervisor"
      ativo: true,
      dataCriacao: serverTimestamp()
    });

    return userCredential.user;
  } catch (error) {
    console.error("Erro no registro:", error);
    throw error;
  }
}

// Função para logout
export async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Erro no logout:", error);
    throw error;
  }
}

// Função para monitorar estado de autenticação
export function monitorarEstadoAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

// Função para obter informações do usuário atual
export async function getCurrentUserInfo() {
  try {
    const user = auth.currentUser;
    if (!user) return null;

    // Obtém dados adicionais do Firestore
    const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
    
    if (userDoc.exists()) {
      return {
        id: user.uid,
        email: user.email,
        ...userDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error("Erro ao obter informações do usuário:", error);
    throw error;
  }
}

// A função 'verificarAcesso' foi removida deste arquivo.