import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect, useState } from 'react'
import { Text, Image, View, TouchableOpacity, ScrollView, TextInput, Alert, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Key, Lock, ShieldCheck, Search, Eye, EyeOff, Mail, Phone, Calendar, Tag, ChevronDown, ChevronUp, Trash2, Edit2, Globe } from 'lucide-react-native'
import { useFonts, Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { getSession } from '../security/secureStore'
import { encryptPassword } from '../security/aesEncryption'
import { fromByteArray, toByteArray } from 'react-native-quick-base64'
import Constants from 'expo-constants'
import { ed } from '../security/signatureEd'
import PasswordForm from '../components/PasswordForm'
import Animated, { FadeInDown, FadeIn, FadeOutUp, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

const Home = () => {
    const { localhost } = Constants.expoConfig?.extra ?? {}
    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_700Bold,
    })

    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('All')
    const [password, setPassword] = useState([])
    const [visibleId, setVisibleId] = useState(null)
    const [openId, setOpenId] = useState(null)
    const [editingId, setEditingId] = useState(null)
    const [editValues, setEditValues] = useState({})


    function handleUpdatedPassword(data) {
        if (Array.isArray(data)) {
            setPassword(data)
        }
    }

    const handleDelete = (itemId) => {
        Alert.alert(
            'Delete Password',
            'Are you sure you want to delete this password? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const session = getSession()
                            const updatedPasswords = password.filter(p => p.id !== itemId)

                            const encrypt = await encryptPassword(JSON.stringify(updatedPasswords), fromByteArray(session?.vaultKey))
                            if (!encrypt) {
                                Alert.alert('Error', 'Failed to encrypt your vault')
                                return
                            }

                            const { encryptedVault, iv, tag } = encrypt

                            const { userHash } = getSession()
                            const response1 = await fetch(`${localhost}/api/challengeCreate`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ userHash: userHash })
                            })
                            const result1 = await response1.json()

                            if (!response1.ok) {
                                Alert.alert('Error', result1.message || 'Failed to create challenge')
                                return
                            }

                            const { challengeB64, challengeIdB64 } = result1.message
                            const challenge = toByteArray(challengeB64)
                            const privateKey = session?.privateKey
                            const signature = await ed.signAsync(challenge, privateKey);
                            const signatureB64 = fromByteArray(signature)

                            const response = await fetch(`${localhost}/api/newPassword`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    encryptedVault: encryptedVault,
                                    iv: iv,
                                    tag: tag,
                                    userHash: session.userHash,
                                    signatureB64: signatureB64,
                                    challengeIdB64: challengeIdB64
                                })
                            })

                            const result = await response.json()
                            if (!response.ok) {
                                Alert.alert('Error', result.message || 'Failed to delete password')
                                return
                            }

                            setPassword(updatedPasswords)
                            Alert.alert('Success', 'Password deleted successfully')
                        } catch (error) {
                            console.log('Delete error:', error)
                            Alert.alert('Error', 'Failed to delete password')
                        }
                    }
                }
            ]
        )
    }

    const handleEditStart = (item) => {
        setEditingId(item.id)
        setEditValues({
            password: item.password,
            username: item.username,
            url: item.url,
            category: item.category,
            notes: item.notes,
            tags: item.tags,
            recoveryEmail: item.recoveryEmail,
            recoveryPhone: item.recoveryPhone
        })
    }

    const handleEditSave = async (itemId) => {
        try {
            const session = getSession()
            const updatedPasswords = password.map(p =>
                p.id === itemId
                    ? { ...p, ...editValues }
                    : p
            )

            const encrypt = await encryptPassword(JSON.stringify(updatedPasswords), fromByteArray(session?.vaultKey))
            if (!encrypt) {
                Alert.alert('Error', 'Failed to encrypt your vault')
                return
            }

            const { encryptedVault, iv, tag } = encrypt

            const { userHash } = getSession()
            const response1 = await fetch(`${localhost}/api/challengeCreate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userHash: userHash })
            })
            const result1 = await response1.json()
            console.log("result1", result1)
            if (!response1.ok) {
                Alert.alert('Error', result1.message || 'Failed to create challenge')
                return
            }

            const { challengeB64, challengeIdB64 } = result1.message
            const challenge = toByteArray(challengeB64)
            const privateKey = session?.privateKey
            const signature = await ed.signAsync(challenge, privateKey);
            const signatureB64 = fromByteArray(signature)

            const response = await fetch(`${localhost}/api/newPassword`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    encryptedVault: encryptedVault,
                    iv: iv,
                    tag: tag,
                    userHash: session.userHash,
                    signatureB64: signatureB64,
                    challengeIdB64: challengeIdB64
                })
            })

            const result = await response.json()
            if (!response.ok) {
                Alert.alert('Error', result.message || 'Failed to update password')
                return
            }

            setPassword(updatedPasswords)
            setEditingId(null)
            setEditValues({})
            Alert.alert('Success', 'Password updated successfully')
        } catch (error) {
            console.log('Edit save error:', error)
            Alert.alert('Error', 'Failed to update password')
        }
    }

    const handleEditCancel = () => {
        setEditingId(null)
        setEditValues({})
    }

    useEffect(() => {
        console.log('homepass:', password)
    }, [password])

    if (!fontsLoaded) return null

    const passwordList = Array.isArray(password) ? password : []




    return (
        <LinearGradient
            colors={['#0a0a0a', '#1a1a1a', '#0f0f0f']}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                <Animated.View
                    entering={FadeIn.duration(800)}
                    style={styles.mainContent}
                >
                    {/* HEADER */}
                    <View style={styles.header}>
                        <Text style={[styles.headerTitle, { fontFamily: 'Montserrat_700Bold' }]}>
                            Password Vault
                        </Text>
                        <Text style={[styles.headerSubtitle, { fontFamily: 'Montserrat_400Regular' }]}>
                            Keep your secrets safe & encrypted
                        </Text>
                    </View>

                    {/* SEARCH */}
                    <View style={styles.searchContainer}>
                        <View style={styles.searchBox}>
                            <Search size={18} color="#666" />
                            <TextInput
                                placeholder="Search passwords..."
                                placeholderTextColor="#555"
                                style={styles.searchInput}
                                value={search}
                                onChangeText={setSearch}
                            />
                        </View>
                    </View>

                    {/* ADD PASSWORD FORM */}
                    <PasswordForm handleUpdatedPassword={handleUpdatedPassword} />

                    {/* PASSWORD LIST */}
                    <ScrollView
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 120 }}
                    >
                        {passwordList.length > 0 ? (
                            passwordList.map((item, index) => {
                                if (!item || !item.id) return null

                                const isVisible = visibleId === item.id
                                const isEditing = editingId === item.id
                                const isOpen = openId === item.id

                                return (
                                    <Animated.View
                                        key={item.id}
                                        entering={FadeInDown.duration(400).delay(index * 100)}
                                        style={styles.card}
                                    >
                                        {/* CARD HEADER */}
                                        <View style={styles.cardHeader}>
                                            <View style={styles.titleContainer}>
                                                <View style={styles.iconWrapper}>
                                                    <Image
                                                        style={styles.favicon}
                                                        source={{ uri: `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${item.url}&size=64` }}
                                                    />
                                                </View>
                                                <View style={styles.titleTextContainer}>
                                                    <Text style={[styles.cardTitle, { fontFamily: 'Montserrat_700Bold' }]} numberOfLines={1}>
                                                        {item.title || 'Untitled'}
                                                    </Text>
                                                    <View style={styles.categoryBadge}>
                                                        <Text style={styles.categoryText}>
                                                            {item.category || 'Other'}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                            
                                            {!isEditing && (
                                                <View style={styles.actionButtons}>
                                                    <TouchableOpacity
                                                        onPress={() => handleEditStart(item)}
                                                        style={styles.editButton}
                                                    >
                                                        <Edit2 size={16} color="#fff" />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        onPress={() => handleDelete(item.id)}
                                                        style={styles.deleteButton}
                                                    >
                                                        <Trash2 size={16} color="#ff6b6b" />
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>

                                        <View style={styles.divider} />

                                        {/* USERNAME */}
                                        <View style={styles.fieldRow}>
                                            <View style={styles.fieldIcon}>
                                                <Key size={16} color="#888" />
                                            </View>
                                            {isEditing ? (
                                                <TextInput
                                                    style={styles.editInput}
                                                    value={editValues.username}
                                                    onChangeText={(text) => setEditValues({ ...editValues, username: text })}
                                                    placeholder="Username"
                                                    placeholderTextColor="#555"
                                                />
                                            ) : (
                                                <View style={styles.fieldContent}>
                                                    <Text style={styles.fieldLabel}>Username</Text>
                                                    <Text style={styles.fieldValue}>{item.username || 'N/A'}</Text>
                                                </View>
                                            )}
                                        </View>

                                        {/* EXPAND/COLLAPSE */}
                                        <TouchableOpacity
                                            onPress={() => setOpenId((prev) => prev === item.id ? null : item.id)}
                                            style={styles.expandButton}
                                        >
                                            {!isOpen ? (
                                                <>
                                                    <ChevronDown size={18} color="#888" />
                                                    <Text style={styles.expandText}>Show details</Text>
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronUp size={18} color="#888" />
                                                    <Text style={styles.expandText}>Hide details</Text>
                                                </>
                                            )}
                                        </TouchableOpacity>

                                        {isOpen && (
                                            <Animated.View
                                                entering={FadeInDown.duration(300)}
                                                exiting={FadeOutUp.duration(200)}
                                            >
                                                {/* PASSWORD */}
                                                <View style={styles.fieldGroup}>
                                                    <Text style={styles.fieldLabel}>Password</Text>
                                                    <View style={styles.passwordField}>
                                                        {isEditing ? (
                                                            <TextInput
                                                                style={[styles.editInput, { flex: 1 }]}
                                                                value={String(editValues.password || '')}
                                                                onChangeText={(text) => setEditValues({ ...editValues, password: text })}
                                                                secureTextEntry={!isVisible}
                                                                placeholder="Password"
                                                                placeholderTextColor="#555"
                                                            />
                                                        ) : (
                                                            <TextInput
                                                                style={styles.passwordText}
                                                                value={String(item.password || '')}
                                                                secureTextEntry={!isVisible}
                                                                editable={false}
                                                            />
                                                        )}
                                                        <TouchableOpacity
                                                            onPress={() => setVisibleId((prev) => prev === item.id ? null : item.id)}
                                                            style={styles.eyeButton}
                                                        >
                                                            {isVisible ? (
                                                                <EyeOff color="#888" size={20} />
                                                            ) : (
                                                                <Eye color="#888" size={20} />
                                                            )}
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>

                                                {/* URL */}
                                                {(item.url || isEditing) && (
                                                    <View style={styles.fieldRow}>
                                                        <View style={styles.fieldIcon}>
                                                            <Globe size={16} color="#888" />
                                                        </View>
                                                        {isEditing ? (
                                                            <TextInput
                                                                style={styles.editInput}
                                                                value={editValues.url}
                                                                onChangeText={(text) => setEditValues({ ...editValues, url: text })}
                                                                placeholder="Website URL"
                                                                placeholderTextColor="#555"
                                                            />
                                                        ) : (
                                                            <View style={styles.fieldContent}>
                                                                <Text style={styles.fieldLabel}>Website</Text>
                                                                <Text style={styles.linkText}>{item.url}</Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                )}

                                                {/* RECOVERY EMAIL */}
                                                {(item.recoveryEmail || isEditing) && (
                                                    <View style={styles.fieldRow}>
                                                        <View style={styles.fieldIcon}>
                                                            <Mail size={16} color="#888" />
                                                        </View>
                                                        {isEditing ? (
                                                            <TextInput
                                                                style={styles.editInput}
                                                                value={editValues.recoveryEmail}
                                                                onChangeText={(text) => setEditValues({ ...editValues, recoveryEmail: text })}
                                                                placeholder="Recovery Email"
                                                                placeholderTextColor="#555"
                                                            />
                                                        ) : (
                                                            <View style={styles.fieldContent}>
                                                                <Text style={styles.fieldLabel}>Recovery Email</Text>
                                                                <Text style={styles.fieldValue}>{item.recoveryEmail}</Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                )}

                                                {/* RECOVERY PHONE */}
                                                {(item.recoveryPhone || isEditing) && (
                                                    <View style={styles.fieldRow}>
                                                        <View style={styles.fieldIcon}>
                                                            <Phone size={16} color="#888" />
                                                        </View>
                                                        {isEditing ? (
                                                            <TextInput
                                                                style={styles.editInput}
                                                                value={editValues.recoveryPhone}
                                                                onChangeText={(text) => setEditValues({ ...editValues, recoveryPhone: text })}
                                                                placeholder="Recovery Phone"
                                                                placeholderTextColor="#555"
                                                            />
                                                        ) : (
                                                            <View style={styles.fieldContent}>
                                                                <Text style={styles.fieldLabel}>Recovery Phone</Text>
                                                                <Text style={styles.fieldValue}>{item.recoveryPhone}</Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                )}

                                                {/* TAGS */}
                                                {(item.tags || isEditing) && (
                                                    <View style={styles.fieldRow}>
                                                        <View style={styles.fieldIcon}>
                                                            <Tag size={16} color="#888" />
                                                        </View>
                                                        {isEditing ? (
                                                            <TextInput
                                                                style={styles.editInput}
                                                                value={editValues.tags}
                                                                onChangeText={(text) => setEditValues({ ...editValues, tags: text })}
                                                                placeholder="Tags"
                                                                placeholderTextColor="#555"
                                                            />
                                                        ) : (
                                                            <View style={styles.fieldContent}>
                                                                <Text style={styles.fieldLabel}>Tags</Text>
                                                                <Text style={styles.fieldValue}>{item.tags}</Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                )}

                                                {/* NOTES */}
                                                {(item.notes || isEditing) && (
                                                    <View style={styles.notesField}>
                                                        <Text style={styles.fieldLabel}>Notes</Text>
                                                        {isEditing ? (
                                                            <TextInput
                                                                style={[styles.editInput, { minHeight: 60 }]}
                                                                value={editValues.notes}
                                                                onChangeText={(text) => setEditValues({ ...editValues, notes: text })}
                                                                placeholder="Notes"
                                                                placeholderTextColor="#555"
                                                                multiline
                                                                numberOfLines={3}
                                                            />
                                                        ) : (
                                                            <Text style={styles.fieldValue}>{item.notes}</Text>
                                                        )}
                                                    </View>
                                                )}

                                                {/* EDIT SAVE/CANCEL BUTTONS */}
                                                {isEditing && (
                                                    <View style={styles.editButtonsRow}>
                                                        <TouchableOpacity
                                                            onPress={() => handleEditSave(item.id)}
                                                            style={styles.saveButton}
                                                        >
                                                            <Text style={styles.saveButtonText}>Save</Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                            onPress={handleEditCancel}
                                                            style={styles.cancelButton}
                                                        >
                                                            <Text style={styles.cancelButtonText}>Cancel</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                            </Animated.View>
                                        )}

                                        {/* CREATED DATE */}
                                        <View style={styles.footer}>
                                            <Calendar size={14} color="#555" />
                                            <Text style={styles.footerText}>
                                                {new Date(item.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </Text>
                                        </View>
                                    </Animated.View>
                                )
                            })
                        ) : (
                            <View style={styles.emptyState}>
                                <View style={styles.emptyIconWrapper}>
                                    <ShieldCheck size={48} color="#333" />
                                </View>
                                <Text style={styles.emptyTitle}>No passwords saved yet</Text>
                                <Text style={styles.emptySubtitle}>Add your first password to get started</Text>
                            </View>
                        )}
                    </ScrollView>

                    {/* FOOTER */}
                    <View style={styles.bottomFooter}>
                        <ShieldCheck size={16} color="#555" />
                        <Text style={[styles.bottomFooterText, { fontFamily: 'Montserrat_400Regular' }]}>
                            AES-256 encrypted • Stored locally
                        </Text>
                    </View>
                </Animated.View>
            </SafeAreaView>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        width: '100%',
    },
    mainContent: {
        flex: 1,
        width: '90%',
        marginHorizontal: '5%',
    },
    header: {
        marginBottom: 24,
        marginTop: 10,
    },
    headerTitle: {
        fontSize: 32,
        color: '#ffffff',
        letterSpacing: -1,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#888',
        marginTop: 6,
    },
    searchContainer: {
        marginBottom: 20,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    searchInput: {
        marginLeft: 10,
        color: '#fff',
        flex: 1,
        fontSize: 16,
    },
    scrollView: {
        flex: 1,
        marginTop: 20,
    },
    card: {
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        padding: 18,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#0f0f0f',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#333',
    },
    favicon: {
        width: 20,
        height: 20,
        borderRadius: 4,
    },
    titleTextContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        color: '#fff',
        marginBottom: 4,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#2a2a2a',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
    },
    categoryText: {
        color: '#888',
        fontSize: 11,
        fontWeight: '600',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    editButton: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#2a2a2a',
        borderWidth: 1,
        borderColor: '#333',
    },
    deleteButton: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 107, 0.2)',
    },
    divider: {
        height: 1,
        backgroundColor: '#2a2a2a',
        marginVertical: 14,
    },
    fieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0f0f0f',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#252525',
    },
    fieldIcon: {
        marginRight: 12,
    },
    fieldContent: {
        flex: 1,
    },
    fieldLabel: {
        color: '#666',
        fontSize: 11,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    fieldValue: {
        color: '#fff',
        fontSize: 14,
    },
    linkText: {
        color: '#8ab4f8',
        fontSize: 14,
    },
    editInput: {
        flex: 1,
        color: '#fff',
        fontSize: 14,
        backgroundColor: '#0f0f0f',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#333',
    },
    expandButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        marginTop: 4,
    },
    expandText: {
        color: '#666',
        fontSize: 13,
        marginLeft: 6,
    },
    fieldGroup: {
        marginBottom: 10,
    },
    passwordField: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0f0f0f',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#252525',
    },
    passwordText: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    eyeButton: {
        padding: 4,
    },
    notesField: {
        backgroundColor: '#0f0f0f',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#252525',
    },
    editButtonsRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 6,
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#fff',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#000',
        fontSize: 15,
        fontWeight: '700',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#2a2a2a',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 14,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: '#2a2a2a',
    },
    footerText: {
        color: '#555',
        fontSize: 12,
        marginLeft: 8,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 80,
    },
    emptyIconWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    emptyTitle: {
        color: '#888',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptySubtitle: {
        color: '#555',
        fontSize: 14,
    },
    bottomFooter: {
        position: 'absolute',
        bottom: 15,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomFooterText: {
        color: '#555',
        fontSize: 12,
        marginLeft: 8,
    },
})

export default Home