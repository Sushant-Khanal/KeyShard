import dotenv from 'dotenv'
dotenv.config()
module.exports = {
  expo: {
    name: "KeyShard",
    slug: "mobileApp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/adaptive-icon.png",
    scheme: "mobileapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      icon:{
    light: "./assets/images/ios-light.png",
    dark: "./assets/images/ios-dark.png",
    tinted: "./assets/images/ios-tinted.png"

      }
    },
    android: {
      adaptiveIcon: {
       
        foregroundImage: "./assets/images/adaptive-icon.png",
        monochromeImage: "./assets/images/adaptive-icon.png",
        backgroundColor:'#ffffff'
      },
      package: "com.anonymous.mobileApp",
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
      bundler: "metro"
    },
    plugins: [
      "expo-secure-store",
      "expo-router",
      "expo-web-browser",
      "onnxruntime-react-native",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon-light.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            image:"./assets/images/splash-icon-dark.png",
            backgroundColor: "#000000"
          }
        },
        
      ]
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: false
    },
    extra: {
      ARGON_SALT: process.env.ARGON_SALT,
      localhost: process.env.IP,
      "eas": {
        "projectId": "538b2367-1cd7-4f53-a002-cefbee77322d"
      }
    }
  }
};