const ClientTransaction = require('./transaction');
const rp = require('request-promise');

// Example usage
async function getData() {
    const url = 'https://x.com/home';
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        "Content-Type": "text/plain",
        'x-csrf-token': '',
        'cookie':'',
    }

    const response = await rp({
        url,
        headers,
        resolveWithFullResponse: true,
        
    });
    let file = response.body;
    try {
        const client = await new ClientTransaction(file).init();
        const transactionId = client.generateTransactionId('GET', '/api/endpoint');
        console.log(transactionId);
    } catch (error) {
        console.error('Error:', error);
    }
}

getData().catch(error => console.error('Error in getData:', error));