import { Column, PrimaryColumn, ViewEntity } from 'typeorm';

@ViewEntity('AuctionRemainOrderView', { schema: 'public', 
  expression: `
  SELECT 
    main."lendingAmt" - SUM(match."lendingAmt") AS "lendingAmt",
    main."collateralAmt" - SUM(match."collateralAmt") AS "collateralAmt",
    main."borrowingAmt" - SUM(main."borrowingAmt") AS "borrowingAmt",
    match."matchId" AS "orderId",
    main."L2TokenAddrTokenLending"  AS "L2TokenAddrTokenLending",
    main."L2TokenAddrTokenCollateral" AS "L2TokenAddrTokenCollateral",
    main."L2TokenAddrTokenBorrowing" AS "L2TokenAddrTokenBorrowing",
    main."L2AddrFrom" AS "L2AddrFrom", 
    main."L2AddrTo" AS "L2AddrTo",
    main."L2TokenAddrTSL" AS "L2TokenAddrTSL"
  FROM "AuctionMainOrder" main JOIN "AuctionMatchOrder" match ON main."orderId"  = match."matchId" 
  GROUP BY match."matchId", 
      main."lendingAmt", 
      main."collateralAmt", 
      main."borrowingAmt", 
      main."L2TokenAddrTokenLending", 
      main."L2TokenAddrTokenCollateral", 
      main."L2TokenAddrTokenBorrowing", 
      main."L2AddrFrom", 
      main."L2AddrTo", 
      main."L2TokenAddrTSL";
  `})
  export class AuctionRemainOrderView {
    @PrimaryColumn({
      type: 'integer',
      name: 'orderId',
      primary: true,
    })
    orderId!: number;
    @Column({
      type: 'decimal',
      name: 'L2AddrFrom',
      precision: 86,
      scale: 0, 
      nullable: true,
      default: 0
    })
    L2AddrFrom!: bigint;
    @Column({
      type: 'decimal',
      name: 'L2AddrTo',
      precision: 86,
      scale: 0,
      nullable: true,
      default: 0
    })
    L2AddrTo!: bigint;
    @Column({
      type: 'decimal',
      name: 'L2AddrTokenLending',
      precision: 86,
      scale: 0,
      nullable: true,
      default: 0
    })
    L2AddrTokenLending!: bigint;
    @Column({
      type: 'decimal',
      name: 'lendingAmt',
      precision: 86,
      scale: 0,
      nullable: true,
      default: 0
    })
    lendingAmt!: bigint;
    @Column({
      type: 'decimal',
      name: 'L2AddrTokenCollateral',
      precision: 86,
      scale: 0,
      nullable: true,
      default: 0
    })
    L2AddrTokenCollateral!: bigint;
    @Column({
      type: 'decimal',
      name: 'collateralAmt',
      precision: 86,
      scale: 0,
      nullable: true,
      default: 0
    })
    collateralAmt!: bigint;
    @Column({
      type: 'decimal',
      name: 'L2AddrTokenBorrowing',
      precision: 86,
      scale: 0,
      nullable: true,
      default: 0
    })
    L2AddrTokenBorrowing!: bigint;
    @Column({
      type: 'decimal',
      name: 'borrowingAmt',
      precision: 86,
      scale: 0,
      nullable: true,
      default: 0
    })
    borrowingAmt!: bigint;
    @Column({
      type: 'decimal',
      name: 'L2AddrTokenTSL',
      precision: 86,
      scale: 0,
      nullable: true,
      default: 0
    })
    L2AddrTokenTSL!: bigint;
  }
