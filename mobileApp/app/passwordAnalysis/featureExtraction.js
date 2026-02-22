// // 1. Paste the function here
// export const extractFeatures = (password) => {
//   const p = String(password);
//   const len = p.length;
//   const lower = (p.match(/[a-z]/g) || []).length;
//   const upper = (p.match(/[A-Z]/g) || []).length;
//   const digit = (p.match(/[0-9]/g) || []).length;
//   const special = (p.match(/[^a-zA-Z0-9]/g) || []).length;

//   // Entropy
//   const freq = {};
//   for (let char of p) freq[char] = (freq[char] || 0) + 1;
//   let entropy = 0;
//   for (let char in freq) {
//     let prob = freq[char] / len;
//     entropy -= prob * Math.log2(prob);
//   }

//   // Transitions
//   const getCharType = (c) => {
//     if (/[a-z]/.test(c)) return "l";
//     if (/[A-Z]/.test(c)) return "u";
//     if (/[0-9]/.test(c)) return "d";
//     return "s";
//   };
//   let trans = 0;
//   for (let i = 0; i < len - 1; i++) {
//     if (getCharType(p[i]) !== getCharType(p[i + 1])) trans++;
//   }

//   // Max Repeated
//   let maxRep = 0;
//   const matches = p.match(/(.)\1*/g) || [];
//   matches.forEach((m) => {
//     if (m.length > maxRep) maxRep = m.length;
//   });

//   // Leet & Common Root
//   const leet = [...p].filter((c) => "@$!013457".includes(c)).length;
//   const commonRoots = [
//     "password",
//     "qwerty",
//     "admin",
//     "welcome",
//     "login",
//     "google",
//     "iloveyou",
//     "p@ss",
//     "pass",
//     "monkey",
//     "dragon",
//   ];
//   const isCommon = commonRoots.some((root) => p.toLowerCase().includes(root))
//     ? 1
//     : 0;

//   // Shape Complexity
//   let shape = "";
//   for (let char of p) {
//     if (/[A-Z]/.test(char)) shape += "U";
//     else if (/[a-z]/.test(char)) shape += "L";
//     else if (/[0-9]/.test(char)) shape += "D";
//     else shape += "S";
//   }
//   const chunks = new Set();
//   for (let i = 0; i < shape.length - 1; i++) chunks.add(shape.slice(i, i + 2));

//   // Pattern Intensity
//   let patternScore = 0;
//   const sequences = [
//     "abcdefghijklmnopqrstuvwxyz",
//     "0123456789",
//     "qwertyuiop",
//     "asdfghjkl",
//     "zxcvbnm",
//   ];
//   const pLower = p.toLowerCase();
//   sequences.forEach((seq) => {
//     for (let i = 0; i < seq.length - 2; i++) {
//       let part = seq.slice(i, i + 3);
//       if (pLower.includes(part)) patternScore++;
//       if (pLower.includes(part.split("").reverse().join(""))) patternScore++;
//     }
//   });

//   // Habit Score
//   const hasYear = /(19|20)\d{2}/.test(p) ? 1 : 0;
//   const startsUpper = p[0] && /[A-Z]/.test(p[0]) ? 1 : 0;
//   const endsDigit = /[0-9]/.test(p[len - 1]) ? 1 : 0;

//   // Diversity
//   const div =
//     (lower > 0 ? 1 : 0) +
//     (upper > 0 ? 1 : 0) +
//     (digit > 0 ? 1 : 0) +
//     (special > 0 ? 1 : 0);

//   return [
//     len,
//     lower,
//     upper,
//     digit,
//     special,
//     entropy,
//     trans,
//     maxRep,
//     leet,
//     isCommon,
//     chunks.size,
//     patternScore,
//     hasYear + startsUpper + endsDigit,
//     div,
//   ];
// };
