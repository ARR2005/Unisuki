import React, { createContext, useContext, useState } from "react";

export interface CameraImage {
  uri: string;
  width: number;
  height: number;
  uploadedUrl?: string;
}

interface ImageContextType {
  capturedImage: CameraImage | null;
  setCapturedImage: (image: CameraImage | null) => void;
  isUploadingImage: boolean;
  setIsUploadingImage: (loading: boolean) => void;
  uploadError: string | null;
  setUploadError: (error: string | null) => void;
  clearImage: () => void;
}

const StoreImage = createContext<ImageContextType | undefined>(undefined);

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [capturedImage, setCapturedImage] = useState<CameraImage | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const clearImage = () => {
    setCapturedImage(null);
    setUploadError(null);
  };

  return (
    <StoreImage.Provider
      value={{
        capturedImage,
        setCapturedImage,
        isUploadingImage,
        setIsUploadingImage,
        uploadError,
        setUploadError,
        clearImage,
      }}
    >
      {children}
    </StoreImage.Provider>
  );
};

export const useImage = () => {
  const context = useContext(StoreImage);

  if (!context) {
    throw new Error("useImage must be used within an ImageProvider");
  }

  return context;
};
