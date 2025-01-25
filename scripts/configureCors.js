const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();

async function checkCorsSettings() {
    try {
        console.log('Checking CORS settings for Azure Storage...');
        
        const blobServiceClient = BlobServiceClient.fromConnectionString(
            process.env.AZURE_STORAGE_CONNECTION_STRING
        );

        // Get current properties
        const properties = await blobServiceClient.getProperties();
        
        if (properties.cors && properties.cors.length > 0) {
            console.log('✅ CORS is configured with the following rules:');
            properties.cors.forEach((rule, index) => {
                console.log(`\nRule ${index + 1}:`);
                console.log('- Allowed Origins:', Array.isArray(rule.allowedOrigins) ? rule.allowedOrigins.join(', ') : rule.allowedOrigins);
                console.log('- Allowed Methods:', Array.isArray(rule.allowedMethods) ? rule.allowedMethods.join(', ') : rule.allowedMethods);
                console.log('- Allowed Headers:', Array.isArray(rule.allowedHeaders) ? rule.allowedHeaders.join(', ') : rule.allowedHeaders);
                console.log('- Exposed Headers:', Array.isArray(rule.exposedHeaders) ? rule.exposedHeaders.join(', ') : rule.exposedHeaders);
                console.log('- Max Age (seconds):', rule.maxAgeInSeconds);
            });

            console.log('\nTest CORS configuration:');
            const testBlobClient = blobServiceClient
                .getContainerClient('raw-uploads')
                .getBlockBlobClient('test-cors');
            
            const sasUrl = await testBlobClient.generateSasUrl({
                permissions: { read: true, write: true, create: true },
                expiresOn: new Date(new Date().valueOf() + 3600 * 1000),
            });

            console.log('✅ Successfully generated SAS URL with correct permissions');
            console.log('✅ Your CORS configuration looks good!');
        } else {
            console.log('⚠️ No CORS rules found. You may need to configure CORS through the Azure Portal:');
            console.log('1. Go to Azure Portal');
            console.log('2. Navigate to your Storage Account');
            console.log('3. Click on "Resource sharing (CORS)" under Settings');
            console.log('4. Add a new CORS rule with:');
            console.log('   - Allowed origins: *');
            console.log('   - Allowed methods: GET,HEAD,POST,PUT,DELETE,OPTIONS');
            console.log('   - Allowed headers: *');
            console.log('   - Exposed headers: *');
            console.log('   - Max age: 3600');
        }

    } catch (error) {
        console.error('\n❌ Failed to check CORS settings:', error.message);
    }
}

checkCorsSettings().catch(console.error);
