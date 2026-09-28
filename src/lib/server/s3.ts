import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { env } from '$env/dynamic/private';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env as publicEnv } from '$env/dynamic/public';

export const s3Client = new S3Client({
	region: env.S3_REGION!,
	endpoint: env.S3_ENDPOINT!,
	forcePathStyle: true,
	credentials: {
		accessKeyId: env.BACKBLAZE_KEY_ID!,
		secretAccessKey: env.BACKBLAZE_APPLICATION_KEY!
	}
});

export async function createPresignedDownloadURL(objectKey: string) {
	// const bucketName = 'photomap-louis';
	// const command = new GetObjectCommand({
	// 	Bucket: bucketName,
	// 	Key: objectKey
	// });
	// return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
	return `${publicEnv.PUBLIC_S3_PUBLIC_URL}/${objectKey}`;
}

export async function deleteObject(objectKey: string) {
	console.log('deleting', objectKey);
	const bucketName = env.S3_BUCKET_NAME!;
	const command = new DeleteObjectCommand({
		Bucket: bucketName,
		Key: objectKey
	});
	return await s3Client.send(command);
}

export async function createPresignedUploadURL(objectKey: string) {
	const bucketName = env.S3_BUCKET_NAME!;

	const command = new PutObjectCommand({
		Bucket: bucketName,
		Key: objectKey
	});
	return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}
