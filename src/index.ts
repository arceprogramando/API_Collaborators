import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (_req, res) => {
    const htmlResponse = `
    <html>
        <head>
            <title>Express</title>
        </head>
        <body>
            <h1>Express Changes test typescript</h1>
        </body>
    </html>
    `
    res.send(htmlResponse);
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})