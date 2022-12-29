import BigNumber from 'bignumber.js';
import { max, cloneDeep, padStart } from 'lodash';
const ORDER_ID_LENGTH = 10;

export enum AuctionOrderTypeEnum {
    Borrow = 1,
    Lend = 2,
}
export type NewAuctionOrder = {
    id?: string;
    type: AuctionOrderTypeEnum;
    interestRate: BigNumber; // x.xxxx
    amount: BigNumber;
    address: string;
}
interface AuctionOrderInterface extends NewAuctionOrder {
    id: string;
    createdTime: number;
    lastMatchedTime?: number;

    // matchedAmount: BigNumber;
    matchDetails?: MatchedAuctionDetail[];
}

interface MatchedAuctionDetail {
    id: string;
    matchedAmount: BigNumber;
    matchedInterestRate: BigNumber;
}

export class AuctionOrder implements AuctionOrderInterface {
  public id: string;
  public type: AuctionOrderTypeEnum;
  public interestRate: BigNumber;
  public amount: BigNumber;
  public createdTime: number;
  public address: string;
  public matchedDetails?: MatchedAuctionDetail[];
  public lastMatchedTime?: number;

  constructor(AuctionOrder: AuctionOrderInterface) {
    this.id = AuctionOrder.id;
    this.type = AuctionOrder.type;
    this.interestRate = AuctionOrder.interestRate;
    this.amount = AuctionOrder.amount;
    this.address = AuctionOrder.address;
    this.createdTime = AuctionOrder.createdTime;
  }

  public get remainAmount(): BigNumber {
    return this.amount.minus(this.matchedAmount);
  }

  public get matchedAmount(): BigNumber {
    if (!this.matchedDetails) {
      return new BigNumber(0);
    }
    return this.matchedDetails.reduce((a, b) => a.plus(b.matchedAmount), new BigNumber(0));
  }

  public get matchedInterestRate(): BigNumber {
    if (!this.matchedDetails) {
      return new BigNumber(0);
    }

    // TotalMatchedInterstAmt / MatchedAmount
    return this.matchedDetails.reduce((acc, detail) => {
      return acc.plus(detail.matchedInterestRate.times(detail.matchedAmount));
    }, new BigNumber(0)).div(this.matchedAmount);
  }

  public updateOrder(update: Partial<AuctionOrder>) {
    Object.assign(this, update);
  }


  /*
     * return [id, type, interestRate, amount, matchedAmount, createdTime, address, lastMatchedTime]
     */
  public toFormat() {
    return JSON.stringify([
      this.id, this.type, this.interestRate.toString(), this.amount.toString(), this.matchedAmount.toString(), this.matchedInterestRate.toString(), this.matchedDetails?.map(detail => [
        detail.id, detail.matchedAmount.toString(), detail.matchedInterestRate.toString()
      ]), this.createdTime, this.address, this.lastMatchedTime
    ]);
  }

  public addMatchedDetail(detail: MatchedAuctionDetail | MatchedAuctionDetail[]) {
    if (!this.matchedDetails) {
      this.matchedDetails = [];
    }
    if (Array.isArray(detail)) {
      this.matchedDetails = this.matchedDetails.concat(detail);
    } else {
      this.matchedDetails.push(detail);
    }
    this.lastMatchedTime = Date.now();
  }
}

export class AuctionEngine {
  private borrowOrders: AuctionOrder[] = [];
  private lendOrders: AuctionOrder[] = [];

  constructor() { }

  getBorrowOrders() {
    return this.borrowOrders;
  }

  getLendOrders() {
    return this.lendOrders;
  }

  doMatchAuctionOrders() {
    const borrowOrders = cloneDeep(this.borrowOrders);
    const lendOrders = cloneDeep(this.lendOrders);
    const { matchedBorrowOrders, matchedLendOrders } = this.getMatchedOrders(borrowOrders, lendOrders);
    matchedBorrowOrders.forEach(order => {
      this.updateOrderByID(this.borrowOrders, order.id, order);
    });
    matchedLendOrders.forEach(order => {
      this.updateOrderByID(this.lendOrders, order.id, order);
    });

    /**
         * Lender
         * - Lender mint tsLToken
         * 
         * Borrower
         * - Borrower's collateral token from AuctionAccount transfer to tsBTokenAddr
         * - Lender's underlying token from AuctionAccount transfer to Borrower
         * - Borrower mint tsBToken which include debt, collateral and mutarityDate
         */
    // Lender
    // Lender's underlying token transfer to Borrower


    return {
      matchedBorrowOrders: matchedBorrowOrders.sort((a: any, b: any) => {
        return a.id.localeCompare(b.id);
      }),
      matchedLendOrders: matchedLendOrders.sort((a: any, b: any) => {
        return a.id.localeCompare(b.id);
      }),
    };
  }

  updateOrderByID(orders: AuctionOrder[], id: string, update: Partial<AuctionOrder>) {
    const index = orders.findIndex(order => order.id === id);
    if (index > -1) {
      orders[index].updateOrder(update);
      return orders[index];
    }
  }

