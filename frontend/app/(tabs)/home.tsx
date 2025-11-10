import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0f0c29', '#302b63', '#24243e']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hola, {user?.username}!</Text>
              <Text style={styles.sede}>{user?.sede}</Text>
            </View>
            <View style={styles.logoContainer}>
              <Ionicons name="trophy" size={40} color="#FFD700" />
            </View>
          </View>

          {/* Welcome Card */}
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>Bienvenido a Pedro Math Pro</Text>
            <Text style={styles.welcomeText}>
              La plataforma de competencias matemáticas del Gimnasio Americano del Atlántico
            </Text>
          </View>

          {/* Modes */}
          <Text style={styles.sectionTitle}>Modos de Juego</Text>

          <TouchableOpacity
            style={styles.modeCard}
            onPress={() => router.push('/practice')}
          >
            <View style={[styles.modeIcon, { backgroundColor: '#4CAF50' }]}>
              <Ionicons name="school" size={32} color="#fff" />
            </View>
            <View style={styles.modeContent}>
              <Text style={styles.modeTitle}>Modo Práctica</Text>
              <Text style={styles.modeDescription}>
                Practica individualmente a tu ritmo
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#6c63ff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modeCard}
            onPress={() => Alert.alert('Próximamente', 'El modo competencia estará disponible pronto')}
          >
            <View style={[styles.modeIcon, { backgroundColor: '#FF9800' }]}>
              <Ionicons name="flame" size={32} color="#fff" />
            </View>
            <View style={styles.modeContent}>
              <Text style={styles.modeTitle}>Modo Competencia</Text>
              <Text style={styles.modeDescription}>
                Compite en vivo con otras sedes
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#6c63ff" />
          </TouchableOpacity>

          {/* Stats */}
          <Text style={styles.sectionTitle}>Mis Estadísticas</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="trophy-outline" size={32} color="#6c63ff" />
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Victorias</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="star-outline" size={32} color="#6c63ff" />
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Puntos</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="ribbon-outline" size={32} color="#6c63ff" />
              <Text style={styles.statNumber}>N/A</Text>
              <Text style={styles.statLabel}>Ranking</Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  sede: {
    fontSize: 14,
    color: '#a0a0a0',
    marginTop: 4,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeCard: {
    backgroundColor: 'rgba(108, 99, 255, 0.2)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.3)',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#a0a0a0',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modeContent: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#a0a0a0',
    marginTop: 4,
  },
});
