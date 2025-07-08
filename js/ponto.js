import { db } from './firebase-config.js'; // Sua instância do Firestore v9
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp, // Para timestamps automáticos
  Timestamp         // Para criar objetos Timestamp manualmente
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js'; // Certifique-se de que a versão da URL corresponde à sua config

// Registrar ponto
export async function registrarPonto(motoristaId, tipo, localizacao = null, veiculoId = null, observacao = '') {
  try {
    // 1. Crie uma referência para a coleção usando collection(db, 'nome_da_colecao')
    const pontosCollectionRef = collection(db, 'pontos');

    // 2. Use addDoc() para adicionar um documento a essa coleção
    const pontoRef = await addDoc(pontosCollectionRef, {
      motoristaId: motoristaId,
      tipo: tipo,
      data: serverTimestamp(), // Use serverTimestamp() para a data do servidor
      localizacao: localizacao,
      veiculoId: veiculoId,
      observacao: observacao
    });
    return pontoRef.id;
  } catch (error) {
    console.error("Erro ao registrar ponto:", error);
    throw error;
  }
}

// Obter registros de ponto de um motorista
export async function getPontosMotorista(motoristaId, dataInicio, dataFim) {
  try {
    // 1. Crie uma referência para a coleção
    const pontosCollectionRef = collection(db, 'pontos');

    // 2. Construa a consulta usando query(), where(), orderBy()
    let q = query(
      pontosCollectionRef,
      where('motoristaId', '==', motoristaId),
      orderBy('data', 'desc')
    );

    if (dataInicio && dataFim) {
      // Converte as strings de data para objetos Date, e então para Timestamp do Firestore
      const inicioTimestamp = Timestamp.fromDate(new Date(dataInicio));
      const fimTimestamp = Timestamp.fromDate(new Date(dataFim));
      
      q = query(
        pontosCollectionRef,
        where('motoristaId', '==', motoristaId),
        where('data', '>=', inicioTimestamp),
        where('data', '<=', fimTimestamp),
        orderBy('data', 'desc') // orderBy é necessário para consultas de intervalo de campo
      );
    }

    // 3. Use getDocs() para executar a consulta
    const querySnapshot = await getDocs(q);

    // Mapeie os documentos para o formato desejado
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Erro ao obter pontos:", error);
    throw error;
  }
}