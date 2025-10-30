// tests/rule_engine.test.js

/**
 * Unit tests for rule_engine.js
 */

const { applyRules, rules } = require('../rule_engine');

describe('Rule Engine', () => {
  test('should apply all rules correctly', () => {
    const input = 'Could you please help me with this task? I would appreciate it if you could kindly assist. Thank you in advance!';
    const result = applyRules(input);
    
    expect(result.candidate).not.toContain('please');
    expect(result.candidate).not.toContain('kindly');
    expect(result.candidate).not.toContain('thank you');
    expect(result.applied_rules).toContain('r01_strip_polite');
  });

  test('should handle act as pattern', () => {
    const input = 'I want you to act as a helpful assistant';
    const result = applyRules(input);
    
    expect(result.candidate).toContain('Act as:');
    expect(result.candidate).not.toContain('I want you to act as');
    expect(result.applied_rules).toContain('r02_merge_act_as');
  });

  test('should remove closing lines', () => {
    const input = 'Please help me. Regards, John';
    const result = applyRules(input);
    
    expect(result.candidate).not.toContain('Regards');
    expect(result.applied_rules).toContain('r03_strip_closing');
  });

  test('should compress bullet lists', () => {
    const input = 'Here are the steps:\n- First step\n- Second step\n- Third step';
    const result = applyRules(input);
    
    expect(result.candidate).toContain('1.');
    expect(result.applied_rules).toContain('r04_compress_lists');
  });

  test('should remove filler words', () => {
    const input = 'This is very important and actually quite basic';
    const result = applyRules(input);
    
    expect(result.candidate).not.toContain('very');
    expect(result.candidate).not.toContain('actually');
    expect(result.candidate).not.toContain('basically');
    expect(result.applied_rules).toContain('r05_remove_fillers');
  });

  test('should extract parameters', () => {
    const input = 'Use "example" and 123 for testing';
    const result = applyRules(input);
    
    expect(result.candidate).toContain('<param: "example">');
    expect(result.candidate).toContain('<param: 123>');
    expect(result.applied_rules).toContain('r06_param_extract');
  });

  test('should detect concise profile', () => {
    const input = 'Please explain this briefly';
    const result = applyRules(input);
    
    expect(result.metadata.profile).toBe('concise');
    expect(result.applied_rules).toContain('r07_length_hint');
  });

  test('should normalize punctuation', () => {
    const input = 'Hello , world ! How are you ?';
    const result = applyRules(input);
    
    expect(result.candidate).toContain('Hello, world! How are you?');
    expect(result.applied_rules).toContain('r08_normalize_punc');
  });

  test('should be idempotent', () => {
    const input = 'Could you please help me?';
    const result1 = applyRules(input);
    const result2 = applyRules(result1.candidate);
    
    expect(result1.candidate).toBe(result2.candidate);
  });

  test('should handle empty input', () => {
    const result = applyRules('');
    expect(result.candidate).toBe('');
    expect(result.applied_rules).toEqual([]);
  });

  test('should handle whitespace normalization', () => {
    const input = 'Hello    world   with   multiple   spaces';
    const result = applyRules(input);
    
    expect(result.candidate).toBe('Hello world with multiple spaces');
  });
});
