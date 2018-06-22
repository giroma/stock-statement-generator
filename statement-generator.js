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

let mergedArray = actions.concat(stock_actions) //merge 2 arrays since each object is displayed  per date

mergedArray.sort((a,b) => {//sort by date
  return new Date(a.date) - new Date(b.date);
})

let cumulativeShares = {}//empty object to add key value pairs to, structure {'APPL': {'sharesAmount': 500, 'avgPrice': 12.3}}
let cumulativeDividend = 0//dividend income initiated
let finalOutput = ''//what is displayed in a large string as the complete output

const cumulativeDisplay = (output, action, date) => { //commonly reused code for displaying cumulative shares and divident
  output += `On ${date}, you have:\n`
  for (var key in cumulativeShares) {//iterate over each ticker we own
    if (cumulativeShares[key].sharesAmount > 0) {  output += `    - ${cumulativeShares[key].sharesAmount} shares of ${key} at ${cumulativeShares[key].avgPrice.toFixed(2)} per share\n`}
  }
  output += `    - $${cumulativeDividend} of dividend income \n` +
            '  Transactions:\n'
  return output
}

const weightedAverage = (action, shares) => {//calculate new weighted avreage price per share
  cumulativeShares[action.ticker].avgPrice = (cumulativeShares[action.ticker].avgPrice * cumulativeShares[action.ticker].sharesAmount + action.price * action.shares)/(+cumulativeShares[action.ticker].sharesAmount + +action.shares)
  cumulativeShares[action.ticker].sharesAmount += shares
}

const sellProfit = (action, shares) => {
  return shares*action.price - shares*cumulativeShares[action.ticker].avgPrice
}

//TODO   same date

mergedArray.forEach((action) => {
  let shares = +action.shares
  let date = moment(action.date).format('YYYY-MM-DD')
  let output = `` //reset output for each iteration

  if (shares) { //transactions object, because only they have a shares key and value
    if (action.action == 'BUY') {//BUY

      if (cumulativeShares[action.ticker]) {//if stock already owned, add to it
        weightedAverage(action, shares)
      } else {//if not,create object first
        cumulativeShares[action.ticker] = {'sharesAmount': +shares, 'avgPrice': +action.price}
      }
      output += cumulativeDisplay(output, action, date)
      output += `    - You bought ${shares} shares of ${action.ticker} at a price of ${action.price} per share \n`
    } else { //SELL
      cumulativeShares[action.ticker].sharesAmount -= shares //subtract sold shares
      output += cumulativeDisplay(output, action, date)
      output += `    - You sold ${shares} shares of ${action.ticker} at a price of ${action.price} per share for a profit of $${sellProfit(action, shares)}\n`
    }

  } else { //dividends
    if (cumulativeShares[action.stock]) {//only output if you own this stock
      cumulativeDividend += (action.dividend*cumulativeShares[action.stock].sharesAmount)

      if (action.split) {//if a stock split happens
        cumulativeShares[action.stock].sharesAmount *= action.split
        cumulativeShares[action.stock].avgPrice /= action.split
        output += cumulativeDisplay(output, action, date)
        output += `    - ${action.stock} split ${action.split} to 1, and you have ${cumulativeShares[action.stock].sharesAmount} shares\n`
      }else{//dividend paid out
        output += cumulativeDisplay(output, action, date)
        output += `    - ${action.stock} paid out ${action.dividend} dividend per share, and you have ${cumulativeShares[action.stock].sharesAmount} shares\n`
      }
    }
  }
  finalOutput += output
})
console.log(finalOutput);
