# KeyShards

# Gallery
 ## SignIn Page Mobile
![Sign In Page](/mobileApp/assets/images/SigninPage.jpg)

## Sign Up Page Mobile
![Sign Up Page](/mobileApp/assets/images/SignUp.jpg)

## Home Page Mobile
![Home Page](/mobileApp/assets/images/Home.jpg)

## Argon2 Output
![Argon2 Output](/mobileApp/assets/images/Argon2Output.png)


# KeyShards FrontEnd Workflow

## User Identification
- Each user needs a **unique identifier** such as an **email** or **username**.
- This identifier is used to **look up the user’s encrypted vault** in the database.
- The user **does not need to know the UUID**; it is only used internally as a salt for key derivation.

## Argon2 Key Generation
- We use the **`argon2id`** function from the **`@noble/hashes/argon2`** library to generate a **256-bit master key** from the user’s master password.
- The **UUID generated at account creation** serves as the salt for Argon2.
- This master key **never leaves the device** and is **never stored in the database**.

## Argon2 Output
![Argon2 Output](/mobileApp/assets/images/Argon2Output.png)

## Vault Encryption
- The **entire vault** (all stored passwords) is encrypted using the **AES-GCM algorithm**.
- The **argon2-derived master key** is used as the encryption key.
- Each encryption uses a **unique IV (initialization vector)** to ensure ciphertext is unique even if the vault content is the same.

## Account Creation
1. User provides **email/username** and master password.
2. Generate a **UUID**.
   - Used as **salt for Argon2** and internally as a **unique database reference**.
3. Derive the **master key** from the master password + UUID salt using Argon2.
4. Encrypt the initial vault (can be empty) using AES-GCM with the derived master key.
5. Store in the database:
   - Email/username
   - Vault ciphertext + IV
   - UUID (salt)
   - Argon2 parameters (for eg: memory usage, max memory, parallelism, iterations) NOTE: The master key is never stored in the DB

## Adding a New Password Item in the Vault
1. User enters **master password**.
2. Derive the **master key** in memory using Argon2 + stored UUID salt. 

(NOTE: Login / Session Start: Master password  not in memory → derive masterKey using Argon2 + stored salt → keep masterKey in memory for session. 
       Already Logged In: masterKey is in memory → no need to derive again → use it to encrypt/decrypt vault entries.)

3. Decrypt the existing vault using AES-GCM + derived key + IV.
4. Update the vault JSON with the new password entry.
5. Re-encrypt the vault (can use a new IV).
6. Store the updated ciphertext and IV back in the database.

> The master key exists **temporarily in memory** during this session and is cleared when the app is locked or closed.

## Vault Retrieval / Unlocking
1. User logs in with **email/username** and **master password**.
2. Look up the vault in the database by **email/username**.
3. Retrieve:
   - Vault ciphertext + IV
   - UUID (salt for Argon2)
   - Argon2 parameters
4. Derive the **master key** from master password + salt using Argon2.
5. Decrypt the vault using AES-GCM + derived key + IV.
6. Display the decrypted vault in the app.

## Security Notes
- The vault is **zero-knowledge**: the server never has access to the master password or AES key.
- The AES key is **derived on-device** only.
- Each vault encryption can use a **unique IV** for additional security.
- The UUID ensures that even if two users choose the same master password, their keys are different.
- Email/username serves as the **DB lookup key** and is not secret.







# 📱 React Native Cheatsheet

A quick reference guide comparing common **HTML elements** with their **React Native equivalents**, along with styling differences.

---

## 🧱 Structural Elements

| HTML Tag | React Native Component | Description |
|---------|-------------------------|-------------|
| `<div>` | `<View>` | The most fundamental building block for layout and styling. |
| `<span>` | `<Text>` | Used for displaying inline or small text content. |
| `<p>` | `<Text>` | Paragraph-like text, handled by styling. |
| `<h1>` – `<h6>` | `<Text>` | Headings are created by applying font sizes and weights using styles. |

---

## 🧩 Content Elements

| HTML Tag | React Native Component | Description |
|---------|-------------------------|-------------|
| `<img>` | `<Image>` | Displays images. Uses `source` prop with `require()` (local) or `{ uri: "" }` (remote). |
| `<input type="text">` | `<TextInput>` | Standard single-line text input. |
| `<textarea>` | `<TextInput multiline />` | Multi-line text input. |
| `<button>` | `<Button>`, `<TouchableOpacity>`, `<Pressable>` | `<Button>` is basic; others offer customization and animations. |
| `<a>` | `<Text>` + `Linking` API | Use `<Text onPress>` with `Linking.openURL()` for links. |
| `<ul>`, `<ol>`, `<li>` | `<View>` + `<Text>` | Lists are created by mapping over data and rendering components. |

---

## 🎨 Styling

| HTML Concept | React Native Equivalent | Description |
|--------------|-------------------------|-------------|
| CSS Styles | `StyleSheet.create()` | React Native uses JS objects for defining styles. |
| class / id | `style` prop | Styles applied directly using a style object or array. |
| Flexbox | Flexbox in `style` | Layout uses Flexbox with properties like `flexDirection`, `justifyContent`, `alignItems`, etc. |

**Example style object:**

```js
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
