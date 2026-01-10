import React, { useState } from "react";
import LottieView from "lottie-react-native";
import { View } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';


export default function Splash({ setIsLoading }) {
    const [stage, setStage] = useState('shield')

    const handleShieldFinish = () => {
        setStage('welcome')
    }

    const handleWelcomeFinish = () => {
        setIsLoading(false)
    }

    const gradient = (
        <LinearGradient
            colors={['#434343', '#000000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-1"
        >
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                {stage === 'shield' && (
                    <LottieView
                        source={require('../../assets/Shield icon.json')}
                        autoPlay
                        loop={false}
                        style={{ width: '100%', height: '100%' }}
                        onAnimationFinish={handleShieldFinish}
                    />
                )}

                {stage === 'welcome' && (
                    <LottieView
                        source={require('../../assets/Welcome.json')}
                        autoPlay
                        loop={false}
                        speed={1.7}
                        style={{ width: '100%', height: '100%' }}
                        onAnimationFinish={handleWelcomeFinish}
                    />
                )}
            </View>
        </LinearGradient>
    )

    return gradient
}