import { Text, TextInput, View, Button, TouchableOpacity } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { FingerprintPattern, Key, MessageCircleWarning, ScanFace } from 'lucide-react-native'
import { Image } from 'react-native'
import { useState } from 'react'
import { useFonts, Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { navigate } from 'expo-router/build/global-state/routing'


const Login = () => {
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [encryptedVault, setEncryptedVault] = useState('')
    const [loading, setLoading] = useState(false)
    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_700Bold,
    })

    function handleCreateMasterPassword() {
        navigate('./components/signup')
    }

    async function handleUnlock() {
        try {

            if (!email || !password) {
                setError('Enter the email and password')
                return
            }

            setLoading(true)
            setError("")
            await new Promise(r => requestAnimationFrame(r))

            const response = await fetch(`http://192.168.1.65:4000/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'Application/Json',
                },
                body: JSON.stringify({ email: email })


            })

            const result = await response.json()
            if (!response.ok) {
                return setError(result.message)
            }

            setEncryptedVault(result.message)

        } catch (error) {
            setError()
        }







    }




    return (
        <LinearGradient
            colors={['#1b2125ff', '#051629ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-1 relative justify-center items-center"
        >
            <View className='min-h-screen border-b border-blue-500 pt[20px] w-4/5  relative justify-center items-center'>
                {/* Top Logo */}
                <View className='flex-row absolute border-b border-blue-500 py-1 top-[90px] items-center '>
                    <Key color={'white'} size={35} strokeWidth={2} />
                    <Text style={{ fontFamily: 'Montserrat_700Bold' }} className='text-white  text-3xl ml-[10px] '>KeyShards</Text>
                </View>

                {/* Middle Logo */}
                <View className='flex justify-center items-center'>
                    <Text style={{ fontFamily: 'Montserrat_700Bold' }} className='text-white text-4xl font-bold '>Unlock Your Vault</Text>
                    <Image className='w-[80px] h-[80px] mt-[20px]' source={require('../assets/images/lock.png')} />
                </View>

                {/* Master Password */}
                <View className='flex mt-[10px] flex-col justify-center  items-center  w-4/5'>
                    <Text style={{ fontFamily: 'Montserrat_400Regular' }} className='text-white text-sm mr-auto font-medium '>Email</Text>
                    <TextInput
                        secureTextEntry={true}
                        style={{ fontFamily: 'Montserrat_400Regular' }}
                        onChange={(e) => setEmail(e.target.value)}
                        value={password}
                        placeholder="Email linked to your vault"
                        color={'white'}
                        placeholderTextColor={'white'}
                        height={40}
                        className='w-full p-2 mb-5 focus:border focus:border-white focus:outline-none text-white mt-[10px] bg-gray-700 rounded-lg ' />
                    <Text style={{ fontFamily: 'Montserrat_400Regular' }} className='text-white text-sm mr-auto font-medium '>Master Password</Text>
                    <TextInput
                        secureTextEntry={true}
                        style={{ fontFamily: 'Montserrat_400Regular' }}
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        placeholder="Enter Password"
                        color={'white'}
                        placeholderTextColor={'white'}
                        height={40}
                        className='w-full p-2 focus:border focus:border-white focus:outline-none text-white mt-[10px] bg-gray-700 rounded-lg ' />
                </View>

                {/* Unlock Button */}
                <View className='mt-[10px] flex justify-center items-center w-4/5 '>
                    <TouchableOpacity
                        onPress={handleUnlock}
                        className='w-full m-auto flex justify-center items-center p-3 text-white mt-[10px] bg-[#5783F3] rounded-md p-2'
                    >
                        <Text style={{ fontFamily: 'Montserrat_700Bold' }} className='text-white font-semibold text-xl'>Unlock</Text>
                    </TouchableOpacity>
                </View>

                <Text style={{ fontFamily: 'Montserrat_400Regular' }} className='text-white text-sm  font-medium mt-[20px]'>Or</Text>

                {/* Finger print or biometrics */}
                <View>

                </View>
                {/* Sign Up Button */}
                <View className='mt-[20px] flex justify-center items-center w-4/5'>
                    <View className=' flex flex-row gap-[100px] justify-center items-center  '>

                        <TouchableOpacity><FingerprintPattern color={'white'} strokeWidth={1.5} size={40} /></TouchableOpacity>
                        <TouchableOpacity><ScanFace color={'white'} strokeWidth={1.5} size={40} /></TouchableOpacity>
                    </View>
                    <Text style={{ fontFamily: 'Montserrat_400Regular' }} className='text-white text-lg  font-medium mt-[20px]'>Unlock with Biometrics</Text>
                </View>

                <TouchableOpacity
                    onPress={handleCreateMasterPassword}
                >
                    <Text style={{ fontFamily: 'Montserrat_400Regular' }} className='text-sm border-b-[0.5px]  text-blue-500 border-white  font-medium mt-[20px]'>Create Master Password</Text>
                </TouchableOpacity>

                {/* Bottom Text */}
                <View className='flex-row w-4/5 justify-center items-center absolute bottom-[40px]'>
                    <MessageCircleWarning size={20} color={'white'} strokeWidth={2} /><Text className='ml-[10px] justify-center items-center flex text-white  font-mono'>Your master password never leaves your device</Text>
                </View>




            </View>

        </LinearGradient>
    )
}

export default Login
