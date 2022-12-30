from argparse import ArgumentParser
import copy
import json
from random import randint
import random
import sys
from decimal import *

class Account:
    def __init__(self, id):
        self.id = id
        self.balance = dict()
    def __str__(self):
        ss = f"Account: {self.id}\n"
        ss += f"Balance:\n"
        for key, token in self.balance.items():
            ss += f"  {token.name}: {token.balance}\n"
        return ss

class Token:
    def __init__(self, id, name, symbol, decimals, balance=0):
        self.id = id
        self.name = name
        self.symbol = symbol
        self.decimals = Decimal(str(decimals))
        self.balance = Decimal(str(balance))

def parse_arg():
    parser = ArgumentParser()
    parser.add_argument("-marketOrder", "--marketOrder", dest="marketOrder", help="enable market order or not", action="store_true", default=False)
    parser.add_argument("-n", "--orderNum", dest="orderNum", help="number of orders", type=int, required=True)
    parser.add_argument("-u", "--userNum", dest="userNum", help="number of users", type=int, required=True)
    parser.add_argument("-o", "--output", dest="output", help="output file", type=str, required=True)
    return parser.parse_args()

def getTokens():
    tokens = dict()
    ETH = Token(0, "Ethereum", "ETH", 18)
    tokens[ETH.id] = ETH
    USDC = Token(1, "USD Coin", "USDC", 6)
    tokens[USDC.id] = USDC
    return tokens

def getAccounts(userNum, tokens):
    accounts = []
    maxlist = [100, 1000000]
    for i in range(userNum):
        accounts.append(Account(i))
        for key, token in tokens.items():
            t = copy.deepcopy(token)
            t.balance = Decimal(str(randint(0, maxlist[t.id])))
            accounts[i].balance[t.id] = t
    return accounts

if __name__ == '__main__':
    args = parse_arg()
    tokens = getTokens()
    accounts = getAccounts(args.userNum, tokens)
    marketPair = "ETH/USDC"
    mainTokenId = 0
    baseTokenId = 1
    minPrice = 110000
    maxPrice = 130000
    orders = list()
    if args.marketOrder:
        reqTypes = ['limit', 'market']
    else:
        reqTypes = ['limit']
    
    for i in range(args.orderNum):
        reqType = random.choice(reqTypes)
        account = random.choice(accounts)
        side = random.choice(['buy', 'sell'])
        if reqType == 'limit':
            price = Decimal(str(random.randint(minPrice, maxPrice))) / Decimal('100')
            if side == 'buy':
                token = account.balance[baseTokenId]
                bq = Decimal(str(random.randint(0, token.balance * (10 ** token.decimals)))) / Decimal(str(10 ** token.decimals))
                mq = bq / price
                mq = mq.quantize(Decimal('.00000000'), ROUND_DOWN)
                bq = bq.quantize(Decimal('.00000000'), ROUND_DOWN)
                
            else:
                token = account.balance[mainTokenId]
                mq = Decimal(str(random.randint(0, token.balance * (10 ** token.decimals)))) / Decimal(str(10 ** token.decimals))
                bq = mq * price
                mq = mq.quantize(Decimal('.00000000'), ROUND_DOWN)
                bq = bq.quantize(Decimal('.00000000'), ROUND_DOWN)      
        else:
            price = 0
            if side == 'buy':
                token = account.balance[baseTokenId]
                bq = Decimal(str(random.randint(0, token.balance * (10 ** token.decimals)))) / Decimal(str(10 ** token.decimals))
                bq = bq.quantize(Decimal('.00000000'), ROUND_DOWN)
                mq = 0
            else:
                token = account.balance[mainTokenId]
                mq = Decimal(str(random.randint(0, token.balance * (10 ** token.decimals)))) / Decimal(str(10 ** token.decimals))
                mq = mq.quantize(Decimal('.00000000'), ROUND_DOWN)
                bq = 0
        
        order = dict()
        order['reqType'] = reqType
        order['marketPair'] = marketPair
        order['side'] = side
        order['price'] = str(price)
        order['accountId'] = account.id
        order['baseTokenId'] = baseTokenId
        order['mainTokenId'] = mainTokenId
        order['baseQty'] = str(bq)
        order['mainQty'] = str(mq)
        order['timestamp'] = i
        orders.append(order)
    
    with open(args.output, 'w') as f:
        json.dump(orders, f)