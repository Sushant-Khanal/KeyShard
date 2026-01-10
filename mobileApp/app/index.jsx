import { Text, TextInput, View, TouchableOpacity, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  FingerprintPattern,
  Key,
  MessageCircleWarning,
  ScanFace,
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

const Login = () => {
  const { localhost } = Constants.expoConfig.extra;
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [iv, setIv] = useState("");
  const [tag, setTag] = useState("");
  const [salt, setSalt] = useState("");
  const [error, setError] = useState("");
  const [encryptedVault, setEncryptedVault] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  function handleCreateMasterPassword() {
    navigate("./components/signup");
  }

  useEffect(() => {}, [status]);

  async function handleUnlock() {
    try {
      if (!email.length || !password.length) {
        setError("Email & Password are required");
        return;
      }
      setError("");
      setLoading(true);
      console.log(localhost);
      setStatus("Fetching the salt...");
      const responseInitial = await fetch(`${localhost}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

      const { vaultKey, userHash } = genMasterKey(password, salt);
      console.log("vaultKey: ", vaultKey, "\n userhash: ", userHash);

      if (!vaultKey || !userHash) {
        setError("Failed to generate vault key");
        return;
      }

      setStatus("Authenticating the user...");
      const responseFinal = await fetch(`${localhost}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, userHash }),
      });

      const resultFinal = await responseFinal.json();

      if (!responseFinal.ok) {
        setError(resultFinal.message);
        return;
      }

      setStatus("Decrypting the Vault ...");

      const { encryptedVault, iv, tag } = resultFinal?.message;
      console.log("encrypted:", encryptedVault, "\niv:", iv, "tag:", tag);

      const decryptedVault = await decryptPassword(
        encryptedVault,
        vaultKey,
        iv,
        tag
      );
      console.log("decryptedVault: ", decryptedVault);
      if (!decryptedVault) {
        setError("Failed to decrypt your vault");
        return;
      }

      setStatus("Success, Loading your vault...");
      const data = { vaultKey, iv, tag, salt, userHash };
      setSession(data);

      setTimeout(() => {
        const session = getSession();
        if (session?.vaultKey) {
          navigate("/(protected)/home");
        }
      }, 1000);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={["#1b2125ff", "#051629ff"]} className="flex-1">
      <View className="flex-1 w-full px-6 py-8 justify-between">
        {/* Header */}
        <View className="flex-row   items-center mt-10   justify-center gap-3">
          <Key color="white" size={32} strokeWidth={2} />
          <Text
            style={{ fontFamily: "Montserrat_700Bold" }}
            className="text-white text-3xl  "
          >
            KeyShards
          </Text>
        </View>

        {/* Title */}
        <View className="items-center">
          <Text
            style={{ fontFamily: "Montserrat_700Bold" }}
            className="text-white text-3xl text-center"
          >
            Unlock Your Vault
          </Text>
          <Image
            source={require("../assets/images/lock.png")}
            className="w-20 h-20 mt-5"
          />
        </View>

        {/* Inputs */}
        <View className="w-full">
          <Text
            style={{ fontFamily: "Montserrat_400Regular" }}
            className="text-white text-sm mb-1"
          >
            Email
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email linked to your vault"
            placeholderTextColor="#d1d5db"
            className="bg-gray-700 text-white rounded-lg px-3 py-2 mb-4"
          />

          <Text
            style={{ fontFamily: "Montserrat_400Regular" }}
            className="text-white text-sm mb-1"
          >
            Master Password
          </Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Enter Password"
            placeholderTextColor="#d1d5db"
            className="bg-gray-700 text-white rounded-lg px-3 py-2"
          />
        </View>

        {/* Unlock Button */}
        <TouchableOpacity
          disabled={loading}
          onPress={handleUnlock}
          className="bg-[#5783F3] py-3 rounded-lg"
        >
          <Text
            style={{ fontFamily: "Montserrat_700Bold" }}
            className="text-white text-center text-lg"
          >
            Unlock
          </Text>
        </TouchableOpacity>
        {!error && status && (
          <View className="flex justify-center items-center">
            <Text className="text-white  font-bold ">{status}</Text>
          </View>
        )}
        {error && (
          <View className="flex justify-center items-center">
            <Text className="text-red-500  font-bold ">{error}</Text>
          </View>
        )}

        {/* Biometrics */}
        <View className="items-center">
          <Text
            style={{ fontFamily: "Montserrat_400Regular" }}
            className="text-white text-sm mb-3"
          >
            Or unlock with
          </Text>

          <View className="flex-row gap-12">
            <TouchableOpacity>
              <FingerprintPattern color="white" size={40} strokeWidth={1.5} />
            </TouchableOpacity>
            <TouchableOpacity>
              <ScanFace color="white" size={40} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Create master */}
        <TouchableOpacity onPress={handleCreateMasterPassword}>
          <Text
            style={{ fontFamily: "Montserrat_400Regular" }}
            className="text-blue-400 text-center text-sm"
          >
            Create Master Password
          </Text>
        </TouchableOpacity>

        {/* Footer */}
        <View className="flex-row items-center mb-10 justify-center gap-2">
          <MessageCircleWarning size={18} color="white" strokeWidth={2} />
          <Text className="text-white text-xs text-center">
            Your master password never leaves your device
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

export default Login;
