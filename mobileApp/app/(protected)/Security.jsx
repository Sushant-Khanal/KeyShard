import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import Animated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  CheckCircle,
  Trash2,
} from "lucide-react-native";
import Avatar from "./Avatar";
import Footer from "./Footer";
import { analyzePasswordStrength } from "../security/passwordStrengthModel";

const Security = () => {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [strengthLevel, setStrengthLevel] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Animated strength bar
  const barWidth = useSharedValue(0);
  const animatedBar = useAnimatedStyle(() => ({
    width: `${barWidth.value}%`,
  }));

  useEffect(() => {
    let isMounted = true;

    const runAnalysis = async () => {
      if (password.length === 0) {
        if (!isMounted) return;
        setRecommendations([]);
        setStrengthLevel("");
        setIsAnalyzing(false);
        return;
      }

      if (isMounted) setIsAnalyzing(true);
      const result = await analyzePasswordStrength(password);

      if (!isMounted) return;
      setStrengthLevel(result.strength);
      setRecommendations(result.recommendations);
      setIsAnalyzing(false);
    };

    runAnalysis();

    return () => {
      isMounted = false;
    };
  }, [password]);

  const getStrengthColor = () => {
    switch (strengthLevel) {
      case "strong":
        return "#3b82f6";
      case "medium":
        return "#eab308";
      case "weak":
        return "#ef4444";
      default:
        return "#666";
    }
  };

  const getStrengthProgress = () => {
    switch (strengthLevel) {
      case "strong":
        return 100;
      case "medium":
        return 50;
      case "weak":
        return 25;
      default:
        return 0;
    }
  };

  // Drive animation whenever strengthLevel changes
  useEffect(() => {
    barWidth.value = withTiming(getStrengthProgress(), { duration: 500 });
  }, [strengthLevel]);

  const getStrengthIcon = () => {
    switch (strengthLevel) {
      case "strong":
        return <ShieldCheck size={24} color={getStrengthColor()} />;
      case "medium":
        return <ShieldAlert size={24} color={getStrengthColor()} />;
      case "weak":
        return <ShieldX size={24} color={getStrengthColor()} />;
      default:
        return <ShieldCheck size={24} color="#666" />;
    }
  };

  if (!fontsLoaded) return null;

  return (
    <LinearGradient
      colors={["#0a0a0a", "#1a1a1a", "#0f0f0f"]}
      className="flex-1"
    >
      <SafeAreaView className="flex-1 w-full" edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <Animated.View
            entering={FadeIn.duration(800)}
            className="flex-1 w-[90%] mx-auto relative"
          >
          <Avatar />

          {/* HEADER */}
          <View className="mb-6 mt-2" style={{ paddingRight: 70 }}>
            <Text
              style={{ fontFamily: "Montserrat_700Bold" }}
              className="text-white text-2xl tracking-tight"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              Password Strength
            </Text>
            <Text
              style={{ fontFamily: "Montserrat_400Regular" }}
              className="text-gray-500 text-sm mt-1"
            >
              Test how secure your password is
            </Text>
          </View>

          {/* CONTENT AREA */}
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30, paddingTop: 20 }}
          >
            {/* Password Input Card */}
            <Animated.View
              entering={FadeInDown.duration(500).delay(100)}
              className="bg-[#1a1a1a] rounded-2xl p-5 border border-[#2a2a2a]"
            >
              {/* Card Header */}
              <Text
                style={{ fontFamily: "Montserrat_700Bold" }}
                className="text-gray-500 text-xs tracking-widest mb-4"
              >
                ENTER PASSWORD TO TEST
              </Text>

              {/* Password Input */}
              <View className="flex-row items-center bg-[#0f0f0f] rounded-xl border border-[#333] px-4">
                <TextInput
                  secureTextEntry={!passwordVisible}
                  style={{ fontFamily: "Montserrat_400Regular" }}
                  className="flex-1 text-white text-base py-4"
                  placeholder="Type your password..."
                  placeholderTextColor="#555"
                  value={password}
                  onChangeText={setPassword}
                />
                {password.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setPassword("")}
                    className="p-2 mr-1"
                  >
                    <Trash2 size={18} color="#666" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => setPasswordVisible((v) => !v)}
                  className="p-2"
                >
                  {passwordVisible ? (
                    <EyeOff size={20} color="#666" />
                  ) : (
                    <Eye size={20} color="#666" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Strength Bar */}
              {password.length > 0 && (
                <View className="mt-5">
                  <View className="h-2 bg-[#2a2a2a] rounded-full">
                    <Animated.View
                      className="h-full rounded-full"
                      style={[
                        animatedBar,
                        { backgroundColor: getStrengthColor() },
                      ]}
                    />
                  </View>

                  {/* Strength Info */}
                  <View className="flex-row justify-between items-center mt-3">
                    <View className="flex-row items-center gap-2">
                      {getStrengthIcon()}
                      <Text
                        style={{
                          fontFamily: "Montserrat_700Bold",
                          color: getStrengthColor(),
                        }}
                        className="text-sm"
                      >
                        {strengthLevel.toUpperCase()}
                      </Text>
                    </View>
                    <Text
                      style={{ fontFamily: "Montserrat_400Regular" }}
                      className="text-gray-500 text-xs"
                    >
                      {password.length} CHARACTERS
                    </Text>
                  </View>
                  {isAnalyzing && (
                    <Text
                      style={{ fontFamily: "Montserrat_400Regular" }}
                      className="text-gray-500 text-xs mt-2"
                    >
                      Analyzing with ML model...
                    </Text>
                  )}
                </View>
              )}
            </Animated.View>

            {/* Suggestions Card */}
            {password.length > 0 && (
              <Animated.View
                entering={FadeInDown.duration(500).delay(200)}
                className="mt-6"
              >
                <Text
                  style={{ fontFamily: "Montserrat_700Bold" }}
                  className="text-gray-500 text-xs tracking-widest mb-4"
                >
                  ML RECOMMENDATIONS
                </Text>

                <View className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a]">
                  {recommendations.length === 0 ? (
                    <View className="p-4">
                      <Text
                        style={{ fontFamily: "Montserrat_400Regular" }}
                        className="text-gray-500 text-sm"
                      >
                        Enter a password to get ML recommendations.
                      </Text>
                    </View>
                  ) : (
                    recommendations.map((text, index) => {
                      const isStrong = strengthLevel === "strong";
                      return (
                        <View
                          key={`${text}-${index}`}
                          className={`flex-row items-center p-4 ${index !== recommendations.length - 1 ? "border-b border-[#2a2a2a]" : ""}`}
                        >
                          <View
                            className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                            style={{
                              backgroundColor: isStrong
                                ? "rgba(34, 197, 94, 0.1)"
                                : "rgba(234, 179, 8, 0.1)",
                            }}
                          >
                            {isStrong ? (
                              <CheckCircle size={16} color="#22c55e" />
                            ) : (
                              <ShieldAlert size={16} color="#eab308" />
                            )}
                          </View>
                          <Text
                            style={{
                              fontFamily: "Montserrat_400Regular",
                              color: "#fff",
                            }}
                            className="text-sm flex-1"
                          >
                            {text}
                          </Text>
                        </View>
                      );
                    })
                  )}
                </View>
              </Animated.View>
            )}

            {/* Empty State */}
            {password.length === 0 && (
              <Animated.View
                entering={FadeInDown.duration(500).delay(200)}
                className="mt-10 items-center"
              >
                <View className="w-20 h-20 rounded-full bg-[#1a1a1a] items-center justify-center mb-4 border border-[#2a2a2a]">
                  <ShieldCheck size={40} color="#333" />
                </View>
                <Text
                  style={{ fontFamily: "Montserrat_700Bold" }}
                  className="text-gray-600 text-base mb-2"
                >
                  Test Your Password
                </Text>
                <Text
                  style={{ fontFamily: "Montserrat_400Regular" }}
                  className="text-gray-700 text-sm text-center"
                >
                  Enter a password above to check{"\n"}its strength and security
                </Text>
              </Animated.View>
            )}

            {/* Security Tip */}
            <Animated.View
              entering={FadeInDown.duration(500).delay(300)}
              className="mt-6 bg-[#1a1a1a] rounded-2xl p-4 border border-[#2a2a2a] flex-row items-start"
            >
              <View className="w-10 h-10 rounded-xl bg-[#22c55e]/10 items-center justify-center mr-3">
                <ShieldCheck size={20} color="#22c55e" />
              </View>
              <View className="flex-1">
                <Text
                  style={{ fontFamily: "Montserrat_700Bold" }}
                  className="text-white text-sm mb-1"
                >
                  Security Tip
                </Text>
                <Text
                  style={{ fontFamily: "Montserrat_400Regular" }}
                  className="text-gray-500 text-xs leading-5"
                >
                  A strong password should be at least 12 characters with a mix
                  of letters, numbers, and symbols.
                </Text>
              </View>
            </Animated.View>
          </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
        <Footer currentPage="security" />
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Security;
