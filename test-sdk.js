// Test SDK methods
const { VeniceSDK } = require('./dist');

async function test() {
  try {
    console.log('Creating SDK...');
    const sdk = await VeniceSDK.New({ apiKey: 'test' });
    
    console.log('\nSDK object type:', typeof sdk);
    console.log('SDK constructor:', sdk.constructor.name);
    console.log('\nSDK own properties:', Object.getOwnPropertyNames(sdk));
    console.log('\nSDK prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(sdk)));
    
    console.log('\n--- Method checks ---');
    console.log('getModelRecommendations:', typeof sdk.getModelRecommendations);
    console.log('agents:', typeof sdk.agents);
    console.log('api:', typeof sdk.api);
    
    if (sdk.agents) {
      console.log('\n--- agents methods ---');
      console.log('agents.getModelRecommendations:', typeof sdk.agents.getModelRecommendations);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test(); 