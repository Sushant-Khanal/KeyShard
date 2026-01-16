
import React from "react";
import { View, Text, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Key, MessageCircleWarning, QrCode, Vault, ShieldAlert, ArrowRight } from "lucide-react-native";


export default function ForgotPassword() {
    return (
        <LinearGradient
            colors={["#434343", "#000000"]}
            className="flex-1"
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
        >
            <SafeAreaView className="flex-1">
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, padding: 20 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Main Heading */}
                    <View className="flex-row items-center justify-start mb-6 gap-2 w-full">
                        <Key color="white" size={28} strokeWidth={1.7} />
                        <Text className="text-2xl font-bold text-white text-left">Forgot Your Password?</Text>
                    </View>

                    {/* Master Password Security */}
                    <View className="bg-white/15 rounded-xl p-4 mb-4 w-full">
                        <View className="flex-row items-center gap-2 mb-2">
                            <ShieldAlert color="white" size={22} strokeWidth={1.7} />
                            <Text className="text-lg font-bold text-white">Master Password Security</Text>
                        </View>
                        <View className="flex-row items-start gap-2 mb-2">
                            <ArrowRight color="white" size={18} strokeWidth={1.7} style={{ marginTop: 4 }} />
                            <Text className="text-white text-base text-left flex-1 flex-shrink">Your master password is designed to be secure and never leaves your device.</Text>
                        </View>
                        <View className="flex-row items-start gap-2 mb-2">
                            <ArrowRight color="white" size={18} strokeWidth={1.7} style={{ marginTop: 4 }} />
                            <Text className="text-white text-base text-left flex-1 flex-shrink">We, the KeyShard team, do not know your master key and are sorry that you lost it. This step is taken to ensure your password manager remains secure.</Text>
                        </View>
                    </View>

                    {/* System Flow Overview */}
                    <View className="bg-white/15 rounded-xl p-4 mb-4 w-full">
                        <View className="flex-row items-center gap-2 mb-2">
                            <MessageCircleWarning color="white" size={22} strokeWidth={1.7} />
                            <Text className="text-lg font-bold text-white">How KeyShard Works</Text>
                        </View>
                        <View className="flex-row items-start gap-2 mb-2">
                            <ArrowRight color="white" size={18} strokeWidth={1.7} style={{ marginTop: 4 }} />
                            <Text className="text-white text-base text-left flex-1 flex-shrink">KeyShard is designed so that only you can unlock your vault. Your master password is used to generate a unique key that encrypts your data locally. No one, including us, can access your vault without this key.</Text>
                        </View>
                        <View className="flex-row items-start gap-2 mb-2">
                            <ArrowRight color="white" size={18} strokeWidth={1.7} style={{ marginTop: 4 }} />
                            <Text className="text-white text-base text-left flex-1 flex-shrink">If you lose your master password, your encrypted vault cannot be recovered for security reasons. This ensures only you have access to your sensitive information.</Text>
                        </View>
                    </View>

                    {/* QR Code Advice */}
                    <View className="bg-white/15 rounded-xl p-4 mb-4 w-full">
                        <View className="flex-row items-center gap-2 mb-2">
                            <QrCode color="white" size={22} strokeWidth={1.7} />
                            <Text className="text-lg font-bold text-white">Keep Your Vault Safe</Text>
                        </View>
                        <View className="flex-row items-start gap-2 mb-2">
                            <ArrowRight color="white" size={18} strokeWidth={1.7} style={{ marginTop: 4 }} />
                            <Text className="text-white text-base text-left flex-1 flex-shrink">We suggest you create a QR code of your password manager or master password and store it securely. This can help you recover your vault in the future.</Text>
                        </View>
                    </View>

                    {/* New Vault Option */}
                    <View className="bg-white/15 rounded-xl p-4 mb-4 w-full">
                        <View className="flex-row items-center gap-2 mb-2">
                            <Vault color="white" size={22} strokeWidth={1.7} />
                            <Text className="text-lg font-bold text-white">Create a New Vault</Text>
                        </View>
                        <View className="flex-row items-start gap-2 mb-2">
                            <ArrowRight color="white" size={18} strokeWidth={1.7} style={{ marginTop: 4 }} />
                            <Text className="text-white text-base text-left flex-1 flex-shrink">The only option now is to create a new Vault. Please make sure to keep your new master password safe and consider backing it up securely.</Text>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}