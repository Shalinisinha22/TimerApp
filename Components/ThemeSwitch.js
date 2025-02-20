import { useContext } from 'react';
import { ThemeContext } from '../Context/ThemeContext';
import { View, Text, Button, StyleSheet } from 'react-native';
import { ToggleButton } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
const ThemeSwitcher = () => {
  const { theme, setTheme } = useContext(ThemeContext);
  
  const darkIcon= ()=>{
    return(
        <Ionicons name="partly-sunny-sharp" size={24} color={theme=='light'?"#004b23":"#111"} />
    )
  }
  const lightIcon= ()=>{
    return(
<Ionicons name="partly-sunny-outline" size={24} color={theme=='light'?"#004b23":"#fff"} />    )
  }

  return (
   
        <ToggleButton.Row style={{backgroundColor:theme==='light'?"#fff":'green'}} onValueChange={value => setTheme(value)} value={theme}>
      <ToggleButton icon={lightIcon} value="light" />
      <ToggleButton icon={darkIcon} value="dark" />
    </ToggleButton.Row>
      
  );
};



export default ThemeSwitcher;
