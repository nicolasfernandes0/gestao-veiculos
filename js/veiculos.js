// js/veiculos.js

import { db } from './firebase-config.js';
import {
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Função para cadastrar um novo veículo
export async function cadastrarVeiculo(placa, marca, modelo, ano, tipo) {
  try {
    const docRef = await addDoc(collection(db, "veiculos"), {
      placa,
      marca,
      modelo,
      ano: parseInt(ano),
      tipo,
      quilometragem: 0,
      status: 'disponivel',
      dataCriacao: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao cadastrar veículo:", error);
    throw error;
  }
}

// Função para listar todos os veículos
export async function listarVeiculos() {
  try {
    const veiculosRef = collection(db, "veiculos");
    const snapshot = await getDocs(veiculosRef);
    const veiculos = [];

    snapshot.forEach((doc) => {
      veiculos.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return veiculos;
  } catch (error) {
    console.error("Erro ao listar veículos:", error);
    throw error;
  }
}
