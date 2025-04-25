const ClientTransaction = require('./transaction')
const rp = require('request-promise')

// Example usage
async function getData() {
  const url = 'https://x.com/home'
  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Content-Type': 'text/plain',
    'x-csrf-token':
      '89bd7809836cd131e5366443733430a48ee239047b1d03830573195c36f9cb5c9661277f7aa0755ac302069e47218cdc2b04716fab1dfb25332ab558d3591048b3b8ac5cd51d44fddde96c5515e69223',
    'cookie':
      'lang=en; guest_id=v1%3A171404645015656048; twid=u%3D1522586308069130240; auth_token=5816384c85fb2734fd87ecbbe302a08f9ef80bed; guest_id_ads=v1%3A171404645015656048; guest_id_marketing=v1%3A171404645015656048; ct0=89bd7809836cd131e5366443733430a48ee239047b1d03830573195c36f9cb5c9661277f7aa0755ac302069e47218cdc2b04716fab1dfb25332ab558d3591048b3b8ac5cd51d44fddde96c5515e69223; personalization_id="v1_GSebEFO4CzPekHV88VexQg=="; twtr_pixel_opt_in=Y; des_opt_in=Y; external_referer=padhuUp37zhC%2FjrbHxh4VV6OfEAFbdQCtMEvGYVfL9Q%3D|0|8e8t2xd8A2w%3D; lang=en; __cf_bm=95jQAVn1AhXJBqyuXsmYnqRaKCeV46zs1l.QSqkFecQ-1745563594-1.0.1.1-NGr449tP4M0gDWPS6j2IsDd1OQFVmztAm6WIny8JL1gJg3dTaVV.hjq88fFvOdi57cOpgu0z1Vvb7US76Jkxhz.t1uEvXqMFV.Rr88CvTvE',
  }

  const response = await rp({
    url,
    headers,
    resolveWithFullResponse: true,
  })
  let file = response.body
  try {
    const client = await new ClientTransaction(file).init()
    const transactionId = client.generateTransactionId('GET', '/api/endpoint')
    console.log(transactionId)
  } catch (error) {
    console.error('Error:', error)
  }
}

getData().catch((error) => console.error('Error in getData:', error))
