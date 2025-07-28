/**
 * Demo: SCW Deployment and EIP-712 Validation
 * Using Coinbase Wallet SDK patterns
 */

const { SCWNodeDeployer, createNodeTestEIP712Message } = require('../dist/wallet');

async function runDemo() {
  console.log('🧪 Venice AI SDK - Smart Contract Wallet Demo\n');
  console.log('📌 This demo shows how to use Coinbase Wallet SDK patterns for:');
  console.log('   - P256 key generation');
  console.log('   - WebAuthn signature creation');
  console.log('   - EIP-712 message signing');
  console.log('   - SCW signature formatting\n');
  
  try {
    // Initialize deployer
    const deployer = new SCWNodeDeployer('https://keys.coinbase.com');
    console.log('✅ SCW Node Deployer initialized (for Node.js environment)\n');

    // Step 1: Generate P256 keypair
    console.log('🔑 Step 1: Generating P256 keypair...');
    const keypair = await deployer.generateP256Keypair();
    console.log('✅ P256 keypair generated using WebCrypto');
    
    // Create WebAuthn account
    const account = await deployer.createWebAuthnAccount(keypair);
    console.log('✅ WebAuthn account created');
    console.log('   Public key ID:', account.publicKey.slice(0, 20) + '...');

    // Step 2: Calculate SCW address
    console.log('\n📍 Step 2: Calculating SCW address...');
    const scwAddress = deployer.calculateSCWAddress(account.publicKey);
    console.log('✅ SCW address:', scwAddress);

    // Step 3: Create SCW (demo)
    console.log('\n🚀 Step 3: Creating Smart Contract Wallet (demo)...');
    const deployment = {
      address: scwAddress,
      account,
      keypair
    };
    console.log('✅ SCW ready for use!');

    // Step 4: Test message signing
    console.log('\n📝 Step 4: Testing message signing...');
    const plainMessage = 'Venice AI SDK + Coinbase Wallet = 🚀';
    const messageSig = await account.signMessage({ message: plainMessage });
    console.log('✅ Plain message signed');
    console.log('   Signature:', messageSig.signature.slice(0, 20) + '...');

    // Step 5: Create and sign EIP-712 message
    console.log('\n📋 Step 5: Creating EIP-712 message...');
    const eip712Message = createNodeTestEIP712Message(deployment.address);
    console.log('✅ EIP-712 message created');
    console.log('   Domain:', eip712Message.domain.name);
    console.log('   Version:', eip712Message.domain.version);
    console.log('   Chain ID:', eip712Message.domain.chainId);

    // Sign EIP-712 message
    console.log('\n🖊️ Signing EIP-712 message...');
    const typedDataSig = await account.signTypedData(eip712Message);
    console.log('✅ EIP-712 message signed');
    console.log('   Signature:', typedDataSig.signature.slice(0, 20) + '...');

    // Step 6: Format signature for SCW
    console.log('\n🔐 Step 6: Formatting signature for SCW validation...');
    const formattedSig = deployer.formatWebAuthnSignature(
      typedDataSig.signature,
      typedDataSig.webauthn,
      0 // owner index
    );
    console.log('✅ Signature formatted for SCW');
    console.log('   Format: WebAuthnAuth wrapped in SignatureWrapper');
    console.log('   Length:', formattedSig.length, 'chars');
    console.log('   Ready for on-chain validation!');

    // Summary
    console.log('\n📊 Summary:');
    console.log('   ✅ Used Coinbase SDK patterns for P256 keys');
    console.log('   ✅ Created WebAuthn-compatible signatures');
    console.log('   ✅ Signed both plain messages and EIP-712');
    console.log('   ✅ Formatted signatures for SCW validation');
    console.log('   ✅ No manual signature building required!');
    
    console.log('\n🎯 Key Benefits:');
    console.log('   - Clean API using ox library (same as Coinbase SDK)');
    console.log('   - Type-safe with full TypeScript support');
    console.log('   - Production-ready patterns');
    console.log('   - Compatible with all Coinbase Smart Wallets');

    console.log('\n💡 Next Steps:');
    console.log('   1. Deploy to Base Sepolia with real transactions');
    console.log('   2. Validate signatures on-chain with isValidSignature');
    console.log('   3. Integrate with AI agents for natural language control');

  } catch (error) {
    console.error('\n❌ Demo failed:', error);
    process.exit(1);
  }
}

// Run the demo
console.log('Starting Venice AI SDK - SCW Demo...\n');
runDemo()
  .then(() => {
    console.log('\n✅ Demo completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Unexpected error:', error);
    process.exit(1);
  }); 