import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Key, Eye, EyeOff } from "lucide-react-native";
import React, { useState } from "react";
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { useRouter } from "expo-router";
import genMasterKey from "../security/masterPass";
import { encryptPassword, decryptPassword } from "../security/aesEncryption";
import * as Crypto from "expo-crypto";
import { fromByteArray, toByteArray } from "react-native-quick-base64";
import PasswordStrength from "../components/PasswordStrength";
import Constants from "expo-constants";
import Animated, { FadeIn } from "react-native-reanimated";
import { getSession, setSession, clearSession } from "../security/secureStore";
import { ed } from "../security/signatureEd";

const ChangeMasterPassword = () => {
  const { localhost } = Constants.expoConfig?.extra ?? {};
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentVisible, setCurrentVisible] = useState(false);
  const [newVisible, setNewVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  const handleChangePassword = async () => {
    setLoading(true);
    setError("");
    await new Promise((r) => requestAnimationFrame(r));

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const session = getSession();
      if (!session?.vaultKey) {
        setError("No active session found. Please re-login.");
        setLoading(false);
        return;
      }

      // Step 1: Verify current password
      const { userHash: currentDerivedHash } = await genMasterKey(
        currentPassword,
        session.salt
      );

      if (currentDerivedHash !== session.userHash) {
        setError("Incorrect current master password.");
        setLoading(false);
        return;
      }

      // Step 2: Fetch current vault from server to ensure latest data
      const fetchResponse = await fetch(`${localhost}/api/passFetch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userHash: session.userHash }),
      });

      const fetchResult = await fetchResponse.json();
      if (!fetchResponse.ok) {
        setError(fetchResult.message || "Failed to fetch vault.");
        setLoading(false);
        return;
      }

      const { encryptedVault: oldEncryptedVault, iv: oldIv, tag: oldTag } = fetchResult.message;

      // Step 3: Decrypt vault with old keys
      const oldVaultKeyHex = fromByteArray(session.vaultKey);
      const decryptedVault = await decryptPassword(
        oldEncryptedVault,
        oldVaultKeyHex,
        oldIv,
        oldTag
      );

      if (!decryptedVault) {
        setError("Failed to decrypt current vault.");
        setLoading(false);
        return;
      }

      // Step 4: Generate new keys
      const newSalt = fromByteArray(Crypto.getRandomValues(new Uint8Array(32)));
      const {
        vaultKey: newVaultKey,
        userHash: newUserHash,
        publicKeyBase64: newPublicKeyBase64,
        privateKey: newPrivateKey,
      } = await genMasterKey(newPassword, newSalt);

      if (!newVaultKey || !newUserHash || !newPublicKeyBase64) {
        setError("Error generating new MasterKey.");
        setLoading(false);
        return;
      }

      // Step 5: Re-encrypt vault with new keys
      const {
        encryptedVault: newEncryptedVault,
        iv: newIv,
        tag: newTag,
      } = await encryptPassword(decryptedVault, newVaultKey);

      if (!newEncryptedVault) {
        setError("Error encrypting vault with new keys.");
        setLoading(false);
        return;
      }

      // Step 6: Authenticate with old keys to authorize change
      const challengeResponse = await fetch(`${localhost}/api/challengeCreate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userHash: session.userHash }),
      });

      const challengeResult = await challengeResponse.json();
      if (!challengeResponse.ok) {
        setError("Failed to get authorization challenge.");
        setLoading(false);
        return;
      }

      const { challengeB64, challengeIdB64 } = challengeResult.message;
      const challenge = toByteArray(challengeB64);
      const signature = await ed.signAsync(challenge, session.privateKey);
      const signatureB64 = fromByteArray(signature);

      // Step 7: Push the completely re-keyed vault to the backend
      const updateResponse = await fetch(`${localhost}/api/changeMasterPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userHash: session.userHash,
          newUserHash: newUserHash,
          newSalt: newSalt,
          newPublicKeyBase64: newPublicKeyBase64,
          encryptedVault: newEncryptedVault,
          iv: newIv,
          tag: newTag,
          challengeIdB64: challengeIdB64,
          signatureB64: signatureB64,
        }),
      });

      const updateResult = await updateResponse.json();
      if (!updateResponse.ok) {
        setError(updateResult.message || "Failed to update master password.");
        setLoading(false);
        return;
      }

      // Step 8: Success
      setSuccess(true);
      
      // Update local session to use new keys so app keeps working
      setSession({
        vaultKey: newVaultKey,
        iv: newIv,
        tag: newTag,
        salt: newSalt,
        userHash: newUserHash,
        privateKey: newPrivateKey,
      });

      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
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
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
          <Animated.ScrollView
            entering={FadeIn.duration(800)}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="w-11/12 mx-auto relative flex-1 mt-4">
              <TouchableOpacity
                onPress={() => router.back()}
                className="absolute top-2 left-0 z-50 p-2"
              >
                <ArrowLeft color="white" size={24} />
              </TouchableOpacity>

              {/* Header */}
              <View className="mb-8 mt-14 px-2">
                <Text
                  style={{ fontFamily: "Montserrat_700Bold" }}
                  className="text-white text-3xl tracking-tight"
                >
                  Change Master Password
                </Text>
                <Text
                  style={{ fontFamily: "Montserrat_400Regular" }}
                  className="text-gray-500 text-sm mt-2 leading-5"
                >
                  Your master password encrypts your entire vault. Changing it will re-encrypt all your secure data.
                </Text>
              </View>

              {/* Form Card */}
              <View className="bg-[#1a1a1a] rounded-2xl p-5 border border-[#2a2a2a]">
                
                {/* Current Password Field */}
                <View className="mb-6">
                  <Text
                    style={{ fontFamily: "Montserrat_400Regular" }}
                    className="text-gray-400 text-xs mb-2 ml-1 tracking-widest"
                  >
                    CURRENT MASTER PASSWORD
                  </Text>
                  <View className="flex-row items-center bg-[#0f0f0f] rounded-xl border border-[#333] px-4">
                    <TextInput
                      secureTextEntry={!currentVisible}
                      style={{ fontFamily: "Montserrat_400Regular" }}
                      className="flex-1 text-white text-base py-4"
                      placeholder="Enter Current Password"
                      placeholderTextColor="#555"
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      editable={!loading && !success}
                    />
                    <TouchableOpacity
                      onPress={() => setCurrentVisible((v) => !v)}
                      className="p-2"
                    >
                      {currentVisible ? (
                        <EyeOff size={20} color="#666" />
                      ) : (
                        <Eye size={20} color="#666" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* New Password Field */}
                <View className="mb-6">
                  <Text
                    style={{ fontFamily: "Montserrat_400Regular" }}
                    className="text-gray-400 text-xs mb-2 ml-1 tracking-widest"
                  >
                    NEW MASTER PASSWORD
                  </Text>
                  <View className="flex-row items-center bg-[#0f0f0f] rounded-xl border border-[#333] px-4 mb-3">
                    <TextInput
                      secureTextEntry={!newVisible}
                      style={{ fontFamily: "Montserrat_400Regular" }}
                      className="flex-1 text-white text-base py-4"
                      placeholder="Enter New Password"
                      placeholderTextColor="#555"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      editable={!loading && !success}
                    />
                    <TouchableOpacity
                      onPress={() => setNewVisible((v) => !v)}
                      className="p-2"
                    >
                      {newVisible ? (
                        <EyeOff size={20} color="#666" />
                      ) : (
                        <Eye size={20} color="#666" />
                      )}
                    </TouchableOpacity>
                  </View>
                  <PasswordStrength password={newPassword} email={"placeholder@test.com"} />
                </View>

                {/* Confirm New Password Field */}
                <View className="mb-6">
                  <Text
                    style={{ fontFamily: "Montserrat_400Regular" }}
                    className="text-gray-400 text-xs mb-2 ml-1 tracking-widest"
                  >
                    CONFIRM NEW PASSWORD
                  </Text>
                  <View className="flex-row items-center bg-[#0f0f0f] rounded-xl border border-[#333] px-4">
                    <TextInput
                      secureTextEntry={!confirmVisible}
                      style={{ fontFamily: "Montserrat_400Regular" }}
                      className="flex-1 text-white text-base py-4"
                      placeholder="Re-enter New Password"
                      placeholderTextColor="#555"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      editable={!loading && !success}
                    />
                    <TouchableOpacity
                      onPress={() => setConfirmVisible((v) => !v)}
                      className="p-2"
                    >
                      {confirmVisible ? (
                        <EyeOff size={20} color="#666" />
                      ) : (
                        <Eye size={20} color="#666" />
                      )}
                    </TouchableOpacity>
                  </View>
                  {newPassword !== confirmPassword && confirmPassword.length > 0 && (
                    <Text
                      style={{ fontFamily: "Montserrat_400Regular" }}
                      className="text-red-500 text-xs mt-2 ml-1"
                    >
                      Passwords do not match.
                    </Text>
                  )}
                </View>

                {/* Status Messages */}
                {error ? (
                  <Animated.Text
                    entering={FadeIn}
                    style={{ fontFamily: "Montserrat_700Bold" }}
                    className="text-red-500 text-center text-sm mb-4"
                  >
                    {error}
                  </Animated.Text>
                ) : null}

                {success ? (
                  <Animated.Text
                    entering={FadeIn}
                    style={{ fontFamily: "Montserrat_700Bold" }}
                    className="text-green-500 text-center text-sm mb-4"
                  >
                    Master password successfully changed! Redirecting...
                  </Animated.Text>
                ) : null}

                {/* Action Button */}
                <TouchableOpacity
                  disabled={loading || success || !currentPassword || !newPassword || newPassword !== confirmPassword}
                  onPress={handleChangePassword}
                  className={`w-full py-4 rounded-xl flex items-center justify-center ${
                    loading || success || !currentPassword || !newPassword || newPassword !== confirmPassword
                      ? "bg-[#2a2a2a]"
                      : "bg-[#2e85db]"
                  }`}
                >
                  <Text
                    style={{ fontFamily: "Montserrat_700Bold" }}
                    className={`text-base ${
                      loading || success || !currentPassword || !newPassword || newPassword !== confirmPassword
                        ? "text-gray-500"
                        : "text-white"
                    }`}
                  >
                    {loading ? "Re-encrypting Vault..." : "Change Password"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ChangeMasterPassword;
