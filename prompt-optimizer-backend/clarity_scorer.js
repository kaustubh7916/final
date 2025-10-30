const readability = require('readability-score');
const grammarCheck = require('grammar-check');

class ClarityScorer {
  constructor(config) {
    this.config = config || {
      readabilityWeight: 0.6,
      grammarWeight: 0.4
    };
  }

  async calculateClarityScore(text) {
    try {
      const readabilityScore = readability(text);
      const grammarScore = await grammarCheck.score(text);
      
      return {
        score: (readabilityScore * this.config.readabilityWeight) + 
               (grammarScore * this.config.grammarWeight),
        metrics: {
          readability: readabilityScore,
          grammar: grammarScore
        }
      };
    } catch (error) {
      console.error('Error calculating clarity score:', error);
      return {
        score: 0,
        metrics: {
          readability: 0,
          grammar: 0
        }
      };
    }
  }
}

module.exports = ClarityScorer;