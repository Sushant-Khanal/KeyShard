import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Key } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Text, TextInput, View, Button, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react'
import { useFonts, Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { navigate } from 'expo-router/build/global-state/routing'
import genMasterKey from '../security/masterPass';
import { encryptPassword } from '../security/aesEncryption';
import * as Crypto from 'expo-crypto';
import { fromByteArray } from 'react-native-quick-base64';
import Constants from 'expo-constants';







const SignUp = () => {
    const { localhost } = Constants.expoConfig?.extra ?? {}
    const [password, setPassword] = useState('');
    const [passwordStrength, setPasswordStrength] = useState("strong");
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('')
    const [passMatch, setpassMatch] = useState(true)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)


    const [error, setError] = useState(false)
    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_700Bold,
    })
    const suggestions = ['Add special characters', 'Use both upper & lower case']

    useEffect(() => {
        console.log(loading)
    }, [loading]);

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
                body: JSON.stringify({ email: email, encryptedVault: encryptedVault, iv: iv, tag: tag, userHash: userHash, salt: salt, publicKeyBase64: publicKeyBase64 })
            }

            )

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
            colors={['#1b2125ff', '#051629ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-1 relative justify-center items-center">
            <SafeAreaView className="relative flex-1 w-full" edges={['top', 'bottom']}>
                <TouchableOpacity
                    onPress={() => navigate('/')}
                    style={{ zIndex: 100 }}
                    className="absolute top-16 left-4">
                    <ArrowLeft color='white' pointerEvents="none" strokeWidth={2} size={24} />
                </TouchableOpacity>
                <View className='flex-1 border-b border-blue-500 w-11/12 sm:w-4/5 mx-auto relative justify-center items-center px-2'>
                    {/* Top Logo */}
                    <View className='flex-row absolute border-b border-blue-500 py-1 top-3 items-center gap-1'>
                        <Key color={'white'} size={26} strokeWidth={2} />
                        <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 18 }} numberOfLines={1} adjustsFontSizeToFit className='text-white'>KeyShards</Text>
                    </View>

                    {/* Middle Logo */}
                    <View className='flex justify-center mt-6 items-center'>
                        <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 22 }} className='text-white text-center'>Create Your Master</Text>
                        <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 22 }} className='text-white text-center'>Password</Text>
                    </View>

                    {/* Info */}
                    <View className='flex justify-center items-center mt-4'>
                        <Text style={{ fontFamily: 'Montserrat_400Regular', fontSize: 12 }} className='text-white text-center'>This password encrypts your entire vault.</Text>
                        <Text style={{ fontFamily: 'Montserrat_400Regular', fontSize: 12 }} className='text-white text-center'>We cannot recover it.</Text>
                    </View>

                    <View className='flex w-full justify-center items-center mt-6'>

                        <View className='flex w-full justify-center items-center'>
                            <Text style={{ fontFamily: 'Montserrat_400Regular', fontSize: 12 }} className='mr-auto text-white font-medium'>Email <Text style={{ fontSize: 11 }} className="font-light">(Only used to link your vault)</Text></Text>
                            <TextInput
                                secureTextEntry={false}
                                style={{ fontFamily: 'Montserrat_400Regular', fontSize: 14 }}
                                onChangeText={(text) => setEmail(text)}
                                value={email}
                                placeholder="Enter Email"
                                color={'white'}
                                placeholderTextColor={'#9ca3af'}
                                className='w-full px-3 py-2 text-white mt-2 bg-gray-700 rounded-lg mb-4'
                            />
                        </View>
                        <View className='flex w-full justify-center items-center'>
                            <Text style={{ fontFamily: 'Montserrat_400Regular', fontSize: 12 }} className='mr-auto text-white font-medium'>New Master Password</Text>
                            <TextInput
                                secureTextEntry={true}
                                style={{ fontFamily: 'Montserrat_400Regular', fontSize: 14 }}
                                onChangeText={(text) => setPassword(text)}
                                value={password}
                                placeholder="Enter Password"
                                color={'white'}
                                placeholderTextColor={'#9ca3af'}
                                className='w-full px-3 py-2 text-white mt-2 bg-gray-700 rounded-lg mb-4'
                            />
                        </View>
                        <View className='flex w-full justify-center items-center'>
                            <Text style={{ fontFamily: 'Montserrat_400Regular', fontSize: 12 }} className='mr-auto text-white font-medium'>Confirm Password</Text>
                            <TextInput
                                secureTextEntry={true}
                                style={{ fontFamily: 'Montserrat_400Regular', fontSize: 14 }}
                                onChangeText={(text) => setConfirmPassword(text)}
                                value={confirmPassword}
                                placeholder="Re-Enter Password"
                                color={'white'}
                                placeholderTextColor={'#9ca3af'}
                                className='w-full px-3 py-2 text-white mt-2 bg-gray-700 rounded-lg'
                            />
                            {!passMatch && <Text style={{ fontSize: 12 }} className="text-red-500 mt-2 mr-auto">Password does not match</Text>}
                        </View>
                    </View>

                    {/* Password Strength */}
                    <View className='flex mt-6 w-full justify-center items-center'>

                        <Text style={{ fontFamily: 'Montserrat_400Regular', fontSize: 12 }} className='text-white mr-auto font-medium'>Password Strength</Text>


                        {passwordStrength && (
                            <View className='flex w-full flex-row gap-2 justify-center items-center mt-2'>
                                <View className='flex-1 h-5 flex flex-row justify-center border items-center bg-gray-700 rounded-lg'>
                                    {passwordStrength.toLowerCase() == 'weak' ?
                                        (<View className="w-1/4 h-full mr-auto rounded-lg bg-red-500" />) :
                                        passwordStrength.toLowerCase() == 'medium' ?
                                            (<View className="w-2/4 h-full mr-auto rounded-lg bg-yellow-500" />) :
                                            passwordStrength.toLowerCase() == 'strong' ?
                                                (<View className="w-3/4 h-full mr-auto rounded-lg bg-blue-500" />) :
                                                passwordStrength.toLowerCase() == 'excellent' ?
                                                    (<View className="w-full h-full mr-auto rounded-lg bg-green-500" />) :
                                                    <View><Text>Nothing</Text></View>}

                                </View>
                                <Text style={{ fontFamily: 'Montserrat_400Regular', fontSize: 12 }} className='text-white font-medium'>
                                    {passwordStrength.toUpperCase()}
                                </Text>


                            </View>
                        )}

                    </View>


                    {/* Suggestions */}

                    <View className='flex mt-6 w-full justify-center items-center'>
                        {suggestions.map((suggestion, index) => (
                            <Text key={index} style={{ fontFamily: 'Montserrat_400Regular', fontSize: 12 }} className='text-white mt-1 mr-auto font-medium'>●  {suggestion}</Text>
                        ))}
                    </View>

                    {/* <View>
                    {masterKey && <Text style={{ fontFamily: 'Montserrat_400Regular' }} className='text-white mt-[5px] mr-auto text-md font-medium '>Master Key: {masterKey}</Text>}
                </View> */}

                    {error && <View className="mt-2 px-2">
                        <Text style={{ fontSize: 12 }} className="text-red-500 font-bold text-center">{error}</Text>
                    </View>}
                    {loading && <Text style={{ fontSize: 12 }} className="mt-4 text-white font-bold text-center">Encrypting your vault. This may take a moment…</Text>}
                    {success && <Text style={{ fontSize: 12 }} className="mt-4 text-white font-bold text-center">Vault Created Successfully. Navigating you to SignIn Page </Text>}

                    {/* Bottom Button */}
                    <TouchableOpacity
                        disabled={loading}
                        activeOpacity={loading ? 1 : 0.7}
                        style={{ zIndex: 1 }}
                        onPress={handleSignUp}
                        className={`w-11/12 absolute bottom-6 flex justify-center items-center py-3 ${loading ? ("bg-[#283963] text-[#cecece]") : ("bg-[#5783F3] text-white")} rounded-md`}
                    >
                        <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 16 }} className='text-white'>{loading ? "Creating..." : "Create Vault"}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
};



export default SignUp;

