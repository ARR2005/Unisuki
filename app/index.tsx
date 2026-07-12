import { router } from "expo-router";
import { 
  TouchableOpacity, 
  View 
  ,Text
} from "react-native";


function RedirectToHome() {
  // auth logic here

  return router.replace("/(dashboard)/home");  ;
}

export default function AuthLayout() {
  return(
    <View>
      <TouchableOpacity
        className="bg-blue-500 p-4 w-32 rounded"
        onPress={() => {
          RedirectToHome();
        }}
      >
        <Text>Login</Text>
      
      </TouchableOpacity>
    </View>


  );
}

