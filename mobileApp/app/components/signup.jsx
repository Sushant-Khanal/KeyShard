import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Key, Eye, EyeOff, Copy } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Text, TextInput, View, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react'
import * as Clipboard from 'expo-clipboard';
import { useFonts, Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { navigate } from 'expo-router/build/global-state/routing'
import genMasterKey from '../security/masterPass';
import { encryptPassword } from '../security/aesEncryption';
import * as Crypto from 'expo-crypto';
import { fromByteArray } from 'react-native-quick-base64';
import PasswordStrength from './PasswordStrength.jsx';
import Constants from 'expo-constants';
import Animated, { FadeIn } from 'react-native-reanimated';
import { generatePassword } from '../security/passwordGenerator.js';

const SignUp = () => {
    const { localhost } = Constants.expoConfig?.extra ?? {}
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [email, setEmail] = useState('')
    const [passMatch, setpassMatch] = useState(true)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [pass, setPass] = useState(true)
    const [error, setError] = useState(false)

    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_700Bold,
    })

    useEffect(() => {
        console.log(loading)
    }, [loading]);

    useEffect(() => {

    }, [pass])

    function handlePass(data) {
        setPass(data)
    }



    useEffect(() => {
        if (!success) return

        setTimeout(() => {
            navigate('/')
        }, 1500)
    }, [success])

    useEffect(() => {
        if (password && (password !== confirmPassword) && confirmPassword) {
            setpassMatch(false)
        } else {
            setpassMatch(true)
        }
    }, [confirmPassword, password])


    function handlePasswordGenerate() {
        const customPassword = generatePassword();
        setPassword(customPassword)
        setConfirmPassword(customPassword)
        console.log(customPassword)

    }

    const handleSignUp = async () => {
        setLoading(true)
        setError("")
        await new Promise(r => requestAnimationFrame(r))
        if (!email.length || !password.length || !confirmPassword.length) {
            setError("Please enter all the required fields")
            setLoading(false)
            return
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            setLoading(false)
            return
        }

        try {
            const salt = fromByteArray(Crypto.getRandomValues(new Uint8Array(32)))
            const { vaultKey, userHash, publicKeyBase64 } = await genMasterKey(password, salt);
            console.log('vaultKey: ', vaultKey, "userHash:", userHash, "publicKeyBase64 : ", publicKeyBase64)

            if (!vaultKey || !userHash || !publicKeyBase64) {
                setError("Error generating Argon2id MasterKey")
                return
            }

            const { encryptedVault, iv, tag } = await encryptPassword(JSON.stringify([]), vaultKey)
            console.log("Encrypted Vault: ", encryptedVault)

            if (!encryptedVault.length) {
                setError("Error generating secure vault")
                return
            }

            const response = await fetch(`${localhost}/api/signup`, {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    encryptedVault: encryptedVault,
                    iv: iv,
                    tag: tag,
                    userHash: userHash,
                    salt: salt,
                    publicKeyBase64: publicKeyBase64
                })
            })

            const result = await response.json()
            if (!response.ok) {
                setError(result.message || "Signup failed")
                return
            }

            console.log("Signup successful:", result)
            setSuccess(true)

        } catch (error) {
            console.error("Signup error:", error)
            setError("Internal Error. Please try again.")
        } finally {
            setLoading(false)
            setEmail("")
            setPassword("")
            setConfirmPassword("")
        }
    }

    return (
        <LinearGradient
            colors={['#434343', '#000000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-1">
            <SafeAreaView className="flex-1 w-full" edges={['top', 'bottom']}>
                <KeyboardAvoidingView

                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
                >
                    <Animated.ScrollView
                        entering={FadeIn.duration(1000)}
                        contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag"
                        contentInsetAdjustmentBehavior="automatic"
                        showsVerticalScrollIndicator={false}
                    >
                        <TouchableOpacity
                            onPress={() => navigate('/')}
                            style={{ zIndex: 100 }}
                            className="absolute top-4 left-4">
                            <ArrowLeft color='white' pointerEvents="none" strokeWidth={2} size={24} />
                        </TouchableOpacity>

                        <View className='w-11/12 sm:w-4/5 mx-auto px-2 py-8'>
                            {/* Top Logo */}
                            <View className='flex-row border-b border-white/30 py-1 mb-8 items-center gap-1 self-center'>
                                <Key color={'white'} size={26} strokeWidth={2} />
                                <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 18 }} numberOfLines={1} adjustsFontSizeToFit className='text-white'>KeyShards</Text>
                            </View>

                            {/* Middle Logo */}
                            <View className='flex justify-center items-center'>
                                <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 22 }} className='text-white text-center'>Create Your Master</Text>
                                <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 22 }} className='text-white text-center'>Password</Text>
                            </View>

                            {/* Info */}
                            <View className='flex justify-center items-center mt-4'>
                                <Text style={{ fontFamily: 'Montserrat_400Regular', fontSize: 12 }} className='text-white text-center'>This password encrypts your entire vault.</Text>
                                <Text style={{ fontFamily: 'Montserrat_400Regular', fontSize: 12 }} className='text-white text-center'>We cannot recover it.</Text>
                            </View>

                            {/* Constrained form container to match index.jsx */}
                            <View style={{ width: '100%', maxWidth: 360, alignSelf: 'center' }}>
                                <View className='flex w-full justify-center items-center mt-6'>
                                    <View className='flex w-full justify-center items-center'>
                                        <Text style={{ fontFamily: 'Montserrat_400Regular', fontSize: 12 }} className='mr-auto text-white font-medium'>Email <Text style={{ fontSize: 11 }} className="font-light">(Only used to link your vault)</Text></Text>
                                        <TextInput
                                            secureTextEntry={false}
                                            editable={!loading}
                                            style={{ fontFamily: 'Montserrat_400Regular', fontSize: 14, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}
                                            onChangeText={(text) => setEmail(text)}
                                            value={email}
                                            placeholder="Enter Email"
                                            color={'white'}
                                            placeholderTextColor={'#555'}
                                            className='w-full px-4 py-3 text-white mt-2 rounded-xl mb-4'
                                        />
                                    </View>

                                    <View className='flex w-full justify-center items-center'>
                                        <Text style={{ fontFamily: 'Montserrat_400Regular', fontSize: 12 }} className='mr-auto text-white font-medium'>New Master Password </Text>
                                        <View style={{ width: '100%', position: 'relative', flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 16 }}>
                                            <TextInput
                                                secureTextEntry={!passwordVisible}
                                                editable={!loading}
                                                style={{ flex: 1, fontFamily: 'Montserrat_400Regular', fontSize: 14, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingRight: 80 }}
                                                onChangeText={(text) => setPassword(text)}
                                                value={password}
                                                placeholder="Enter Password"
                                                color={'white'}
                                                placeholderTextColor={'#555'}
                                                className='w-full px-4 py-3 text-white rounded-xl'
                                            />
                                            <TouchableOpacity
                                                onPress={handlePasswordGenerate}
                                                style={{ position: 'absolute', right: 68, top: 8, backgroundColor: 'white', borderRadius: 6, paddingVertical: 6, paddingHorizontal: 8 }}
                                            >
                                                <Text style={{ fontFamily: 'Montserrat_400Regular', fontSize: 12, color: 'black', fontWeight: 'bold' }}>Generate</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={async () => { if (password) await Clipboard.setStringAsync(password); }}
                                                style={{ position: 'absolute', right: 38, top: 12 }}
                                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                            >
                                                <Copy color="#888" size={20} />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => setPasswordVisible(v => !v)}
                                                style={{ position: 'absolute', right: 8, top: 12 }}
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

                                    <View className='flex w-full justify-center items-center'>
                                        <Text style={{ fontFamily: 'Montserrat_400Regular', fontSize: 12 }} className='mr-auto text-white font-medium'>Confirm Password</Text>
                                        <View style={{ width: '100%', position: 'relative' }}>
                                            <TextInput
                                                secureTextEntry={!confirmPasswordVisible}
                                                editable={!loading}
                                                style={{ fontFamily: 'Montserrat_400Regular', fontSize: 14, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingRight: 40 }}
                                                onChangeText={(text) => setConfirmPassword(text)}
                                                value={confirmPassword}
                                                placeholder="Re-Enter Password"
                                                color={'white'}
                                                placeholderTextColor={'#555'}
                                                className='w-full px-4 py-3 text-white mt-2 rounded-xl'
                                            />
                                            <TouchableOpacity
                                                onPress={() => setConfirmPasswordVisible(v => !v)}
                                                style={{ position: 'absolute', right: 10, top: 18 }}
                                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                            >
                                                {confirmPasswordVisible ? (
                                                    <EyeOff color="#888" size={20} />
                                                ) : (
                                                    <Eye color="#888" size={20} />
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                        {!passMatch && <Text style={{ fontSize: 12 }} className="text-red-500 mt-2 mr-auto">Password does not match</Text>}
                                    </View>
                                </View>

                                {/* Password Strength - Now visible above keyboard */}
                                <PasswordStrength password={password} />

                                {error && <View className="mt-2 px-2">
                                    <Text style={{ fontSize: 12 }} className="text-red-500 font-bold text-center">{error}</Text>
                                </View>}

                                {loading && <Text style={{ fontSize: 12 }} className="mt-4 text-white font-bold text-center">Encrypting your vault. This may take a moment…</Text>}

                                {success && <Text style={{ fontSize: 12 }} className="mt-4 text-white font-bold text-center">Vault Created Successfully. Navigating you to SignIn Page </Text>}

                                {/* Bottom Button */}
                                <TouchableOpacity
                                    disabled={loading || !pass}
                                    activeOpacity={(loading || !pass) ? 1 : 0.7}
                                    onPress={handleSignUp}
                                    className={`w-full max-w-[300] m-auto mt-6 mb-4 flex justify-center items-center py-3 ${loading || !pass ? ("bg-[#2a2a2a]") : ("bg-white")} rounded-xl`}
                                >
                                    <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 16 }} className={loading || !pass ? 'text-[#666]' : 'text-black'}>{loading ? "Creating..." : "Create Vault"}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Animated.ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
};

export default SignUp;