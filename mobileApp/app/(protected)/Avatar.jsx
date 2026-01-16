import { TouchableOpacity, View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { getSession, clearSession } from '../security/secureStore'
import { SvgUri } from 'react-native-svg'
import { LogOut } from 'lucide-react-native'
import { useRouter } from 'expo-router'

const Avatar = () => {
    const [userHash, setUserHash] = useState('')
    const [active, setActive] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const session = getSession()
        if (session?.userHash) {
            setUserHash(session.userHash)
        }
    }, [])

    function handleActive() {
        setActive((prev) => !prev)
    }

    function handleLogout() {
        clearSession()
        setActive(false)
        router.replace('/')
    }

    if (!userHash) return null

    return (
        <View className="absolute top-2 right-2 z-50">
            <TouchableOpacity
                onPress={handleActive}
                className="p-1 bg-white border-green-500 border-2 rounded-full"
            >
                <SvgUri
                    width={65}
                    height={65}
                    uri={`https://api.dicebear.com/9.x/adventurer/svg?seed=${userHash}`}
                />
            </TouchableOpacity>

            {active && (
                <TouchableOpacity
                    onPress={handleLogout}
                    className="absolute top-24 right-0 bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 flex-row items-center gap-2"
                >
                    <LogOut size={18} color="#ef4444" />
                    <Text className="text-red-500 font-semibold">Logout</Text>
                </TouchableOpacity>
            )}
        </View>
    )
}

export default Avatar