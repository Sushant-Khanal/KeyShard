import {
    Text,
    TextInput,
    View,
    TouchableOpacity,
    Image,
    ScrollView,
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
    FingerprintPattern,
    Key,
    MessageCircleWarning,
    ScanFace,
} from 'lucide-react-native'
import {
    useFonts,
    Montserrat_400Regular,
    Montserrat_700Bold,
} from '@expo-google-fonts/montserrat'
import { navigate } from 'expo-router/build/global-state/routing'
import genMasterKey from './security/masterPass'
import { decryptPassword } from './security/aesEncryption'
import { getSession, setSession } from './security/secureStore'
import Constants from 'expo-constants'

const Login = () => {
    const { localhost } = Constants.expoConfig?.extra ?? {}

    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState('')

    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_700Bold,
    })

    function handleCreateMasterPassword() {
        navigate('./components/signup')
    }

    useEffect(() => { }, [status])

    const validateEmail = (value) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return regex.test(value)
    }

    async function handleUnlock() {
        setError('')
        try {
            if (!email.length || !password.length) {
                setError('Email & Password are required')
                return
            }

            if (!validateEmail(email)) {
                setError('Enter a valid email')
                return
            }

            setLoading(true)

            setStatus('Fetching the salt...')
            const responseInitial = await fetch(`${localhost}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })

            const resultInitial = await responseInitial.json()
            if (!responseInitial.ok) {
                setError(resultInitial.message)
                return
            }

            setStatus('Generating UserHash please wait...')
            const salt = resultInitial.message?.salt
            await new Promise((r) => requestAnimationFrame(r))

            const { vaultKey, userHash } = genMasterKey(password, salt)
            if (!vaultKey || !userHash) {
                setError('Failed to generate vault key')
                return
            }

            setStatus('Authenticating the user...')
            const responseFinal = await fetch(`${localhost}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, userHash }),
            })

            const resultFinal = await responseFinal.json()
            if (!responseFinal.ok) {
                setError(resultFinal.message)
                return
            }

            setStatus('Decrypting the Vault ...')
            const { encryptedVault, iv, tag } = resultFinal.message
            const decryptedVault = await decryptPassword(
                encryptedVault,
                vaultKey,
                iv,
                tag
            )

            if (!decryptedVault) {
                setError('Failed to decrypt your vault')
                return
            }

            setStatus('Success, Loading your vault...')
            setSession({ vaultKey, iv, tag, salt, userHash })

            setTimeout(() => {
                const session = getSession()
                if (session?.vaultKey) {
                    navigate('/(protected)/home')
                }
            }, 1000)
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
            console.log("loading:", loading)
        }
    }

    return (
        <LinearGradient colors={['#1b2125ff', '#051629ff']} className="flex-1">
            <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View className="flex-1 w-full px-3 sm:px-6 py-6">

                        {/* Header */}
                        <View className="flex-row items-center justify-center gap-2 mt-4 mb-4 px-2">
                            <Key color="white" size={24} strokeWidth={2} />
                            <Text
                                style={{ fontFamily: 'Montserrat_700Bold', fontSize: 18 }}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                                className="text-white flex-shrink"
                            >
                                KeyShards
                            </Text>
                        </View>

                        {/* Title */}
                        <View className="items-center mb-4 px-1">
                            <Text
                                style={{ fontFamily: 'Montserrat_700Bold', fontSize: 20 }}
                                numberOfLines={2}
                                adjustsFontSizeToFit
                                className="text-white text-center"
                            >
                                Unlock Your Vault
                            </Text>
                            <Image
                                source={require('../assets/images/lock.png')}
                                className="w-16 h-16 sm:w-20 sm:h-20 mt-2 sm:mt-3"
                                resizeMode="contain"
                            />
                        </View>

                        {/* Spacer to center inputs */}
                        <View className="flex-1" />

                        {/* Inputs */}
                        <View className="w-full mb-8 sm:mb-10">
                            <Text
                                style={{ fontFamily: 'Montserrat_400Regular', fontSize: 13 }}
                                className="text-white mb-1"
                            >
                                Email
                            </Text>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                textContentType="emailAddress"
                                placeholder="Email linked to your vault"
                                placeholderTextColor="#d1d5db"
                                className="bg-gray-700 text-white rounded-lg px-3 py-2 mb-4"
                                style={{ fontSize: 14 }}
                            />

                            <Text
                                style={{ fontFamily: 'Montserrat_400Regular', fontSize: 13 }}
                                className="text-white mb-1"
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
                                style={{ fontSize: 14 }}
                            />
                        </View>

                        {/* Unlock Button */}
                        <TouchableOpacity
                            activeOpacity={loading ? 1 : 0.7}
                            disabled={loading}
                            onPress={handleUnlock}
                            className={` ${loading ? 'bg-[#283963] text-[#cecece]' : 'bg-[#5783F3] text-white'} py-3 rounded-lg mb-6 sm:mb-8`}
                        >
                            <Text
                                style={{ fontFamily: 'Montserrat_700Bold', fontSize: 16 }}
                                className="text-white text-center"
                            >
                                {loading ? 'Unlocking...' : 'Unlock'}
                            </Text>
                        </TouchableOpacity>

                        {/* Status / Error */}
                        {(!error && status) && (
                            <View className="items-center mb-6 px-2">
                                <Text style={{ fontSize: 13 }} className="text-white font-bold text-center">{status}</Text>
                            </View>
                        )}

                        {error && (
                            <View className="items-center mb-6 px-2">
                                <Text style={{ fontSize: 13 }} className="text-red-500 font-bold text-center">{error}</Text>
                            </View>
                        )}

                        {/* Biometrics */}
                        <View className="items-center mb-8 sm:mb-12">
                            <Text
                                style={{ fontFamily: 'Montserrat_400Regular', fontSize: 13 }}
                                className="text-white mb-4"
                            >
                                Or unlock with
                            </Text>

                            <View className="flex-row gap-10 sm:gap-12">
                                <TouchableOpacity>
                                    <FingerprintPattern color="white" size={36} strokeWidth={1.5} />
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <ScanFace color="white" size={36} strokeWidth={1.5} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Create Master */}
                        <TouchableOpacity className="mb-6 sm:mb-8 px-2" onPress={handleCreateMasterPassword}>
                            <Text
                                style={{ fontFamily: 'Montserrat_400Regular', fontSize: 13 }}
                                className="text-blue-400 text-center"
                            >
                                Create Master Password
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
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    )
}

export default Login
