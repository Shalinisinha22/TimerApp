import { StyleSheet, Text, View,StatusBar } from 'react-native';
import AppNavigation from './navigation/AppNavigation';


export default function App() {
  return (
    <View style={styles.container}>
  <AppNavigation></AppNavigation>
  <StatusBar
        backgroundColor='white'
        barStyle={"dark-content"}
        translucent={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',

  },
});
