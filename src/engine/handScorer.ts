// engine/handScorer.ts

export const RANKS = "23456789TJQKA";

export type Card = string; // e.g. "A♠"

export type HandScore = {
  type: string;           // e.g., "Full House", "Flush"
  ranks: string[];        // main ranks + kickers in descending order
};

// -----------------------------------------
// Parsing and counting helpers
// -----------------------------------------
function parseCards(cards: Card[]) {
  return cards.map(c => ({ rank: c[0], suit: c[1] }));
}

function countRanks(cards: { rank: string, suit: string }[]) {
  const rankCount: Record<string, number> = {};
  cards.forEach(c => (rankCount[c.rank] = (rankCount[c.rank] || 0) + 1));
  return rankCount;
}

function countSuits(cards: { rank: string, suit: string }[]) {
  const suitCount: Record<string, string[]> = {};
  cards.forEach(c => {
    suitCount[c.suit] = suitCount[c.suit] || [];
    suitCount[c.suit].push(c.rank);
  });
  return suitCount;
}

// -----------------------------------------
// Hand detection
// -----------------------------------------
function detectMultiples(rankCount: Record<string, number>) {
  const fours = Object.keys(rankCount).filter(r => rankCount[r] === 4).sort((a,b)=>RANKS.indexOf(b)-RANKS.indexOf(a));
  const threes = Object.keys(rankCount).filter(r => rankCount[r] === 3).sort((a,b)=>RANKS.indexOf(b)-RANKS.indexOf(a));
  const pairs = Object.keys(rankCount).filter(r => rankCount[r] === 2).sort((a,b)=>RANKS.indexOf(b)-RANKS.indexOf(a));
  return { fours, threes, pairs };
}

function detectFlush(suitCount: Record<string, string[]>) {
  const flushSuit = Object.keys(suitCount).find(s => suitCount[s].length >= 5);
  return flushSuit ? suitCount[flushSuit].sort((a,b)=>RANKS.indexOf(b)-RANKS.indexOf(a)) : null;
}

function detectStraight(ranks: string[]) {
  const indices = Array.from(new Set(ranks.map(r => RANKS.indexOf(r)))).sort((a,b)=>a-b);

  for (let i = 0; i <= indices.length - 5; i++) {
    if (indices[i+4] - indices[i] === 4) {
      return indices.slice(i, i+5).map(i => RANKS[i]);
    }
  }

  // special A-2-3-4-5
  if (indices.includes(12) && indices.includes(0) && indices.includes(1) && indices.includes(2) && indices.includes(3)) {
    return ['A','2','3','4','5'];
  }

  return null;
}

function detectFullHouse(threes: string[], pairs: string[]) {
  if (threes.length >= 1) {
    if (pairs.length >= 1 || threes.length > 1) {
      return { three: threes[0], pair: pairs[0] || threes[1] };
    }
  }
  return null;
}

// -----------------------------------------
// Main scoring function
// -----------------------------------------
export function scoreHand(holeCards: Card[], communityCards: Card[]): HandScore {
  const allCards = parseCards([...holeCards, ...communityCards]);
  const rankCount = countRanks(allCards);
  const suitCount = countSuits(allCards);
  const { fours, threes, pairs } = detectMultiples(rankCount);

  const allRanks = allCards.map(c => c.rank);
  const flushRanks = detectFlush(suitCount);
  const straightRanks = detectStraight(allRanks);
  const straightFlushRanks = flushRanks ? detectStraight(flushRanks) : null;

  let type = "High Card";
  let mainRanks: string[] = [];

  if (straightFlushRanks) {
    type = straightFlushRanks.includes('A') && straightFlushRanks.includes('K') ? "Royal Flush" : "Straight Flush";
    mainRanks = straightFlushRanks;
  } else if (fours.length) {
    type = "Four of a Kind";
    mainRanks = [fours[0]];
  } else {
    const fullHouse = detectFullHouse(threes, pairs);
    if (fullHouse) {
      type = "Full House";
      mainRanks = [fullHouse.three, fullHouse.pair];
    } else if (flushRanks) {
      type = "Flush";
      mainRanks = flushRanks.slice(0,5);
    } else if (straightRanks) {
      type = "Straight";
      mainRanks = straightRanks;
    } else if (threes.length) {
      type = "Three of a Kind";
      mainRanks = [threes[0]];
    } else if (pairs.length >= 2) {
      type = "Two Pair";
      mainRanks = [pairs[0], pairs[1]];
    } else if (pairs.length === 1) {
      type = "Pair";
      mainRanks = [pairs[0]];
    } else {
      type = "High Card";
      mainRanks = [];
    }
  }

  // add kickers
  const sortedRanks = [...allRanks].sort((a,b)=>RANKS.indexOf(b)-RANKS.indexOf(a));
  const kickers = sortedRanks.filter(r=>!mainRanks.includes(r)).slice(0, 5 - mainRanks.length);
  return { type, ranks: [...mainRanks, ...kickers] };
}

// -----------------------------------------
// Hand rank values
// -----------------------------------------
const HAND_RANK_VALUES: Record<string, number> = {
  "High Card": 1,
  "Pair": 2,
  "Two Pair": 3,
  "Three of a Kind": 4,
  "Straight": 5,
  "Flush": 6,
  "Full House": 7,
  "Four of a Kind": 8,
  "Straight Flush": 9,
  "Royal Flush": 10,
};

// -----------------------------------------
// Determine winner(s)
// -----------------------------------------
export function determineWinners(scores: Record<string, HandScore>): string[] {
  let winners: string[] = [];
  let bestRank = -1;

  // Step 1: highest hand type
  for (const pid in scores) {
    const rank = HAND_RANK_VALUES[scores[pid].type] ?? 0;
    if (rank > bestRank) {
      bestRank = rank;
      winners = [pid];
    } else if (rank === bestRank) {
      winners.push(pid);
    }
  }

  // Step 2: tie-breaking using main ranks + kickers
  if (winners.length > 1) {
    for (let i = 0; i < 5; i++) {
      let topValue = -1;
      let filtered: string[] = [];

      for (const pid of winners) {
        const score = scores[pid];
        if (score.ranks[i]) {
          const val = RANKS.indexOf(score.ranks[i]);
          if (val > topValue) {
            topValue = val;
            filtered = [pid];
          } else if (val === topValue) {
            filtered.push(pid);
          }
        }
      }

      winners = filtered;
      if (winners.length === 1) break;
    }
  }

  return winners;
}
