import { Client } from 'minio';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Parse MinIO endpoint
function parseMinioEndpoint(endpoint: string | undefined) {
  if (!endpoint) {
    return { endPoint: 'localhost', port: 9000, useSSL: false };
  }

  const useSSL = endpoint.startsWith('https');
  const cleanEndpoint = endpoint.replace('http://', '').replace('https://', '');

  // Split host and port
  const [endPoint, portStr] = cleanEndpoint.split(':');
  const port = portStr ? parseInt(portStr, 10) : 9000;

  return { endPoint, port, useSSL };
}

async function testMinioConnection() {
  console.log('🔍 Testing MinIO Connection...\n');

  const endpoint = process.env.MINIO_ENDPOINT || 'http://localhost:9000';
  const { endPoint, port, useSSL } = parseMinioEndpoint(endpoint);

  console.log('Configuration:');
  console.log(`  Raw Endpoint: ${endpoint}`);
  console.log(`  Parsed Host: ${endPoint}`);
  console.log(`  Parsed Port: ${port}`);
  console.log(`  Use SSL: ${useSSL}`);
  console.log(`  Access Key: ${process.env.MINIO_ROOT_USER || 'minioadmin'}`);
  console.log(`  Secret Key: ${process.env.MINIO_ROOT_PASSWORD ? '***' : 'minioadmin'}`);
  console.log(`  Bucket: ${process.env.MINIO_BUCKET_NAME || 'arcraiders-uploads'}\n`);

  const minioClient = new Client({
    endPoint,
    port,
    useSSL,
    accessKey: process.env.MINIO_ROOT_USER || 'minioadmin',
    secretKey: process.env.MINIO_ROOT_PASSWORD || 'minioadmin',
    region: process.env.MINIO_REGION || 'us-east-1',
  });

  try {
    console.log('📡 Testing connection by listing buckets...');
    const buckets = await minioClient.listBuckets();
    console.log('✅ Connection successful!');
    console.log(`Found ${buckets.length} bucket(s):`);
    buckets.forEach((bucket) => {
      console.log(`  - ${bucket.name} (created: ${bucket.creationDate})`);
    });

    const bucketName = process.env.MINIO_BUCKET_NAME || 'arcraiders-uploads';
    const bucketExists = await minioClient.bucketExists(bucketName);

    console.log(`\n🪣 Checking bucket '${bucketName}'...`);
    if (bucketExists) {
      console.log(`✅ Bucket '${bucketName}' exists`);
    } else {
      console.log(`⚠️  Bucket '${bucketName}' does not exist`);
      console.log(`Creating bucket '${bucketName}'...`);
      await minioClient.makeBucket(bucketName, process.env.MINIO_REGION || 'us-east-1');
      console.log(`✅ Bucket '${bucketName}' created successfully`);
    }

    console.log('\n✨ All tests passed!');
  } catch (error: any) {
    console.error('\n❌ Connection failed!');
    console.error('Error details:');
    console.error(`  Code: ${error.code}`);
    console.error(`  Message: ${error.message}`);
    console.error(`  Status: ${error.statusCode}`);

    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Troubleshooting tips:');
      console.error('  1. Check if MinIO server is running');
      console.error('  2. Verify the endpoint is correct and accessible');
      console.error('  3. Check if firewall is blocking the connection');
      console.error('  4. If using Docker, verify network connectivity');
    } else if (error.code === 'InvalidAccessKeyId' || error.code === 'SignatureDoesNotMatch') {
      console.error('\n💡 Authentication issue:');
      console.error('  - Verify MINIO_ROOT_USER and MINIO_ROOT_PASSWORD are correct');
    }

    console.error('\nFull error:');
    console.error(error);
    process.exit(1);
  }
}

testMinioConnection();
