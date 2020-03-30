import { DynamoDBStreamHandler, DynamoDBStreamEvent } from 'aws-lambda';
// import * as elasticsearch from 'elasticsearch';
// import * as httpAwsEs from 'http-aws-es';

// const esHost = process.env.ES_ENDPOINT

// const es = new elasticsearch.Client({
//   hosts: [ esHost ],
//   connectionClass: httpAwsEs
// });

export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
  console.log('Processing events batch from DynamoDB', JSON.stringify(event));

  for (const record of event.Records) {
    console.log('Processing record', JSON.stringify(record));
  }
  // await es.index({
  //   index: 'images-index',
  //   type: 'images',
  //   id: 'id', // Document ID
  //   body: {  // Document to store
  //     title: 'title',
  //     imageUrl: 'https://example.com/image.png'
  //   }
  // });
}
