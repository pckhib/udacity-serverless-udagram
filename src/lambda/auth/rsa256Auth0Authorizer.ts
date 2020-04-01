import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda';
import { verify } from 'jsonwebtoken';
import { JwtToken } from '../../auth/JwtToken';

const cert = `-----BEGIN CERTIFICATE-----
MIIDATCCAemgAwIBAgIJVZJV22YSHDAAMA0GCSqGSIb3DQEBCwUAMB4xHDAaBgNV
BAMTE3Bja2hpYi5ldS5hdXRoMC5jb20wHhcNMjAwMzMxMTUxNzEzWhcNMzMxMjA4
MTUxNzEzWjAeMRwwGgYDVQQDExNwY2toaWIuZXUuYXV0aDAuY29tMIIBIjANBgkq
hkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3r77sPLTb1qtHKwtZqFW5q1ChBPX3Fyu
dZC5DPAoB3961aH//pVL+G7NbQhZIGwa9Oy0cMte02NpjwpnXkw+aJKzpNYbiGI6
fuvCW5Q473FNcBlj9zs0I0JKkACjLr0DNnHjxz8gy5GTMGDYdTOMtAgB8ptRK22G
yrYGeybXjKwGvphPJM3XzMnoU/XWO292HsNf5Uo49qTO43P49HYcX4aatpGf6vzK
K8wTu2Y7ugpqvi5IC6VdNGF3bb94gGOIljMU+/5ORL1BzagyBJh5s1X5GUQKgY9F
2XJbo7WwIZEoe32QMkjelzB7tnVP9RZT4x7YB/botDuC3OnVC2W7iwIDAQABo0Iw
QDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBS/h/05CZGSMs5jTqpA9iRWVjkW
fTAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBADOAr+T0KPQ5MmQG
bHI5KX8Nii6WBbIlgFWaOwAqkyYva5ej5Xo/ekR5Xim4M5Zg2AuyIvT4vbSPNEr9
tKitTncWiejnhzv15Ntj7Iv8RgE6AE9krS7csiMT3aJwEqYJq6tXG17zzPUvenmi
cKHcu19rGU8lUyIDffJRZ0Ss0Dp99M9RId2ahiKWd6dqfR4sPSmbpPvBkffrnJG0
Vv4yiLMXojmeCzmVMrnPxtZRoKkeCJnW8szH68tYm0Wo+crToOd9JigZBhg273C1
L5vtEK46Krvi/ZSslw2FzTp7wNO0E5OvyrFyQH2TyyXPMNjrxTYmFbjVcQAuQrv0
4AYodsw=
-----END CERTIFICATE-----`;

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = verifyToken(event.authorizationToken);

    console.log('User was authorized');

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.log('User was not authorized', e.message);

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string) {
  if (!authHeader) {
    throw new Error('No authorization header');
  }

  if (!authHeader.toLocaleLowerCase().startsWith('bearer ')) {
    throw new Error('Invalid authorization header');
  }

  const split = authHeader.split(' ');
  const token = split[1];

  return verify(token, cert, { algorithms: ['RS256']}) as JwtToken;
}
