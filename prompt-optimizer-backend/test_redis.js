const RedisCache = require('./redis_cache');
const config = require('./redis_config');

async function testRedisCache() {
  try {
    const cache = new RedisCache(config);
    
    // Test memory cache only
    await cache.set('test_key', {value: 'test_value'});
    const result = await cache.get('test_key');
    console.log('Memory cache test result:', result);
    
    // Test hash generation
    const hash = cache.generatePromptHash('test_prompt');
    console.log('Generated hash:', hash);
    
    await cache.close();
    console.log('Memory-only tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testRedisCache();