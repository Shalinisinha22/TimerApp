import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const storedHistory = await AsyncStorage.getItem('history');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Error loading history:", error);
    }
  };

  const clearHistory = async () => {
    Alert.alert('Confirm', 'Do you want to clear all history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', onPress: async () => {
          await AsyncStorage.removeItem('history');
          setHistory([]);
        } 
      },
    ]);
  };

  const exportHistory = async () => {
    if (history.length === 0) {
      Alert.alert("No Data", "There is no history to export.");
      return;
    }

    const jsonString = JSON.stringify(history, null, 2);
    const fileUri = `${FileSystem.documentDirectory}history.json`;

    try {
      await FileSystem.writeAsStringAsync(fileUri, jsonString, { encoding: FileSystem.EncodingType.UTF8 });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert("Sharing Not Available", "This feature is not available on your device.");
      }
    } catch (error) {
      console.error("Error exporting history:", error);
      Alert.alert("Export Failed", "Something went wrong while exporting.");
    }
  };

  return (
    <LinearGradient colors={['#4CAF50', '#e9f5db']} style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 20 }}>
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ padding: 10, borderBottomWidth: 1 }}>
              <Text style={{ fontSize: 16 }}>{item.name} ({item.category})</Text>
              <Text style={{ color: 'gray' }}>Completed: {item.completedAt}</Text>
            </View>
          )}
        />

        {history.length !== 0 && (
          <>
            <TouchableOpacity 
              style={{ backgroundColor: '#132a13', padding: 15, borderRadius: 20, alignItems: "center", marginBottom: 10 }} 
              onPress={clearHistory}
            >
              <Text style={{ color: "#fff", textAlign: "center", fontSize: 18 }}>Clear History</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{ backgroundColor: '#1b5e20', padding: 15, borderRadius: 20, alignItems: "center" }} 
              onPress={exportHistory}
            >
              <Text style={{ color: "#fff", textAlign: "center", fontSize: 18 }}>Export History</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </LinearGradient>
  );
}
