import { db, auth } from './firebase-config.js';
import {
  getDocs,
  collection,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import {
  createUserWithEmailAndPassword,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential, // Necessário para algumas atualizações de segurança
  EmailAuthProvider, // Para reautenticação
  deleteUser // Usar com cautela, requer reautenticação para o próprio usuário
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';

// Função auxiliar para padronizar o tratamento de erros
function formatAuthError(error) {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'O e-mail fornecido já está em uso por outro usuário.';
    case 'auth/invalid-email':
      return 'O formato do e-mail é inválido.';
    case 'auth/weak-password':
      return 'A senha é muito fraca. Ela deve ter pelo menos 6 caracteres.';
    case 'auth/requires-recent-login':
      return 'Esta ação requer que você faça login novamente. Por favor, faça logout e login e tente novamente.';
    case 'auth/credential-too-old':
      return 'As credenciais são muito antigas. Por favor, faça login novamente para realizar esta ação.';
    case 'auth/user-not-found':
      return 'Usuário não encontrado.';
    case 'auth/wrong-password':
      return 'Senha incorreta.';
    // Adicione outros códigos de erro do Firebase Authentication conforme necessário
    default:
      return error.message || 'Ocorreu um erro desconhecido na autenticação.';
  }
}

// Listar todos os usuários
export async function listarUsuarios() {
  try {
    const querySnapshot = await getDocs(collection(db, 'usuarios'));
    const usuarios = [];

    querySnapshot.forEach(doc => {
      usuarios.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return usuarios;
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    // Para erros de permissão, é importante que a mensagem seja clara.
    if (error.code === 'permission-denied') {
      throw new Error('Você não tem permissão para listar usuários. Verifique as regras de segurança do Firestore.');
    }
    throw error;
  }
}

// Criar novo usuário
export async function criarUsuario(usuario) {
  try {
    const { email, senha, nome, tipo } = usuario;

    // 1. Criar no Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);

    // 2. Criar no Firestore com o UID do Authentication
    await setDoc(doc(db, 'usuarios', userCredential.user.uid), {
      nome,
      email, // Geralmente, o e-mail também é salvo no Firestore para facilitar consultas
      tipo,
      ativo: true,
      dataCadastro: serverTimestamp(),
      ultimoAcesso: null
    });

    return userCredential.user.uid;
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    // Lança um novo erro com uma mensagem amigável formatada
    throw new Error(formatAuthError(error));
  }
}

// Atualizar usuário
export async function atualizarUsuario(usuario) {
  try {
    const { id, email, nome, tipo, ativo, senha } = usuario;
    const currentUser = auth.currentUser;

    // Verificação de permissão: Um usuário só pode atualizar o PRÓPRIO perfil
    if (!currentUser || currentUser.uid !== id) {
      throw new Error("Você não tem permissão para atualizar este usuário.");
    }

    // 1. Atualizações no Firebase Authentication (apenas para o próprio usuário logado)
    if (email && currentUser.email !== email) {
      // Requer reautenticação para mudar o email se a última autenticação não for recente
      // Esta lógica de reautenticação deve ser tratada na UI antes de chamar esta função,
      // pois requer que o usuário insira a senha novamente.
      // Por simplicidade, vamos assumir que isso é feito se necessário, ou que a sessão é recente.
      try {
        await updateEmail(currentUser, email);
      } catch (authError) {
        console.error("Erro ao atualizar e-mail no Auth:", authError);
        throw new Error(formatAuthError(authError));
      }
    }

    if (senha) { // Apenas atualiza se uma nova senha foi fornecida
      // Similar ao email, a atualização de senha pode requerer reautenticação.
      try {
        await updatePassword(currentUser, senha);
      } catch (authError) {
        console.error("Erro ao atualizar senha no Auth:", authError);
        throw new Error(formatAuthError(authError));
      }
    }

    // 2. Atualização no Firestore (dados do perfil)
    // Crie um objeto com os dados a serem atualizados no Firestore
    const firestoreUpdateData = {
      nome,
      tipo,
      ativo
      // O email pode ser atualizado aqui também para consistência, se for alterado no Auth
      // email: email || currentUser.email // Usa o novo email se foi fornecido, ou o atual do Auth
    };
    if (email && currentUser.email !== email) {
        firestoreUpdateData.email = email;
    }


    await updateDoc(doc(db, 'usuarios', id), firestoreUpdateData);

    return true;
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    throw error; // Re-lança os erros já formatados ou outros erros
  }
}

// Excluir usuário
export async function excluirUsuario(id) {
  try {
    const currentUser = auth.currentUser;

    // Restrição de segurança: Apenas o PRÓPRIO usuário logado pode tentar se deletar
    // E, mesmo assim, requer reautenticação se a sessão não for recente.
    // Para um ADMIN deletar outros usuários, use Firebase Cloud Functions com Admin SDK.
    if (!currentUser || currentUser.uid !== id) {
      throw new Error("Você não tem permissão para excluir este usuário.");
    }

    // Para deletar o próprio usuário, é **altamente recomendado** forçar um re-login
    // se a sessão não for recente, para evitar exclusões acidentais ou maliciosas.
    // A reautenticação deve ser feita ANTES de chamar esta função, na UI.
    // Ex: await reauthenticateWithCredential(currentUser, credential);

    // 1. Deletar do Authentication
    await deleteUser(currentUser);

    // 2. Deletar do Firestore (o perfil associado)
    await deleteDoc(doc(db, 'usuarios', id));

    return true;
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    // Lança um novo erro com uma mensagem amigável formatada
    throw new Error(formatAuthError(error));
  }
}