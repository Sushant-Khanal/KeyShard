import Constants from "expo-constants";

const FALLBACK_RECOMMENDATION =
  "Use at least 12 characters and mix uppercase, lowercase, numbers, and symbols.";

function resolveAnalyzeEndpoint() {
  const { localhost, passwordStrengthApi } = Constants.expoConfig?.extra ?? {};

  if (
    typeof passwordStrengthApi === "string" &&
    passwordStrengthApi.trim().length > 0
  ) {
    return passwordStrengthApi.trim();
  }

  if (typeof localhost !== "string" || localhost.trim().length === 0) {
    return null;
  }

  let baseUrl = localhost.trim();
  if (!/^https?:\/\//i.test(baseUrl)) {
    baseUrl = `http://${baseUrl}`;
  }

  try {
    const url = new URL(baseUrl);
    url.port = "8000";
    url.pathname = "/analyze";
    url.search = "";
    return url.toString();
  } catch {
    return null;
  }
}

function normalizeResult(data) {
  const strengthRaw = String(data?.strength ?? "").toLowerCase();
  const strength = ["weak", "medium", "strong"].includes(strengthRaw)
    ? strengthRaw
    : "weak";

  const recommendations = Array.isArray(data?.recommendations)
    ? data.recommendations.filter(
        (item) => typeof item === "string" && item.trim().length > 0,
      )
    : [];

  if (strength !== "strong" && recommendations.length === 0) {
    recommendations.push(FALLBACK_RECOMMENDATION);
  }

  const scoreIndex = Number.isInteger(data?.score_index)
    ? data.score_index
    : strength === "weak"
      ? 0
      : strength === "medium"
        ? 1
        : 2;

  return {
    strength,
    scoreIndex,
    recommendations,
  };
}

export async function analyzePasswordStrength(password, email) {
  const endpoint = resolveAnalyzeEndpoint();

  if (!endpoint) {
    return {
      strength: "weak",
      scoreIndex: 0,
      recommendations: ["Password analyzer service is not configured."],
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch(
      "https://phytogeographically-fungic-leticia.ngrok-free.dev/analyze",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          email: email || undefined,
        }),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      return {
        strength: "weak",
        scoreIndex: 0,
        recommendations: ["Password analyzer is unavailable right now."],
      };
    }

    const data = await response.json();
    return normalizeResult(data);
  } catch {
    return {
      strength: "weak",
      scoreIndex: 0,
      recommendations: ["Unable to reach password analyzer service."],
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
