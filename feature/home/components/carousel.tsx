import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  View,
  ViewToken,
  useColorScheme,
} from "react-native";

const { width } = Dimensions.get("window");

// Adjustable layout configuration
const GAP = 12; // Change this value to adjust the spacing between items
const CARD_WIDTH = width - 40; // Adjust card width as needed
const SNAP_INTERVAL = CARD_WIDTH + GAP; // Ensures smooth snapping with gap

type CarouselItem = {
  id: string;
  imageUri: string;
};

const carouselData: CarouselItem[] = [
  {
    id: "1",
    imageUri:
      "https://res.cloudinary.com/unisukiasset/image/upload/v1773581999/rsbxve0bs2uztvspknhj.png",
  },
  {
    id: "2",
    imageUri:
      "https://res.cloudinary.com/unisukiasset/image/upload/v1773582007/usibbfdfi8abqtzmfmrh.png",
  },
  {
    id: "3",
    imageUri:
      "https://res.cloudinary.com/unisukiasset/image/upload/v1773582045/htncmtcjan7uruohmjpf.png",
  },
];

const Carousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const itemChange = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <View className="mt-6 mb-4">
      <FlatList
        data={carouselData}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        snapToAlignment="start"
        scrollEventThrottle={15}
        nestedScrollEnabled={true}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={itemChange}
        viewabilityConfig={viewabilityConfig}
        contentContainerClassName="px-4 flex-row gap-4" 
        renderItem={({ item }) => (
          <View style={{ width: CARD_WIDTH }}>
            <View
              className={`w-full h-40 rounded-3xl overflow-hidden ${
                isDark ? "bg-slate-800" : "bg-gray-100"
              }`}
              style={{
                aspectRatio: 338 / 140,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0.4 : 0.12,
                shadowRadius: 18,
                elevation: 5,
              }}
            >
              <Image
                source={{ uri: item.imageUri }}
              className="w-full h-full"
                resizeMode="cover"
              />

              {/* Glassmorphic Overlay */}
              <View
                className={`absolute inset-0 ${
                  isDark ? "bg-black/30" : "bg-black/10"
                }`}
              />
            </View>
          </View>
        )}
      />

    </View>
  );
};

export default Carousel;