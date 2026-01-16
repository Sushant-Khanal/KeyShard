import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFonts, Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'
import { Eye, EyeOff, ShieldCheck, ShieldAlert, ShieldX, CheckCircle, XCircle, Trash2 } from 'lucide-react-native'
import Avatar from './Avatar'
import Footer from './Footer'
import { calculateStrength } from '../security/strength'

const Security = () => {
    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_700Bold,
    })

    const [password, setPassword] = useState('')
    const [passwordVisible, setPasswordVisible] = useState(false)
    const [strengthList, setStrengthList] = useState([])
    const [strengthLevel, setStrengthLevel] = useState('')

    const suggestions = {
        min: 'Minimum 12 characters required',
        uppercase: 'At least 1 uppercase letter (A–Z)',
        lowercase: 'At least 1 lowercase letter (a–z)',
        digits: 'At least 2 numbers (0–9)',
        symbols: 'At least 2 special characters (!@#$…)',
        spaces: 'No spaces allowed',
        oneOf: 'Password must not be common or easily guessed'
    }

    useEffect(() => {
        if (password.length === 0) {
            setStrengthList([])
            setStrengthLevel('')
            return
        }

        const result = calculateStrength(password)
        setStrengthList(result)

        if (password.length >= 16 && result.length === 0) {
            setStrengthLevel('excellent')
        } else if (result.length <= 2 && !result.includes('min') && !result.includes('symbols')) {
            setStrengthLevel('strong')
        } else if (result.length <= 5 && !result.includes('uppercase') && !result.includes('lowercase')) {
            setStrengthLevel('medium')
        } else {
            setStrengthLevel('weak')
        }
    }, [password])

    const getStrengthColor = () => {
        switch (strengthLevel) {
            case 'excellent': return '#22c55e'
            case 'strong': return '#3b82f6'
            case 'medium': return '#eab308'
            case 'weak': return '#ef4444'
            default: return '#666'
        }
    }

    const getStrengthProgress = () => {
        switch (strengthLevel) {
            case 'excellent': return '100%'
            case 'strong': return '75%'
            case 'medium': return '50%'
            case 'weak': return '25%'
            default: return '0%'
        }
    }

    const getStrengthIcon = () => {
        switch (strengthLevel) {
            case 'excellent':
            case 'strong':
                return <ShieldCheck size={24} color={getStrengthColor()} />
            case 'medium':
                return <ShieldAlert size={24} color={getStrengthColor()} />
            case 'weak':
                return <ShieldX size={24} color={getStrengthColor()} />
            default:
                return <ShieldCheck size={24} color="#666" />
        }
    }

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
                            Password Strength
                        </Text>
                        <Text
                            style={{ fontFamily: 'Montserrat_400Regular' }}
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
                                style={{ fontFamily: 'Montserrat_700Bold' }}
                                className="text-gray-500 text-xs tracking-widest mb-4"
                            >
                                ENTER PASSWORD TO TEST
                            </Text>

                            {/* Password Input */}
                            <View className="flex-row items-center bg-[#0f0f0f] rounded-xl border border-[#333] px-4">
                                <TextInput
                                    secureTextEntry={!passwordVisible}
                                    style={{ fontFamily: 'Montserrat_400Regular' }}
                                    className="flex-1 text-white text-base py-4"
                                    placeholder="Type your password..."
                                    placeholderTextColor="#555"
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                {password.length > 0 && (
                                    <TouchableOpacity
                                        onPress={() => setPassword('')}
                                        className="p-2 mr-1"
                                    >
                                        <Trash2 size={18} color="#666" />
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    onPress={() => setPasswordVisible(v => !v)}
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
                                            style={{
                                                width: getStrengthProgress(),
                                                backgroundColor: getStrengthColor()
                                            }}
                                        />
                                    </View>

                                    {/* Strength Info */}
                                    <View className="flex-row justify-between items-center mt-3">
                                        <View className="flex-row items-center gap-2">
                                            {getStrengthIcon()}
                                            <Text
                                                style={{
                                                    fontFamily: 'Montserrat_700Bold',
                                                    color: getStrengthColor()
                                                }}
                                                className="text-sm"
                                            >
                                                {strengthLevel.toUpperCase()}
                                            </Text>
                                        </View>
                                        <Text
                                            style={{ fontFamily: 'Montserrat_400Regular' }}
                                            className="text-gray-500 text-xs"
                                        >
                                            {password.length} CHARACTERS
                                        </Text>
                                    </View>
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
                                    style={{ fontFamily: 'Montserrat_700Bold' }}
                                    className="text-gray-500 text-xs tracking-widest mb-4"
                                >
                                    PASSWORD REQUIREMENTS
                                </Text>

                                <View className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a]">
                                    {Object.entries(suggestions).map(([key, text], index) => {
                                        const isValid = !strengthList.includes(key)
                                        return (
                                            <View
                                                key={key}
                                                className={`flex-row items-center p-4 ${index !== Object.entries(suggestions).length - 1 ? 'border-b border-[#2a2a2a]' : ''}`}
                                            >
                                                <View
                                                    className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                                                    style={{
                                                        backgroundColor: isValid ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                                                    }}
                                                >
                                                    {isValid ? (
                                                        <CheckCircle size={16} color="#22c55e" />
                                                    ) : (
                                                        <XCircle size={16} color="#ef4444" />
                                                    )}
                                                </View>
                                                <Text
                                                    style={{
                                                        fontFamily: 'Montserrat_400Regular',
                                                        color: isValid ? '#888' : '#fff'
                                                    }}
                                                    className="text-sm flex-1"
                                                >
                                                    {text}
                                                </Text>
                                            </View>
                                        )
                                    })}
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
                                    style={{ fontFamily: 'Montserrat_700Bold' }}
                                    className="text-gray-600 text-base mb-2"
                                >
                                    Test Your Password
                                </Text>
                                <Text
                                    style={{ fontFamily: 'Montserrat_400Regular' }}
                                    className="text-gray-700 text-sm text-center"
                                >
                                    Enter a password above to check{'\n'}its strength and security
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
                                    style={{ fontFamily: 'Montserrat_700Bold' }}
                                    className="text-white text-sm mb-1"
                                >
                                    Security Tip
                                </Text>
                                <Text
                                    style={{ fontFamily: 'Montserrat_400Regular' }}
                                    className="text-gray-500 text-xs leading-5"
                                >
                                    A strong password should be at least 12 characters with a mix of letters, numbers, and symbols.
                                </Text>
                            </View>
                        </Animated.View>

                    </ScrollView>

                </Animated.View>
                <Footer currentPage='security' />
            </SafeAreaView>
        </LinearGradient>
    )
}

export default Security