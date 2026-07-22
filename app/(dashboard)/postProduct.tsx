import { TouchableOpacity, StyleSheet, Text,  View, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Separator } from '@/components/ui/separator';
import {  useCameraCapture } from '@/feature/postProduct/hooks/useCameraCapture';
import { BlurView } from 'expo-blur'
import React from 'react';

export default function PostProduct() {
    const isDark = useColorScheme() === "dark";

    const {
        isLoading,
        useCamera,
        useGallery,
    } = useCameraCapture();

    return (
        <View className="flex-1 justify-center align-middle bg-transparent">
            
            {/* Header Section */}
            <View className="px-2 py-2 mx-6 " >
                <View className="items-center mb-8">
                    <View className="items-center justify-center">
                        <Ionicons name="image-outline" size={82} color={isDark ? "#fff" : "#000"} />
                    </View>
                    <Text className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"} text-center`}>Add Product Photo</Text>
                    <Separator className="w-full bg-black" />
                    <Text className={`text-1xl ${isDark ? "text-white" : "text-gray-600"} text-center mt-1 leading-5`}>
                        Post product with a clear image. You can take a new photo or choose one from your gallery.
                    </Text>
                </View>
            </View>

            {/* Selectable Options Section */}
            <View style={styles.cardContainer} className="" >
                {/* Camera Option */}
                <TouchableOpacity
                    onPress={useCamera}
                    disabled={isLoading}
                    style={[styles.touchable, styles.touchableTop]}
                    className={` ${isDark ? "bg-gray-300/5  border-darkPrimary/20 border-2 " : "bg-white/40 border-black border-2 "  }`}
                >
                    <View style={styles.iconContainerTransparent}>
                        <Ionicons name="camera-outline" size={32} color={isDark ? "#fff" : "#000"} />
                    </View>
                    <View style={styles.textContainer}>
                        <Text className={`font-semibold text-lg ${isDark ? "text-white" : "text-black"}`}>
                            Use Camera
                        </Text>
                        <Text className={`text-sm mt-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                            Capture a fresh photo right now
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={isDark ? "#fff" : "#000"} />
                </TouchableOpacity>

                {/* Gallery Option */}
                <TouchableOpacity
                    onPress={useGallery}
                    disabled={isLoading}
                    style={[styles.touchable, styles.touchableBotton]}
                    className={` ${isDark ? "bg-gray-300/5 border-darkPrimary/20 border-2" : "bg-white/40  border-black border-2 " }`}
                >
                    <View style={styles.iconContainerTransparent}>
                        <Ionicons name="images-outline" size={24} color={isDark ? "#fff" : "#000"} />
                    </View>
                    <View style={styles.textContainer}>
                        <Text className={`font-semibold text-lg ${isDark ? "text-white" : "text-black"}`}>
                            Choose From Gallery
                        </Text>
                        <Text className={`text-sm mt-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                            Select an image you already have
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={isDark ? "#fff" : "#000"} />
                </TouchableOpacity>
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
    cardContainer: {
  // py-8 // bg-main
        borderRadius: 16,   
        marginHorizontal: 32,   // rounded-2xl
        backgroundColor: 'transparent',
        // --- Custom Offset Shadow ---
        // iOS Shadow Settings
        shadowColor: 'green', // Dark shadow color
        shadowOffset: { width: 0, height: 10 }, // Noticeable downward offset
        shadowOpacity: 0.32,
        shadowRadius: 32,
        
        elevation: 120, 
    },
    touchable: {
        padding: 24,           // p-5
        flexDirection: 'row',  // flex-row
        alignItems: 'center', 
    },
    touchableTop: {
        borderTopLeftRadius: 16,  // rounded-t-2xl
        borderTopRightRadius: 16,
    },
    touchableBotton: {
        borderBottomLeftRadius: 16, // rounded-b-2xl
        borderBottomRightRadius: 16,
    },
    iconContainerTransparent: {
        width: 48,             // w-12
        height: 48,            // h-12
        borderRadius: 24,      // rounded-full
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainerGray: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f3f4f6', // bg-gray-100
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        marginLeft: 2,        // ml-4
        flex:1,               // flex-1
    },
});