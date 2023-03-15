import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult, PolicyDocument } from 'aws-lambda';
import * as process from "process";

/* {
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "execute-api:Invoke",
      "Effect": "Allow" / "Deny",
      "Resource": "arn:aws:execute-api:us-east-1:123456789012:ivdtdhp7b5/ESTestInvoke-stage/GET/"
    }
  ]
} */

enum Effect {
  Allow = 'Allow',
  Deny = "Deny"
}

const generateResponse = (principalId: string, effect: Effect, resourse: string): APIGatewayAuthorizerResult => {
  return {
    principalId,
    policyDocument: generatePolicyDocument(effect, resourse),
  }
}

const generatePolicyDocument = (effect: Effect, resourse: string): PolicyDocument => {
  return {
    Version: '2012-10-17',
    Statement: [{
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resourse,
    }]
  }
}
const basicAuthorizer = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  console.log('[basicAuthorizer] event: ', event);
  /* {
    "type":"TOKEN",
    "authorizationToken":"{caller-supplied-token}",
    "methodArn":"arn:aws:execute-api:{regionId}:{accountId}:{apiId}/{stage}/{httpVerb}/[{resource}/[{child-resources}]]"
  } */
  try {
    const { authorizationToken, methodArn } = event;

    const encodedCreds = authorizationToken.split(' ')[1];
    const buff = Buffer.from(encodedCreds, 'base64');
    const plainCreds = buff.toString('utf-8').split(':');
    const [ userName, password ] = plainCreds;

    const storedUserPassword = process.env[userName];
    const effect = storedUserPassword && storedUserPassword === password ? Effect.Allow : Effect.Deny;

    const response = generateResponse(userName, effect, methodArn);
    console.info('[basicAuthorizer] response: ', JSON.stringify(response));
    return response;
  } catch (error) {
    console.error('[basicAuthorizer] error: ', error);
  }
};

export const main = basicAuthorizer;
