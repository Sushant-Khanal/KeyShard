import React, { useState, useEffect, useCallback } from 'react'
import {
    View, Text, ScrollView, StyleSheet,
    TouchableOpacity, RefreshControl,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
    ShieldCheck, ShieldAlert, ShieldX, RefreshCw,
    KeyRound, Clock, Copy,
} from 'lucide-react-native'
import { useFonts, Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'
import Avatar from './Avatar'
import Footer from './Footer'
import { getSession } from '../security/secureStore'
import { decryptPassword } from '../security/aesEncryption'
import { fromByteArray } from 'react-native-quick-base64'
import { analyzePasswordStrength } from '../security/passwordStrengthModel'
import Constants from 'expo-constants'

const STALE_DAYS = 90

function daysSince(dateStr) {
    if (!dateStr) return 0
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
}

function findDuplicates(passwords) {
    const seen = {}
    passwords.forEach(p => {
        const val = String(p.password || '').trim()
        if (!val) return
        if (!seen[val]) seen[val] = []
        seen[val].push(p.title || 'Untitled')
    })
    return Object.entries(seen)
        .filter(([, titles]) => titles.length > 1)
        .map(([, titles]) => titles)
}

const Dashboard = () => {
    const { localhost } = Constants.expoConfig?.extra ?? {}
    const [fontsLoaded] = useFonts({ Montserrat_400Regular, Montserrat_700Bold })

    const [passwords, setPasswords] = useState([])
    const [analysis, setAnalysis] = useState({})   // { id: { strength, recommendations } }
    const [analysisReady, setAnalysisReady] = useState(false) // true once analysis is complete
    const [vaultStatus, setVaultStatus] = useState('loading') // loading | done | error
    const [refreshing, setRefreshing] = useState(false)

    // ─── Fetch vault ───────────────────────────────────────────────────────────
    const fetchVault = useCallback(async () => {
        setVaultStatus('loading')
        try {
            const session = getSession()
            if (!session?.vaultKey || !session?.userHash) {
                setVaultStatus('error')
                return
            }

            const res = await fetch(`${localhost}/api/passFetch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userHash: session.userHash }),
            })
            const result = await res.json()
            if (!res.ok || !result.message) { setVaultStatus('error'); return }

            const { encryptedVault, iv, tag } = result.message
            const decrypted = await decryptPassword(encryptedVault, fromByteArray(session.vaultKey), iv, tag)
            if (!decrypted) { setVaultStatus('error'); return }

            const parsed = JSON.parse(decrypted)
            setPasswords(Array.isArray(parsed) ? parsed : [])
            setVaultStatus('done')
        } catch {
            setVaultStatus('error')
        }
    }, [localhost])

    // ─── Analyze all passwords via strength model ──────────────────────────────
    const analyzeAll = useCallback(async (pwList) => {
        if (!pwList || pwList.length === 0) return
        setAnalysisReady(false)

        const results = {}
        for (let i = 0; i < pwList.length; i++) {
            const item = pwList[i]
            if (!item?.password) {
                results[item.id] = { strength: 'weak', recommendations: ['No password set'] }
            } else {
                const res = await analyzePasswordStrength(String(item.password), undefined)
                results[item.id] = res
            }
        }

        setAnalysis(results)
        setAnalysisReady(true)
    }, [])

    // ─── Pull everything together on load ──────────────────────────────────────
    useEffect(() => {
        fetchVault()
    }, [fetchVault])

    useEffect(() => {
        if (vaultStatus === 'done' && passwords.length > 0) {
            analyzeAll(passwords)
        } else if (vaultStatus === 'done' && passwords.length === 0) {
            setAnalysisReady(true)
        }
    }, [vaultStatus, passwords, analyzeAll])

    const onRefresh = async () => {
        setRefreshing(true)
        setAnalysis({})
        setAnalysisReady(false)
        await fetchVault()
        setRefreshing(false)
    }

    // ─── Derived stats ─────────────────────────────────────────────────────────
    const weakList = passwords.filter(p => analysis[p.id]?.strength === 'weak')
    const mediumList = passwords.filter(p => analysis[p.id]?.strength === 'medium')
    const strongList = passwords.filter(p => analysis[p.id]?.strength === 'strong')
    const staleList = passwords.filter(p => daysSince(p.createdAt) >= STALE_DAYS)
    const duplicateGroups = findDuplicates(passwords)
    const duplicateCount = duplicateGroups.reduce((n, g) => n + g.length, 0)

    const scored = analysisReady && passwords.length > 0
    const total = passwords.length
    const rawScore = total === 0 ? 100
        : Math.max(0, Math.round(
            (strongList.length / total) * 60 +
            (mediumList.length / total) * 30 -
            (weakList.length / total) * 40 -
            (staleList.length / total) * 20 -
            (duplicateCount / total) * 15
        ))
    const score = Math.min(100, Math.max(0, rawScore))

    const scoreColor = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'
    const scoreLabel = score >= 70 ? 'Good' : score >= 40 ? 'Fair' : 'At Risk'
    const ScoreIcon = score >= 70 ? ShieldCheck : score >= 40 ? ShieldAlert : ShieldX

    if (!fontsLoaded) return null

    return (
        <LinearGradient colors={['#0a0a0a', '#1a1a1a', '#0f0f0f']} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
                <Animated.View entering={FadeIn.duration(600)} style={{ flex: 1, width: '90%', alignSelf: 'center' }}>
                    <Avatar />

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { fontFamily: 'Montserrat_700Bold' }]}>Security Dashboard</Text>
                        <Text style={[styles.subtitle, { fontFamily: 'Montserrat_400Regular' }]}>
                            Your vault security at a glance
                        </Text>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 120, paddingTop: 12 }}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor="#2e85db"
                                colors={['#2e85db']}
                            />
                        }
                    >

                        {/* ── Security Score Ring ── */}
                        <Animated.View entering={FadeInDown.duration(400).delay(50)} style={styles.scoreCard}>
                            <View style={[styles.scoreRing, { borderColor: scoreColor }]}>
                                <ScoreIcon size={28} color={scoreColor} />
                                <Text style={[styles.scoreNumber, { fontFamily: 'Montserrat_700Bold', color: scoreColor }]}>
                                    {scored ? score : '--'}
                                </Text>
                                <Text style={[styles.scoreOf, { fontFamily: 'Montserrat_400Regular' }]}>/100</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.scoreLabel, { fontFamily: 'Montserrat_700Bold', color: scored ? scoreColor : '#555' }]}>
                                    {scored ? scoreLabel : 'Analyzing…'}
                                </Text>
                                <Text style={[styles.scoreDesc, { fontFamily: 'Montserrat_400Regular' }]}>
                                    {total} password{total !== 1 ? 's' : ''} in vault
                                </Text>
                                {analysisReady && (
                                    <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
                                        <RefreshCw size={13} color="#2e85db" />
                                        <Text style={[styles.refreshText, { fontFamily: 'Montserrat_400Regular' }]}>Refresh</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </Animated.View>

                        {/* ── Stat Grid ── */}
                        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.grid}>
                            <StatCard
                                icon={<ShieldX size={20} color="#ef4444" />}
                                value={scored ? weakList.length : '--'}
                                label="Weak"
                                bg="rgba(239,68,68,0.08)"
                                border="rgba(239,68,68,0.2)"
                                valueColor="#ef4444"
                            />
                            <StatCard
                                icon={<ShieldAlert size={20} color="#f59e0b" />}
                                value={scored ? mediumList.length : '--'}
                                label="Medium"
                                bg="rgba(245,158,11,0.08)"
                                border="rgba(245,158,11,0.2)"
                                valueColor="#f59e0b"
                            />
                            <StatCard
                                icon={<ShieldCheck size={20} color="#22c55e" />}
                                value={scored ? strongList.length : '--'}
                                label="Strong"
                                bg="rgba(34,197,94,0.08)"
                                border="rgba(34,197,94,0.2)"
                                valueColor="#22c55e"
                            />
                            <StatCard
                                icon={<Clock size={20} color="#a78bfa" />}
                                value={staleList.length}
                                label={`>${STALE_DAYS}d old`}
                                bg="rgba(167,139,250,0.08)"
                                border="rgba(167,139,250,0.2)"
                                valueColor="#a78bfa"
                            />
                            <StatCard
                                icon={<Copy size={20} color="#60a5fa" />}
                                value={duplicateCount}
                                label="Reused"
                                bg="rgba(96,165,250,0.08)"
                                border="rgba(96,165,250,0.2)"
                                valueColor="#60a5fa"
                            />
                            <StatCard
                                icon={<KeyRound size={20} color="#888" />}
                                value={total}
                                label="Total"
                                bg="#1a1a1a"
                                border="#2a2a2a"
                                valueColor="#fff"
                            />
                        </Animated.View>

                        {/* ── Weak Passwords List ── */}
                        {scored && weakList.length > 0 && (
                            <Animated.View entering={FadeInDown.duration(400).delay(150)}>
                                <SectionHeader label="WEAK PASSWORDS" color="#ef4444" />
                                <View style={styles.listCard}>
                                    {weakList.map((item, i) => (
                                        <IssueRow
                                            key={item.id}
                                            title={item.title || 'Untitled'}
                                            detail={analysis[item.id]?.recommendations?.[0] || 'Improve this password'}
                                            accentColor="#ef4444"
                                            icon={<ShieldX size={16} color="#ef4444" />}
                                            last={i === weakList.length - 1}
                                        />
                                    ))}
                                </View>
                            </Animated.View>
                        )}

                        {/* ── Stale Passwords List ── */}
                        {staleList.length > 0 && (
                            <Animated.View entering={FadeInDown.duration(400).delay(200)}>
                                <SectionHeader label={`NOT UPDATED IN ${STALE_DAYS}+ DAYS`} color="#a78bfa" />
                                <View style={styles.listCard}>
                                    {staleList.map((item, i) => (
                                        <IssueRow
                                            key={item.id}
                                            title={item.title || 'Untitled'}
                                            detail={`${daysSince(item.createdAt)} days since created`}
                                            accentColor="#a78bfa"
                                            icon={<Clock size={16} color="#a78bfa" />}
                                            last={i === staleList.length - 1}
                                        />
                                    ))}
                                </View>
                            </Animated.View>
                        )}

                        {/* ── Reused Passwords List ── */}
                        {duplicateGroups.length > 0 && (
                            <Animated.View entering={FadeInDown.duration(400).delay(250)}>
                                <SectionHeader label="REUSED PASSWORDS" color="#60a5fa" />
                                <View style={styles.listCard}>
                                    {duplicateGroups.map((group, i) => (
                                        <IssueRow
                                            key={i}
                                            title={group.join(', ')}
                                            detail="These accounts share the same password"
                                            accentColor="#60a5fa"
                                            icon={<Copy size={16} color="#60a5fa" />}
                                            last={i === duplicateGroups.length - 1}
                                        />
                                    ))}
                                </View>
                            </Animated.View>
                        )}

                        {/* ── All Clear State ── */}
                        {scored && weakList.length === 0 && staleList.length === 0 && duplicateGroups.length === 0 && total > 0 && (
                            <Animated.View entering={FadeInDown.duration(400).delay(150)} style={styles.allClearCard}>
                                <ShieldCheck size={36} color="#22c55e" />
                                <Text style={[styles.allClearTitle, { fontFamily: 'Montserrat_700Bold' }]}>All Clear!</Text>
                                <Text style={[styles.allClearDesc, { fontFamily: 'Montserrat_400Regular' }]}>
                                    No weak, stale, or reused passwords found. Your vault is in great shape.
                                </Text>
                            </Animated.View>
                        )}

                        {/* ── Empty vault ── */}
                        {total === 0 && vaultStatus === 'done' && (
                            <Animated.View entering={FadeInDown.duration(400).delay(150)} style={styles.allClearCard}>
                                <KeyRound size={36} color="#555" />
                                <Text style={[styles.allClearTitle, { fontFamily: 'Montserrat_700Bold', color: '#888' }]}>
                                    Vault is empty
                                </Text>
                                <Text style={[styles.allClearDesc, { fontFamily: 'Montserrat_400Regular' }]}>
                                    Add passwords on the Home tab to see your security report here.
                                </Text>
                            </Animated.View>
                        )}
                    </ScrollView>
                </Animated.View>
                <Footer currentPage="dashboard" />
            </SafeAreaView>
        </LinearGradient>
    )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({ icon, value, label, bg, border, valueColor }) {
    return (
        <View style={[styles.statCard, { backgroundColor: bg, borderColor: border }]}>
            {icon}
            <Text style={[styles.statValue, { color: valueColor, fontFamily: 'Montserrat_700Bold' }]}>
                {value}
            </Text>
            <Text style={[styles.statLabel, { fontFamily: 'Montserrat_400Regular' }]}>{label}</Text>
        </View>
    )
}

function SectionHeader({ label, color }) {
    return (
        <Text style={[styles.sectionHeader, { color, fontFamily: 'Montserrat_700Bold' }]}>{label}</Text>
    )
}

function IssueRow({ title, detail, accentColor, icon, last }) {
    return (
        <View style={[styles.issueRow, !last && styles.issueRowBorder]}>
            <View style={[styles.issueIcon, { backgroundColor: `${accentColor}15` }]}>
                {icon}
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.issueTitle, { fontFamily: 'Montserrat_700Bold' }]}
                    numberOfLines={1}>{title}</Text>
                <Text style={[styles.issueDetail, { fontFamily: 'Montserrat_400Regular' }]}
                    numberOfLines={2}>{detail}</Text>
            </View>
        </View>
    )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    header: { marginTop: 10, marginBottom: 4 },
    title: { fontSize: 28, color: '#fff', letterSpacing: -0.5 },
    subtitle: { fontSize: 13, color: '#888', marginTop: 4 },

    scoreCard: {
        flexDirection: 'row', alignItems: 'center', gap: 20,
        backgroundColor: '#1a1a1a', borderRadius: 20, padding: 20,
        borderWidth: 1, borderColor: '#2a2a2a', marginBottom: 16,
    },
    scoreRing: {
        width: 90, height: 90, borderRadius: 45,
        borderWidth: 3, alignItems: 'center',
        justifyContent: 'center', gap: 0,
    },
    scoreNumber: { fontSize: 24, lineHeight: 28 },
    scoreOf: { color: '#555', fontSize: 11, marginTop: -4 },
    scoreLabel: { fontSize: 20, marginBottom: 4 },
    scoreDesc: { color: '#666', fontSize: 12, marginBottom: 8 },
    refreshBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    refreshText: { color: '#2e85db', fontSize: 12 },
    grid: {
        flexDirection: 'row', flexWrap: 'wrap', gap: 10,
        marginBottom: 16,
    },
    statCard: {
        width: '30.5%', borderRadius: 14, padding: 14,
        borderWidth: 1, alignItems: 'center', gap: 6,
    },
    statValue: { fontSize: 22 },
    statLabel: { color: '#888', fontSize: 11 },
    listCard: {
        backgroundColor: '#1a1a1a', borderRadius: 16,
        borderWidth: 1, borderColor: '#2a2a2a', marginBottom: 14,
        overflow: 'hidden',
    },
    sectionHeader: { fontSize: 11, letterSpacing: 1, marginBottom: 8, marginTop: 8 },
    issueRow: {
        flexDirection: 'row', alignItems: 'center',
        gap: 12, padding: 14,
    },
    issueRowBorder: { borderBottomWidth: 1, borderBottomColor: '#252525' },
    issueIcon: {
        width: 36, height: 36, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center',
    },
    issueTitle: { color: '#fff', fontSize: 14, marginBottom: 2 },
    issueDetail: { color: '#888', fontSize: 12, lineHeight: 18 },
    allClearCard: {
        alignItems: 'center', gap: 12,
        backgroundColor: '#1a1a1a', borderRadius: 20,
        padding: 32, borderWidth: 1, borderColor: '#2a2a2a',
        marginTop: 8, marginBottom: 16,
    },
    allClearTitle: { color: '#22c55e', fontSize: 20 },
    allClearDesc: { color: '#666', fontSize: 13, textAlign: 'center', lineHeight: 20 },
})

export default Dashboard
