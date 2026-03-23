const {
  withProjectBuildGradle,
  withSettingsGradle,
} = require("@expo/config-plugins");
const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const withGradleVersion = (config) => {
  // Patch android/build.gradle to pin AGP version
  config = withProjectBuildGradle(config, (cfg) => {
    cfg.modResults.contents = cfg.modResults.contents.replace(
      /classpath\(['"]com\.android\.tools\.build:gradle['"]\)/,
      "classpath('com.android.tools.build:gradle:8.5.2')",
    );
    return cfg;
  });

  // Patch gradle-wrapper.properties to pin Gradle version
  config = withDangerousMod(config, [
    "android",
    (cfg) => {
      const wrapperPath = path.join(
        cfg.modRequest.platformProjectRoot,
        "gradle/wrapper/gradle-wrapper.properties",
      );
      if (fs.existsSync(wrapperPath)) {
        let contents = fs.readFileSync(wrapperPath, "utf8");
        contents = contents.replace(
          /distributionUrl=.+/,
          "distributionUrl=https\\://services.gradle.org/distributions/gradle-8.10.2-bin.zip",
        );
        fs.writeFileSync(wrapperPath, contents);
      }
      return cfg;
    },
  ]);

  return config;
};

module.exports = withGradleVersion;
