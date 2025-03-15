export function getWordFrequencyMap(words) {
  const wordCounts = new Map();

  words.forEach((word) => {
    const lowercaseWord = word.toLowerCase();
    wordCounts.set(lowercaseWord, (wordCounts.get(lowercaseWord) || 0) + 1);
  });

  return wordCounts;
}
