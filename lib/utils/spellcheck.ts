export interface SpellCheckResult {
  original: string;
  corrected: string;
  changes: Array<{
    word: string;
    suggestion: string;
    position: { start: number; end: number };
  }>;
}

// Common typos and their corrections
const COMMON_TYPOS: Record<string, string> = {
  // Common word inversions
  teh: "the",
  taht: "that",
  dont: "don't",
  cant: "can't",
  wont: "won't",
  your: "you're",
  their: "they're",
  its: "it's",
  // Common misspellings
  accomodate: "accommodate",
  acheive: "achieve",
  begining: "beginning",
  beleive: "believe",
  cemetary: "cemetery",
  collegue: "colleague",
  commitee: "committee",
  concious: "conscious",
  eleciton: "election",
  existance: "existence",
  foriegn: "foreign",
  goverment: "government",
  happend: "happened",
  harrass: "harass",
  immediatly: "immediately",
  independant: "independent",
  knowlege: "knowledge",
  liason: "liaison",
  mispell: "misspell",
  neccessary: "necessary",
  noticable: "noticeable",
  occassion: "occasion",
  parliament: "parliament",
  persistant: "persistent",
  posession: "possession",
  privelege: "privilege",
  publically: "publicly",
  recieve: "receive",
  refered: "referred",
  relavant: "relevant",
  rythm: "rhythm",
  seperate: "separate",
  succesful: "successful",
  suprise: "surprise",
  truely: "truly",
  unfortunatly: "unfortunately",
  // YouTube-specific common errors
  youtube: "YouTube",
};

/**
 * Basic spell check with common typo corrections
 */
export function spellCheck(text: string): SpellCheckResult {
  const words = text.split(/(\s+)/);
  const changes: SpellCheckResult["changes"] = [];
  let position = 0;

  const correctedWords = words.map((word) => {
    const lowerWord = word.toLowerCase();
    const trimmedWord = word.trim();

    if (COMMON_TYPOS[lowerWord]) {
      const correction = COMMON_TYPOS[lowerWord];
      const corrected = applyCasing(correction, word);

      changes.push({
        word: word,
        suggestion: corrected,
        position: { start: position, end: position + word.length },
      });

      return corrected;
    }

    position += word.length;
    return word;
  });

  return {
    original: text,
    corrected: correctedWords.join(""),
    changes,
  };
}

/**
 * Apply original casing pattern to corrected word
 */
function applyCasing(corrected: string, original: string): string {
  if (original === original.toUpperCase()) {
    return corrected.toUpperCase();
  }
  if (original[0] === original[0].toUpperCase()) {
    return corrected.charAt(0).toUpperCase() + corrected.slice(1);
  }
  return corrected.toLowerCase();
}
