import { TouchableOpacity, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Separator } from '@/components/ui/separator';
import { useCameraCapture } from '@/feature/postProduct/hooks/useCameraCapture';
import React from 'react';

export default function PostProduct() {
    const isDark = useColorScheme() === "dark";

    const {
        isLoading,
        useCamera,
        useGallery,
    } = useCameraCapture();

    const iconColor = isDark ? "#10b981" : "#059669";

    return (
        <View className={`flex-1 justify-evenly `}>
            
            {/* Header Section */}
            <View className="px-2 py-2 mx-6">
                <View className="items-center mb-8">
                    <View className="items-center justify-center mb-2">
                        <Ionicons name="image-outline" size={82} color={iconColor} />
                    </View>
                    <Text className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"} text-center`}>
                        Add Product Photo
                    </Text>
                    <Separator className={`w-full my-3 ${isDark ? "bg-[#01170f]" : "bg-gray-300"}`} />
                    <Text className={`text-base ${isDark ? "text-gray-400" : "text-gray-600"} text-center mt-1 leading-5`}>
                        Post product with a clear image. You can take a new photo or choose one from your gallery.
                    </Text>
                </View>
            </View>

            {/* Selectable Options Section */}
            <View style={styles.cardContainer}>
                {/* Camera Option */}
                <TouchableOpacity
                    onPress={useCamera}
                    disabled={isLoading}
                    style={[styles.touchable, styles.touchableTop]}
                    className={`${
                        isDark
                            ? "bg-[#0e0e0e] border-[#01170f] border-2"
                            : "bg-white border-gray-200 border-2"
                    }`}
                >
                    <View style={styles.iconContainerTransparent}>
                        <Ionicons name="camera-outline" size={32} color={iconColor} />
                    </View>
                    <View style={styles.textContainer}>
                        <Text className={`font-semibold text-lg ${isDark ? "text-white" : "text-black"}`}>
                            Use Camera
                        </Text>
                        <Text className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            Capture a fresh photo right now
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={isDark ? "#64748b" : "#9ca3af"} />
                </TouchableOpacity>

                {/* Gallery Option */}
                <TouchableOpacity
                    onPress={useGallery}
                    disabled={isLoading}
                    style={[styles.touchable, styles.touchableBotton]}
                    className={`${
                        isDark
                            ? "bg-[#0e0e0e] border-[#01170f] border-t-0 border-2"
                            : "bg-white border-gray-200 border-t-0 border-2"
                    }`}
                >
                    <View style={styles.iconContainerTransparent}>
                        <Ionicons name="images-outline" size={28} color={iconColor} />
                    </View>
                    <View style={styles.textContainer}>
                        <Text className={`font-semibold text-lg ${isDark ? "text-white" : "text-black"}`}>
                            Choose From Gallery
                        </Text>
                        <Text className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            Select an image you already have
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={isDark ? "#64748b" : "#9ca3af"} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        borderRadius: 16,
        marginHorizontal: 24,
        backgroundColor: 'transparent',
    },
    touchable: {
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    touchableTop: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    touchableBotton: {
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    iconContainerTransparent: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        marginLeft: 12,
        flex: 1,
    },
});