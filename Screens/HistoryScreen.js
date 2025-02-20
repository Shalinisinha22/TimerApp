import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { ThemeContext } from '../Context/ThemeContext';

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
const {theme} = useContext(ThemeContext)
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
    <LinearGradient 
      colors={theme === 'light' ? ['#4CAF50', '#e9f5db'] : ['#1b5e20', '#132a13']} 
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, padding: 20 }}>
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{
              padding: 10,
              borderBottomWidth: 1,
              borderBottomColor: theme === 'light' ? '#ccc' : '#555',
            }}>
              <Text allowFontScaling={false} style={{ 
                fontSize: 16, 
                color: theme === 'light' ? '#111' : '#fff' 
              }}>
                {item.name} ({item.category})
              </Text>
              <Text allowFontScaling={false} style={{ color: theme === 'light' ? 'gray' : '#bbb' }}>
                Completed: {item.completedAt}
              </Text>
            </View>
          )}
        />

        {history.length !== 0 && (
          <>
            <TouchableOpacity 
              style={{ 
                backgroundColor: theme === 'light' ? '#132a13' : '#4caf50', 
                padding: 12, 
                borderRadius: 20, 
                alignItems: "center", 
                marginBottom: 10 
              }} 
              onPress={clearHistory}
            >
              <Text allowFontScaling={false} style={{ color: "#fff", textAlign: "center", fontSize: 16 }}>
                Clear History
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{ 
                backgroundColor: theme === 'light' ? '#1b5e20' : '#388e3c', 
                padding: 12, 
                borderRadius: 20, 
                alignItems: "center" 
              }} 
              onPress={exportHistory}
            >
              <Text allowFontScaling={false} style={{ color: "#fff", textAlign: "center", fontSize: 16 }}>
                Export History
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </LinearGradient>
  );
}
