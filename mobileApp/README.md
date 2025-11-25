# KeyShards

SignIn Page Mobile
![Sign In Page](assects/images/Signin%20Page.jpg)






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
