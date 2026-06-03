export default async function handler(req, res) {
  let payload = req.method === 'POST' ? req.body : req.query;
  if (typeof payload === 'string') {
    payload = Object.fromEntries(new URLSearchParams(payload));
  }

  const jobId = payload.udf1 || '';
  if (jobId) {
    return res.redirect(`/jobs/${jobId}?payment=failed`);
  }
  return res.redirect(`/jobs?payment=failed`);
}
