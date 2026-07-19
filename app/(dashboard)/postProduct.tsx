import React, { useState,  } from 'react'
import { TouchableOpacity, StyleSheet, Text,  View, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Separator } from '@/components/ui/separator';
import {  useCameraCapture } from '@/feature/postProduct/hooks/useCameraCapture';
import { useRouter } from "expo-router";

export default function PostProduct() {
    const isDark = useColorScheme() === "dark";
    const router = useRouter(); 
    const {
        isLoading,
        handleCameraCapture,
        handlePickFromGallery,
    } = useCameraCapture();

    return (
        <View className="flex-1 justify-center align-middle bg-transparent">
            
            {/* Header Section */}
            <View className="px-2 py-2 mx-6 " >
                <View className="items-center mb-8">
                    <View className="w-16 h-16 rounded-full bg-main items-center justify-center mb-4">
                        <Ionicons name="image-outline" size={28} color="#fff" />
                    </View>
                    <Text className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"} text-center`}>Add Product Photo</Text>
                    <Separator className="my-4" />
                    <Text className={`text-1xl ${isDark ? "text-white" : "text-gray-600"} text-center mt-2 leading-5`}>
                        Post product with a clear image. You can take a new photo or choose one from your gallery.
                    </Text>
                </View>
            </View>

            {/* Selectable Options Section */}
            <View style={styles.cardContainer}>
                {/* Camera Option */}
                <TouchableOpacity
                    onPress={handleCameraCapture}
                    disabled={isLoading}
                    style={[styles.touchable, styles.touchableTop]}
                >
                    <View style={styles.iconContainerTransparent}>
                        <Ionicons name="camera-outline" size={24} color="#000" />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.titleText}>Use Camera</Text>
                        <Text style={styles.subtitleText}>Capture a fresh photo right now</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#000" />
                </TouchableOpacity>

                <Separator />

                {/* Gallery Option */}
                <TouchableOpacity
                    onPress={handlePickFromGallery}
                    disabled={isLoading}
                    style={[styles.touchable, styles.touchableBotton]}
                >
                    <View style={styles.iconContainerGray}>
                        <Ionicons name="images-outline" size={24} color="#000" />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.titleText}>Choose From Gallery</Text>
                        <Text style={styles.subtitleText}>Select an image you already have</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#000" />
                </TouchableOpacity>
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
    cardContainer: {
        paddingHorizontal: 6, // px-6
        paddingVertical: 8,   // py-8
        backgroundColor: 'grey', // bg-main
        borderRadius: 16,   
        marginHorizontal: 20 ,   // rounded-2xl
        
        // --- Custom Offset Shadow ---
        // iOS Shadow Settings
        shadowColor: 'white', // Dark shadow color
        shadowOffset: { width: 0, height: 10 }, // Noticeable downward offset
        shadowOpacity: 0.15,
        shadowRadius: 12,
        
        // Android Shadow Settings
        elevation: 20, 
    },
    touchable: {
        padding:4,           // p-5
        flexDirection: 'row',  // flex-row
        alignItems: 'center',  // items-center
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
    titleText: {
        fontWeight: '600',     // font-semibold
        fontSize: 18,          // text-lg
        color: '#000',
    },
    subtitleText: {
        fontSize: 14,          // text-sm
        marginTop: 4,          // mt-1
        color: '#4b5563',      // text-gray-600 (highly recommended for readability)
    },
});