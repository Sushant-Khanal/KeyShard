import { TouchableOpacity, View, Text, Modal, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { getSession, clearSession } from '../security/secureStore'
import { SvgUri } from 'react-native-svg'
import { LogOut, Key, QrCode } from 'lucide-react-native'
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

    function handleLogout() {
        clearSession()
        setActive(false)
        router.replace('/')
    }

    if (!userHash) return null

    return (
        <View style={{ position: 'absolute', top: 8, right: 8, zIndex: 50 }}>
            <TouchableOpacity
                onPress={() => setActive(true)}
                style={{
                    padding: 4,
                    backgroundColor: 'white',
                    borderWidth: 2,
                    borderColor: '#22c55e',
                    borderRadius: 999,
                }}
            >
                <SvgUri
                    width={46}
                    height={46}
                    uri={`https://api.dicebear.com/9.x/adventurer/svg?seed=${userHash}`}
                />
            </TouchableOpacity>

            {/* Modal dropdown — never gets clipped */}
            <Modal
                visible={active}
                transparent
                animationType="fade"
                onRequestClose={() => setActive(false)}
            >
                <Pressable
                    style={{ flex: 1 }}
                    onPress={() => setActive(false)}
                >
                    <View
                        style={{
                            position: 'absolute',
                            top: 70,
                            right: 16,
                            backgroundColor: '#1a1a1a',
                            borderWidth: 1,
                            borderColor: '#333',
                            borderRadius: 14,
                            minWidth: 200,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.5,
                            shadowRadius: 16,
                            elevation: 20,
                            overflow: 'hidden',
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => {
                                setActive(false);
                                setTimeout(() => router.push('/(protected)/ChangeMasterPassword'), 150);
                            }}
                            style={{
                                paddingHorizontal: 18,
                                paddingVertical: 14,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 12,
                                borderBottomWidth: 1,
                                borderBottomColor: '#2a2a2a',
                            }}
                        >
                            <Key size={18} color="#2e85db" />
                            <Text style={{ color: '#2e85db', fontWeight: '600', fontSize: 14 }}>Change Password</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                setActive(false);
                                setTimeout(() => router.push('/(protected)/QRBackup'), 150);
                            }}
                            style={{
                                paddingHorizontal: 18,
                                paddingVertical: 14,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 12,
                                borderBottomWidth: 1,
                                borderBottomColor: '#2a2a2a',
                            }}
                        >
                            <QrCode size={18} color="#22c55e" />
                            <Text style={{ color: '#22c55e', fontWeight: '600', fontSize: 14 }}>Backup QR Code</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleLogout}
                            style={{
                                paddingHorizontal: 18,
                                paddingVertical: 14,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 12,
                            }}
                        >
                            <LogOut size={18} color="#ef4444" />
                            <Text style={{ color: '#ef4444', fontWeight: '600', fontSize: 14 }}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </View>
    )
}

export default Avatar