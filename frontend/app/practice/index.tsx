import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const NIVELES = [
  'Semilleros (Primaria)',
  'Nivel 1 (6° y 7°)',
  'Nivel 2 (8° y 9°)',
  'Nivel 3 (10° y 11°)',
];

const TIPOS = [
  { id: 'numérico', name: 'Numérico', icon: '123' as any },
  { id: 'lógico', name: 'Lógico', icon: 'bulb' as any },
  { id: 'espacial', name: 'Espacial', icon: 'cube' as any },
  { id: 'cotidiano', name: 'Cotidiano', icon: 'home' as any },
];

export default function PracticeSetupScreen() {
  const router = useRouter();
  const [selectedNivel, setSelectedNivel] = useState(NIVELES[1]);
  const [selectedTipo, setSelectedTipo] = useState('numérico');

  const handleStart = () => {
    router.push({
      pathname: '/practice/game',
      params: { nivel: selectedNivel, tipo: selectedTipo }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Modo Práctica</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Selecciona tu Nivel</Text>
        {NIVELES.map((nivel) => (
          <TouchableOpacity
            key={nivel}
            style={[
              styles.optionCard,
              selectedNivel === nivel && styles.optionCardSelected
            ]}
            onPress={() => setSelectedNivel(nivel)}
          >
            <View style={styles.optionContent}>
              <Text style={[
                styles.optionText,
                selectedNivel === nivel && styles.optionTextSelected
              ]}>
                {nivel}
              </Text>
              {selectedNivel === nivel && (
                <Ionicons name="checkmark-circle" size={24} color="#6c63ff" />
              )}
            </View>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Tipo de Pensamiento</Text>
        <View style={styles.tiposGrid}>
          {TIPOS.map((tipo) => (
            <TouchableOpacity
              key={tipo.id}
              style={[
                styles.tipoCard,
                selectedTipo === tipo.id && styles.tipoCardSelected
              ]}
              onPress={() => setSelectedTipo(tipo.id)}
            >
              <Ionicons
                name={tipo.icon}
                size={32}
                color={selectedTipo === tipo.id ? '#6c63ff' : '#fff'}
              />
              <Text style={[
                styles.tipoText,
                selectedTipo === tipo.id && styles.tipoTextSelected
              ]}>
                {tipo.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startButtonText}>Comenzar Práctica</Text>
          <Ionicons name="arrow-forward" size={24} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0c29',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    marginTop: 8,
  },
  optionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: '#6c63ff',
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#fff',
  },
  optionTextSelected: {
    fontWeight: 'bold',
    color: '#6c63ff',
  },
  tiposGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  tipoCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tipoCardSelected: {
    borderColor: '#6c63ff',
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
  },
  tipoText: {
    fontSize: 14,
    color: '#fff',
    marginTop: 8,
  },
  tipoTextSelected: {
    fontWeight: 'bold',
    color: '#6c63ff',
  },
  startButton: {
    backgroundColor: '#6c63ff',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
});
