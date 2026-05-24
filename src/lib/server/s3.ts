import { GetObjectCommand, S3Client,  } from "@aws-sdk/client-s3";
import { BACKBLAZE_APPLICATION_KEY, BACKBLAZE_KEY_ID } from '$env/static/private';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3Client = new S3Client({
    region: "eu-central-003",
    credentials: {
      accessKeyId: BACKBLAZE_KEY_ID,
      secretAccessKey: BACKBLAZE_APPLICATION_KEY,
    }
});

export async function createPresignedURL(objectKey: string) {
    const bucketName = "photomap-louis";
    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
    });
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}