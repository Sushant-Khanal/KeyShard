// import * as ort from "onnxruntime-react-native";
// import { extractFeatures } from "../passwordAnalysis/featureExtraction.js";

// // Load SHAP data from assets (adjusted for folder depth)
// const shapData = require("../../assets/shapRecommendations.json");

// const FEATURE_NAMES = [
//   "length",
//   "lowercase_count",
//   "uppercase_count",
//   "digit_count",
//   "special_count",
//   "entropy",
//   "transitions",
//   "max_repeat",
//   "leet_count",
//   "is_common_root",
//   "shape_complexity",
//   "pattern_intensity",
//   "habit_score",
//   "char_diversity",
// ];

// // Singleton session variable to hold the loaded model
// let session = null;

// /**
//  * Loads the ONNX model. Should be called once at app startup.
//  */
// // export const loadModel = async (modelUri) => {
// //   try {
// //     session = await ort.InferenceSession.create(modelUri);
// //     console.log("ONNX Model Loaded Successfully");
// //     console.log(session);
// //     return true;
// //   } catch (e) {
// //     console.error("Failed to load ONNX model", e);
// //     return false;
// //   }
// // };

// /**
//  * Internal helper to generate SHAP-based recommendations
//  */
// const getShapAdvice = (userFeatures) => {
//   const sortedImpacts = Object.entries(shapData).sort(
//     (a, b) => b[1].impact - a[1].impact
//   );

//   for (const [name, data] of sortedImpacts) {
//     const index = FEATURE_NAMES.indexOf(name);
//     const userVal = userFeatures[index];

//     if (userVal < data.min_target) {
//       const friendlyName = name.replace(/_/g, " ");
//       return `Try increasing your ${friendlyName}. This is currently the biggest factor keeping your password from being 'Strong'.`;
//     }
//   }
//   return "Increase length and character variety to improve strength.";
// };

// /**
//  * Main function to analyze password strength and provide feedback
//  */
// export const analyzePassword = async (password) => {
//   // 1. Extract Features
//   const features = extractFeatures(password);

//   // 2. Check if model is initialized
//   if (!session) {
//     console.warn("Model not loaded yet.");
//     return {
//       strength: "Checking...",
//       feedback: "Loading security engine...",
//     };
//   }

//   // 3. Inference
//   try {
//     const inputTensor = new ort.Tensor(
//       "float32",
//       Float32Array.from(features),
//       [1, 14]
//     );

//     const results = await session.run({ float_input: inputTensor });

//     const strengthIdx = results.label.data[0];
//     const strengthLevels = ["Weak", "Medium", "Strong"];
//     const strengthLabel = strengthLevels[strengthIdx];

//     // 4. Determine Feedback
//     let recommendation = "The password is strong.";
//     if (strengthLabel !== "Strong") {
//       recommendation = getShapAdvice(features);
//     }

//     return {
//       strength: strengthLabel,
//       feedback: recommendation,
//     };
//   } catch (error) {
//     console.error("Prediction Error:", error);
//     return { strength: "Error", feedback: "Could not analyze password." };
//   }
// };
