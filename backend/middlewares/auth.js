const { expressjwt: jwt } = require('express-jwt');  // use expressjwt
const jwksRsa = require('jwks-rsa');

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),
  audience: process.env.AUTH0_API_IDENTIFIER,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
});

console.log('checkJwt middleware created:', typeof checkJwt); // Should log 'function'


module.exports = checkJwt;
