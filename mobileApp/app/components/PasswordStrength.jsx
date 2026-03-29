import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { analyzePasswordStrength } from "../security/passwordStrengthModel.js";

const PasswordStrength = ({ password, email, onStrengthChange }) => {
  const [passwordStrength, setPasswordStrength] = useState("");
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const runAnalysis = async () => {
      if (password.length === 0) {
        if (!isMounted) return;
        setPasswordStrength("");
        setFeedback([]);
        if (onStrengthChange) onStrengthChange(true);
        return;
      }

      const analysis = await analyzePasswordStrength(password, email);
      if (!isMounted) return;

      setPasswordStrength(analysis.strength);
      if (
        analysis.strength !== "strong" &&
        analysis.recommendations.length > 0
      ) {
        setFeedback(analysis.recommendations.slice(0, 2));
      } else {
        setFeedback([]);
      }

      if (onStrengthChange) {
        onStrengthChange(
          analysis.strength === "strong" || analysis.strength === "medium",
        );
      }
    };

    runAnalysis();

    return () => {
      isMounted = false;
    };
  }, [password, email, onStrengthChange]);

  return (
    <View>
      {password.length > 0 && (
        <View className="flex w-full flex-row gap-2 justify-center items-center mt-2">
          <View className="flex-1 h-5 flex flex-row justify-center border items-center bg-gray-700 rounded-lg">
            {passwordStrength === "weak" ? (
              <View className="w-1/3 h-full mr-auto rounded-lg bg-red-500" />
            ) : passwordStrength === "medium" ? (
              <View className="w-2/3 h-full mr-auto rounded-lg bg-yellow-500" />
            ) : passwordStrength === "strong" ? (
              <View className="w-full h-full mr-auto rounded-lg bg-green-500" />
            ) : (
              <View className="w-1/4 h-full mr-auto rounded-lg bg-gray-500" />
            )}
          </View>
          <Text
            style={{ fontFamily: "Montserrat_400Regular", fontSize: 12 }}
            className="text-white font-medium"
          >
            {passwordStrength.toUpperCase()}
          </Text>
        </View>
      )}

      {feedback.length > 0 &&
        password.length > 0 &&
        passwordStrength !== "strong" && (
          <View className="flex mt-4 w-full justify-center items-center">
            {feedback.map((item, index) => (
              <Text
                key={`${item}-${index}`}
                style={{ fontFamily: "Montserrat_400Regular", fontSize: 12 }}
                className="text-white mt-1 mr-auto font-medium"
              >
                💡 {item}
              </Text>
            ))}
          </View>
        )}
    </View>
  );
};

export default PasswordStrength;
