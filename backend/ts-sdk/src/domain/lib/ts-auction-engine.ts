import { cloneDeep } from 'lodash';
import { bigIntMax } from './bigint-helper';
import { ITsAuctionOrder } from './ts-rollup/ts-auction-order';
import { TsTxType } from './ts-types/ts-types';

export type NewAuctionOrder = {
    id?: number;
    type: TsTxType;
    interestRate: bigint; // x.xxxx
    amount: bigint;
    address: bigint;
}
interface AuctionOrderInterface extends NewAuctionOrder {
    id: number;
    createdTime: number;
    lastMatchedTime?: number;

    // matchedAmount: BigInt;
    matchDetails?: MatchedAuctionDetail[];
}

interface MatchedAuctionDetail {
    id: number;
    matchedAmount: bigint;
    matchedInterestRate: bigint;
}

export class AuctionOrder implements AuctionOrderInterface {
  public id: number;
  public type: TsTxType;
  public interestRate: bigint;
  public amount: bigint;
  public createdTime: number;
  public address: bigint;
  public matchedDetails?: MatchedAuctionDetail[];
  public lastMatchedTime?: number;

  constructor(id: number, order: ITsAuctionOrder) {
    this.id = id;
    this.type = order.reqType;
    this.interestRate = order.interest;
    this.amount = order.lendingAmt;
    this.address = order.L2AddrFrom;
    this.createdTime = order.timestamp;
  }

  public toString() {
    return `[\t${this.id},\t${this.amount},\t${this.interestRate},\t${this.matchedAmount},\t${this.matchedInterestRate},\t${this.createdTime}, ]`;
  }

  public get remainAmount(): bigint {
    return this.amount - this.matchedAmount;
  }

  public get matchedAmount(): bigint {
    if (!this.matchedDetails) {
      return BigInt(0);
    }
    return this.matchedDetails.reduce((a, b) => a + b.matchedAmount, BigInt(0));
  }

  public get matchedInterestRate(): bigint {
    if (!this.matchedDetails) {
      return BigInt(0);
    }

    // TotalMatchedInterstAmt / MatchedAmount
    return this.matchedDetails.reduce((acc, detail) => {
      const income = detail.matchedInterestRate * detail.matchedAmount;
      return (acc + income);
    }, 0n) / this.matchedAmount;
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
    // matchedBorrowOrders.forEach(order => {
    //   this.updateOrderByID(this.borrowOrders, order.id, order);
    // });
    // matchedLendOrders.forEach(order => {
    //   this.updateOrderByID(this.lendOrders, order.id, order);
    // });

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
        return a.id - b.id;
      }),
      matchedLendOrders: matchedLendOrders.sort((a: any, b: any) => {
        return a.id - b.id;
      }),
    };
  }

  updateOrderByID(orders: AuctionOrder[], id: number, update: Partial<AuctionOrder>) {
    const index = orders.findIndex(order => order.id === id);
    if (index > -1) {
      orders[index].updateOrder(update);
      return orders[index];
    }
  }

  removeOrderByID(type: TsTxType, id: number) {
    const orders = type === TsTxType.AUCTION_BORROW ? this.borrowOrders : this.lendOrders;
    const index = orders.findIndex(order => order.id === id);
    if (index > -1) {
      orders.splice(index, 1);
    }
  }

  addOrder(id: number, order: ITsAuctionOrder) {
    switch (order.reqType) {
      case TsTxType.AUCTION_BORROW:
        this.addBorrowOrder(id, order);
        break;
      case TsTxType.AUCTION_LEND:
        this.addLendOrder(id, order);
        break;
      default:
        console.error(order);
        throw new Error('Wrong order type.');
    }
  }

  addBorrowOrder(id: number, order: ITsAuctionOrder) {
    this.borrowOrders.push(
      new AuctionOrder(id, order),
    );
  }

  addLendOrder(id: number, order: ITsAuctionOrder) {
    this.lendOrders.push(
      new AuctionOrder(id, order)
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
      return BigInt(a) - BigInt(b) > 0 ? 1 : -1;
    }).map(key => BigInt(key));
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
        if (remainBorrowAmount <= 0n) {
          break;
        }
        const lendInterest = lendOrderInterestList[j];
        const currentLendOrders = lendOrderInterestMap[lendInterest.toString()];
        
        if (currentLendOrders?.length > 0 && (borrowOrder.interestRate >= lendInterest)) {
          for (let index = 0; index < currentLendOrders.length; index++) {
            if(remainBorrowAmount <= 0n) {
              break;
            }
            const lendOrder = currentLendOrders[index];
            const lendAmount = remainBorrowAmount - lendOrder.remainAmount >= 0 ? lendOrder.remainAmount : remainBorrowAmount;
            const detail: MatchedAuctionDetail = {
              id: lendOrder.id,
              matchedAmount: lendAmount,
              matchedInterestRate: lendInterest,
            };
            matchDetailList.push(detail);
            lendOrder.addMatchedDetail(detail);
            remainBorrowAmount = remainBorrowAmount - lendAmount;
          }

          // const sumLendAmount = currentLendOrders.reduce((acc, order) => {
          //   return acc + order.remainAmount;
          // }, BigInt(0));
          // if (sumLendAmount <= 0n) {
          //   continue;
          // }
          // const reduceAmount = (sumLendAmount > remainBorrowAmount) ? remainBorrowAmount : sumLendAmount;
          // currentLendOrders.forEach(lend => {
          //   const rate = lend.remainAmount / sumLendAmount;
          //   const lendAmount = reduceAmount * rate;
          //   const detail: MatchedAuctionDetail = {
          //     id: lend.id,
          //     matchedAmount: lendAmount,
          //     matchedInterestRate: lendInterest,
          //   };
          //   matchDetailList.push(detail);
          //   lend.addMatchedDetail(detail);
          // });
          // remainBorrowAmount = remainBorrowAmount - reduceAmount;
        }
      }
      // calc actual interest rate
      const maxRate = bigIntMax(matchDetailList.map(detail => detail.matchedInterestRate));
      matchDetailList.forEach(detail => {
        detail.matchedInterestRate = maxRate;
      });
      borrowOrder.addMatchedDetail(matchDetailList);
    }

    const matchedLendOrders: AuctionOrder[] = [];
    Object.values(lendOrderInterestMap).forEach(orders => {
      orders.forEach(order => {
        if (order.matchedAmount > 0n) {
          matchedLendOrders.push(order);
        }
      });
    });
    return {
      matchedBorrowOrders: borrowOrders.filter(order => order.matchedAmount > 0n),
      matchedLendOrders,
    };
  }
}
