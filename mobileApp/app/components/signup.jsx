import { LinearGradient } from 'expo-linear-gradient';
import { Key } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Text, TextInput, View, Button, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { useFonts, Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { navigate } from 'expo-router/build/global-state/routing'
import genMasterKey from '../security/masterPass';







const SignUp = () => {
    const [password, setPassword] = useState('');
    const [passwordStrength, setPasswordStrength] = useState("medium");
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false)
    const [masterKey, setMasterKey] = useState();
    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_700Bold,
    })
    const suggestions = ['Add special characters', 'Use both upper & lower case']

    useEffect(() => {

    }, [passwordStrength]);

    const handleSignUp = async () => {

        if (!password?.length) return
        setLoading(true)
        const masterKey = genMasterKey(password);
        setMasterKey(masterKey)
        console.log("Hexadecimal: ", masterKey);
        setLoading(false)
    }

    return (
        <LinearGradient
            colors={['#1b2125ff', '#051629ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-1 relative justify-center items-center">
            <View className='min-h-screen border-b border-blue-500 pt[20px] w-4/5  relative justify-center items-center'>
                {/* Top Logo */}
                <View className='flex-row absolute border-b border-blue-500 py-1 top-[90px] items-center '>
                    <Key color={'white'} size={35} strokeWidth={2} />
                    <Text style={{ fontFamily: 'Montserrat_700Bold' }} className='text-white  text-3xl ml-[8px] '>KeyShards</Text>
                </View>

                {/* Middle Logo */}
                <View className='flex justify-center items-center'>
                    <Text style={{ fontFamily: 'Montserrat_700Bold' }} className='text-white justify-center items-center text-4xl font-bold '>Create Your Master </Text>
                    <Text style={{ fontFamily: 'Montserrat_700Bold' }} className='text-white justify-center items-center text-4xl font-bold '>Password</Text>
                </View>

                {/* Info */}
                <View className='flex justify-center items-center mt-[20px]'>
                    <Text style={{ fontFamily: 'Montserrat_400Regular' }} className='text-white justify-center items-center text-sm font-medium '>This password encrypts your entire vault.</Text>
                    <Text style={{ fontFamily: 'Montserrat_400Regular' }} className='text-white justify-center items-center text-sm font-medium '>We cannot recover it.</Text>
                </View>

                <View className='flex   w-full justify-center items-center mt-[30px]'>
                    <View className='flex w-full  justify-center items-center'>
                        <Text style={{ fontFamily: 'Montserrat_400Regular' }} className='mr-auto text-white text-sm font-medium ' >New Master Password</Text>
                        <TextInput
                            secureTextEntry={false}
                            style={{ fontFamily: 'Montserrat_400Regular' }}
                            onChangeText={(text) => setPassword(text)}
                            value={password}
                            placeholder="Enter Password"
                            color={'white'}
                            placeholderTextColor={'white'}
                            height={40}
                            className='w-full p-2  text-white mt-[10px] bg-gray-700  focus:border focus:border-white focus:outline-none rounded-lg p-2'
                        />
                    </View>
                    <View className='flex mt-[20px] w-full justify-center items-center'>
                        <Text style={{ fontFamily: 'Montserrat_400Regular' }} className='mr-auto text-white text-sm font-medium ' >Confirm Password</Text>
                        <TextInput
                            secureTextEntry={false}
                            style={{ fontFamily: 'Montserrat_400Regular' }}
                            onChangeText={(text) => setConfirmPassword(text)}
                            value={confirmPassword}
                            placeholder="Re-Enter Password"
                            color={'white'}
                            placeholderTextColor={'white'}
                            height={40}
                            className='w-full p-2  text-white mt-[10px] bg-gray-700 focus:border focus:border-white focus:outline-none  rounded-lg p-2'
                        />
                    </View>
                </View>

                {/* Password Strength */}
                <View className='flex mt-[30px] w-full justify-center items-center'>

                    <Text style={{ fontFamily: 'Montserrat_400Regular' }} className='text-white mr-auto text-sm font-medium '>Password Strength</Text>


                    {passwordStrength && (
                        <View className='flex w-full flex-row gap-[10px] justify-center items-center'>
                            <View className='w-4/5 h-[20px] flex flex-row justify-center border  items-center bg-gray-700 rounded-lg  mt-[5px]'>
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
                            <Text style={{ fontFamily: 'Montserrat_400Regular' }} className='text-white text-sm font-medium'>
                                {passwordStrength.toUpperCase()}
                            </Text>


                        </View>
                    )}

                </View>


                {/* Suggestions */}

                <View className='flex mt-[30px] w-full justify-center items-center'>
                    {suggestions.map((suggestion, index) => (
                        <Text key={index} style={{ fontFamily: 'Montserrat_400Regular' }} className='text-white mt-[5px] mr-auto text-md font-medium '>●  {suggestion}</Text>
                    ))}
                </View>

                <View>
                    {masterKey && <Text style={{ fontFamily: 'Montserrat_400Regular' }} className='text-white mt-[5px] mr-auto text-md font-medium '>Master Key: {masterKey}</Text>}
                </View>

                {/* Botttom Button */}
                <TouchableOpacity
                    onPress={handleSignUp}
                    className='w-full absolute bottom-[20px] m-auto flex justify-center items-center p-3 text-white mt-[10px] bg-[#5783F3] rounded-md p-2'
                >
                    <Text style={{ fontFamily: 'Montserrat_700Bold' }} className='text-white font-semibold text-xl'>Create Vault</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
};



export default SignUp;

