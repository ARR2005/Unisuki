import * as tf from "@tensorflow/tfjs";
import { bundleResourceIO } from "@tensorflow/tfjs-react-native/dist/bundle_resource_io";
import { decodeJpeg } from "@tensorflow/tfjs-react-native/dist/decode_image";
import * as FileSystem from "expo-file-system/legacy";

export interface ClassificationResult {
  label: string;
  confidence: number;
}

export interface ModelInferenceResponse {
  classifications: ClassificationResult[];
  topResult: ClassificationResult | null;
  success: boolean;
  error?: string;
}

class LocalModelService {
  private readonly MODEL_NAME = "tm-my-image-model";
  private readonly CONFIDENCE_THRESHOLD = 0.9;
  private readonly CLASSIFICATION_TIMEOUT = 30000;
  private readonly IMAGE_SIZE = 224;

  private model: tf.LayersModel | null = null;

  private readonly APP_LABELS = [
    "Black Pants",
    "Green Vest", 
    "PE Pants", 
    "PE Shirt" ,
    "White Polo"
  ];

  private readonly MODEL_LABELS: string[] =
    ((require("./metadata.json") as { labels?: string[] })?.labels ?? []).map(
      (label) => this.mapModelLabelToAppLabel(label)
    );

  async loadModel(): Promise<boolean> {
    try {
      if (this.model) {
        return true;
      }

      await tf.ready();

      const modelJson = require("./model.json");
      const modelWeights = require("./weights.bin");

      this.model = await tf.loadLayersModel(
        bundleResourceIO(modelJson, modelWeights)
      );

      return true;
    } catch (error) {
      console.error("[LocalModelService] Failed to load model:", error);
      this.model = null;
      return false;
    }
  }

  async classifyImage(imageUri: string): Promise<ModelInferenceResponse> {
    try {
      if (!imageUri) {
        return {
          classifications: [],
          topResult: null,
          success: false,
          error: "Image URI is required",
        };
      }

      const modelReady = await this.loadModel();
      if (!modelReady || !this.model) {
        return {
          classifications: [],
          topResult: null,
          success: false,
          error: "Failed to load local model",
        };
      }

      const scores = await this.runInferenceWithTimeout(imageUri);
      const classifications = this.toClassifications(scores);

      classifications.sort((a, b) => b.confidence - a.confidence);
      const topResult = classifications[0] || null;

      return {
        classifications,
        topResult,
        success: true,
      };
    } catch (error) {
      if (error instanceof Error && error.message === "Classification timed out") {
        return {
          classifications: [],
          topResult: null,
          success: true,
        };
      }
      console.error("[LocalModelService] Classification error:", error);
      return {
        classifications: [],
        topResult: null,
        success: false,
        error: error instanceof Error ? error.message : "Failed to classify image",
      };
    }
  }

  private async runInferenceWithTimeout(imageUri: string): Promise<number[]> {
    return Promise.race([
      this.runInference(imageUri),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Classification timed out")), this.CLASSIFICATION_TIMEOUT)
      ),
    ]);
  }

  private async runInference(imageUri: string): Promise<number[]> {
    if (!this.model) {
      throw new Error("Model is not initialized");
    }

    const imageTensor = await this.preprocessImage(imageUri);
    let prediction: tf.Tensor | tf.Tensor[] | null = null;

    try {
      prediction = this.model.predict(imageTensor) as tf.Tensor | tf.Tensor[];
      const outputTensor = Array.isArray(prediction) ? prediction[0] : prediction;
      const rawScores = Array.from(outputTensor.dataSync());
      return this.normalizeScores(rawScores);
    } finally {
      imageTensor.dispose();
      if (Array.isArray(prediction)) {
        prediction.forEach((tensor) => tensor.dispose());
      } else if (prediction) {
        prediction.dispose();
      }
    }
  }

  private async preprocessImage(imageUri: string): Promise<tf.Tensor4D> {
    const imageBytes = await this.readImageBytes(imageUri);

    return tf.tidy(() => {
      const decoded = decodeJpeg(imageBytes, 3);
      const resized = tf.image.resizeBilinear(decoded, [
        this.IMAGE_SIZE,
        this.IMAGE_SIZE,
      ]);
      const normalized = resized.toFloat().div(tf.scalar(255));
      return normalized.expandDims(0) as tf.Tensor4D;
    });
  }

  private async readImageBytes(imageUri: string): Promise<Uint8Array> {
    try {
      const response = await fetch(imageUri);
      const arrayBuffer = await response.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    } catch {
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return this.base64ToUint8Array(base64);
    }
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    if (typeof atob !== "function") {
      throw new Error("Base64 decoder is unavailable in this environment");
    }

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  private toClassifications(scores: number[]): ClassificationResult[] {
    const labels = this.MODEL_LABELS.length ? this.MODEL_LABELS : this.APP_LABELS;

    return scores.map((score, index) => ({
      label: labels[index] || this.APP_LABELS[index] || `Class ${index}`,
      confidence: score,
    }));
  }

  private normalizeScores(scores: number[]): number[] {
    if (!scores.length) {
      return [];
    }

    const areProbabilities = scores.every((value) => value >= 0 && value <= 1);
    if (areProbabilities) {
      return scores;
    }

    const max = Math.max(...scores);
    const exps = scores.map((value) => Math.exp(value - max));
    const sum = exps.reduce((acc, value) => acc + value, 0) || 1;
    return exps.map((value) => value / sum);
  }

  private mapModelLabelToAppLabel(label: string): string {
    const normalized = label.trim();

    const knownLabel = this.APP_LABELS.find(
      (appLabel) => appLabel.toLowerCase() === normalized.toLowerCase()
    );
    return knownLabel ?? normalized;
  }

  getLabels(): string[] {
    const labels = this.MODEL_LABELS.length ? this.MODEL_LABELS : this.APP_LABELS;
    return [...new Set(labels)];
  }
}

export default new LocalModelService();
