import {
  Text,
  View,
  TextInput,
  Button,
  Alert,
  Touchable,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import React, { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react-native";
import { encryptPassword, decryptPassword } from "../security/aesEncryption";
import { getSession, setSession } from "../security/secureStore";
import { navigate } from "expo-router/build/global-state/routing";
import { fromByteArray, toByteArray } from "react-native-quick-base64";
import Constants from "expo-constants";
import { ed } from "../security/signatureEd";

const PasswordForm = ({ handleUpdatedPassword }) => {
  const { localhost } = Constants.expoConfig?.extra ?? {};
  const [tab, setTab] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState(true);
  const [password, setPassword] = useState([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const passRef = useRef(password);

  const {
    control,
    handleSubmit,
    reset,
    trigger,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      id: Date.now().toString() + Math.random().toString(36),
      title: "",
      username: "",
      password: "",
      url: "",
      category: "Other",
      notes: "",
      tags: "",
      recoveryEmail: "",
      recoveryPhone: "",

      createdAt: new Date().toISOString(),
    },
  });

  async function handleVaultFetch() {
    try {
      const session = getSession();
      if (!session?.vaultKey) {
        navigate("/");
      }

      const response = await fetch(`${localhost}/api/passFetch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userHash: session?.userHash }),
      });

      const result = await response.json();
      if (!response.ok) {
        return setError("Faild to load your vault");
      }

      const { encryptedVault, iv, tag } = result?.message;

      const fetchedPassword = await decryptPassword(
        encryptedVault,
        fromByteArray(session?.vaultKey),
        iv,
        tag
      );

      if (!fetchedPassword) {
        return setError("Failed to decrypt the vault");
      }

      setPassword(JSON.parse(fetchedPassword));
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    handleVaultFetch();
  }, []);

  useEffect(() => {
    console.log(error);
  }, [error]);

  async function handleNewPassword(session) {
    try {
      console.log("passwordhahahaha");
      const encrypt = await encryptPassword(
        JSON.stringify(password),
        fromByteArray(session?.vaultKey)
      );
      if (!encrypt) {
        return setError("Failed to encrypt your vault");
      }

      const { encryptedVault, iv, tag } = encrypt;
      setSession({
        iv: iv,
        tag: tag,
        vaultKey: fromByteArray(session?.vaultKey),
        userHash: session?.userHash,
        salt: session?.salt,
        privateKey: session?.privateKey,
      });
      console.log("newpasssecure: ", encryptedVault);

      const { userHash } = getSession();
      const response1 = await fetch(`${localhost}/api/challengeCreate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userHash: userHash }),
      });
      const result1 = await response1.json();

      if (!response1.ok) {
        setError(result1.error);
      }

      const { challengeB64, challengeIdB64 } = result1.message;
      const challenge = toByteArray(challengeB64);
      console.log(session);
      const privateKey = session?.privateKey;
      console.log("privatekeypassword", privateKey);
      const signature = await ed.signAsync(challenge, privateKey);
      const signatureB64 = fromByteArray(signature);
      console.log("frontendchallanege:", challengeB64);

      const response = await fetch(`${localhost}/api/newPassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          encryptedVault: encryptedVault,
          iv: iv,
          tag: tag,
          userHash: session.userHash,
          signatureB64: signatureB64,
          challengeIdB64: challengeIdB64,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        return setError(result.message);
      }

      setSuccess(result.message);
      handleUpdatedPassword(password);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    console.log(password);
    if (passRef.current !== password && password.length > 0) {
      console.log(password);

      const session = getSession();
      if (session?.vaultKey) {
        console.log("no session");
      }

      handleNewPassword(session);
    }

    passRef.current = password;
  }, [password]);

  const onSubmit = (data) => {
    setTab(false);

    setPassword((prev) => {
      const updatedVault = [
        ...prev,
        {
          ...data,
          id: Date.now().toString() + Math.random().toString(36),
          createdAt: new Date().toISOString(),
        },
      ];

      return updatedVault;
    });

    reset();
  };

  const onError = (errors) => {
    console.log("Validation errors:", errors);
  };

  return tab ? (
    <KeyboardAvoidingView
      // importantForAutofill="no"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      className="w-full min-h-full  "
    >
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 175 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        className="mt-5 rounded-lg border w-full "
        style={{ flex: 1, borderColor: "#b7dcff", backgroundColor: "#111d2e" }}
      >
        <TouchableOpacity
          onPress={() => {
            setTab(false);
            reset();
          }}
          className="bg-white  self-end rounded-md mb-4"
        >
          <Text className="text-blue-500  px-3 py-1 font-semibold">Cancel</Text>
        </TouchableOpacity>

        {/* ========== CREDENTIALS SECTION ========== */}
        <View className="mb-6">
          <Text className="font-bold text-xl text-white mb-4">Credentials</Text>

          {/* Title Field */}
          <View className="mb-4">
            <Text className="text-white text-base font-semibold mb-1">
              Title *
            </Text>
            <Controller
              control={control}
              name="title"
              rules={{
                required: "Title is required",
                minLength: {
                  value: 3,
                  message: "Title must be at least 3 characters",
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <TextInput
                    className="text-white w-full rounded-md px-3 py-2"
                    style={{
                      backgroundColor: "#111d2e",
                      borderColor: "#b7dcff",
                      borderWidth: 1,
                    }}
                    placeholder="e.g., Gmail, Facebook"
                    placeholderTextColor="#6b7280"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                  {errors.title && (
                    <Text className="text-red-500 font-bold text-sm mt-1">
                      {errors.title.message}
                    </Text>
                  )}
                </View>
              )}
            />
          </View>

          {/* Username Field */}
          <View className="mb-4">
            <Text className="text-white text-base font-semibold mb-1">
              Username / Email *
            </Text>
            <Controller
              control={control}
              name="username"
              rules={{
                required: "Username is required",
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <TextInput
                    className="text-white w-full rounded-md px-3 py-2"
                    style={{
                      backgroundColor: "#111d2e",
                      borderColor: "#b7dcff",
                      borderWidth: 1,
                    }}
                    placeholder="john@example.com"
                    placeholderTextColor="#6b7280"
                    value={value}
                    importantForAutofill="no"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="none"
                  />
                  {errors.username && (
                    <Text className="text-red-500 font-bold text-sm mt-1">
                      {errors.username.message}
                    </Text>
                  )}
                </View>
              )}
            />
          </View>

          {/* Password Field */}
          <View className="mb-4">
            <Text className="text-white text-base font-semibold mb-1">
              Password *
            </Text>
            <Controller
              control={control}
              name="password"
              rules={{
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="relative">
                  <TextInput
                    secureTextEntry={passwordVisibility}
                    className="text-white w-full rounded-md px-3 py-2 pr-12"
                    style={{
                      backgroundColor: "#111d2e",
                      borderColor: "#b7dcff",
                      borderWidth: 1,
                    }}
                    placeholder="Enter password"
                    placeholderTextColor="#6b7280"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                  {errors.password && (
                    <Text className="text-red-500 font-bold text-sm mt-1">
                      {errors.password.message}
                    </Text>
                  )}
                </View>
              )}
            />
            <TouchableOpacity
              onPress={() => setPasswordVisibility((prev) => !prev)}
              className="absolute right-3 top-[30px]"
            >
              {passwordVisibility ? (
                <Eye color="#666" size={20} />
              ) : (
                <EyeOff color="#666" size={20} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ========== WEBSITE SECTION ========== */}
        <View className="mb-6">
          <Text className="font-bold text-xl text-white mb-4">Website</Text>

          {/* Website URL Field */}
          <View className="mb-4">
            <Text className="text-white text-base font-semibold mb-1">
              Website URL
            </Text>
            <Controller
              control={control}
              name="url"
              rules={{
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: "URL must start with http:// or https://",
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <TextInput
                    className="text-white w-full rounded-md px-3 py-2"
                    style={{
                      backgroundColor: "#111d2e",
                      borderColor: "#b7dcff",
                      borderWidth: 1,
                    }}
                    placeholder="https://example.com"
                    placeholderTextColor="#6b7280"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="none"
                    importantForAutofill="no"
                    keyboardType="url"
                  />
                  {errors.url && (
                    <Text className="text-red-500 font-bold text-sm mt-1">
                      {errors.url.message}
                    </Text>
                  )}
                </View>
              )}
            />
          </View>

          {/* Category Field */}
          <View className="mb-4">
            <Text className="text-white text-base font-semibold mb-1">
              Category
            </Text>
            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="text-white w-full rounded-md px-3 py-2"
                  style={{
                    backgroundColor: "#111d2e",
                    borderColor: "#b7dcff",
                    borderWidth: 1,
                  }}
                  placeholder="e.g., Email, Social Media, Banking"
                  placeholderTextColor="#6b7280"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  importantForAutofill="no"
                />
              )}
            />
          </View>
        </View>

        {/* ========== TIMESTAMP SECTION ========== */}
        <View className="mb-6">
          <Text className="font-bold text-xl text-white mb-4">Timestamp</Text>

          {/* Created At Field */}
          <View className="mb-4">
            <Text className="text-white text-base font-semibold mb-1">
              Created At
            </Text>
            <Controller
              control={control}
              name="createdAt"
              render={({ field: { value } }) => (
                <View className="bg-gray-700 w-full rounded-md px-3 py-2">
                  <Text className="text-white">
                    {new Date(value).toLocaleString()}
                  </Text>
                </View>
              )}
            />
          </View>
        </View>

        {/* ========== RECOVERY SECTION ========== */}
        <View className="mb-6">
          <Text className="font-bold text-xl text-white mb-4">Recovery</Text>

          {/* Recovery Phone Field */}
          <View className="mb-4">
            <Text className="text-white text-base font-semibold mb-1">
              Recovery Phone
            </Text>
            <Controller
              control={control}
              name="recoveryPhone"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="text-white w-full rounded-md px-3 py-2"
                  style={{
                    backgroundColor: "#111d2e",
                    borderColor: "#b7dcff",
                    borderWidth: 1,
                  }}
                  placeholder="+1234567890"
                  placeholderTextColor="#6b7280"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="phone-pad"
                />
              )}
            />
          </View>

          {/* Recovery Email Field */}
          <View className="mb-4">
            <Text className="text-white text-base font-semibold mb-1">
              Recovery Email
            </Text>
            <Controller
              control={control}
              name="recoveryEmail"
              rules={{
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <TextInput
                    className="text-white w-full rounded-md px-3 py-2"
                    style={{
                      backgroundColor: "#111d2e",
                      borderColor: "#b7dcff",
                      borderWidth: 1,
                    }}
                    placeholder="recovery@example.com"
                    placeholderTextColor="#6b7280"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                  />
                  {errors.recoveryEmail && (
                    <Text className="text-red-500 font-bold text-sm mt-1">
                      {errors.recoveryEmail.message}
                    </Text>
                  )}
                </View>
              )}
            />
          </View>
        </View>

        {/* ========== EXTRA SECTION ========== */}
        <View className="mb-6">
          <Text className="font-bold text-xl text-white mb-4">Extra</Text>

          {/* Notes Field */}
          <View className="mb-4">
            <Text className="text-white text-base font-semibold mb-1">
              Notes
            </Text>
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="text-white w-full rounded-md px-3 py-2"
                  style={{
                    backgroundColor: "#111d2e",
                    borderColor: "#b7dcff",
                    borderWidth: 1,
                  }}
                  placeholder="Additional information..."
                  placeholderTextColor="#6b7280"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              )}
            />
          </View>

          {/* Tags Field */}
          <View className="mb-4">
            <Text className="text-white text-base font-semibold mb-1">
              Tags
            </Text>
            <Controller
              control={control}
              name="tags"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="text-white w-full rounded-md px-3 py-2"
                  style={{
                    backgroundColor: "#111d2e",
                    borderColor: "#b7dcff",
                    borderWidth: 1,
                  }}
                  placeholder="work, important, 2fa"
                  placeholderTextColor="#6b7280"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            <Text className="text-gray-400 text-xs mt-1">
              Separate tags with commas
            </Text>
          </View>
        </View>

        {/* ========== SUBMIT BUTTONS ========== */}
        <View className="mb-4">
          <TouchableOpacity
            onPress={handleSubmit(onSubmit, onError)}
            className="bg-blue-500 py-3 rounded-md mb-3"
          >
            <Text className="text-white font-bold text-center text-base">
              Save Password
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => reset()}
            className="bg-gray-600 py-3 rounded-md"
          >
            <Text className="text-white font-bold text-center text-base">
              Reset Form
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  ) : (
    <View>
      <TouchableOpacity
        className="bg-blue-500 py-2 px-4 rounded-md"
        onPress={() => setTab(true)}
      >
        <Text className="text-white font-bold">Add New Password</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PasswordForm;
