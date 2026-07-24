import React from "react";
import { Modal, Text, TouchableOpacity, View, useColorScheme } from "react-native";

interface LogoutModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({
  visible,
  onCancel,
  onConfirm,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      {/* Dynamic Overlay Backdrop */}
      <View
        className={`flex-1 justify-center items-center px-4 ${
          isDark ? "bg-gray-900/60" : "bg-black/30"
        }`}
      >
        {/* Modal Dialog Container */}
        <View
          className={`rounded-2xl p-6 w-full max-w-sm border ${
            isDark
              ? "bg-[#0e0e0e] border-slate-700"
              : "bg-[#f3f3f3] border-gray-200"
          }`}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 10,
            elevation: 5,
          }}
        >
          <Text
            className={`text-lg font-bold text-center ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Logout Confirmation
          </Text>

          <Text
            className={`text-sm text-center my-4 ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Are you sure you want to logout?
          </Text>

          {/* Action Buttons */}
          <View className="flex-row justify-center gap-3 mt-2">
            <TouchableOpacity
              className={`flex-1 py-3 rounded-xl border active:opacity-80 ${
                isDark
                  ? "bg-slate-700 border-slate-600"
                  : "bg-white border-gray-300"
              }`}
              onPress={onCancel}
            >
              <Text
                className={`text-center font-bold text-sm ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-red-600 py-3 rounded-xl active:bg-red-700"
              onPress={onConfirm}
            >
              <Text className="text-center font-bold text-white text-sm">
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LogoutModal;