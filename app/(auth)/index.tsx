// import { useAuthForm } from "@/feature/Auth/hooks/useAuthForm";
// import { Ionicons } from "@expo/vector-icons";
// import { BlurView } from "expo-blur";
// import React from "react";
// import {
//     Image,
//     ImageBackground,
//     Keyboard,
//     KeyboardAvoidingView,
//     Modal,
//     Platform,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     useColorScheme,
//     View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// interface AuthFormProps {
//   title: string;
//   subtitle: string;
//   buttonText: string;
//   isLogin: boolean;
//   email?: string;
//   password?: string;
//   confirmPassword?: string;
//   error?: string;
//   saveLogin?: boolean;
//   toggleSaveLogin?: () => void | Promise<void>;
//   toggleForm: () => void;
//   onButtonPress: () => void;
//   setEmail?: (email: string) => void;
//   setPassword?: (password: string) => void;
//   setConfirmPassword?: (password: string) => void;
//   showForgotPasswordModal?: boolean;
//   setShowForgotPasswordModal?: (show: boolean) => void;
//   forgotEmail?: string;
//   setForgotEmail?: (email: string) => void;
//   handleForgotPassword?: () => void;
// }

// const AuthForm = ({
//   title,
//   subtitle,
//   buttonText,
//   isLogin,
//   email,
//   password,
//   confirmPassword,
//   error,
//   saveLogin,
//   toggleSaveLogin,
//   toggleForm,
//   onButtonPress,
//   setEmail,
//   setPassword,
//   setConfirmPassword,
//   showForgotPasswordModal,
//   setShowForgotPasswordModal,
//   forgotEmail,
//   setForgotEmail,
//   handleForgotPassword,
// }: AuthFormProps) => {
//   return (
//     // LOGIN FORM
//     <View className="flex-1 justify-center items-center">
//       <BlurView
//         intensity={20}
//         tint="light"
//         className="w-full p-12 rounded-[20px] border border-white/0 bg-blend-overlay overflow-hidden"
//       >
//         {/* Description*/}
//         <View className=" items-center mb-2 ">
//           <Text className="text-2xl font-extrabold content-start text-black ">
//             {" "}
//             {title}{" "}
//           </Text>
//           <Text className="text-lg text-black text-sm "> {subtitle} </Text>
//         </View>

//         {/* Email input */}
//         <View className="space-y-4">
//           <View className="flex-row items-center bg-white/30 py-1 px-3 my-1 rounded-2xl border border-white/30">
//             <Ionicons name="mail-outline" size={20} color="black" />

//             <TextInput
//               placeholder="Email"
//               className="flex-1 ml-3 "
//               placeholderTextColor="#000"
//               value={email}
//               onChangeText={setEmail}
//             />
//           </View>

//           {/* Password input */}
//           <View className="flex-row items-center bg-white/30 py-1 px-3 my-1 rounded-2xl border border-white/30">
//             <Ionicons name="lock-closed-outline" size={20} color="black" />

//             <TextInput
//               placeholder="Password"
//               secureTextEntry
//               className="flex-1 ml-3 text-gray-800"
//               placeholderTextColor="#000"
//               value={password}
//               onChangeText={setPassword}
//             />
//           </View>

//           {/* Confirm password input */}
//           {!isLogin && (
//             <View className="flex-row items-center bg-white/30 p-1 px-3 my-1 rounded-2xl border border-white/30">
//               <Ionicons name="lock-closed-outline" size={20} color="black" />
//               <TextInput
//                 placeholder="Confirm Password"
//                 secureTextEntry
//                 className="flex-1 ml-3 text-gray-800"
//                 placeholderTextColor="#000"
//                 value={confirmPassword}
//                 onChangeText={setConfirmPassword}
//               />
//             </View>
//           )}
//         </View>

//         {/* Save login Button and Forgot Password */}
//         {isLogin && (
//           <View className="mt-2 flex-row items-center justify-between">
//             {toggleSaveLogin ? (
//               <TouchableOpacity
//                 onPress={toggleSaveLogin}
//                 className="flex-row items-center"
//               >
//                 <View
//                   className={`mr-2 h-5 w-5 rounded-md border items-center justify-center 
//         ${saveLogin ? "bg-green-500 border-green-500" : "bg-white border-white/60"}`}
//                 >
//                   {saveLogin ? (
//                     <Ionicons name="checkmark" size={14} color="white" />
//                   ) : null}
//                 </View>
//                 <Text className="text-black font-lg">Save login</Text>
//               </TouchableOpacity>
//             ) : null}
//             {setShowForgotPasswordModal ? (
//               <TouchableOpacity
//                 onPress={() => setShowForgotPasswordModal(true)}
//               >
//                 <Text className="text-green-500 font-semibold text-sm">
//                   Forgot Password?
//                 </Text>
//               </TouchableOpacity>
//             ) : null}
//           </View>
//         )}

//         {/* Error message */}
//         {error && (
//           <View className="m-2 mt-4">
//             <Text className="text-red-500 text-sm text-center">{error}</Text>
//           </View>
//         )}

//         {/* Submit button */}
//         <TouchableOpacity onPress={onButtonPress}>
//           <View className="bg-zinc-900 py-4 rounded-2xl mt-2 shadow-lg">
//             <Text className="text-white text-center font-bold text-lg">
//               {buttonText}
//             </Text>
//           </View>
//         </TouchableOpacity>

