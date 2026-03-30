import { TouchableOpacity, View, Text, Modal, Pressable, StatusBar, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { getSession, clearSession } from '../security/secureStore'
import { SvgUri } from 'react-native-svg'
import { LogOut, Key, QrCode, User } from 'lucide-react-native'
import { useRouter } from 'expo-router'

const Avatar = () => {
    const [userHash, setUserHash] = useState('')
    const [email, setEmail] = useState('')
    const [active, setActive] = useState(false)
    const router = useRouter()

    // Compute dropdown top offset based on platform status bar
    const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44
    const dropdownTop = statusBarHeight + 62

    useEffect(() => {
        const session = getSession()
        if (session?.userHash) {
            setUserHash(session.userHash)
        }
        if (session?.email) {
            setEmail(session.email)
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
                activeOpacity={0.8}
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
                            top: dropdownTop,
                            right: 16,
                            backgroundColor: '#1a1a1a',
                            borderWidth: 1,
                            borderColor: '#333',
                            borderRadius: 14,
                            minWidth: 220,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.5,
                            shadowRadius: 16,
                            elevation: 20,
                            overflow: 'hidden',
                        }}
                    >
                        {/* Account identifier row */}
                        <View
                            style={{
                                paddingHorizontal: 18,
                                paddingVertical: 14,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 12,
                                borderBottomWidth: 1,
                                borderBottomColor: '#2a2a2a',
                                backgroundColor: '#111',
                            }}
                        >
                            <View style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                backgroundColor: 'rgba(46,133,219,0.15)',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <User size={16} color="#2e85db" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: '#555', fontSize: 10, fontWeight: '600', letterSpacing: 0.5, marginBottom: 2 }}>
                                    SIGNED IN AS
                                </Text>
                                <Text
                                    style={{ color: '#ccc', fontSize: 13, fontWeight: '500' }}
                                    numberOfLines={1}
                                    ellipsizeMode="middle"
                                >
                                    {email || userHash.substring(0, 12) + '…'}
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.7}
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
                            activeOpacity={0.7}
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
                            activeOpacity={0.7}
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