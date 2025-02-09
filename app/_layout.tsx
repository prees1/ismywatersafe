import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Platform, Linking } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';


const WaterQualityMonitor = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPostal, setSelectedPostal] = useState(null);
  const [waterData, setWaterData] = useState([]);

  useEffect(() => {
    fetchWaterData();
  }, []);

  const fetchWaterData = async () => {
    try {
      const response = await fetch('https://philrees.ca/Non%20Regulated%20Lead%20Samples.csv');
      const text = await response.text();

      Papa.parse(text, {
        header: true,
        complete: (results) => {
          const formattedData = results.data.map((item, index) => ({
            id: item._id || String(index),
            date: item['Sample Date'],
            postalCode: item.PartialPostalCode,
            leadAmount: parseFloat(item['Lead Amount (ppm)'])
          })).filter(item => item.leadAmount && item.postalCode); // Filter out any invalid entries

          setWaterData(formattedData);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
        }
      });
    } catch (error) {
      console.error('Error fetching CSV:', error);
    }
  };

  const getLeadLevelColor = (leadAmount) => {
    if (leadAmount < 0.005) return '#2196F3';
    if (leadAmount < 0.015) return '#FFC107';
    return '#FF5252';
  };

  const getLeadLevelText = (leadAmount) => {
    if (leadAmount < 0.005) return 'Safe';
    if (leadAmount < 0.015) return 'Concerning';
    return 'Unsafe';
  };

  const getRecommendation = (leadAmount) => {
    if (leadAmount < 0.005) return 'Water is safe to drink';
    return 'Please read the information about lead in drinking water and contact the city about replacing your water service pipe at no cost: toronto.ca/lead-drinking-water';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleLearnMore = () => {
    Linking.openURL('https://www.toronto.ca/services-payments/water-environment/tap-water-in-toronto/lead-drinking-water/');
  };

  const filteredData = waterData.filter(item =>
    item.postalCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1976D2', '#2196F3']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Toronto Water Quality</Text>
        <Text style={styles.headerSubtitle}>Lead Level Monitor</Text>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by postal code (e.g., M4E)"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Results */}
      <View style={styles.resultsContainer}>
        {filteredData.map((item) => (
          <Pressable
            key={item.id}
            style={[styles.resultCard, { borderLeftColor: getLeadLevelColor(item.leadAmount) }]}
            onPress={() => setSelectedPostal(item.postalCode)}
          >
            <View style={styles.cardHeader}>
              <View style={styles.postalContainer}>
                <MaterialCommunityIcons name="map-marker" size={24} color="#666" />
                <Text style={styles.postalCode}>{item.postalCode}</Text>
              </View>
              <Text style={styles.date}>{formatDate(item.date)}</Text>
            </View>

            <View style={styles.leadInfoContainer}>
              <View style={styles.leadLevel}>
                <Text style={styles.leadAmount}>{item.leadAmount.toFixed(6)}</Text>
                <Text style={styles.leadUnit}>ppm</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getLeadLevelColor(item.leadAmount) }]}>
                <Text style={styles.statusText}>{getLeadLevelText(item.leadAmount)}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="information" size={20} color="#666" />
              <Text style={styles.infoText}>
                {getRecommendation(item.leadAmount)}
              </Text>
            </View>

            {item.leadAmount >= 0.005 && (
              <Pressable style={styles.learnMoreButton} onPress={handleLearnMore}>
                <Text style={styles.learnMoreText}>Learn More</Text>
              </Pressable>
            )}
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  resultsContainer: {
    padding: 16,
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  postalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postalCode: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  date: {
    color: '#666',
  },
  leadInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leadLevel: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  leadAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  leadUnit: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 8,
  },
  infoText: {
    marginLeft: 8,
    color: '#666',
    flex: 1,
  },
  learnMoreButton: {
    backgroundColor: '#1976D2',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  learnMoreText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default WaterQualityMonitor;