//         {/* Toggle form button */}
//         <TouchableOpacity onPress={toggleForm} className="mt-6">
//           <Text className="text-center text-black w-[290px]">
//             {isLogin ? "Don't have an account? " : "Already have an account? "}
//             <Text className="text-green-500 font-bold">
//               {isLogin ? "Sign Up" : "Log In"}
//             </Text>
//           </Text>
//         </TouchableOpacity>

//         {/* Forgot Password Modal */}
//         <Modal
//           visible={showForgotPasswordModal}
//           animationType="fade"
//           transparent={true}
//           onRequestClose={() => setShowForgotPasswordModal?.(false)}
//         >
//           <View className="flex-1 justify-center items-center bg-black/50">
//             <BlurView
//               intensity={90}
//               className="w-4/5 p-6 rounded-2xl bg-white/90"
//             >
//               <Text className="text-xl font-bold text-black mb-4">
//                 Reset Password
//               </Text>
//               <Text className="text-gray-700 text-sm mb-4">
//                 Enter your email address and we'll send you a password reset
//                 link.
//               </Text>

//               <View className="flex-row items-center bg-white/50 py-2 px-3 rounded-xl border border-white/30 mb-4">
//                 <Ionicons name="mail-outline" size={20} color="black" />
//                 <TextInput
//                   placeholder="Email"
//                   className="flex-1 ml-3"
//                   placeholderTextColor="#999"
//                   value={forgotEmail}
//                   onChangeText={setForgotEmail}
//                 />
//               </View>

//               <TouchableOpacity
//                 onPress={handleForgotPassword}
//                 className="bg-green-500 py-3 rounded-xl mb-2"
//               >
//                 <Text className="text-white text-center font-bold">
//                   Send Reset Link
//                 </Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 onPress={() => setShowForgotPasswordModal?.(false)}
//                 className="bg-gray-300 py-3 rounded-xl"
//               >
//                 <Text className="text-black text-center font-semibold">
//                   Cancel
//                 </Text>
//               </TouchableOpacity>
//             </BlurView>
//           </View>
//         </Modal>
//       </BlurView>
//     </View>
//   );
// };

// const SignIn = () => {
//   const [isKeyboardVisible, setIsKeyboardVisible] = React.useState(false);
//   const colorScheme = useColorScheme();
//   const backgroundImage =
//     colorScheme === "dark"
//       ? require("../../assets/images/background/Dark.png")
//       : require("../../assets/images/background/Light.png");

//   const {
//     isLogin,
//     email,
//     setEmail,
//     password,
//     setPassword,
//     confirmPassword,
//     setConfirmPassword,
//     error,
//     saveLogin,
//     toggleSaveLogin,
//     handlePress,
//     toggleForm,
//     showForgotPasswordModal,
//     setShowForgotPasswordModal,
//     forgotEmail,
//     setForgotEmail,
//     handleForgotPassword,
//   } = useAuthForm();

//   React.useEffect(() => {
//     const showSub = Keyboard.addListener("keyboardDidShow", () => {
//       setIsKeyboardVisible(true);
//     });
//     const hideSub = Keyboard.addListener("keyboardDidHide", () => {
//       setIsKeyboardVisible(false);
//     });

//     return () => {
//       showSub.remove();
//       hideSub.remove();
//     };
//   }, []);

//   return (
//     <SafeAreaView
//       edges={["top"]}
//       className="flex-1 bg-primary dark:bg-darkPrimary"
//     >
//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         keyboardVerticalOffset={Platform.OS === "ios" ? 16 : 0}
//         className="flex-1"
//       >
//         <View className="items-center justify-center flex-1 bg-primary dark:bg-darkPrimary">
//           <ImageBackground
//             source={backgroundImage}
//             className="absolute w-full h-full"
//             resizeMode="cover"
//           >
//             <View
//               className={`w-full h-full items-center flex-1 ${
//                 isKeyboardVisible ? "justify-end pb-6" : "justify-between pt-20"
//               }`}
//             >
//               {!isKeyboardVisible ? (
//                 <Image
//                   source={require("../../assets/images/icon/splashLogo.png")}
//                   className="w-[280px] h-[280px]"
//                   resizeMode="contain"
//                 />
//               ) : null}
//               <AuthForm
//                 title={isLogin ? "SIGN IN" : "Create an account"}
//                 subtitle={
//                   isLogin
//                     ? "Welcome back!"
//                     : "Come and join our campus marketplace."
//                 }
//                 buttonText={isLogin ? "Log In" : "Sign Up"}
//                 isLogin={isLogin}
//                 toggleForm={toggleForm}
//                 onButtonPress={handlePress}
//                 email={email}
//                 setEmail={setEmail}
//                 password={password}
//                 setPassword={setPassword}
//                 confirmPassword={confirmPassword}
//                 setConfirmPassword={setConfirmPassword}
//                 saveLogin={saveLogin}
//                 toggleSaveLogin={toggleSaveLogin}
//                 error={error}
//                 showForgotPasswordModal={showForgotPasswordModal}
//                 setShowForgotPasswordModal={setShowForgotPasswordModal}
//                 forgotEmail={forgotEmail}
//                 setForgotEmail={setForgotEmail}
//                 handleForgotPassword={handleForgotPassword}
//               />
//             </View>
//           </ImageBackground>
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// export default SignIn;  
