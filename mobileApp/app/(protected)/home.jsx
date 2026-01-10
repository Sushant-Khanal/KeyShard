import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect, useState } from 'react'
import { Text, Image, View, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Key, Lock, ShieldCheck, Search, Eye, EyeOff, Mail, Phone, Calendar, Tag, ArrowDown, ArrowUp, Trash2, Edit2 } from 'lucide-react-native'
import { useFonts, Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { getSession } from '../security/secureStore'
import { encryptPassword } from '../security/aesEncryption'
import { fromByteArray, toByteArray } from 'react-native-quick-base64'
import Constants from 'expo-constants'
import { ed } from '../security/signatureEd'
import PasswordForm from '../components/PasswordForm'

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
            colors={['#131920', '#050f1a']}
            className="flex-1 relative items-center"
        >
            <SafeAreaView className="flex-1 w-full" edges={['top', 'bottom']}>
                <View className="flex-1 w-[88%] mx-auto">

                    {/* HEADER */}
                    <View className="mb-6">
                        <Text
                            style={{ fontFamily: 'Montserrat_700Bold' }}
                            className="text-white text-4xl"
                        >
                            Password Vault
                        </Text>
                        <Text
                            style={{ fontFamily: 'Montserrat_400Regular' }}
                            className="text-gray-300 text-base mt-1"
                        >
                            Keep your secrets safe & encrypted
                        </Text>
                    </View>

                    {/* SEARCH */}
                    <View className="mb-6">
                        <View className="flex-row items-center bg-[#0e1621] border border-[#1f2937] rounded-lg px-3 py-2">
                            <Search size={16} color="#9ca3af" />
                            <TextInput
                                placeholder="Search passwords..."
                                placeholderTextColor="#6b7280"
                                className="ml-2 text-white flex-1"
                                value={search}
                                onChangeText={setSearch}
                            />
                        </View>
                    </View>

                    {/* ADD PASSWORD FORM */}

                    <PasswordForm handleUpdatedPassword={handleUpdatedPassword} />


                    {/* PASSWORD LIST */}
                    <ScrollView
                        className="flex-1 mt-6"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 120 }}
                    >
                        {passwordList.length > 0 ? (
                            passwordList.map((item) => {
                                if (!item || !item.id) return null

                                const isVisible = visibleId === item.id
                                const isEditing = editingId === item.id


                                return (
                                    <View
                                        key={item.id}
                                        className="bg-[#111d2e] border border-[#b7dcff] rounded-xl p-4 mb-4"
                                    >
                                        {/* TITLE + CATEGORY + EDIT/DELETE BUTTONS */}
                                        <View className="flex-row justify-between items-center mb-3 gap-2">
                                            <View className='flex flex-row justify-center items-center gap-2 flex-1'>
                                                <Image
                                                    style={{ width: 16, height: 16 }}
                                                    source={{ uri: `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${item.url}&size=64` }}

                                                />
                                                <Text
                                                    style={{ fontFamily: 'Montserrat_700Bold' }}
                                                    className="text-white text-xl flex-1"
                                                    numberOfLines={1}
                                                >
                                                    {item.title || 'Untitled'}
                                                </Text>
                                            </View>
                                            <View className="bg-blue-500/20 px-3 py-1 rounded-full flex-shrink-0">
                                                <Text className="text-blue-400 text-xs font-semibold">
                                                    {item.category || 'Other'}
                                                </Text>
                                            </View>

                                            {!isEditing && (
                                                <View className="flex-row gap-2 flex-shrink-0">
                                                    <TouchableOpacity
                                                        onPress={() => handleEditStart(item)}
                                                        className="p-2 rounded-lg bg-blue-500/20 active:bg-blue-500/40"
                                                    >
                                                        <Edit2 size={16} color="#3b82f6" />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        onPress={() => handleDelete(item.id)}
                                                        className="p-2 rounded-lg bg-red-500/20 active:bg-red-500/40"
                                                    >
                                                        <Trash2 size={16} color="#ef4444" />
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>

                                        {/* USERNAME */}
                                        <View className="flex-row items-center mb-3 bg-[#020617] rounded-lg px-3 py-2">
                                            <Key size={16} color="#9ca3af" />
                                            {isEditing ? (
                                                <TextInput
                                                    className="text-white text-sm ml-2 flex-1 py-1"
                                                    value={editValues.username}
                                                    onChangeText={(text) => setEditValues({ ...editValues, username: text })}
                                                    placeholder="Username"
                                                    placeholderTextColor="#6b7280"
                                                />
                                            ) : (
                                                <View className="ml-2 flex-1">
                                                    <Text className="text-gray-400 text-xs mb-1">Username</Text>
                                                    <Text className="text-white text-sm">
                                                        {item.username || 'N/A'}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                        <TouchableOpacity onPress={() => setOpenId((prev) =>
                                            prev === item.id ? null : item.id
                                        )}
                                            className='flex flex-row justify-center items-center opacity-50'>{!(openId === item.id) ? <><ArrowDown strokeWidth={1.2} color='white' className=' mr-5' /><Text className='text-white text-sm  ml-2'>Expand</Text></> : <><ArrowUp strokeWidth={1.2} color='white' className=' mr-5' /><Text className='text-white text-sm  ml-2'>Collapse</Text></>}</TouchableOpacity>

                                        {openId === item.id && (<View>
                                            {/* PASSWORD */}
                                            <View className="mb-3">
                                                <Text className="text-gray-400 text-xs mb-2">Password</Text>
                                                <View className="bg-[#020617] rounded-lg px-3 py-3 flex-row items-center justify-between">
                                                    {isEditing ? (
                                                        <TextInput
                                                            className="text-white font-bold text-base flex-1 pr-3"
                                                            value={String(editValues.password || '')}
                                                            onChangeText={(text) => setEditValues({ ...editValues, password: text })}
                                                            secureTextEntry={!isVisible}
                                                            placeholder="Password"
                                                            placeholderTextColor="#6b7280"
                                                        />
                                                    ) : (
                                                        <TextInput
                                                            className="text-white font-bold text-base flex-1 pr-3"
                                                            value={String(item.password || '')}
                                                            secureTextEntry={!isVisible}
                                                            editable={false}
                                                        />
                                                    )}
                                                    <TouchableOpacity
                                                        onPress={() =>
                                                            setVisibleId((prev) =>
                                                                prev === item.id ? null : item.id
                                                            )
                                                        }
                                                    >
                                                        {isVisible ? (
                                                            <EyeOff color="#9ca3af" size={20} />
                                                        ) : (
                                                            <Eye color="#9ca3af" size={20} />
                                                        )}
                                                    </TouchableOpacity>
                                                </View>
                                            </View>

                                            {/* URL */}
                                            {item.url || isEditing ? (
                                                <View className="flex-row items-center mb-3 bg-[#020617] rounded-lg px-3 py-2">
                                                    <Lock size={16} color="#9ca3af" />
                                                    {isEditing ? (
                                                        <TextInput
                                                            className="text-blue-400 text-sm ml-2 flex-1 py-1"
                                                            value={editValues.url}
                                                            onChangeText={(text) => setEditValues({ ...editValues, url: text })}
                                                            placeholder="Website URL"
                                                            placeholderTextColor="#6b7280"
                                                        />
                                                    ) : (
                                                        <View className="ml-2 flex-1">
                                                            <Text className="text-gray-400 text-xs mb-1">Website</Text>
                                                            <Text className="text-blue-400 text-sm">
                                                                {item.url}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            ) : null}

                                            {/* RECOVERY EMAIL */}
                                            {item.recoveryEmail || isEditing ? (
                                                <View className="flex-row items-center mb-3 bg-[#020617] rounded-lg px-3 py-2">
                                                    <Mail size={16} color="#9ca3af" />
                                                    {isEditing ? (
                                                        <TextInput
                                                            className="text-white text-sm ml-2 flex-1 py-1"
                                                            value={editValues.recoveryEmail}
                                                            onChangeText={(text) => setEditValues({ ...editValues, recoveryEmail: text })}
                                                            placeholder="Recovery Email"
                                                            placeholderTextColor="#6b7280"
                                                        />
                                                    ) : (
                                                        <View className="ml-2 flex-1">
                                                            <Text className="text-gray-400 text-xs mb-1">Recovery Email</Text>
                                                            <Text className="text-white text-sm">
                                                                {item.recoveryEmail}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            ) : null}

                                            {/* RECOVERY PHONE */}
                                            {item.recoveryPhone || isEditing ? (
                                                <View className="flex-row items-center mb-3 bg-[#020617] rounded-lg px-3 py-2">
                                                    <Phone size={16} color="#9ca3af" />
                                                    {isEditing ? (
                                                        <TextInput
                                                            className="text-white text-sm ml-2 flex-1 py-1"
                                                            value={editValues.recoveryPhone}
                                                            onChangeText={(text) => setEditValues({ ...editValues, recoveryPhone: text })}
                                                            placeholder="Recovery Phone"
                                                            placeholderTextColor="#6b7280"
                                                        />
                                                    ) : (
                                                        <View className="ml-2 flex-1">
                                                            <Text className="text-gray-400 text-xs mb-1">Recovery Phone</Text>
                                                            <Text className="text-white text-sm">
                                                                {item.recoveryPhone}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            ) : null}

                                            {/* TAGS */}
                                            {item.tags || isEditing ? (
                                                <View className="flex-row items-center mb-3 bg-[#020617] rounded-lg px-3 py-2">
                                                    <Tag size={16} color="#9ca3af" />
                                                    {isEditing ? (
                                                        <TextInput
                                                            className="text-white text-sm ml-2 flex-1 py-1"
                                                            value={editValues.tags}
                                                            onChangeText={(text) => setEditValues({ ...editValues, tags: text })}
                                                            placeholder="Tags"
                                                            placeholderTextColor="#6b7280"
                                                        />
                                                    ) : (
                                                        <View className="ml-2 flex-1">
                                                            <Text className="text-gray-400 text-xs mb-1">Tags</Text>
                                                            <Text className="text-white text-sm">
                                                                {item.tags}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            ) : null}

                                            {/* NOTES */}
                                            {item.notes || isEditing ? (
                                                <View className="mb-3 bg-[#020617] rounded-lg px-3 py-2">
                                                    <Text className="text-gray-400 text-xs mb-1">Notes</Text>
                                                    {isEditing ? (
                                                        <TextInput
                                                            className="text-white text-sm py-1"
                                                            value={editValues.notes}
                                                            onChangeText={(text) => setEditValues({ ...editValues, notes: text })}
                                                            placeholder="Notes"
                                                            placeholderTextColor="#6b7280"
                                                            multiline
                                                            numberOfLines={3}
                                                        />
                                                    ) : (
                                                        <Text className="text-white text-sm">
                                                            {item.notes}
                                                        </Text>
                                                    )}
                                                </View>
                                            ) : null}

                                            {/* EDIT SAVE/CANCEL BUTTONS */}
                                            {isEditing && (
                                                <View className="flex-row gap-2 mb-3">
                                                    <TouchableOpacity
                                                        onPress={() => handleEditSave(item.id)}
                                                        className="flex-1 bg-green-500 py-2 rounded-lg"
                                                    >
                                                        <Text className="text-white font-bold text-center">Save</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        onPress={handleEditCancel}
                                                        className="flex-1 bg-gray-600 py-2 rounded-lg"
                                                    >
                                                        <Text className="text-white font-bold text-center">Cancel</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>)}

                                        {/* CREATED DATE */}
                                        <View className="flex-row items-center mt-2 pt-3 border-t border-[#1f2937]">
                                            <Calendar size={14} color="#6b7280" />
                                            <Text className="text-gray-500 text-xs ml-2">
                                                Created: {new Date(item.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </Text>
                                        </View>
                                    </View>
                                )
                            })
                        ) : (
                            <View className="flex-1 items-center justify-center mt-20">
                                <ShieldCheck size={64} color="#374151" />
                                <Text className="text-gray-400 text-center mt-4 text-base">
                                    No passwords saved yet
                                </Text>
                                <Text className="text-gray-500 text-center mt-2 text-sm">
                                    Add your first password to get started
                                </Text>
                            </View>
                        )}
                    </ScrollView>

                    {/* FOOTER */}
                    <View className="absolute bottom-[15px] w-full flex-row items-center justify-center">
                        <ShieldCheck size={18} color="white" />
                        <Text
                            style={{ fontFamily: 'Montserrat_400Regular' }}
                            className="text-white text-xs ml-2 opacity-70"
                        >
                            AES-256 encrypted • Stored locally
                        </Text>
                    </View>

                </View>
            </SafeAreaView>
        </LinearGradient>
    )
}

export default Home