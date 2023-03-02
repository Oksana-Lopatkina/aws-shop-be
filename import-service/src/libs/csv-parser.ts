import csv from 'csv-parser';

export const parseCsvStream = async (stream: NodeJS.ReadableStream): Promise<void> => {
  const parseResult = [];
  await new Promise((resolve, reject) => {
      stream.pipe(csv())
          .on('data', (data) => {
              parseResult.push(data);
              console.log('parseCsvStream onData: ', data);
          })
          .on('end', () => {
              console.log('parseCsvStream onEnd: ', parseResult);
              resolve(parseResult.length);
          })
          .on('error', (error) => {
              console.log('parseCsvStream: ', error);
              reject(error);
          });
  });
}
