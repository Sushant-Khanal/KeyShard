import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { calculateStrength } from '../security/strength.js';

const suggestions = {
    min: 'Minimum 12 characters required',
    uppercase: 'At least 1 uppercase letter (A–Z)',
    lowercase: 'At least 1 lowercase letter (a–z)',
    digits: 'At least 2 numbers (0–9)',
    symbols: 'At least 2 special characters (!@#$…)',
    spaces: 'No spaces allowed',
    oneOf: 'Password must not be common or easily guessed'
}

const PasswordStrength = ({ password, onStrengthChange }) => {
    const [passwordStrength, setPasswordStrength] = useState("");
    const [feedback, setFeedback] = useState("");

    useEffect(() => {
        if (password.length === 0) {
            setPasswordStrength("");
            setFeedback("");
            if (onStrengthChange) onStrengthChange(true);
            return;
        }

        const failedRules = calculateStrength(password);
        let strength = '';
        let isStrong = false;

        if (password.length >= 16 && failedRules.length === 0) {
            strength = 'strong';
            isStrong = true;
        } else if (failedRules.length <= 2 && !failedRules.includes('min') && !failedRules.includes('symbols')) {
            strength = 'medium';
            isStrong = true;
        } else {
            strength = 'weak';
            isStrong = false;
        }

        setPasswordStrength(strength);

        // Set feedback based on the first failed rule
        if (failedRules.length > 0) {
            setFeedback(suggestions[failedRules[0]] || '');
        } else {
            setFeedback('');
        }

        if (onStrengthChange) onStrengthChange(isStrong);
    }, [password]);

    return (
        <View>
            {(password.length > 0) && (
                <View className='flex w-full flex-row gap-2 justify-center items-center mt-2'>
                    <View className='flex-1 h-5 flex flex-row justify-center border items-center bg-gray-700 rounded-lg'>
                        {passwordStrength === 'weak' ? (
                            <View className="w-1/3 h-full mr-auto rounded-lg bg-red-500" />
                        ) : passwordStrength === 'medium' ? (
                            <View className="w-2/3 h-full mr-auto rounded-lg bg-yellow-500" />
                        ) : passwordStrength === 'strong' ? (
                            <View className="w-full h-full mr-auto rounded-lg bg-green-500" />
                        ) : (
                            <View className="w-1/4 h-full mr-auto rounded-lg bg-gray-500" />
                        )}
                    </View>
                    <Text style={{ fontFamily: 'Montserrat_400Regular', fontSize: 12 }} className='text-white font-medium'>
                        {passwordStrength.toUpperCase()}
                    </Text>
                </View>
            )}

            {(feedback && password.length > 0 && passwordStrength !== 'strong') && (
                <View className='flex mt-4 w-full justify-center items-center'>
                    <Text style={{ fontFamily: 'Montserrat_400Regular', fontSize: 12 }} className='text-white mt-1 mr-auto font-medium'>
                        💡 {feedback}
                    </Text>
                </View>
            )}
        </View>
    )
}

export default PasswordStrength