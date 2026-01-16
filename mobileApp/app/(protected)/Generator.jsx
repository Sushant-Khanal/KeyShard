import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFonts, Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'
import { Copy, RefreshCw, Sparkles, ShieldCheck, Hash, Type, AtSign, CheckCircle, Dices } from 'lucide-react-native'
import * as Clipboard from 'expo-clipboard'
import Avatar from './Avatar'
import Footer from './Footer'
import { generatePassword } from '../security/passwordGenerator'

const Generator = () => {
    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_700Bold,
    })

    const [password, setPassword] = useState('')
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        handleGenerate()
    }, [])

    const handleGenerate = () => {
        const newPassword = generatePassword()
        setPassword(newPassword)
        setCopied(false)
    }

    const handleCopy = async () => {
        await Clipboard.setStringAsync(password)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const passwordFeatures = [
        { icon: Type, label: 'Uppercase & Lowercase', active: true },
        { icon: Hash, label: 'Numbers (0-9)', active: true },
        { icon: AtSign, label: 'Special Characters', active: true },
        { icon: ShieldCheck, label: '16 Characters Length', active: true },
    ]

    if (!fontsLoaded) return null

    return (
        <LinearGradient
            colors={['#0a0a0a', '#1a1a1a', '#0f0f0f']}
            className="flex-1"
        >
            <SafeAreaView className="flex-1 w-full" edges={['top', 'bottom']}>
                <Animated.View
                    entering={FadeIn.duration(800)}
                    className="flex-1 w-[90%] mx-auto relative"
                >
                    <Avatar />

                    {/* HEADER */}
                    <View className="mb-6 mt-2">
                        <Text
                            style={{ fontFamily: 'Montserrat_700Bold' }}
                            className="text-white text-3xl tracking-tight"
                        >
                            Generate Password
                        </Text>
                        <Text
                            style={{ fontFamily: 'Montserrat_400Regular' }}
                            className="text-gray-500 text-sm mt-1"
                        >
                            Create strong & secure passwords
                        </Text>
                    </View>

                    {/* CONTENT AREA */}
                    <ScrollView
                        className="flex-1"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 30, paddingTop: 20 }}
                    >
                        {/* Generated Result Card */}
                        <Animated.View
                            entering={FadeInDown.duration(500).delay(100)}
                            className="bg-[#1a1a1a] rounded-2xl p-5 border border-[#2a2a2a]"
                        >
                            {/* Card Header */}
                            <View className="flex-row justify-between items-center mb-6">
                                <Text
                                    style={{ fontFamily: 'Montserrat_700Bold' }}
                                    className="text-gray-500 text-xs tracking-widest"
                                >
                                    GENERATED RESULT
                                </Text>
                                <View className="flex-row gap-4">
                                    <TouchableOpacity onPress={handleCopy} className="p-2">
                                        {copied ? (
                                            <CheckCircle size={22} color="#22c55e" />
                                        ) : (
                                            <Copy size={22} color="#666" />
                                        )}
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleGenerate} className="p-2">
                                        <RefreshCw size={22} color="#666" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Password Display */}
                            <View className="items-center py-6">
                                <Text
                                    style={{ fontFamily: 'Montserrat_700Bold' }}
                                    className="text-white text-2xl text-center tracking-wider"
                                    selectable
                                >
                                    {password}
                                </Text>
                            </View>

                            {/* Strength Bar */}
                            <View className="h-1.5 bg-[#2a2a2a] rounded-full mt-4 mb-4">
                                <View
                                    className="h-full rounded-full bg-[#22c55e]"
                                    style={{ width: '100%' }}
                                />
                            </View>

                            {/* Strength Info */}
                            <View className="flex-row justify-between items-center">
                                <Text
                                    style={{
                                        fontFamily: 'Montserrat_700Bold',
                                        color: '#22c55e'
                                    }}
                                    className="text-xs tracking-wide"
                                >
                                    STRENGTH: EXCELLENT
                                </Text>
                                <Text
                                    style={{ fontFamily: 'Montserrat_400Regular' }}
                                    className="text-gray-500 text-xs"
                                >
                                    {password.length} CHARACTERS
                                </Text>
                            </View>
                        </Animated.View>

                        {/* Generate Button */}
                        <Animated.View entering={FadeInDown.duration(500).delay(200)}>
                            <TouchableOpacity
                                onPress={handleGenerate}
                                activeOpacity={0.8}
                                className="mt-6 "
                            >
                                <LinearGradient
                                    colors={['#ffffff', '#f0f0f0']}
                                    className="rounded-2xl py-4 flex-row justify-center items-center gap-2"
                                >
                                    <Dices size={20} color="#000" />
                                    <Text
                                        style={{ fontFamily: 'Montserrat_700Bold' }}
                                        className="text-black text-base"
                                    >
                                        Generate New
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Password Features Section */}
                        <Animated.View
                            entering={FadeInDown.duration(500).delay(300)}
                            className="mt-8"
                        >
                            <Text
                                style={{ fontFamily: 'Montserrat_700Bold' }}
                                className="text-gray-500 text-xs tracking-widest mb-4"
                            >
                                PASSWORD INCLUDES
                            </Text>

                            <View className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a]">
                                {passwordFeatures.map((feature, index) => (
                                    <View
                                        key={index}
                                        className={`flex-row items-center p-4 ${index !== passwordFeatures.length - 1 ? 'border-b border-[#2a2a2a]' : ''}`}
                                    >
                                        <View className="w-10 h-10 rounded-xl bg-[#0f0f0f] items-center justify-center mr-3 border border-[#333]">
                                            <feature.icon size={18} color="#22c55e" />
                                        </View>
                                        <Text
                                            style={{ fontFamily: 'Montserrat_400Regular' }}
                                            className="text-white text-sm flex-1"
                                        >
                                            {feature.label}
                                        </Text>
                                        <View className="w-5 h-5 rounded-full bg-[#22c55e]/20 items-center justify-center">
                                            <CheckCircle size={14} color="#22c55e" />
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </Animated.View>

                        {/* Security Tip */}
                        <Animated.View
                            entering={FadeInDown.duration(500).delay(400)}
                            className="mt-6 bg-[#1a1a1a] rounded-2xl p-4 border border-[#2a2a2a] flex-row items-start"
                        >
                            <View className="w-10 h-10 rounded-xl bg-[#22c55e]/10 items-center justify-center mr-3">
                                <ShieldCheck size={20} color="#22c55e" />
                            </View>
                            <View className="flex-1">
                                <Text
                                    style={{ fontFamily: 'Montserrat_700Bold' }}
                                    className="text-white text-sm mb-1"
                                >
                                    Security Tip
                                </Text>
                                <Text
                                    style={{ fontFamily: 'Montserrat_400Regular' }}
                                    className="text-gray-500 text-xs leading-5"
                                >
                                    Use unique passwords for each account. Store them securely in your Password Vault.
                                </Text>
                            </View>
                        </Animated.View>

                    </ScrollView>

                </Animated.View>
                <Footer currentPage='generator' />
            </SafeAreaView>
        </LinearGradient>
    )
}

export default Generator