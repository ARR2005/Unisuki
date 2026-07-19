// import AuthService from "@/services/auth/AuthService";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useRouter } from "expo-router";
// import { useEffect, useState } from "react";

// const SAVED_LOGIN_EMAIL_KEY = "saved_login_email";
// const SAVE_LOGIN_ENABLED_KEY = "save_login_enabled";

// export const useAuthForm = () => {
//   const [isLogin, setIsLogin] = useState(true);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [error, setError] = useState("");
//   const [saveLogin, setSaveLogin] = useState(false);
//   const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
//   const [forgotEmail, setForgotEmail] = useState("");
//   const router = useRouter();

//   useEffect(() => {
//     const loadSavedLogin = async () => {
//       const [savedEmail, savedEnabled] = await Promise.all([
//         AsyncStorage.getItem(SAVED_LOGIN_EMAIL_KEY),
//         AsyncStorage.getItem(SAVE_LOGIN_ENABLED_KEY),
//       ]);

//       if (savedEmail) {
//         setEmail(savedEmail);
//       }

//       setSaveLogin(savedEnabled === "true");
//     };

//     loadSavedLogin();
//   }, []);

//   useEffect(() => {
//     if (error) {
//       const timer = setTimeout(() => {
//         setError("");
//       }, 5000);
//       return () => clearTimeout(timer);
//     }
//   }, [error]);

//   const toggleSaveLogin = async () => {
//     const nextValue = !saveLogin;
//     setSaveLogin(nextValue);

//     if (nextValue) {
//       await AsyncStorage.setItem(SAVE_LOGIN_ENABLED_KEY, "true");

//       if (email.trim()) {
//         await AsyncStorage.setItem(SAVED_LOGIN_EMAIL_KEY, email.trim());
//       }
//       return;
//     }

//     await Promise.all([
//       AsyncStorage.removeItem(SAVE_LOGIN_ENABLED_KEY),
//       AsyncStorage.removeItem(SAVED_LOGIN_EMAIL_KEY),
//     ]);
//   };

//   const handlePress = async () => {
//     setError("");

//     if (!email.trim() || !password.trim()) {
//       setError("Email and password are required.");
//       return;
//     }

//     if (isLogin) {
//       try {
//         await AuthService.signIn(email.trim(), password);

//         if (saveLogin) {
//           await Promise.all([
//             AsyncStorage.setItem(SAVE_LOGIN_ENABLED_KEY, "true"),
//             AsyncStorage.setItem(SAVED_LOGIN_EMAIL_KEY, email.trim()),
//           ]);
//         } else {
//           await Promise.all([
//             AsyncStorage.removeItem(SAVE_LOGIN_ENABLED_KEY),
//             AsyncStorage.removeItem(SAVED_LOGIN_EMAIL_KEY),
//           ]);
//         }

//         router.push("/home");
//       } catch (e: any) {
//         const errorMsg = e.message || "";
//         if (errorMsg.includes("wrong-password")) {
//           setError("Invalid password");
//         } else {
//           setError(errorMsg);
//         }
//       }
//     } else {
//       if (password !== confirmPassword) {
//         setError("Passwords don't match.");
//         return;
//       }

//       if (password.length < 6) {
//         setError("Password must be at least 6 characters.");
//         return;
//       }

//       try {
//         await AuthService.signUp(email.trim(), password);
//         setError("Verification email sent. Verify your account, then log in.");
//         setIsLogin(true);
//         setPassword("");
//         setConfirmPassword("");
//       } catch (e: any) {
//         const errorMsg = e.message || "";
//         if (errorMsg.includes("email-already-in-use")) {
//           setError("An account with this email already exists.");
//         } else {
//           setError(errorMsg);
//         }
//       }
//     }
//   };

//   const toggleForm = () => {
//     setIsLogin(!isLogin);
//     setError("");
//   };

//   const handleForgotPassword = async () => {
//     if (!forgotEmail.trim()) {
//       setError("Please enter your email address.");
//       return;
//     }

//     try {
//       await AuthService.sendPasswordResetEmail(forgotEmail.trim());
//       setError("Password reset email sent. Check your inbox.");
//       setForgotEmail("");
//       setShowForgotPasswordModal(false);
//     } catch (e: any) {
//       setError(e.message || "Failed to send reset email.");
//     }
//   };

//   return {
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
//   };
// };
