import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

const NIVELES = [
  'Semilleros (Primaria)',
  'Nivel 1 (6° y 7°)',
  'Nivel 2 (8° y 9°)',
  'Nivel 3 (10° y 11°)',
];

const TIPOS = ['numérico', 'lógico', 'espacial', 'cotidiano'];

export default function AdminScreen() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadQuestionCounts();
  }, []);

  const loadQuestionCounts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/questions/count/by-level`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuestionCounts(response.data);
    } catch (error) {
      console.error('Error loading question counts:', error);
    }
  };

  const generateQuestions = async (nivel: string, tipo: string) => {
    try {
      await axios.post(
        `${API_URL}/api/questions/generate`,
        {
          nivel,
          tipo_pensamiento: tipo,
          cantidad: 20,
          categoria: 'Matemáticas',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error: any) {
      console.error(`Error generating ${nivel} - ${tipo}:`, error);
      throw error;
    }
  };

  const handleGenerateAll = () => {
    Alert.alert(
      'Generar Banco Completo',
      '¿Deseas generar 400+ preguntas para todos los niveles y tipos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Generar',
          onPress: async () => {
            setGenerating(true);
            try {
              for (const nivel of NIVELES) {
                for (const tipo of TIPOS) {
                  await generateQuestions(nivel, tipo);
                  await new Promise(resolve => setTimeout(resolve, 2000));
                }
              }
              Alert.alert('Éxito', 'Banco de preguntas generado completamente');
              loadQuestionCounts();
            } catch (error) {
              Alert.alert('Error', 'Hubo un error al generar algunas preguntas');
            } finally {
              setGenerating(false);
            }
          },
        },
      ]
    );
  };

  const totalQuestions = Object.values(questionCounts).reduce((a, b) => a + b, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Panel Admin</Text>
          <Text style={styles.subtitle}>Gestión de Preguntas</Text>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalQuestions}</Text>
            <Text style={styles.statLabel}>Preguntas Totales</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Preguntas por Nivel</Text>
        {NIVELES.map((nivel) => (
          <View key={nivel} style={styles.levelCard}>
            <View style={styles.levelInfo}>
              <Text style={styles.levelName}>{nivel}</Text>
              <Text style={styles.levelCount}>
                {questionCounts[nivel] || 0} preguntas
              </Text>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.generateButton, generating && styles.generateButtonDisabled]}
          onPress={handleGenerateAll}
          disabled={generating}
        >
          {generating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="sparkles" size={24} color="#fff" />
              <Text style={styles.generateButtonText}>
                Generar Banco Completo (400+ preguntas)
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          * Se generarán aproximadamente 20 preguntas por cada combinación de nivel y
          tipo de pensamiento usando IA
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0c29',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0a0',
    marginTop: 4,
  },
  statsCard: {
    backgroundColor: 'rgba(108, 99, 255, 0.2)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.3)',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 14,
    color: '#a0a0a0',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  levelCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  levelCount: {
    fontSize: 14,
    color: '#6c63ff',
    fontWeight: 'bold',
  },
  generateButton: {
    backgroundColor: '#6c63ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 16,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  note: {
    fontSize: 12,
    color: '#a0a0a0',
    textAlign: 'center',
    lineHeight: 18,
  },
});
