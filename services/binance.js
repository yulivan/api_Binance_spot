const Binance = require('node-binance-api')
const binance = new Binance().options({
    APIKEY: process.env.APIKEY,
    APISECRET: process.env.SECRET
})

module.exports = binance