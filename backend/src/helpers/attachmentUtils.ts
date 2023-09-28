import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic
const s3Bucket = process.env.S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export class AttachmentUtils {
  constructor(
    private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
    private readonly bucket = s3Bucket
  ) {}
  getAttachmentUrl(todoId: string): string {
    return `https://${this.bucket}.s3.amazonaws.com/${todoId}`
  }

  getSignedUrl(todoId: string): Promise<string> {
    return this.s3.getSignedUrlPromise('putObject', {
      Bucket: this.bucket,
      Key: todoId,
      Expires: urlExpiration
    })
  }
}
