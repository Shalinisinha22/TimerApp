import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Alert, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgressBar } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const categories = ['Workout', 'Study', 'Break'];

export default function TimerScreen({ navigation }) {
  const [timers, setTimers] = useState([]);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [completedTimer, setCompletedTimer] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  
  useEffect(() => {
    loadTimers();
  }, []);

  const loadTimers = async () => {
    const storedTimers = await AsyncStorage.getItem('timers');
    if (storedTimers) setTimers(JSON.parse(storedTimers));
  };

  const saveTimers = async (newTimers) => {
    setTimers(newTimers);
    await AsyncStorage.setItem('timers', JSON.stringify(newTimers));
  };

  const addTimer = () => {
    if (!name || !duration) {
      Alert.alert('Error', 'Please enter all fields');
      return;
    }
    const newTimer = { 
      id: Date.now(), 
      name, 
      duration: parseInt(duration), 
      category, 
      remaining: parseInt(duration), 
      halfwayTriggered: false,
      status: 'Paused' 
    };
    saveTimers([...timers, newTimer]);
    setName(''); setDuration('');
  };

  const startTimer = (id) => {
    const updatedTimers = timers.map(timer => {
      if (timer.id === id && timer.status !== 'Completed') {
        return { ...timer, status: 'Running' };
      }
      return timer;
    });
    saveTimers(updatedTimers);
  };

  const pauseTimer = (id) => {
    const updatedTimers = timers.map(timer => (timer.id === id ? { ...timer, status: 'Paused' } : timer));
    saveTimers(updatedTimers);
  };

  const resetTimer = (id) => {
    const updatedTimers = timers.map(timer => (timer.id === id ? { ...timer, remaining: timer.duration, status: 'Paused', halfwayTriggered: false } : timer));
    saveTimers(updatedTimers);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(currentTimers => {
        return currentTimers.map((timer) => {
          if (timer.status === 'Running' && timer.remaining > 0) {
            const updatedTimer = { ...timer, remaining: timer.remaining - 1 };

            // Trigger Halfway Alert
            if (!updatedTimer.halfwayTriggered && updatedTimer.remaining === Math.floor(updatedTimer.duration / 2)) {
              Alert.alert('Halfway Alert', `${updatedTimer.name} has reached the halfway mark!`);
              updatedTimer.halfwayTriggered = true;
            }

            // Timer Completed
            if (updatedTimer.remaining === 0) {
              updatedTimer.status = 'Completed';
              setCompletedTimer(updatedTimer.name);
              setModalVisible(true);
              const newTimers= timers.filter((timer)=>timer.id!=updatedTimer.id)
              // const storedTimers = await AsyncStorage.setItem('timers',newTimers);

              saveToHistory(updatedTimer);
            }
            return updatedTimer;
          }
          return timer;
        });
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const saveToHistory = async (timer) => {
    const newTimer= timers.filter(value=> value.id!==timer.id)
    console.log(newTimer,timers)
    await AsyncStorage.setItem('timers', JSON.stringify(newTimer));
    console.log(timer,"107")
    setTimers(newTimer)
    const history = JSON.parse(await AsyncStorage.getItem('history')) || [];
    const newEntry = { name: timer.name, completedAt: new Date().toLocaleString(),category:timer.category };
    await AsyncStorage.setItem('history', JSON.stringify([newEntry, ...history]));

  };

  const startAllTimersInCategory = (category) => {
    const updatedTimers = timers.map(timer => {
      if (timer.category === category && timer.status !== 'Completed') {
        return { ...timer, status: 'Running' };
      }
      return timer;
    });
    saveTimers(updatedTimers);
  };
  
  const pauseAllTimersInCategory = (category) => {
    const updatedTimers = timers.map(timer => {
      if (timer.category === category && timer.status === 'Running') {
        return { ...timer, status: 'Paused' };
      }
      return timer;
    });
    saveTimers(updatedTimers);
  };
  
  const resetAllTimersInCategory = (category) => {
    const updatedTimers = timers.map(timer => {
      if (timer.category === category) {
        return { ...timer, remaining: timer.duration, status: 'Paused', halfwayTriggered: false };
      }
      return timer;
    });
    saveTimers(updatedTimers);
  };
  const Category = ({categories,startAllTimersInCategory,resetAllTimersInCategory,pauseAllTimersInCategory,setSelectedCategory,selectedCategory}) => {
    return (
        <View>
       <Picker selectedValue={selectedCategory} onValueChange={setSelectedCategory} style={styles.picker}>
          {categories.map((cat) => (
            <Picker.Item key={cat} label={cat} value={cat} />
          ))}
        </Picker>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={startAllTimersInCategory}>
            <Text style={styles.buttonText}>Start All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={pauseAllTimersInCategory}>
            <Text style={styles.buttonText}>Pause All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={resetAllTimersInCategory}>
            <Text style={styles.buttonText}>Reset All</Text>
          </TouchableOpacity>
        </View>

      </View>
    )
  }

  return (
    <LinearGradient colors={['#4CAF50', '#e9f5db']} style={styles.container}>
      <View style={styles.content}>
        {/* <Text></Text> */}
        <MaterialIcons name="timer" size={40} color="white" style={styles.icon} />
        <TextInput placeholder="Timer Name" value={name} onChangeText={setName} style={styles.input} placeholderTextColor="#ddd" />
        <TextInput placeholder="Duration (seconds)" value={duration} onChangeText={setDuration} keyboardType="numeric" style={styles.input} placeholderTextColor="#ddd" />
        <Picker selectedValue={category} onValueChange={setCategory} style={styles.picker}>
          {categories.map(cat => <Picker.Item key={cat} label={cat} value={cat} />)}
        </Picker>
        
        <TouchableOpacity style={styles.button} onPress={addTimer}><Text style={styles.buttonText}>Add Timer</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.historyButton]} onPress={() => navigation.navigate('History')}><Text style={styles.buttonText}>View History</Text></TouchableOpacity>

{/* <Category startAllTimersInCategory={startAllTimersInCategory} resetAllTimersInCategory={resetAllTimersInCategory} pauseAllTimersInCategory={pauseAllTimersInCategory} categories={categories} selectedCategory={selectedCategory} setCategory={setSelectedCategory}> 

</Category> */}
     <FlatList
     data={timers.filter(timer => timer.status !== 'Completed')}
   
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.timerCard}>
              {/* {console.log(item)} */}
              <Text style={styles.timerText}>{item.name} ({item.category})</Text>
              {item.category=="Completed"?
              <Text style={styles.timerSubText}>Remaining: {item.remaining}s</Text>

              :
              <>
                  <Text style={styles.timerSubText}>Remaining: {item.remaining}s</Text>
              <ProgressBar progress={item.remaining / item.duration} color="#e5383b" style={styles.progress} />
              <View style={styles.buttonRow}>
              <TouchableOpacity 
  style={[styles.smallButton, { backgroundColor: item.status === 'Running' ? '#66bb6a' : '#1b5e20' }]} 
  onPress={() => startTimer(item.id)} 
  disabled={item.status === 'Completed'}
>
  <Text style={styles.smallButtonText}>Start</Text>
</TouchableOpacity>

<TouchableOpacity 
  style={[styles.smallButton, { backgroundColor: item.status === 'Paused' ? '#ffcc80' : '#e65100' }]} 
  onPress={() => pauseTimer(item.id)} 
  disabled={item.status !== 'Running'}
>
  <Text style={styles.smallButtonText}>Pause</Text>
</TouchableOpacity>

                <TouchableOpacity style={[styles.smallButton, { backgroundColor: '#1a237e' }]} onPress={() => resetTimer(item.id)}>
                  <Text style={styles.smallButtonText}>Reset</Text>
                </TouchableOpacity>
              </View>
              </>
            }
          
            </View>
          )}
        />

        <Modal visible={modalVisible} transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalBox}>
              <Text style={styles.modalText}>🎉 {completedTimer} Completed!</Text>
              <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>

        </Modal>
      </View>
    </LinearGradient>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 20, justifyContent: 'center' },
  icon: { alignSelf: 'center', marginBottom: 15 },
  input: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 5, marginBottom: 10, color: 'white' },
  picker: { backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: 5, marginBottom: 10 },
  button: { backgroundColor: '#2e7d32', padding: 12, borderRadius: 5, alignItems: 'center', marginBottom: 10 },
  buttonText: { color: 'white', fontWeight: 'bold' },
  historyButton: { backgroundColor: '#1b5e20' },
  timerCard: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 15, borderRadius: 8, marginBottom: 10 },
  timerText: { color: '#111', fontSize: 16, fontWeight: 'bold' },
  timerSubText: { color: '#e65100' ,fontWeight:"bold"},
  progress: { height: 10, borderRadius: 5, marginVertical: 5 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  smallButton: { padding: 8, borderRadius: 5, alignItems: 'center', flex: 1, marginHorizontal: 5 },
  smallButtonText: { color: 'white', fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalBox: { backgroundColor: 'white', padding: 20, borderRadius: 10 },
  modalText: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' }
});
