export function appendWordFrequencyMap(wordCounts, words) {
  words.forEach((word) => {
    const lowercaseWord = word.toLowerCase();
    wordCounts.set(lowercaseWord, (wordCounts.get(lowercaseWord) || 0) + 1);
  });

  return wordCounts;
}
