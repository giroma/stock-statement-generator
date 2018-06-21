// Welcome to Forma.ai stock statement generator! In this problem, you will be coding up a transaction
// statement generator for a existing trader on our stock trading system. The inputs are provided below, and
// the exact output you are to generate is provided after the inputs.
//
// actions: the timestamped actions that the stock trader performed, it can be BUY or SELL type, and they can
// buy or sell a few different stocks. However, you should assume that the number of ticker is not limited to
// 3 types as in the example below, but potentially infinite, so the ticker should not be hardcoded anywhere.
//
// stock_actions: the timestamped actions that the stock performed regardless of who the trader is. It includes
// stock splits, and dividend payouts. Even though these actions are not performed by our trader, it still affects
// our trader's portfolios, so it should be recorded in the statement that we prepare.
//
// We are looking for easy to understand/extend program that doesn't perform any unnecessary actions.
//
// Feel free to extend the test cases to include new ones that exercises your program to the fullest.


const moment = require('moment');

const actions = [
  {'date': '1992/07/14 11:12:30', 'action': 'BUY', 'price': '12.3', 'ticker': 'AAPL', 'shares': '500'},
  {'date': '1992/09/13 11:15:20', 'action': 'SELL', 'price': '15.3', 'ticker': 'AAPL', 'shares': '100'},
  {'date': '1992/10/14 15:14:20', 'action': 'BUY', 'price': '20', 'ticker': 'MSFT', 'shares': '300'},
  {'date': '1992/10/17 16:14:30', 'action': 'SELL', 'price': '20.2', 'ticker': 'MSFT', 'shares': '200'},
  {'date': '1992/10/19 15:14:20', 'action': 'BUY', 'price': '21', 'ticker': 'MSFT', 'shares': '500'},
  {'date': '1992/10/23 16:14:30', 'action': 'SELL', 'price': '18.2', 'ticker': 'MSFT', 'shares': '600'},
  {'date': '1992/10/25 10:15:20', 'action': 'SELL', 'price': '20.3', 'ticker': 'AAPL', 'shares': '300'},
  {'date': '1992/10/25 16:12:10', 'action': 'BUY', 'price': '18.3', 'ticker': 'MSFT', 'shares': '500'}
]

const stock_actions = [
  {'date': '1992/08/14', 'dividend': '0.10', 'split': '', 'stock': 'AAPL'},
  {'date': '1992/09/01', 'dividend': '', 'split': '3', 'stock': 'AAPL'},
  {'date': '1992/10/15', 'dividend': '0.20', 'split': '', 'stock': 'MSFT'},
  {'date': '1992/10/16', 'dividend': '0.20', 'split': '', 'stock': 'ABC'}
]

let mergedArray = actions.concat(stock_actions)

mergedArray.sort((a,b) => {
  return new Date(a.date) - new Date(b.date);
})

let cumulativeShares = {}
let cumulativeDividend = 0
let finalOutput = ''

mergedArray.forEach((action) => {
  let ticker = action.ticker
  let shares = Number(action.shares)
  let date = moment(action.date).format('YYYY-MM-DD')
  let output = ``

  if (action.shares) { //transactions
    if (action.action == 'BUY') {//BUY
      output += `On ${date}, you have:\n`
      cumulativeShares[ticker] ? cumulativeShares[ticker] += shares : cumulativeShares[ticker] = shares
      for (var key in cumulativeShares) {
        if (cumulativeShares[key] > 0) {  output += `    - ${cumulativeShares[key]} shares of ${key} at ${action.price} per share\n`}
      }
      output += `  Transactions:\n` +
                `    - You bought ${action.shares} shares of ${action.ticker} at a price of ${action.price} per share \n`
    } else { //SELL
      cumulativeShares[ticker] -= shares
      output += `On ${date}, you have:\n`
      for (var key in cumulativeShares) {
        if (cumulativeShares[key] > 0) {  output += `    - ${cumulativeShares[key]} shares of ${key} at ${action.price} per share\n`}
      }
      output += `  Transactions:\n` +
                `    - You sold ${action.shares} shares of ${action.ticker} at a price of ${action.price} per share for a profit of $${(action.shares)*(action.price)}\n`
    }

  } else { //dividents
    if (cumulativeShares[action.stock]) {//only output if you own this stock
      output += `On ${date}, you have:\n`
      for (var key in cumulativeShares) {
        if (cumulativeShares[key] > 0) {  output += `    - ${cumulativeShares[key]} shares of ${key} at ${action.price} per share\n`}
      }
      console.log('dividend',action.dividend);
      cumulativeDividend += (action.dividend*cumulativeShares[action.stock])
      console.log('cumulativeDividend',cumulativeDividend);
      if (action.split) {
        cumulativeShares[action.stock] *= action.split
      }
      output += `  Transactions:\n` +
      `    - ${action.stock} paid out ${action.dividend} dividend per share, and you have ${cumulativeShares[action.stock]} shares\n`
    }
  }
  console.log(cumulativeShares);
  finalOutput += output
})
console.log(finalOutput);
