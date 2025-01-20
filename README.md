# Twitter/X `X-Client-Transaction-ID Gen`
For starters let me give credit to the resources I used to transcribe this project into JS.
- https://github.com/fa0311/twitter-tid-deobf-fork
- https://github.com/iSarabjitDhiman/TweeterPy/tree/master (TID written in Python)
- https://github.com/fa0311/antibot_blog_archives (Articles on reversing the header gen)

##How to use it
1. `npm install`
2. Make sure in the src/main.js file to add your headers like `X-csrf-token` and `cookie` headers so that it can fetch the home page to get the `x-loading-anim` SVG's to get the loading data.

3. Make sure to set your `api/endpoint` to where you are requesting along with the method type ie POST or GET etc. Your file data should be the response.body of a request to the home page https://x.com/home.
```javascript
const file = response.body;
const client = await new ClientTransaction(file).init();
const transactionId = client.generateTransactionId('METHOD', '/api/endpoint');
```

4. `npm run start`
