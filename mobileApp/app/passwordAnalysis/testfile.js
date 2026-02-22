import { InferenceSession } from "onnxruntime-react-native";

export async function testModel() {
  const session = await InferenceSession.create("../assets/passwordModel.onnx");
  const result = session.run(input, ["num_detection:0", "detection_classes:0"]);
  console.log(result);
}

