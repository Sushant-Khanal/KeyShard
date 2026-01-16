import { View, Text, TouchableOpacity } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { House, RotateCcwKey, ShieldCheck } from 'lucide-react-native'
import { navigate } from 'expo-router/build/global-state/routing'

const Footer = ({ currentPage }) => {
    const [current, setCurrent] = useState('')

    useEffect(() => {

        setCurrent(currentPage)



    }, [current])

    function handleCurrent() {
        setCurrent(current)
    }

    function handleChange(value) {

        value === 'home' ? navigate('./home') : value === 'generator' ? navigate('./Generator') : navigate('./Security')
    }
    return (
        <View className="  fixed bottom-0 w-full bg-[#38373766] border-t-[1px] h-[60px]  border-white">
            <View className="flex flex-row justify-between items-center px-5 py-3 ">
                <TouchableOpacity onPress={() => handleChange('home')} className="flex justify-center items-center">

                    <House color={`${current === 'home' ? '#2e85db' : 'white'}`} strokeWidth={1.5} />
                    <Text style={{ fontFamily: 'Montserrat_400Regular', fontSize: 14 }} className={`${current === 'home' ? 'text-[#2e85db]' : 'text-white'}`}>

                        Home
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleChange('generator')} className="flex justify-center items-center">
                    <RotateCcwKey color={`${current === 'generator' ? '#2e85db' : 'white'}`} strokeWidth={1.5} />
                    <Text style={{ fontFamily: 'Montserrat_400Regular', fontSize: 14 }} className={`${current === 'generator' ? 'text-[#2e85db]' : 'text-white'}`}>

                        Generator
                    </Text>
                </TouchableOpacity >
                <TouchableOpacity onPress={() => handleChange('security')} className="flex justify-center items-center">
                    <ShieldCheck color={`${current === 'security' ? '#2e85db' : 'white'}`} strokeWidth={1.5} />
                    <Text style={{ fontFamily: 'Montserrat_400Regular', fontSize: 14 }} className={`${current === 'security' ? 'text-[#2e85db]' : 'text-white'}`}>

                        Security
                    </Text>
                </TouchableOpacity >
            </View>
        </View>
    )
}

export default Footer