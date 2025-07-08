import { db, auth } from './firebase-config.js';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  Timestamp,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// Registrar manutenção
export async function registrarManutencao(veiculoId, tipo, descricao, dataInicio, dataFim, custo) {
  try {
    if (!auth.currentUser) throw new Error("Usuário não autenticado");
    
    const status = dataFim ? 'concluida' : 'agendada';
    
    await addDoc(collection(db, 'manutencoes'), {
      veiculoId: veiculoId,
      tipo: tipo,
      descricao: descricao,
      dataInicio: Timestamp.fromDate(new Date(dataInicio)),
      dataFim: dataFim ? Timestamp.fromDate(new Date(dataFim)) : null,
      custo: parseFloat(custo || 0),
      status: status,
      dataRegistro: serverTimestamp(),
      userId: auth.currentUser.uid
    });

    if (!dataFim) {
      await updateDoc(doc(db, 'veiculos', veiculoId), {
        status: 'manutencao'
      });
    }
  } catch (error) {
    console.error("Erro ao registrar manutenção:", error);
    throw error;
  }
}

// Finalizar manutenção
export async function finalizarManutencao(manutencaoId, dataFim) {
  try {
    if (!auth.currentUser) throw new Error("Usuário não autenticado");

    await updateDoc(doc(db, 'manutencoes', manutencaoId), {
      dataFim: Timestamp.fromDate(new Date(dataFim)),
      status: 'concluida'
    });

    const manutencaoDoc = await getDoc(doc(db, 'manutencoes', manutencaoId));
    const veiculoId = manutencaoDoc.data().veiculoId;

    const q = query(
      collection(db, 'manutencoes'),
      where('veiculoId', '==', veiculoId),
      where('status', 'in', ['agendada', 'em_andamento'])
    );
    
    const manutencoesAtivas = await getDocs(q);

    if (manutencoesAtivas.empty) {
      await updateDoc(doc(db, 'veiculos', veiculoId), {
        status: 'disponivel'
      });
    }
  } catch (error) {
    console.error("Erro ao finalizar manutenção:", error);
    throw error;
  }
}

// Listar manutenções
export async function listarManutencoes() {
  try {
    if (!auth.currentUser) throw new Error("Usuário não autenticado");
    
    const querySnapshot = await getDocs(collection(db, 'manutencoes'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Converter Timestamps para datas legíveis
      dataInicio: doc.data().dataInicio?.toDate() || null,
      dataFim: doc.data().dataFim?.toDate() || null,
      dataRegistro: doc.data().dataRegistro?.toDate() || null
    }));
  } catch (error) {
    console.error("Erro ao listar manutenções:", error);
    throw error;
  }
}

// Obter manutenções por veículo
export async function getManutencoesPorVeiculo(veiculoId) {
  try {
    if (!auth.currentUser) throw new Error("Usuário não autenticado");
    
    const q = query(
      collection(db, 'manutencoes'),
      where('veiculoId', '==', veiculoId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dataInicio: doc.data().dataInicio?.toDate() || null,
      dataFim: doc.data().dataFim?.toDate() || null
    }));
  } catch (error) {
    console.error("Erro ao obter manutenções do veículo:", error);
    throw error;
  }
}