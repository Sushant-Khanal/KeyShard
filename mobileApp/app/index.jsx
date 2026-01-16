import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FingerprintPattern,
  Key,
  MessageCircleWarning,
  ScanFace,
  Eye,
  EyeOff,
} from "lucide-react-native";
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { navigate } from "expo-router/build/global-state/routing";
import genMasterKey from "./security/masterPass";
import { decryptPassword } from "./security/aesEncryption";
import { getSession, setSession } from "./security/secureStore";
import Constants from "expo-constants";
import Splash from "./screens/Splash";
import LottieView from "lottie-react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import * as LocalAuthentication from "expo-local-authentication";

// Global flag to track if splash was shown
let splashShown = false;

const Login = () => {
  const { localhost } = Constants.expoConfig?.extra ?? {};
  const [isBiometricSupported, setBioMetricSupported] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(!splashShown);

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  function handleCreateMasterPassword() {
    navigate("./components/signup");
  }

  useEffect(() => {
    async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setBioMetricSupported(compatible);
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      splashShown = true;
    }
  }, [isLoading]);

  const validateEmail = (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  };

  async function handleUnlock() {
    setError("");
    try {
      if (!email.length || !password.length) {
        setError("Email & Password are required");
        return;
      }

      if (!validateEmail(email)) {
        setError("Enter a valid email");
        return;
      }

      setLoading(true);

      setStatus("Fetching the salt...");
      const responseInitial = await fetch(`${localhost}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const resultInitial = await responseInitial.json();
      if (!responseInitial.ok) {
        setError(resultInitial.message);
        return;
      }

      setStatus("Generating UserHash please wait...");
      const salt = resultInitial.message?.salt;
      await new Promise((r) => requestAnimationFrame(r));

      const { vaultKey, userHash, publicKeyBase64, privateKey } =
        await genMasterKey(password, salt);

      if (!vaultKey || !userHash || !publicKeyBase64 || !privateKey) {
        setError("Failed to generate vault key");
        return;
      }

      setStatus("Authenticating the user...");
      const responseFinal = await fetch(`${localhost}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, userHash }),
      });

      const resultFinal = await responseFinal.json();
      if (!responseFinal.ok) {
        setError(resultFinal.message);
        return;
      }

      setStatus("Decrypting the Vault ...");
      const { encryptedVault, iv, tag } = resultFinal.message;
      const decryptedVault = await decryptPassword(
        encryptedVault,
        vaultKey,
        iv,
        tag
      );

      if (!decryptedVault) {
        setError("Failed to decrypt your vault");
        return;
      }

      setStatus("Success, Loading your vault...");
      console.log("loginprivatekey:", privateKey);
      setSession({ vaultKey, iv, tag, salt, userHash, privateKey });

      setTimeout(() => {
        const session = getSession();
        if (session?.vaultKey) {
          navigate("/(protected)/home");
        }
      }, 1000);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      console.log("loading:", loading);
    }
  }

  return isLoading ? (
    <Splash setIsLoading={setIsLoading} />
  ) : (
    <LinearGradient colors={["#434343", "#000000"]} className="flex-1">
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <Animated.ScrollView
          entering={FadeIn.duration(1000)}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 w-full px-3 sm:px-6 py-6">
            {/* Header */}
            <View className="flex-row items-center justify-center gap-2 mt-4 mb-4 px-2">
              <Key color="white" size={24} strokeWidth={2} />
              <Text
                style={{ fontFamily: "Montserrat_700Bold", fontSize: 18 }}
                numberOfLines={1}
                adjustsFontSizeToFit
                className="text-white flex-shrink"
              >
                KeyShards
              </Text>
            </View>

            {/* Title */}
            <View className="items-center px-1">
              <Text
                style={{ fontFamily: "Montserrat_700Bold", fontSize: 20 }}
                numberOfLines={2}
                adjustsFontSizeToFit
                className="text-white text-center"
              >
                Unlock Your Vault
              </Text>
              <LottieView
                source={require("../assets/Green eye.json")}
                autoPlay
                loop={true}
                style={{ width: 120, height: 120 }}
              />
            </View>

            {/* Spacer to center inputs */}
            <View className="flex-1" />

            {/* Inputs + Button (constrained width) */}
            <View style={{ width: "100%", maxWidth: 360, alignSelf: "center" }}>
              {/* Inputs */}
              <View className="mb-6 sm:mb-8">
                <Text
                  style={{ fontFamily: "Montserrat_400Regular", fontSize: 13 }}
                  className="text-white mb-1"
                >
                  Email
                </Text>
                <TextInput
                  editable={!loading}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  placeholder="Email linked to your vault"
                  placeholderTextColor="#555"
                  className="w-full text-white rounded-xl px-4 py-3 mb-4"
                  style={{
                    fontSize: 14,
                    backgroundColor: "#1a1a1a",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.2)",
                  }}
                />

                <Text
                  style={{ fontFamily: "Montserrat_400Regular", fontSize: 13 }}
                  className="text-white mb-1"
                >
                  Master Password
                </Text>
                <View style={{ width: "100%", position: "relative" }}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    editable={!loading}
                    secureTextEntry={!passwordVisible}
                    placeholder="Enter Password"
                    placeholderTextColor="#555"
                    className="w-full text-white rounded-xl px-4 py-3"
                    style={{
                      fontSize: 14,
                      backgroundColor: "#1a1a1a",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.2)",
                      paddingRight: 40,
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => setPasswordVisible((v) => !v)}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      marginTop: -10,
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    {passwordVisible ? (
                      <EyeOff color="#888" size={20} />
                    ) : (
                      <Eye color="#888" size={20} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Unlock Button */}
              <TouchableOpacity
                activeOpacity={loading ? 1 : 0.7}
                disabled={loading}
                onPress={handleUnlock}
                className={`w-full max-w-[300] m-auto ${loading ? "bg-[#2a2a2a]" : "bg-white"} py-3 rounded-xl mb-6 sm:mb-8`}
              >
                <Text
                  style={{ fontFamily: "Montserrat_700Bold", fontSize: 16 }}
                  className={
                    loading
                      ? "text-[#666] text-center"
                      : "text-black text-center"
                  }
                >
                  {loading ? "Unlocking..." : "Unlock"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Status / Error */}
            {!error && status && (
              <View className="items-center mb-6 px-2">
                <Text
                  style={{ fontSize: 13 }}
                  className="text-white font-bold text-center"
                >
                  {status}
                </Text>
              </View>
            )}

            {error && (
              <View className="items-center mb-6 px-2">
                <Text
                  style={{ fontSize: 13 }}
                  className="text-red-500 font-bold text-center"
                >
                  {error}
                </Text>
              </View>
            )}

            {/* Biometrics */}
            <View className="items-center mb-8 sm:mb-12">
              <TouchableOpacity
                onPress={() => navigate("./components/ForgotPassword")}
                className=""
              >
                <Text
                  style={{ fontFamily: "Montserrat_400Regular", fontSize: 13 }}
                  className="text-white mb-4 underline"
                >
                  Forgot your password?
                </Text>
              </TouchableOpacity>

              {/* <View className="flex-row gap-10 sm:gap-12">
                                    <TouchableOpacity>
                                        <FingerprintPattern color="white" size={36} strokeWidth={1.5} />
                                    </TouchableOpacity>
                                    <TouchableOpacity>
                                        <ScanFace color="white" size={36} strokeWidth={1.5} />
                                    </TouchableOpacity>
                                </View> */}
            </View>

            {/* Create Master */}
            <TouchableOpacity
              className="mb-6 sm:mb-8 px-2 border-b-1 border-blue-500"
              onPress={handleCreateMasterPassword}
            >
              <Text
                style={{ fontFamily: "Montserrat_400Regular", fontSize: 13 }}
                className="text-white  text-center underline"
              >
                Create New Password Vault
              </Text>
            </TouchableOpacity>

            {/* Spacer pushes footer down */}
            <View className="flex-1" />
            <View className="flex-row items-center justify-center gap-2 mb-4 px-2">
              <MessageCircleWarning size={16} color="white" strokeWidth={2} />
              <Text style={{ fontSize: 11 }} className="text-white text-center">
                Your master password never leaves your device
              </Text>
            </View>
          </View>
        </Animated.ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Login;