  removeOrderByID(type: AuctionOrderTypeEnum, id: string) {
    const orders = type === AuctionOrderTypeEnum.Borrow ? this.borrowOrders : this.lendOrders;
    const index = orders.findIndex(order => order.id === id);
    if (index > -1) {
      orders.splice(index, 1);
    }
  }

  addOrder(order: NewAuctionOrder) {
    switch (order.type) {
      case AuctionOrderTypeEnum.Borrow:
        this.addBorrowOrder(order);
        break;
      case AuctionOrderTypeEnum.Lend:
        this.addLendOrder(order);
        break;
      default:
        throw new Error('Wrong order type.');
    }
  }

  addBorrowOrder(order: NewAuctionOrder) {
    this.borrowOrders.push(
      new AuctionOrder({
        ...order,
        id: 'B' + this.generateID(this.borrowOrders.length),
        createdTime: new Date().getTime(),
        type: AuctionOrderTypeEnum.Borrow,
      })
    );
  }

  addLendOrder(order: NewAuctionOrder) {
    this.lendOrders.push(
      new AuctionOrder({
        ...order,
        id: 'L' + this.generateID(this.lendOrders.length),
        createdTime: new Date().getTime(),
        type: AuctionOrderTypeEnum.Lend,
      })
    );
  }

  getLendOrderInterestMap(lendOrders: AuctionOrder[]) {
    const lendOrderInterestMap: {
            [key: string | number]: AuctionOrder[];
        } = {};
    for (let i = 0; i < lendOrders.length; i++) {
      if (!lendOrderInterestMap[lendOrders[i].interestRate.toString()]) {
        lendOrderInterestMap[lendOrders[i].interestRate.toString()] = [];
      }
      lendOrderInterestMap[lendOrders[i].interestRate.toString()].push(lendOrders[i]);
    }
    const lendOrderInterestList = Object.keys(lendOrderInterestMap).sort((a, b) => {
      return BigNumber(a).minus(b).toNumber();
    }).map(key => BigNumber(key));
    return { lendOrderInterestMap, lendOrderInterestList };
  }

  getMatchedOrders(unSortedBorrowOrders: AuctionOrder[], lendOrders: AuctionOrder[]) {
    const borrowOrders = unSortedBorrowOrders.sort((a, b) => a.createdTime - b.createdTime);
    const { lendOrderInterestMap, lendOrderInterestList } = this.getLendOrderInterestMap(lendOrders);

    for (let i = 0; i < borrowOrders.length; i++) {
      const borrowOrder = borrowOrders[i];
      let remainBorrowAmount = borrowOrder.remainAmount;
      const matchDetailList: MatchedAuctionDetail[] = [];
      for (let j = 0; j < lendOrderInterestList.length; j++) {
        if (remainBorrowAmount.lte(0)) {
          break;
        }
        const lendInterest = lendOrderInterestList[j];
        const currentLendOrders = lendOrderInterestMap[lendInterest.toString()];
        if (currentLendOrders?.length > 0 && BigNumber(borrowOrder.interestRate).gte(lendInterest)) {
          const sumLendAmount = currentLendOrders.reduce((acc, order) => {
            return acc.plus(order.remainAmount);
          }, BigNumber(0));
          if (sumLendAmount.lte(0)) {
            continue;
          }
          const reduceAmount = (sumLendAmount.gt(remainBorrowAmount)) ? remainBorrowAmount : sumLendAmount;
          currentLendOrders.forEach(lend => {
            const lendAmount = reduceAmount.multipliedBy(lend.remainAmount.div(sumLendAmount));
            const detail: MatchedAuctionDetail = {
              id: lend.id,
              matchedAmount: lendAmount,
              matchedInterestRate: lendInterest,
            };
            matchDetailList.push(detail);
            lend.addMatchedDetail(detail);
          });
          remainBorrowAmount = remainBorrowAmount.minus(reduceAmount);
        }
      }
      // calc actual interest rate
      const maxRate = BigNumber.max.apply(null, matchDetailList.map(detail => detail.matchedInterestRate));
      matchDetailList.forEach(detail => {
        detail.matchedInterestRate = maxRate;
      });
      borrowOrder.addMatchedDetail(matchDetailList);
    }

    const matchedLendOrders: AuctionOrder[] = [];
    Object.values(lendOrderInterestMap).forEach(orders => {
      orders.forEach(order => {
        if (order.matchedAmount.gt(0)) {
          matchedLendOrders.push(order);
        }
      });
    });
    return {
      matchedBorrowOrders: borrowOrders.filter(order => order.matchedAmount.gt(0)),
      matchedLendOrders,
    };
  }

  generateUUID(index: number) {
    let d = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    }).toUpperCase();
    return uuid;
  }

  generateID(index: number) {
    return padStart(index.toString(), ORDER_ID_LENGTH, '0');
  }
}
