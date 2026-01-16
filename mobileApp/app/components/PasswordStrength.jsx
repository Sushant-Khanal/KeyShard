import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { calculateStrength } from '../security/strength';

const PasswordStrength = ({ password }) => {
    const [passwordStrength, setPasswordStrength] = useState("strong");
    const suggestions = {
        min: 'Minimum 12 characters required',
        uppercase: 'At least 1 uppercase letter (A–Z)',
        lowercase: 'At least 1 lowercase letter (a–z)',
        digits: 'At least 2 numbers (0–9)',
        symbols: 'At least 2 special characters (!@#$…)',
        spaces: 'No spaces allowed',
        oneOf: 'Password must not be common or easily guessed'
    }

    const [list, setList] = useState([])

    useEffect(() => {
        const reply = calculateStrength(password)
        setList(reply)
        console.log(reply)

        if (password.length >= 16 && reply.length === 0) {
            setPasswordStrength('excellent')
        } else if (reply.length <= 2 && !reply.includes('min') && !reply.includes('symbols')) {
            setPasswordStrength('strong')
        } else if (reply.length <= 5 && !reply.includes('uppercase') && !reply.includes('lowercase')) {
            setPasswordStrength('medium')
        } else {
            setPasswordStrength('weak')
        }

    }, [password])

    return (
        <View>
            {(passwordStrength && password.length > 0) && (
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

            {(list.length > 0 && password.length > 0) && (<View className='flex mt-6 w-full justify-center items-center'>
                {list.map((value, index) => (

                    < Text key={index} style={{ fontFamily: 'Montserrat_400Regular', fontSize: 12 }} className='text-white mt-1 mr-auto font-medium'>●  {suggestions[value]}</Text>
                ))}
            </View>)
            }
        </View >
    )
}

export default PasswordStrength