const { BlobServiceClient, BlobSASPermissions } = require('@azure/storage-blob');
require('dotenv').config();

async function testAzureStorage() {
    try {
        console.log('Testing Azure Storage configuration...');
        
        // 1. Test connection
        console.log('\n1. Testing connection to Azure Storage...');
        const blobServiceClient = BlobServiceClient.fromConnectionString(
            process.env.AZURE_STORAGE_CONNECTION_STRING
        );
        console.log('✅ Successfully connected to Azure Storage');

        // 2. Check containers
        console.log('\n2. Checking containers...');
        const containers = ['raw-uploads', 'extracted-files'];
        for (const containerName of containers) {
            const containerClient = blobServiceClient.getContainerClient(containerName);
            const exists = await containerClient.exists();
            if (exists) {
                console.log(`✅ Container '${containerName}' exists`);
                
                // Test container permissions by trying to generate a SAS URL
                try {
                    const blobClient = containerClient.getBlobClient('test-permissions');
                    const permissions = new BlobSASPermissions();
                    permissions.write = true;
                    permissions.create = true;
                    
                    const sasUrl = await blobClient.generateSasUrl({
                        permissions,
                        expiresOn: new Date(new Date().valueOf() + 3600 * 1000),
                    });
                    console.log(`✅ Successfully generated SAS URL for '${containerName}'`);
                } catch (error) {
                    console.error(`❌ Failed to generate SAS URL for '${containerName}':`, error.message);
                }
            } else {
                console.log(`❌ Container '${containerName}' does not exist`);
                console.log('Attempting to create container...');
                try {
                    await containerClient.create();
                    console.log(`✅ Successfully created container '${containerName}'`);
                } catch (error) {
                    console.error(`❌ Failed to create container:`, error.message);
                }
            }
        }

        console.log('\n3. Testing blob operations...');
        const testContainer = blobServiceClient.getContainerClient('raw-uploads');
        const testBlobName = 'test-blob';
        const testBlobClient = testContainer.getBlobClient(testBlobName);

        // Test upload
        try {
            const content = 'Test content';
            const blockBlobClient = testContainer.getBlockBlobClient(testBlobName);
            await blockBlobClient.upload(content, content.length);
            console.log('✅ Successfully uploaded test blob');

            // Test delete
            await blockBlobClient.delete();
            console.log('✅ Successfully deleted test blob');
        } catch (error) {
            console.error('❌ Failed blob operations:', error.message);
        }

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        if (error.message.includes('InvalidResourceName')) {
            console.log('\nPossible issues:');
            console.log('1. Storage account name is invalid');
            console.log('2. Connection string is malformed');
        } else if (error.message.includes('AuthorizationFailure')) {
            console.log('\nPossible issues:');
            console.log('1. Connection string is invalid');
            console.log('2. Account keys are not properly set');
            console.log('3. Account access is restricted');
        }
    }
}

testAzureStorage().catch(console.error);
