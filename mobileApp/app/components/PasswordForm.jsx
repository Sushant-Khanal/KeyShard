
import { Text, View, TextInput, Button, Alert, Touchable, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, } from "react-native"
import { useForm, Controller } from "react-hook-form"
import React, { useEffect, useRef, useState } from 'react'
import { Eye, EyeOff } from "lucide-react-native"
import { encryptPassword, decryptPassword } from "../security/aesEncryption"


const PasswordForm = () => {
    const [tab, setTab] = useState(false)
    const [passwordVisibility, setPasswordVisibility] = useState(true)
    const [password, setPassword] = useState([])




    const {
        control,
        handleSubmit,
        reset,
        trigger,
        formState: { errors },
    } = useForm({
        mode: "onChange",
        defaultValues: {
            title: '',
            username: '',
            password: '',
            url: '',
            category: 'Other',
            notes: '',
            tags: '',
            recoveryEmail: '',
            recoveryPhone: '',

            createdAt: new Date().toISOString(),
        },
    })












    const onSubmit = (data) => {
        setTab(false)

        setPassword(prev => {
            const updatedVault = [...prev, data]


            const encrypted = encryptPassword(JSON.stringify(updatedVault))
            console.log("Encrypted: ", encrypted)


            const decrypted = decryptPassword(encrypted)
            console.log("\n\n\n\n\nDecrypted: ", decrypted)

            return updatedVault
        })




        reset()

    }

    const onError = (errors) => {
        console.log('Validation errors:', errors)

    }

    return (
        tab ? (
            <KeyboardAvoidingView
                // importantForAutofill="no"
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                className="w-full"
            >
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    className="mt-5 rounded-lg border border-white w-full"
                >
                    <TouchableOpacity
                        onPress={() => {
                            setTab(false)
                            reset()
                        }}
                        className="bg-white self-end rounded-md mb-4"
                    >
                        <Text className="text-red-500 px-3 py-1 font-semibold">Cancel</Text>
                    </TouchableOpacity>

                    {/* ========== CREDENTIALS SECTION ========== */}
                    <View className="mb-6">
                        <Text className="font-bold text-xl text-white mb-4">Credentials</Text>

                        {/* Title Field */}
                        <View className="mb-4">
                            <Text className="text-white text-base font-semibold mb-1">Title *</Text>
                            <Controller
                                control={control}
                                name="title"
                                rules={{
                                    required: 'Title is required',
                                    minLength: {
                                        value: 3,
                                        message: 'Title must be at least 3 characters'
                                    },
                                }}
                                render={({ field: { onChange, onBlur, value }, }) => (
                                    <View>
                                        <TextInput
                                            className="bg-white text-black w-full rounded-md px-3 py-2"
                                            placeholder="e.g., Gmail, Facebook"
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}

                                        />
                                        {errors.title && (
                                            <Text className="text-red-500 font-bold text-sm mt-1">{errors.title.message}</Text>
                                        )}
                                    </View>
                                )}

                            />

                        </View>

                        {/* Username Field */}
                        <View className="mb-4">
                            <Text className="text-white text-base font-semibold mb-1">Username / Email *</Text>
                            <Controller
                                control={control}
                                name="username"
                                rules={{
                                    required: 'Username is required',
                                }}
                                render={({ field: { onChange, onBlur, value }, }) => (
                                    <View>
                                        <TextInput
                                            className="bg-white text-black w-full rounded-md px-3 py-2"
                                            placeholder="john@example.com"
                                            value={value}
                                            importantForAutofill="no"
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            autoCapitalize="none"
                                        />
                                        {errors.username && (
                                            <Text className="text-red-500 font-bold text-sm mt-1">{errors.username.message}</Text>
                                        )}
                                    </View>
                                )}
                            />

                        </View>

                        {/* Password Field */}
                        <View className="mb-4">
                            <Text className="text-white text-base font-semibold mb-1">Password *</Text>
                            <Controller
                                control={control}
                                name="password"
                                rules={{
                                    required: 'Password is required',
                                    minLength: {
                                        value: 8,
                                        message: 'Password must be at least 8 characters'
                                    },
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View className="relative">
                                        <TextInput
                                            secureTextEntry={passwordVisibility}
                                            className="bg-white text-black w-full rounded-md px-3 py-2 pr-12"
                                            placeholder="Enter password"
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                        />
                                        {errors.password && (
                                            <Text className="text-red-500 font-bold text-sm mt-1">{errors.password.message}</Text>
                                        )}
                                    </View>
                                )}
                            />
                            <TouchableOpacity
                                onPress={() => setPasswordVisibility(prev => !prev)}
                                className="absolute right-3 top-[30px]"
                            >
                                {passwordVisibility ? (
                                    <Eye color="#666" size={20} />
                                ) : (
                                    <EyeOff color="#666" size={20} />
                                )}
                            </TouchableOpacity>

                        </View>
                    </View>

                    {/* ========== WEBSITE SECTION ========== */}
                    <View className="mb-6">
                        <Text className="font-bold text-xl text-white mb-4">Website</Text>

                        {/* Website URL Field */}
                        <View className="mb-4">
                            <Text className="text-white text-base font-semibold mb-1">Website URL</Text>
                            <Controller
                                control={control}
                                name="url"
                                rules={{
                                    pattern: {
                                        value: /^https?:\/\/.+/,
                                        message: 'URL must start with http:// or https://'
                                    }
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View>
                                        <TextInput
                                            className="bg-white text-black w-full rounded-md px-3 py-2"
                                            placeholder="https://example.com"
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            autoCapitalize="none"
                                            importantForAutofill="no"
                                            keyboardType="url"
                                        />
                                        {errors.url && (
                                            <Text className="text-red-500 font-bold text-sm mt-1">{errors.url.message}</Text>
                                        )}
                                    </View>

                                )}
                            />

                        </View>

                        {/* Category Field */}
                        <View className="mb-4">
                            <Text className="text-white text-base font-semibold mb-1">Category</Text>
                            <Controller
                                control={control}
                                name="category"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        className="bg-white text-black w-full rounded-md px-3 py-2"
                                        placeholder="e.g., Email, Social Media, Banking"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        importantForAutofill="no"
                                    />
                                )}
                            />
                        </View>
                    </View>

                    {/* ========== TIMESTAMP SECTION ========== */}
                    <View className="mb-6">
                        <Text className="font-bold text-xl text-white mb-4">Timestamp</Text>

                        {/* Created At Field */}
                        <View className="mb-4">
                            <Text className="text-white text-base font-semibold mb-1">Created At</Text>
                            <Controller
                                control={control}
                                name="createdAt"
                                render={({ field: { value } }) => (
                                    <View className="bg-gray-700 w-full rounded-md px-3 py-2">
                                        <Text className="text-white">
                                            {new Date(value).toLocaleString()}
                                        </Text>
                                    </View>
                                )}
                            />
                        </View>
                    </View>

                    {/* ========== RECOVERY SECTION ========== */}
                    <View className="mb-6">
                        <Text className="font-bold text-xl text-white mb-4">Recovery</Text>

                        {/* Recovery Phone Field */}
                        <View className="mb-4">
                            <Text className="text-white text-base font-semibold mb-1">Recovery Phone</Text>
                            <Controller
                                control={control}
                                name="recoveryPhone"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        className="bg-white text-black w-full rounded-md px-3 py-2"
                                        placeholder="+1234567890"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        keyboardType="phone-pad"
                                    />
                                )}
                            />
                        </View>

                        {/* Recovery Email Field */}
                        <View className="mb-4">
                            <Text className="text-white text-base font-semibold mb-1">Recovery Email</Text>
                            <Controller
                                control={control}
                                name="recoveryEmail"
                                rules={{
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: 'Invalid email address'
                                    }
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View>
                                        <TextInput
                                            className="bg-white text-black w-full rounded-md px-3 py-2"
                                            placeholder="recovery@example.com"
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}

                                            keyboardType="email-address"

                                        />
                                        {errors.recoveryEmail && (
                                            <Text className="text-red-500 font-bold text-sm mt-1">{errors.recoveryEmail.message}</Text>
                                        )}
                                    </View>

                                )}
                            />

                        </View>
                    </View>

                    {/* ========== EXTRA SECTION ========== */}
                    <View className="mb-6">
                        <Text className="font-bold text-xl text-white mb-4">Extra</Text>

                        {/* Notes Field */}
                        <View className="mb-4">
                            <Text className="text-white text-base font-semibold mb-1">Notes</Text>
                            <Controller
                                control={control}
                                name="notes"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        className="bg-white text-black w-full rounded-md px-3 py-2"
                                        placeholder="Additional information..."
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        multiline
                                        numberOfLines={4}
                                        textAlignVertical="top"
                                    />
                                )}
                            />
                        </View>

                        {/* Tags Field */}
                        <View className="mb-4">
                            <Text className="text-white text-base font-semibold mb-1">Tags</Text>
                            <Controller
                                control={control}
                                name="tags"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        className="bg-white text-black w-full rounded-md px-3 py-2"
                                        placeholder="work, important, 2fa"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                    />
                                )}
                            />
                            <Text className="text-gray-400 text-xs mt-1">
                                Separate tags with commas
                            </Text>
                        </View>
                    </View>

                    {/* ========== SUBMIT BUTTONS ========== */}
                    <View className="mb-4">
                        <TouchableOpacity

                            onPress={handleSubmit(onSubmit, onError)}
                            className="bg-blue-500 py-3 rounded-md mb-3"
                        >
                            <Text className="text-white font-bold text-center text-base">
                                Save Password
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => reset()}
                            className="bg-gray-600 py-3 rounded-md"
                        >
                            <Text className="text-white font-bold text-center text-base">
                                Reset Form
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        ) : (
            <View>
                <TouchableOpacity
                    className="bg-blue-500 py-2 px-4 rounded-md"
                    onPress={() => setTab(true)}
                >
                    <Text className="text-white font-bold">Add New Password</Text>
                </TouchableOpacity>
            </View>
        )
    )
}

export default PasswordForm