import React, { ReactNode } from "react";
import { Modal, Pressable, Text, View,  } from "react-native";

type DialogProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
};

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <Modal
      transparent
      visible={open}
      animationType="fade"
      onRequestClose={() => onOpenChange?.(false)}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/40 px-4"
        onPress={() => onOpenChange?.(false)}
      >
        <Pressable className="w-full max-w-md" onPress={() => undefined}>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function DialogContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <View className={`rounded-2xl bg-white p-5 shadow-lg ${className ?? ""}`}>
      {children}
    </View>
  );
}

export function DialogHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <View className={`mb-4 ${className ?? ""}`}>{children}</View>;
}

export function DialogTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Text className={`text-lg font-semibold text-black ${className ?? ""}`}>
      {children}
    </Text>
  );
}

export function DialogDescription({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Text className={`text-sm text-gray-600 ${className ?? ""}`}>
      {children}
    </Text>
  );
}

export function DialogTrigger({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
