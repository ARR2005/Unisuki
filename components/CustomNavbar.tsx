import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from "@react-navigation/native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);


const PrimaryColor = "#4CAF50"; // Example primary color    
const SecondaryColor = "#FFFFFF"; // Example secondary color


const CustomNavBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { colors } = useTheme();
  return (
    <View style={ styles.container }>
      {state.routes.map((route, index) => {
        console.log("route", route);

        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
            <AnimatedTouchableOpacity
             layout={LinearTransition.springify().mass(0.5)}
            key={route.key}
            onPress={onPress}
            style={ [styles.tabItem , {backgroundColor: isFocused ? PrimaryColor : "transparent"} ] }
          >
            {getIconByRouteName(route.name, "#fff")}
            {isFocused && <Animated.Text entering={FadeIn.duration(200) } style={ styles.text }>
              {label as string}
            </Text>}
          </AnimatedTouchableOpacity>
        );
      })}
    </View>
  );
}

    function getIconByRouteName(routeName: string, colors: string) {
      switch (routeName) {
        case 'home': 
            return <Ionicons name="home-outline" size={28} color={colors} />
        case 'message':
            return <Ionicons name="chatbubble-outline" size={28} color={colors} />
        case 'camera':
            return <Ionicons name="add-circle-outline" size={28} color={colors} />
        case 'reserve': 
            return <Ionicons name="calendar-outline" size={28} color={colors} />
        case 'profile': 
            return <Ionicons name="person-outline" size={28} color={colors} />
        default:
            return null;
      }


    }

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 30,
        
        alignSelf: 'center',
        flexDirection: 'row',
        
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        
        width: '95%' ,
        
        alignItems: 'center',
        justifyContent: 'space-between',
        
        borderRadius: 50,
        paddingVertical: 8,
        paddingHorizontal: 8,
    },
    tabItem: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',

        borderRadius: 50,
        paddingVertical: 8,
        paddingHorizontal: 8,
    },
    text: {
        color: '#fff',
        fontSize: 16,
        marginLeft: 6,
    },
})

export default CustomNavBar;