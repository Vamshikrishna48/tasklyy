import crypto from 'crypto';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { jobId, amount, productInfo, firstName, email, phone, workerId, posterId } = req.body;
  if (!jobId || !amount || !productInfo || !firstName || !email || !workerId || !posterId) {
    return res.status(400).json({ error: 'Missing required payment parameters' });
  }

  const merchantKey = process.env.PAYU_MERCHANT_KEY || 'gtKFFx'; // Fallback to PayU sandbox key
  const merchantSalt = process.env.PAYU_MERCHANT_SALT || 'eCwWELSp'; // Fallback to PayU sandbox salt
  const payuEnv = process.env.PAYU_ENV || 'test'; // 'test' or 'production'

  // Generate unique transaction ID
  const txnid = 'TXN_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

  // We set UDFs:
  // udf1 = jobId
  // udf2 = workerId (bidder_id)
  // udf3 = amount
  // udf4 = posterId
  // udf5 = empty
  const udf1 = jobId;
  const udf2 = workerId;
  const udf3 = amount.toString();
  const udf4 = posterId;
  const udf5 = '';

  // Hashing formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
  const hashString = `${merchantKey}|${txnid}|${amount}|${productInfo}|${firstName}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${merchantSalt}`;
  const hash = crypto.createHash('sha512').update(hashString).digest('hex');

  const postUrl = payuEnv === 'production' 
    ? 'https://secure.payu.in/_payment' 
    : 'https://test.payu.in/_payment';

  // Return the parameters to the frontend so it can post the form
  return res.status(200).json({
    success: true,
    postUrl,
    key: merchantKey,
    txnid,
    amount,
    productinfo: productInfo,
    firstname: firstName,
    email,
    phone: phone || '',
    udf1,
    udf2,
    udf3,
    udf4,
    udf5,
    hash
  });
}
