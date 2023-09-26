import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { verify, decode } from 'jsonwebtoken'
import Axios from 'axios'

import { JwtPayload } from '../../auth/JwtPayload'
import { createLogger } from '../../utils/logger'
import { Jwt } from '../../auth/Jwt'

const logger = createLogger('auth')

const jwksUrl =
  'https://dev-hr7g3cgeczih5g1t.us.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)

  const jwtToken = await verifyToken(event.authorizationToken)

  logger.info('User was authorized', jwtToken)

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
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  const res = await Axios.get(jwksUrl)

  const jwks = res.data.keys

  const signingKey = jwks.find((key) => key.kid === jwt.header.kid)

  return new Promise((resolve, reject) => {
    verify(token, signingKey.publicKey, (err, decoded) => {
      if (err) {
        logger.error('verify error', err)
        reject(err)
      }
      resolve({
        iss: decoded.iss,
        sub: decoded.sub,
        iat: decoded.iat,
        exp: decoded.exp
      })
    })
  })
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

export function certToPEM(cert) {
  cert = cert.match(/.{1,64}/g).join('\n')
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`
  return cert
}
