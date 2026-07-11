import React from 'react';
import { ImageBackground, View, useColorScheme, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

function LayoutContent() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // 1. Grab the precise height of the phone's notch/island dynamically
  const insets = useSafeAreaInsets(); 

  const backgroundImage = isDark 
    ? require('../assets/darkBackground.png') 
    : require('../assets/whiteBackground.png');

  return (
    <View style={styles.container}>
      <StatusBar style={'dark'} />
      <View 
        style={{ height: insets.top }} 
        className="w-full bg-[#070707] dark:bg-[#070707] light:bg-[#F3F4F6]" 
      />
      <ImageBackground 
        source={backgroundImage} 
        resizeMode="cover"
        style={styles.flexFill}
      >
        <View style={{ paddingBottom: insets.bottom }} className="flex-1 bg-transparent">
          <Slot /> 
        </View>
      </ImageBackground>
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LayoutContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  flexFill: {
    flex: 1,
  }
});