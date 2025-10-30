// tests/utils.test.js

/**
 * Unit tests for utils.js
 */

const { countTokens, jaccard, toJSONStructure, toXMLStructure, validateSemantic } = require('../utils');

describe('Utils', () => {
  describe('countTokens', () => {
    test('should count tokens correctly', () => {
      expect(countTokens('Hello world')).toBeGreaterThan(0);
      expect(countTokens('')).toBe(0);
      expect(countTokens('A single word')).toBeGreaterThan(0);
    });

    test('should handle empty string', () => {
      expect(countTokens('')).toBe(0);
    });

    test('should handle whitespace', () => {
      expect(countTokens('   ')).toBeGreaterThan(0);
    });
  });

  describe('jaccard', () => {
    test('should compute Jaccard similarity', () => {
      const score = jaccard('hello world', 'world hello');
      expect(score).toBe(1.0);
    });

    test('should handle identical strings', () => {
      const score = jaccard('test', 'test');
      expect(score).toBe(1.0);
    });

    test('should handle completely different strings', () => {
      const score = jaccard('hello', 'world');
      expect(score).toBe(0.0);
    });

    test('should handle partial similarity', () => {
      const score = jaccard('hello world', 'hello universe');
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(1);
    });

    test('should be case insensitive', () => {
      const score1 = jaccard('Hello World', 'hello world');
      const score2 = jaccard('hello world', 'hello world');
      expect(score1).toBe(score2);
    });
  });

  describe('toJSONStructure', () => {
    test('should create JSON structure', () => {
      const result = toJSONStructure('test prompt');
      expect(result.type).toBe('prompt');
      expect(result.content).toBe('test prompt');
      expect(result.length).toBe(11);
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('toXMLStructure', () => {
    test('should create XML structure', () => {
      const result = toXMLStructure('test prompt');
      expect(result).toContain('<prompt');
      expect(result).toContain('test prompt');
      expect(result).toContain('length="11"');
    });
  });

  describe('validateSemantic', () => {
    test('should validate semantic similarity', async () => {
      const result = await validateSemantic('hello world', 'world hello');
      expect(result.jaccard).toBe(1.0);
      expect(result.passed).toBe(true);
      expect(result.threshold).toBeDefined();
    });

    test('should handle low similarity', async () => {
      const result = await validateSemantic('hello world', 'completely different');
      expect(result.jaccard).toBeLessThan(1);
      expect(result.passed).toBe(false);
    });

    test('should use default threshold', async () => {
      const result = await validateSemantic('hello', 'world');
      expect(result.threshold).toBe(0.7);
    });
  });
});
