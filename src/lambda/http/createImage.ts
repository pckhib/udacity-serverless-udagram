import * as AWS from 'aws-sdk';
import * as uuid from 'uuid';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';

const docClient = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3({
    signatureVersion: 'v4'
});

const groupsTable = process.env.GROUPS_TABLE;
const imagesTable = process.env.IMAGES_TABLE;
const bucketName = process.env.IMAGES_S3_BUCKET;
const urlExpiration: number = parseInt(process.env.SIGNED_URL_EXPIRATION);

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event);
  const groupId = event.pathParameters.groupId;
  const validGroupId = await groupExists(groupId);

  if (!validGroupId) {
      return {
          statusCode: 404,
          body: JSON.stringify({
              error: 'Group does not exists.'
          })
      }
  }

  const imageId = uuid.v4();
  const newItem = await createImage(groupId, imageId, event);

  const url = getUploadUrl(imageId);

  return {
    statusCode: 201,
    body: JSON.stringify({
      newItem,
      uploadUrl: url
    })
  }
});

async function createImage(groupId: string, imageId: string, event: any) {
    const timestamp = new Date().toISOString();
    const newImage = JSON.parse(event.body);

    const newItem = {
        groupId,
        timestamp, imageId,
        ...newImage,
        imageUrl: `https://${bucketName}.s3.amazonaws.com/${imageId}`
    };

    await docClient.put({
        TableName: imagesTable,
        Item: newItem
    }).promise();

    return newItem;
}

function getUploadUrl(imageId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: urlExpiration
  });
}

async function groupExists(groupId: string) {
    const result = await docClient
        .get({
            TableName: groupsTable,
            Key: {
                id: groupId
            }
        }).promise();

    return !!result.Item;
}

handler.use(
  cors({
    credentials: true
  })
);