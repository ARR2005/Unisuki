import { useImage } from "@/context/storeImage";
import {
    ClassificationResult,
    LocalModelService,
    generateAutoFilledData,
} from "@/feature/postProduct/camera";
import { useCallback, useEffect, useRef, useState } from "react";

export function useAutoClassification() {
  const { capturedImage } = useImage();
  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationResult, setClassificationResult] =
    useState<ClassificationResult | null>(null);
  const [showClassificationResults, setShowClassificationResults] =
    useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [suggestedData, setSuggestedData] = useState<any>(null);
  const [showAnalysisPrompt, setShowAnalysisPrompt] = useState(
    Boolean(capturedImage?.uri),
  );

  const lastClassifiedUriRef = useRef<string | null>(null);
  const classificationAbortRef = useRef(false);

  useEffect(() => {
    if (!capturedImage?.uri) return;

    if (lastClassifiedUriRef.current === capturedImage.uri) {
      return;
    }

    lastClassifiedUriRef.current = capturedImage.uri;
    setShowAnalysisPrompt(true);
  }, [capturedImage?.uri]);

  const startAnalysis = useCallback(async () => {
    setShowAnalysisPrompt(false);
    setIsClassifying(true);
    classificationAbortRef.current = false;

    const deadlineTimer = setTimeout(() => {
      classificationAbortRef.current = true;
      setClassificationResult(null);
      setShowClassificationResults(false);
      setIsClassifying(false);
    }, 10000);

    try {
      await LocalModelService.loadModel();

      if (classificationAbortRef.current) {
        clearTimeout(deadlineTimer);
        return;
      }

      const result = await LocalModelService.classifyImage(capturedImage?.uri!);

      if (classificationAbortRef.current) {
        clearTimeout(deadlineTimer);
        return;
      }

      clearTimeout(deadlineTimer);

      if (result.success && result.topResult) {
        setClassificationResult(result.topResult);
        setShowClassificationResults(true);

        if (result.topResult.confidence < 0.5) {
          setIsClassifying(false);
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 500));

        if (classificationAbortRef.current) return;

        const suggestedFormData = generateAutoFilledData(
          result.topResult.label,
          result.topResult.confidence,
        );
        setSuggestedData(suggestedFormData);
        setShowSuggestionModal(true);
      } else {
        setShowClassificationResults(false);
      }
    } catch {
      clearTimeout(deadlineTimer);
      if (!classificationAbortRef.current) {
        setShowClassificationResults(false);
      }
    } finally {
      if (!classificationAbortRef.current) {
        setIsClassifying(false);
      }
    }
  }, [capturedImage?.uri]);

  const skipAnalysis = useCallback(() => {
    setShowAnalysisPrompt(false);
    setIsClassifying(false);
  }, []);

  const acceptSuggestion = useCallback(
    (updateFormField: (field: string, value: any) => void) => {
      if (suggestedData) {
        updateFormField("title", suggestedData.title);
        updateFormField("price", suggestedData.price);
        updateFormField("description", suggestedData.description);
        updateFormField("category", suggestedData.category);
      }
      setShowSuggestionModal(false);
      setSuggestedData(null);
      setIsClassifying(false);
    },
    [suggestedData],
  );

  const rejectSuggestion = useCallback(() => {
    setShowSuggestionModal(false);
    setSuggestedData(null);
    setIsClassifying(false);
  }, []);

  return {
    isClassifying,
    classificationResult,
    showClassificationResults,
    showSuggestionModal,
    suggestedData,
    showAnalysisPrompt,
    setShowAnalysisPrompt,
    startAnalysis,
    skipAnalysis,
    acceptSuggestion,
    rejectSuggestion,
  };
}
