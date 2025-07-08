import { db } from './firebase-config.js';

// Registrar uso do veículo
export async function registrarUso(veiculoId, usuarioId, dataInicio, kmInicial, finalidade) {
  try {
    const registroRef = await db.collection('registrosUso').add({
      veiculoId: veiculoId,
      usuarioId: usuarioId,
      dataInicio: firebase.firestore.Timestamp.fromDate(new Date(dataInicio)),
      quilometragemInicial: kmInicial,
      finalidade: finalidade,
      status: 'em_andamento'
    });
    return registroRef.id;
  } catch (error) {
    console.error("Erro ao registrar uso:", error);
    throw error;
  }
}

// Finalizar uso do veículo
// (Implement the function here or remove the incomplete export)