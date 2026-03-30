import React, { useState, useRef } from 'react'
import {
    View, Text, TextInput, TouchableOpacity,
    ScrollView, StyleSheet, Alert,
    KeyboardAvoidingView, Platform,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeft, Eye, EyeOff, QrCode, ShieldCheck, ShieldAlert, Lock } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import { useFonts, Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'
import QRCode from 'react-native-qrcode-svg'
import genMasterKey from '../security/masterPass'
import { getSession } from '../security/secureStore'

const QRBackup = () => {
    const router = useRouter()
    const [fontsLoaded] = useFonts({ Montserrat_400Regular, Montserrat_700Bold })

    const [masterPassword, setMasterPassword] = useState('')
    const [visible, setVisible] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [qrReady, setQrReady] = useState(false)
    const [verifiedPassword, setVerifiedPassword] = useState('')

    const handleGenerate = async () => {
        setError('')
        if (!masterPassword.trim()) {
            setError('Please enter your master password')
            return
        }

        setLoading(true)
        await new Promise(r => requestAnimationFrame(r))

        try {
            const session = getSession()
            if (!session?.salt || !session?.userHash) {
                setError('No active session. Please re-login.')
                setLoading(false)
                return
            }

            // Derive keys from entered password and current salt
            const { userHash: derivedHash } = await genMasterKey(masterPassword, session.salt)

            if (derivedHash !== session.userHash) {
                setError('Incorrect master password. Please try again.')
                setLoading(false)
                return
            }

            // Password verified — show QR
            setVerifiedPassword(masterPassword)
            setQrReady(true)
        } catch (e) {
            setError('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleReset = () => {
        setQrReady(false)
        setVerifiedPassword('')
        setMasterPassword('')
        setError('')
    }

    if (!fontsLoaded) return null

    return (
        <LinearGradient colors={['#0a0a0a', '#1a1a1a', '#0f0f0f']} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    <Animated.ScrollView
                        entering={FadeIn.duration(600)}
                        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.inner}>
                            {/* Back Button */}
                            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                                <ArrowLeft color="white" size={22} />
                            </TouchableOpacity>

                            {/* Header */}
                            <View style={styles.header}>
                                <View style={styles.iconCircle}>
                                    <QrCode size={32} color="#22c55e" />
                                </View>
                                <Text style={[styles.title, { fontFamily: 'Montserrat_700Bold' }]}>
                                    Vault Backup
                                </Text>
                                <Text style={[styles.subtitle, { fontFamily: 'Montserrat_400Regular' }]}>
                                    Generate a QR code to backup your master password securely
                                </Text>
                            </View>

                            {!qrReady ? (
                                <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.card}>
                                    {/* Warning */}
                                    <View style={styles.warningBox}>
                                        <ShieldAlert size={18} color="#f59e0b" />
                                        <Text style={[styles.warningText, { fontFamily: 'Montserrat_400Regular' }]}>
                                            Keep this QR code private. Anyone who scans it can access your vault.
                                        </Text>
                                    </View>

                                    <Text style={[styles.fieldLabel, { fontFamily: 'Montserrat_400Regular' }]}>
                                        CONFIRM YOUR MASTER PASSWORD
                                    </Text>

                                    <View style={styles.inputRow}>
                                        <TextInput
                                            style={[styles.input, { fontFamily: 'Montserrat_400Regular' }]}
                                            secureTextEntry={!visible}
                                            value={masterPassword}
                                            onChangeText={t => { setMasterPassword(t); setError('') }}
                                            placeholder="Enter your master password"
                                            placeholderTextColor="#555"
                                            editable={!loading}
                                        />
                                        <TouchableOpacity onPress={() => setVisible(v => !v)} style={styles.eyeBtn}>
                                            {visible ? <EyeOff size={20} color="#666" /> : <Eye size={20} color="#666" />}
                                        </TouchableOpacity>
                                    </View>

                                    {error ? (
                                        <Text style={[styles.errorText, { fontFamily: 'Montserrat_400Regular' }]}>{error}</Text>
                                    ) : null}

                                    <TouchableOpacity
                                        onPress={handleGenerate}
                                        disabled={loading || !masterPassword}
                                        style={[
                                            styles.generateBtn,
                                            { backgroundColor: (!loading && masterPassword) ? '#22c55e' : '#2a2a2a' }
                                        ]}
                                    >
                                        <QrCode size={18} color={(!loading && masterPassword) ? '#000' : '#555'} />
                                        <Text style={[
                                            styles.generateBtnText,
                                            { fontFamily: 'Montserrat_700Bold', color: (!loading && masterPassword) ? '#000' : '#555' }
                                        ]}>
                                            {loading ? 'Verifying...' : 'Generate QR Code'}
                                        </Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            ) : (
                                <Animated.View entering={FadeInDown.duration(500)} style={styles.qrSection}>
                                    {/* Success Badge */}
                                    <View style={styles.successBadge}>
                                        <ShieldCheck size={16} color="#22c55e" />
                                        <Text style={[styles.successText, { fontFamily: 'Montserrat_700Bold' }]}>
                                            Password Verified
                                        </Text>
                                    </View>

                                    {/* QR Code */}
                                    <View style={styles.qrWrapper}>
                                        <View style={styles.qrContainer}>
                                            <QRCode
                                                value={verifiedPassword}
                                                size={220}
                                                backgroundColor="white"
                                                color="#0a0a0a"
                                                quietZone={16}
                                            />
                                        </View>
                                        <Text style={[styles.qrLabel, { fontFamily: 'Montserrat_700Bold' }]}>
                                            KeyShard Master Password
                                        </Text>
                                        <Text style={[styles.qrSubLabel, { fontFamily: 'Montserrat_400Regular' }]}>
                                            Screenshot this and store it in a safe place
                                        </Text>
                                    </View>

                                    {/* Tips */}
                                    <View style={styles.tipsCard}>
                                        <Text style={[styles.tipsTitle, { fontFamily: 'Montserrat_700Bold' }]}>
                                            How to keep this safe
                                        </Text>
                                        {[
                                            '📸  Screenshot and save to a secure folder',
                                            '🖨️  Print and store in a physical safe',
                                            '☁️  Upload to encrypted cloud storage only',
                                            '🚫  Never share or send over messaging apps',
                                        ].map((tip, i) => (
                                            <Text key={i} style={[styles.tipText, { fontFamily: 'Montserrat_400Regular' }]}>
                                                {tip}
                                            </Text>
                                        ))}
                                    </View>

                                    {/* Lock it again */}
                                    <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
                                        <Lock size={16} color="#888" />
                                        <Text style={[styles.resetBtnText, { fontFamily: 'Montserrat_400Regular' }]}>
                                            Hide QR Code
                                        </Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            )}
                        </View>
                    </Animated.ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    inner: {
        flex: 1,
        width: '90%',
        alignSelf: 'center',
        paddingTop: 16,
    },
    backBtn: {
        padding: 10,
        alignSelf: 'flex-start',
        marginBottom: 8,
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#2a2a2a',
        borderRadius: 12,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 8,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(34,197,94,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(34,197,94,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 26,
        color: '#fff',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 13,
        color: '#888',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 16,
    },
    card: {
        backgroundColor: '#1a1a1a',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        backgroundColor: 'rgba(245,158,11,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(245,158,11,0.2)',
        borderRadius: 12,
        padding: 14,
        marginBottom: 24,
    },
    warningText: {
        color: '#f59e0b',
        fontSize: 13,
        flex: 1,
        lineHeight: 20,
    },
    fieldLabel: {
        color: '#666',
        fontSize: 11,
        letterSpacing: 1,
        marginBottom: 10,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0f0f0f',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#333',
        paddingHorizontal: 16,
        marginBottom: 14,
    },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: 15,
        paddingVertical: 14,
    },
    eyeBtn: {
        padding: 6,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 13,
        marginBottom: 14,
    },
    generateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 16,
        borderRadius: 14,
    },
    generateBtnText: {
        fontSize: 15,
    },
    qrSection: {
        alignItems: 'center',
        gap: 20,
    },
    successBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(34,197,94,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(34,197,94,0.25)',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    successText: {
        color: '#22c55e',
        fontSize: 13,
    },
    qrWrapper: {
        alignItems: 'center',
        gap: 12,
    },
    qrContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 16,
        shadowColor: '#22c55e',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    qrLabel: {
        color: '#fff',
        fontSize: 16,
        marginTop: 4,
    },
    qrSubLabel: {
        color: '#888',
        fontSize: 13,
        textAlign: 'center',
    },
    tipsCard: {
        width: '100%',
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        gap: 10,
    },
    tipsTitle: {
        color: '#fff',
        fontSize: 14,
        marginBottom: 4,
    },
    tipText: {
        color: '#aaa',
        fontSize: 13,
        lineHeight: 22,
    },
    resetBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333',
    },
    resetBtnText: {
        color: '#888',
        fontSize: 13,
    },
})

export default QRBackup
