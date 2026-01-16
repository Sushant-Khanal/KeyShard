import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Dimensions,
  StatusBar,
  Modal,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import React, { useEffect, useRef, useState } from "react";
import {
  Eye,
  EyeOff,
  Plus,
  X,
  Lock,
  User,
  Globe,
  Tag,
  MessageSquare,
  Phone,
  Mail,
  Clock,
  FolderOpen,
} from "lucide-react-native";
import { generatePassword } from "../security/passwordGenerator.js";
import { encryptPassword, decryptPassword } from "../security/aesEncryption";
import { getSession, setSession } from "../security/secureStore";
import { navigate } from "expo-router/build/global-state/routing";
import { fromByteArray, toByteArray } from "react-native-quick-base64";
import Constants from "expo-constants";
import { ed } from "../security/signatureEd";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

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
    <Modal
      visible={tab}
      animationType="slide"
      statusBarTranslucent={true}
      presentationStyle="fullScreen"
    >
      <LinearGradient
        colors={["#0a0a0a", "#1a1a1a", "#0f0f0f"]}
        style={styles.fullScreenContainer}
      >
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              padding: 20,
              paddingBottom: 100,
              paddingTop:
                Platform.OS === "android" ? StatusBar.currentHeight + 10 : 50,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          >
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>New Password</Text>
                <Text style={styles.headerSubtitle}>
                  Secure your credentials
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setTab(false);
                  reset();
                }}
                style={styles.closeButton}
              >
                <X color="#fff" size={20} />
              </TouchableOpacity>
            </View>

            {/* ========== CREDENTIALS SECTION ========== */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Lock color="#ffffff" size={20} />
                <Text style={styles.sectionTitle}>Credentials</Text>
              </View>

              <View style={styles.divider} />

              {/* Title Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Title <Text style={styles.required}>*</Text>
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
                        style={styles.input}
                        placeholder="e.g., Gmail, Facebook"
                        placeholderTextColor="#666"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                      {errors.title && (
                        <Text style={styles.errorText}>
                          {errors.title.message}
                        </Text>
                      )}
                    </View>
                  )}
                />
              </View>

              {/* Username Field */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <User color="#888" size={14} />
                  <Text style={styles.label}>
                    Username / Email <Text style={styles.required}>*</Text>
                  </Text>
                </View>
                <Controller
                  control={control}
                  name="username"
                  rules={{
                    required: "Username is required",
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View>
                      <TextInput
                        style={styles.input}
                        placeholder="john@example.com"
                        placeholderTextColor="#666"
                        value={value}
                        importantForAutofill="no"
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="none"
                      />
                      {errors.username && (
                        <Text style={styles.errorText}>
                          {errors.username.message}
                        </Text>
                      )}
                    </View>
                  )}
                />
              </View>

              {/* Password Field */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Lock color="#888" size={14} />
                  <Text style={styles.label}>
                    Password <Text style={styles.required}>*</Text>
                  </Text>
                </View>
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
                    <View
                      style={[
                        styles.passwordContainer,
                        {
                          flexDirection: "row",
                          alignItems: "center",
                          position: "relative",
                        },
                      ]}
                    >
                      <TextInput
                        secureTextEntry={passwordVisibility}
                        style={[styles.input, { flex: 1, paddingRight: 90 }]}
                        placeholder="Enter password"
                        placeholderTextColor="#666"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                      <TouchableOpacity
                        onPress={() => onChange(generatePassword())}
                        style={[
                          styles.eyeButton,
                          {
                            position: "absolute",
                            right: 60,
                            top: "50%",
                            marginTop: -16,
                            backgroundColor: "white",
                            borderRadius: 6,
                            paddingVertical: 6,
                            paddingHorizontal: 8,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            color: "black",
                            fontWeight: "bold",
                          }}
                        >
                          Generate
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setPasswordVisibility((prev) => !prev)}
                        style={[
                          styles.eyeButton,
                          {
                            position: "absolute",
                            right: 20,
                            top: "50%",
                            marginTop: -10,
                          },
                        ]}
                      >
                        {passwordVisibility ? (
                          <Eye color="#888" size={20} />
                        ) : (
                          <EyeOff color="#888" size={20} />
                        )}
                      </TouchableOpacity>
                      {errors.password && (
                        <Text style={styles.errorText}>
                          {errors.password.message}
                        </Text>
                      )}
                    </View>
                  )}
                />
              </View>
            </View>

            {/* ========== WEBSITE SECTION ========== */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Globe color="#ffffff" size={20} />
                <Text style={styles.sectionTitle}>Website</Text>
              </View>

              <View style={styles.divider} />

              {/* Website URL Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Website URL</Text>
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
                        style={styles.input}
                        placeholder="https://example.com"
                        placeholderTextColor="#666"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="none"
                        importantForAutofill="no"
                        keyboardType="url"
                      />
                      {errors.url && (
                        <Text style={styles.errorText}>
                          {errors.url.message}
                        </Text>
                      )}
                    </View>
                  )}
                />
              </View>

              {/* Category Field */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <FolderOpen color="#888" size={14} />
                  <Text style={styles.label}>Category</Text>
                </View>
                <Controller
                  control={control}
                  name="category"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., Email, Social Media, Banking"
                      placeholderTextColor="#666"
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
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Clock color="#ffffff" size={20} />
                <Text style={styles.sectionTitle}>Timestamp</Text>
              </View>

              <View style={styles.divider} />

              {/* Created At Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Created At</Text>
                <Controller
                  control={control}
                  name="createdAt"
                  render={({ field: { value } }) => (
                    <View style={styles.timestampBox}>
                      <Text style={styles.timestampText}>
                        {new Date(value).toLocaleString()}
                      </Text>
                    </View>
                  )}
                />
              </View>
            </View>

            {/* ========== RECOVERY SECTION ========== */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Mail color="#ffffff" size={20} />
                <Text style={styles.sectionTitle}>Recovery</Text>
              </View>

              <View style={styles.divider} />

              {/* Recovery Phone Field */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Phone color="#888" size={14} />
                  <Text style={styles.label}>Recovery Phone</Text>
                </View>
                <Controller
                  control={control}
                  name="recoveryPhone"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="+1234567890"
                      placeholderTextColor="#666"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="phone-pad"
                    />
                  )}
                />
              </View>

              {/* Recovery Email Field */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Mail color="#888" size={14} />
                  <Text style={styles.label}>Recovery Email</Text>
                </View>
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
                        style={styles.input}
                        placeholder="recovery@example.com"
                        placeholderTextColor="#666"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="email-address"
                      />
                      {errors.recoveryEmail && (
                        <Text style={styles.errorText}>
                          {errors.recoveryEmail.message}
                        </Text>
                      )}
                    </View>
                  )}
                />
              </View>
            </View>

            {/* ========== EXTRA SECTION ========== */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <MessageSquare color="#ffffff" size={20} />
                <Text style={styles.sectionTitle}>Extra</Text>
              </View>

              <View style={styles.divider} />

              {/* Notes Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Notes</Text>
                <Controller
                  control={control}
                  name="notes"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Additional information..."
                      placeholderTextColor="#666"
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
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Tag color="#888" size={14} />
                  <Text style={styles.label}>Tags</Text>
                </View>
                <Controller
                  control={control}
                  name="tags"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="work, important, 2fa"
                      placeholderTextColor="#666"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
                <Text style={styles.helperText}>Separate tags with commas</Text>
              </View>
            </View>

            {/* ========== SUBMIT BUTTONS ========== */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={handleSubmit(onSubmit, onError)}
                style={styles.primaryButton}
              >
                <LinearGradient
                  colors={["#ffffff", "#e0e0e0"]}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.primaryButtonText}>Save Password</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => reset()}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Reset Form</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </Modal>
  ) : (
    <TouchableOpacity onPress={() => setTab(true)} style={styles.addButton}>
      <LinearGradient
        colors={["#ffffff", "#f0f0f0"]}
        style={styles.addButtonGradient}
      >
        <Plus color="#000" size={20} />
        <Text style={styles.addButtonText}>Add New Password</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  gradientContainer: {
    flex: 1,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  closeButton: {
    backgroundColor: "#2a2a2a",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  sectionCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  divider: {
    height: 1,
    backgroundColor: "#2a2a2a",
    marginVertical: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ccc",
    marginBottom: 8,
  },
  required: {
    color: "#ff6b6b",
  },
  input: {
    backgroundColor: "#0f0f0f",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#333",
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  passwordContainer: {
    position: "relative",
  },
  eyeButton: {
    position: "absolute",
    right: 16,
    top: 14,
    padding: 4,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 6,
  },
  helperText: {
    color: "#666",
    fontSize: 12,
    marginTop: 6,
  },
  timestampBox: {
    backgroundColor: "#0f0f0f",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#333",
  },
  timestampText: {
    color: "#888",
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 20,
  },
  primaryButton: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 14,
  },
  primaryButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "#2a2a2a",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  secondaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  addButton: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  addButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
    borderRadius: 14,
  },
  addButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default PasswordForm;
