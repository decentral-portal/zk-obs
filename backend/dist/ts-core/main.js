/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("cluster");;

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.bootstrap = void 0;
const ts_operator_module_1 = __webpack_require__(3);
const setup_helper_1 = __webpack_require__(71);
async function bootstrap() {
    const app = await (0, setup_helper_1.setupApp)(ts_operator_module_1.TsOperatorModule);
    return app;
}
exports.bootstrap = bootstrap;


/***/ }),
/* 3 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TsOperatorModule = void 0;
const operator_processor_1 = __webpack_require__(4);
const pinoLogger_service_1 = __webpack_require__(6);
const common_1 = __webpack_require__(7);
const logger_module_1 = __webpack_require__(15);
const config_1 = __webpack_require__(11);
const constant_1 = __webpack_require__(5);
const BullQueue_module_1 = __webpack_require__(19);
const nestjs_ethers_1 = __webpack_require__(10);
const nest_bullmq_1 = __webpack_require__(13);
const tstypeorm_module_1 = __webpack_require__(20);
const operator_producer_1 = __webpack_require__(63);
const rollupInformation_entity_1 = __webpack_require__(61);
const typeorm_1 = __webpack_require__(21);
const transactionInfo_entity_1 = __webpack_require__(38);
const cluster_module_1 = __webpack_require__(69);
const worker_service_1 = __webpack_require__(64);
let TsOperatorModule = class TsOperatorModule {
    logger;
    workerService;
    constructor(logger, workerService) {
        this.logger = logger;
        this.workerService = workerService;
    }
    onModuleInit() {
        this.workerService.ready();
    }
};
TsOperatorModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            logger_module_1.LoggerModule,
            BullQueue_module_1.BullQueueModule,
            nest_bullmq_1.BullModule.registerQueue(constant_1.TsWorkerName.OPERATOR),
            tstypeorm_module_1.TsTypeOrmModule,
            typeorm_1.TypeOrmModule.forFeature([
                rollupInformation_entity_1.RollupInformation,
                transactionInfo_entity_1.TransactionInfo
            ]),
            nestjs_ethers_1.EthersModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    network: {
                        name: 'LOCAL',
                        chainId: 31337,
                        _defaultProvider: (providers) => {
                            return new providers.JsonRpcProvider('http://localhost:8545');
                        }
                    },
                    etherscan: configService.get('ETHERSCAN_API_KEY'),
                    quorum: 1,
                    useDefaultProvider: true,
                }),
            }),
            cluster_module_1.WorkerModule,
        ],
        controllers: [],
        providers: [
            operator_processor_1.OperatorConsumer,
            operator_producer_1.OperatorProducer,
        ],
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof pinoLogger_service_1.PinoLoggerService !== "undefined" && pinoLogger_service_1.PinoLoggerService) === "function" ? _a : Object, typeof (_b = typeof worker_service_1.WorkerService !== "undefined" && worker_service_1.WorkerService) === "function" ? _b : Object])
], TsOperatorModule);
exports.TsOperatorModule = TsOperatorModule;


/***/ }),
/* 4 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OperatorConsumer = void 0;
const constant_1 = __webpack_require__(5);
const pinoLogger_service_1 = __webpack_require__(6);
const nestjs_ethers_1 = __webpack_require__(10);
const config_1 = __webpack_require__(11);
const ABI = __webpack_require__(12);
const nest_bullmq_1 = __webpack_require__(13);
const bullmq_1 = __webpack_require__(14);
let OperatorConsumer = class OperatorConsumer {
    config;
    logger;
    ethersSigner;
    ethersContract;
    wallet;
    contract;
    constructor(config, logger, ethersSigner, ethersContract) {
        this.config = config;
        this.logger = logger;
        this.ethersSigner = ethersSigner;
        this.ethersContract = ethersContract;
        this.wallet = this.ethersSigner.createWallet(this.config.get('ETHEREUM_OPERATOR_PRIV', ''));
        this.contract = this.ethersContract.create(this.config.get('ETHEREUM_ROLLUP_CONTRACT_ADDR', ''), ABI, this.wallet);
    }
    async process(job) {
        this.logger.log(`OperatorConsumer.process ${job.data.blockNumber}`);
        return true;
    }
};
__decorate([
    (0, nest_bullmq_1.BullWorkerProcess)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof bullmq_1.Job !== "undefined" && bullmq_1.Job) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], OperatorConsumer.prototype, "process", null);
OperatorConsumer = __decorate([
    (0, nest_bullmq_1.BullWorker)({
        queueName: constant_1.TsWorkerName.OPERATOR,
        options: {
            concurrency: 1
        }
    }),
    __param(2, (0, nestjs_ethers_1.InjectSignerProvider)()),
    __param(3, (0, nestjs_ethers_1.InjectContractProvider)()),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof pinoLogger_service_1.PinoLoggerService !== "undefined" && pinoLogger_service_1.PinoLoggerService) === "function" ? _b : Object, typeof (_c = typeof nestjs_ethers_1.EthersSigner !== "undefined" && nestjs_ethers_1.EthersSigner) === "function" ? _c : Object, typeof (_d = typeof nestjs_ethers_1.EthersContract !== "undefined" && nestjs_ethers_1.EthersContract) === "function" ? _d : Object])
], OperatorConsumer);
exports.OperatorConsumer = OperatorConsumer;


/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TsWorkerName = void 0;
var TsWorkerName;
(function (TsWorkerName) {
    TsWorkerName["UNKNOWN"] = "unknown";
    TsWorkerName["CORE"] = "TsCore";
    TsWorkerName["OPERATOR"] = "TsOperator";
    TsWorkerName["PROVER"] = "TsProver";
    TsWorkerName["SEQUENCER"] = "TsSequencer";
    TsWorkerName["GATEWAY"] = "TsGateway";
})(TsWorkerName = exports.TsWorkerName || (exports.TsWorkerName = {}));


/***/ }),
/* 6 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PinoLoggerService = void 0;
const common_1 = __webpack_require__(7);
const helper_1 = __webpack_require__(8);
const nestjs_pino_1 = __webpack_require__(9);
let PinoLoggerService = class PinoLoggerService extends common_1.ConsoleLogger {
    logger;
    contextName;
    constructor(logger) {
        super();
        this.logger = logger;
        this.contextName = 'context';
    }
    setContext(name) {
        this.logger.setContext(name);
    }
    verbose(message, context, ...args) {
        if (context) {
            this.logger.trace({ [this.contextName]: context, process: (0, helper_1.getProcessName)() }, message, ...args);
        }
        else {
            this.logger.trace(message, ...args);
        }
    }
    debug(message, context, ...args) {
        if (context) {
            this.logger.debug({ [this.contextName]: context, process: (0, helper_1.getProcessName)() }, message, ...args);
        }
        else {
            this.logger.debug(message, ...args);
        }
    }
    log(message, context, ...args) {
        if (context) {
            this.logger.info({ [this.contextName]: context, process: (0, helper_1.getProcessName)() }, message, ...args);
        }
        else {
            this.logger.info(message, ...args);
        }
    }
    warn(message, context, ...args) {
        if (context) {
            this.logger.warn({ [this.contextName]: context, process: (0, helper_1.getProcessName)() }, message, ...args);
        }
        else {
            this.logger.warn(message, ...args);
        }
    }
    error(message, trace, context, ...args) {
        if (context) {
            this.logger.error({ [this.contextName]: context, trace, process: (0, helper_1.getProcessName)() }, message, ...args);
        }
        else if (trace) {
            this.logger.error({ trace }, message, ...args);
        }
        else {
            this.logger.error(message, ...args);
        }
    }
};
PinoLoggerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof nestjs_pino_1.PinoLogger !== "undefined" && nestjs_pino_1.PinoLogger) === "function" ? _a : Object])
], PinoLoggerService);
exports.PinoLoggerService = PinoLoggerService;


/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = require("@nestjs/common");;

/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.delay = exports.getWorkerName = exports.getProcessName = void 0;
function getProcessName() {
    return `${getWorkerName()}-${process.pid}`;
}
exports.getProcessName = getProcessName;
function getWorkerName() {
    return process.env.TS_WORKER_NAME;
}
exports.getWorkerName = getWorkerName;
function delay(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}
exports.delay = delay;


/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("nestjs-pino");;

/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("nestjs-ethers");;

/***/ }),
/* 11 */
/***/ ((module) => {

module.exports = require("@nestjs/config");;

/***/ }),
/* 12 */
/***/ ((module) => {

module.exports = JSON.parse('[{"inputs":[{"internalType":"address","name":"wETHAddr_","type":"address"},{"internalType":"address","name":"verifierAddr_","type":"address"},{"internalType":"bytes32","name":"genesisStateRoot","type":"bytes32"},{"internalType":"address","name":"poseidon2Addr_","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint32","name":"blockNumber","type":"uint32"}],"name":"BlockCommitted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint32","name":"accountId","type":"uint32"},{"indexed":false,"internalType":"uint16","name":"tokenId","type":"uint16"},{"indexed":false,"internalType":"uint128","name":"amount","type":"uint128"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint64","name":"requestId","type":"uint64"},{"indexed":false,"internalType":"enum Operations.OpType","name":"opType","type":"uint8"},{"indexed":false,"internalType":"bytes","name":"pubData","type":"bytes"}],"name":"NewL1Request","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint32","name":"accountId","type":"uint32"},{"indexed":false,"internalType":"uint256","name":"tsPubX","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"tsPubY","type":"uint256"},{"indexed":false,"internalType":"bytes20","name":"l2Addr","type":"bytes20"}],"name":"Register","type":"event"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"accountIdOf","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"accountNum","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenAddr","type":"address"}],"name":"addToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"uint32","name":"accountId","type":"uint32"},{"internalType":"uint16","name":"tokenId","type":"uint16"},{"internalType":"uint128","name":"amount","type":"uint128"}],"internalType":"struct Operations.Deposit","name":"deposit","type":"tuple"},{"internalType":"uint64","name":"requestId","type":"uint64"}],"name":"checkDepositL1Request","outputs":[{"internalType":"bool","name":"isExisted","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"uint32","name":"accountId","type":"uint32"},{"internalType":"bytes20","name":"l2Addr","type":"bytes20"}],"internalType":"struct Operations.Register","name":"register","type":"tuple"},{"internalType":"uint64","name":"requestId","type":"uint64"}],"name":"checkRegisterL1Request","outputs":[{"internalType":"bool","name":"isExisted","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"uint32","name":"blockNumber","type":"uint32"},{"internalType":"bytes32","name":"stateRoot","type":"bytes32"},{"internalType":"uint64","name":"l1RequestNum","type":"uint64"},{"internalType":"bytes32","name":"pendingRollupTxHash","type":"bytes32"},{"internalType":"bytes32","name":"commitment","type":"bytes32"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"internalType":"struct ZkOBS.StoredBlock","name":"lastCommittedBlock","type":"tuple"},{"components":[{"internalType":"uint32","name":"blockNumber","type":"uint32"},{"internalType":"bytes32","name":"newStateRoot","type":"bytes32"},{"internalType":"bytes32","name":"newTsRoot","type":"bytes32"},{"internalType":"bytes","name":"publicData","type":"bytes"},{"internalType":"uint32[]","name":"publicDataOffsets","type":"uint32[]"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"internalType":"struct ZkOBS.CommitBlock[]","name":"newBlocks","type":"tuple[]"}],"name":"commitBlocks","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"committedBlockNum","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"committedL1RequestNum","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenAddr","type":"address"},{"internalType":"uint128","name":"amount","type":"uint128"}],"name":"depositERC20","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"depositETH","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"executedBlockNum","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"firstL1RequestId","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint64","name":"","type":"uint64"}],"name":"l1RequestQueue","outputs":[{"internalType":"bytes32","name":"hashedPubData","type":"bytes32"},{"internalType":"enum Operations.OpType","name":"opType","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pendingL1RequestNum","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"uint32","name":"blockNumber","type":"uint32"},{"internalType":"bytes32","name":"stateRoot","type":"bytes32"},{"internalType":"uint64","name":"l1RequestNum","type":"uint64"},{"internalType":"bytes32","name":"pendingRollupTxHash","type":"bytes32"},{"internalType":"bytes32","name":"commitment","type":"bytes32"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"internalType":"struct ZkOBS.StoredBlock[]","name":"committedBlocks","type":"tuple[]"},{"components":[{"internalType":"uint256[2]","name":"a","type":"uint256[2]"},{"internalType":"uint256[2][2]","name":"b","type":"uint256[2][2]"},{"internalType":"uint256[2]","name":"c","type":"uint256[2]"},{"internalType":"uint256[1]","name":"commitment","type":"uint256[1]"}],"internalType":"struct ZkOBS.Proof[]","name":"proof","type":"tuple[]"}],"name":"proveBlocks","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"provedBlockNum","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tsPubX","type":"uint256"},{"internalType":"uint256","name":"tsPubY","type":"uint256"},{"internalType":"address","name":"tokenAddr","type":"address"},{"internalType":"uint128","name":"amount","type":"uint128"}],"name":"registerERC20","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tsPubX","type":"uint256"},{"internalType":"uint256","name":"tsPubY","type":"uint256"}],"name":"registerETH","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint32","name":"","type":"uint32"}],"name":"storedBlockHashes","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"tokenIdOf","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"tokenNum","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"verifierAddr","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"wETHAddr","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}]');

/***/ }),
/* 13 */
/***/ ((module) => {

module.exports = require("@anchan828/nest-bullmq");;

/***/ }),
/* 14 */
/***/ ((module) => {

module.exports = require("bullmq");;

/***/ }),
/* 15 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoggerModule = void 0;
const common_1 = __webpack_require__(7);
const nestjs_pino_1 = __webpack_require__(9);
const pino_1 = __webpack_require__(16);
const uuid = __webpack_require__(17);
const FakeLogger_service_1 = __webpack_require__(18);
const pinoLogger_service_1 = __webpack_require__(6);
let LoggerModule = class LoggerModule {
};
LoggerModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            nestjs_pino_1.LoggerModule.forRoot({
                pinoHttp: {
                    name: 'API',
                    level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
                    genReqId: (req) => req.requestId || uuid.v4(),
                    formatters: { bindings: () => ({}) },
                    timestamp: pino_1.stdTimeFunctions.unixTime,
                },
            }),
        ],
        providers: [FakeLogger_service_1.FakeLoggerService, pinoLogger_service_1.PinoLoggerService],
        exports: [FakeLogger_service_1.FakeLoggerService, pinoLogger_service_1.PinoLoggerService],
    })
], LoggerModule);
exports.LoggerModule = LoggerModule;


/***/ }),
/* 16 */
/***/ ((module) => {

module.exports = require("pino");;

/***/ }),
/* 17 */
/***/ ((module) => {

module.exports = require("uuid");;

/***/ }),
/* 18 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FakeLoggerService = void 0;
const common_1 = __webpack_require__(7);
class FakeLoggerService extends common_1.ConsoleLogger {
    logger;
    contextName;
    constructor(logger) {
        super();
        this.logger = logger;
        this.contextName = 'context';
    }
    log = () => { };
    debug = () => { };
    verbose = () => { };
    info = () => { };
    warn = () => { };
    error = () => { };
    setContext = () => { };
}
exports.FakeLoggerService = FakeLoggerService;


/***/ }),
/* 19 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BullQueueModule = void 0;
const nest_bullmq_1 = __webpack_require__(13);
const common_1 = __webpack_require__(7);
const config_1 = __webpack_require__(11);
let BullQueueModule = class BullQueueModule {
};
BullQueueModule = __decorate([
    (0, common_1.Module)({
        imports: [
            nest_bullmq_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: async (configService) => ({
                    options: {
                        connection: {
                            host: configService.get('BULL_QUEUE_REDIS_HOST'),
                            port: configService.get('BULL_QUEUE_REDIS_PORT', 6379),
                        }
                    },
                })
            }),
        ],
    })
], BullQueueModule);
exports.BullQueueModule = BullQueueModule;


/***/ }),
/* 20 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TsTypeOrmModule = void 0;
const pinoLogger_service_1 = __webpack_require__(6);
const logger_module_1 = __webpack_require__(15);
const common_1 = __webpack_require__(7);
const config_1 = __webpack_require__(11);
const typeorm_1 = __webpack_require__(21);
const account_module_1 = __webpack_require__(22);
const auctionOrder_module_1 = __webpack_require__(55);
const rollup_module_1 = __webpack_require__(60);
let TsTypeOrmModule = class TsTypeOrmModule {
};
TsTypeOrmModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            logger_module_1.LoggerModule,
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const isProduction = configService.get('NODE_ENV') === 'prod';
                    return {
                        ssl: isProduction,
                        extra: {
                            ssl: isProduction ? { rejectUnauthorized: false } : null,
                        },
                        type: 'postgres',
                        host: configService.get('DB_HOST', ''),
                        port: configService.get('DB_PORT', 5432),
                        username: configService.get('DB_USER', ''),
                        password: configService.get('DB_PASSWD', ''),
                        database: configService.get('DB_NAME', ''),
                        autoLoadEntities: true,
                        synchronize: configService.get('NODE_ENV', 'dev') == 'dev',
                    };
                },
            }),
            account_module_1.AccountModule, auctionOrder_module_1.AuctionOrderMoudle, rollup_module_1.RollupModule
        ],
        providers: [
            typeorm_1.TypeOrmModule,
            pinoLogger_service_1.PinoLoggerService
        ],
        exports: [typeorm_1.TypeOrmModule]
    })
], TsTypeOrmModule);
exports.TsTypeOrmModule = TsTypeOrmModule;


/***/ }),
/* 21 */
/***/ ((module) => {

module.exports = require("@nestjs/typeorm");;

/***/ }),
/* 22 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AccountModule = void 0;
const common_1 = __webpack_require__(7);
const config_1 = __webpack_require__(11);
const typeorm_1 = __webpack_require__(21);
const obsOrderTree_service_1 = __webpack_require__(23);
const accountInformation_entity_1 = __webpack_require__(31);
const accountLeafNode_entity_1 = __webpack_require__(34);
const accountMerkleTreeNode_entity_1 = __webpack_require__(33);
const blockInformation_entity_1 = __webpack_require__(41);
const merkleTree_controller_1 = __webpack_require__(45);
const tokenLeafNode_entity_1 = __webpack_require__(36);
const tokenMerkleTreeNode_entity_1 = __webpack_require__(35);
const transactionInfo_entity_1 = __webpack_require__(38);
const tsAccountTree_service_1 = __webpack_require__(51);
const tsTokenTree_service_1 = __webpack_require__(52);
let AccountModule = class AccountModule {
};
AccountModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot(),
            typeorm_1.TypeOrmModule.forFeature([
                accountInformation_entity_1.AccountInformation,
                accountLeafNode_entity_1.AccountLeafNode,
                accountMerkleTreeNode_entity_1.AccountMerkleTreeNode,
                tokenMerkleTreeNode_entity_1.TokenMerkleTreeNode,
                tokenLeafNode_entity_1.TokenLeafNode,
                transactionInfo_entity_1.TransactionInfo,
                blockInformation_entity_1.BlockInformation
            ])
        ],
        providers: [tsAccountTree_service_1.TsAccountTreeService, tsTokenTree_service_1.TsTokenTreeService, obsOrderTree_service_1.ObsOrderTreeService],
        controllers: [merkleTree_controller_1.MerkleTreeController],
        exports: [typeorm_1.TypeOrmModule]
    })
], AccountModule);
exports.AccountModule = AccountModule;


/***/ }),
/* 23 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ObsOrderTreeService_1;
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ObsOrderTreeService = void 0;
const common_1 = __webpack_require__(7);
const config_1 = __webpack_require__(11);
const typeorm_1 = __webpack_require__(21);
const typeorm_2 = __webpack_require__(24);
const ts_helper_1 = __webpack_require__(25);
const tsMerkleTree_1 = __webpack_require__(28);
const obsOrderLeaf_entity_1 = __webpack_require__(29);
const obsOrderLeafMerkleTreeNode_entity_1 = __webpack_require__(44);
let ObsOrderTreeService = ObsOrderTreeService_1 = class ObsOrderTreeService extends tsMerkleTree_1.TsMerkleTree {
    obsOrderLeafRepository;
    obsOrderMerkleTreeRepository;
    connection;
    configService;
    logger = new common_1.Logger(ObsOrderTreeService_1.name);
    constructor(obsOrderLeafRepository, obsOrderMerkleTreeRepository, connection, configService) {
        console.time('init order tree');
        super(configService.get('ORDER_TREE_HEIGHT', 32), ts_helper_1.tsHashFunc);
        this.obsOrderLeafRepository = obsOrderLeafRepository;
        this.obsOrderMerkleTreeRepository = obsOrderMerkleTreeRepository;
        this.connection = connection;
        this.configService = configService;
        console.timeEnd('init order tree');
    }
    async updateLeaf(leafId, value) {
        console.time('updateLeaf for obsOrder tree');
        const prf = this.getProofIds(leafId);
        const id = this.getLeafIdInTree(leafId);
        await this.connection.transaction(async (manager) => {
            await manager.upsert(obsOrderLeafMerkleTreeNode_entity_1.ObsOrderLeafMerkleTreeNode, {
                id: id.toString(),
                leafId: leafId,
                hash: BigInt((0, ts_helper_1.toTreeLeaf)([
                    BigInt(value.txId),
                    BigInt(value.reqType),
                    BigInt(value.sender),
                    BigInt(value.sellTokenId),
                    BigInt(value.sellAmt),
                    BigInt(value.nonce),
                    BigInt(value.buyTokenId),
                    BigInt(value.buyAmt),
                    BigInt(value.accumulatedSellAmt),
                    BigInt(value.accumulatedBuyAmt),
                    BigInt(value.orderId)
                ]))
            }, ['id']);
            await manager.upsert(obsOrderLeaf_entity_1.ObsOrderLeafEntity, {
                orderLeafId: BigInt(value.orderLeafId),
                txId: Number(value.txId),
                reqType: Number(value.reqType),
                sender: BigInt(value.sender),
                sellTokenId: BigInt(value.sellTokenId),
                sellAmt: BigInt(value.sellAmt),
                nonce: BigInt(value.nonce),
                buyTokenId: BigInt(value.buyTokenId),
                buyAmt: BigInt(value.buyAmt),
                accumulatedSellAmt: BigInt(value.accumulatedSellAmt),
                accumulatedBuyAmt: BigInt(value.accumulatedBuyAmt),
                orderId: Number(value.orderId)
            }, ['orderLeafId']);
            for (let i = id, j = 0; i > 1n; i = i >> 1n) {
                const [iValue, jValue] = await Promise.all([
                    this.obsOrderMerkleTreeRepository.findOneBy({ id: i.toString() }),
                    this.obsOrderMerkleTreeRepository.findOneBy({ id: prf[j].toString() })
                ]);
                const jLevel = Math.floor(Math.log2(Number(prf[j])));
                const iLevel = Math.floor(Math.log2(Number(i)));
                const jHashValue = (jValue == null) ? this.getDefaultHashByLevel(jLevel) : jValue.hash.toString();
                const iHashValue = (iValue == null) ? this.getDefaultHashByLevel(iLevel) : iValue.hash.toString();
                let r = (id % 2n == 0n) ? [jHashValue, iHashValue] : [iHashValue, jHashValue];
                const hash = this.hashFunc(r);
                const jobs = [];
                if (iValue == null) {
                    jobs.push(manager.upsert(obsOrderLeafMerkleTreeNode_entity_1.ObsOrderLeafMerkleTreeNode, {
                        id: i.toString(),
                        hash: BigInt(iHashValue)
                    }, ['id']));
                }
                if (jValue == null && j < prf.length) {
                    jobs.push(manager.upsert(obsOrderLeafMerkleTreeNode_entity_1.ObsOrderLeafMerkleTreeNode, {
                        id: prf[j].toString(),
                        hash: BigInt(jHashValue)
                    }, ['id']));
                }
                const updateRoot = i >> 1n;
                if (updateRoot >= 1n) {
                    jobs.push(manager.upsert(obsOrderLeafMerkleTreeNode_entity_1.ObsOrderLeafMerkleTreeNode, {
                        id: updateRoot.toString(),
                        hash: BigInt(hash)
                    }, ['id']));
                }
                await Promise.all(jobs);
                j++;
            }
        });
        console.timeEnd('updateLeaf for obsOrder tree');
    }
    async getLeaf(leaf_id, otherPayload) {
        const result = this.obsOrderLeafRepository.findOneBy({
            orderLeafId: leaf_id
        });
        if (result == null) {
            const id = this.getLeafIdInTree(leaf_id);
            const level = Math.floor(Math.log2(Number(id)));
            const hash = this.getDefaultHashByLevel(level);
            await this.connection.transaction(async (manager) => {
                await manager.insert(obsOrderLeafMerkleTreeNode_entity_1.ObsOrderLeafMerkleTreeNode, {
                    leafId: leaf_id,
                    id: id.toString(),
                    hash: BigInt(hash),
                });
                await manager.insert(obsOrderLeaf_entity_1.ObsOrderLeafEntity, {
                    orderLeafId: leaf_id,
                });
            });
            return this.obsOrderLeafRepository.findOneBy({
                orderLeafId: leaf_id
            });
        }
        return result;
    }
    async getRoot() {
        const result = await this.obsOrderMerkleTreeRepository.findOne({
            where: {
                id: 1n.toString(),
            }
        });
        if (result == null) {
            const hash = await this.getDefaultHashByLevel(1);
            await this.obsOrderMerkleTreeRepository.insert({
                id: 1n.toString(),
                hash: BigInt(hash),
            });
            return {
                id: 1n.toString(),
                hash: hash
            };
        }
        return {
            id: result.id,
            hash: result.hash.toString()
        };
    }
    getLeafDefaultVavlue() {
        return (0, ts_helper_1.toTreeLeaf)([
            0n,
            0n,
            0n,
            0n,
            0n,
            0n,
            0n,
            0n,
            0n,
            0n,
            0n,
        ]);
    }
};
ObsOrderTreeService = ObsOrderTreeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(obsOrderLeaf_entity_1.ObsOrderLeafEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(obsOrderLeafMerkleTreeNode_entity_1.ObsOrderLeafMerkleTreeNode)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Connection !== "undefined" && typeorm_2.Connection) === "function" ? _c : Object, typeof (_d = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _d : Object])
], ObsOrderTreeService);
exports.ObsOrderTreeService = ObsOrderTreeService;


/***/ }),
/* 24 */
/***/ ((module) => {

module.exports = require("typeorm");;

/***/ }),
/* 25 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.tsHashFunc = exports.toTreeLeaf = exports.bigint_to_hex = void 0;
const poseiden_hash_dp_1 = __webpack_require__(26);
function bigint_to_hex(x) {
    return '0x' + x.toString(16);
}
exports.bigint_to_hex = bigint_to_hex;
function toTreeLeaf(inputs) {
    return bigint_to_hex((0, poseiden_hash_dp_1.dpPoseidonHash)(inputs));
}
exports.toTreeLeaf = toTreeLeaf;
function poseidonHash(val) {
    if (val instanceof Array) {
        const inputs = val.map((v) => BigInt(v));
        return bigint_to_hex((0, poseiden_hash_dp_1.dpPoseidonHash)(inputs));
    }
    return bigint_to_hex((0, poseiden_hash_dp_1.dpPoseidonHash)([BigInt(val.toString())]));
}
exports.tsHashFunc = poseidonHash;


/***/ }),
/* 26 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.dpPoseidonHash = void 0;
const poseidon_1 = __webpack_require__(27);
class dpPoseidonCache {
    static cache = new Map();
    static getCache(x) {
        if (x instanceof Array) {
            const key = x.join();
            return dpPoseidonCache.getCache(key);
        }
        return dpPoseidonCache
            .cache
            .get(x);
    }
    static setCache(x, v) {
        if (x instanceof Array) {
            const key = x.join();
            dpPoseidonCache.setCache(key, v);
            return;
        }
        dpPoseidonCache
            .cache
            .set(x, v);
    }
}
function dpPoseidonHash(inputs, isDpEnabled = true) {
    if (isDpEnabled) {
        const cache = dpPoseidonCache.getCache(inputs);
        if (cache) {
            return cache;
        }
    }
    const res = (0, poseidon_1.poseidon)(inputs);
    if (isDpEnabled) {
        dpPoseidonCache.setCache(inputs, res);
    }
    return res;
}
exports.dpPoseidonHash = dpPoseidonHash;


/***/ }),
/* 27 */
/***/ ((module) => {

module.exports = require("@big-whale-labs/poseidon");;

/***/ }),
/* 28 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TsMerkleTree = void 0;
class TsMerkleTree {
    treeHeigt;
    lastLevel;
    levelsDefaultHash;
    hashFunc;
    constructor(treeHeight, hashFunc) {
        this.treeHeigt = Number(treeHeight);
        this.hashFunc = hashFunc;
        this.lastLevel = Number(this.treeHeigt);
        this.setLevelDefaultHash();
    }
    getProofIds(leaf_id) {
        const prf = [];
        const height = this.treeHeigt;
        const leafStart = leaf_id + (1n << BigInt(height));
        for (let i = leafStart; i > 1n; i = i >> 1n) {
            if (i % 2n == 0n) {
                prf.push(i + 1n);
            }
            else {
                prf.push(i - 1n);
            }
        }
        return prf;
    }
    setLevelDefaultHash() {
        this.levelsDefaultHash = new Map();
        this.levelsDefaultHash.set(this.lastLevel, this.getLeafDefaultVavlue());
        for (let level = this.lastLevel - 1; level >= 0; level--) {
            const prevLevelHash = this.levelsDefaultHash.get(level + 1);
            if (prevLevelHash != undefined) {
                this.levelsDefaultHash.set(level, this.hashFunc([prevLevelHash, prevLevelHash]));
            }
        }
    }
    getLeafIdInTree(leafId) {
        return leafId + (1n << BigInt(this.treeHeigt));
    }
    getLastLevel() {
        return this.lastLevel;
    }
    getDefaultHashByLevel(level) {
        const result = this.levelsDefaultHash.get(level);
        return result ? result : '';
    }
}
exports.TsMerkleTree = TsMerkleTree;


/***/ }),
/* 29 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ObsOrderLeafEntity = void 0;
const typeorm_1 = __webpack_require__(24);
const obsOrder_entity_1 = __webpack_require__(30);
const obsOrderLeafMerkleTreeNode_entity_1 = __webpack_require__(44);
let ObsOrderLeafEntity = class ObsOrderLeafEntity {
    orderLeafId;
    txId;
    reqType;
    sender;
    sellTokenId;
    sellAmt;
    nonce;
    buyTokenId;
    buyAmt;
    accumulatedSellAmt;
    accumulatedBuyAmt;
    orderId;
    obsOrder;
    merkleTreeNode;
};
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'decimal',
        name: 'orderLeafId',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", BigInt)
], ObsOrderLeafEntity.prototype, "orderLeafId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int8',
        name: 'txId',
        nullable: true,
    }),
    __metadata("design:type", Object)
], ObsOrderLeafEntity.prototype, "txId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'integer',
        name: 'reqType',
        nullable: false,
        default: 0,
    }),
    __metadata("design:type", Number)
], ObsOrderLeafEntity.prototype, "reqType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'sender',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", BigInt)
], ObsOrderLeafEntity.prototype, "sender", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'sellTokenId',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", BigInt)
], ObsOrderLeafEntity.prototype, "sellTokenId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'sellAmt',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", BigInt)
], ObsOrderLeafEntity.prototype, "sellAmt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'nonce',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", BigInt)
], ObsOrderLeafEntity.prototype, "nonce", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'buyTokenId',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", BigInt)
], ObsOrderLeafEntity.prototype, "buyTokenId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'buyAmt',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", BigInt)
], ObsOrderLeafEntity.prototype, "buyAmt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'accumulatedSellAmt',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", BigInt)
], ObsOrderLeafEntity.prototype, "accumulatedSellAmt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'accumulatedBuyAmt',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", BigInt)
], ObsOrderLeafEntity.prototype, "accumulatedBuyAmt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int8',
        name: 'orderId',
        nullable: false,
        default: 0,
    }),
    __metadata("design:type", Number)
], ObsOrderLeafEntity.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => obsOrder_entity_1.ObsOrderEntity, (obsOrder) => obsOrder.obsOrderLeaf, {
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({
        name: 'orderId',
        referencedColumnName: 'id',
    }),
    __metadata("design:type", typeof (_a = typeof obsOrder_entity_1.ObsOrderEntity !== "undefined" && obsOrder_entity_1.ObsOrderEntity) === "function" ? _a : Object)
], ObsOrderLeafEntity.prototype, "obsOrder", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => obsOrderLeafMerkleTreeNode_entity_1.ObsOrderLeafMerkleTreeNode, (obsOrderLeafMerkleTreeNode) => obsOrderLeafMerkleTreeNode.leaf, {
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({
        name: 'orderLeafId',
        referencedColumnName: 'leafId',
    }),
    __metadata("design:type", typeof (_b = typeof obsOrderLeafMerkleTreeNode_entity_1.ObsOrderLeafMerkleTreeNode !== "undefined" && obsOrderLeafMerkleTreeNode_entity_1.ObsOrderLeafMerkleTreeNode) === "function" ? _b : Object)
], ObsOrderLeafEntity.prototype, "merkleTreeNode", void 0);
ObsOrderLeafEntity = __decorate([
    (0, typeorm_1.Entity)('ObsOrderLeaf', { schema: 'public' })
], ObsOrderLeafEntity);
exports.ObsOrderLeafEntity = ObsOrderLeafEntity;


/***/ }),
/* 30 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ObsOrderEntity = void 0;
const typeorm_1 = __webpack_require__(24);
const accountInformation_entity_1 = __webpack_require__(31);
const matchObsOrder_entity_1 = __webpack_require__(39);
const obsOrderLeaf_entity_1 = __webpack_require__(29);
const tsSide_enum_1 = __webpack_require__(40);
let ObsOrderEntity = class ObsOrderEntity {
    id;
    side;
    txId;
    reqType;
    accountId;
    marketPair;
    price;
    orderStatus;
    mainQty;
    baseQty;
    remainMainQty;
    remainBaseQty;
    accumulatedMainQty;
    accumulatedBaseQty;
    mainTokenId;
    baseTokenId;
    timestamp;
    isMaker;
    orderLeafId;
    obsOrderLeaf;
    matchOrders;
    accountInfo;
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({
        type: 'int8',
        name: 'id',
    }),
    __metadata("design:type", Number)
], ObsOrderEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        name: 'side',
        enumName: 'SIDE',
        enum: [
            tsSide_enum_1.TsSide.BUY,
            tsSide_enum_1.TsSide.SELL,
        ],
        nullable: false,
        default: () => `\'${tsSide_enum_1.TsSide.BUY}\'`,
    }),
    __metadata("design:type", typeof (_a = typeof tsSide_enum_1.TsSide !== "undefined" && tsSide_enum_1.TsSide) === "function" ? _a : Object)
], ObsOrderEntity.prototype, "side", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int8',
        name: 'txId',
        nullable: false,
        default: 0,
    }),
    __metadata("design:type", Number)
], ObsOrderEntity.prototype, "txId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'integer',
        name: 'reqType',
        nullable: false,
        default: 0,
    }),
    __metadata("design:type", Number)
], ObsOrderEntity.prototype, "reqType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'accountId',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", BigInt)
], ObsOrderEntity.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'marketPair',
        length: 100,
        nullable: false,
        default: `'ETH/USDC'`,
    }),
    __metadata("design:type", String)
], ObsOrderEntity.prototype, "marketPair", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'price',
        precision: 86,
        scale: 8,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", String)
], ObsOrderEntity.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'integer',
        name: 'orderStatus',
        nullable: false,
        default: 1,
    }),
    __metadata("design:type", Number)
], ObsOrderEntity.prototype, "orderStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'mainQty',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", BigInt)
], ObsOrderEntity.prototype, "mainQty", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'baseQty',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", BigInt)
], ObsOrderEntity.prototype, "baseQty", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'remainMainQty',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", BigInt)
], ObsOrderEntity.prototype, "remainMainQty", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'remainBaseQty',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", BigInt)
], ObsOrderEntity.prototype, "remainBaseQty", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'accumulatedMainQty',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", BigInt)
], ObsOrderEntity.prototype, "accumulatedMainQty", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'accumulatedBaseQty',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", BigInt)
], ObsOrderEntity.prototype, "accumulatedBaseQty", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'mainTokenId',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0,
    }),
    __metadata("design:type", BigInt)
], ObsOrderEntity.prototype, "mainTokenId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'baseTokenId',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0,
    }),
    __metadata("design:type", BigInt)
], ObsOrderEntity.prototype, "baseTokenId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp without time zone',
        name: 'timestamp',
        nullable: false,
        precision: 3,
        default: () => `now()`,
    }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], ObsOrderEntity.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'boolean',
        name: 'isMaker',
        nullable: false,
        default: false,
    }),
    __metadata("design:type", Boolean)
], ObsOrderEntity.prototype, "isMaker", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int8',
        name: 'orderLeafId',
        nullable: true,
        unique: true,
    }),
    __metadata("design:type", Object)
], ObsOrderEntity.prototype, "orderLeafId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => obsOrderLeaf_entity_1.ObsOrderLeafEntity, (obsOrder) => obsOrder.obsOrder),
    (0, typeorm_1.JoinColumn)({
        name: 'id',
        referencedColumnName: 'orderId'
    }),
    __metadata("design:type", typeof (_c = typeof obsOrderLeaf_entity_1.ObsOrderLeafEntity !== "undefined" && obsOrderLeaf_entity_1.ObsOrderLeafEntity) === "function" ? _c : Object)
], ObsOrderEntity.prototype, "obsOrderLeaf", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => matchObsOrder_entity_1.MatchObsOrderEntity, (matchOrders) => matchOrders.marketPair),
    (0, typeorm_1.JoinColumn)({
        name: 'id',
        referencedColumnName: 'referenceOrder'
    }),
    __metadata("design:type", Array)
], ObsOrderEntity.prototype, "matchOrders", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => accountInformation_entity_1.AccountInformation, (accountInfo) => accountInfo.obsOrders, {
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
    }),
    (0, typeorm_1.JoinColumn)({
        name: 'accountId',
        referencedColumnName: 'accountId'
    }),
    __metadata("design:type", typeof (_d = typeof accountInformation_entity_1.AccountInformation !== "undefined" && accountInformation_entity_1.AccountInformation) === "function" ? _d : Object)
], ObsOrderEntity.prototype, "accountInfo", void 0);
ObsOrderEntity = __decorate([
    (0, typeorm_1.Entity)('ObsOrder', { schema: 'public' })
], ObsOrderEntity);
exports.ObsOrderEntity = ObsOrderEntity;


/***/ }),
/* 31 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AccountInformation = void 0;
const typeorm_1 = __webpack_require__(24);
const obsOrder_entity_1 = __webpack_require__(30);
const baseTimeEntity_1 = __webpack_require__(32);
const accountMerkleTreeNode_entity_1 = __webpack_require__(33);
const role_enum_1 = __webpack_require__(37);
const transactionInfo_entity_1 = __webpack_require__(38);
let AccountInformation = class AccountInformation extends baseTimeEntity_1.BaseTimeEntity {
    L1Address;
    accountId;
    email;
    lastedLoginIp;
    lastLoginTime;
    role;
    password;
    refreshToken;
    label;
    labelBy;
    tsPubKeyX;
    tsPubKeyY;
    accountMerkleTreeNode;
    transactionInfos;
    obsOrders;
};
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'varchar',
        name: 'L1Address',
        length: 256,
        primary: true,
    }),
    __metadata("design:type", String)
], AccountInformation.prototype, "L1Address", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'accountId',
        precision: 86,
        scale: 0,
        nullable: false,
    }),
    __metadata("design:type", String)
], AccountInformation.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'email',
        length: 256,
        nullable: false,
        unique: true,
    }),
    __metadata("design:type", String)
], AccountInformation.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'lastedLoginIp',
        length: 256,
        nullable: true,
        default: null,
    }),
    __metadata("design:type", Object)
], AccountInformation.prototype, "lastedLoginIp", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp without time zone',
        name: 'lastLoginTime',
        nullable: true,
    }),
    __metadata("design:type", Object)
], AccountInformation.prototype, "lastLoginTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        name: 'role',
        enumName: 'Role',
        enum: [role_enum_1.Role.ADMIN, role_enum_1.Role.MEMBER, role_enum_1.Role.OPERATOR],
        nullable: false,
        default: role_enum_1.Role.MEMBER,
    }),
    __metadata("design:type", typeof (_b = typeof role_enum_1.Role !== "undefined" && role_enum_1.Role) === "function" ? _b : Object)
], AccountInformation.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'password',
        length: 300,
        nullable: true,
    }),
    __metadata("design:type", Object)
], AccountInformation.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'refreshToken',
        length: 400,
        nullable: true,
    }),
    __metadata("design:type", Object)
], AccountInformation.prototype, "refreshToken", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'jsonb',
        name: 'label',
        nullable: true,
        default: () => '\'{}\'',
    }),
    __metadata("design:type", Object)
], AccountInformation.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'labelBy',
        length: 256,
        nullable: true,
    }),
    __metadata("design:type", Object)
], AccountInformation.prototype, "labelBy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'tsPubKeyX',
        length: '100',
        nullable: false,
        default: '\'0\'',
    }),
    __metadata("design:type", String)
], AccountInformation.prototype, "tsPubKeyX", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'tsPubKeyY',
        length: '100',
        nullable: false,
        default: '\'0\'',
    }),
    __metadata("design:type", String)
], AccountInformation.prototype, "tsPubKeyY", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => accountMerkleTreeNode_entity_1.AccountMerkleTreeNode, (accountMerkleTreeNode) => accountMerkleTreeNode.leaf),
    __metadata("design:type", typeof (_c = typeof accountMerkleTreeNode_entity_1.AccountMerkleTreeNode !== "undefined" && accountMerkleTreeNode_entity_1.AccountMerkleTreeNode) === "function" ? _c : Object)
], AccountInformation.prototype, "accountMerkleTreeNode", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => transactionInfo_entity_1.TransactionInfo, (transactionInfo) => transactionInfo.L2AccountInfo),
    __metadata("design:type", Array)
], AccountInformation.prototype, "transactionInfos", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => obsOrder_entity_1.ObsOrderEntity, (obsOrder) => obsOrder.accountInfo),
    (0, typeorm_1.JoinColumn)({
        name: 'accountId',
        referencedColumnName: 'accountId',
    }),
    __metadata("design:type", Object)
], AccountInformation.prototype, "obsOrders", void 0);
AccountInformation = __decorate([
    (0, typeorm_1.Entity)('AccountInformation', { schema: 'public' })
], AccountInformation);
exports.AccountInformation = AccountInformation;


/***/ }),
/* 32 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseTimeEntity = void 0;
const typeorm_1 = __webpack_require__(24);
class BaseTimeEntity {
    createdAt;
    createdBy;
    updatedAt;
    updatedBy;
    deletedAt;
    deletedBy;
}
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: 'timestamp without time zone',
        name: 'createdAt',
        default: () => 'now()',
    }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], BaseTimeEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'createdBy',
        length: 300,
        nullable: true,
    }),
    __metadata("design:type", Object)
], BaseTimeEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: 'timestamp without time zone',
        name: 'updatedAt',
        default: () => 'now()',
    }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], BaseTimeEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'updatedBy',
        length: 300,
        nullable: true,
    }),
    __metadata("design:type", Object)
], BaseTimeEntity.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({
        type: 'timestamp without time zone',
        name: 'deletedAt',
        nullable: true,
    }),
    __metadata("design:type", Object)
], BaseTimeEntity.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'deletedBy',
        length: 300,
        nullable: true,
    }),
    __metadata("design:type", Object)
], BaseTimeEntity.prototype, "deletedBy", void 0);
exports.BaseTimeEntity = BaseTimeEntity;


/***/ }),
/* 33 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AccountMerkleTreeNode = void 0;
const typeorm_1 = __webpack_require__(24);
const accountInformation_entity_1 = __webpack_require__(31);
const accountLeafNode_entity_1 = __webpack_require__(34);
const tokenMerkleTreeNode_entity_1 = __webpack_require__(35);
let AccountMerkleTreeNode = class AccountMerkleTreeNode {
    id;
    hash;
    leafId;
    leaf;
    tokenMerkleTreeNodes;
    accountLeafNode;
};
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'decimal',
        name: 'id',
        precision: 86,
        scale: 0,
        primary: true,
    }),
    __metadata("design:type", String)
], AccountMerkleTreeNode.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'hash',
        precision: 86,
        scale: 0,
        nullable: false,
    }),
    __metadata("design:type", BigInt)
], AccountMerkleTreeNode.prototype, "hash", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'leafId',
        precision: 86,
        scale: 0,
        nullable: true,
    }),
    __metadata("design:type", Object)
], AccountMerkleTreeNode.prototype, "leafId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => accountInformation_entity_1.AccountInformation, (accountInformation) => accountInformation.accountMerkleTreeNode, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)([{ name: 'leafId', referencedColumnName: 'accountId' }]),
    __metadata("design:type", typeof (_a = typeof accountInformation_entity_1.AccountInformation !== "undefined" && accountInformation_entity_1.AccountInformation) === "function" ? _a : Object)
], AccountMerkleTreeNode.prototype, "leaf", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => tokenMerkleTreeNode_entity_1.TokenMerkleTreeNode, (tokenMerkleTreeNode) => tokenMerkleTreeNode.accountRoot),
    __metadata("design:type", Array)
], AccountMerkleTreeNode.prototype, "tokenMerkleTreeNodes", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => accountLeafNode_entity_1.AccountLeafNode, (accountLeafNode) => accountLeafNode.accountMerkleTreeNode),
    __metadata("design:type", typeof (_b = typeof accountLeafNode_entity_1.AccountLeafNode !== "undefined" && accountLeafNode_entity_1.AccountLeafNode) === "function" ? _b : Object)
], AccountMerkleTreeNode.prototype, "accountLeafNode", void 0);
AccountMerkleTreeNode = __decorate([
    (0, typeorm_1.Entity)('AccountMerkleTreeNode', { schema: 'public' })
], AccountMerkleTreeNode);
exports.AccountMerkleTreeNode = AccountMerkleTreeNode;


/***/ }),
/* 34 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AccountLeafNode = void 0;
const typeorm_1 = __webpack_require__(24);
const accountMerkleTreeNode_entity_1 = __webpack_require__(33);
let AccountLeafNode = class AccountLeafNode {
    leafId;
    tsAddr;
    nonce;
    tokenRoot;
    accountMerkleTreeNode;
};
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'decimal',
        name: 'leafId',
        primary: true,
        precision: 86,
        scale: 0
    }),
    __metadata("design:type", String)
], AccountLeafNode.prototype, "leafId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'tsAddr',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", BigInt)
], AccountLeafNode.prototype, "tsAddr", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'nonce',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n
    }),
    __metadata("design:type", BigInt)
], AccountLeafNode.prototype, "nonce", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'tokenRoot',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n
    }),
    __metadata("design:type", BigInt)
], AccountLeafNode.prototype, "tokenRoot", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => accountMerkleTreeNode_entity_1.AccountMerkleTreeNode, (accountMerkleTreeNode) => accountMerkleTreeNode.accountLeafNode, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({
        name: 'leafId',
        referencedColumnName: 'leafId'
    }),
    __metadata("design:type", typeof (_a = typeof accountMerkleTreeNode_entity_1.AccountMerkleTreeNode !== "undefined" && accountMerkleTreeNode_entity_1.AccountMerkleTreeNode) === "function" ? _a : Object)
], AccountLeafNode.prototype, "accountMerkleTreeNode", void 0);
AccountLeafNode = __decorate([
    (0, typeorm_1.Entity)('AccountLeafNode', { schema: 'public' })
], AccountLeafNode);
exports.AccountLeafNode = AccountLeafNode;


/***/ }),
/* 35 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TokenMerkleTreeNode = void 0;
const typeorm_1 = __webpack_require__(24);
const accountMerkleTreeNode_entity_1 = __webpack_require__(33);
const tokenLeafNode_entity_1 = __webpack_require__(36);
let TokenMerkleTreeNode = class TokenMerkleTreeNode {
    accountId;
    id;
    hash;
    leafId;
    accountRoot;
    leaf;
};
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'decimal',
        name: 'accountId',
        primary: true,
        precision: 86,
        scale: 0,
        nullable: false,
        unique: false,
    }),
    __metadata("design:type", String)
], TokenMerkleTreeNode.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'decimal',
        name: 'id',
        primary: true,
        precision: 86,
        scale: 0,
        nullable: false,
        unique: false,
    }),
    __metadata("design:type", String)
], TokenMerkleTreeNode.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'hash',
        precision: 86,
        scale: 0,
        nullable: false
    }),
    __metadata("design:type", BigInt)
], TokenMerkleTreeNode.prototype, "hash", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'leafId',
        precision: 86,
        scale: 0,
        nullable: true,
        unique: true,
    }),
    __metadata("design:type", Object)
], TokenMerkleTreeNode.prototype, "leafId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => accountMerkleTreeNode_entity_1.AccountMerkleTreeNode, (accountMerkleTreeNode) => accountMerkleTreeNode.tokenMerkleTreeNodes, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'accountId', referencedColumnName: 'leafId' }),
    __metadata("design:type", typeof (_a = typeof accountMerkleTreeNode_entity_1.AccountMerkleTreeNode !== "undefined" && accountMerkleTreeNode_entity_1.AccountMerkleTreeNode) === "function" ? _a : Object)
], TokenMerkleTreeNode.prototype, "accountRoot", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => tokenLeafNode_entity_1.TokenLeafNode, (tokenLeafNode) => tokenLeafNode.tokenMerkleNode),
    (0, typeorm_1.JoinColumn)([{
            name: 'leafId',
            referencedColumnName: 'leafId'
        }, {
            name: 'accountId',
            referencedColumnName: 'accountId'
        }]),
    __metadata("design:type", typeof (_b = typeof tokenLeafNode_entity_1.TokenLeafNode !== "undefined" && tokenLeafNode_entity_1.TokenLeafNode) === "function" ? _b : Object)
], TokenMerkleTreeNode.prototype, "leaf", void 0);
TokenMerkleTreeNode = __decorate([
    (0, typeorm_1.Entity)('TokenMerkleTreeNode', { schema: 'public' })
], TokenMerkleTreeNode);
exports.TokenMerkleTreeNode = TokenMerkleTreeNode;


/***/ }),
/* 36 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TokenLeafNode = void 0;
const typeorm_1 = __webpack_require__(24);
const tokenMerkleTreeNode_entity_1 = __webpack_require__(35);
let TokenLeafNode = class TokenLeafNode {
    leafId;
    accountId;
    availableAmt;
    lockedAmt;
    tokenMerkleNode;
};
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'decimal',
        name: 'leafId',
        precision: 86,
        scale: 0,
        primary: true,
        nullable: false,
    }),
    __metadata("design:type", String)
], TokenLeafNode.prototype, "leafId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'decimal',
        name: 'accountId',
        precision: 86,
        scale: 0,
        primary: true,
        nullable: false,
    }),
    __metadata("design:type", String)
], TokenLeafNode.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'availableAmt',
        precision: 86,
        scale: 0,
        default: 0n
    }),
    __metadata("design:type", BigInt)
], TokenLeafNode.prototype, "availableAmt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'lockedAmt',
        precision: 86,
        scale: 0,
        default: 0n
    }),
    __metadata("design:type", BigInt)
], TokenLeafNode.prototype, "lockedAmt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => tokenMerkleTreeNode_entity_1.TokenMerkleTreeNode, (tokenMerkleTreeNode) => tokenMerkleTreeNode.leaf, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)([{ name: 'leafId', referencedColumnName: 'leafId' },
        { name: 'accountId', referencedColumnName: 'accountId' }]),
    __metadata("design:type", typeof (_a = typeof tokenMerkleTreeNode_entity_1.TokenMerkleTreeNode !== "undefined" && tokenMerkleTreeNode_entity_1.TokenMerkleTreeNode) === "function" ? _a : Object)
], TokenLeafNode.prototype, "tokenMerkleNode", void 0);
TokenLeafNode = __decorate([
    (0, typeorm_1.Entity)('TokenLeafNode', { schema: 'public' })
], TokenLeafNode);
exports.TokenLeafNode = TokenLeafNode;


/***/ }),
/* 37 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Role = void 0;
var Role;
(function (Role) {
    Role["ADMIN"] = "ADMIN";
    Role["MEMBER"] = "MEMBER";
    Role["OPERATOR"] = "OPERATOR";
})(Role = exports.Role || (exports.Role = {}));


/***/ }),
/* 38 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TransactionInfo = void 0;
const typeorm_1 = __webpack_require__(24);
const matchObsOrder_entity_1 = __webpack_require__(39);
const baseTimeEntity_1 = __webpack_require__(32);
const accountInformation_entity_1 = __webpack_require__(31);
const blockInformation_entity_1 = __webpack_require__(41);
const tsStatus_enum_1 = __webpack_require__(43);
let TransactionInfo = class TransactionInfo extends baseTimeEntity_1.BaseTimeEntity {
    txId;
    blockNumber;
    reqType;
    accountId;
    tokenId;
    accumulatedSellAmt;
    accumulatedBuyAmt;
    amount;
    nonce;
    eddsaSig;
    ecdsaSig;
    arg0;
    arg1;
    arg2;
    arg3;
    arg4;
    tsPubKeyX;
    tsPubKeyY;
    fee;
    feeToken;
    metadata;
    txStatus;
    L2AccountInfo;
    blockInfo;
    matchedOrder;
    matchedOrder2;
};
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'integer',
        name: 'txId',
        primary: true,
        nullable: false,
        generated: 'increment',
    }),
    __metadata("design:type", Number)
], TransactionInfo.prototype, "txId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'integer',
        name: 'blockNumber',
        nullable: true,
        default: 0
    }),
    __metadata("design:type", Object)
], TransactionInfo.prototype, "blockNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'integer',
        name: 'reqType',
        nullable: false,
        default: 0,
    }),
    __metadata("design:type", Number)
], TransactionInfo.prototype, "reqType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'accountId',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", BigInt)
], TransactionInfo.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'tokenId',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", BigInt)
], TransactionInfo.prototype, "tokenId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'accumulatedSellAmt',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", BigInt)
], TransactionInfo.prototype, "accumulatedSellAmt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'accumulatedBuyAmt',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", BigInt)
], TransactionInfo.prototype, "accumulatedBuyAmt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'amount',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", BigInt)
], TransactionInfo.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'nonce',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", BigInt)
], TransactionInfo.prototype, "nonce", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'json',
        name: 'eddsaSig',
        nullable: false,
        default: () => JSON.stringify({ R8: ['0', '0'], S: '0' }),
    }),
    __metadata("design:type", Object)
], TransactionInfo.prototype, "eddsaSig", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'ecdsaSig',
        length: '66',
        nullable: false,
        default: `''`,
    }),
    __metadata("design:type", String)
], TransactionInfo.prototype, "ecdsaSig", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'arg0',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", BigInt)
], TransactionInfo.prototype, "arg0", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'arg1',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", BigInt)
], TransactionInfo.prototype, "arg1", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'arg2',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", BigInt)
], TransactionInfo.prototype, "arg2", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'arg3',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", BigInt)
], TransactionInfo.prototype, "arg3", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'arg4',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", BigInt)
], TransactionInfo.prototype, "arg4", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'tsPubKeyX',
        length: '100',
        nullable: false,
        default: "'0'",
    }),
    __metadata("design:type", String)
], TransactionInfo.prototype, "tsPubKeyX", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'tsPubKeyY',
        length: '100',
        nullable: false,
        default: "'0'",
    }),
    __metadata("design:type", String)
], TransactionInfo.prototype, "tsPubKeyY", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'fee',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", BigInt)
], TransactionInfo.prototype, "fee", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'feeToken',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", BigInt)
], TransactionInfo.prototype, "feeToken", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'json',
        name: 'metadata',
        nullable: false,
        default: () => "'{}'",
    }),
    __metadata("design:type", Object)
], TransactionInfo.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        name: 'txStatus',
        enum: [
            tsStatus_enum_1.TS_STATUS.PENDING,
            tsStatus_enum_1.TS_STATUS.PROCESSING,
            tsStatus_enum_1.TS_STATUS.L2EXECUTED,
            tsStatus_enum_1.TS_STATUS.L2CONFIRMED,
            tsStatus_enum_1.TS_STATUS.L1CONFIRMED,
            tsStatus_enum_1.TS_STATUS.FAILED,
            tsStatus_enum_1.TS_STATUS.REJECTED,
        ],
        nullable: false,
        default: `'${tsStatus_enum_1.TS_STATUS.PENDING}'`,
    }),
    __metadata("design:type", typeof (_a = typeof tsStatus_enum_1.TS_STATUS !== "undefined" && tsStatus_enum_1.TS_STATUS) === "function" ? _a : Object)
], TransactionInfo.prototype, "txStatus", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => accountInformation_entity_1.AccountInformation, (accountInformation) => accountInformation.transactionInfos, {
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({
        name: 'accountId',
        referencedColumnName: 'accountId',
    }),
    __metadata("design:type", typeof (_b = typeof accountInformation_entity_1.AccountInformation !== "undefined" && accountInformation_entity_1.AccountInformation) === "function" ? _b : Object)
], TransactionInfo.prototype, "L2AccountInfo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => blockInformation_entity_1.BlockInformation, (blockInformation) => blockInformation.transactionInfos, {
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({
        name: 'blockNumber',
        referencedColumnName: 'blockNumber',
    }),
    __metadata("design:type", typeof (_c = typeof blockInformation_entity_1.BlockInformation !== "undefined" && blockInformation_entity_1.BlockInformation) === "function" ? _c : Object)
], TransactionInfo.prototype, "blockInfo", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => matchObsOrder_entity_1.MatchObsOrderEntity, (matchedObsOrder) => matchedObsOrder.matchedTx),
    (0, typeorm_1.JoinColumn)({
        name: 'txId',
        referencedColumnName: 'txId',
    }),
    __metadata("design:type", Object)
], TransactionInfo.prototype, "matchedOrder", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => matchObsOrder_entity_1.MatchObsOrderEntity, (matchedObsOrder) => matchedObsOrder.matchedTx2),
    (0, typeorm_1.JoinColumn)({
        name: 'txId',
        referencedColumnName: 'txId2',
    }),
    __metadata("design:type", Object)
], TransactionInfo.prototype, "matchedOrder2", void 0);
TransactionInfo = __decorate([
    (0, typeorm_1.Entity)('TransactionInfo', { schema: 'public' })
], TransactionInfo);
exports.TransactionInfo = TransactionInfo;


/***/ }),
/* 39 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MatchObsOrderEntity = void 0;
const typeorm_1 = __webpack_require__(24);
const transactionInfo_entity_1 = __webpack_require__(38);
const obsOrder_entity_1 = __webpack_require__(30);
const tsSide_enum_1 = __webpack_require__(40);
let MatchObsOrderEntity = class MatchObsOrderEntity {
    id;
    side;
    txId;
    txId2;
    referenceOrder;
    reqType;
    marketPair;
    matchedMQ;
    matchedBQ;
    timestamp;
    orderStatus;
    isVoid;
    isCancel;
    mainOrder;
    matchedTx;
    matchedTx2;
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({
        type: 'int8',
        name: 'id'
    }),
    __metadata("design:type", Number)
], MatchObsOrderEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        name: 'side',
        enumName: 'SIDE',
        enum: [
            tsSide_enum_1.TsSide.BUY,
            tsSide_enum_1.TsSide.SELL
        ],
        default: () => `'${tsSide_enum_1.TsSide.BUY}'`,
        nullable: false,
    }),
    __metadata("design:type", typeof (_a = typeof tsSide_enum_1.TsSide !== "undefined" && tsSide_enum_1.TsSide) === "function" ? _a : Object)
], MatchObsOrderEntity.prototype, "side", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int8',
        name: 'txId',
        nullable: true,
    }),
    __metadata("design:type", Object)
], MatchObsOrderEntity.prototype, "txId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int8',
        name: 'txId2',
        nullable: true,
    }),
    __metadata("design:type", Object)
], MatchObsOrderEntity.prototype, "txId2", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int8',
        name: 'referenceOrder',
        nullable: false,
    }),
    __metadata("design:type", Number)
], MatchObsOrderEntity.prototype, "referenceOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'integer',
        name: 'reqType',
        nullable: false,
        default: 0,
    }),
    __metadata("design:type", Number)
], MatchObsOrderEntity.prototype, "reqType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'marketPair',
        length: 100,
        default: `'ETH/USDC'`,
        nullable: false
    }),
    __metadata("design:type", String)
], MatchObsOrderEntity.prototype, "marketPair", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'matchedMQ',
        precision: 86,
        scale: 0,
        default: 0n,
    }),
    __metadata("design:type", BigInt)
], MatchObsOrderEntity.prototype, "matchedMQ", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'matchedBQ',
        precision: 86,
        scale: 0,
        default: 0n
    }),
    __metadata("design:type", BigInt)
], MatchObsOrderEntity.prototype, "matchedBQ", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp without time zone',
        name: 'timestamp',
        precision: 3,
        nullable: false,
        default: 'now()'
    }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], MatchObsOrderEntity.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'integer',
        name: 'orderStatus',
        default: 1,
    }),
    __metadata("design:type", Number)
], MatchObsOrderEntity.prototype, "orderStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'boolean',
        name: 'isVoid',
        default: false,
    }),
    __metadata("design:type", Boolean)
], MatchObsOrderEntity.prototype, "isVoid", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'boolean',
        name: 'isCancel',
        default: false,
    }),
    __metadata("design:type", Boolean)
], MatchObsOrderEntity.prototype, "isCancel", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => obsOrder_entity_1.ObsOrderEntity, (obsOrder) => obsOrder.matchOrders, {
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
    }),
    (0, typeorm_1.JoinColumn)({
        name: 'referenceOrder',
        referencedColumnName: 'id',
    }),
    __metadata("design:type", typeof (_c = typeof obsOrder_entity_1.ObsOrderEntity !== "undefined" && obsOrder_entity_1.ObsOrderEntity) === "function" ? _c : Object)
], MatchObsOrderEntity.prototype, "mainOrder", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => transactionInfo_entity_1.TransactionInfo, (transaction) => transaction.matchedOrder, {
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
    }),
    (0, typeorm_1.JoinColumn)({
        name: 'txId',
        referencedColumnName: 'txId'
    }),
    __metadata("design:type", Object)
], MatchObsOrderEntity.prototype, "matchedTx", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => transactionInfo_entity_1.TransactionInfo, (transaction) => transaction.matchedOrder2, {
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
    }),
    (0, typeorm_1.JoinColumn)({
        name: 'txId2',
        referencedColumnName: 'txId'
    }),
    __metadata("design:type", Object)
], MatchObsOrderEntity.prototype, "matchedTx2", void 0);
MatchObsOrderEntity = __decorate([
    (0, typeorm_1.Entity)('MatchObsOrder', { schema: 'public' })
], MatchObsOrderEntity);
exports.MatchObsOrderEntity = MatchObsOrderEntity;


/***/ }),
/* 40 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TsSide = void 0;
var TsSide;
(function (TsSide) {
    TsSide["BUY"] = "0";
    TsSide["SELL"] = "1";
})(TsSide = exports.TsSide || (exports.TsSide = {}));


/***/ }),
/* 41 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BlockInformation = void 0;
const typeorm_1 = __webpack_require__(24);
const baseTimeEntity_1 = __webpack_require__(32);
const blockStatus_enum_1 = __webpack_require__(42);
const transactionInfo_entity_1 = __webpack_require__(38);
let BlockInformation = class BlockInformation extends baseTimeEntity_1.BaseTimeEntity {
    blockNumber;
    blockHash;
    L1TransactionHash;
    verifiedAt;
    operatorAddress;
    rawData;
    callData;
    proof;
    blockStatus;
    transactionInfos;
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({
        type: 'integer',
        name: 'blockNumber'
    }),
    __metadata("design:type", Number)
], BlockInformation.prototype, "blockNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'blockHash',
        length: 256,
        nullable: true,
    }),
    __metadata("design:type", Object)
], BlockInformation.prototype, "blockHash", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'L1TransactionHash',
        length: 512,
    }),
    __metadata("design:type", String)
], BlockInformation.prototype, "L1TransactionHash", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp without time zone',
        name: 'verifiedAt',
        nullable: false,
    }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], BlockInformation.prototype, "verifiedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'operatorAddress',
        length: 256,
        nullable: false,
    }),
    __metadata("design:type", String)
], BlockInformation.prototype, "operatorAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        name: 'rawData',
        nullable: true,
    }),
    __metadata("design:type", Object)
], BlockInformation.prototype, "rawData", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'json',
        name: 'callData',
        nullable: true,
        default: () => '\'{}\'',
    }),
    __metadata("design:type", Object)
], BlockInformation.prototype, "callData", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'json',
        name: 'proof',
        nullable: true,
        default: () => '\'{}\'',
    }),
    __metadata("design:type", Object)
], BlockInformation.prototype, "proof", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        name: 'blockStatus',
        nullable: false,
        enumName: 'BLOCK_STATUS',
        enum: [
            blockStatus_enum_1.BLOCK_STATUS.PROCESSING,
            blockStatus_enum_1.BLOCK_STATUS.L2EXECUTED,
            blockStatus_enum_1.BLOCK_STATUS.L2CONFIRMED,
            blockStatus_enum_1.BLOCK_STATUS.L1CONFIRMED
        ],
        default: `'${blockStatus_enum_1.BLOCK_STATUS.PROCESSING}'`,
    }),
    __metadata("design:type", typeof (_b = typeof blockStatus_enum_1.BLOCK_STATUS !== "undefined" && blockStatus_enum_1.BLOCK_STATUS) === "function" ? _b : Object)
], BlockInformation.prototype, "blockStatus", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => transactionInfo_entity_1.TransactionInfo, transactionInfo => transactionInfo.blockInfo),
    (0, typeorm_1.JoinColumn)({
        name: 'blockNumber',
        referencedColumnName: 'blockNumber'
    }),
    __metadata("design:type", Object)
], BlockInformation.prototype, "transactionInfos", void 0);
BlockInformation = __decorate([
    (0, typeorm_1.Entity)('BlockInformation', { schema: 'public' })
], BlockInformation);
exports.BlockInformation = BlockInformation;


/***/ }),
/* 42 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BLOCK_STATUS = void 0;
var BLOCK_STATUS;
(function (BLOCK_STATUS) {
    BLOCK_STATUS["PROCESSING"] = "PROCESSING";
    BLOCK_STATUS["L2EXECUTED"] = "L2EXECUTED";
    BLOCK_STATUS["L2CONFIRMED"] = "L2CONFIRMED";
    BLOCK_STATUS["L1CONFIRMED"] = "L1CONFIRMED";
})(BLOCK_STATUS = exports.BLOCK_STATUS || (exports.BLOCK_STATUS = {}));
;


/***/ }),
/* 43 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TS_STATUS = void 0;
var TS_STATUS;
(function (TS_STATUS) {
    TS_STATUS["PENDING"] = "PENDING";
    TS_STATUS["PROCESSING"] = "PROCESSING";
    TS_STATUS["L2EXECUTED"] = "L2EXECUTED";
    TS_STATUS["L2CONFIRMED"] = "L2CONFIRMED";
    TS_STATUS["L1CONFIRMED"] = "L1CONFIRMED";
    TS_STATUS["FAILED"] = "FAILED";
    TS_STATUS["REJECTED"] = "REJECTED";
})(TS_STATUS = exports.TS_STATUS || (exports.TS_STATUS = {}));


/***/ }),
/* 44 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ObsOrderLeafMerkleTreeNode = void 0;
const typeorm_1 = __webpack_require__(24);
const obsOrderLeaf_entity_1 = __webpack_require__(29);
let ObsOrderLeafMerkleTreeNode = class ObsOrderLeafMerkleTreeNode {
    id;
    hash;
    leafId;
    leaf;
};
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'decimal',
        name: 'id',
        precision: 86,
        scale: 0,
        primary: true,
    }),
    __metadata("design:type", String)
], ObsOrderLeafMerkleTreeNode.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'hash',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", BigInt)
], ObsOrderLeafMerkleTreeNode.prototype, "hash", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'leafId',
        precision: 86,
        scale: 0,
        nullable: true
    }),
    __metadata("design:type", Object)
], ObsOrderLeafMerkleTreeNode.prototype, "leafId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => obsOrderLeaf_entity_1.ObsOrderLeafEntity, (obsOrderLeaf) => obsOrderLeaf.merkleTreeNode),
    (0, typeorm_1.JoinColumn)({
        name: 'leafId',
        referencedColumnName: 'orderLeafId'
    }),
    __metadata("design:type", Object)
], ObsOrderLeafMerkleTreeNode.prototype, "leaf", void 0);
ObsOrderLeafMerkleTreeNode = __decorate([
    (0, typeorm_1.Entity)('ObsOrderLeafMerkleTreeNode', { schema: 'public' })
], ObsOrderLeafMerkleTreeNode);
exports.ObsOrderLeafMerkleTreeNode = ObsOrderLeafMerkleTreeNode;


/***/ }),
/* 45 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MerkleTreeController_1;
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MerkleTreeController = void 0;
const common_1 = __webpack_require__(7);
const marketPairInfo_service_1 = __webpack_require__(46);
const updateAccountTree_dto_1 = __webpack_require__(48);
const updateTokenTree_dto_1 = __webpack_require__(50);
const tsAccountTree_service_1 = __webpack_require__(51);
const tsTokenTree_service_1 = __webpack_require__(52);
const MarketPairInfo_dto_1 = __webpack_require__(53);
const tsSide_enum_1 = __webpack_require__(40);
const obsOrderTree_service_1 = __webpack_require__(23);
const updateObsOrderTree_dto_1 = __webpack_require__(54);
let MerkleTreeController = MerkleTreeController_1 = class MerkleTreeController {
    tsAccountTreeService;
    tsTokenTreeService;
    marketPairInfoService;
    obsOrderTreeService;
    logger = new common_1.Logger(MerkleTreeController_1.name);
    accountLeafId = 100n;
    constructor(tsAccountTreeService, tsTokenTreeService, marketPairInfoService, obsOrderTreeService) {
        this.tsAccountTreeService = tsAccountTreeService;
        this.tsTokenTreeService = tsTokenTreeService;
        this.marketPairInfoService = marketPairInfoService;
        this.obsOrderTreeService = obsOrderTreeService;
        this.tsAccountTreeService.getCurrentLeafIdCount().then((id) => {
            this.accountLeafId = BigInt(id) + 100n;
            console.log(`accountLeafId: ${this.accountLeafId}`);
        });
    }
    async updateAccountTree(updateAccountTreeDto) {
        console.time('controller updateAccountTree');
        await this.tsAccountTreeService.updateLeaf(BigInt(updateAccountTreeDto.leafId), updateAccountTreeDto);
        console.timeEnd('controller updateAccountTree');
    }
    async updateTokenTree(updateTokenTreeDto) {
        console.time('controller updateTokenTree');
        await this.tsTokenTreeService.updateLeaf(BigInt(updateTokenTreeDto.leafId), updateTokenTreeDto);
        console.timeEnd('controller updateTokenTree');
    }
    async updateObsOrderTree(updateObsOrderTreeDto) {
        console.time('controller updateObsOrderTree');
        await this.obsOrderTreeService.updateLeaf(BigInt(updateObsOrderTreeDto.orderLeafId), updateObsOrderTreeDto);
        console.timeEnd('controller updateObsOrderTree');
    }
    async getMarketPairInfo(dto) {
        console.log(dto);
        const pair = [{
                mainTokenId: dto.sellTokenId,
                baseTokenId: dto.buyTokenId,
            }, {
                mainTokenId: dto.buyTokenId,
                baseTokenId: dto.sellTokenId,
            }];
        const marketPairInfo = await this.marketPairInfoService.findOneMarketPairInfo({ pairs: pair });
        const side = marketPairInfo.mainTokenId === dto.buyTokenId ? tsSide_enum_1.TsSide.BUY : tsSide_enum_1.TsSide.SELL;
        return {
            ...marketPairInfo,
            side,
        };
    }
};
__decorate([
    (0, common_1.Post)('updateAccountTree'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof updateAccountTree_dto_1.UpdateAccountTreeDto !== "undefined" && updateAccountTree_dto_1.UpdateAccountTreeDto) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], MerkleTreeController.prototype, "updateAccountTree", null);
__decorate([
    (0, common_1.Post)('updateTokenTree'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof updateTokenTree_dto_1.UpdateTokenTreeDto !== "undefined" && updateTokenTree_dto_1.UpdateTokenTreeDto) === "function" ? _f : Object]),
    __metadata("design:returntype", Promise)
], MerkleTreeController.prototype, "updateTokenTree", null);
__decorate([
    (0, common_1.Post)('updateObsOrderTree'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_g = typeof updateObsOrderTree_dto_1.UpdateObsOrderTreeDto !== "undefined" && updateObsOrderTree_dto_1.UpdateObsOrderTreeDto) === "function" ? _g : Object]),
    __metadata("design:returntype", Promise)
], MerkleTreeController.prototype, "updateObsOrderTree", null);
__decorate([
    (0, common_1.Get)('marketPairInfo'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_h = typeof MarketPairInfo_dto_1.MarketSellBuyPair !== "undefined" && MarketPairInfo_dto_1.MarketSellBuyPair) === "function" ? _h : Object]),
    __metadata("design:returntype", Promise)
], MerkleTreeController.prototype, "getMarketPairInfo", null);
MerkleTreeController = MerkleTreeController_1 = __decorate([
    (0, common_1.Controller)('merkleTree'),
    __metadata("design:paramtypes", [typeof (_a = typeof tsAccountTree_service_1.TsAccountTreeService !== "undefined" && tsAccountTree_service_1.TsAccountTreeService) === "function" ? _a : Object, typeof (_b = typeof tsTokenTree_service_1.TsTokenTreeService !== "undefined" && tsTokenTree_service_1.TsTokenTreeService) === "function" ? _b : Object, typeof (_c = typeof marketPairInfo_service_1.MarketPairInfoService !== "undefined" && marketPairInfo_service_1.MarketPairInfoService) === "function" ? _c : Object, typeof (_d = typeof obsOrderTree_service_1.ObsOrderTreeService !== "undefined" && obsOrderTree_service_1.ObsOrderTreeService) === "function" ? _d : Object])
], MerkleTreeController);
exports.MerkleTreeController = MerkleTreeController;


/***/ }),
/* 46 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MarketPairInfoService = void 0;
const common_1 = __webpack_require__(7);
const typeorm_1 = __webpack_require__(21);
const typeorm_2 = __webpack_require__(24);
const marketPairInfo_entity_1 = __webpack_require__(47);
let MarketPairInfoService = class MarketPairInfoService {
    marketPairInfoRepository;
    constructor(marketPairInfoRepository) {
        this.marketPairInfoRepository = marketPairInfoRepository;
    }
    async findOneMarketPairInfo(marketPairDto) {
        console.log(marketPairDto);
        try {
            const marketPairInfo = await this.marketPairInfoRepository.findOneOrFail({
                select: ['mainTokenId', 'baseTokenId', 'marketPair'],
                where: [{
                        mainTokenId: marketPairDto.pairs[0].mainTokenId,
                        baseTokenId: marketPairDto.pairs[0].baseTokenId,
                    }, {
                        mainTokenId: marketPairDto.pairs[1].mainTokenId,
                        baseTokenId: marketPairDto.pairs[1].baseTokenId,
                    }]
            });
            return marketPairInfo;
        }
        catch (error) {
            throw new common_1.NotFoundException('MarketPairInfo not found');
        }
    }
};
MarketPairInfoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(marketPairInfo_entity_1.MarketPairInfoEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], MarketPairInfoService);
exports.MarketPairInfoService = MarketPairInfoService;


/***/ }),
/* 47 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MarketPairInfoEntity = void 0;
const typeorm_1 = __webpack_require__(24);
let MarketPairInfoEntity = class MarketPairInfoEntity {
    id;
    mainTokenId;
    baseTokenId;
    marketPair;
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({
        type: 'integer',
        name: 'id'
    }),
    __metadata("design:type", Number)
], MarketPairInfoEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'mainTokenId',
        precision: 86,
        scale: 0,
        default: 0n,
        nullable: false
    }),
    __metadata("design:type", String)
], MarketPairInfoEntity.prototype, "mainTokenId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'baseTokenId',
        precision: 86,
        scale: 0,
        default: 0n,
        nullable: false
    }),
    __metadata("design:type", String)
], MarketPairInfoEntity.prototype, "baseTokenId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'marketPair',
        length: '100',
        nullable: false,
        default: () => 'ETH/USDC'
    }),
    __metadata("design:type", String)
], MarketPairInfoEntity.prototype, "marketPair", void 0);
MarketPairInfoEntity = __decorate([
    (0, typeorm_1.Entity)('MarketPairInfo', { schema: 'public' })
], MarketPairInfoEntity);
exports.MarketPairInfoEntity = MarketPairInfoEntity;


/***/ }),
/* 48 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateAccountTreeDto = void 0;
const swagger_1 = __webpack_require__(49);
class UpdateAccountTreeDto {
    leafId;
    tsAddr;
    nonce;
    tokenRoot;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UpdateAccountTreeDto.prototype, "leafId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UpdateAccountTreeDto.prototype, "tsAddr", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UpdateAccountTreeDto.prototype, "nonce", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UpdateAccountTreeDto.prototype, "tokenRoot", void 0);
exports.UpdateAccountTreeDto = UpdateAccountTreeDto;


/***/ }),
/* 49 */
/***/ ((module) => {

module.exports = require("@nestjs/swagger");;

/***/ }),
/* 50 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateTokenTreeDto = void 0;
const swagger_1 = __webpack_require__(49);
class UpdateTokenTreeDto {
    lockedAmt;
    availableAmt;
    leafId;
    accountId;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UpdateTokenTreeDto.prototype, "lockedAmt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UpdateTokenTreeDto.prototype, "availableAmt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UpdateTokenTreeDto.prototype, "leafId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UpdateTokenTreeDto.prototype, "accountId", void 0);
exports.UpdateTokenTreeDto = UpdateTokenTreeDto;


/***/ }),
/* 51 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TsAccountTreeService_1;
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TsAccountTreeService = void 0;
const common_1 = __webpack_require__(7);
const typeorm_1 = __webpack_require__(21);
const accountMerkleTreeNode_entity_1 = __webpack_require__(33);
const accountLeafNode_entity_1 = __webpack_require__(34);
const typeorm_2 = __webpack_require__(24);
const ts_helper_1 = __webpack_require__(25);
const tsMerkleTree_1 = __webpack_require__(28);
const config_1 = __webpack_require__(11);
let TsAccountTreeService = TsAccountTreeService_1 = class TsAccountTreeService extends tsMerkleTree_1.TsMerkleTree {
    accountLeafNodeRepository;
    accountMerkleTreeRepository;
    connection;
    configService;
    logger = new common_1.Logger(TsAccountTreeService_1.name);
    constructor(accountLeafNodeRepository, accountMerkleTreeRepository, connection, configService) {
        console.time('create Account Tree');
        super(configService.get('ACCOUNTS_TREE_HEIGHT', 32), ts_helper_1.tsHashFunc);
        this.accountLeafNodeRepository = accountLeafNodeRepository;
        this.accountMerkleTreeRepository = accountMerkleTreeRepository;
        this.connection = connection;
        this.configService = configService;
        console.timeEnd('create Account Tree');
    }
    async getCurrentLeafIdCount() {
        const leafIdCount = await this.accountLeafNodeRepository.count();
        return leafIdCount;
    }
    getLeafDefaultVavlue() {
        return (0, ts_helper_1.toTreeLeaf)([0n, 0n, 0n]);
    }
    async updateLeaf(leafId, value) {
        console.time('updateLeaf for account tree');
        const prf = this.getProofIds(leafId);
        const id = this.getLeafIdInTree(leafId);
        await this.connection.transaction(async (manager) => {
            await manager.upsert(accountMerkleTreeNode_entity_1.AccountMerkleTreeNode, {
                id: id.toString(),
                leafId: leafId,
                hash: BigInt((0, ts_helper_1.toTreeLeaf)([
                    BigInt(value.tsAddr),
                    BigInt(value.nonce),
                    BigInt(value.tokenRoot)
                ]))
            }, ['id']);
            await manager.upsert(accountLeafNode_entity_1.AccountLeafNode, {
                tsAddr: BigInt(value.tsAddr),
                nonce: BigInt(value.nonce),
                tokenRoot: BigInt(value.tokenRoot),
                leafId: leafId.toString(),
            }, ['leafId']);
            for (let i = id, j = 0; i > 1n; i = i >> 1n) {
                const [iValue, jValue] = await Promise.all([
                    this.accountMerkleTreeRepository.findOneBy({ id: i.toString() }),
                    this.accountMerkleTreeRepository.findOneBy({ id: prf[j].toString() })
                ]);
                const jLevel = Math.floor(Math.log2(Number(prf[j])));
                const iLevel = Math.floor(Math.log2(Number(i)));
                const jHashValue = (jValue == null) ? this.getDefaultHashByLevel(jLevel) : jValue.hash.toString();
                const iHashValue = (iValue == null) ? this.getDefaultHashByLevel(iLevel) : iValue.hash.toString();
                let r = (id % 2n == 0n) ? [jHashValue, iHashValue] : [iHashValue, jHashValue];
                const hash = this.hashFunc(r);
                const jobs = [];
                if (iValue == null) {
                    jobs.push(manager.upsert(accountMerkleTreeNode_entity_1.AccountMerkleTreeNode, {
                        id: i.toString(),
                        hash: BigInt(iHashValue)
                    }, ['id']));
                }
                if (jValue == null && j < prf.length) {
                    jobs.push(manager.upsert(accountMerkleTreeNode_entity_1.AccountMerkleTreeNode, {
                        id: prf[j].toString(),
                        hash: BigInt(jHashValue)
                    }, ['id']));
                }
                const updateRoot = i >> 1n;
                if (updateRoot >= 1n) {
                    jobs.push(manager.upsert(accountMerkleTreeNode_entity_1.AccountMerkleTreeNode, {
                        id: updateRoot.toString(),
                        hash: BigInt(hash)
                    }, ['id']));
                }
                await Promise.all(jobs);
                j++;
            }
        });
        console.timeEnd('updateLeaf for account tree');
    }
    async getLeaf(leaf_id, otherPayload) {
        const result = await this.accountLeafNodeRepository.findOneBy({ leafId: leaf_id.toString() });
        if (result == null) {
            const id = this.getLeafIdInTree(leaf_id);
            const level = Math.floor(Math.log2(Number(id)));
            const hash = this.getDefaultHashByLevel(level);
            await this.connection.transaction(async (manager) => {
                await manager.insert(accountMerkleTreeNode_entity_1.AccountMerkleTreeNode, {
                    leafId: leaf_id,
                    id: id.toString(),
                    hash: BigInt(hash)
                });
                await manager.insert(accountLeafNode_entity_1.AccountLeafNode, {
                    leafId: leaf_id.toString(),
                    tsAddr: 0n,
                    nonce: 0n,
                });
            });
            return await this.accountLeafNodeRepository.findOneBy({ leafId: leaf_id.toString() });
        }
        return result;
    }
    async getRoot() {
        const result = await this.accountMerkleTreeRepository.findOneBy({
            id: 1n.toString(),
        });
        if (result == null) {
            const hash = await this.getDefaultHashByLevel(1);
            await this.accountMerkleTreeRepository.insert({
                id: 1n.toString(),
                hash: BigInt(hash)
            });
            return {
                id: 1n.toString(),
                hash: hash
            };
        }
        return result;
    }
};
TsAccountTreeService = TsAccountTreeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(accountLeafNode_entity_1.AccountLeafNode)),
    __param(1, (0, typeorm_1.InjectRepository)(accountMerkleTreeNode_entity_1.AccountMerkleTreeNode)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Connection !== "undefined" && typeorm_2.Connection) === "function" ? _c : Object, typeof (_d = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _d : Object])
], TsAccountTreeService);
exports.TsAccountTreeService = TsAccountTreeService;


/***/ }),
/* 52 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TsTokenTreeService_1;
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TsTokenTreeService = void 0;
const common_1 = __webpack_require__(7);
const config_1 = __webpack_require__(11);
const typeorm_1 = __webpack_require__(21);
const typeorm_2 = __webpack_require__(24);
const ts_helper_1 = __webpack_require__(25);
const tsMerkleTree_1 = __webpack_require__(28);
const tokenLeafNode_entity_1 = __webpack_require__(36);
const tokenMerkleTreeNode_entity_1 = __webpack_require__(35);
let TsTokenTreeService = TsTokenTreeService_1 = class TsTokenTreeService extends tsMerkleTree_1.TsMerkleTree {
    tokenLeafRepository;
    tokenMerkleTreeRepository;
    connection;
    configService;
    logger = new common_1.Logger(TsTokenTreeService_1.name);
    constructor(tokenLeafRepository, tokenMerkleTreeRepository, connection, configService) {
        console.time('init token tree');
        super(configService.get('TOKENS_TREE_HEIGHT', 2), ts_helper_1.tsHashFunc);
        this.tokenLeafRepository = tokenLeafRepository;
        this.tokenMerkleTreeRepository = tokenMerkleTreeRepository;
        this.connection = connection;
        this.configService = configService;
        console.timeEnd('init token tree');
    }
    async getCurrentLeafIdCount(accountId) {
        const leafIdCount = await this.tokenMerkleTreeRepository.count({
            where: {
                accountId: accountId.toString(),
                leafId: (0, typeorm_2.Not)((0, typeorm_2.IsNull)())
            }
        });
        return leafIdCount;
    }
    getLeafDefaultVavlue() {
        return (0, ts_helper_1.toTreeLeaf)([0n, 0n, 0n]);
    }
    async updateLeaf(leafId, value) {
        console.time('updateLeaf for token tree');
        const prf = this.getProofIds(leafId);
        const id = this.getLeafIdInTree(leafId);
        const leafHash = (0, ts_helper_1.toTreeLeaf)([BigInt(value.leafId), BigInt(value.lockedAmt), BigInt(value.availableAmt)]);
        await this.connection.transaction(async (manager) => {
            const accountId = value.accountId;
            await manager.upsert(tokenMerkleTreeNode_entity_1.TokenMerkleTreeNode, {
                accountId: accountId,
                id: id.toString(),
                leafId: leafId.toString(),
                hash: BigInt(leafHash)
            }, ['id', 'accountId']);
            await manager.upsert(tokenLeafNode_entity_1.TokenLeafNode, {
                leafId: leafId.toString(),
                accountId: accountId,
                lockedAmt: BigInt(value.lockedAmt),
                availableAmt: BigInt(value.availableAmt)
            }, ['leafId', 'accountId']);
            for (let i = id, j = 0; i > 1n; i = i >> 1n) {
                const [iValue, jValue] = await Promise.all([
                    this.tokenMerkleTreeRepository.findOneBy({ id: i.toString(), accountId: accountId }),
                    this.tokenMerkleTreeRepository.findOneBy({ id: prf[j].toString(), accountId: accountId })
                ]);
                const jLevel = Math.floor(Math.log2(Number(prf[j])));
                const iLevel = Math.floor(Math.log2(Number(i)));
                const jHashValue = (jValue == null) ? this.getDefaultHashByLevel(jLevel) : jValue.hash.toString();
                const iHashValue = (iValue == null) ? this.getDefaultHashByLevel(iLevel) : iValue.hash.toString();
                let r = (id % 2n == 0n) ? [jHashValue, iHashValue] : [iHashValue, jHashValue];
                const hash = this.hashFunc(r);
                const jobs = [];
                if (iValue == null) {
                    jobs.push(manager.upsert(tokenMerkleTreeNode_entity_1.TokenMerkleTreeNode, {
                        id: i.toString(), accountId: accountId, hash: BigInt(iHashValue)
                    }, ['id', 'accountId']));
                }
                if (jValue == null && j < prf.length) {
                    jobs.push(manager.upsert(tokenMerkleTreeNode_entity_1.TokenMerkleTreeNode, {
                        id: prf[j].toString(), accountId: accountId, hash: BigInt(jHashValue)
                    }, ['id', 'accountId']));
                }
                const updateRoot = i >> 1n;
                if (updateRoot >= 1n) {
                    jobs.push(this.tokenMerkleTreeRepository.upsert([{
                            id: updateRoot.toString(), accountId: accountId, hash: BigInt(hash)
                        }], ['id', 'accountId']));
                }
                await Promise.all(jobs);
                j++;
            }
        });
        console.timeEnd('updateLeaf for token tree');
    }
    async getLeaf(leaf_id, accountId) {
        const result = await this.tokenLeafRepository.findOneBy({ leafId: leaf_id.toString(),
            accountId: accountId });
        if (result == null) {
            const id = this.getLeafIdInTree(leaf_id);
            const level = Math.floor(Math.log2(Number(id)));
            const hash = this.getDefaultHashByLevel(level);
            await this.connection.transaction(async (manager) => {
                await manager.insert(tokenMerkleTreeNode_entity_1.TokenMerkleTreeNode, {
                    accountId: accountId,
                    id: id.toString(),
                    leafId: leaf_id.toString(),
                    hash: BigInt(hash)
                });
                await manager.insert(tokenLeafNode_entity_1.TokenLeafNode, {
                    leafId: leaf_id.toString(),
                    accountId: accountId,
                });
            });
            return await this.tokenLeafRepository.findOneBy({ leafId: leaf_id.toString(), accountId: accountId });
        }
        return result;
    }
    async getRoot(accountId) {
        const result = await this.tokenMerkleTreeRepository.findOneBy({ accountId: accountId, id: 1n.toString() });
        if (result == null) {
            const hash = this.getDefaultHashByLevel(1);
            await this.tokenMerkleTreeRepository.insert({
                accountId: accountId,
                id: 1n.toString(),
                hash: BigInt(hash)
            });
            return {
                accountId: accountId,
                id: 1,
                leafId: null,
                hash: hash
            };
        }
        const resultHash = result.hash ? result.hash.toString() : '';
        return {
            accountId: accountId,
            id: 1,
            leafId: null,
            hash: resultHash,
        };
    }
};
TsTokenTreeService = TsTokenTreeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tokenLeafNode_entity_1.TokenLeafNode)),
    __param(1, (0, typeorm_1.InjectRepository)(tokenMerkleTreeNode_entity_1.TokenMerkleTreeNode)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Connection !== "undefined" && typeorm_2.Connection) === "function" ? _c : Object, typeof (_d = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _d : Object])
], TsTokenTreeService);
exports.TsTokenTreeService = TsTokenTreeService;


/***/ }),
/* 53 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MarketSellBuyPair = exports.MarketPairInfoRequestDto = exports.MarketPair = exports.MarketPairInfoResponseDto = void 0;
const swagger_1 = __webpack_require__(49);
class MarketPairInfoResponseDto {
    mainTokenId;
    baseTokenId;
    marketPair;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MarketPairInfoResponseDto.prototype, "mainTokenId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MarketPairInfoResponseDto.prototype, "baseTokenId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MarketPairInfoResponseDto.prototype, "marketPair", void 0);
exports.MarketPairInfoResponseDto = MarketPairInfoResponseDto;
class MarketPair {
    mainTokenId;
    baseTokenId;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MarketPair.prototype, "mainTokenId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MarketPair.prototype, "baseTokenId", void 0);
exports.MarketPair = MarketPair;
class MarketPairInfoRequestDto {
    pairs;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Array)
], MarketPairInfoRequestDto.prototype, "pairs", void 0);
exports.MarketPairInfoRequestDto = MarketPairInfoRequestDto;
class MarketSellBuyPair {
    sellTokenId;
    buyTokenId;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MarketSellBuyPair.prototype, "sellTokenId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MarketSellBuyPair.prototype, "buyTokenId", void 0);
exports.MarketSellBuyPair = MarketSellBuyPair;


/***/ }),
/* 54 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateObsOrderTreeDto = void 0;
const swagger_1 = __webpack_require__(49);
class UpdateObsOrderTreeDto {
    orderLeafId;
    txId;
    reqType;
    sender;
    sellTokenId;
    nonce;
    sellAmt;
    buyTokenId;
    buyAmt;
    accumulatedSellAmt;
    accumulatedBuyAmt;
    orderId;
}
__decorate([
    (0, swagger_1.ApiProperty)({
        type: String
    }),
    __metadata("design:type", String)
], UpdateObsOrderTreeDto.prototype, "orderLeafId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: String
    }),
    __metadata("design:type", String)
], UpdateObsOrderTreeDto.prototype, "txId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: String
    }),
    __metadata("design:type", String)
], UpdateObsOrderTreeDto.prototype, "reqType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: String
    }),
    __metadata("design:type", String)
], UpdateObsOrderTreeDto.prototype, "sender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: String
    }),
    __metadata("design:type", String)
], UpdateObsOrderTreeDto.prototype, "sellTokenId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: String
    }),
    __metadata("design:type", String)
], UpdateObsOrderTreeDto.prototype, "nonce", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: String
    }),
    __metadata("design:type", String)
], UpdateObsOrderTreeDto.prototype, "sellAmt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: String
    }),
    __metadata("design:type", String)
], UpdateObsOrderTreeDto.prototype, "buyTokenId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: String
    }),
    __metadata("design:type", String)
], UpdateObsOrderTreeDto.prototype, "buyAmt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: String
    }),
    __metadata("design:type", String)
], UpdateObsOrderTreeDto.prototype, "accumulatedSellAmt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: String
    }),
    __metadata("design:type", String)
], UpdateObsOrderTreeDto.prototype, "accumulatedBuyAmt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: String
    }),
    __metadata("design:type", String)
], UpdateObsOrderTreeDto.prototype, "orderId", void 0);
exports.UpdateObsOrderTreeDto = UpdateObsOrderTreeDto;


/***/ }),
/* 55 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuctionOrderMoudle = void 0;
const common_1 = __webpack_require__(7);
const config_1 = __webpack_require__(11);
const typeorm_1 = __webpack_require__(21);
const auctionBondToken_entity_1 = __webpack_require__(56);
const obsOrder_entity_1 = __webpack_require__(30);
const obsOrderLeaf_entity_1 = __webpack_require__(29);
const matchObsOrder_entity_1 = __webpack_require__(39);
const candleStick_entity_1 = __webpack_require__(58);
const obsOrderLeafMerkleTreeNode_entity_1 = __webpack_require__(44);
const marketPairInfo_entity_1 = __webpack_require__(47);
const marketPairInfo_service_1 = __webpack_require__(46);
const availableView_entity_1 = __webpack_require__(59);
let AuctionOrderMoudle = class AuctionOrderMoudle {
};
AuctionOrderMoudle = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, typeorm_1.TypeOrmModule.forFeature([
                obsOrder_entity_1.ObsOrderEntity,
                obsOrderLeaf_entity_1.ObsOrderLeafEntity,
                obsOrderLeafMerkleTreeNode_entity_1.ObsOrderLeafMerkleTreeNode,
                matchObsOrder_entity_1.MatchObsOrderEntity,
                marketPairInfo_entity_1.MarketPairInfoEntity,
                candleStick_entity_1.CandleStickEntity,
                auctionBondToken_entity_1.AuctionBondTokenEntity,
                availableView_entity_1.AvailableViewEntity
            ])],
        providers: [config_1.ConfigService, marketPairInfo_service_1.MarketPairInfoService],
        exports: [typeorm_1.TypeOrmModule, marketPairInfo_service_1.MarketPairInfoService]
    })
], AuctionOrderMoudle);
exports.AuctionOrderMoudle = AuctionOrderMoudle;


/***/ }),
/* 56 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuctionBondTokenEntity = exports.BondTokenStatusIndex = void 0;
const ts_types_1 = __webpack_require__(57);
const typeorm_1 = __webpack_require__(24);
var BondTokenStatusIndex;
(function (BondTokenStatusIndex) {
    BondTokenStatusIndex[BondTokenStatusIndex["isL1Deployed"] = 1] = "isL1Deployed";
    BondTokenStatusIndex[BondTokenStatusIndex["isAvailable"] = 2] = "isAvailable";
    BondTokenStatusIndex[BondTokenStatusIndex["isExcceeded"] = 4] = "isExcceeded";
})(BondTokenStatusIndex = exports.BondTokenStatusIndex || (exports.BondTokenStatusIndex = {}));
let AuctionBondTokenEntity = class AuctionBondTokenEntity {
    bondId;
    L1Addr;
    L2Addr;
    underlyingToken;
    lastSyncBlocknumberForDepositEvent;
    maturityDate;
    status;
    getStatus(statusId) {
        return this.status & statusId;
    }
    setStatus(statusId) {
        this.status |= statusId;
    }
    createdAt;
    updatedAt;
    updatedBy;
    deletedBy;
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({
        type: 'integer',
        name: 'bondId',
    }),
    __metadata("design:type", Number)
], AuctionBondTokenEntity.prototype, "bondId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'L1Addr',
        nullable: true,
        length: 256,
    }),
    __metadata("design:type", String)
], AuctionBondTokenEntity.prototype, "L1Addr", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'L2Addr',
        precision: 86,
        scale: 0,
        nullable: false,
    }),
    __metadata("design:type", typeof (_a = typeof ts_types_1.TsTokenAddress !== "undefined" && ts_types_1.TsTokenAddress) === "function" ? _a : Object)
], AuctionBondTokenEntity.prototype, "L2Addr", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'underlyingToken',
        precision: 86,
        scale: 0,
        nullable: false,
    }),
    __metadata("design:type", typeof (_b = typeof ts_types_1.TsTokenAddress !== "undefined" && ts_types_1.TsTokenAddress) === "function" ? _b : Object)
], AuctionBondTokenEntity.prototype, "underlyingToken", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'integer',
        name: 'lastSyncBlocknumberForDepositEvent',
        default: 0,
        nullable: false,
    }),
    __metadata("design:type", Number)
], AuctionBondTokenEntity.prototype, "lastSyncBlocknumberForDepositEvent", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp without time zone',
        name: 'maturityDate',
        nullable: false,
    }),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], AuctionBondTokenEntity.prototype, "maturityDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'integer',
        name: 'status',
        nullable: false,
        default: () => 0,
    }),
    __metadata("design:type", Number)
], AuctionBondTokenEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: 'timestamp without time zone',
        name: 'createdAt',
        nullable: false,
        default: 'now()',
    }),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], AuctionBondTokenEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: 'time without time zone',
        name: 'updatedAt',
        nullable: false,
        default: 'now()',
    }),
    __metadata("design:type", typeof (_e = typeof Date !== "undefined" && Date) === "function" ? _e : Object)
], AuctionBondTokenEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'updatedBy',
        nullable: true,
        length: 256,
    }),
    __metadata("design:type", Object)
], AuctionBondTokenEntity.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'deletedBy',
        nullable: true,
        length: 256,
    }),
    __metadata("design:type", Object)
], AuctionBondTokenEntity.prototype, "deletedBy", void 0);
AuctionBondTokenEntity = __decorate([
    (0, typeorm_1.Entity)('AuctionBondToken', { schema: 'public' })
], AuctionBondTokenEntity);
exports.AuctionBondTokenEntity = AuctionBondTokenEntity;


/***/ }),
/* 57 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TsTokenAddress = exports.TsDeciaml = exports.TsTxType = exports.TsDefaultValue = exports.TsSystemAccountAddress = exports.getOChunksSize = exports.MAX_CHUNKS_BYTES_PER_REQ = exports.MAX_CHUNKS_PER_REQ = exports.MIN_CHUNKS_PER_REQ = exports.CHUNK_BITS_SIZE = exports.CHUNK_BYTES_SIZE = exports.LEN_OF_REQUEST = void 0;
exports.LEN_OF_REQUEST = 10;
exports.CHUNK_BYTES_SIZE = 12;
exports.CHUNK_BITS_SIZE = exports.CHUNK_BYTES_SIZE * 8;
exports.MIN_CHUNKS_PER_REQ = 3;
exports.MAX_CHUNKS_PER_REQ = 9;
exports.MAX_CHUNKS_BYTES_PER_REQ = exports.MAX_CHUNKS_PER_REQ * exports.CHUNK_BYTES_SIZE;
function getOChunksSize(batchSize) {
    return exports.MAX_CHUNKS_PER_REQ * batchSize;
}
exports.getOChunksSize = getOChunksSize;
var TsSystemAccountAddress;
(function (TsSystemAccountAddress) {
    TsSystemAccountAddress["BURN_ADDR"] = "0";
    TsSystemAccountAddress["MINT_ADDR"] = "0";
    TsSystemAccountAddress["WITHDRAW_ADDR"] = "0";
    TsSystemAccountAddress["AUCTION_ADDR"] = "0";
})(TsSystemAccountAddress = exports.TsSystemAccountAddress || (exports.TsSystemAccountAddress = {}));
exports.TsDefaultValue = {
    NONCE_ZERO: '0',
    BIGINT_DEFAULT_VALUE: 0n,
    STRING_DEFAULT_VALUE: '0',
    ADDRESS_DEFAULT_VALUE: '0x00',
};
var TsTxType;
(function (TsTxType) {
    TsTxType["UNKNOWN"] = "0";
    TsTxType["NOOP"] = "0";
    TsTxType["REGISTER"] = "1";
    TsTxType["DEPOSIT"] = "2";
    TsTxType["WITHDRAW"] = "3";
    TsTxType["SecondLimitOrder"] = "4";
    TsTxType["SecondLimitStart"] = "5";
    TsTxType["SecondLimitExchange"] = "6";
    TsTxType["SecondLimitEnd"] = "7";
    TsTxType["SecondMarketOrder"] = "8";
    TsTxType["SecondMarketExchange"] = "9";
    TsTxType["SecondMarketEnd"] = "10";
    TsTxType["CancelOrder"] = "11";
    TsTxType["AUCTION_LEND"] = "99";
    TsTxType["AUCTION_BORROW"] = "100";
    TsTxType["AUCTION_CANCEL"] = "101";
})(TsTxType = exports.TsTxType || (exports.TsTxType = {}));
exports.TsDeciaml = {
    TS_TOKEN_AMOUNT_DEC: 18,
    TS_INTEREST_DEC: 6,
};
var TsTokenAddress;
(function (TsTokenAddress) {
    TsTokenAddress["Unknown"] = "0";
    TsTokenAddress["WETH"] = "6";
    TsTokenAddress["WBTC"] = "7";
    TsTokenAddress["USDT"] = "8";
    TsTokenAddress["USDC"] = "9";
    TsTokenAddress["DAI"] = "10";
    TsTokenAddress["TslETH20221231"] = "46";
    TsTokenAddress["TslBTC20221231"] = "47";
    TsTokenAddress["TslUSDT20221231"] = "48";
    TsTokenAddress["TslUSDC20221231"] = "49";
    TsTokenAddress["TslDAI20221231"] = "50";
})(TsTokenAddress = exports.TsTokenAddress || (exports.TsTokenAddress = {}));


/***/ }),
/* 58 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CandleStickEntity = void 0;
const typeorm_1 = __webpack_require__(24);
let CandleStickEntity = class CandleStickEntity {
    id;
    timestamp;
    maxPrice;
    minPrice;
    openPrice;
    closePrice;
    volume;
    marketPair;
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({
        type: 'integer',
        name: 'id'
    }),
    __metadata("design:type", Number)
], CandleStickEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp without time zone',
        name: 'timestamp',
        precision: 3,
        nullable: false,
        default: 'now()'
    }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], CandleStickEntity.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'maxPrice',
        length: '300',
        nullable: false,
        default: '0'
    }),
    __metadata("design:type", String)
], CandleStickEntity.prototype, "maxPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'minPrice',
        length: '300',
        nullable: false,
        default: '0'
    }),
    __metadata("design:type", String)
], CandleStickEntity.prototype, "minPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'openPrice',
        length: '300',
        nullable: false,
        default: '0'
    }),
    __metadata("design:type", String)
], CandleStickEntity.prototype, "openPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'closePrice',
        length: '300',
        nullable: false,
        default: '0'
    }),
    __metadata("design:type", String)
], CandleStickEntity.prototype, "closePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'volume',
        length: '300',
        nullable: false,
        default: '0'
    }),
    __metadata("design:type", String)
], CandleStickEntity.prototype, "volume", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'marketPair',
        length: '300',
        nullable: false,
        default: `'ETH/USDC'`
    }),
    __metadata("design:type", String)
], CandleStickEntity.prototype, "marketPair", void 0);
CandleStickEntity = __decorate([
    (0, typeorm_1.Entity)('CandleStick', { schema: 'public' })
], CandleStickEntity);
exports.CandleStickEntity = CandleStickEntity;


/***/ }),
/* 59 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AvailableViewEntity = void 0;
const typeorm_1 = __webpack_require__(24);
let AvailableViewEntity = class AvailableViewEntity {
    accountId;
    tokenId;
    availableAmt;
    lockedAmt;
};
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        name: 'accountId',
        type: 'decimal',
        precision: 86,
        scale: 0
    }),
    __metadata("design:type", String)
], AvailableViewEntity.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        name: 'tokenId',
        type: 'decimal',
        precision: 86,
        scale: 0
    }),
    __metadata("design:type", String)
], AvailableViewEntity.prototype, "tokenId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'availableAmt',
        type: 'decimal',
        precision: 86,
        scale: 0,
        default: 0n
    }),
    __metadata("design:type", BigInt)
], AvailableViewEntity.prototype, "availableAmt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'lockedAmt',
        type: 'decimal',
        precision: 86,
        scale: 0,
        default: 0n
    }),
    __metadata("design:type", BigInt)
], AvailableViewEntity.prototype, "lockedAmt", void 0);
AvailableViewEntity = __decorate([
    (0, typeorm_1.ViewEntity)('AvailableView', {
        schema: 'public',
        expression: `
SELECT 
  "tokenleaf"."accountId",
  "pendingOrder"."tokenId",
  ("tokenleaf"."lockedAmt" +  "pendingOrder"."sellAmt") AS "lockedAmt",
  ("tokenleaf"."availableAmt" - "pendingOrder"."sellAmt") AS "availableAmt"
FROM (SELECT 
  "accountId",
  SUM(ti.amount) AS "sellAmt",
  "tokenId"
FROM "TransactionInfo" ti 
WHERE ti."txStatus" = 'PENDING'
GROUP BY ti."accountId", ti."tokenId"
) AS "pendingOrder"
JOIN "TokenLeafNode" "tokenleaf"
ON "tokenleaf"."accountId" = "pendingOrder"."accountId" AND "tokenleaf"."leafId" = "pendingOrder"."tokenId"; 
  `
    })
], AvailableViewEntity);
exports.AvailableViewEntity = AvailableViewEntity;


/***/ }),
/* 60 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RollupModule = void 0;
const common_1 = __webpack_require__(7);
const typeorm_1 = __webpack_require__(21);
const rollupInformation_entity_1 = __webpack_require__(61);
let RollupModule = class RollupModule {
};
RollupModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([rollupInformation_entity_1.RollupInformation])],
        exports: [typeorm_1.TypeOrmModule]
    })
], RollupModule);
exports.RollupModule = RollupModule;


/***/ }),
/* 61 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RollupInformation = void 0;
const lodash_1 = __webpack_require__(62);
const helper_1 = __webpack_require__(8);
const typeorm_1 = __webpack_require__(24);
let RollupInformation = class RollupInformation {
    id;
    lastSyncBlocknumberForRegisterEvent;
    lastSyncBlocknumberForDepositEvent;
    createdAt;
    updatedAt;
    deletedAt;
    updatedBy;
    deletedBy;
    setUpdatedBy() {
        this.updatedBy = (0, helper_1.getProcessName)();
    }
    setDeletedBy() {
        this.deletedBy = (0, helper_1.getProcessName)();
    }
};
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'integer',
        name: 'id',
        primary: true,
        nullable: false,
        generated: 'increment'
    }),
    __metadata("design:type", Number)
], RollupInformation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'integer',
        name: 'lastSyncBlocknumberForRegisterEvent',
        nullable: false,
    }),
    __metadata("design:type", Number)
], RollupInformation.prototype, "lastSyncBlocknumberForRegisterEvent", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'integer',
        name: 'lastSyncBlocknumberForDepositEvent',
        nullable: false,
    }),
    __metadata("design:type", Number)
], RollupInformation.prototype, "lastSyncBlocknumberForDepositEvent", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: 'timestamp without time zone',
        name: 'createdAt',
        nullable: false,
        default: 'now()',
    }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], RollupInformation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: 'timestamp without time zone',
        name: 'updatedAt',
        nullable: false,
        default: (0, lodash_1.now)()
    }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], RollupInformation.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({
        type: 'timestamp without time zone',
        name: 'deletedAt',
        nullable: true
    }),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], RollupInformation.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'updatedBy',
        length: 256,
        nullable: false,
    }),
    __metadata("design:type", Object)
], RollupInformation.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'deletedBy',
        length: 256,
        nullable: true,
    }),
    __metadata("design:type", Object)
], RollupInformation.prototype, "deletedBy", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RollupInformation.prototype, "setUpdatedBy", null);
__decorate([
    (0, typeorm_1.BeforeRemove)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RollupInformation.prototype, "setDeletedBy", null);
RollupInformation = __decorate([
    (0, typeorm_1.Entity)('RollupInformation', { schema: 'public' })
], RollupInformation);
exports.RollupInformation = RollupInformation;


/***/ }),
/* 62 */
/***/ ((module) => {

module.exports = require("lodash");;

/***/ }),
/* 63 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OperatorProducer = void 0;
const pinoLogger_service_1 = __webpack_require__(6);
const common_1 = __webpack_require__(7);
const config_1 = __webpack_require__(11);
const typeorm_1 = __webpack_require__(21);
const transactionInfo_entity_1 = __webpack_require__(38);
const nestjs_ethers_1 = __webpack_require__(10);
const typeorm_2 = __webpack_require__(24);
const ABI = __webpack_require__(12);
const rollupInformation_entity_1 = __webpack_require__(61);
const worker_service_1 = __webpack_require__(64);
const firstValueFrom_1 = __webpack_require__(68);
const accountInformation_entity_1 = __webpack_require__(31);
let OperatorProducer = class OperatorProducer {
    config;
    logger;
    ethersSigner;
    ethersContract;
    txRepository;
    rollupInfoRepository;
    accountRepository;
    connection;
    workerService;
    wallet;
    contract;
    constructor(config, logger, ethersSigner, ethersContract, txRepository, rollupInfoRepository, accountRepository, connection, workerService) {
        this.config = config;
        this.logger = logger;
        this.ethersSigner = ethersSigner;
        this.ethersContract = ethersContract;
        this.txRepository = txRepository;
        this.rollupInfoRepository = rollupInfoRepository;
        this.accountRepository = accountRepository;
        this.connection = connection;
        this.workerService = workerService;
        this.wallet = this.ethersSigner.createWallet(this.config.get('ETHEREUM_OPERATOR_PRIV', ''));
        this.contract = this.ethersContract.create(this.config.get('ETHEREUM_ROLLUP_CONTRACT_ADDR', ''), ABI, this.wallet);
        this.logger.log({
            address: this.wallet.address,
            contract: this.contract.address,
        });
        this.listenRegisterEvent();
    }
    async listenRegisterEvent() {
        await (0, firstValueFrom_1.firstValueFrom)(this.workerService.onReadyObserver);
        this.logger.log(`OperatorProducer.listenRegisterEvent contract=${this.contract.address}`);
        const filters = this.contract.filters.Register();
        const handler = (log) => {
            console.log({
                log
            });
        };
        this.contract.on(filters, handler.bind(this));
    }
    async handleRegisterEvent(sender, accountId, tsPubX, tsPubY, tsAddr, tx) {
        const rollupInfo = await this.rollupInfoRepository.findOneOrFail({ where: { id: 1 } });
        const { blockNumber = 0 } = tx;
        if (blockNumber <= rollupInfo.lastSyncBlocknumberForRegisterEvent) {
            this.logger.log(`OperatorProducer.listenRegisterEvent skip blockNumber=${blockNumber} lastSyncBlocknumberForRegisterEvent=${rollupInfo.lastSyncBlocknumberForRegisterEvent}`);
            return;
        }
        await this.connection.transaction(async (manager) => {
            return await Promise.all([
                this.accountRepository.upsert({
                    L1Address: sender,
                    accountId: accountId.toString(),
                    tsPubKeyX: tsPubX.toString(),
                    tsPubKeyY: tsPubY.toString(),
                }, ['L1Address']),
                this.txRepository.insert({
                    accountId: 0n,
                    tokenId: 0n,
                    amount: 0n,
                    arg0: BigInt(accountId.toString()),
                    arg1: BigInt(tsAddr.toString()),
                }),
                this.rollupInfoRepository.update({ id: 1 }, { lastSyncBlocknumberForRegisterEvent: blockNumber }),
            ]);
        });
        this.logger.log(`OperatorProducer.listenRegisterEvent ${sender} ${accountId} ${tsPubX} ${tsPubY} ${tsAddr}`);
    }
    async listenDepositEvent() {
        await (0, firstValueFrom_1.firstValueFrom)(this.workerService.onReadyObserver);
        this.logger.log(`OperatorProducer.listenDepositEvent contract=${this.contract.address}`);
        const filters = this.contract.filters.Deposit();
        const handler = (log) => {
            this.handleDepositEvent(log.args.sender, log.args.accountId, log.args.tokenId, log.args.amount, log.transactionHash);
        };
        this.contract.on(filters, handler.bind(this));
    }
    async handleDepositEvent(sender, accountId, tokenId, amount, tx) {
        const rollupInfo = await this.rollupInfoRepository.findOneOrFail({ where: { id: 1 } });
        const { blockNumber = 0 } = tx;
        if (blockNumber <= rollupInfo.lastSyncBlocknumberForDepositEvent) {
            this.logger.log(`OperatorProducer.listenDepositEvent skip blockNumber=${blockNumber} lastSyncBlocknumberForDepositEvent=${rollupInfo.lastSyncBlocknumberForDepositEvent}`);
            return;
        }
        this.txRepository.insert({
            tokenId: BigInt(tokenId.toString()),
            amount: BigInt(amount.toString()),
            arg0: BigInt(accountId.toString()),
        });
        this.logger.log(`OperatorProducer.listenRegisterEvent ${sender} ${accountId} ${tokenId} ${amount}`);
    }
};
OperatorProducer = __decorate([
    (0, common_1.Injectable)({
        scope: common_1.Scope.DEFAULT,
    }),
    __param(2, (0, nestjs_ethers_1.InjectSignerProvider)()),
    __param(3, (0, nestjs_ethers_1.InjectContractProvider)()),
    __param(4, (0, typeorm_1.InjectRepository)(transactionInfo_entity_1.TransactionInfo)),
    __param(5, (0, typeorm_1.InjectRepository)(rollupInformation_entity_1.RollupInformation)),
    __param(6, (0, typeorm_1.InjectRepository)(accountInformation_entity_1.AccountInformation)),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof pinoLogger_service_1.PinoLoggerService !== "undefined" && pinoLogger_service_1.PinoLoggerService) === "function" ? _b : Object, typeof (_c = typeof nestjs_ethers_1.EthersSigner !== "undefined" && nestjs_ethers_1.EthersSigner) === "function" ? _c : Object, typeof (_d = typeof nestjs_ethers_1.EthersContract !== "undefined" && nestjs_ethers_1.EthersContract) === "function" ? _d : Object, typeof (_e = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _e : Object, typeof (_f = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _f : Object, typeof (_g = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _g : Object, typeof (_h = typeof typeorm_2.Connection !== "undefined" && typeorm_2.Connection) === "function" ? _h : Object, typeof (_j = typeof worker_service_1.WorkerService !== "undefined" && worker_service_1.WorkerService) === "function" ? _j : Object])
], OperatorProducer);
exports.OperatorProducer = OperatorProducer;


/***/ }),
/* 64 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WorkerService = void 0;
const _cluster = __webpack_require__(1);
const rxjs_1 = __webpack_require__(65);
const pinoLogger_service_1 = __webpack_require__(6);
const cluster_1 = __webpack_require__(66);
const common_1 = __webpack_require__(7);
const constant_1 = __webpack_require__(5);
const helper_1 = __webpack_require__(8);
const cluster = _cluster;
let WorkerService = class WorkerService {
    logger;
    isListening = false;
    workerName;
    workerReadySubject = new rxjs_1.ReplaySubject(1);
    onReadyObserver = this.workerReadySubject.asObservable();
    constructor(logger) {
        this.logger = logger;
        this.workerName = (0, helper_1.getWorkerName)();
        if (!cluster.isPrimary) {
            this.startListen();
        }
    }
    onReceivedMessage(payload) {
        this.logger.log({
            msg: 'ON MESSAGE', workerName: this.workerName, payload
        });
        switch (payload.type) {
            case cluster_1.ClusterMessageType.READY:
                this.workerReadySubject.next(true);
                this.workerReadySubject.complete();
                break;
        }
    }
    startListen() {
        if (this.isListening) {
            throw new Error('WorkerService is already listening');
        }
        this.logger.debug('ON LISTEN', this.workerName);
        process.on('message', (payload) => {
            if (payload.to === this.workerName) {
                this.onReceivedMessage(payload);
            }
            else {
                throw new Error(`message send to wrong Worker to=${payload.to}, current=${this.workerName}`);
            }
        });
    }
    sendMessage(payload) {
        if (process?.send) {
            process.send({
                from: this.workerName,
                ...payload,
            });
            return;
        }
        throw new Error('process.send is not defined');
    }
    ready() {
        this.sendMessage({
            to: constant_1.TsWorkerName.CORE,
            type: cluster_1.ClusterMessageType.READY,
        });
    }
    stop() {
        this.sendMessage({
            to: constant_1.TsWorkerName.CORE,
            type: cluster_1.ClusterMessageType.STOP,
        });
    }
};
WorkerService = __decorate([
    (0, common_1.Injectable)({
        scope: common_1.Scope.DEFAULT,
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof pinoLogger_service_1.PinoLoggerService !== "undefined" && pinoLogger_service_1.PinoLoggerService) === "function" ? _a : Object])
], WorkerService);
exports.WorkerService = WorkerService;


/***/ }),
/* 65 */
/***/ ((module) => {

module.exports = require("rxjs");;

/***/ }),
/* 66 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClusterMessageEventPayload = exports.ClusterMessageType = void 0;
const constant_1 = __webpack_require__(5);
const runtypes_1 = __webpack_require__(67);
const TsWorkerNameBrand = runtypes_1.String.withConstraint((s) => Object.values(constant_1.TsWorkerName).includes(s));
var ClusterMessageType;
(function (ClusterMessageType) {
    ClusterMessageType[ClusterMessageType["UNKNOWN"] = 0] = "UNKNOWN";
    ClusterMessageType[ClusterMessageType["START"] = 1] = "START";
    ClusterMessageType[ClusterMessageType["READY"] = 2] = "READY";
    ClusterMessageType[ClusterMessageType["ALL_READY"] = 3] = "ALL_READY";
    ClusterMessageType[ClusterMessageType["STOP"] = 4] = "STOP";
    ClusterMessageType[ClusterMessageType["MESSAGE"] = 5] = "MESSAGE";
})(ClusterMessageType = exports.ClusterMessageType || (exports.ClusterMessageType = {}));
exports.ClusterMessageEventPayload = (0, runtypes_1.Record)({
    from: TsWorkerNameBrand,
    to: TsWorkerNameBrand,
});


/***/ }),
/* 67 */
/***/ ((module) => {

module.exports = require("runtypes");;

/***/ }),
/* 68 */
/***/ ((module) => {

module.exports = require("rxjs/internal/firstValueFrom");;

/***/ }),
/* 69 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WorkerModule = exports.MainProcessModule = void 0;
const logger_module_1 = __webpack_require__(15);
const common_1 = __webpack_require__(7);
const config_1 = __webpack_require__(11);
const main_process_service_1 = __webpack_require__(70);
const worker_service_1 = __webpack_require__(64);
let MainProcessModule = class MainProcessModule {
};
MainProcessModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            logger_module_1.LoggerModule,
        ],
        providers: [
            main_process_service_1.MainProcessService,
        ],
        exports: [main_process_service_1.MainProcessService]
    })
], MainProcessModule);
exports.MainProcessModule = MainProcessModule;
let WorkerModule = class WorkerModule {
};
WorkerModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            logger_module_1.LoggerModule,
        ],
        providers: [
            worker_service_1.WorkerService,
        ],
        exports: [worker_service_1.WorkerService]
    })
], WorkerModule);
exports.WorkerModule = WorkerModule;


/***/ }),
/* 70 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MainProcessService = void 0;
const _cluster = __webpack_require__(1);
const cluster = _cluster;
const cluster_1 = __webpack_require__(66);
const pinoLogger_service_1 = __webpack_require__(6);
const common_1 = __webpack_require__(7);
const constant_1 = __webpack_require__(5);
const helper_1 = __webpack_require__(8);
const rxjs_1 = __webpack_require__(65);
let MainProcessService = class MainProcessService {
    logger;
    workerMap = {};
    selfWorkerName;
    workerReadySubject = new rxjs_1.ReplaySubject(1);
    isReady = this.workerReadySubject.asObservable();
    constructor(logger) {
        this.logger = logger;
        this.selfWorkerName = (0, helper_1.getWorkerName)();
        this.workerReadySubject.next(false);
        this.logger.setContext('MainProcessService');
        this.handleAllWorkerReady();
    }
    handleAllWorkerReady() {
        this.isReady.pipe((0, rxjs_1.filter)((isReady) => isReady), (0, rxjs_1.first)(), (0, rxjs_1.delay)(1000 * 3)).subscribe(() => {
            Object.values(this.workerMap).forEach((item) => {
                this.sendMessage({
                    from: this.selfWorkerName,
                    to: item.name,
                    type: cluster_1.ClusterMessageType.READY,
                });
            });
        });
    }
    onReceivedMessage(payload) {
        this.logger.log({ name: this.selfWorkerName, type: 'message', payload });
        switch (payload.type) {
            case cluster_1.ClusterMessageType.READY:
                this.getWorker(payload.from).isReady = true;
                const isAllReady = Object.values(this.workerMap).every((item) => item.isReady);
                this.workerReadySubject.next(isAllReady);
                break;
            default:
                break;
        }
    }
    setWorker(name, workerItem) {
        if (!cluster.isPrimary) {
            throw new Error('setWorker() should only be called in primary process');
        }
        this.workerMap[name] = workerItem;
    }
    getWorker(name) {
        const worker = this.workerMap[name];
        if (!worker) {
            throw new Error(`worker ${name} is not found`);
        }
        return worker;
    }
    sendMessage(payload) {
        this.logger.log({ type: 'sendMessage', payload });
        if (payload.to === this.selfWorkerName) {
            this.onReceivedMessage(payload);
            return;
        }
        if (!this.workerMap[payload.to]) {
            this.logger.error(`Worker ${payload.to} not found`);
            throw new Error(`Worker ${payload.to} not found`);
        }
        this.workerMap[payload.to].worker?.send(payload);
    }
    clusterize(workers) {
        if (!cluster.isPrimary) {
            throw new Error('clusterize() should only be called in primary process');
        }
        for (let index = 0; index < workers.length; index++) {
            const item = workers[index];
            this.logger.log(`${constant_1.TsWorkerName.CORE}: fork cluster ${item.name}`);
            const worker = cluster.fork({
                TS_WORKER_NAME: item.name,
            });
            this.setWorker(item.name, {
                ...item,
                worker,
            });
            worker.once('online', () => {
                this.logger.log(`Worker ${item.name}-${worker.process.pid} online!`);
            });
            worker.once('exit', () => {
                this.logger.error(`Worker ${item.name}-${worker.process.pid} died.`);
            });
            worker.on('message', this.sendMessage.bind(this));
        }
    }
};
MainProcessService = __decorate([
    (0, common_1.Injectable)({
        scope: common_1.Scope.DEFAULT,
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof pinoLogger_service_1.PinoLoggerService !== "undefined" && pinoLogger_service_1.PinoLoggerService) === "function" ? _a : Object])
], MainProcessService);
exports.MainProcessService = MainProcessService;


/***/ }),
/* 71 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.setupApp = void 0;
const pinoLogger_service_1 = __webpack_require__(6);
const config_1 = __webpack_require__(11);
const core_1 = __webpack_require__(72);
const helper_1 = __webpack_require__(8);
async function setupApp(module) {
    const app = await core_1.NestFactory.createApplicationContext(module);
    const configService = app.get(config_1.ConfigService);
    const workerName = (0, helper_1.getWorkerName)();
    const logger = app.get(pinoLogger_service_1.PinoLoggerService);
    logger.setContext((0, helper_1.getProcessName)());
    app.useLogger(logger);
    logger.log(`${(0, helper_1.getProcessName)()}: server started!`);
    return app;
}
exports.setupApp = setupApp;


/***/ }),
/* 72 */
/***/ ((module) => {

module.exports = require("@nestjs/core");;

/***/ }),
/* 73 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const pinoLogger_service_1 = __webpack_require__(6);
const logger_module_1 = __webpack_require__(15);
const common_1 = __webpack_require__(7);
const cqrs_1 = __webpack_require__(74);
const config_1 = __webpack_require__(11);
const constant_1 = __webpack_require__(5);
const schedule_1 = __webpack_require__(75);
const producer_service_1 = __webpack_require__(76);
const BullQueue_module_1 = __webpack_require__(19);
const tstypeorm_module_1 = __webpack_require__(20);
const typeorm_1 = __webpack_require__(21);
const blockInformation_entity_1 = __webpack_require__(41);
const nest_bullmq_1 = __webpack_require__(13);
const db_pubsub_module_1 = __webpack_require__(79);
const transactionInfo_entity_1 = __webpack_require__(38);
const cluster_module_1 = __webpack_require__(69);
let AppModule = class AppModule {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    onModuleInit() {
        this.logger.setContext(constant_1.TsWorkerName.CORE);
    }
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot(),
            cqrs_1.CqrsModule,
            logger_module_1.LoggerModule,
            schedule_1.ScheduleModule.forRoot(),
            BullQueue_module_1.BullQueueModule,
            tstypeorm_module_1.TsTypeOrmModule,
            typeorm_1.TypeOrmModule.forFeature([
                transactionInfo_entity_1.TransactionInfo,
                blockInformation_entity_1.BlockInformation,
            ]),
            nest_bullmq_1.BullModule.registerQueue({
                queueName: constant_1.TsWorkerName.SEQUENCER,
            }, {
                queueName: constant_1.TsWorkerName.PROVER,
            }, {
                queueName: constant_1.TsWorkerName.OPERATOR,
            }),
            db_pubsub_module_1.DatabasePubSubModule,
            cluster_module_1.MainProcessModule,
        ],
        controllers: [],
        providers: [
            producer_service_1.ProducerService,
        ]
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof pinoLogger_service_1.PinoLoggerService !== "undefined" && pinoLogger_service_1.PinoLoggerService) === "function" ? _a : Object])
], AppModule);
exports.AppModule = AppModule;


/***/ }),
/* 74 */
/***/ ((module) => {

module.exports = require("@nestjs/cqrs");;

/***/ }),
/* 75 */
/***/ ((module) => {

module.exports = require("@nestjs/schedule");;

/***/ }),
/* 76 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProducerService = void 0;
const nest_bullmq_1 = __webpack_require__(13);
const pubSub_constants_1 = __webpack_require__(77);
const messageBroker_1 = __webpack_require__(78);
const pinoLogger_service_1 = __webpack_require__(6);
const common_1 = __webpack_require__(7);
const typeorm_1 = __webpack_require__(21);
const blockInformation_entity_1 = __webpack_require__(41);
const transactionInfo_entity_1 = __webpack_require__(38);
const tsStatus_enum_1 = __webpack_require__(43);
const typeorm_2 = __webpack_require__(24);
const bullmq_1 = __webpack_require__(14);
const constant_1 = __webpack_require__(5);
const blockStatus_enum_1 = __webpack_require__(42);
let ProducerService = class ProducerService {
    logger;
    txRepository;
    blockRepository;
    seqQueue;
    operatorQueue;
    proverQueue;
    messageBrokerService;
    currentPendingTxId = 0;
    currentPendingBlock = 0;
    currentProvedBlock = 0;
    constructor(logger, txRepository, blockRepository, seqQueue, operatorQueue, proverQueue, messageBrokerService) {
        this.logger = logger;
        this.txRepository = txRepository;
        this.blockRepository = blockRepository;
        this.seqQueue = seqQueue;
        this.operatorQueue = operatorQueue;
        this.proverQueue = proverQueue;
        this.messageBrokerService = messageBrokerService;
        logger.log('DispatchService');
        this.subscribe();
    }
    subscribe() {
        this.messageBrokerService.subscribe(pubSub_constants_1.CHANNEL.ORDER_CREATED, this.dispatchPendingTransaction.bind(this));
        this.messageBrokerService.subscribe(pubSub_constants_1.CHANNEL.ORDER_PROCCESSD, this.dispatchPeningBlock.bind(this));
        this.messageBrokerService.subscribe(pubSub_constants_1.CHANNEL.ORDER_VERIFIED, this.dispatchProvedBlock.bind(this));
    }
    unsubscribe() {
        this.messageBrokerService.close();
    }
    prevJobId;
    async dispatchPendingTransaction() {
        this.logger.log('dispatchPendingTransaction');
        const transactions = await this.txRepository.find({
            where: {
                txId: (0, typeorm_2.MoreThan)(this.currentPendingTxId),
                txStatus: tsStatus_enum_1.TS_STATUS.PENDING,
            },
            order: {
                txId: 'asc',
            }
        });
        if (transactions.length) {
            this.logger.log(`dispatchPendingTransaction add ${transactions.length} blocks`);
            this.currentPendingTxId = transactions[transactions.length - 1].txId;
            for (let index = 0; index < transactions.length; index++) {
                const tx = transactions[index];
                const jobId = `${constant_1.TsWorkerName.SEQUENCER}-${tx.txId}`;
                console.log({
                    jobId,
                    prevJobId: this.prevJobId,
                });
                try {
                    const job = await this.seqQueue.add(tx.txId.toString(), tx, {
                        jobId,
                    });
                    this.prevJobId = this.seqQueue.toKey(job.id?.toString() || '');
                    this.logger.log(`JOB: ${job.id}`);
                }
                catch (error) {
                    console.error(error);
                }
            }
        }
    }
    async dispatchPeningBlock() {
        this.logger.log('dispatchPeningBlock');
        const blocks = await this.blockRepository.find({
            where: {
                blockNumber: (0, typeorm_2.MoreThan)(this.currentPendingBlock),
                blockStatus: blockStatus_enum_1.BLOCK_STATUS.PROCESSING,
            },
            order: {
                blockNumber: 'asc',
            }
        });
        if (blocks.length) {
            this.logger.log(`dispatchPeningBlock add ${blocks.length} blocks`);
            this.currentPendingBlock = blocks[blocks.length - 1].blockNumber;
            for (let index = 0; index < blocks.length; index++) {
                const block = blocks[index];
                this.proverQueue.add(block.blockNumber.toString(), block);
            }
        }
    }
    async dispatchProvedBlock() {
        this.logger.log('dispatchProvedBlock');
        const blocks = await this.blockRepository.find({
            where: {
                blockNumber: (0, typeorm_2.MoreThan)(this.currentProvedBlock),
                blockStatus: blockStatus_enum_1.BLOCK_STATUS.L2CONFIRMED,
            },
            order: {
                blockNumber: 'asc',
            }
        });
        if (blocks.length) {
            this.logger.log(`dispatchProvedBlock add ${blocks.length} blocks`);
            this.currentProvedBlock = blocks[blocks.length - 1].blockNumber;
            for (let index = 0; index < blocks.length; index++) {
                const block = blocks[index];
                this.operatorQueue.add(block.blockNumber.toString(), block);
            }
        }
    }
};
ProducerService = __decorate([
    (0, common_1.Injectable)({
        scope: common_1.Scope.DEFAULT,
    }),
    __param(1, (0, typeorm_1.InjectRepository)(transactionInfo_entity_1.TransactionInfo)),
    __param(2, (0, typeorm_1.InjectRepository)(blockInformation_entity_1.BlockInformation)),
    __param(3, (0, nest_bullmq_1.BullQueueInject)(constant_1.TsWorkerName.SEQUENCER)),
    __param(4, (0, nest_bullmq_1.BullQueueInject)(constant_1.TsWorkerName.OPERATOR)),
    __param(5, (0, nest_bullmq_1.BullQueueInject)(constant_1.TsWorkerName.PROVER)),
    __metadata("design:paramtypes", [typeof (_a = typeof pinoLogger_service_1.PinoLoggerService !== "undefined" && pinoLogger_service_1.PinoLoggerService) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object, typeof (_d = typeof bullmq_1.Queue !== "undefined" && bullmq_1.Queue) === "function" ? _d : Object, typeof (_e = typeof bullmq_1.Queue !== "undefined" && bullmq_1.Queue) === "function" ? _e : Object, typeof (_f = typeof bullmq_1.Queue !== "undefined" && bullmq_1.Queue) === "function" ? _f : Object, typeof (_g = typeof messageBroker_1.MessageBroker !== "undefined" && messageBroker_1.MessageBroker) === "function" ? _g : Object])
], ProducerService);
exports.ProducerService = ProducerService;


/***/ }),
/* 77 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CHANNELS = exports.CHANNEL = void 0;
var CHANNEL;
(function (CHANNEL) {
    CHANNEL["ORDER_CREATED"] = "ORDER_CREATED";
    CHANNEL["ORDER_VERIFIED"] = "ORDER_VERIFIED";
    CHANNEL["ORDER_PROCCESSD"] = "ORDER_PROCCESSD";
})(CHANNEL = exports.CHANNEL || (exports.CHANNEL = {}));
exports.CHANNELS = [
    CHANNEL.ORDER_CREATED,
    CHANNEL.ORDER_VERIFIED,
    CHANNEL.ORDER_PROCCESSD
];


/***/ }),
/* 78 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MessageBroker = void 0;
const common_1 = __webpack_require__(7);
let MessageBroker = class MessageBroker {
    connect;
    addChannels;
    removeChannel;
    publish;
    subscribe;
    close;
};
MessageBroker = __decorate([
    (0, common_1.Injectable)()
], MessageBroker);
exports.MessageBroker = MessageBroker;


/***/ }),
/* 79 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabasePubSubModule = void 0;
const pinoLogger_service_1 = __webpack_require__(6);
const logger_module_1 = __webpack_require__(15);
const common_1 = __webpack_require__(7);
const config_1 = __webpack_require__(11);
const messageBroker_service_1 = __webpack_require__(80);
const messageBroker_1 = __webpack_require__(78);
let DatabasePubSubModule = class DatabasePubSubModule {
};
DatabasePubSubModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, logger_module_1.LoggerModule],
        providers: [config_1.ConfigService, pinoLogger_service_1.PinoLoggerService, {
                provide: messageBroker_1.MessageBroker,
                useClass: messageBroker_service_1.MessageBrokerService
            }],
        exports: [messageBroker_1.MessageBroker]
    })
], DatabasePubSubModule);
exports.DatabasePubSubModule = DatabasePubSubModule;


/***/ }),
/* 80 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MessageBrokerService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MessageBrokerService = void 0;
const common_1 = __webpack_require__(7);
const config_1 = __webpack_require__(11);
const pg_pubsub_1 = __webpack_require__(81);
const pinoLogger_service_1 = __webpack_require__(6);
let MessageBrokerService = MessageBrokerService_1 = class MessageBrokerService {
    configService;
    logger;
    DATABASE_URL;
    pubSubInstance;
    constructor(configService, logger) {
        this.configService = configService;
        this.logger = logger;
        this.logger.setContext(MessageBrokerService_1.name);
        this.DATABASE_URL = this.configService.get('DATABASE_URL', '');
        this.pubSubInstance = new pg_pubsub_1.PgPubSub({
            connectionString: this.DATABASE_URL,
            singleListener: false
        });
        this.connect();
    }
    async connect() {
        this.pubSubInstance.connect()
            .catch(err => {
            this.logger.error(err);
        });
    }
    async addChannels(channelNames) {
        this.logger.log(channelNames);
        await Promise.all(channelNames.map(channelName => () => this.pubSubInstance.listen(channelName)));
    }
    async subscribe(channelName, eventListener) {
        this.logger.log(`addChannelListener: ${channelName}`);
        console.log('subscribe', channelName);
        await this.pubSubInstance.channels.on(channelName, eventListener);
    }
    async removeChannel(channelName) {
        this.logger.log(`removeChannel: ${channelName}`);
        await this.pubSubInstance.unlisten(channelName);
    }
    async publish(channelName, data) {
        console.log({ name: 'publish', channelName, data });
        this.logger.log({ name: 'publish', channelName, data });
        await this.pubSubInstance.channels.emit(channelName, data);
    }
    async close() {
        this.logger.log('close');
        await this.pubSubInstance.close();
    }
};
MessageBrokerService = MessageBrokerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof pinoLogger_service_1.PinoLoggerService !== "undefined" && pinoLogger_service_1.PinoLoggerService) === "function" ? _b : Object])
], MessageBrokerService);
exports.MessageBrokerService = MessageBrokerService;


/***/ }),
/* 81 */
/***/ ((module) => {

module.exports = require("@imqueue/pg-pubsub");;

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
const _cluster = __webpack_require__(1);
const cluster = _cluster;
const main_1 = __webpack_require__(2);
const constant_1 = __webpack_require__(5);
const app_module_1 = __webpack_require__(73);
const core_1 = __webpack_require__(72);
const pinoLogger_service_1 = __webpack_require__(6);
const helper_1 = __webpack_require__(8);
const main_process_service_1 = __webpack_require__(70);
clusterize([
    {
        name: constant_1.TsWorkerName.OPERATOR,
        bootstrap: main_1.bootstrap,
    },
]);
async function clusterize(workers) {
    if (cluster.isPrimary) {
        await setupMasterApp(app_module_1.AppModule, workers);
    }
    else {
        const workerName = (0, helper_1.getWorkerName)();
        const worker = workers.find((item) => item.name === workerName);
        if (worker) {
            await worker.bootstrap();
        }
        else {
            throw new Error(`Worker ${workerName} not found`);
        }
    }
}
async function setupMasterApp(module, workers) {
    const app = await core_1.NestFactory.createApplicationContext(module);
    const logger = app.get(pinoLogger_service_1.PinoLoggerService);
    logger.setContext((0, helper_1.getWorkerName)());
    const clusterService = app.get(main_process_service_1.MainProcessService);
    clusterService.clusterize(workers);
    logger.setContext((0, helper_1.getProcessName)());
    logger.log(`${constant_1.TsWorkerName.CORE}: server started!`);
    return app;
}

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlL2V4dGVybmFsIFwiY2x1c3RlclwiIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi90cy1vcGVyYXRvci9zcmMvbWFpbi50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vdHMtb3BlcmF0b3Ivc3JjL3RzLW9wZXJhdG9yLm1vZHVsZS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vdHMtb3BlcmF0b3Ivc3JjL2luZnJhc3RydWN0dXJlL29wZXJhdG9yLnByb2Nlc3Nvci50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vdHMtc2RrL3NyYy9jb25zdGFudC50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL2xvZ2dlci9zcmMvYWRhcHRlcnMvcmVhbC9waW5vTG9nZ2VyLnNlcnZpY2UudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS9leHRlcm5hbCBcIkBuZXN0anMvY29tbW9uXCIiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL3RzLXNkay9zcmMvaGVscGVyLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvZXh0ZXJuYWwgXCJuZXN0anMtcGlub1wiIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvZXh0ZXJuYWwgXCJuZXN0anMtZXRoZXJzXCIiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS9leHRlcm5hbCBcIkBuZXN0anMvY29uZmlnXCIiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS9leHRlcm5hbCBcIkBhbmNoYW44MjgvbmVzdC1idWxsbXFcIiIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlL2V4dGVybmFsIFwiYnVsbG1xXCIiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi9sb2dnZXIvc3JjL2xvZ2dlci5tb2R1bGUudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS9leHRlcm5hbCBcInBpbm9cIiIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlL2V4dGVybmFsIFwidXVpZFwiIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vbG9nZ2VyL3NyYy9hZGFwdGVycy9mYWtlL0Zha2VMb2dnZXIuc2VydmljZS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL2J1bGwtcXVldWUvc3JjL0J1bGxRdWV1ZS5tb2R1bGUudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy90c3R5cGVvcm0ubW9kdWxlLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvZXh0ZXJuYWwgXCJAbmVzdGpzL3R5cGVvcm1cIiIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL3RzLXR5cGVvcm0vc3JjL2FjY291bnQvYWNjb3VudC5tb2R1bGUudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy9hdWN0aW9uT3JkZXIvb2JzT3JkZXJUcmVlLnNlcnZpY2UudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS9leHRlcm5hbCBcInR5cGVvcm1cIiIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL3RzLXR5cGVvcm0vc3JjL2NvbW1vbi90cy1oZWxwZXIudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy9jb21tb24vcG9zZWlkZW4taGFzaC1kcC50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlL2V4dGVybmFsIFwiQGJpZy13aGFsZS1sYWJzL3Bvc2VpZG9uXCIiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy9jb21tb24vdHNNZXJrbGVUcmVlLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvYXVjdGlvbk9yZGVyL29ic09yZGVyTGVhZi5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy9hdWN0aW9uT3JkZXIvb2JzT3JkZXIuZW50aXR5LnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvYWNjb3VudC9hY2NvdW50SW5mb3JtYXRpb24uZW50aXR5LnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvY29tbW9uL2Jhc2VUaW1lRW50aXR5LnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvYWNjb3VudC9hY2NvdW50TWVya2xlVHJlZU5vZGUuZW50aXR5LnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvYWNjb3VudC9hY2NvdW50TGVhZk5vZGUuZW50aXR5LnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvYWNjb3VudC90b2tlbk1lcmtsZVRyZWVOb2RlLmVudGl0eS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL3RzLXR5cGVvcm0vc3JjL2FjY291bnQvdG9rZW5MZWFmTm9kZS5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy9hY2NvdW50L3JvbGUuZW51bS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL3RzLXR5cGVvcm0vc3JjL2FjY291bnQvdHJhbnNhY3Rpb25JbmZvLmVudGl0eS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL3RzLXR5cGVvcm0vc3JjL2F1Y3Rpb25PcmRlci9tYXRjaE9ic09yZGVyLmVudGl0eS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL3RzLXR5cGVvcm0vc3JjL2F1Y3Rpb25PcmRlci90c1NpZGUuZW51bS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL3RzLXR5cGVvcm0vc3JjL2FjY291bnQvYmxvY2tJbmZvcm1hdGlvbi5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy9hY2NvdW50L2Jsb2NrU3RhdHVzLmVudW0udHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy9hY2NvdW50L3RzU3RhdHVzLmVudW0udHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy9hdWN0aW9uT3JkZXIvb2JzT3JkZXJMZWFmTWVya2xlVHJlZU5vZGUuZW50aXR5LnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvYWNjb3VudC9tZXJrbGVUcmVlLmNvbnRyb2xsZXIudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy9hdWN0aW9uT3JkZXIvbWFya2V0UGFpckluZm8uc2VydmljZS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL3RzLXR5cGVvcm0vc3JjL2F1Y3Rpb25PcmRlci9tYXJrZXRQYWlySW5mby5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy9hY2NvdW50L2R0by91cGRhdGVBY2NvdW50VHJlZS5kdG8udHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS9leHRlcm5hbCBcIkBuZXN0anMvc3dhZ2dlclwiIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvYWNjb3VudC9kdG8vdXBkYXRlVG9rZW5UcmVlLmR0by50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL3RzLXR5cGVvcm0vc3JjL2FjY291bnQvdHNBY2NvdW50VHJlZS5zZXJ2aWNlLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvYWNjb3VudC90c1Rva2VuVHJlZS5zZXJ2aWNlLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvYXVjdGlvbk9yZGVyL2R0by9NYXJrZXRQYWlySW5mby5kdG8udHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy9hdWN0aW9uT3JkZXIvZHRvL3VwZGF0ZU9ic09yZGVyVHJlZS5kdG8udHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy9hdWN0aW9uT3JkZXIvYXVjdGlvbk9yZGVyLm1vZHVsZS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL3RzLXR5cGVvcm0vc3JjL2F1Y3Rpb25PcmRlci9hdWN0aW9uQm9uZFRva2VuLmVudGl0eS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vdHMtc2RrL3NyYy9kb21haW4vbGliL3RzLXR5cGVzL3RzLXR5cGVzLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvYXVjdGlvbk9yZGVyL2NhbmRsZVN0aWNrLmVudGl0eS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL3RzLXR5cGVvcm0vc3JjL2F1Y3Rpb25PcmRlci9hdmFpbGFibGVWaWV3LmVudGl0eS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL3RzLXR5cGVvcm0vc3JjL3JvbGx1cC9yb2xsdXAubW9kdWxlLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvcm9sbHVwL3JvbGx1cEluZm9ybWF0aW9uLmVudGl0eS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlL2V4dGVybmFsIFwibG9kYXNoXCIiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL3RzLW9wZXJhdG9yL3NyYy9pbmZyYXN0cnVjdHVyZS9vcGVyYXRvci5wcm9kdWNlci50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL2NsdXN0ZXIvc3JjL3dvcmtlci5zZXJ2aWNlLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvZXh0ZXJuYWwgXCJyeGpzXCIiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL3RzLXNkay9zcmMvZG9tYWluL2V2ZW50cy9jbHVzdGVyLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvZXh0ZXJuYWwgXCJydW50eXBlc1wiIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvZXh0ZXJuYWwgXCJyeGpzL2ludGVybmFsL2ZpcnN0VmFsdWVGcm9tXCIiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi9jbHVzdGVyL3NyYy9jbHVzdGVyLm1vZHVsZS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL2NsdXN0ZXIvc3JjL21haW4tcHJvY2Vzcy5zZXJ2aWNlLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi90cy1zZGsvc3JjL3NldHVwLmhlbHBlci50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlL2V4dGVybmFsIFwiQG5lc3Rqcy9jb3JlXCIiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL3RzLWNvcmUvc3JjL2FwcC5tb2R1bGUudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS9leHRlcm5hbCBcIkBuZXN0anMvY3Fyc1wiIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvZXh0ZXJuYWwgXCJAbmVzdGpzL3NjaGVkdWxlXCIiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL3RzLWNvcmUvc3JjL3Byb2R1Y2VyLnNlcnZpY2UudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi9kYi1wdWJzdWIvc3JjL2RvbWFpbnMvdmFsdWUtb2JqZWN0cy9wdWJTdWIuY29uc3RhbnRzLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vZGItcHVic3ViL3NyYy9wb3J0cy9tZXNzYWdlQnJva2VyLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vZGItcHVic3ViL3NyYy9kYi1wdWJzdWIubW9kdWxlLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vZGItcHVic3ViL3NyYy9hZGFwdGVycy9tZXNzYWdlQnJva2VyLnNlcnZpY2UudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS9leHRlcm5hbCBcIkBpbXF1ZXVlL3BnLXB1YnN1YlwiIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL3RzLWNvcmUvc3JjL21haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7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QUFZLENBQUMsSUFBSSxtQkFBbUIsQ0FBQyxDQUFDO0lBQ3BELE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQyIsImZpbGUiOiJ0cy1jb3JlL21haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJjbHVzdGVyXCIpOzsiLCJpbXBvcnQgeyBUc09wZXJhdG9yTW9kdWxlIH0gZnJvbSAnLi90cy1vcGVyYXRvci5tb2R1bGUnO1xuaW1wb3J0IHsgc2V0dXBBcHAgfSBmcm9tICdAdHMtc2RrL3NldHVwLmhlbHBlcic7XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYm9vdHN0cmFwKCkge1xuICBjb25zdCBhcHAgPSBhd2FpdCBzZXR1cEFwcChUc09wZXJhdG9yTW9kdWxlKTtcblxuICByZXR1cm4gYXBwO1xufSIsImltcG9ydCB7IE9wZXJhdG9yQ29uc3VtZXIgfSBmcm9tICcuL2luZnJhc3RydWN0dXJlL29wZXJhdG9yLnByb2Nlc3Nvcic7XG5pbXBvcnQgeyBQaW5vTG9nZ2VyU2VydmljZSB9IGZyb20gJ0Bjb21tb24vbG9nZ2VyL2FkYXB0ZXJzL3JlYWwvcGlub0xvZ2dlci5zZXJ2aWNlJztcbmltcG9ydCB7IE1vZHVsZSwgT25Nb2R1bGVJbml0IH0gZnJvbSAnQG5lc3Rqcy9jb21tb24nO1xuaW1wb3J0IHsgTG9nZ2VyTW9kdWxlIH0gZnJvbSAnQGNvbW1vbi9sb2dnZXIvbG9nZ2VyLm1vZHVsZSc7XG5pbXBvcnQgeyBDb25maWdNb2R1bGUsIENvbmZpZ1NlcnZpY2UgfSBmcm9tICdAbmVzdGpzL2NvbmZpZyc7XG5pbXBvcnQgeyBUc1dvcmtlck5hbWUgfSBmcm9tICdAdHMtc2RrL2NvbnN0YW50JztcbmltcG9ydCB7IEJ1bGxRdWV1ZU1vZHVsZSB9IGZyb20gJ2NvbW1vbi9idWxsLXF1ZXVlL3NyYy9CdWxsUXVldWUubW9kdWxlJztcbmltcG9ydCB7IEV0aGVyc01vZHVsZSwgTUFJTk5FVF9ORVRXT1JLLCBHT0VSTElfTkVUV09SSywgTmV0d29yayB9IGZyb20gJ25lc3Rqcy1ldGhlcnMnO1xuaW1wb3J0IHsgQnVsbE1vZHVsZSB9IGZyb20gJ0BhbmNoYW44MjgvbmVzdC1idWxsbXEnO1xuaW1wb3J0IHsgVHNUeXBlT3JtTW9kdWxlIH0gZnJvbSAnY29tbW9uL3RzLXR5cGVvcm0vc3JjL3RzdHlwZW9ybS5tb2R1bGUnO1xuaW1wb3J0IHsgT3BlcmF0b3JQcm9kdWNlciB9IGZyb20gJy4vaW5mcmFzdHJ1Y3R1cmUvb3BlcmF0b3IucHJvZHVjZXInO1xuaW1wb3J0IHsgUm9sbHVwSW5mb3JtYXRpb24gfSBmcm9tICdjb21tb24vdHMtdHlwZW9ybS9zcmMvcm9sbHVwL3JvbGx1cEluZm9ybWF0aW9uLmVudGl0eSc7XG5pbXBvcnQgeyBUeXBlT3JtTW9kdWxlIH0gZnJvbSAnQG5lc3Rqcy90eXBlb3JtJztcbmltcG9ydCB7IFRyYW5zYWN0aW9uSW5mbyB9IGZyb20gJ2NvbW1vbi90cy10eXBlb3JtL3NyYy9hY2NvdW50L3RyYW5zYWN0aW9uSW5mby5lbnRpdHknO1xuaW1wb3J0IHsgV29ya2VyTW9kdWxlIH0gZnJvbSAnQGNvbW1vbi9jbHVzdGVyL2NsdXN0ZXIubW9kdWxlJztcbmltcG9ydCB7IFdvcmtlclNlcnZpY2UgfSBmcm9tICdAY29tbW9uL2NsdXN0ZXIvd29ya2VyLnNlcnZpY2UnO1xuXG5ATW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIENvbmZpZ01vZHVsZSxcbiAgICBMb2dnZXJNb2R1bGUsXG4gICAgQnVsbFF1ZXVlTW9kdWxlLFxuICAgIEJ1bGxNb2R1bGUucmVnaXN0ZXJRdWV1ZShUc1dvcmtlck5hbWUuT1BFUkFUT1IpLFxuICAgIFRzVHlwZU9ybU1vZHVsZSxcbiAgICBUeXBlT3JtTW9kdWxlLmZvckZlYXR1cmUoW1xuICAgICAgUm9sbHVwSW5mb3JtYXRpb24sXG4gICAgICBUcmFuc2FjdGlvbkluZm9cbiAgICBdKSxcbiAgICBFdGhlcnNNb2R1bGUuZm9yUm9vdEFzeW5jKHtcbiAgICAgIGltcG9ydHM6IFtDb25maWdNb2R1bGVdLFxuICAgICAgaW5qZWN0OiBbQ29uZmlnU2VydmljZV0sXG4gICAgICB1c2VGYWN0b3J5OiAoY29uZmlnU2VydmljZTogQ29uZmlnU2VydmljZSkgPT4gKHtcbiAgICAgICAgbmV0d29yazoge1xuICAgICAgICAgIG5hbWU6ICdMT0NBTCcsXG4gICAgICAgICAgY2hhaW5JZDogMzEzMzcsXG4gICAgICAgICAgX2RlZmF1bHRQcm92aWRlcjogKHByb3ZpZGVyczogYW55KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHByb3ZpZGVycy5Kc29uUnBjUHJvdmlkZXIoJ2h0dHA6Ly9sb2NhbGhvc3Q6ODU0NScpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gY29uZmlnU2VydmljZS5nZXQoJ0VUSEVSRVVNX05FVFdPUksnLCAnVEVTVE5FVCcpID09PSAnTUFJTk5FVCcgPyBNQUlOTkVUX05FVFdPUksgOiBMT0NBTF9ORVRXT1JLLFxuICAgICAgICBldGhlcnNjYW46IGNvbmZpZ1NlcnZpY2UuZ2V0KCdFVEhFUlNDQU5fQVBJX0tFWScpLFxuICAgICAgICAvLyBjdXN0b206IHtcbiAgICAgICAgLy8gICB1cmw6ICdodHRwOi8vbG9jYWxob3N0Ojg1NDUnLFxuICAgICAgICAvLyB9LFxuICAgICAgICAvLyBpbmZ1cmE6IGNvbmZpZ1NlcnZpY2UuZ2V0KCdJTkZVUkFfQVBJX0tFWScpLFxuICAgICAgICBxdW9ydW06IDEsXG4gICAgICAgIHVzZURlZmF1bHRQcm92aWRlcjogdHJ1ZSxcbiAgICAgIH0pLFxuICAgIH0pLFxuICAgIFdvcmtlck1vZHVsZSxcbiAgXSxcbiAgY29udHJvbGxlcnM6IFtdLFxuICBwcm92aWRlcnM6IFtcbiAgICBPcGVyYXRvckNvbnN1bWVyLFxuICAgIE9wZXJhdG9yUHJvZHVjZXIsXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIFRzT3BlcmF0b3JNb2R1bGUgaW1wbGVtZW50cyBPbk1vZHVsZUluaXQge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tZW1wdHktZnVuY3Rpb25cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSBsb2dnZXI6IFBpbm9Mb2dnZXJTZXJ2aWNlLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgd29ya2VyU2VydmljZTogV29ya2VyU2VydmljZSxcbiAgKSB7IH1cblxuICBvbk1vZHVsZUluaXQoKTogdm9pZCB7XG4gICAgdGhpcy53b3JrZXJTZXJ2aWNlLnJlYWR5KCk7XG4gIH1cbn1cbiIsImltcG9ydCB7IFRzV29ya2VyTmFtZSB9IGZyb20gJ0B0cy1zZGsvY29uc3RhbnQnO1xuaW1wb3J0IHsgUGlub0xvZ2dlclNlcnZpY2UgfSBmcm9tICdAY29tbW9uL2xvZ2dlci9hZGFwdGVycy9yZWFsL3Bpbm9Mb2dnZXIuc2VydmljZSc7XG5pbXBvcnQgeyBFdGhlcnNDb250cmFjdCwgRXRoZXJzU2lnbmVyLCBJbmplY3RDb250cmFjdFByb3ZpZGVyLCBJbmplY3RTaWduZXJQcm92aWRlciwgV2FsbGV0IH0gZnJvbSAnbmVzdGpzLWV0aGVycyc7XG5pbXBvcnQgeyBDb25maWdTZXJ2aWNlIH0gZnJvbSAnQG5lc3Rqcy9jb25maWcnO1xuaW1wb3J0ICogYXMgQUJJIGZyb20gJy4uL2RvbWFpbi92ZXJpZmllZC1hYmkuanNvbic7XG5pbXBvcnQgeyBWZXJpZmllckNvbnRyYWN0IH0gZnJvbSAnQHRzLW9wZXJhdG9yL2RvbWFpbi92ZXJpZmllci1jb250cmFjdCc7XG5pbXBvcnQgeyBCdWxsV29ya2VyLCBCdWxsV29ya2VyUHJvY2VzcyB9IGZyb20gJ0BhbmNoYW44MjgvbmVzdC1idWxsbXEnO1xuaW1wb3J0IHsgSm9iIH0gZnJvbSAnYnVsbG1xJztcbmltcG9ydCB7IEJsb2NrSW5mb3JtYXRpb24gfSBmcm9tICdjb21tb24vdHMtdHlwZW9ybS9zcmMvYWNjb3VudC9ibG9ja0luZm9ybWF0aW9uLmVudGl0eSc7XG5cbkBCdWxsV29ya2VyKHtcbiAgcXVldWVOYW1lOiBUc1dvcmtlck5hbWUuT1BFUkFUT1IsXG4gIG9wdGlvbnM6IHtcbiAgICBjb25jdXJyZW5jeTogMVxuICB9XG59KVxuZXhwb3J0IGNsYXNzIE9wZXJhdG9yQ29uc3VtZXIge1xuICBwcml2YXRlIHdhbGxldDogV2FsbGV0O1xuICBwcml2YXRlIGNvbnRyYWN0OiBWZXJpZmllckNvbnRyYWN0O1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNvbmZpZzogQ29uZmlnU2VydmljZSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IGxvZ2dlcjogUGlub0xvZ2dlclNlcnZpY2UsXG4gICAgQEluamVjdFNpZ25lclByb3ZpZGVyKCkgcHJpdmF0ZSByZWFkb25seSBldGhlcnNTaWduZXI6IEV0aGVyc1NpZ25lcixcbiAgICBASW5qZWN0Q29udHJhY3RQcm92aWRlcigpIHByaXZhdGUgcmVhZG9ubHkgZXRoZXJzQ29udHJhY3Q6IEV0aGVyc0NvbnRyYWN0LFxuICApIHtcbiAgICB0aGlzLndhbGxldCA9IHRoaXMuZXRoZXJzU2lnbmVyLmNyZWF0ZVdhbGxldCh0aGlzLmNvbmZpZy5nZXQoJ0VUSEVSRVVNX09QRVJBVE9SX1BSSVYnLCAnJykpO1xuICAgIHRoaXMuY29udHJhY3QgPSB0aGlzLmV0aGVyc0NvbnRyYWN0LmNyZWF0ZSh0aGlzLmNvbmZpZy5nZXQoJ0VUSEVSRVVNX1JPTExVUF9DT05UUkFDVF9BRERSJywgJycpLCBBQkksIHRoaXMud2FsbGV0KSBhcyB1bmtub3duIGFzIFZlcmlmaWVyQ29udHJhY3Q7XG4gIFxuICAgIFxuICB9XG4gIFxuICBcbiAgQEJ1bGxXb3JrZXJQcm9jZXNzKClcbiAgYXN5bmMgcHJvY2Vzcyhqb2I6IEpvYjxCbG9ja0luZm9ybWF0aW9uPikge1xuICAgIHRoaXMubG9nZ2VyLmxvZyhgT3BlcmF0b3JDb25zdW1lci5wcm9jZXNzICR7am9iLmRhdGEuYmxvY2tOdW1iZXJ9YCk7XG4gICAgLy8gZXRoZXJzO1xuICAgIC8vIC8vIFRPRE86IHJlZmFjdG9yXG4gICAgLy8gY29uc3Qge2EsYixjfSA9IGpvYi5kYXRhLnByb29mIGFzIGFueTtcbiAgICAvLyBjb25zdCBpbnB1dCA9IGpvYi5kYXRhLnB1YmxpY0lucHV0IGFzIGFueTtcbiAgICAvLyBjb25zdCBnYXMgPSBhd2FpdCB0aGlzLmNvbnRyYWN0LmVzdGltYXRlR2FzLnZlcmlmeVByb29mKGEsIGIsIGMsIGlucHV0KTtcbiAgICAvLyB0aGlzLmxvZ2dlci5sb2coYE9wZXJhdG9yQ29uc3VtZXIucHJvY2VzcyAke2pvYi5kYXRhLmJsb2NrTnVtYmVyfSBnYXM9JHtnYXN9YCk7XG4gICAgLy8gY29uc3QgcmVjZWlwdCA9IGF3YWl0IHRoaXMuY29udHJhY3QudmVyaWZ5UHJvb2YoYSwgYiwgYywgaW5wdXQsIHtcbiAgICAvLyAgIGZyb206IHRoaXMud2FsbGV0LmFkZHJlc3MsXG4gICAgLy8gICBnYXM6IGdhcy50b051bWJlcigpLFxuICAgIC8vIH0pO1xuICAgIC8vIHRoaXMubG9nZ2VyLmxvZyhgT3BlcmF0b3JDb25zdW1lci5wcm9jZXNzIHR4SGFzaD0ke3JlY2VpcHQudHJhbnNhY3Rpb25IYXNofWApO1xuICAgIC8vIGF3YWl0IHRoaXMucHJpc21hU2VydmljZS5CbG9ja0luZm9ybWF0aW9uLnVwZGF0ZSh7XG4gICAgLy8gICB3aGVyZToge1xuICAgIC8vICAgICBibG9ja051bWJlcjogam9iLmRhdGEuYmxvY2tOdW1iZXIsXG4gICAgLy8gICB9LFxuICAgIC8vICAgZGF0YToge1xuICAgIC8vICAgICBzdGF0dXM6IEJsb2NrU3RhdHVzLkwxVkVSSUZJRURcbiAgICAvLyAgIH1cbiAgICAvLyB9KTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuIiwiaW1wb3J0IHR5cGUgeyBXb3JrZXIgfSBmcm9tICdjbHVzdGVyJztcbmltcG9ydCB7IElOZXN0QXBwbGljYXRpb24sIElOZXN0QXBwbGljYXRpb25Db250ZXh0IH0gZnJvbSAnQG5lc3Rqcy9jb21tb24nO1xuXG5leHBvcnQgZW51bSBUc1dvcmtlck5hbWUge1xuICBVTktOT1dOID0gJ3Vua25vd24nLFxuICBDT1JFID0gJ1RzQ29yZScsXG4gIE9QRVJBVE9SID0gJ1RzT3BlcmF0b3InLFxuICBQUk9WRVIgPSAnVHNQcm92ZXInLFxuICBTRVFVRU5DRVIgPSAnVHNTZXF1ZW5jZXInLFxuICBHQVRFV0FZID0gJ1RzR2F0ZXdheScsXG59XG5cbmV4cG9ydCB0eXBlIFdvcmtlckl0ZW0gPSB7XG4gIG5hbWU6IFRzV29ya2VyTmFtZTtcbiAgYm9vdHN0cmFwOiAoKSA9PiBQcm9taXNlPElOZXN0QXBwbGljYXRpb25Db250ZXh0IHwgSU5lc3RBcHBsaWNhdGlvbj47XG4gIHdvcmtlcj86IFdvcmtlcjtcbiAgaXNSZWFkeT86IGJvb2xlYW47XG59XG4iLCJpbXBvcnQgeyBDb25zb2xlTG9nZ2VyLCBJbmplY3RhYmxlIH0gZnJvbSAnQG5lc3Rqcy9jb21tb24nO1xuaW1wb3J0IHsgZ2V0UHJvY2Vzc05hbWUgfSBmcm9tICdAdHMtc2RrL2hlbHBlcic7XG5pbXBvcnQgeyBQaW5vTG9nZ2VyIH0gZnJvbSAnbmVzdGpzLXBpbm8nO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUGlub0xvZ2dlclNlcnZpY2UgZXh0ZW5kcyBDb25zb2xlTG9nZ2VyIHtcbiAgcmVhZG9ubHkgY29udGV4dE5hbWU6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihyZWFkb25seSBsb2dnZXI6IFBpbm9Mb2dnZXIpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuY29udGV4dE5hbWUgPSAnY29udGV4dCc7XG4gIH1cblxuICBzZXRDb250ZXh0KG5hbWU6IHN0cmluZykge1xuICAgIHRoaXMubG9nZ2VyLnNldENvbnRleHQobmFtZSk7XG4gIH1cblxuICB2ZXJib3NlKG1lc3NhZ2U6IGFueSwgY29udGV4dD86IHN0cmluZywgLi4uYXJnczogYW55W10pIHtcbiAgICBpZiAoY29udGV4dCkge1xuICAgICAgdGhpcy5sb2dnZXIudHJhY2UoeyBbdGhpcy5jb250ZXh0TmFtZV06IGNvbnRleHQsIHByb2Nlc3M6IGdldFByb2Nlc3NOYW1lKCkgfSwgbWVzc2FnZSwgLi4uYXJncyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubG9nZ2VyLnRyYWNlKG1lc3NhZ2UsIC4uLmFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIGRlYnVnKG1lc3NhZ2U6IGFueSwgY29udGV4dD86IHN0cmluZywgLi4uYXJnczogYW55W10pIHtcbiAgICBpZiAoY29udGV4dCkge1xuICAgICAgdGhpcy5sb2dnZXIuZGVidWcoeyBbdGhpcy5jb250ZXh0TmFtZV06IGNvbnRleHQsIHByb2Nlc3M6IGdldFByb2Nlc3NOYW1lKCkgfSwgbWVzc2FnZSwgLi4uYXJncyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKG1lc3NhZ2UsIC4uLmFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIGxvZyhtZXNzYWdlOiBhbnksIGNvbnRleHQ/OiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgaWYgKGNvbnRleHQpIHtcbiAgICAgIHRoaXMubG9nZ2VyLmluZm8oeyBbdGhpcy5jb250ZXh0TmFtZV06IGNvbnRleHQsIHByb2Nlc3M6IGdldFByb2Nlc3NOYW1lKCkgfSwgbWVzc2FnZSwgLi4uYXJncyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubG9nZ2VyLmluZm8obWVzc2FnZSwgLi4uYXJncyk7XG4gICAgfVxuICB9XG5cbiAgd2FybihtZXNzYWdlOiBhbnksIGNvbnRleHQ/OiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgaWYgKGNvbnRleHQpIHtcbiAgICAgIHRoaXMubG9nZ2VyLndhcm4oeyBbdGhpcy5jb250ZXh0TmFtZV06IGNvbnRleHQsIHByb2Nlc3M6IGdldFByb2Nlc3NOYW1lKCkgfSwgbWVzc2FnZSwgLi4uYXJncyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubG9nZ2VyLndhcm4obWVzc2FnZSwgLi4uYXJncyk7XG4gICAgfVxuICB9XG5cbiAgZXJyb3IobWVzc2FnZTogYW55LCB0cmFjZT86IHN0cmluZywgY29udGV4dD86IHN0cmluZywgLi4uYXJnczogYW55W10pIHtcbiAgICBpZiAoY29udGV4dCkge1xuICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoeyBbdGhpcy5jb250ZXh0TmFtZV06IGNvbnRleHQsIHRyYWNlLCBwcm9jZXNzOiBnZXRQcm9jZXNzTmFtZSgpIH0sIG1lc3NhZ2UsIC4uLmFyZ3MpO1xuICAgIH0gZWxzZSBpZiAodHJhY2UpIHtcbiAgICAgIHRoaXMubG9nZ2VyLmVycm9yKHsgdHJhY2UgfSwgbWVzc2FnZSwgLi4uYXJncyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubG9nZ2VyLmVycm9yKG1lc3NhZ2UsIC4uLmFyZ3MpO1xuICAgIH1cbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiQG5lc3Rqcy9jb21tb25cIik7OyIsImltcG9ydCB7IFRzV29ya2VyTmFtZSB9IGZyb20gJ0B0cy1zZGsvY29uc3RhbnQnO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJvY2Vzc05hbWUoKSB7XG4gIHJldHVybiBgJHtnZXRXb3JrZXJOYW1lKCl9LSR7cHJvY2Vzcy5waWR9YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFdvcmtlck5hbWUoKTogVHNXb3JrZXJOYW1lIHtcbiAgcmV0dXJuIHByb2Nlc3MuZW52LlRTX1dPUktFUl9OQU1FIGFzIFRzV29ya2VyTmFtZTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZGVsYXkodGltZTogbnVtYmVyKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCB0aW1lKSk7XG59IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibmVzdGpzLXBpbm9cIik7OyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIm5lc3Rqcy1ldGhlcnNcIik7OyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIkBuZXN0anMvY29uZmlnXCIpOzsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJAYW5jaGFuODI4L25lc3QtYnVsbG1xXCIpOzsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJidWxsbXFcIik7OyIsImltcG9ydCB7IEdsb2JhbCwgTW9kdWxlIH0gZnJvbSAnQG5lc3Rqcy9jb21tb24nO1xuaW1wb3J0IHsgTG9nZ2VyTW9kdWxlIGFzIFBpbm9Mb2dnZXJNb2R1bGUgfSBmcm9tICduZXN0anMtcGlubyc7XG5pbXBvcnQgeyBzdGRUaW1lRnVuY3Rpb25zIH0gZnJvbSAncGlubyc7XG5pbXBvcnQgKiBhcyB1dWlkIGZyb20gJ3V1aWQnO1xuaW1wb3J0IHsgRmFrZUxvZ2dlclNlcnZpY2UgfSBmcm9tICcuL2FkYXB0ZXJzL2Zha2UvRmFrZUxvZ2dlci5zZXJ2aWNlJztcbmltcG9ydCB7IFBpbm9Mb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi9hZGFwdGVycy9yZWFsL3Bpbm9Mb2dnZXIuc2VydmljZSc7XG5cbmRlY2xhcmUgbW9kdWxlICdodHRwJyB7XG4gIGludGVyZmFjZSBJbmNvbWluZ01lc3NhZ2Uge1xuICAgIHJlcXVlc3RJZDogc3RyaW5nO1xuICB9XG59XG5cbkBHbG9iYWwoKVxuQE1vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBQaW5vTG9nZ2VyTW9kdWxlLmZvclJvb3Qoe1xuICAgICAgcGlub0h0dHA6IHtcbiAgICAgICAgbmFtZTogJ0FQSScsXG4gICAgICAgIGxldmVsOiBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nID8gJ2RlYnVnJyA6ICdpbmZvJyxcbiAgICAgICAgZ2VuUmVxSWQ6IChyZXEpID0+IHJlcS5yZXF1ZXN0SWQgfHwgdXVpZC52NCgpLFxuICAgICAgICBmb3JtYXR0ZXJzOiB7IGJpbmRpbmdzOiAoKSA9PiAoe30pIH0sXG4gICAgICAgIC8vIHJlZGFjdFxuICAgICAgICB0aW1lc3RhbXA6IHN0ZFRpbWVGdW5jdGlvbnMudW5peFRpbWUsXG4gICAgICB9LFxuICAgIH0pLFxuICBdLFxuICBwcm92aWRlcnM6IFtGYWtlTG9nZ2VyU2VydmljZSwgUGlub0xvZ2dlclNlcnZpY2VdLFxuICBleHBvcnRzOiBbRmFrZUxvZ2dlclNlcnZpY2UsIFBpbm9Mb2dnZXJTZXJ2aWNlXSxcbn0pXG5leHBvcnQgY2xhc3MgTG9nZ2VyTW9kdWxlIHt9XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJwaW5vXCIpOzsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJ1dWlkXCIpOzsiLCJpbXBvcnQgeyBDb25zb2xlTG9nZ2VyIH0gZnJvbSAnQG5lc3Rqcy9jb21tb24nO1xuXG5leHBvcnQgY2xhc3MgRmFrZUxvZ2dlclNlcnZpY2UgZXh0ZW5kcyBDb25zb2xlTG9nZ2VyIHtcbiAgcmVhZG9ubHkgY29udGV4dE5hbWU6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihyZWFkb25seSBsb2dnZXI6IG51bGwpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuY29udGV4dE5hbWUgPSAnY29udGV4dCc7XG4gIH1cblxuICBwdWJsaWMgbG9nID0gKCkgPT4ge307XG4gIHB1YmxpYyBkZWJ1ZyA9ICgpID0+IHt9O1xuICBwdWJsaWMgdmVyYm9zZSA9ICgpID0+IHt9O1xuICBwdWJsaWMgaW5mbyA9ICgpID0+IHt9O1xuICBwdWJsaWMgd2FybiA9ICgpID0+IHt9O1xuICBwdWJsaWMgZXJyb3IgPSAoKSA9PiB7fTtcbiAgcHVibGljIHNldENvbnRleHQgPSAoKSA9PiB7fTtcbn1cbiIsImltcG9ydCB7IEJ1bGxNb2R1bGUgfSBmcm9tICdAYW5jaGFuODI4L25lc3QtYnVsbG1xJztcbmltcG9ydCB7IE1vZHVsZSB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcbmltcG9ydCB7IENvbmZpZ01vZHVsZSwgQ29uZmlnU2VydmljZSB9IGZyb20gJ0BuZXN0anMvY29uZmlnJztcblxuQE1vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBCdWxsTW9kdWxlLmZvclJvb3RBc3luYyh7XG4gICAgICBpbXBvcnRzOiBbQ29uZmlnTW9kdWxlXSxcbiAgICAgIGluamVjdDogW0NvbmZpZ1NlcnZpY2VdLFxuICAgICAgdXNlRmFjdG9yeTogYXN5bmMgKGNvbmZpZ1NlcnZpY2U6IENvbmZpZ1NlcnZpY2UpID0+ICh7XG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICBjb25uZWN0aW9uOiB7XG4gICAgICAgICAgICBob3N0OiBjb25maWdTZXJ2aWNlLmdldCgnQlVMTF9RVUVVRV9SRURJU19IT1NUJyksXG4gICAgICAgICAgICBwb3J0OiBjb25maWdTZXJ2aWNlLmdldDxudW1iZXI+KCdCVUxMX1FVRVVFX1JFRElTX1BPUlQnLCA2Mzc5KSxcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgIH0pLFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBCdWxsUXVldWVNb2R1bGUge31cbiIsImltcG9ydCB7IFBpbm9Mb2dnZXJTZXJ2aWNlIH0gZnJvbSAnQGNvbW1vbi9sb2dnZXIvYWRhcHRlcnMvcmVhbC9waW5vTG9nZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgTG9nZ2VyTW9kdWxlIH0gZnJvbSAnQGNvbW1vbi9sb2dnZXIvbG9nZ2VyLm1vZHVsZSc7XG5pbXBvcnQgeyBHbG9iYWwsIE1vZHVsZSB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcbmltcG9ydCB7IENvbmZpZ01vZHVsZSwgQ29uZmlnU2VydmljZSB9IGZyb20gJ0BuZXN0anMvY29uZmlnJztcbmltcG9ydCB7IFR5cGVPcm1Nb2R1bGUgfSBmcm9tICdAbmVzdGpzL3R5cGVvcm0nO1xuaW1wb3J0IHsgQWNjb3VudE1vZHVsZSB9IGZyb20gJ0Bjb21tb24vdHMtdHlwZW9ybS9hY2NvdW50L2FjY291bnQubW9kdWxlJztcbmltcG9ydCB7IEF1Y3Rpb25PcmRlck1vdWRsZSB9IGZyb20gJ0Bjb21tb24vdHMtdHlwZW9ybS9hdWN0aW9uT3JkZXIvYXVjdGlvbk9yZGVyLm1vZHVsZSc7XG5pbXBvcnQgeyBSb2xsdXBNb2R1bGUgfSBmcm9tICdAY29tbW9uL3RzLXR5cGVvcm0vcm9sbHVwL3JvbGx1cC5tb2R1bGUnO1xuQEdsb2JhbCgpXG5ATW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIENvbmZpZ01vZHVsZSxcbiAgICBMb2dnZXJNb2R1bGUsXG4gICAgVHlwZU9ybU1vZHVsZS5mb3JSb290QXN5bmMoe1xuICAgICAgaW1wb3J0czogW0NvbmZpZ01vZHVsZV0sXG4gICAgICBpbmplY3Q6IFtDb25maWdTZXJ2aWNlXSxcbiAgICAgIHVzZUZhY3Rvcnk6IChjb25maWdTZXJ2aWNlOiBDb25maWdTZXJ2aWNlKSA9PiB7XG4gICAgICAgIGNvbnN0IGlzUHJvZHVjdGlvbiA9IGNvbmZpZ1NlcnZpY2UuZ2V0KCdOT0RFX0VOVicpID09PSAncHJvZCc7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3NsOiBpc1Byb2R1Y3Rpb24sXG4gICAgICAgICAgZXh0cmE6IHtcbiAgICAgICAgICAgIHNzbDogaXNQcm9kdWN0aW9uPyB7IHJlamVjdFVuYXV0aG9yaXplZDogZmFsc2UgfSA6IG51bGwsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB0eXBlOiAncG9zdGdyZXMnLFxuICAgICAgICAgIGhvc3Q6IGNvbmZpZ1NlcnZpY2UuZ2V0PHN0cmluZz4oJ0RCX0hPU1QnLCAnJyksXG4gICAgICAgICAgcG9ydDogY29uZmlnU2VydmljZS5nZXQ8bnVtYmVyPignREJfUE9SVCcsIDU0MzIpLFxuICAgICAgICAgIHVzZXJuYW1lOiBjb25maWdTZXJ2aWNlLmdldDxzdHJpbmc+KCdEQl9VU0VSJywgJycpLFxuICAgICAgICAgIHBhc3N3b3JkOiBjb25maWdTZXJ2aWNlLmdldDxzdHJpbmc+KCdEQl9QQVNTV0QnLCAnJyksXG4gICAgICAgICAgZGF0YWJhc2U6IGNvbmZpZ1NlcnZpY2UuZ2V0PHN0cmluZz4oJ0RCX05BTUUnLCAnJyksXG4gICAgICAgICAgYXV0b0xvYWRFbnRpdGllczogdHJ1ZSxcbiAgICAgICAgICBzeW5jaHJvbml6ZTogY29uZmlnU2VydmljZS5nZXQ8c3RyaW5nPignTk9ERV9FTlYnLCAnZGV2JykgPT0gJ2RldicsXG4gICAgICAgICAgLy8gc3Vic2NyaWJlcnM6IFtcbiAgICAgICAgICAvLyAgIFRyYW5zYWN0aW9uU3Vic2NyaWJlcixcbiAgICAgICAgICAvLyBdXG4gICAgICAgIH07XG4gICAgICB9LFxuICAgIH0pLFxuICAgIC8vIEFjY291bnRNb2R1bGUsXG4gICAgQWNjb3VudE1vZHVsZSwgQXVjdGlvbk9yZGVyTW91ZGxlLCBSb2xsdXBNb2R1bGVcbiAgXSxcbiAgcHJvdmlkZXJzOiBbXG4gICAgVHlwZU9ybU1vZHVsZSxcbiAgICBQaW5vTG9nZ2VyU2VydmljZVxuICBdLFxuICBleHBvcnRzOiBbVHlwZU9ybU1vZHVsZV1cbn0pXG5leHBvcnQgY2xhc3MgVHNUeXBlT3JtTW9kdWxlIHt9XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJAbmVzdGpzL3R5cGVvcm1cIik7OyIsImltcG9ydCB7IEdsb2JhbCwgTW9kdWxlIH0gZnJvbSAnQG5lc3Rqcy9jb21tb24nO1xuaW1wb3J0IHsgQ29uZmlnTW9kdWxlIH0gZnJvbSAnQG5lc3Rqcy9jb25maWcnO1xuaW1wb3J0IHsgVHlwZU9ybU1vZHVsZSB9IGZyb20gJ0BuZXN0anMvdHlwZW9ybSc7XG5pbXBvcnQgeyBPYnNPcmRlclRyZWVTZXJ2aWNlIH0gZnJvbSAnLi4vYXVjdGlvbk9yZGVyL29ic09yZGVyVHJlZS5zZXJ2aWNlJztcbmltcG9ydCB7IEFjY291bnRJbmZvcm1hdGlvbiB9IGZyb20gJy4vYWNjb3VudEluZm9ybWF0aW9uLmVudGl0eSc7XG5pbXBvcnQgeyBBY2NvdW50TGVhZk5vZGUgfSBmcm9tICcuL2FjY291bnRMZWFmTm9kZS5lbnRpdHknO1xuaW1wb3J0IHsgQWNjb3VudE1lcmtsZVRyZWVOb2RlIH0gZnJvbSAnLi9hY2NvdW50TWVya2xlVHJlZU5vZGUuZW50aXR5JztcbmltcG9ydCB7IEJsb2NrSW5mb3JtYXRpb24gfSBmcm9tICcuL2Jsb2NrSW5mb3JtYXRpb24uZW50aXR5JztcbmltcG9ydCB7IE1lcmtsZVRyZWVDb250cm9sbGVyIH0gZnJvbSAnLi9tZXJrbGVUcmVlLmNvbnRyb2xsZXInO1xuLy8gaW1wb3J0IHsgTWVya2xlVHJlZUNvbnRyb2xsZXIgfSBmcm9tICcuL21lcmtsZVRyZWUuY29udHJvbGxlcic7XG5pbXBvcnQgeyBUb2tlbkxlYWZOb2RlIH0gZnJvbSAnLi90b2tlbkxlYWZOb2RlLmVudGl0eSc7XG5pbXBvcnQgeyBUb2tlbk1lcmtsZVRyZWVOb2RlIH0gZnJvbSAnLi90b2tlbk1lcmtsZVRyZWVOb2RlLmVudGl0eSc7XG5pbXBvcnQgeyBUcmFuc2FjdGlvbkluZm8gfSBmcm9tICcuL3RyYW5zYWN0aW9uSW5mby5lbnRpdHknO1xuaW1wb3J0IHsgVHNBY2NvdW50VHJlZVNlcnZpY2UgfSBmcm9tICcuL3RzQWNjb3VudFRyZWUuc2VydmljZSc7XG5pbXBvcnQgeyBUc1Rva2VuVHJlZVNlcnZpY2UgfSBmcm9tICcuL3RzVG9rZW5UcmVlLnNlcnZpY2UnO1xuQEdsb2JhbCgpXG5ATW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIENvbmZpZ01vZHVsZS5mb3JSb290KCksXG4gICAgVHlwZU9ybU1vZHVsZS5mb3JGZWF0dXJlKFtcbiAgICAgIEFjY291bnRJbmZvcm1hdGlvbixcbiAgICAgIEFjY291bnRMZWFmTm9kZSwgXG4gICAgICBBY2NvdW50TWVya2xlVHJlZU5vZGUsIFxuICAgICAgVG9rZW5NZXJrbGVUcmVlTm9kZSwgXG4gICAgICBUb2tlbkxlYWZOb2RlLFxuICAgICAgVHJhbnNhY3Rpb25JbmZvLFxuICAgICAgQmxvY2tJbmZvcm1hdGlvblxuICAgIF0pXG4gIF0sXG4gIHByb3ZpZGVyczogW1RzQWNjb3VudFRyZWVTZXJ2aWNlLCBUc1Rva2VuVHJlZVNlcnZpY2UsIE9ic09yZGVyVHJlZVNlcnZpY2VdLFxuICBjb250cm9sbGVyczogW01lcmtsZVRyZWVDb250cm9sbGVyXSxcbiAgZXhwb3J0czogW1R5cGVPcm1Nb2R1bGVdXG59KVxuZXhwb3J0IGNsYXNzIEFjY291bnRNb2R1bGV7fSIsImltcG9ydCB7IEluamVjdGFibGUsIExvZ2dlciB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcbmltcG9ydCB7IENvbmZpZ1NlcnZpY2UgfSBmcm9tICdAbmVzdGpzL2NvbmZpZyc7XG5pbXBvcnQgeyBJbmplY3RSZXBvc2l0b3J5IH0gZnJvbSAnQG5lc3Rqcy90eXBlb3JtJztcbmltcG9ydCB7IENvbm5lY3Rpb24sIFJlcG9zaXRvcnkgfSBmcm9tICd0eXBlb3JtJztcbmltcG9ydCB7IHRvVHJlZUxlYWYsIHRzSGFzaEZ1bmMgfSBmcm9tICcuLi9jb21tb24vdHMtaGVscGVyJztcbmltcG9ydCB7IFRzTWVya2xlVHJlZSB9IGZyb20gJy4uL2NvbW1vbi90c01lcmtsZVRyZWUnO1xuaW1wb3J0IHsgVXBkYXRlT2JzT3JkZXJUcmVlRHRvIH0gZnJvbSAnLi9kdG8vdXBkYXRlT2JzT3JkZXJUcmVlLmR0byc7XG5pbXBvcnQgeyBPYnNPcmRlckxlYWZFbnRpdHkgfSBmcm9tICcuL29ic09yZGVyTGVhZi5lbnRpdHknO1xuaW1wb3J0IHsgT2JzT3JkZXJMZWFmTWVya2xlVHJlZU5vZGUgfSBmcm9tICcuL29ic09yZGVyTGVhZk1lcmtsZVRyZWVOb2RlLmVudGl0eSc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBPYnNPcmRlclRyZWVTZXJ2aWNlIGV4dGVuZHMgVHNNZXJrbGVUcmVlPE9ic09yZGVyTGVhZkVudGl0eT4ge1xuICBwcml2YXRlIGxvZ2dlcjogTG9nZ2VyID0gbmV3IExvZ2dlcihPYnNPcmRlclRyZWVTZXJ2aWNlLm5hbWUpO1xuICBjb25zdHJ1Y3RvcihcbiAgICBASW5qZWN0UmVwb3NpdG9yeShPYnNPcmRlckxlYWZFbnRpdHkpXG4gICAgcHJpdmF0ZSByZWFkb25seSBvYnNPcmRlckxlYWZSZXBvc2l0b3J5OiBSZXBvc2l0b3J5PE9ic09yZGVyTGVhZkVudGl0eT4sXG4gICAgQEluamVjdFJlcG9zaXRvcnkoT2JzT3JkZXJMZWFmTWVya2xlVHJlZU5vZGUpXG4gICAgcHJpdmF0ZSByZWFkb25seSBvYnNPcmRlck1lcmtsZVRyZWVSZXBvc2l0b3J5OiBSZXBvc2l0b3J5PE9ic09yZGVyTGVhZk1lcmtsZVRyZWVOb2RlPixcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNvbm5lY3Rpb246IENvbm5lY3Rpb24sXG4gICAgcHJpdmF0ZSBjb25maWdTZXJ2aWNlOiBDb25maWdTZXJ2aWNlLFxuICApIHtcbiAgICBjb25zb2xlLnRpbWUoJ2luaXQgb3JkZXIgdHJlZScpO1xuICAgIHN1cGVyKGNvbmZpZ1NlcnZpY2UuZ2V0PG51bWJlcj4oJ09SREVSX1RSRUVfSEVJR0hUJywgMzIpLCB0c0hhc2hGdW5jKTtcbiAgICBjb25zb2xlLnRpbWVFbmQoJ2luaXQgb3JkZXIgdHJlZScpO1xuICB9XG4gIGFzeW5jIHVwZGF0ZUxlYWYobGVhZklkOiBiaWdpbnQsIHZhbHVlOiBVcGRhdGVPYnNPcmRlclRyZWVEdG8pIHtcbiAgICBjb25zb2xlLnRpbWUoJ3VwZGF0ZUxlYWYgZm9yIG9ic09yZGVyIHRyZWUnKTtcbiAgICBjb25zdCBwcmYgPSB0aGlzLmdldFByb29mSWRzKGxlYWZJZCk7XG4gICAgY29uc3QgaWQgPSB0aGlzLmdldExlYWZJZEluVHJlZShsZWFmSWQpO1xuICAgIC8vIHNldHVwIHRyYW5zYWN0aW9uXG4gICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uLnRyYW5zYWN0aW9uKGFzeW5jIChtYW5hZ2VyKSA9PiB7XG4gICAgICBhd2FpdCBtYW5hZ2VyLnVwc2VydChPYnNPcmRlckxlYWZNZXJrbGVUcmVlTm9kZSwge1xuICAgICAgICBpZDogaWQudG9TdHJpbmcoKSxcbiAgICAgICAgbGVhZklkOiBsZWFmSWQsXG4gICAgICAgIGhhc2g6IEJpZ0ludCh0b1RyZWVMZWFmKFtcbiAgICAgICAgICBCaWdJbnQodmFsdWUudHhJZCksXG4gICAgICAgICAgQmlnSW50KHZhbHVlLnJlcVR5cGUpLFxuICAgICAgICAgIEJpZ0ludCh2YWx1ZS5zZW5kZXIpLFxuICAgICAgICAgIEJpZ0ludCh2YWx1ZS5zZWxsVG9rZW5JZCksXG4gICAgICAgICAgQmlnSW50KHZhbHVlLnNlbGxBbXQpLFxuICAgICAgICAgIEJpZ0ludCh2YWx1ZS5ub25jZSksXG4gICAgICAgICAgQmlnSW50KHZhbHVlLmJ1eVRva2VuSWQpLFxuICAgICAgICAgIEJpZ0ludCh2YWx1ZS5idXlBbXQpLFxuICAgICAgICAgIEJpZ0ludCh2YWx1ZS5hY2N1bXVsYXRlZFNlbGxBbXQpLFxuICAgICAgICAgIEJpZ0ludCh2YWx1ZS5hY2N1bXVsYXRlZEJ1eUFtdCksXG4gICAgICAgICAgQmlnSW50KHZhbHVlLm9yZGVySWQpXG4gICAgICAgIF0pKVxuICAgICAgfSwgWydpZCddKTtcbiAgICAgIGF3YWl0IG1hbmFnZXIudXBzZXJ0KE9ic09yZGVyTGVhZkVudGl0eSwge1xuICAgICAgICBvcmRlckxlYWZJZDpCaWdJbnQodmFsdWUub3JkZXJMZWFmSWQpLFxuICAgICAgICB0eElkOiBOdW1iZXIodmFsdWUudHhJZCksXG4gICAgICAgIHJlcVR5cGU6IE51bWJlcih2YWx1ZS5yZXFUeXBlKSxcbiAgICAgICAgc2VuZGVyOiBCaWdJbnQodmFsdWUuc2VuZGVyKSxcbiAgICAgICAgc2VsbFRva2VuSWQ6IEJpZ0ludCh2YWx1ZS5zZWxsVG9rZW5JZCksXG4gICAgICAgIHNlbGxBbXQ6IEJpZ0ludCh2YWx1ZS5zZWxsQW10KSxcbiAgICAgICAgbm9uY2U6IEJpZ0ludCh2YWx1ZS5ub25jZSksXG4gICAgICAgIGJ1eVRva2VuSWQ6IEJpZ0ludCh2YWx1ZS5idXlUb2tlbklkKSxcbiAgICAgICAgYnV5QW10OiBCaWdJbnQodmFsdWUuYnV5QW10KSxcbiAgICAgICAgYWNjdW11bGF0ZWRTZWxsQW10OiBCaWdJbnQodmFsdWUuYWNjdW11bGF0ZWRTZWxsQW10KSxcbiAgICAgICAgYWNjdW11bGF0ZWRCdXlBbXQ6IEJpZ0ludCh2YWx1ZS5hY2N1bXVsYXRlZEJ1eUFtdCksXG4gICAgICAgIG9yZGVySWQ6IE51bWJlcih2YWx1ZS5vcmRlcklkKVxuICAgICAgfSwgWydvcmRlckxlYWZJZCddKTtcbiAgICAgIC8vIHVwZGF0ZSB0cmVlXG4gICAgICBmb3IgKGxldCBpID0gaWQsIGogPSAwOyBpID4gMW47IGkgPSBpID4+IDFuKSB7XG4gICAgICAgIGNvbnN0IFtpVmFsdWUsIGpWYWx1ZV0gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgICAgdGhpcy5vYnNPcmRlck1lcmtsZVRyZWVSZXBvc2l0b3J5LmZpbmRPbmVCeSh7aWQ6IGkudG9TdHJpbmcoKX0pLFxuICAgICAgICAgIHRoaXMub2JzT3JkZXJNZXJrbGVUcmVlUmVwb3NpdG9yeS5maW5kT25lQnkoe2lkOiBwcmZbal0udG9TdHJpbmcoKX0pXG4gICAgICAgIF0pO1xuICAgICAgICBjb25zdCBqTGV2ZWwgPSBNYXRoLmZsb29yKE1hdGgubG9nMihOdW1iZXIocHJmW2pdKSkpO1xuICAgICAgICBjb25zdCBpTGV2ZWwgPSBNYXRoLmZsb29yKE1hdGgubG9nMihOdW1iZXIoaSkpKTtcbiAgICAgICAgY29uc3Qgakhhc2hWYWx1ZTogc3RyaW5nID0gKGpWYWx1ZSA9PSBudWxsKT8gdGhpcy5nZXREZWZhdWx0SGFzaEJ5TGV2ZWwoakxldmVsKTogalZhbHVlLmhhc2gudG9TdHJpbmcoKTtcbiAgICAgICAgY29uc3QgaUhhc2hWYWx1ZTogc3RyaW5nID0gKGlWYWx1ZSA9PSBudWxsKT8gdGhpcy5nZXREZWZhdWx0SGFzaEJ5TGV2ZWwoaUxldmVsKTogaVZhbHVlLmhhc2gudG9TdHJpbmcoKTtcbiAgICAgICAgbGV0IHIgPSAoaWQgJSAybiA9PSAwbikgP1sgakhhc2hWYWx1ZSwgaUhhc2hWYWx1ZV0gOiBbIGlIYXNoVmFsdWUsIGpIYXNoVmFsdWVdO1xuICAgICAgICBjb25zdCBoYXNoID0gdGhpcy5oYXNoRnVuYyhyKTtcbiAgICAgICAgY29uc3Qgam9icyA9IFtdO1xuICAgICAgICBpZiAoaVZhbHVlID09IG51bGwpIHtcbiAgICAgICAgICBqb2JzLnB1c2gobWFuYWdlci51cHNlcnQoT2JzT3JkZXJMZWFmTWVya2xlVHJlZU5vZGUsIHtcbiAgICAgICAgICAgIGlkOiBpLnRvU3RyaW5nKCksXG4gICAgICAgICAgICBoYXNoOiBCaWdJbnQoaUhhc2hWYWx1ZSlcbiAgICAgICAgICB9LCBbJ2lkJ10pKTtcbiAgICAgICAgfSBcbiAgICAgICAgaWYgKGpWYWx1ZSA9PSBudWxsICYmIGogPCBwcmYubGVuZ3RoKSB7XG4gICAgICAgICAgam9icy5wdXNoKG1hbmFnZXIudXBzZXJ0KE9ic09yZGVyTGVhZk1lcmtsZVRyZWVOb2RlLCB7XG4gICAgICAgICAgICBpZDogcHJmW2pdLnRvU3RyaW5nKCksXG4gICAgICAgICAgICBoYXNoOiBCaWdJbnQoakhhc2hWYWx1ZSlcbiAgICAgICAgICB9LCBbJ2lkJ10pKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB1cGRhdGVSb290ID0gaSA+PiAxbjtcbiAgICAgICAgaWYgKCB1cGRhdGVSb290ID49IDFuKSB7XG4gICAgICAgICAgam9icy5wdXNoKG1hbmFnZXIudXBzZXJ0KE9ic09yZGVyTGVhZk1lcmtsZVRyZWVOb2RlLCB7XG4gICAgICAgICAgICBpZDogdXBkYXRlUm9vdC50b1N0cmluZygpLFxuICAgICAgICAgICAgaGFzaDogQmlnSW50KGhhc2gpXG4gICAgICAgICAgfSwgWydpZCddKSk7XG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoam9icyk7XG4gICAgICAgIGorKztcbiAgICAgIH1cbiAgICB9KTtcbiAgICBjb25zb2xlLnRpbWVFbmQoJ3VwZGF0ZUxlYWYgZm9yIG9ic09yZGVyIHRyZWUnKTtcbiAgfVxuICBhc3luYyBnZXRMZWFmKGxlYWZfaWQ6IGJpZ2ludCwgb3RoZXJQYXlsb2FkOiBhbnkpOiBQcm9taXNlPE9ic09yZGVyTGVhZkVudGl0eSB8IG51bGw+IHtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLm9ic09yZGVyTGVhZlJlcG9zaXRvcnkuZmluZE9uZUJ5KHtcbiAgICAgIG9yZGVyTGVhZklkOiBsZWFmX2lkXG4gICAgfSk7XG4gICAgaWYgKHJlc3VsdCA9PSBudWxsKSB7XG4gICAgICAvLyBjaGVjayBsZXZlbFxuICAgICAgY29uc3QgaWQgPSB0aGlzLmdldExlYWZJZEluVHJlZShsZWFmX2lkKTtcbiAgICAgIGNvbnN0IGxldmVsID0gTWF0aC5mbG9vcihNYXRoLmxvZzIoTnVtYmVyKGlkKSkpO1xuICAgICAgY29uc3QgaGFzaCA9IHRoaXMuZ2V0RGVmYXVsdEhhc2hCeUxldmVsKGxldmVsKTtcbiAgICAgIC8vIHNldHVwIHRyYW5zYWN0aW9uXG4gICAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24udHJhbnNhY3Rpb24oYXN5bmMgKG1hbmFnZXIpID0+IHtcbiAgICAgICAgLy8gaW5zZXJ0IHRoaXMgbnVsbCBoYXNoIG9uIHRoaXMgbm9kZVxuICAgICAgICBhd2FpdCBtYW5hZ2VyLmluc2VydChPYnNPcmRlckxlYWZNZXJrbGVUcmVlTm9kZSwge1xuICAgICAgICAgIGxlYWZJZDogbGVhZl9pZCxcbiAgICAgICAgICBpZDogaWQudG9TdHJpbmcoKSxcbiAgICAgICAgICBoYXNoOiBCaWdJbnQoaGFzaCksXG4gICAgICAgIH0pO1xuICAgICAgICBhd2FpdCBtYW5hZ2VyLmluc2VydChPYnNPcmRlckxlYWZFbnRpdHksIHtcbiAgICAgICAgICBvcmRlckxlYWZJZDogbGVhZl9pZCxcbiAgICAgICAgfSlcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXMub2JzT3JkZXJMZWFmUmVwb3NpdG9yeS5maW5kT25lQnkoe1xuICAgICAgICBvcmRlckxlYWZJZDogbGVhZl9pZFxuICAgICAgfSk7IFxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIGFzeW5jIGdldFJvb3QoKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5vYnNPcmRlck1lcmtsZVRyZWVSZXBvc2l0b3J5LmZpbmRPbmUoe1xuICAgICAgd2hlcmU6IHtcbiAgICAgICAgaWQ6IDFuLnRvU3RyaW5nKCksXG4gICAgICB9ICAgICAgIFxuICAgIH0pO1xuICAgIGlmIChyZXN1bHQgPT0gbnVsbCkge1xuICAgICAgY29uc3QgaGFzaCA9IGF3YWl0IHRoaXMuZ2V0RGVmYXVsdEhhc2hCeUxldmVsKDEpO1xuICAgICAgYXdhaXQgdGhpcy5vYnNPcmRlck1lcmtsZVRyZWVSZXBvc2l0b3J5Lmluc2VydCh7XG4gICAgICAgIGlkOiAxbi50b1N0cmluZygpLFxuICAgICAgICBoYXNoOiBCaWdJbnQoaGFzaCksXG4gICAgICB9KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlkOiAxbi50b1N0cmluZygpLFxuICAgICAgICBoYXNoOiBoYXNoXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBpZDogcmVzdWx0LmlkLFxuICAgICAgaGFzaDogcmVzdWx0Lmhhc2gudG9TdHJpbmcoKVxuICAgIH07XG4gIH1cbiAgZ2V0TGVhZkRlZmF1bHRWYXZsdWUoKTogc3RyaW5nIHtcbiAgICAvLyBUT0RPOiBAYWJuZXIgcGxlYXNlIGhlbHAgbWUgdG8gY2hlY2sgaXMgdGhlIG9yZGVyIGlzIHJpZ2h0P1xuICAgIHJldHVybiB0b1RyZWVMZWFmKFtcbiAgICAgIDBuLCAvLyB0eElkXG4gICAgICAwbiwgLy8gcmVxVHlwZVxuICAgICAgMG4sIC8vIHNlbmRlclxuICAgICAgMG4sIC8vIHNlbGxUb2tlbklkXG4gICAgICAwbiwgLy8gc2VsbEFtdFxuICAgICAgMG4sIC8vIG5vbmNlXG4gICAgICAwbiwgLy8gYnV5VG9rZW5JZFxuICAgICAgMG4sIC8vIGJ1eUFtdFxuICAgICAgMG4sIC8vIGFjY3VtdWxhdGVkU2VsbEFtdFxuICAgICAgMG4sIC8vIGFjY3VtdWxhdGVkQnV5QW10XG4gICAgICAwbiwgLy8gb3JkZXJJZFxuICAgIF0pO1xuICB9XG59IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwidHlwZW9ybVwiKTs7IiwiaW1wb3J0IHsgQnl0ZXNMaWtlIH0gZnJvbSAnZXRoZXJzJztcbmltcG9ydCB7IGRwUG9zZWlkb25IYXNoIH0gZnJvbSAnLi9wb3NlaWRlbi1oYXNoLWRwJztcblxuZXhwb3J0IGZ1bmN0aW9uIGJpZ2ludF90b19oZXgoeDogYmlnaW50KSB7XG4gIHJldHVybiAnMHgnICsgeC50b1N0cmluZygxNik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b1RyZWVMZWFmKGlucHV0czogYmlnaW50W10pIHtcbiAgcmV0dXJuIGJpZ2ludF90b19oZXgoZHBQb3NlaWRvbkhhc2goaW5wdXRzKSk7XG59XG5cbmZ1bmN0aW9uIHBvc2VpZG9uSGFzaCh2YWwgOiBCeXRlc0xpa2UgfCBCeXRlc0xpa2VbXSk6IHN0cmluZyB7XG4gIGlmICh2YWwgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgIGNvbnN0IGlucHV0cyA9IHZhbC5tYXAoKHYgOiBhbnkpID0+IEJpZ0ludCh2KSk7XG4gICAgcmV0dXJuIGJpZ2ludF90b19oZXgoZHBQb3NlaWRvbkhhc2goaW5wdXRzKSk7XG4gIH1cblxuICByZXR1cm4gIGJpZ2ludF90b19oZXgoZHBQb3NlaWRvbkhhc2goW0JpZ0ludCh2YWwudG9TdHJpbmcoKSldKSk7XG59XG5cbmV4cG9ydCBjb25zdCB0c0hhc2hGdW5jID0gcG9zZWlkb25IYXNoO1xuIiwiaW1wb3J0IHtwb3NlaWRvbn0gZnJvbSAnQGJpZy13aGFsZS1sYWJzL3Bvc2VpZG9uJztcblxuY2xhc3MgZHBQb3NlaWRvbkNhY2hlIHtcbiAgc3RhdGljIGNhY2hlID0gbmV3IE1hcCgpO1xuXG4gIHN0YXRpYyBnZXRDYWNoZSh4IDogYmlnaW50IHwgc3RyaW5nIHwgYmlnaW50W10pOiBudWxsIHwgYmlnaW50IHtcbiAgICBpZiAoeCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICBjb25zdCBrZXkgPSB4LmpvaW4oKTtcbiAgICAgIHJldHVybiBkcFBvc2VpZG9uQ2FjaGUuZ2V0Q2FjaGUoa2V5KTtcbiAgICB9XG5cbiAgICByZXR1cm4gZHBQb3NlaWRvbkNhY2hlXG4gICAgICAuY2FjaGVcbiAgICAgIC5nZXQoeCk7XG4gIH1cblxuICBzdGF0aWMgc2V0Q2FjaGUoeCA6IGJpZ2ludCB8IHN0cmluZyB8IGJpZ2ludFtdLCB2IDogYmlnaW50KSB7XG4gICAgaWYgKHggaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgY29uc3Qga2V5ID0geC5qb2luKCk7XG4gICAgICBkcFBvc2VpZG9uQ2FjaGUuc2V0Q2FjaGUoa2V5LCB2KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBkcFBvc2VpZG9uQ2FjaGVcbiAgICAgIC5jYWNoZVxuICAgICAgLnNldCh4LCB2KTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZHBQb3NlaWRvbkhhc2goaW5wdXRzIDogYmlnaW50W10sIGlzRHBFbmFibGVkID0gdHJ1ZSk6IGJpZ2ludCB7XG4gIGlmIChpc0RwRW5hYmxlZCkge1xuICAgIGNvbnN0IGNhY2hlID0gZHBQb3NlaWRvbkNhY2hlLmdldENhY2hlKGlucHV0cyk7XG4gICAgaWYgKGNhY2hlKSB7XG4gICAgICByZXR1cm4gY2FjaGU7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgcmVzID0gcG9zZWlkb24oaW5wdXRzKTtcbiAgaWYgKGlzRHBFbmFibGVkKSB7XG4gICAgZHBQb3NlaWRvbkNhY2hlLnNldENhY2hlKGlucHV0cywgcmVzKTtcbiAgfVxuICByZXR1cm4gcmVzO1xufSIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIkBiaWctd2hhbGUtbGFicy9wb3NlaWRvblwiKTs7IiwiaW1wb3J0IHsgQnl0ZXNMaWtlIH0gZnJvbSAnZXRoZXJzJztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFRzTWVya2xlVHJlZTxUPiB7XG4gIC8vIHRyZWVIZWlnaHQgZm9yIGV4dGVuZFxuICBwcml2YXRlIHRyZWVIZWlndCE6IG51bWJlcjtcbiAgcHJpdmF0ZSBsYXN0TGV2ZWwhOiBudW1iZXI7XG4gIHByaXZhdGUgbGV2ZWxzRGVmYXVsdEhhc2ghOiBNYXA8bnVtYmVyLCBzdHJpbmc+O1xuICBwdWJsaWMgaGFzaEZ1bmMhOiAoeDogQnl0ZXNMaWtlfCBCeXRlc0xpa2VbXSkgPT4gc3RyaW5nO1xuICBjb25zdHJ1Y3Rvcih0cmVlSGVpZ2h0OiBudW1iZXIsIGhhc2hGdW5jOiAoKHg6IEJ5dGVzTGlrZXwgQnl0ZXNMaWtlW10pID0+IHN0cmluZykpIHtcbiAgICB0aGlzLnRyZWVIZWlndCA9IE51bWJlcih0cmVlSGVpZ2h0KTtcbiAgICB0aGlzLmhhc2hGdW5jID0gaGFzaEZ1bmM7XG4gICAgdGhpcy5sYXN0TGV2ZWwgPSBOdW1iZXIodGhpcy50cmVlSGVpZ3QpO1xuICAgIHRoaXMuc2V0TGV2ZWxEZWZhdWx0SGFzaCgpO1xuICB9XG4gIGFic3RyYWN0IGdldExlYWZEZWZhdWx0VmF2bHVlKCk6IHN0cmluZztcbiAgYWJzdHJhY3QgdXBkYXRlTGVhZihsZWFmSWQ6IGJpZ2ludCwgdmFsdWU6IGFueSwgb3RoZXJQYXlsb2FkOiBhbnkpOiB2b2lkO1xuICBhYnN0cmFjdCBnZXRMZWFmKGxlYWZfaWQ6IGJpZ2ludCwgb3RoZXJQYXlsb2FkOiBhbnkpOiBQcm9taXNlPFR8bnVsbD47XG4gIGdldFByb29mSWRzKGxlYWZfaWQ6IGJpZ2ludCkge1xuICAgIGNvbnN0IHByZjogYmlnaW50W10gPSBbXTtcbiAgICBjb25zdCBoZWlnaHQgPSB0aGlzLnRyZWVIZWlndDtcbiAgICBjb25zdCBsZWFmU3RhcnQgPSBsZWFmX2lkICsgKDFuIDw8ICBCaWdJbnQoaGVpZ2h0KSk7XG4gICAgZm9yIChsZXQgaSA9IGxlYWZTdGFydDsgaSA+IDFuOyBpID0gaSA+PiAxbikge1xuICAgICAgaWYgKCBpICUgMm4gPT0gMG4pIHtcbiAgICAgICAgcHJmLnB1c2goaSArIDFuKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByZi5wdXNoKGkgLSAxbik7XG4gICAgICB9IFxuICAgIH1cbiAgICByZXR1cm4gcHJmO1xuICB9XG4gIGFic3RyYWN0IGdldFJvb3Qob3RoZXJQYXlsb2FkOiBhbnkpOiBhbnk7IFxuICAvKipcbiAgICogY2FsY3VsYXRlIGxldmVscyBkZWZhdWx0IEhhc2hcbiAgICovXG4gIHNldExldmVsRGVmYXVsdEhhc2goKSB7XG4gICAgdGhpcy5sZXZlbHNEZWZhdWx0SGFzaCA9IG5ldyBNYXA8bnVtYmVyLCBzdHJpbmc+KCk7XG4gICAgdGhpcy5sZXZlbHNEZWZhdWx0SGFzaC5zZXQodGhpcy5sYXN0TGV2ZWwsIHRoaXMuZ2V0TGVhZkRlZmF1bHRWYXZsdWUoKSk7XG4gICAgZm9yKGxldCBsZXZlbCA9IHRoaXMubGFzdExldmVsLTE7IGxldmVsID49IDAgOyBsZXZlbC0tKSB7XG4gICAgICBjb25zdCBwcmV2TGV2ZWxIYXNoID0gdGhpcy5sZXZlbHNEZWZhdWx0SGFzaC5nZXQobGV2ZWwrMSk7XG4gICAgICBpZiAocHJldkxldmVsSGFzaCAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5sZXZlbHNEZWZhdWx0SGFzaC5zZXQobGV2ZWwsIHRoaXMuaGFzaEZ1bmMoW3ByZXZMZXZlbEhhc2gsIHByZXZMZXZlbEhhc2hdKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGdldExlYWZJZEluVHJlZShsZWFmSWQ6IGJpZ2ludCkge1xuICAgIHJldHVybiBsZWFmSWQgKyAoMW4gPDwgQmlnSW50KHRoaXMudHJlZUhlaWd0KSk7XG4gIH1cbiAgZ2V0TGFzdExldmVsKCkge1xuICAgIHJldHVybiB0aGlzLmxhc3RMZXZlbDtcbiAgfVxuICBnZXREZWZhdWx0SGFzaEJ5TGV2ZWwobGV2ZWw6IG51bWJlcik6c3RyaW5nIHtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLmxldmVsc0RlZmF1bHRIYXNoLmdldChsZXZlbCk7XG4gICAgcmV0dXJuIHJlc3VsdD8gcmVzdWx0IDogJyc7XG4gIH1cbn0iLCJpbXBvcnQgeyBDb2x1bW4sIEVudGl0eSwgSm9pbkNvbHVtbiwgT25lVG9PbmUsIFByaW1hcnlDb2x1bW4sIFByaW1hcnlHZW5lcmF0ZWRDb2x1bW4gfSBmcm9tICd0eXBlb3JtJztcbmltcG9ydCB7IFRzVHhUeXBlIH0gZnJvbSAnLi4vYWNjb3VudC9kdG8vdHMtdHlwZSc7XG5pbXBvcnQgeyBPYnNPcmRlckVudGl0eSB9IGZyb20gJy4vb2JzT3JkZXIuZW50aXR5JztcbmltcG9ydCB7IE9ic09yZGVyTGVhZk1lcmtsZVRyZWVOb2RlIH0gZnJvbSAnLi9vYnNPcmRlckxlYWZNZXJrbGVUcmVlTm9kZS5lbnRpdHknO1xuXG5ARW50aXR5KCdPYnNPcmRlckxlYWYnLCB7IHNjaGVtYTogJ3B1YmxpYycgfSlcbmV4cG9ydCBjbGFzcyBPYnNPcmRlckxlYWZFbnRpdHkge1xuICBAUHJpbWFyeUNvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdvcmRlckxlYWZJZCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMG4sXG4gIH0pXG4gIG9yZGVyTGVhZklkITogYmlnaW50O1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnaW50OCcsXG4gICAgbmFtZTogJ3R4SWQnLFxuICAgIG51bGxhYmxlOiB0cnVlLFxuICB9KVxuICB0eElkITogbnVtYmVyIHwgbnVsbDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2ludGVnZXInLFxuICAgIG5hbWU6ICdyZXFUeXBlJyxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMCxcbiAgfSlcbiAgcmVxVHlwZSE6IG51bWJlcjtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdzZW5kZXInLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDBuLFxuICB9KVxuICBzZW5kZXIhOiBiaWdpbnQ7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnc2VsbFRva2VuSWQnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDBuLFxuICB9KVxuICBzZWxsVG9rZW5JZCE6IGJpZ2ludDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdzZWxsQW10JyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgc2VsbEFtdCE6IGJpZ2ludDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdub25jZScsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMG4sXG4gIH0pXG4gIG5vbmNlITogYmlnaW50O1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ2J1eVRva2VuSWQnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDBuLFxuICB9KVxuICBidXlUb2tlbklkITogYmlnaW50O1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ2J1eUFtdCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMG4sXG4gIH0pXG4gIGJ1eUFtdCE6IGJpZ2ludDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdhY2N1bXVsYXRlZFNlbGxBbXQnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDBuLFxuICB9KVxuICBhY2N1bXVsYXRlZFNlbGxBbXQhOiBiaWdpbnQ7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnYWNjdW11bGF0ZWRCdXlBbXQnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDBuLFxuICB9KVxuICBhY2N1bXVsYXRlZEJ1eUFtdCE6IGJpZ2ludDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2ludDgnLFxuICAgIG5hbWU6ICdvcmRlcklkJyxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMCxcbiAgfSlcbiAgb3JkZXJJZCE6IG51bWJlcjtcbiAgQE9uZVRvT25lKCgpID0+IE9ic09yZGVyRW50aXR5LCAob2JzT3JkZXIpID0+IG9ic09yZGVyLm9ic09yZGVyTGVhZiwge1xuICAgIG9uRGVsZXRlOiAnUkVTVFJJQ1QnLFxuICAgIG9uVXBkYXRlOiAnQ0FTQ0FERScsXG4gIH0pXG4gIEBKb2luQ29sdW1uKHtcbiAgICBuYW1lOiAnb3JkZXJJZCcsXG4gICAgcmVmZXJlbmNlZENvbHVtbk5hbWU6ICdpZCcsXG4gIH0pXG4gIG9ic09yZGVyITogT2JzT3JkZXJFbnRpdHk7XG4gIEBPbmVUb09uZSgoKSA9PiBPYnNPcmRlckxlYWZNZXJrbGVUcmVlTm9kZSwgKG9ic09yZGVyTGVhZk1lcmtsZVRyZWVOb2RlOiBPYnNPcmRlckxlYWZNZXJrbGVUcmVlTm9kZSkgPT4gb2JzT3JkZXJMZWFmTWVya2xlVHJlZU5vZGUubGVhZiwge1xuICAgIG9uRGVsZXRlOiAnUkVTVFJJQ1QnLFxuICAgIG9uVXBkYXRlOiAnQ0FTQ0FERScsXG4gIH0pXG4gIEBKb2luQ29sdW1uKHtcbiAgICBuYW1lOiAnb3JkZXJMZWFmSWQnLFxuICAgIHJlZmVyZW5jZWRDb2x1bW5OYW1lOiAnbGVhZklkJyxcbiAgfSlcbiAgbWVya2xlVHJlZU5vZGUhOiBPYnNPcmRlckxlYWZNZXJrbGVUcmVlTm9kZTtcbn1cbiIsImltcG9ydCB7IG1hdGNoRSB9IGZyb20gJ2ZwLXRzL2xpYi9JT0VpdGhlcic7XG5pbXBvcnQgeyBDb2x1bW4sIEVudGl0eSwgSm9pbkNvbHVtbiwgTWFueVRvT25lLCBPbmVUb01hbnksIE9uZVRvT25lLCBQcmltYXJ5R2VuZXJhdGVkQ29sdW1uIH0gZnJvbSAndHlwZW9ybSc7XG5pbXBvcnQgeyBBY2NvdW50SW5mb3JtYXRpb24gfSBmcm9tICcuLi9hY2NvdW50L2FjY291bnRJbmZvcm1hdGlvbi5lbnRpdHknO1xuaW1wb3J0IHsgVHNUeFR5cGUgfSBmcm9tICcuLi9hY2NvdW50L2R0by90cy10eXBlJztcbmltcG9ydCB7IE1hdGNoT2JzT3JkZXJFbnRpdHkgfSBmcm9tICcuL21hdGNoT2JzT3JkZXIuZW50aXR5JztcbmltcG9ydCB7IE9ic09yZGVyTGVhZkVudGl0eSB9IGZyb20gJy4vb2JzT3JkZXJMZWFmLmVudGl0eSc7XG5pbXBvcnQgeyBUc1NpZGUgfSBmcm9tICcuL3RzU2lkZS5lbnVtJztcblxuQEVudGl0eSgnT2JzT3JkZXInLCB7IHNjaGVtYTogJ3B1YmxpYyd9KVxuZXhwb3J0IGNsYXNzIE9ic09yZGVyRW50aXR5IHtcbiAgQFByaW1hcnlHZW5lcmF0ZWRDb2x1bW4oe1xuICAgIHR5cGU6ICdpbnQ4JyxcbiAgICBuYW1lOiAnaWQnLFxuICB9KVxuICBpZCE6IG51bWJlcjtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2VudW0nLFxuICAgIG5hbWU6ICdzaWRlJyxcbiAgICBlbnVtTmFtZTogJ1NJREUnLFxuICAgIGVudW06IFtcbiAgICAgIFRzU2lkZS5CVVksXG4gICAgICBUc1NpZGUuU0VMTCxcbiAgICBdLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAoKSA9PiBgXFwnJHtUc1NpZGUuQlVZfVxcJ2AsXG4gIH0pXG4gIHNpZGUhOiBUc1NpZGU7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdpbnQ4JyxcbiAgICBuYW1lOiAndHhJZCcsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDAsXG4gIH0pXG4gIHR4SWQhOiBudW1iZXI7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICBuYW1lOiAncmVxVHlwZScsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDAsXG4gIH0pXG4gIHJlcVR5cGUhOiBudW1iZXI7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnYWNjb3VudElkJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgYWNjb3VudElkITogYmlnaW50O1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndmFyY2hhcicsXG4gICAgbmFtZTogJ21hcmtldFBhaXInLFxuICAgIGxlbmd0aDogMTAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiBgJ0VUSC9VU0RDJ2AsXG4gIH0pXG4gIG1hcmtldFBhaXIhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAncHJpY2UnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDgsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDBuLFxuICB9KVxuICBwcmljZSE6IHN0cmluZztcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2ludGVnZXInLFxuICAgIG5hbWU6ICdvcmRlclN0YXR1cycsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDEsIC8vIHBlbmRpbmc9MSwgY2FuY2VsZWQ9MiwgbWF0Y2hlZD0zXG4gIH0pXG4gIG9yZGVyU3RhdHVzITogbnVtYmVyO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ21haW5RdHknLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDBuLFxuICB9KVxuICBtYWluUXR5ITogYmlnaW50O1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ2Jhc2VRdHknLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDBuLFxuICB9KVxuICBiYXNlUXR5ITogYmlnaW50O1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ3JlbWFpbk1haW5RdHknLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDBuLFxuICB9KVxuICByZW1haW5NYWluUXR5ITogYmlnaW50O1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ3JlbWFpbkJhc2VRdHknLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDBuLFxuICB9KVxuICByZW1haW5CYXNlUXR5ITogYmlnaW50O1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ2FjY3VtdWxhdGVkTWFpblF0eScsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMG4sXG4gIH0pXG4gIGFjY3VtdWxhdGVkTWFpblF0eSE6IGJpZ2ludDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdhY2N1bXVsYXRlZEJhc2VRdHknLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDBuLFxuICB9KVxuICBhY2N1bXVsYXRlZEJhc2VRdHkhOiBiaWdpbnQ7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnbWFpblRva2VuSWQnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDAsXG4gIH0pXG4gIG1haW5Ub2tlbklkITogYmlnaW50O1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ2Jhc2VUb2tlbklkJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwLFxuICB9KVxuICBiYXNlVG9rZW5JZCE6IGJpZ2ludDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ3RpbWVzdGFtcCB3aXRob3V0IHRpbWUgem9uZScsXG4gICAgbmFtZTogJ3RpbWVzdGFtcCcsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIHByZWNpc2lvbjogMyxcbiAgICBkZWZhdWx0OiAoKSA9PiBgbm93KClgLFxuICB9KVxuICB0aW1lc3RhbXAhOiBEYXRlO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgbmFtZTogJ2lzTWFrZXInLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiBmYWxzZSwgXG4gIH0pXG4gIGlzTWFrZXIhOiBib29sZWFuO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnaW50OCcsXG4gICAgbmFtZTogJ29yZGVyTGVhZklkJyxcbiAgICBudWxsYWJsZTogdHJ1ZSxcbiAgICB1bmlxdWU6IHRydWUsXG4gIH0pXG4gIG9yZGVyTGVhZklkITogbnVtYmVyIHwgbnVsbDtcbiAgQE9uZVRvT25lKFxuICAgICgpID0+IE9ic09yZGVyTGVhZkVudGl0eSxcbiAgICAob2JzT3JkZXI6IE9ic09yZGVyTGVhZkVudGl0eSApID0+IG9ic09yZGVyLm9ic09yZGVyLFxuICApXG4gIEBKb2luQ29sdW1uKHtcbiAgICBuYW1lOiAnaWQnLFxuICAgIHJlZmVyZW5jZWRDb2x1bW5OYW1lOiAnb3JkZXJJZCdcbiAgfSlcbiAgb2JzT3JkZXJMZWFmITogT2JzT3JkZXJMZWFmRW50aXR5O1xuICBAT25lVG9NYW55KFxuICAgICgpID0+IE1hdGNoT2JzT3JkZXJFbnRpdHksXG4gICAgKG1hdGNoT3JkZXJzOiBNYXRjaE9ic09yZGVyRW50aXR5KSA9PiBtYXRjaE9yZGVycy5tYXJrZXRQYWlyXG4gIClcbiAgQEpvaW5Db2x1bW4oe1xuICAgIG5hbWU6ICdpZCcsXG4gICAgcmVmZXJlbmNlZENvbHVtbk5hbWU6ICdyZWZlcmVuY2VPcmRlcidcbiAgfSlcbiAgbWF0Y2hPcmRlcnMhOiBNYXRjaE9ic09yZGVyRW50aXR5W107XG4gIEBNYW55VG9PbmUoXG4gICAgKCkgPT4gQWNjb3VudEluZm9ybWF0aW9uLFxuICAgIChhY2NvdW50SW5mbzogQWNjb3VudEluZm9ybWF0aW9uKSA9PiBhY2NvdW50SW5mby5vYnNPcmRlcnMsXG4gICAge1xuICAgICAgb25EZWxldGU6ICdSRVNUUklDVCcsXG4gICAgICBvblVwZGF0ZTogJ0NBU0NBREUnXG4gICAgfVxuICApXG4gIEBKb2luQ29sdW1uKHtcbiAgICBuYW1lOiAnYWNjb3VudElkJyxcbiAgICByZWZlcmVuY2VkQ29sdW1uTmFtZTogJ2FjY291bnRJZCdcbiAgfSlcbiAgYWNjb3VudEluZm8hOiBBY2NvdW50SW5mb3JtYXRpb247IFxufSIsImltcG9ydCB7IENvbHVtbiwgRW50aXR5LCBKb2luQ29sdW1uLCBPbmVUb01hbnksIE9uZVRvT25lLCBQcmltYXJ5Q29sdW1uIH0gZnJvbSAndHlwZW9ybSc7XG4vLyBpbXBvcnQgeyBBdWN0aW9uT3JkZXJMZWFmTm9kZSB9IGZyb20gJy4uL2F1Y3Rpb25PcmRlci9hdWN0aW9uT3JkZXJMZWFmTm9kZS5lbnRpdHknO1xuaW1wb3J0IHsgT2JzT3JkZXJFbnRpdHkgfSBmcm9tICcuLi9hdWN0aW9uT3JkZXIvb2JzT3JkZXIuZW50aXR5JztcbmltcG9ydCB7IEJhc2VUaW1lRW50aXR5IH0gZnJvbSAnLi4vY29tbW9uL2Jhc2VUaW1lRW50aXR5JztcbmltcG9ydCB7IEFjY291bnRNZXJrbGVUcmVlTm9kZSB9IGZyb20gJy4vYWNjb3VudE1lcmtsZVRyZWVOb2RlLmVudGl0eSc7XG5pbXBvcnQgeyBSb2xlIH0gZnJvbSAnLi9yb2xlLmVudW0nO1xuaW1wb3J0IHsgVHJhbnNhY3Rpb25JbmZvIH0gZnJvbSAnLi90cmFuc2FjdGlvbkluZm8uZW50aXR5JztcblxuQEVudGl0eSgnQWNjb3VudEluZm9ybWF0aW9uJywgeyBzY2hlbWE6ICdwdWJsaWMnIH0pXG5leHBvcnQgY2xhc3MgQWNjb3VudEluZm9ybWF0aW9uIGV4dGVuZHMgQmFzZVRpbWVFbnRpdHkge1xuICBAUHJpbWFyeUNvbHVtbih7XG4gICAgdHlwZTogJ3ZhcmNoYXInLFxuICAgIG5hbWU6ICdMMUFkZHJlc3MnLFxuICAgIGxlbmd0aDogMjU2LFxuICAgIHByaW1hcnk6IHRydWUsXG4gIH0pXG4gIEwxQWRkcmVzcyE6IHN0cmluZztcblxuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ2FjY291bnRJZCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gIH0pXG4gIGFjY291bnRJZCE6IHN0cmluZztcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ3ZhcmNoYXInLFxuICAgIG5hbWU6ICdlbWFpbCcsXG4gICAgbGVuZ3RoOiAyNTYsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIHVuaXF1ZTogdHJ1ZSxcbiAgfSlcbiAgZW1haWwhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICd2YXJjaGFyJyxcbiAgICBuYW1lOiAnbGFzdGVkTG9naW5JcCcsXG4gICAgbGVuZ3RoOiAyNTYsXG4gICAgbnVsbGFibGU6IHRydWUsXG4gICAgZGVmYXVsdDogbnVsbCxcbiAgfSlcbiAgbGFzdGVkTG9naW5JcCE6IHN0cmluZyB8IG51bGw7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICd0aW1lc3RhbXAgd2l0aG91dCB0aW1lIHpvbmUnLFxuICAgIG5hbWU6ICdsYXN0TG9naW5UaW1lJyxcbiAgICBudWxsYWJsZTogdHJ1ZSxcbiAgfSlcbiAgbGFzdExvZ2luVGltZSE6IERhdGUgfCBudWxsO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZW51bScsXG4gICAgbmFtZTogJ3JvbGUnLFxuICAgIGVudW1OYW1lOiAnUm9sZScsXG4gICAgZW51bTogW1JvbGUuQURNSU4sIFJvbGUuTUVNQkVSLCBSb2xlLk9QRVJBVE9SXSxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogUm9sZS5NRU1CRVIsXG4gIH0pXG4gIHJvbGUhOiBSb2xlO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndmFyY2hhcicsXG4gICAgbmFtZTogJ3Bhc3N3b3JkJyxcbiAgICBsZW5ndGg6IDMwMCxcbiAgICBudWxsYWJsZTogdHJ1ZSxcbiAgfSlcbiAgcGFzc3dvcmQhOiBzdHJpbmcgfCBudWxsO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndmFyY2hhcicsXG4gICAgbmFtZTogJ3JlZnJlc2hUb2tlbicsXG4gICAgbGVuZ3RoOiA0MDAsXG4gICAgbnVsbGFibGU6IHRydWUsXG4gIH0pXG4gIHJlZnJlc2hUb2tlbiE6IHN0cmluZyB8IG51bGw7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdqc29uYicsXG4gICAgbmFtZTogJ2xhYmVsJyxcbiAgICBudWxsYWJsZTogdHJ1ZSxcbiAgICBkZWZhdWx0OiAoKSA9PiAnXFwne31cXCcnLFxuICB9KVxuICBsYWJlbCE6IG9iamVjdDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ3ZhcmNoYXInLFxuICAgIG5hbWU6ICdsYWJlbEJ5JyxcbiAgICBsZW5ndGg6IDI1NixcbiAgICBudWxsYWJsZTogdHJ1ZSxcbiAgfSlcbiAgbGFiZWxCeSE6IHN0cmluZyB8IG51bGw7XG5cbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ3ZhcmNoYXInLFxuICAgIG5hbWU6ICd0c1B1YktleVgnLFxuICAgIGxlbmd0aDogJzEwMCcsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6ICdcXCcwXFwnJyxcbiAgfSlcbiAgdHNQdWJLZXlYITogc3RyaW5nO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndmFyY2hhcicsXG4gICAgbmFtZTogJ3RzUHViS2V5WScsXG4gICAgbGVuZ3RoOiAnMTAwJyxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogJ1xcJzBcXCcnLFxuICB9KVxuICB0c1B1YktleVkhOiBzdHJpbmc7XG4gIC8vIHJlbGF0aW9uc1xuICBAT25lVG9PbmUoKCkgPT4gQWNjb3VudE1lcmtsZVRyZWVOb2RlLCAoYWNjb3VudE1lcmtsZVRyZWVOb2RlOiBBY2NvdW50TWVya2xlVHJlZU5vZGUpID0+IGFjY291bnRNZXJrbGVUcmVlTm9kZS5sZWFmKVxuICBhY2NvdW50TWVya2xlVHJlZU5vZGUhOiBBY2NvdW50TWVya2xlVHJlZU5vZGU7XG4gIC8vIEBPbmVUb01hbnkoXG4gIC8vICAgKCkgPT4gQXVjdGlvbk9yZGVyTGVhZk5vZGUsXG4gIC8vICAgKGF1Y3Rpb25PcmRlckxlYWZOb2RlOkF1Y3Rpb25PcmRlckxlYWZOb2RlKSA9PiBhdWN0aW9uT3JkZXJMZWFmTm9kZS5MMkFkZHJGcm9tQWNjb3VudFxuICAvLyApXG4gIC8vIGZyb21BdWN0aW9uT3JkZXJMZWFmTm9kZXMhOiBBdWN0aW9uT3JkZXJMZWFmTm9kZVtdO1xuICAvLyBAT25lVG9NYW55KFxuICAvLyAgICgpID0+IEF1Y3Rpb25PcmRlckxlYWZOb2RlLFxuICAvLyAgIChhdWN0aW9uT3JkZXJMZWFmTm9kZTpBdWN0aW9uT3JkZXJMZWFmTm9kZSkgPT4gYXVjdGlvbk9yZGVyTGVhZk5vZGUuTDJBZGRyVG9BY2NvdW50XG4gIC8vIClcbiAgLy8gdG9BdWN0aW9uT3JkZXJMZWFmTm9kZXMhOiBBdWN0aW9uT3JkZXJMZWFmTm9kZVtdO1xuICBAT25lVG9NYW55KCgpID0+IFRyYW5zYWN0aW9uSW5mbywgKHRyYW5zYWN0aW9uSW5mbzogVHJhbnNhY3Rpb25JbmZvKSA9PiB0cmFuc2FjdGlvbkluZm8uTDJBY2NvdW50SW5mbylcbiAgdHJhbnNhY3Rpb25JbmZvcyE6IFRyYW5zYWN0aW9uSW5mb1tdO1xuICBAT25lVG9NYW55KCgpID0+IE9ic09yZGVyRW50aXR5LCAob2JzT3JkZXI6IE9ic09yZGVyRW50aXR5KSA9PiBvYnNPcmRlci5hY2NvdW50SW5mbylcbiAgQEpvaW5Db2x1bW4oe1xuICAgIG5hbWU6ICdhY2NvdW50SWQnLFxuICAgIHJlZmVyZW5jZWRDb2x1bW5OYW1lOiAnYWNjb3VudElkJyxcbiAgfSlcbiAgb2JzT3JkZXJzITogT2JzT3JkZXJFbnRpdHlbXSB8IG51bGw7XG59XG4iLCJpbXBvcnQgeyBDb2x1bW4sIENyZWF0ZURhdGVDb2x1bW4sIERlbGV0ZURhdGVDb2x1bW4sIFVwZGF0ZURhdGVDb2x1bW4gfSBmcm9tICd0eXBlb3JtJztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJhc2VUaW1lRW50aXR5IHtcbiAgQENyZWF0ZURhdGVDb2x1bW4oe1xuICAgIHR5cGU6ICd0aW1lc3RhbXAgd2l0aG91dCB0aW1lIHpvbmUnLFxuICAgIG5hbWU6ICdjcmVhdGVkQXQnLFxuICAgIGRlZmF1bHQ6ICgpID0+ICdub3coKScsXG4gIH0pXG4gIGNyZWF0ZWRBdCE6IERhdGU7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICd2YXJjaGFyJyxcbiAgICBuYW1lOiAnY3JlYXRlZEJ5JyxcbiAgICBsZW5ndGg6IDMwMCxcbiAgICBudWxsYWJsZTogdHJ1ZSxcbiAgfSlcbiAgY3JlYXRlZEJ5ITogc3RyaW5nIHwgbnVsbDtcbiAgQFVwZGF0ZURhdGVDb2x1bW4oe1xuICAgIHR5cGU6ICd0aW1lc3RhbXAgd2l0aG91dCB0aW1lIHpvbmUnLFxuICAgIG5hbWU6ICd1cGRhdGVkQXQnLFxuICAgIGRlZmF1bHQ6ICgpID0+ICdub3coKScsXG4gIH0pXG4gIHVwZGF0ZWRBdCE6IERhdGU7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICd2YXJjaGFyJyxcbiAgICBuYW1lOiAndXBkYXRlZEJ5JywgIFxuICAgIGxlbmd0aDogMzAwLCAgXG4gICAgbnVsbGFibGU6IHRydWUsXG4gIH0pXG4gIHVwZGF0ZWRCeSE6IHN0cmluZyB8IG51bGw7IFxuICBARGVsZXRlRGF0ZUNvbHVtbih7XG4gICAgdHlwZTogJ3RpbWVzdGFtcCB3aXRob3V0IHRpbWUgem9uZScsXG4gICAgbmFtZTogJ2RlbGV0ZWRBdCcsXG4gICAgbnVsbGFibGU6IHRydWUsXG4gIH0pXG4gIGRlbGV0ZWRBdCE6IERhdGUgfCBudWxsO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndmFyY2hhcicsIFxuICAgIG5hbWU6ICdkZWxldGVkQnknLFxuICAgIGxlbmd0aDogMzAwLFxuICAgIG51bGxhYmxlOiB0cnVlLFxuICB9KVxuICBkZWxldGVkQnkhOiBzdHJpbmcgfCBudWxsO1xufSIsImltcG9ydCB7IENvbHVtbiwgRW50aXR5LCBKb2luQ29sdW1uLCBPbmVUb01hbnksIE9uZVRvT25lLCBQcmltYXJ5Q29sdW1uIH0gZnJvbSAndHlwZW9ybSc7XG5pbXBvcnQgeyBBY2NvdW50SW5mb3JtYXRpb24gfSBmcm9tICcuL2FjY291bnRJbmZvcm1hdGlvbi5lbnRpdHknO1xuaW1wb3J0IHsgQWNjb3VudExlYWZOb2RlIH0gZnJvbSAnLi9hY2NvdW50TGVhZk5vZGUuZW50aXR5JztcbmltcG9ydCB7IFRva2VuTWVya2xlVHJlZU5vZGUgfSBmcm9tICcuL3Rva2VuTWVya2xlVHJlZU5vZGUuZW50aXR5JztcblxuQEVudGl0eSgnQWNjb3VudE1lcmtsZVRyZWVOb2RlJywgeyBzY2hlbWE6ICdwdWJsaWMnfSlcbmV4cG9ydCBjbGFzcyBBY2NvdW50TWVya2xlVHJlZU5vZGUge1xuICBAUHJpbWFyeUNvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdpZCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBwcmltYXJ5OiB0cnVlLFxuICB9KVxuICBpZCE6IHN0cmluZztcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdoYXNoJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgfSlcbiAgaGFzaCE6IGJpZ2ludDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdsZWFmSWQnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IHRydWUsXG4gIH0pXG4gIGxlYWZJZCE6IGJpZ2ludHxudWxsO1xuICBAT25lVG9PbmUoXG4gICAgKCkgPT4gQWNjb3VudEluZm9ybWF0aW9uLCAvLyBtYXBUeXBlXG4gICAgKGFjY291bnRJbmZvcm1hdGlvbjogQWNjb3VudEluZm9ybWF0aW9uKSA9PiBhY2NvdW50SW5mb3JtYXRpb24uYWNjb3VudE1lcmtsZVRyZWVOb2RlICwgLy8gbWFwIGF0dHJpYnV0ZVxuICAgIHsgb25EZWxldGU6ICdSRVNUUklDVCcsIG9uVXBkYXRlOiAnQ0FTQ0FERScgfSBcbiAgKVxuICBASm9pbkNvbHVtbihbeyBuYW1lOiAnbGVhZklkJywgcmVmZXJlbmNlZENvbHVtbk5hbWU6ICdhY2NvdW50SWQnIH1dKVxuICBsZWFmITogQWNjb3VudEluZm9ybWF0aW9uO1xuICBAT25lVG9NYW55KFxuICAgICgpID0+IFRva2VuTWVya2xlVHJlZU5vZGUsXG4gICAgKHRva2VuTWVya2xlVHJlZU5vZGU6IFRva2VuTWVya2xlVHJlZU5vZGUpID0+IHRva2VuTWVya2xlVHJlZU5vZGUuYWNjb3VudFJvb3RcbiAgKVxuICB0b2tlbk1lcmtsZVRyZWVOb2RlcyE6IFRva2VuTWVya2xlVHJlZU5vZGVbXTtcbiAgQE9uZVRvT25lKFxuICAgICgpID0+ICBBY2NvdW50TGVhZk5vZGUsXG4gICAgKGFjY291bnRMZWFmTm9kZTogQWNjb3VudExlYWZOb2RlKSA9PiBhY2NvdW50TGVhZk5vZGUuYWNjb3VudE1lcmtsZVRyZWVOb2RlXG4gIClcbiAgYWNjb3VudExlYWZOb2RlITogQWNjb3VudExlYWZOb2RlO1xufSIsImltcG9ydCB7IENvbHVtbiwgQ3JlYXRlRGF0ZUNvbHVtbiwgRGVsZXRlRGF0ZUNvbHVtbiwgRW50aXR5LCBKb2luQ29sdW1uLCBPbmVUb09uZSwgUHJpbWFyeUNvbHVtbiwgVXBkYXRlRGF0ZUNvbHVtbiB9IGZyb20gJ3R5cGVvcm0nO1xuaW1wb3J0IHsgQWNjb3VudE1lcmtsZVRyZWVOb2RlIH0gZnJvbSAnLi9hY2NvdW50TWVya2xlVHJlZU5vZGUuZW50aXR5JztcblxuQEVudGl0eSgnQWNjb3VudExlYWZOb2RlJywgeyBzY2hlbWE6ICdwdWJsaWMnfSlcbmV4cG9ydCBjbGFzcyBBY2NvdW50TGVhZk5vZGUge1xuICBAUHJpbWFyeUNvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdsZWFmSWQnLFxuICAgIHByaW1hcnk6IHRydWUsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMFxuICB9KVxuICBsZWFmSWQhOiBzdHJpbmc7IFxuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ3RzQWRkcicsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMG4sXG4gIH0pXG4gIHRzQWRkciE6IGJpZ2ludDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdub25jZScsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMG5cbiAgfSlcbiAgbm9uY2UhOiBiaWdpbnQ7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAndG9rZW5Sb290JyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwblxuICB9KVxuICB0b2tlblJvb3QhOiBiaWdpbnQ7XG4gIC8vIHJlbGF0aW9uc1xuICBAT25lVG9PbmUoXG4gICAgKCkgPT4gQWNjb3VudE1lcmtsZVRyZWVOb2RlLFxuICAgIChhY2NvdW50TWVya2xlVHJlZU5vZGU6QWNjb3VudE1lcmtsZVRyZWVOb2RlKSA9PiBhY2NvdW50TWVya2xlVHJlZU5vZGUuYWNjb3VudExlYWZOb2RlLCBcbiAgICB7IG9uRGVsZXRlOiAnUkVTVFJJQ1QnLCBvblVwZGF0ZTogJ0NBU0NBREUnIH1cbiAgKVxuICBASm9pbkNvbHVtbih7XG4gICAgbmFtZTogJ2xlYWZJZCcsXG4gICAgcmVmZXJlbmNlZENvbHVtbk5hbWU6ICdsZWFmSWQnXG4gIH0pXG4gIGFjY291bnRNZXJrbGVUcmVlTm9kZSE6IEFjY291bnRNZXJrbGVUcmVlTm9kZTtcbn0iLCJpbXBvcnQgeyBDb2x1bW4sIEVudGl0eSwgSm9pbkNvbHVtbiwgTWFueVRvT25lLCBPbmVUb09uZSwgUHJpbWFyeUNvbHVtbiwgVW5pcXVlIH0gZnJvbSAndHlwZW9ybSc7XG5pbXBvcnQgeyBBY2NvdW50TWVya2xlVHJlZU5vZGUgfSBmcm9tICcuL2FjY291bnRNZXJrbGVUcmVlTm9kZS5lbnRpdHknO1xuaW1wb3J0IHsgVG9rZW5MZWFmTm9kZSB9IGZyb20gJy4vdG9rZW5MZWFmTm9kZS5lbnRpdHknO1xuXG5ARW50aXR5KCdUb2tlbk1lcmtsZVRyZWVOb2RlJywgeyBzY2hlbWE6ICdwdWJsaWMnIH0pXG5leHBvcnQgY2xhc3MgVG9rZW5NZXJrbGVUcmVlTm9kZSB7XG4gIEBQcmltYXJ5Q29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ2FjY291bnRJZCcsXG4gICAgcHJpbWFyeTogdHJ1ZSxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICB1bmlxdWU6IGZhbHNlLFxuICB9KVxuICBhY2NvdW50SWQhOiBzdHJpbmc7IC8vIGNvbXBvc2UgcHJpbWFyeSBrZXlcbiAgQFByaW1hcnlDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnaWQnLFxuICAgIHByaW1hcnk6IHRydWUsXG4gICAgcHJlY2lzaW9uOiA4NiwgXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIHVuaXF1ZTogZmFsc2UsXG4gIH0pXG4gIGlkITogc3RyaW5nOyAvLyBjb21wb3NlIHByaW1hcnkga2V5XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnaGFzaCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2VcbiAgfSlcbiAgaGFzaCE6IGJpZ2ludDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdsZWFmSWQnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IHRydWUsXG4gICAgdW5pcXVlOiB0cnVlLFxuICB9KVxuICBsZWFmSWQhOiBzdHJpbmd8bnVsbDtcbiAgLy8gcmVsYXRpb25zXG4gIEBNYW55VG9PbmUoXG4gICAgKCkgPT4gQWNjb3VudE1lcmtsZVRyZWVOb2RlLFxuICAgIChhY2NvdW50TWVya2xlVHJlZU5vZGU6IEFjY291bnRNZXJrbGVUcmVlTm9kZSkgPT4gYWNjb3VudE1lcmtsZVRyZWVOb2RlLnRva2VuTWVya2xlVHJlZU5vZGVzLFxuICAgIHsgb25EZWxldGU6ICdSRVNUUklDVCcsIG9uVXBkYXRlOiAnQ0FTQ0FERScgfVxuICApXG4gIEBKb2luQ29sdW1uKHsgbmFtZTogJ2FjY291bnRJZCcsIHJlZmVyZW5jZWRDb2x1bW5OYW1lOiAnbGVhZklkJyB9KVxuICBhY2NvdW50Um9vdCE6IEFjY291bnRNZXJrbGVUcmVlTm9kZTtcbiAgQE9uZVRvT25lKFxuICAgICgpID0+IFRva2VuTGVhZk5vZGUsXG4gICAgKHRva2VuTGVhZk5vZGU6IFRva2VuTGVhZk5vZGUpID0+IHRva2VuTGVhZk5vZGUudG9rZW5NZXJrbGVOb2RlXG4gIClcbiAgQEpvaW5Db2x1bW4oW3tcbiAgICBuYW1lOiAnbGVhZklkJyxcbiAgICByZWZlcmVuY2VkQ29sdW1uTmFtZTogJ2xlYWZJZCdcbiAgfSx7XG4gICAgbmFtZTogJ2FjY291bnRJZCcsXG4gICAgcmVmZXJlbmNlZENvbHVtbk5hbWU6ICdhY2NvdW50SWQnXG4gIH1dKVxuICBsZWFmITpUb2tlbkxlYWZOb2RlO1xuXG59IiwiaW1wb3J0IHsgQ29sdW1uLCBDcmVhdGVEYXRlQ29sdW1uLCBEZWxldGVEYXRlQ29sdW1uLCBFbnRpdHksIEpvaW5Db2x1bW4sIEpvaW5UYWJsZSwgT25lVG9PbmUsIFByaW1hcnlDb2x1bW4sIFVwZGF0ZURhdGVDb2x1bW4gfSBmcm9tICd0eXBlb3JtJztcbmltcG9ydCB7IFRva2VuTWVya2xlVHJlZU5vZGUgfSBmcm9tICcuL3Rva2VuTWVya2xlVHJlZU5vZGUuZW50aXR5JztcblxuQEVudGl0eSgnVG9rZW5MZWFmTm9kZScsIHsgc2NoZW1hOiAncHVibGljJ30pXG5leHBvcnQgY2xhc3MgVG9rZW5MZWFmTm9kZSB7XG4gIEBQcmltYXJ5Q29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ2xlYWZJZCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBwcmltYXJ5OiB0cnVlLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgfSlcbiAgbGVhZklkITogc3RyaW5nO1xuICBAUHJpbWFyeUNvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdhY2NvdW50SWQnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgcHJpbWFyeTogdHJ1ZSxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gIH0pXG4gIGFjY291bnRJZCE6IHN0cmluZztcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdhdmFpbGFibGVBbXQnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgZGVmYXVsdDogMG5cbiAgfSlcbiAgYXZhaWxhYmxlQW10ITogYmlnaW50O1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ2xvY2tlZEFtdCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBkZWZhdWx0OiAwblxuICB9KVxuICBsb2NrZWRBbXQhOiBiaWdpbnQ7XG4gIEBPbmVUb09uZShcbiAgICAoKSA9PiBUb2tlbk1lcmtsZVRyZWVOb2RlLFxuICAgICh0b2tlbk1lcmtsZVRyZWVOb2RlOiBUb2tlbk1lcmtsZVRyZWVOb2RlKSA9PiB0b2tlbk1lcmtsZVRyZWVOb2RlLmxlYWYsXG4gICAgeyBvbkRlbGV0ZTogJ1JFU1RSSUNUJywgb25VcGRhdGU6ICdDQVNDQURFJyB9XG4gIClcbiAgQEpvaW5Db2x1bW4oW3sgbmFtZTogJ2xlYWZJZCcsIHJlZmVyZW5jZWRDb2x1bW5OYW1lOiAnbGVhZklkJyB9LFxuICB7IG5hbWU6ICdhY2NvdW50SWQnLCByZWZlcmVuY2VkQ29sdW1uTmFtZTogJ2FjY291bnRJZCcgfV0pXG4gIHRva2VuTWVya2xlTm9kZSE6IFRva2VuTWVya2xlVHJlZU5vZGU7XG59IiwiZXhwb3J0IGVudW0gUm9sZSB7XG4gIEFETUlOID0gJ0FETUlOJyxcbiAgTUVNQkVSID0gJ01FTUJFUicsXG4gIE9QRVJBVE9SID0gJ09QRVJBVE9SJ1xufSIsImltcG9ydCB7IENvbHVtbiwgRW50aXR5LCBKb2luQ29sdW1uLCBNYW55VG9PbmUsIE9uZVRvT25lLCBQcmltYXJ5Q29sdW1uIH0gZnJvbSAndHlwZW9ybSc7XG5pbXBvcnQgeyBNYXRjaE9ic09yZGVyRW50aXR5IH0gZnJvbSAnLi4vYXVjdGlvbk9yZGVyL21hdGNoT2JzT3JkZXIuZW50aXR5JztcbmltcG9ydCB7IEJhc2VUaW1lRW50aXR5IH0gZnJvbSAnLi4vY29tbW9uL2Jhc2VUaW1lRW50aXR5JztcbmltcG9ydCB7IEFjY291bnRJbmZvcm1hdGlvbiB9IGZyb20gJy4vYWNjb3VudEluZm9ybWF0aW9uLmVudGl0eSc7XG5pbXBvcnQgeyBCbG9ja0luZm9ybWF0aW9uIH0gZnJvbSAnLi9ibG9ja0luZm9ybWF0aW9uLmVudGl0eSc7XG5pbXBvcnQgeyBUU19TVEFUVVMgfSBmcm9tICcuL3RzU3RhdHVzLmVudW0nO1xuXG5ARW50aXR5KCdUcmFuc2FjdGlvbkluZm8nLCB7IHNjaGVtYTogJ3B1YmxpYycgfSlcbmV4cG9ydCBjbGFzcyBUcmFuc2FjdGlvbkluZm8gZXh0ZW5kcyBCYXNlVGltZUVudGl0eSB7XG4gIEBQcmltYXJ5Q29sdW1uKHtcbiAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgbmFtZTogJ3R4SWQnLFxuICAgIHByaW1hcnk6IHRydWUsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGdlbmVyYXRlZDogJ2luY3JlbWVudCcsXG4gIH0pXG4gIHR4SWQhOiBudW1iZXI7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICBuYW1lOiAnYmxvY2tOdW1iZXInLFxuICAgIG51bGxhYmxlOiB0cnVlLFxuICAgIGRlZmF1bHQ6IDBcbiAgfSlcbiAgYmxvY2tOdW1iZXIhOiBudW1iZXJ8IG51bGw7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICBuYW1lOiAncmVxVHlwZScsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDAsXG4gIH0pXG4gIHJlcVR5cGUhOiBudW1iZXI7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnYWNjb3VudElkJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgYWNjb3VudElkITogYmlnaW50O1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ3Rva2VuSWQnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDBuLFxuICB9KVxuICB0b2tlbklkITogYmlnaW50O1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ2FjY3VtdWxhdGVkU2VsbEFtdCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMG4sXG4gIH0pXG4gIGFjY3VtdWxhdGVkU2VsbEFtdCE6IGJpZ2ludDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdhY2N1bXVsYXRlZEJ1eUFtdCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMG4sXG4gIH0pXG4gIGFjY3VtdWxhdGVkQnV5QW10ITogYmlnaW50O1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ2Ftb3VudCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMG4sXG4gIH0pXG4gIGFtb3VudCE6IGJpZ2ludDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdub25jZScsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMG4sXG4gIH0pXG4gIG5vbmNlITogYmlnaW50O1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnanNvbicsXG4gICAgbmFtZTogJ2VkZHNhU2lnJyxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogKCkgPT4gSlNPTi5zdHJpbmdpZnkoeyBSODogWycwJywgJzAnXSwgUzogJzAnIH0pLFxuICB9KVxuICBlZGRzYVNpZyE6IHtcbiAgICBSODogW3N0cmluZywgc3RyaW5nXTtcbiAgICBTOiBzdHJpbmc7XG4gIH07XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICd2YXJjaGFyJyxcbiAgICBuYW1lOiAnZWNkc2FTaWcnLFxuICAgIGxlbmd0aDogJzY2JyxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogYCcnYCxcbiAgfSlcbiAgZWNkc2FTaWchOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnYXJnMCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMG4sXG4gIH0pXG4gIGFyZzAhOiBiaWdpbnQ7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnYXJnMScsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMG4sXG4gIH0pXG4gIGFyZzEhOiBiaWdpbnQ7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnYXJnMicsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMG4sXG4gIH0pXG4gIGFyZzIhOiBiaWdpbnQ7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnYXJnMycsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMG4sXG4gIH0pXG4gIGFyZzMhOiBiaWdpbnQ7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnYXJnNCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMG4sXG4gIH0pXG4gIGFyZzQhOiBiaWdpbnQ7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICd2YXJjaGFyJyxcbiAgICBuYW1lOiAndHNQdWJLZXlYJyxcbiAgICBsZW5ndGg6ICcxMDAnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiBcIicwJ1wiLFxuICB9KVxuICB0c1B1YktleVghOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICd2YXJjaGFyJyxcbiAgICBuYW1lOiAndHNQdWJLZXlZJyxcbiAgICBsZW5ndGg6ICcxMDAnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiBcIicwJ1wiLFxuICB9KVxuICB0c1B1YktleVkhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnZmVlJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgZmVlITogYmlnaW50O1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ2ZlZVRva2VuJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgZmVlVG9rZW4hOiBiaWdpbnQ7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdqc29uJyxcbiAgICBuYW1lOiAnbWV0YWRhdGEnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAoKSA9PiBcIid7fSdcIixcbiAgfSlcbiAgbWV0YWRhdGEhOiBvYmplY3QgfCBudWxsO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZW51bScsXG4gICAgbmFtZTogJ3R4U3RhdHVzJyxcbiAgICBlbnVtOiBbXG4gICAgICBUU19TVEFUVVMuUEVORElORyxcbiAgICAgIFRTX1NUQVRVUy5QUk9DRVNTSU5HLFxuICAgICAgVFNfU1RBVFVTLkwyRVhFQ1VURUQsXG4gICAgICBUU19TVEFUVVMuTDJDT05GSVJNRUQsXG4gICAgICBUU19TVEFUVVMuTDFDT05GSVJNRUQsXG4gICAgICBUU19TVEFUVVMuRkFJTEVELFxuICAgICAgVFNfU1RBVFVTLlJFSkVDVEVELFxuICAgIF0sXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IGAnJHtUU19TVEFUVVMuUEVORElOR30nYCxcbiAgfSlcbiAgdHhTdGF0dXMhOiBUU19TVEFUVVM7XG4gIEBNYW55VG9PbmUoKCkgPT4gQWNjb3VudEluZm9ybWF0aW9uLCAoYWNjb3VudEluZm9ybWF0aW9uOiBBY2NvdW50SW5mb3JtYXRpb24pID0+IGFjY291bnRJbmZvcm1hdGlvbi50cmFuc2FjdGlvbkluZm9zLCB7XG4gICAgb25EZWxldGU6ICdSRVNUUklDVCcsXG4gICAgb25VcGRhdGU6ICdDQVNDQURFJyxcbiAgfSlcbiAgQEpvaW5Db2x1bW4oe1xuICAgIG5hbWU6ICdhY2NvdW50SWQnLFxuICAgIHJlZmVyZW5jZWRDb2x1bW5OYW1lOiAnYWNjb3VudElkJyxcbiAgfSlcbiAgTDJBY2NvdW50SW5mbyE6IEFjY291bnRJbmZvcm1hdGlvbjtcbiAgQE1hbnlUb09uZSgoKSA9PiBCbG9ja0luZm9ybWF0aW9uLCAoYmxvY2tJbmZvcm1hdGlvbjogQmxvY2tJbmZvcm1hdGlvbikgPT4gYmxvY2tJbmZvcm1hdGlvbi50cmFuc2FjdGlvbkluZm9zLCB7XG4gICAgb25EZWxldGU6ICdSRVNUUklDVCcsXG4gICAgb25VcGRhdGU6ICdDQVNDQURFJyxcbiAgfSlcbiAgQEpvaW5Db2x1bW4oe1xuICAgIG5hbWU6ICdibG9ja051bWJlcicsXG4gICAgcmVmZXJlbmNlZENvbHVtbk5hbWU6ICdibG9ja051bWJlcicsXG4gIH0pXG4gIGJsb2NrSW5mbyE6IEJsb2NrSW5mb3JtYXRpb247XG4gIEBPbmVUb09uZSgoKSA9PiBNYXRjaE9ic09yZGVyRW50aXR5LCAobWF0Y2hlZE9ic09yZGVyOiBNYXRjaE9ic09yZGVyRW50aXR5KSA9PiBtYXRjaGVkT2JzT3JkZXIubWF0Y2hlZFR4KVxuICBASm9pbkNvbHVtbih7XG4gICAgbmFtZTogJ3R4SWQnLFxuICAgIHJlZmVyZW5jZWRDb2x1bW5OYW1lOiAndHhJZCcsXG4gIH0pXG4gIG1hdGNoZWRPcmRlciE6IE1hdGNoT2JzT3JkZXJFbnRpdHkgfCBudWxsO1xuICBAT25lVG9PbmUoKCkgPT4gTWF0Y2hPYnNPcmRlckVudGl0eSwgKG1hdGNoZWRPYnNPcmRlcjogTWF0Y2hPYnNPcmRlckVudGl0eSkgPT4gbWF0Y2hlZE9ic09yZGVyLm1hdGNoZWRUeDIpXG4gIEBKb2luQ29sdW1uKHtcbiAgICBuYW1lOiAndHhJZCcsXG4gICAgcmVmZXJlbmNlZENvbHVtbk5hbWU6ICd0eElkMicsXG4gIH0pXG4gIG1hdGNoZWRPcmRlcjIhOiBNYXRjaE9ic09yZGVyRW50aXR5IHwgbnVsbDtcbn1cbiIsImltcG9ydCB7IENvbHVtbiwgRW50aXR5LCBKb2luQ29sdW1uLCBNYW55VG9PbmUsIE9uZVRvT25lLCBQcmltYXJ5R2VuZXJhdGVkQ29sdW1uIH0gZnJvbSAndHlwZW9ybSc7XG5pbXBvcnQgeyBUcmFuc2FjdGlvbkluZm8gfSBmcm9tICcuLi9hY2NvdW50L3RyYW5zYWN0aW9uSW5mby5lbnRpdHknO1xuaW1wb3J0IHsgVHNUeFR5cGUgfSBmcm9tICcuL2R0by90c1R4VHlwZS5lbnVtJztcbmltcG9ydCB7IE9ic09yZGVyRW50aXR5IH0gZnJvbSAnLi9vYnNPcmRlci5lbnRpdHknO1xuaW1wb3J0IHsgVHNTaWRlIH0gZnJvbSAnLi90c1NpZGUuZW51bSc7XG5cbkBFbnRpdHkoJ01hdGNoT2JzT3JkZXInLCB7IHNjaGVtYTogJ3B1YmxpYyd9KVxuZXhwb3J0IGNsYXNzIE1hdGNoT2JzT3JkZXJFbnRpdHkge1xuICBAUHJpbWFyeUdlbmVyYXRlZENvbHVtbih7XG4gICAgdHlwZTogJ2ludDgnLFxuICAgIG5hbWU6ICdpZCdcbiAgfSlcbiAgaWQhOiBudW1iZXI7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdlbnVtJyxcbiAgICBuYW1lOiAnc2lkZScsXG4gICAgZW51bU5hbWU6ICdTSURFJyxcbiAgICBlbnVtOiBbXG4gICAgICBUc1NpZGUuQlVZLFxuICAgICAgVHNTaWRlLlNFTExcbiAgICBdLFxuICAgIGRlZmF1bHQ6ICgpID0+IGAnJHtUc1NpZGUuQlVZfSdgLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgfSlcbiAgc2lkZSE6IFRzU2lkZTtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2ludDgnLFxuICAgIG5hbWU6ICd0eElkJyxcbiAgICBudWxsYWJsZTogdHJ1ZSxcbiAgfSlcbiAgdHhJZCE6IG51bWJlciB8IG51bGw7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdpbnQ4JyxcbiAgICBuYW1lOiAndHhJZDInLFxuICAgIG51bGxhYmxlOiB0cnVlLFxuICB9KVxuICB0eElkMiE6IG51bWJlciB8IG51bGw7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdpbnQ4JyxcbiAgICBuYW1lOiAncmVmZXJlbmNlT3JkZXInLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgfSlcbiAgcmVmZXJlbmNlT3JkZXIhOiBudW1iZXI7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICBuYW1lOiAncmVxVHlwZScsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDAsXG4gIH0pXG4gIHJlcVR5cGUhOiBudW1iZXI7IFxuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndmFyY2hhcicsXG4gICAgbmFtZTogJ21hcmtldFBhaXInLFxuICAgIGxlbmd0aDogMTAwLFxuICAgIGRlZmF1bHQ6IGAnRVRIL1VTREMnYCxcbiAgICBudWxsYWJsZTogZmFsc2VcbiAgfSlcbiAgbWFya2V0UGFpciE6IHN0cmluZztcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdtYXRjaGVkTVEnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgZGVmYXVsdDogMG4sXG4gIH0pXG4gIG1hdGNoZWRNUSE6IGJpZ2ludDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdtYXRjaGVkQlEnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgZGVmYXVsdDogMG5cbiAgfSlcbiAgbWF0Y2hlZEJRITogYmlnaW50O1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndGltZXN0YW1wIHdpdGhvdXQgdGltZSB6b25lJyxcbiAgICBuYW1lOiAndGltZXN0YW1wJyxcbiAgICBwcmVjaXNpb246IDMsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6ICdub3coKSdcbiAgfSlcbiAgdGltZXN0YW1wITogRGF0ZTtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2ludGVnZXInLFxuICAgIG5hbWU6ICdvcmRlclN0YXR1cycsXG4gICAgZGVmYXVsdDogMSxcbiAgfSkgXG4gIG9yZGVyU3RhdHVzITogbnVtYmVyO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgbmFtZTogJ2lzVm9pZCcsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gIH0pIFxuICBpc1ZvaWQhOiBib29sZWFuO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgbmFtZTogJ2lzQ2FuY2VsJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgfSkgXG4gIGlzQ2FuY2VsITogYm9vbGVhbjtcbiAgQE1hbnlUb09uZShcbiAgICAoKSA9PiBPYnNPcmRlckVudGl0eSxcbiAgICAob2JzT3JkZXI6IE9ic09yZGVyRW50aXR5KSA9PiBvYnNPcmRlci5tYXRjaE9yZGVycyxcbiAgICB7XG4gICAgICBvblVwZGF0ZTogJ0NBU0NBREUnLFxuICAgICAgb25EZWxldGU6ICdSRVNUUklDVCdcbiAgICB9IFxuICApXG4gIEBKb2luQ29sdW1uKHtcbiAgICBuYW1lOiAncmVmZXJlbmNlT3JkZXInLFxuICAgIHJlZmVyZW5jZWRDb2x1bW5OYW1lOiAnaWQnLFxuICB9KVxuICBtYWluT3JkZXIhOiBPYnNPcmRlckVudGl0eTtcbiAgQE9uZVRvT25lKFxuICAgICgpID0+IFRyYW5zYWN0aW9uSW5mbyxcbiAgICAodHJhbnNhY3Rpb246IFRyYW5zYWN0aW9uSW5mbykgPT4gdHJhbnNhY3Rpb24ubWF0Y2hlZE9yZGVyLFxuICAgIHtcbiAgICAgIG9uRGVsZXRlOiAnUkVTVFJJQ1QnLFxuICAgICAgb25VcGRhdGU6ICdDQVNDQURFJ1xuICAgIH1cbiAgKVxuICBASm9pbkNvbHVtbih7XG4gICAgbmFtZTogJ3R4SWQnLFxuICAgIHJlZmVyZW5jZWRDb2x1bW5OYW1lOiAndHhJZCcgICBcbiAgfSlcbiAgbWF0Y2hlZFR4ITogVHJhbnNhY3Rpb25JbmZvIHwgbnVsbDtcbiAgQE9uZVRvT25lKFxuICAgICgpID0+IFRyYW5zYWN0aW9uSW5mbyxcbiAgICAodHJhbnNhY3Rpb246IFRyYW5zYWN0aW9uSW5mbykgPT4gdHJhbnNhY3Rpb24ubWF0Y2hlZE9yZGVyMixcbiAgICB7XG4gICAgICBvbkRlbGV0ZTogJ1JFU1RSSUNUJyxcbiAgICAgIG9uVXBkYXRlOiAnQ0FTQ0FERSdcbiAgICB9XG4gIClcbiAgQEpvaW5Db2x1bW4oe1xuICAgIG5hbWU6ICd0eElkMicsXG4gICAgcmVmZXJlbmNlZENvbHVtbk5hbWU6ICd0eElkJyAgIFxuICB9KVxuICBtYXRjaGVkVHgyITogVHJhbnNhY3Rpb25JbmZvIHwgbnVsbDtcbn1cbiIsImV4cG9ydCBlbnVtIFRzU2lkZSB7XG4gIEJVWSA9ICcwJyxcbiAgU0VMTCA9ICcxJyxcbn0iLCJpbXBvcnQgeyBDb2x1bW4sIEVudGl0eSwgSm9pbkNvbHVtbiwgT25lVG9NYW55LCBQcmltYXJ5R2VuZXJhdGVkQ29sdW1uIH0gZnJvbSAndHlwZW9ybSc7XG5pbXBvcnQgeyBCYXNlVGltZUVudGl0eSB9IGZyb20gJy4uL2NvbW1vbi9iYXNlVGltZUVudGl0eSc7XG5pbXBvcnQgeyBCTE9DS19TVEFUVVMgfSBmcm9tICcuL2Jsb2NrU3RhdHVzLmVudW0nO1xuaW1wb3J0IHsgVHJhbnNhY3Rpb25JbmZvIH0gZnJvbSAnLi90cmFuc2FjdGlvbkluZm8uZW50aXR5JztcblxuQEVudGl0eSgnQmxvY2tJbmZvcm1hdGlvbicsIHsgc2NoZW1hOiAncHVibGljJyB9KVxuZXhwb3J0IGNsYXNzIEJsb2NrSW5mb3JtYXRpb24gZXh0ZW5kcyBCYXNlVGltZUVudGl0eSB7XG4gIEBQcmltYXJ5R2VuZXJhdGVkQ29sdW1uKHtcbiAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgbmFtZTogJ2Jsb2NrTnVtYmVyJ1xuICB9KVxuICBibG9ja051bWJlciE6IG51bWJlcjtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ3ZhcmNoYXInLFxuICAgIG5hbWU6ICdibG9ja0hhc2gnLFxuICAgIGxlbmd0aDogMjU2LFxuICAgIG51bGxhYmxlOiB0cnVlLFxuICB9KVxuICBibG9ja0hhc2ghOiBzdHJpbmcgfCBudWxsO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndmFyY2hhcicsXG4gICAgbmFtZTogJ0wxVHJhbnNhY3Rpb25IYXNoJyxcbiAgICBsZW5ndGg6IDUxMixcbiAgfSlcbiAgTDFUcmFuc2FjdGlvbkhhc2ghOiBzdHJpbmc7XG4gIEBDb2x1bW4oeyBcbiAgICB0eXBlOiAndGltZXN0YW1wIHdpdGhvdXQgdGltZSB6b25lJyxcbiAgICBuYW1lOiAndmVyaWZpZWRBdCcsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICB9KVxuICB2ZXJpZmllZEF0ITogRGF0ZTtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ3ZhcmNoYXInLCAgXG4gICAgbmFtZTogJ29wZXJhdG9yQWRkcmVzcycsXG4gICAgbGVuZ3RoOiAyNTYsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICB9KVxuICBvcGVyYXRvckFkZHJlc3MhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICd0ZXh0JyxcbiAgICBuYW1lOiAncmF3RGF0YScsXG4gICAgbnVsbGFibGU6IHRydWUsXG4gIH0pXG4gIHJhd0RhdGEhOiBzdHJpbmcgfCBudWxsO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnanNvbicsXG4gICAgbmFtZTogJ2NhbGxEYXRhJyxcbiAgICBudWxsYWJsZTogdHJ1ZSxcbiAgICBkZWZhdWx0OiAoKSA9PiAnXFwne31cXCcnLFxuICB9KVxuICBjYWxsRGF0YSE6IG9iamVjdCB8ICd7fSc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdqc29uJyxcbiAgICBuYW1lOiAncHJvb2YnLFxuICAgIG51bGxhYmxlOiB0cnVlLFxuICAgIGRlZmF1bHQ6ICgpID0+ICdcXCd7fVxcJycsXG4gIH0pXG4gIHByb29mITogb2JqZWN0IHwgJ3t9JztcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2VudW0nLFxuICAgIG5hbWU6ICdibG9ja1N0YXR1cycsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGVudW1OYW1lOiAnQkxPQ0tfU1RBVFVTJyxcbiAgICBlbnVtOiBbXG4gICAgICBCTE9DS19TVEFUVVMuUFJPQ0VTU0lORyxcbiAgICAgIEJMT0NLX1NUQVRVUy5MMkVYRUNVVEVELFxuICAgICAgQkxPQ0tfU1RBVFVTLkwyQ09ORklSTUVELFxuICAgICAgQkxPQ0tfU1RBVFVTLkwxQ09ORklSTUVEXG4gICAgXSxcbiAgICBkZWZhdWx0OiBgJyR7QkxPQ0tfU1RBVFVTLlBST0NFU1NJTkd9J2AsXG4gIH0pXG4gIGJsb2NrU3RhdHVzITogQkxPQ0tfU1RBVFVTO1xuICBAT25lVG9NYW55KFxuICAgICgpID0+IFRyYW5zYWN0aW9uSW5mbyxcbiAgICB0cmFuc2FjdGlvbkluZm8gPT4gdHJhbnNhY3Rpb25JbmZvLmJsb2NrSW5mbyxcbiAgKVxuICBASm9pbkNvbHVtbih7XG4gICAgbmFtZTogJ2Jsb2NrTnVtYmVyJyxcbiAgICByZWZlcmVuY2VkQ29sdW1uTmFtZTogJ2Jsb2NrTnVtYmVyJ1xuICB9KVxuICB0cmFuc2FjdGlvbkluZm9zITogVHJhbnNhY3Rpb25JbmZvW10gfCBudWxsO1xufSIsImV4cG9ydCBlbnVtIEJMT0NLX1NUQVRVUyB7XG4gIFBST0NFU1NJTkc9J1BST0NFU1NJTkcnLFxuICBMMkVYRUNVVEVEPSdMMkVYRUNVVEVEJyxcbiAgTDJDT05GSVJNRUQ9J0wyQ09ORklSTUVEJyxcbiAgTDFDT05GSVJNRUQ9J0wxQ09ORklSTUVEJyxcbn07IiwiZXhwb3J0IGVudW0gVFNfU1RBVFVTIHtcbiAgUEVORElORz0nUEVORElORycsXG4gIFBST0NFU1NJTkc9J1BST0NFU1NJTkcnLFxuICBMMkVYRUNVVEVEPSdMMkVYRUNVVEVEJyxcbiAgTDJDT05GSVJNRUQ9J0wyQ09ORklSTUVEJyxcbiAgTDFDT05GSVJNRUQ9J0wxQ09ORklSTUVEJyxcbiAgRkFJTEVEPSdGQUlMRUQnLFxuICBSRUpFQ1RFRD0nUkVKRUNURUQnXG59XG4iLCJpbXBvcnQgeyBDb2x1bW4sIEVudGl0eSwgSm9pbkNvbHVtbiwgT25lVG9PbmUsIFByaW1hcnlDb2x1bW4gfSBmcm9tICd0eXBlb3JtJztcbmltcG9ydCB7IE9ic09yZGVyRW50aXR5IH0gZnJvbSAnLi9vYnNPcmRlci5lbnRpdHknO1xuaW1wb3J0IHsgT2JzT3JkZXJMZWFmRW50aXR5IH0gZnJvbSAnLi9vYnNPcmRlckxlYWYuZW50aXR5JztcblxuQEVudGl0eSgnT2JzT3JkZXJMZWFmTWVya2xlVHJlZU5vZGUnLCB7IHNjaGVtYTogJ3B1YmxpYycgfSkgXG5leHBvcnQgY2xhc3MgT2JzT3JkZXJMZWFmTWVya2xlVHJlZU5vZGUge1xuICBAUHJpbWFyeUNvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdpZCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBwcmltYXJ5OiB0cnVlLFxuICB9KVxuICBpZCE6IHN0cmluZztcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdoYXNoJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgaGFzaCE6IGJpZ2ludDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdsZWFmSWQnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IHRydWVcbiAgfSlcbiAgbGVhZklkITogYmlnaW50IHwgbnVsbDtcbiAgQE9uZVRvT25lKFxuICAgICgpID0+IE9ic09yZGVyTGVhZkVudGl0eSxcbiAgICAob2JzT3JkZXJMZWFmOiBPYnNPcmRlckxlYWZFbnRpdHkpID0+IG9ic09yZGVyTGVhZi5tZXJrbGVUcmVlTm9kZSxcbiAgKVxuICBASm9pbkNvbHVtbih7XG4gICAgbmFtZTogJ2xlYWZJZCcsXG4gICAgcmVmZXJlbmNlZENvbHVtbk5hbWU6ICdvcmRlckxlYWZJZCdcbiAgfSlcbiAgbGVhZiE6IE9ic09yZGVyTGVhZkVudGl0eSB8IG51bGw7XG59IiwiaW1wb3J0IHsgQm9keSwgQ29udHJvbGxlciwgR2V0LCBMb2dnZXIsIFBvc3QsIFF1ZXJ5IH0gZnJvbSAnQG5lc3Rqcy9jb21tb24nO1xuaW1wb3J0IHsgTWFya2V0UGFpckluZm9TZXJ2aWNlIH0gZnJvbSAnLi4vYXVjdGlvbk9yZGVyL21hcmtldFBhaXJJbmZvLnNlcnZpY2UnO1xuaW1wb3J0IHsgVXBkYXRlQWNjb3VudFRyZWVEdG8gfSBmcm9tICcuL2R0by91cGRhdGVBY2NvdW50VHJlZS5kdG8nO1xuaW1wb3J0IHsgVXBkYXRlVG9rZW5UcmVlRHRvIH0gZnJvbSAnLi9kdG8vdXBkYXRlVG9rZW5UcmVlLmR0byc7XG5pbXBvcnQgeyBUc0FjY291bnRUcmVlU2VydmljZSB9IGZyb20gJy4vdHNBY2NvdW50VHJlZS5zZXJ2aWNlJztcbmltcG9ydCB7IFRzVG9rZW5UcmVlU2VydmljZSB9IGZyb20gJy4vdHNUb2tlblRyZWUuc2VydmljZSc7XG5pbXBvcnQgeyBNYXJrZXRTZWxsQnV5UGFpciB9IGZyb20gJy4uL2F1Y3Rpb25PcmRlci9kdG8vTWFya2V0UGFpckluZm8uZHRvJztcbmltcG9ydCB7IFRzU2lkZSB9IGZyb20gJy4uL2F1Y3Rpb25PcmRlci90c1NpZGUuZW51bSc7XG5pbXBvcnQgeyBPYnNPcmRlclRyZWVTZXJ2aWNlIH0gZnJvbSAnLi4vYXVjdGlvbk9yZGVyL29ic09yZGVyVHJlZS5zZXJ2aWNlJztcbmltcG9ydCB7IFVwZGF0ZU9ic09yZGVyVHJlZUR0byB9IGZyb20gJy4uL2F1Y3Rpb25PcmRlci9kdG8vdXBkYXRlT2JzT3JkZXJUcmVlLmR0byc7XG5cbkBDb250cm9sbGVyKCdtZXJrbGVUcmVlJylcbmV4cG9ydCBjbGFzcyBNZXJrbGVUcmVlQ29udHJvbGxlciB7XG4gIHByaXZhdGUgbG9nZ2VyOiBMb2dnZXIgPSBuZXcgTG9nZ2VyKE1lcmtsZVRyZWVDb250cm9sbGVyLm5hbWUpO1xuICBwcml2YXRlIGFjY291bnRMZWFmSWQ6IGJpZ2ludCA9IDEwMG47XG4gIC8vIHByaXZhdGUgdG9rZW5lTGVhZklkOiBiaWdpbnQgPSAwbjtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSB0c0FjY291bnRUcmVlU2VydmljZTogVHNBY2NvdW50VHJlZVNlcnZpY2UsICBcbiAgICBwcml2YXRlIHJlYWRvbmx5IHRzVG9rZW5UcmVlU2VydmljZTogVHNUb2tlblRyZWVTZXJ2aWNlLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgbWFya2V0UGFpckluZm9TZXJ2aWNlOiBNYXJrZXRQYWlySW5mb1NlcnZpY2UsXG4gICAgcHJpdmF0ZSByZWFkb25seSBvYnNPcmRlclRyZWVTZXJ2aWNlOiBPYnNPcmRlclRyZWVTZXJ2aWNlLFxuICApIHtcbiAgICB0aGlzLnRzQWNjb3VudFRyZWVTZXJ2aWNlLmdldEN1cnJlbnRMZWFmSWRDb3VudCgpLnRoZW4oKGlkKSA9PiB7XG4gICAgICB0aGlzLmFjY291bnRMZWFmSWQgPSBCaWdJbnQoaWQpKyAxMDBuO1xuICAgICAgY29uc29sZS5sb2coYGFjY291bnRMZWFmSWQ6ICR7dGhpcy5hY2NvdW50TGVhZklkfWApO1xuICAgIH0pO1xuICB9XG5cbiAgQFBvc3QoJ3VwZGF0ZUFjY291bnRUcmVlJylcbiAgYXN5bmMgdXBkYXRlQWNjb3VudFRyZWUoQEJvZHkoKSB1cGRhdGVBY2NvdW50VHJlZUR0bzogVXBkYXRlQWNjb3VudFRyZWVEdG8pIHtcbiAgICBjb25zb2xlLnRpbWUoJ2NvbnRyb2xsZXIgdXBkYXRlQWNjb3VudFRyZWUnKTtcbiAgICBhd2FpdCB0aGlzLnRzQWNjb3VudFRyZWVTZXJ2aWNlLnVwZGF0ZUxlYWYoXG4gICAgICBCaWdJbnQodXBkYXRlQWNjb3VudFRyZWVEdG8ubGVhZklkKSxcbiAgICAgIHVwZGF0ZUFjY291bnRUcmVlRHRvXG4gICAgICApO1xuICAgIGNvbnNvbGUudGltZUVuZCgnY29udHJvbGxlciB1cGRhdGVBY2NvdW50VHJlZScpO1xuICB9XG4gIEBQb3N0KCd1cGRhdGVUb2tlblRyZWUnKVxuICBhc3luYyB1cGRhdGVUb2tlblRyZWUoQEJvZHkoKSB1cGRhdGVUb2tlblRyZWVEdG86IFVwZGF0ZVRva2VuVHJlZUR0bykge1xuICAgIGNvbnNvbGUudGltZSgnY29udHJvbGxlciB1cGRhdGVUb2tlblRyZWUnKTtcbiAgICAvLyBjb25zdCB0b2tlbmVMZWFmSWQgPSBhd2FpdCB0aGlzLnRzVG9rZW5UcmVlU2VydmljZS5nZXRDdXJyZW50TGVhZklkQ291bnQoQmlnSW50KHVwZGF0ZVRva2VuVHJlZUR0by5hY2NvdW50SWQpKTtcbiAgICBhd2FpdCB0aGlzLnRzVG9rZW5UcmVlU2VydmljZS51cGRhdGVMZWFmKFxuICAgICAgQmlnSW50KHVwZGF0ZVRva2VuVHJlZUR0by5sZWFmSWQpLFxuICAgICAgdXBkYXRlVG9rZW5UcmVlRHRvLFxuICAgICAgKTtcbiAgICBjb25zb2xlLnRpbWVFbmQoJ2NvbnRyb2xsZXIgdXBkYXRlVG9rZW5UcmVlJyk7XG4gIH1cbiAgQFBvc3QoJ3VwZGF0ZU9ic09yZGVyVHJlZScpXG4gIGFzeW5jIHVwZGF0ZU9ic09yZGVyVHJlZShAQm9keSgpIHVwZGF0ZU9ic09yZGVyVHJlZUR0bzogVXBkYXRlT2JzT3JkZXJUcmVlRHRvKSB7XG4gICAgY29uc29sZS50aW1lKCdjb250cm9sbGVyIHVwZGF0ZU9ic09yZGVyVHJlZScpO1xuICAgIGF3YWl0IHRoaXMub2JzT3JkZXJUcmVlU2VydmljZS51cGRhdGVMZWFmKFxuICAgICAgQmlnSW50KHVwZGF0ZU9ic09yZGVyVHJlZUR0by5vcmRlckxlYWZJZCksXG4gICAgICB1cGRhdGVPYnNPcmRlclRyZWVEdG9cbiAgICApO1xuICAgIGNvbnNvbGUudGltZUVuZCgnY29udHJvbGxlciB1cGRhdGVPYnNPcmRlclRyZWUnKTtcbiAgfVxuICBAR2V0KCdtYXJrZXRQYWlySW5mbycpXG4gIGFzeW5jIGdldE1hcmtldFBhaXJJbmZvKEBRdWVyeSgpIGR0bzogTWFya2V0U2VsbEJ1eVBhaXIpIHtcbiAgICBjb25zb2xlLmxvZyhkdG8pO1xuICAgIGNvbnN0IHBhaXIgPSBbe1xuICAgICAgbWFpblRva2VuSWQ6IGR0by5zZWxsVG9rZW5JZCxcbiAgICAgIGJhc2VUb2tlbklkOiBkdG8uYnV5VG9rZW5JZCxcbiAgICB9LCB7XG4gICAgICBtYWluVG9rZW5JZDogZHRvLmJ1eVRva2VuSWQsXG4gICAgICBiYXNlVG9rZW5JZDogZHRvLnNlbGxUb2tlbklkLFxuICAgIH1dXG4gICAgY29uc3QgbWFya2V0UGFpckluZm8gPSBhd2FpdCB0aGlzLm1hcmtldFBhaXJJbmZvU2VydmljZS5maW5kT25lTWFya2V0UGFpckluZm8oe3BhaXJzOiBwYWlyfSk7XG4gICAgY29uc3Qgc2lkZSA9IG1hcmtldFBhaXJJbmZvLm1haW5Ub2tlbklkID09PSBkdG8uYnV5VG9rZW5JZCA/ICBUc1NpZGUuQlVZOiBUc1NpZGUuU0VMTDtcbiAgICByZXR1cm4ge1xuICAgICAgLi4ubWFya2V0UGFpckluZm8sXG4gICAgICBzaWRlLFxuICAgIH07XG4gIH1cbn0iLCJpbXBvcnQgeyBJbmplY3RhYmxlLCBOb3RGb3VuZEV4Y2VwdGlvbiB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcbmltcG9ydCB7IEluamVjdFJlcG9zaXRvcnkgfSBmcm9tICdAbmVzdGpzL3R5cGVvcm0nO1xuaW1wb3J0IHsgUmVwb3NpdG9yeSB9IGZyb20gJ3R5cGVvcm0nO1xuaW1wb3J0IHsgTWFya2V0UGFpckluZm9SZXF1ZXN0RHRvLCBNYXJrZXRQYWlySW5mb1Jlc3BvbnNlRHRvIH0gZnJvbSAnLi9kdG8vTWFya2V0UGFpckluZm8uZHRvJztcbmltcG9ydCB7IE1hcmtldFBhaXJJbmZvRW50aXR5IH0gZnJvbSAnLi9tYXJrZXRQYWlySW5mby5lbnRpdHknO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTWFya2V0UGFpckluZm9TZXJ2aWNlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgQEluamVjdFJlcG9zaXRvcnkoTWFya2V0UGFpckluZm9FbnRpdHkpXG4gICAgcHJpdmF0ZSByZWFkb25seSBtYXJrZXRQYWlySW5mb1JlcG9zaXRvcnk6IFJlcG9zaXRvcnk8TWFya2V0UGFpckluZm9FbnRpdHk+LFxuICApIHt9XG4gIGFzeW5jIGZpbmRPbmVNYXJrZXRQYWlySW5mbyhtYXJrZXRQYWlyRHRvOiBNYXJrZXRQYWlySW5mb1JlcXVlc3REdG8pOiBQcm9taXNlPE1hcmtldFBhaXJJbmZvUmVzcG9uc2VEdG8+IHtcbiAgICBjb25zb2xlLmxvZyhtYXJrZXRQYWlyRHRvKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgbWFya2V0UGFpckluZm8gPSBhd2FpdCB0aGlzLm1hcmtldFBhaXJJbmZvUmVwb3NpdG9yeS5maW5kT25lT3JGYWlsKHtcbiAgICAgICAgc2VsZWN0OiBbJ21haW5Ub2tlbklkJywgJ2Jhc2VUb2tlbklkJywgJ21hcmtldFBhaXInXSxcbiAgICAgICAgd2hlcmU6IFt7XG4gICAgICAgICAgbWFpblRva2VuSWQ6IG1hcmtldFBhaXJEdG8ucGFpcnNbMF0ubWFpblRva2VuSWQsXG4gICAgICAgICAgYmFzZVRva2VuSWQ6IG1hcmtldFBhaXJEdG8ucGFpcnNbMF0uYmFzZVRva2VuSWQsXG4gICAgICAgIH0sIHtcbiAgICAgICAgICBtYWluVG9rZW5JZDogbWFya2V0UGFpckR0by5wYWlyc1sxXS5tYWluVG9rZW5JZCxcbiAgICAgICAgICBiYXNlVG9rZW5JZDogbWFya2V0UGFpckR0by5wYWlyc1sxXS5iYXNlVG9rZW5JZCxcbiAgICAgICAgfV1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG1hcmtldFBhaXJJbmZvO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aHJvdyBuZXcgTm90Rm91bmRFeGNlcHRpb24oJ01hcmtldFBhaXJJbmZvIG5vdCBmb3VuZCcpO1xuICAgIH1cbiAgfVxufSIsImltcG9ydCB7IENvbHVtbiwgRW50aXR5LCBQcmltYXJ5R2VuZXJhdGVkQ29sdW1uIH0gZnJvbSAndHlwZW9ybSc7XG5cbkBFbnRpdHkoJ01hcmtldFBhaXJJbmZvJywge3NjaGVtYTogJ3B1YmxpYyd9KVxuZXhwb3J0IGNsYXNzIE1hcmtldFBhaXJJbmZvRW50aXR5IHtcbiAgQFByaW1hcnlHZW5lcmF0ZWRDb2x1bW4oe1xuICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICBuYW1lOiAnaWQnXG4gIH0pXG4gIGlkITogbnVtYmVyO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ21haW5Ub2tlbklkJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIGRlZmF1bHQ6IDBuLFxuICAgIG51bGxhYmxlOiBmYWxzZVxuICB9KVxuICBtYWluVG9rZW5JZCE6IHN0cmluZztcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdiYXNlVG9rZW5JZCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBkZWZhdWx0OiAwbixcbiAgICBudWxsYWJsZTogZmFsc2VcbiAgfSlcbiAgYmFzZVRva2VuSWQhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICd2YXJjaGFyJyxcbiAgICBuYW1lOiAnbWFya2V0UGFpcicsXG4gICAgbGVuZ3RoOiAnMTAwJyxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogKCkgPT4gJ0VUSC9VU0RDJ1xuICB9KVxuICBtYXJrZXRQYWlyITogc3RyaW5nO1xufSIsImltcG9ydCB7IEFwaVByb3BlcnR5IH0gZnJvbSBcIkBuZXN0anMvc3dhZ2dlclwiO1xuXG5leHBvcnQgY2xhc3MgVXBkYXRlQWNjb3VudFRyZWVEdG8ge1xuICBAQXBpUHJvcGVydHkoKVxuICBsZWFmSWQhOiBzdHJpbmc7XG4gIEBBcGlQcm9wZXJ0eSgpXG4gIHRzQWRkciE6IHN0cmluZztcbiAgQEFwaVByb3BlcnR5KClcbiAgbm9uY2UhOiBzdHJpbmc7XG4gIEBBcGlQcm9wZXJ0eSgpXG4gIHRva2VuUm9vdCE6IHN0cmluZztcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJAbmVzdGpzL3N3YWdnZXJcIik7OyIsImltcG9ydCB7IEFwaVByb3BlcnR5IH0gZnJvbSBcIkBuZXN0anMvc3dhZ2dlclwiO1xuXG5leHBvcnQgY2xhc3MgVXBkYXRlVG9rZW5UcmVlRHRvIHtcbiAgQEFwaVByb3BlcnR5KClcbiAgbG9ja2VkQW10ITogc3RyaW5nO1xuICBAQXBpUHJvcGVydHkoKVxuICBhdmFpbGFibGVBbXQhOiBzdHJpbmc7XG4gIEBBcGlQcm9wZXJ0eSgpXG4gIGxlYWZJZCE6IHN0cmluZztcbiAgQEFwaVByb3BlcnR5KClcbiAgYWNjb3VudElkITogc3RyaW5nO1xufSIsImltcG9ydCB7IEluamVjdGFibGUsIExvZ2dlciB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcbmltcG9ydCB7IEluamVjdFJlcG9zaXRvcnkgfSBmcm9tICdAbmVzdGpzL3R5cGVvcm0nO1xuaW1wb3J0IHsgQWNjb3VudE1lcmtsZVRyZWVOb2RlIH0gZnJvbSAnLi9hY2NvdW50TWVya2xlVHJlZU5vZGUuZW50aXR5JztcbmltcG9ydCB7IEFjY291bnRMZWFmTm9kZSB9IGZyb20gJy4vYWNjb3VudExlYWZOb2RlLmVudGl0eSc7XG5pbXBvcnQgeyBDb25uZWN0aW9uLCBSZXBvc2l0b3J5IH0gZnJvbSAndHlwZW9ybSc7XG5pbXBvcnQgeyB0b1RyZWVMZWFmLCB0c0hhc2hGdW5jIH0gZnJvbSAnLi4vY29tbW9uL3RzLWhlbHBlcic7XG5pbXBvcnQgeyBUc01lcmtsZVRyZWUgfSBmcm9tICcuLi9jb21tb24vdHNNZXJrbGVUcmVlJztcbmltcG9ydCB7IFVwZGF0ZUFjY291bnRUcmVlRHRvIH0gZnJvbSAnLi9kdG8vdXBkYXRlQWNjb3VudFRyZWUuZHRvJztcbmltcG9ydCB7IENvbmZpZ1NlcnZpY2UgfSBmcm9tICdAbmVzdGpzL2NvbmZpZyc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUc0FjY291bnRUcmVlU2VydmljZSBleHRlbmRzIFRzTWVya2xlVHJlZTxBY2NvdW50TGVhZk5vZGU+e1xuICBwcml2YXRlIGxvZ2dlcjogTG9nZ2VyID0gbmV3IExvZ2dlcihUc0FjY291bnRUcmVlU2VydmljZS5uYW1lKTtcbiAgY29uc3RydWN0b3IoXG4gICAgQEluamVjdFJlcG9zaXRvcnkoQWNjb3VudExlYWZOb2RlKVxuICAgIHByaXZhdGUgYWNjb3VudExlYWZOb2RlUmVwb3NpdG9yeTogUmVwb3NpdG9yeTxBY2NvdW50TGVhZk5vZGU+LFxuICAgIEBJbmplY3RSZXBvc2l0b3J5KEFjY291bnRNZXJrbGVUcmVlTm9kZSlcbiAgICBwcml2YXRlIGFjY291bnRNZXJrbGVUcmVlUmVwb3NpdG9yeTogUmVwb3NpdG9yeTxBY2NvdW50TWVya2xlVHJlZU5vZGU+LFxuICAgIHByaXZhdGUgY29ubmVjdGlvbjogQ29ubmVjdGlvbixcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNvbmZpZ1NlcnZpY2U6IENvbmZpZ1NlcnZpY2UsXG4gICkge1xuICAgIGNvbnNvbGUudGltZSgnY3JlYXRlIEFjY291bnQgVHJlZScpO1xuICAgIHN1cGVyKGNvbmZpZ1NlcnZpY2UuZ2V0PG51bWJlcj4oJ0FDQ09VTlRTX1RSRUVfSEVJR0hUJywgMzIpLCB0c0hhc2hGdW5jKTtcbiAgICBjb25zb2xlLnRpbWVFbmQoJ2NyZWF0ZSBBY2NvdW50IFRyZWUnKTtcbiAgfVxuICBhc3luYyBnZXRDdXJyZW50TGVhZklkQ291bnQoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBjb25zdCBsZWFmSWRDb3VudCA9IGF3YWl0IHRoaXMuYWNjb3VudExlYWZOb2RlUmVwb3NpdG9yeS5jb3VudCgpO1xuICAgIHJldHVybiBsZWFmSWRDb3VudDtcbiAgfVxuICBnZXRMZWFmRGVmYXVsdFZhdmx1ZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0b1RyZWVMZWFmKFswbiwgMG4sIDBuXSk7XG4gIH1cbiAgYXN5bmMgdXBkYXRlTGVhZihsZWFmSWQ6IGJpZ2ludCwgdmFsdWU6IFVwZGF0ZUFjY291bnRUcmVlRHRvKSB7XG4gICAgY29uc29sZS50aW1lKCd1cGRhdGVMZWFmIGZvciBhY2NvdW50IHRyZWUnKTtcbiAgICBjb25zdCBwcmYgPSB0aGlzLmdldFByb29mSWRzKGxlYWZJZCk7XG4gICAgY29uc3QgaWQgPSB0aGlzLmdldExlYWZJZEluVHJlZShsZWFmSWQpO1xuICAgIC8vIHNldHVwIHRyYW5zYWN0aW9uXG4gICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uLnRyYW5zYWN0aW9uKGFzeW5jIChtYW5hZ2VyKSA9PiB7XG4gICAgICBhd2FpdCBtYW5hZ2VyLnVwc2VydChBY2NvdW50TWVya2xlVHJlZU5vZGUsIHtcbiAgICAgICAgaWQ6IGlkLnRvU3RyaW5nKCksXG4gICAgICAgIGxlYWZJZDogbGVhZklkLFxuICAgICAgICBoYXNoOiBCaWdJbnQodG9UcmVlTGVhZihbXG4gICAgICAgICAgQmlnSW50KHZhbHVlLnRzQWRkciksIFxuICAgICAgICAgIEJpZ0ludCh2YWx1ZS5ub25jZSksIFxuICAgICAgICAgIEJpZ0ludCh2YWx1ZS50b2tlblJvb3QpXSkpIFxuICAgICAgICB9LCBbJ2lkJ10pO1xuICAgICAgYXdhaXQgbWFuYWdlci51cHNlcnQoQWNjb3VudExlYWZOb2RlLCB7XG4gICAgICAgIHRzQWRkcjogQmlnSW50KHZhbHVlLnRzQWRkciksXG4gICAgICAgIG5vbmNlOiBCaWdJbnQodmFsdWUubm9uY2UpLFxuICAgICAgICB0b2tlblJvb3Q6IEJpZ0ludCh2YWx1ZS50b2tlblJvb3QpLFxuICAgICAgICBsZWFmSWQ6IGxlYWZJZC50b1N0cmluZygpLFxuICAgICAgfSwgWydsZWFmSWQnXSk7XG4gICAgICAvLyB1cGRhdGUgdHJlZVxuICAgICAgZm9yIChsZXQgaSA9IGlkLCBqID0gMDsgaSA+IDFuOyBpID0gaSA+PiAxbikge1xuICAgICAgICBjb25zdCBbaVZhbHVlLCBqVmFsdWVdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgIHRoaXMuYWNjb3VudE1lcmtsZVRyZWVSZXBvc2l0b3J5LmZpbmRPbmVCeSh7aWQ6IGkudG9TdHJpbmcoKX0pLFxuICAgICAgICAgIHRoaXMuYWNjb3VudE1lcmtsZVRyZWVSZXBvc2l0b3J5LmZpbmRPbmVCeSh7aWQ6IHByZltqXS50b1N0cmluZygpfSlcbiAgICAgICAgXSk7XG4gICAgICAgIGNvbnN0IGpMZXZlbCA9IE1hdGguZmxvb3IoTWF0aC5sb2cyKE51bWJlcihwcmZbal0pKSk7XG4gICAgICAgIGNvbnN0IGlMZXZlbCA9IE1hdGguZmxvb3IoTWF0aC5sb2cyKE51bWJlcihpKSkpO1xuICAgICAgICBjb25zdCBqSGFzaFZhbHVlOiBzdHJpbmcgPSAoalZhbHVlID09IG51bGwpPyB0aGlzLmdldERlZmF1bHRIYXNoQnlMZXZlbChqTGV2ZWwpOiBqVmFsdWUuaGFzaC50b1N0cmluZygpO1xuICAgICAgICBjb25zdCBpSGFzaFZhbHVlOiBzdHJpbmcgPSAoaVZhbHVlID09IG51bGwpPyB0aGlzLmdldERlZmF1bHRIYXNoQnlMZXZlbChpTGV2ZWwpOiBpVmFsdWUuaGFzaC50b1N0cmluZygpO1xuICAgICAgICBsZXQgciA9IChpZCAlIDJuID09IDBuKSA/WyBqSGFzaFZhbHVlLCBpSGFzaFZhbHVlXSA6IFsgaUhhc2hWYWx1ZSwgakhhc2hWYWx1ZV07XG4gICAgICAgIGNvbnN0IGhhc2ggPSB0aGlzLmhhc2hGdW5jKHIpO1xuICAgICAgICBjb25zdCBqb2JzID0gW107XG4gICAgICAgIGlmIChpVmFsdWUgPT0gbnVsbCkge1xuICAgICAgICAgIGpvYnMucHVzaChtYW5hZ2VyLnVwc2VydChBY2NvdW50TWVya2xlVHJlZU5vZGUsIHtcbiAgICAgICAgICAgIGlkOiBpLnRvU3RyaW5nKCksXG4gICAgICAgICAgICBoYXNoOiBCaWdJbnQoaUhhc2hWYWx1ZSlcbiAgICAgICAgICB9LCBbJ2lkJ10pKTtcbiAgICAgICAgfSBcbiAgICAgICAgaWYgKGpWYWx1ZSA9PSBudWxsICYmIGogPCBwcmYubGVuZ3RoKSB7XG4gICAgICAgICAgam9icy5wdXNoKG1hbmFnZXIudXBzZXJ0KEFjY291bnRNZXJrbGVUcmVlTm9kZSwge1xuICAgICAgICAgICAgaWQ6IHByZltqXS50b1N0cmluZygpLFxuICAgICAgICAgICAgaGFzaDogQmlnSW50KGpIYXNoVmFsdWUpXG4gICAgICAgICAgfSwgWydpZCddKSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdXBkYXRlUm9vdCA9IGkgPj4gMW47XG4gICAgICAgIGlmICggdXBkYXRlUm9vdCA+PSAxbikge1xuICAgICAgICAgIGpvYnMucHVzaChtYW5hZ2VyLnVwc2VydChBY2NvdW50TWVya2xlVHJlZU5vZGUsIHtcbiAgICAgICAgICAgIGlkOiB1cGRhdGVSb290LnRvU3RyaW5nKCksXG4gICAgICAgICAgICBoYXNoOiBCaWdJbnQoaGFzaClcbiAgICAgICAgICB9LCBbJ2lkJ10pKTtcbiAgICAgICAgfVxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChqb2JzKTtcbiAgICAgICAgaisrO1xuICAgICAgfVxuICAgIH0pO1xuICAgIC8vIH1cbiAgICBjb25zb2xlLnRpbWVFbmQoJ3VwZGF0ZUxlYWYgZm9yIGFjY291bnQgdHJlZScpO1xuICB9XG4gIGFzeW5jIGdldExlYWYobGVhZl9pZDogYmlnaW50LCBvdGhlclBheWxvYWQ6IGFueSk6IFByb21pc2U8QWNjb3VudExlYWZOb2RlIHwgbnVsbD4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuYWNjb3VudExlYWZOb2RlUmVwb3NpdG9yeS5maW5kT25lQnkoe2xlYWZJZDogbGVhZl9pZC50b1N0cmluZygpfSk7XG4gICAgaWYgKHJlc3VsdCA9PSBudWxsKSB7XG4gICAgICAvLyBjaGVjayBsZXZlbFxuICAgICAgY29uc3QgaWQgPSB0aGlzLmdldExlYWZJZEluVHJlZShsZWFmX2lkKTtcbiAgICAgIGNvbnN0IGxldmVsID0gTWF0aC5mbG9vcihNYXRoLmxvZzIoTnVtYmVyKGlkKSkpO1xuICAgICAgY29uc3QgaGFzaCA9IHRoaXMuZ2V0RGVmYXVsdEhhc2hCeUxldmVsKGxldmVsKTtcbiAgICAgIC8vIHNldHVwIHRyYW5zYWN0aW9uXG4gICAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24udHJhbnNhY3Rpb24oYXN5bmMgKG1hbmFnZXIpID0+IHtcbiAgICAgICAgLy8gaW5zZXJ0IHRoaXMgbnVsbCBoYXNoIG9uIHRoaXMgbm9kZVxuICAgICAgICBhd2FpdCBtYW5hZ2VyLmluc2VydChBY2NvdW50TWVya2xlVHJlZU5vZGUsIHtcbiAgICAgICAgICBsZWFmSWQ6IGxlYWZfaWQsXG4gICAgICAgICAgaWQ6IGlkLnRvU3RyaW5nKCksXG4gICAgICAgICAgaGFzaDogQmlnSW50KGhhc2gpXG4gICAgICAgIH0pO1xuICAgICAgICBhd2FpdCBtYW5hZ2VyLmluc2VydChBY2NvdW50TGVhZk5vZGUsIHtcbiAgICAgICAgICBsZWFmSWQ6IGxlYWZfaWQudG9TdHJpbmcoKSxcbiAgICAgICAgICB0c0FkZHI6IDBuLFxuICAgICAgICAgIG5vbmNlOiAwbixcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBhd2FpdCB0aGlzLmFjY291bnRMZWFmTm9kZVJlcG9zaXRvcnkuZmluZE9uZUJ5KHtsZWFmSWQ6IGxlYWZfaWQudG9TdHJpbmcoKX0pOyAgIFxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0OyAgXG4gIH1cbiAgYXN5bmMgZ2V0Um9vdCgpIHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmFjY291bnRNZXJrbGVUcmVlUmVwb3NpdG9yeS5maW5kT25lQnkoe1xuICAgICAgaWQ6IDFuLnRvU3RyaW5nKCksXG4gICAgfSk7XG4gICAgaWYgKHJlc3VsdCA9PSBudWxsKSB7XG4gICAgICBjb25zdCBoYXNoID0gYXdhaXQgdGhpcy5nZXREZWZhdWx0SGFzaEJ5TGV2ZWwoMSk7XG4gICAgICBhd2FpdCB0aGlzLmFjY291bnRNZXJrbGVUcmVlUmVwb3NpdG9yeS5pbnNlcnQoe1xuICAgICAgICBpZDogMW4udG9TdHJpbmcoKSxcbiAgICAgICAgaGFzaDogQmlnSW50KGhhc2gpXG4gICAgICB9KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlkOiAxbi50b1N0cmluZygpLFxuICAgICAgICBoYXNoOiBoYXNoXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7ICBcbiAgfVxufSIsImltcG9ydCB7IEluamVjdGFibGUsIExvZ2dlciB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcbmltcG9ydCB7IENvbmZpZ1NlcnZpY2UgfSBmcm9tICdAbmVzdGpzL2NvbmZpZyc7XG5pbXBvcnQgeyBJbmplY3RSZXBvc2l0b3J5IH0gZnJvbSAnQG5lc3Rqcy90eXBlb3JtJztcblxuaW1wb3J0IHsgQ29ubmVjdGlvbiwgSXNOdWxsLCBOb3QsIFJlcG9zaXRvcnkgfSBmcm9tICd0eXBlb3JtJztcbmltcG9ydCB7IHRvVHJlZUxlYWYsIHRzSGFzaEZ1bmMgfSBmcm9tICcuLi9jb21tb24vdHMtaGVscGVyJztcbmltcG9ydCB7IFRzTWVya2xlVHJlZSB9IGZyb20gJy4uL2NvbW1vbi90c01lcmtsZVRyZWUnO1xuaW1wb3J0IHsgVG9rZW5UcmVlUmVzcG9uc2VEdG8gfSBmcm9tICcuL2R0by90b2tlblRyZWVSZXNwb25zZS5kdG8nO1xuaW1wb3J0IHsgVXBkYXRlVG9rZW5UcmVlRHRvIH0gZnJvbSAnLi9kdG8vdXBkYXRlVG9rZW5UcmVlLmR0byc7XG5pbXBvcnQgeyBUb2tlbkxlYWZOb2RlIH0gZnJvbSAnLi90b2tlbkxlYWZOb2RlLmVudGl0eSc7XG5pbXBvcnQgeyBUb2tlbk1lcmtsZVRyZWVOb2RlIH0gZnJvbSAnLi90b2tlbk1lcmtsZVRyZWVOb2RlLmVudGl0eSc7XG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVHNUb2tlblRyZWVTZXJ2aWNlIGV4dGVuZHMgVHNNZXJrbGVUcmVlPFRva2VuTGVhZk5vZGU+IHtcbiAgcHJpdmF0ZSBsb2dnZXI6IExvZ2dlciA9IG5ldyBMb2dnZXIoVHNUb2tlblRyZWVTZXJ2aWNlLm5hbWUpO1xuICBjb25zdHJ1Y3RvcihcbiAgICBASW5qZWN0UmVwb3NpdG9yeShUb2tlbkxlYWZOb2RlKVxuICAgIHByaXZhdGUgcmVhZG9ubHkgdG9rZW5MZWFmUmVwb3NpdG9yeTogUmVwb3NpdG9yeTxUb2tlbkxlYWZOb2RlPixcbiAgICBASW5qZWN0UmVwb3NpdG9yeShUb2tlbk1lcmtsZVRyZWVOb2RlKVxuICAgIHByaXZhdGUgcmVhZG9ubHkgdG9rZW5NZXJrbGVUcmVlUmVwb3NpdG9yeTogUmVwb3NpdG9yeTxUb2tlbk1lcmtsZVRyZWVOb2RlPixcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNvbm5lY3Rpb246IENvbm5lY3Rpb24sXG4gICAgcHJpdmF0ZSBjb25maWdTZXJ2aWNlOiBDb25maWdTZXJ2aWNlLFxuICApIHtcbiAgICBjb25zb2xlLnRpbWUoJ2luaXQgdG9rZW4gdHJlZScpO1xuICAgIHN1cGVyKGNvbmZpZ1NlcnZpY2UuZ2V0PG51bWJlcj4oJ1RPS0VOU19UUkVFX0hFSUdIVCcsIDIpLCB0c0hhc2hGdW5jKTtcbiAgICBjb25zb2xlLnRpbWVFbmQoJ2luaXQgdG9rZW4gdHJlZScpO1xuICB9XG4gIGFzeW5jIGdldEN1cnJlbnRMZWFmSWRDb3VudChhY2NvdW50SWQ6IGJpZ2ludCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgY29uc3QgbGVhZklkQ291bnQgPSBhd2FpdCB0aGlzLnRva2VuTWVya2xlVHJlZVJlcG9zaXRvcnkuY291bnQoXG4gICAgICB7XG4gICAgICAgIHdoZXJlOiB7XG4gICAgICAgICAgYWNjb3VudElkOiBhY2NvdW50SWQudG9TdHJpbmcoKSxcbiAgICAgICAgICBsZWFmSWQ6IE5vdChJc051bGwoKSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICk7XG4gICAgcmV0dXJuIGxlYWZJZENvdW50O1xuICB9XG4gIGdldExlYWZEZWZhdWx0VmF2bHVlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRvVHJlZUxlYWYoWzBuLCAwbiwgMG5dKTtcbiAgfVxuICBhc3luYyB1cGRhdGVMZWFmKGxlYWZJZDogYmlnaW50LCB2YWx1ZTogVXBkYXRlVG9rZW5UcmVlRHRvKSB7XG4gICAgY29uc29sZS50aW1lKCd1cGRhdGVMZWFmIGZvciB0b2tlbiB0cmVlJyk7XG4gICAgY29uc3QgcHJmID0gdGhpcy5nZXRQcm9vZklkcyhsZWFmSWQpO1xuICAgIGNvbnN0IGlkID0gdGhpcy5nZXRMZWFmSWRJblRyZWUobGVhZklkKTtcbiAgICBjb25zdCBsZWFmSGFzaCA9IHRvVHJlZUxlYWYoW0JpZ0ludCh2YWx1ZS5sZWFmSWQpLCBCaWdJbnQodmFsdWUubG9ja2VkQW10KSwgQmlnSW50KHZhbHVlLmF2YWlsYWJsZUFtdCldKTtcbiAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24udHJhbnNhY3Rpb24oYXN5bmMgKG1hbmFnZXIpID0+IHtcbiAgICAgIGNvbnN0IGFjY291bnRJZCA9IHZhbHVlLmFjY291bnRJZDtcbiAgICAgIC8vIHVwZGF0ZSBsZWFmXG4gICAgICBhd2FpdCBtYW5hZ2VyLnVwc2VydChUb2tlbk1lcmtsZVRyZWVOb2RlLCB7XG4gICAgICAgIGFjY291bnRJZDogYWNjb3VudElkLFxuICAgICAgICBpZDogaWQudG9TdHJpbmcoKSxcbiAgICAgICAgbGVhZklkOiBsZWFmSWQudG9TdHJpbmcoKSxcbiAgICAgICAgaGFzaDogQmlnSW50KGxlYWZIYXNoKVxuICAgICAgfSwgWydpZCcsICdhY2NvdW50SWQnXSk7XG4gICAgICBhd2FpdCBtYW5hZ2VyLnVwc2VydChUb2tlbkxlYWZOb2RlLCB7XG4gICAgICAgIGxlYWZJZDogIGxlYWZJZC50b1N0cmluZygpLFxuICAgICAgICBhY2NvdW50SWQ6IGFjY291bnRJZCxcbiAgICAgICAgbG9ja2VkQW10OiBCaWdJbnQodmFsdWUubG9ja2VkQW10KSxcbiAgICAgICAgYXZhaWxhYmxlQW10OiBCaWdJbnQodmFsdWUuYXZhaWxhYmxlQW10KSAgICAgICBcbiAgICAgIH0sIFsnbGVhZklkJywgJ2FjY291bnRJZCddKTtcbiAgICAgIC8vIHVwZGF0ZSBwcm9vZlxuICAgICAgZm9yIChsZXQgaSA9IGlkLCBqID0gMDsgaSA+IDFuOyBpID0gaSA+PiAxbikge1xuICAgICAgICBjb25zdCBbaVZhbHVlLCBqVmFsdWUgXT0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgIHRoaXMudG9rZW5NZXJrbGVUcmVlUmVwb3NpdG9yeS5maW5kT25lQnkoe2lkOiBpLnRvU3RyaW5nKCksIGFjY291bnRJZDogYWNjb3VudElkfSksXG4gICAgICAgICAgdGhpcy50b2tlbk1lcmtsZVRyZWVSZXBvc2l0b3J5LmZpbmRPbmVCeSh7aWQ6IHByZltqXS50b1N0cmluZygpLCBhY2NvdW50SWQ6IGFjY291bnRJZH0pXG4gICAgICAgIF0pO1xuICAgICAgICBjb25zdCBqTGV2ZWwgPSBNYXRoLmZsb29yKE1hdGgubG9nMihOdW1iZXIocHJmW2pdKSkpO1xuICAgICAgICBjb25zdCBpTGV2ZWwgPSBNYXRoLmZsb29yKE1hdGgubG9nMihOdW1iZXIoaSkpKTtcbiAgICAgICAgY29uc3Qgakhhc2hWYWx1ZTogc3RyaW5nID0gKGpWYWx1ZSA9PSBudWxsKT8gdGhpcy5nZXREZWZhdWx0SGFzaEJ5TGV2ZWwoakxldmVsKTogalZhbHVlLmhhc2gudG9TdHJpbmcoKTtcbiAgICAgICAgY29uc3QgaUhhc2hWYWx1ZTogc3RyaW5nID0gKGlWYWx1ZSA9PSBudWxsKT8gdGhpcy5nZXREZWZhdWx0SGFzaEJ5TGV2ZWwoaUxldmVsKTogaVZhbHVlLmhhc2gudG9TdHJpbmcoKTtcbiAgICAgICAgbGV0IHIgPSAoaWQgJSAybiA9PSAwbikgP1sgakhhc2hWYWx1ZSwgaUhhc2hWYWx1ZV0gOiBbIGlIYXNoVmFsdWUsIGpIYXNoVmFsdWVdO1xuICAgICAgICBjb25zdCBoYXNoID0gdGhpcy5oYXNoRnVuYyhyKTtcbiAgICAgICAgY29uc3Qgam9icyA9IFtdO1xuICAgICAgICBpZiAoaVZhbHVlID09IG51bGwpIHtcbiAgICAgICAgICBqb2JzLnB1c2gobWFuYWdlci51cHNlcnQoVG9rZW5NZXJrbGVUcmVlTm9kZSwge1xuICAgICAgICAgICAgaWQ6IGkudG9TdHJpbmcoKSwgYWNjb3VudElkOiBhY2NvdW50SWQsIGhhc2g6IEJpZ0ludChpSGFzaFZhbHVlKVxuICAgICAgICAgIH0sIFsnaWQnLCAnYWNjb3VudElkJ10pKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoalZhbHVlID09IG51bGwgJiYgaiA8IHByZi5sZW5ndGgpIHtcbiAgICAgICAgICBqb2JzLnB1c2gobWFuYWdlci51cHNlcnQoVG9rZW5NZXJrbGVUcmVlTm9kZSwge1xuICAgICAgICAgICAgaWQ6IHByZltqXS50b1N0cmluZygpLCBhY2NvdW50SWQ6IGFjY291bnRJZCwgaGFzaDogQmlnSW50KGpIYXNoVmFsdWUpXG4gICAgICAgICAgfSwgWydpZCcsICdhY2NvdW50SWQnXSkpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHVwZGF0ZVJvb3QgPSBpID4+IDFuO1xuICAgICAgICBpZiAoIHVwZGF0ZVJvb3QgPj0gMW4pIHtcbiAgICAgICAgICBqb2JzLnB1c2godGhpcy50b2tlbk1lcmtsZVRyZWVSZXBvc2l0b3J5LnVwc2VydChbe1xuICAgICAgICAgICAgaWQ6IHVwZGF0ZVJvb3QudG9TdHJpbmcoKSwgYWNjb3VudElkOiBhY2NvdW50SWQsIGhhc2g6IEJpZ0ludChoYXNoKVxuICAgICAgICAgIH1dLCBbJ2lkJywgJ2FjY291bnRJZCddKSk7XG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoam9icyk7XG4gICAgICAgIGorKztcbiAgICAgIH1cbiAgICB9KTtcbiAgICBjb25zb2xlLnRpbWVFbmQoJ3VwZGF0ZUxlYWYgZm9yIHRva2VuIHRyZWUnKTtcbiAgfVxuICBhc3luYyBnZXRMZWFmKGxlYWZfaWQ6IGJpZ2ludCwgYWNjb3VudElkOiBzdHJpbmcpOiBQcm9taXNlPFRva2VuTGVhZk5vZGUgfCBudWxsPiB7XG4gICAgY29uc3QgcmVzdWx0ID0gIGF3YWl0IHRoaXMudG9rZW5MZWFmUmVwb3NpdG9yeS5maW5kT25lQnkoe2xlYWZJZDogbGVhZl9pZC50b1N0cmluZygpXG4gICAgICAsIGFjY291bnRJZDogYWNjb3VudElkfSk7XG4gICAgaWYgKHJlc3VsdCA9PSBudWxsKSB7XG4gICAgICAvLyBjaGVjayBsZXZlbFxuICAgICAgY29uc3QgaWQgPSB0aGlzLmdldExlYWZJZEluVHJlZShsZWFmX2lkKTtcbiAgICAgIGNvbnN0IGxldmVsID0gTWF0aC5mbG9vcihNYXRoLmxvZzIoTnVtYmVyKGlkKSkpO1xuICAgICAgY29uc3QgaGFzaCA9IHRoaXMuZ2V0RGVmYXVsdEhhc2hCeUxldmVsKGxldmVsKTtcbiAgICAgIC8vIHN0YXJ0IHRyYW5zYWN0aW9uXG4gICAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24udHJhbnNhY3Rpb24oYXN5bmMgKG1hbmFnZXIpID0+IHtcbiAgICAgICAgLy8gaW5zZXJ0IHRoaXMgbnVsbCBoYXNoIG9uIHRoaXMgbm9kZVxuICAgICAgICBhd2FpdCBtYW5hZ2VyLmluc2VydChUb2tlbk1lcmtsZVRyZWVOb2RlLCB7XG4gICAgICAgICAgYWNjb3VudElkOiBhY2NvdW50SWQsXG4gICAgICAgICAgaWQ6IGlkLnRvU3RyaW5nKCksXG4gICAgICAgICAgbGVhZklkOiBsZWFmX2lkLnRvU3RyaW5nKCksXG4gICAgICAgICAgaGFzaDogQmlnSW50KGhhc2gpXG4gICAgICAgIH0pO1xuICAgICAgICBhd2FpdCBtYW5hZ2VyLmluc2VydChUb2tlbkxlYWZOb2RlLCB7XG4gICAgICAgICAgbGVhZklkOiBsZWFmX2lkLnRvU3RyaW5nKCksXG4gICAgICAgICAgYWNjb3VudElkOiBhY2NvdW50SWQsXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gIGF3YWl0IHRoaXMudG9rZW5MZWFmUmVwb3NpdG9yeS5maW5kT25lQnkoe2xlYWZJZDogbGVhZl9pZC50b1N0cmluZygpLCBhY2NvdW50SWQ6IGFjY291bnRJZH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIGFzeW5jIGdldFJvb3QoYWNjb3VudElkOiBzdHJpbmcpOiBQcm9taXNlPFRva2VuVHJlZVJlc3BvbnNlRHRvPiB7XG4gICAgY29uc3QgcmVzdWx0ID0gIGF3YWl0IHRoaXMudG9rZW5NZXJrbGVUcmVlUmVwb3NpdG9yeS5maW5kT25lQnkoe2FjY291bnRJZDogYWNjb3VudElkLCBpZDogMW4udG9TdHJpbmcoKX0pO1xuICAgIGlmIChyZXN1bHQgPT0gbnVsbCkge1xuICAgICAgY29uc3QgaGFzaCA9IHRoaXMuZ2V0RGVmYXVsdEhhc2hCeUxldmVsKDEpO1xuICAgICAgYXdhaXQgdGhpcy50b2tlbk1lcmtsZVRyZWVSZXBvc2l0b3J5Lmluc2VydCh7XG4gICAgICAgIGFjY291bnRJZDogYWNjb3VudElkLFxuICAgICAgICBpZDogMW4udG9TdHJpbmcoKSxcbiAgICAgICAgaGFzaDogQmlnSW50KGhhc2gpXG4gICAgICB9KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGFjY291bnRJZDogYWNjb3VudElkLFxuICAgICAgICBpZDogMSxcbiAgICAgICAgbGVhZklkOiBudWxsLFxuICAgICAgICBoYXNoOiBoYXNoXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHJlc3VsdEhhc2ggPSByZXN1bHQuaGFzaCA/IHJlc3VsdC5oYXNoLnRvU3RyaW5nKCkgOiAnJztcbiAgICByZXR1cm4ge1xuICAgICAgYWNjb3VudElkOiBhY2NvdW50SWQsXG4gICAgICBpZDogMSxcbiAgICAgIGxlYWZJZDogbnVsbCxcbiAgICAgIGhhc2g6IHJlc3VsdEhhc2gsXG4gICAgfTtcbiAgfVxuICBcbn0iLCJpbXBvcnQgeyBBcGlQcm9wZXJ0eSB9IGZyb20gXCJAbmVzdGpzL3N3YWdnZXJcIjtcblxuZXhwb3J0IGNsYXNzIE1hcmtldFBhaXJJbmZvUmVzcG9uc2VEdG8ge1xuICBAQXBpUHJvcGVydHkoKVxuICBtYWluVG9rZW5JZCE6IHN0cmluZztcbiAgQEFwaVByb3BlcnR5KClcbiAgYmFzZVRva2VuSWQhOiBzdHJpbmc7XG4gIEBBcGlQcm9wZXJ0eSgpXG4gIG1hcmtldFBhaXIhOiBzdHJpbmc7XG59XG5leHBvcnQgY2xhc3MgTWFya2V0UGFpciB7XG4gIEBBcGlQcm9wZXJ0eSgpXG4gIG1haW5Ub2tlbklkITogc3RyaW5nO1xuICBAQXBpUHJvcGVydHkoKVxuICBiYXNlVG9rZW5JZCE6IHN0cmluZztcbn1cbmV4cG9ydCBjbGFzcyBNYXJrZXRQYWlySW5mb1JlcXVlc3REdG8ge1xuICBAQXBpUHJvcGVydHkoKVxuICBwYWlycyE6IE1hcmtldFBhaXJbXTtcbn1cblxuZXhwb3J0IGNsYXNzIE1hcmtldFNlbGxCdXlQYWlyIHtcbiAgQEFwaVByb3BlcnR5KClcbiAgc2VsbFRva2VuSWQhOiBzdHJpbmc7XG4gIEBBcGlQcm9wZXJ0eSgpXG4gIGJ1eVRva2VuSWQhOiBzdHJpbmc7XG59IiwiaW1wb3J0IHsgQXBpUHJvcGVydHkgfSBmcm9tICdAbmVzdGpzL3N3YWdnZXInO1xuXG5leHBvcnQgY2xhc3MgVXBkYXRlT2JzT3JkZXJUcmVlRHRvIHtcbiAgQEFwaVByb3BlcnR5KHtcbiAgICB0eXBlOiBTdHJpbmdcbiAgfSlcbiAgb3JkZXJMZWFmSWQhOiBzdHJpbmc7XG4gIEBBcGlQcm9wZXJ0eSh7XG4gICAgdHlwZTogU3RyaW5nXG4gIH0pXG4gIHR4SWQhOiBzdHJpbmc7XG4gIEBBcGlQcm9wZXJ0eSh7XG4gICAgdHlwZTogU3RyaW5nXG4gIH0pXG4gIHJlcVR5cGUhOiBzdHJpbmc7XG4gIEBBcGlQcm9wZXJ0eSh7XG4gICAgdHlwZTogU3RyaW5nXG4gIH0pXG4gIHNlbmRlciE6IHN0cmluZztcbiAgQEFwaVByb3BlcnR5KHtcbiAgICB0eXBlOiBTdHJpbmdcbiAgfSlcbiAgc2VsbFRva2VuSWQhOiBzdHJpbmc7XG4gIEBBcGlQcm9wZXJ0eSh7XG4gICAgdHlwZTogU3RyaW5nXG4gIH0pXG4gIG5vbmNlITogc3RyaW5nO1xuICBAQXBpUHJvcGVydHkoe1xuICAgIHR5cGU6IFN0cmluZ1xuICB9KVxuICBzZWxsQW10ITogc3RyaW5nO1xuICBAQXBpUHJvcGVydHkoe1xuICAgIHR5cGU6IFN0cmluZ1xuICB9KVxuICBidXlUb2tlbklkITogc3RyaW5nO1xuICBAQXBpUHJvcGVydHkoe1xuICAgIHR5cGU6IFN0cmluZ1xuICB9KVxuICBidXlBbXQhOiBzdHJpbmc7XG4gIEBBcGlQcm9wZXJ0eSh7XG4gICAgdHlwZTogU3RyaW5nXG4gIH0pXG4gIGFjY3VtdWxhdGVkU2VsbEFtdCE6IHN0cmluZztcbiAgQEFwaVByb3BlcnR5KHtcbiAgICB0eXBlOiBTdHJpbmdcbiAgfSlcbiAgYWNjdW11bGF0ZWRCdXlBbXQhOiBzdHJpbmc7XG4gIEBBcGlQcm9wZXJ0eSh7XG4gICAgdHlwZTogU3RyaW5nXG4gIH0pXG4gIG9yZGVySWQhOiBzdHJpbmc7XG59IiwiaW1wb3J0IHsgR2xvYmFsLCBNb2R1bGUgfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5pbXBvcnQgeyBDb25maWdNb2R1bGUsIENvbmZpZ1NlcnZpY2UgfSBmcm9tICdAbmVzdGpzL2NvbmZpZyc7XG5pbXBvcnQgeyBUeXBlT3JtTW9kdWxlIH0gZnJvbSAnQG5lc3Rqcy90eXBlb3JtJztcbmltcG9ydCB7IEF1Y3Rpb25PcmRlckxlYWZOb2RlIH0gZnJvbSAnLi9hdWN0aW9uT3JkZXJMZWFmTm9kZS5lbnRpdHknO1xuaW1wb3J0IHsgQXVjdGlvbkJvbmRUb2tlbkVudGl0eSB9IGZyb20gJy4vYXVjdGlvbkJvbmRUb2tlbi5lbnRpdHknO1xuaW1wb3J0IHsgQXVjdGlvbk9yZGVyTWVya2xlVHJlZU5vZGUgfSBmcm9tICcuL2F1Y3Rpb25PcmRlck1lcmtsZVRyZWVOb2RlLmVudGl0eSc7XG5pbXBvcnQgeyBPYnNPcmRlckVudGl0eSB9IGZyb20gJy4vb2JzT3JkZXIuZW50aXR5JztcbmltcG9ydCB7IE9ic09yZGVyTGVhZkVudGl0eSB9IGZyb20gJy4vb2JzT3JkZXJMZWFmLmVudGl0eSc7XG5pbXBvcnQgeyBNYXRjaE9ic09yZGVyRW50aXR5IH0gZnJvbSAnLi9tYXRjaE9ic09yZGVyLmVudGl0eSc7XG5pbXBvcnQgeyBDYW5kbGVTdGlja0VudGl0eSB9IGZyb20gJy4vY2FuZGxlU3RpY2suZW50aXR5JztcbmltcG9ydCB7IE9ic09yZGVyTGVhZk1lcmtsZVRyZWVOb2RlIH0gZnJvbSAnLi9vYnNPcmRlckxlYWZNZXJrbGVUcmVlTm9kZS5lbnRpdHknO1xuaW1wb3J0IHsgTWFya2V0UGFpckluZm9FbnRpdHkgfSBmcm9tICcuL21hcmtldFBhaXJJbmZvLmVudGl0eSc7XG5pbXBvcnQgeyBNYXJrZXRQYWlySW5mb1NlcnZpY2UgfSBmcm9tICcuL21hcmtldFBhaXJJbmZvLnNlcnZpY2UnO1xuaW1wb3J0IHsgQXZhaWxhYmxlVmlld0VudGl0eSB9IGZyb20gJy4vYXZhaWxhYmxlVmlldy5lbnRpdHknO1xuXG5AR2xvYmFsKClcbkBNb2R1bGUoe1xuICBpbXBvcnRzOiBbQ29uZmlnTW9kdWxlLCBUeXBlT3JtTW9kdWxlLmZvckZlYXR1cmUoW1xuICAgIC8vIEF1Y3Rpb25PcmRlck1lcmtsZVRyZWVOb2RlLFxuICAgIC8vIEF1Y3Rpb25PcmRlckxlYWZOb2RlLFxuICAgIE9ic09yZGVyRW50aXR5LFxuICAgIE9ic09yZGVyTGVhZkVudGl0eSxcbiAgICBPYnNPcmRlckxlYWZNZXJrbGVUcmVlTm9kZSxcbiAgICBNYXRjaE9ic09yZGVyRW50aXR5LFxuICAgIE1hcmtldFBhaXJJbmZvRW50aXR5LFxuICAgIENhbmRsZVN0aWNrRW50aXR5LCBcbiAgICBBdWN0aW9uQm9uZFRva2VuRW50aXR5LFxuICAgIEF2YWlsYWJsZVZpZXdFbnRpdHlcbiAgXSldLFxuICBwcm92aWRlcnM6IFtDb25maWdTZXJ2aWNlLCBNYXJrZXRQYWlySW5mb1NlcnZpY2VdLFxuICBleHBvcnRzOiBbVHlwZU9ybU1vZHVsZSwgTWFya2V0UGFpckluZm9TZXJ2aWNlXVxufSlcbmV4cG9ydCBjbGFzcyBBdWN0aW9uT3JkZXJNb3VkbGUge30iLCJpbXBvcnQgeyBUc1Rva2VuQWRkcmVzcyB9IGZyb20gJ0B0cy1zZGsvZG9tYWluL2xpYi90cy10eXBlcy90cy10eXBlcyc7XG5pbXBvcnQgeyBDb2x1bW4sIENyZWF0ZURhdGVDb2x1bW4sIEVudGl0eSwgUHJpbWFyeUdlbmVyYXRlZENvbHVtbiwgVXBkYXRlRGF0ZUNvbHVtbiB9IGZyb20gJ3R5cGVvcm0nO1xuXG5leHBvcnQgZW51bSBCb25kVG9rZW5TdGF0dXNJbmRleCB7XG4gIGlzTDFEZXBsb3llZCA9IDEsXG4gIGlzQXZhaWxhYmxlID0gMixcbiAgaXNFeGNjZWVkZWQgPSA0LFxufVxuXG5ARW50aXR5KCdBdWN0aW9uQm9uZFRva2VuJywgeyBzY2hlbWE6ICdwdWJsaWMnfSkgXG5leHBvcnQgY2xhc3MgQXVjdGlvbkJvbmRUb2tlbkVudGl0eSB7XG4gIEBQcmltYXJ5R2VuZXJhdGVkQ29sdW1uKHtcbiAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgbmFtZTogJ2JvbmRJZCcsXG4gIH0pXG4gIGJvbmRJZCE6IG51bWJlcjtcblxuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndmFyY2hhcicsXG4gICAgbmFtZTogJ0wxQWRkcicsXG4gICAgbnVsbGFibGU6IHRydWUsXG4gICAgbGVuZ3RoOiAyNTYsXG4gIH0pXG4gIEwxQWRkcj86IHN0cmluZztcblxuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ0wyQWRkcicsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gIH0pXG4gIEwyQWRkciE6IFRzVG9rZW5BZGRyZXNzO1xuXG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAndW5kZXJseWluZ1Rva2VuJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgfSlcbiAgdW5kZXJseWluZ1Rva2VuITogVHNUb2tlbkFkZHJlc3M7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICBuYW1lOiAnbGFzdFN5bmNCbG9ja251bWJlckZvckRlcG9zaXRFdmVudCcsXG4gICAgZGVmYXVsdDogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gIH0pXG4gIGxhc3RTeW5jQmxvY2tudW1iZXJGb3JEZXBvc2l0RXZlbnQhOiBudW1iZXI7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICd0aW1lc3RhbXAgd2l0aG91dCB0aW1lIHpvbmUnLFxuICAgIG5hbWU6ICdtYXR1cml0eURhdGUnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgfSlcbiAgbWF0dXJpdHlEYXRlITogRGF0ZTtcblxuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgbmFtZTogJ3N0YXR1cycsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6ICgpID0+IDAsXG4gIH0pXG4gIHN0YXR1cyE6IG51bWJlcjtcbiAgZ2V0U3RhdHVzKHN0YXR1c0lkOiBCb25kVG9rZW5TdGF0dXNJbmRleCk6IEJvbmRUb2tlblN0YXR1c0luZGV4IHtcbiAgICByZXR1cm4gdGhpcy5zdGF0dXMgJiBzdGF0dXNJZDtcbiAgfVxuICBzZXRTdGF0dXMoc3RhdHVzSWQ6IEJvbmRUb2tlblN0YXR1c0luZGV4KTogdm9pZCB7XG4gICAgdGhpcy5zdGF0dXMgfD0gc3RhdHVzSWQ7XG4gIH1cblxuICBAQ3JlYXRlRGF0ZUNvbHVtbih7XG4gICAgdHlwZTogJ3RpbWVzdGFtcCB3aXRob3V0IHRpbWUgem9uZScsXG4gICAgbmFtZTogJ2NyZWF0ZWRBdCcsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6ICdub3coKScsXG4gIH0pXG4gIGNyZWF0ZWRBdCE6IERhdGU7XG4gIEBVcGRhdGVEYXRlQ29sdW1uKHtcbiAgICB0eXBlOiAndGltZSB3aXRob3V0IHRpbWUgem9uZScsXG4gICAgbmFtZTogJ3VwZGF0ZWRBdCcsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6ICdub3coKScsXG4gIH0pXG4gIHVwZGF0ZWRBdCE6IERhdGU7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICd2YXJjaGFyJyxcbiAgICBuYW1lOiAndXBkYXRlZEJ5JyxcbiAgICBudWxsYWJsZTogdHJ1ZSxcbiAgICBsZW5ndGg6IDI1NixcbiAgfSlcbiAgdXBkYXRlZEJ5ITogc3RyaW5nIHwgbnVsbDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ3ZhcmNoYXInLFxuICAgIG5hbWU6ICdkZWxldGVkQnknLFxuICAgIG51bGxhYmxlOiB0cnVlLFxuICAgIGxlbmd0aDogMjU2LFxuICB9KVxuICBkZWxldGVkQnkhOiBzdHJpbmcgfCBudWxsO1xufSIsImV4cG9ydCBjb25zdCBMRU5fT0ZfUkVRVUVTVCA9IDEwO1xuZXhwb3J0IGNvbnN0IENIVU5LX0JZVEVTX1NJWkUgPSAxMjtcbmV4cG9ydCBjb25zdCBDSFVOS19CSVRTX1NJWkUgPSBDSFVOS19CWVRFU19TSVpFICogODtcbmV4cG9ydCBjb25zdCBNSU5fQ0hVTktTX1BFUl9SRVEgPSAzO1xuZXhwb3J0IGNvbnN0IE1BWF9DSFVOS1NfUEVSX1JFUSA9IDk7XG5leHBvcnQgY29uc3QgTUFYX0NIVU5LU19CWVRFU19QRVJfUkVRID0gTUFYX0NIVU5LU19QRVJfUkVRICogQ0hVTktfQllURVNfU0laRTtcbmV4cG9ydCBmdW5jdGlvbiBnZXRPQ2h1bmtzU2l6ZShiYXRjaFNpemU6IG51bWJlcikge1xuICByZXR1cm4gTUFYX0NIVU5LU19QRVJfUkVRICogYmF0Y2hTaXplO1xufVxuXG5leHBvcnQgZW51bSBUc1N5c3RlbUFjY291bnRBZGRyZXNzIHtcbiAgQlVSTl9BRERSID0gJzAnLFxuICBNSU5UX0FERFIgPSAnMCcsXG4gIFdJVEhEUkFXX0FERFIgPSAnMCcsXG4gIEFVQ1RJT05fQUREUiA9ICcwJyxcbn1cblxuZXhwb3J0IGNvbnN0IFRzRGVmYXVsdFZhbHVlID0ge1xuICBOT05DRV9aRVJPOiAnMCcsXG4gIEJJR0lOVF9ERUZBVUxUX1ZBTFVFOiAwbixcbiAgU1RSSU5HX0RFRkFVTFRfVkFMVUU6ICcwJyxcbiAgQUREUkVTU19ERUZBVUxUX1ZBTFVFOiAnMHgwMCcsXG59O1xuXG5cbmV4cG9ydCBlbnVtIFRzVHhUeXBlIHtcbiAgVU5LTk9XTiA9ICcwJyxcbiAgTk9PUCA9ICcwJyxcbiAgUkVHSVNURVIgPSAnMScsXG4gIERFUE9TSVQgPSAnMicsXG4gIC8vIFRSQU5TRkVSID0gJzMnLFxuICBXSVRIRFJBVyA9ICczJyxcbiAgU2Vjb25kTGltaXRPcmRlciA9ICc0JyxcbiAgU2Vjb25kTGltaXRTdGFydCA9ICc1JyxcbiAgU2Vjb25kTGltaXRFeGNoYW5nZSA9ICc2JyxcbiAgU2Vjb25kTGltaXRFbmQgPSAnNycsXG4gIFNlY29uZE1hcmtldE9yZGVyID0gJzgnLFxuICBTZWNvbmRNYXJrZXRFeGNoYW5nZSA9ICc5JyxcbiAgU2Vjb25kTWFya2V0RW5kID0gJzEwJyxcbiAgQ2FuY2VsT3JkZXIgPSAnMTEnLFxuXG4gIEFVQ1RJT05fTEVORCA9ICc5OScsXG4gIEFVQ1RJT05fQk9SUk9XID0gJzEwMCcsXG4gIEFVQ1RJT05fQ0FOQ0VMID0gJzEwMSdcbn1cblxuZXhwb3J0IGNvbnN0IFRzRGVjaWFtbCA9IHtcbiAgVFNfVE9LRU5fQU1PVU5UX0RFQzogMTgsXG4gIFRTX0lOVEVSRVNUX0RFQzogNixcbn07XG5cbmV4cG9ydCBlbnVtIFRzVG9rZW5BZGRyZXNzIHtcbiAgICBVbmtub3duID0gJzAnLFxuICAgIFdFVEggPSAnNicsXG4gICAgV0JUQyA9ICc3JyxcbiAgICBVU0RUID0gJzgnLFxuICAgIFVTREMgPSAnOScsXG4gICAgREFJID0gJzEwJyxcblxuICAgIC8vIFRPRE86IFRTTCBUb2tlbiBtYXBwaW5nXG4gICAgVHNsRVRIMjAyMjEyMzEgPSAnNDYnLFxuICAgIFRzbEJUQzIwMjIxMjMxID0gJzQ3JyxcbiAgICBUc2xVU0RUMjAyMjEyMzEgPSAnNDgnLFxuICAgIFRzbFVTREMyMDIyMTIzMSA9ICc0OScsXG4gICAgVHNsREFJMjAyMjEyMzEgPSAnNTAnLFxuICB9XG5cbmV4cG9ydCBpbnRlcmZhY2UgVHNUb2tlbkluZm8ge1xuICAgIGFtb3VudDogYmlnaW50O1xuICAgIGxvY2tBbXQ6IGJpZ2ludDtcbn1cbiIsImltcG9ydCB7IENvbHVtbiwgRW50aXR5LCBQcmltYXJ5R2VuZXJhdGVkQ29sdW1uIH0gZnJvbSAndHlwZW9ybSc7XG5cbkBFbnRpdHkoJ0NhbmRsZVN0aWNrJywge3NjaGVtYTogJ3B1YmxpYyd9KVxuZXhwb3J0IGNsYXNzIENhbmRsZVN0aWNrRW50aXR5IHtcbiAgQFByaW1hcnlHZW5lcmF0ZWRDb2x1bW4oe1xuICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICBuYW1lOiAnaWQnXG4gIH0pXG4gIGlkITogbnVtYmVyO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndGltZXN0YW1wIHdpdGhvdXQgdGltZSB6b25lJyxcbiAgICBuYW1lOiAndGltZXN0YW1wJyxcbiAgICBwcmVjaXNpb246IDMsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6ICdub3coKSdcbiAgfSlcbiAgdGltZXN0YW1wITogRGF0ZTtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ3ZhcmNoYXInLFxuICAgIG5hbWU6ICdtYXhQcmljZScsXG4gICAgbGVuZ3RoOiAnMzAwJyxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogJzAnXG4gIH0pXG4gIG1heFByaWNlITogc3RyaW5nO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndmFyY2hhcicsXG4gICAgbmFtZTogJ21pblByaWNlJyxcbiAgICBsZW5ndGg6ICczMDAnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAnMCdcbiAgfSlcbiAgbWluUHJpY2UhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICd2YXJjaGFyJyxcbiAgICBuYW1lOiAnb3BlblByaWNlJyxcbiAgICBsZW5ndGg6ICczMDAnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAnMCdcbiAgfSlcbiAgb3BlblByaWNlITogc3RyaW5nO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndmFyY2hhcicsXG4gICAgbmFtZTogJ2Nsb3NlUHJpY2UnLFxuICAgIGxlbmd0aDogJzMwMCcsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6ICcwJ1xuICB9KVxuICBjbG9zZVByaWNlITogc3RyaW5nO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndmFyY2hhcicsXG4gICAgbmFtZTogJ3ZvbHVtZScsXG4gICAgbGVuZ3RoOiAnMzAwJyxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogJzAnXG4gIH0pXG4gIHZvbHVtZSE6IHN0cmluZztcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ3ZhcmNoYXInLFxuICAgIG5hbWU6ICdtYXJrZXRQYWlyJyxcbiAgICBsZW5ndGg6ICczMDAnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiBgJ0VUSC9VU0RDJ2BcbiAgfSlcbiAgbWFya2V0UGFpciE6IHN0cmluZztcbn0iLCJpbXBvcnQgeyBzdHJpbmcgfSBmcm9tICdpby10cyc7XG5pbXBvcnQgeyBDb2x1bW4sIFByaW1hcnlDb2x1bW4sIFZpZXdFbnRpdHkgfSBmcm9tICd0eXBlb3JtJztcblxuQFZpZXdFbnRpdHkoJ0F2YWlsYWJsZVZpZXcnLCB7XG4gIHNjaGVtYTogJ3B1YmxpYycsXG4gIGV4cHJlc3Npb246IGBcblNFTEVDVCBcbiAgXCJ0b2tlbmxlYWZcIi5cImFjY291bnRJZFwiLFxuICBcInBlbmRpbmdPcmRlclwiLlwidG9rZW5JZFwiLFxuICAoXCJ0b2tlbmxlYWZcIi5cImxvY2tlZEFtdFwiICsgIFwicGVuZGluZ09yZGVyXCIuXCJzZWxsQW10XCIpIEFTIFwibG9ja2VkQW10XCIsXG4gIChcInRva2VubGVhZlwiLlwiYXZhaWxhYmxlQW10XCIgLSBcInBlbmRpbmdPcmRlclwiLlwic2VsbEFtdFwiKSBBUyBcImF2YWlsYWJsZUFtdFwiXG5GUk9NIChTRUxFQ1QgXG4gIFwiYWNjb3VudElkXCIsXG4gIFNVTSh0aS5hbW91bnQpIEFTIFwic2VsbEFtdFwiLFxuICBcInRva2VuSWRcIlxuRlJPTSBcIlRyYW5zYWN0aW9uSW5mb1wiIHRpIFxuV0hFUkUgdGkuXCJ0eFN0YXR1c1wiID0gJ1BFTkRJTkcnXG5HUk9VUCBCWSB0aS5cImFjY291bnRJZFwiLCB0aS5cInRva2VuSWRcIlxuKSBBUyBcInBlbmRpbmdPcmRlclwiXG5KT0lOIFwiVG9rZW5MZWFmTm9kZVwiIFwidG9rZW5sZWFmXCJcbk9OIFwidG9rZW5sZWFmXCIuXCJhY2NvdW50SWRcIiA9IFwicGVuZGluZ09yZGVyXCIuXCJhY2NvdW50SWRcIiBBTkQgXCJ0b2tlbmxlYWZcIi5cImxlYWZJZFwiID0gXCJwZW5kaW5nT3JkZXJcIi5cInRva2VuSWRcIjsgXG4gIGBcbn0pXG5leHBvcnQgY2xhc3MgQXZhaWxhYmxlVmlld0VudGl0eSB7XG4gIEBQcmltYXJ5Q29sdW1uKHtcbiAgICBuYW1lOiAnYWNjb3VudElkJyxcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMFxuICB9KVxuICBhY2NvdW50SWQhOiBzdHJpbmc7XG4gIEBQcmltYXJ5Q29sdW1uKHtcbiAgICBuYW1lOiAndG9rZW5JZCcsXG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDBcbiAgfSlcbiAgdG9rZW5JZCE6IHN0cmluZztcbiAgQENvbHVtbih7XG4gICAgbmFtZTogJ2F2YWlsYWJsZUFtdCcsXG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgZGVmYXVsdDogMG5cbiAgfSlcbiAgYXZhaWxhYmxlQW10ITogYmlnaW50O1xuICBAQ29sdW1uKHtcbiAgICBuYW1lOiAnbG9ja2VkQW10JyxcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBkZWZhdWx0OiAwblxuICB9KVxuICBsb2NrZWRBbXQhOiBiaWdpbnQ7XG59XG4iLCJpbXBvcnQgeyBHbG9iYWwsIE1vZHVsZSB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcbmltcG9ydCB7IFR5cGVPcm1Nb2R1bGUgfSBmcm9tICdAbmVzdGpzL3R5cGVvcm0nO1xuaW1wb3J0IHsgUm9sbHVwSW5mb3JtYXRpb24gfSBmcm9tICcuL3JvbGx1cEluZm9ybWF0aW9uLmVudGl0eSc7XG5AR2xvYmFsKClcbkBNb2R1bGUoe1xuICBpbXBvcnRzOiBbVHlwZU9ybU1vZHVsZS5mb3JGZWF0dXJlKFtSb2xsdXBJbmZvcm1hdGlvbl0pXSxcbiAgZXhwb3J0czogW1R5cGVPcm1Nb2R1bGVdXG59KVxuZXhwb3J0IGNsYXNzIFJvbGx1cE1vZHVsZSB7fSIsImltcG9ydCB7IG5vdyB9IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyBnZXRQcm9jZXNzTmFtZSB9IGZyb20gJy4uLy4uLy4uLy4uL3RzLXNkay9zcmMvaGVscGVyJztcbmltcG9ydCB7IEJlZm9yZUluc2VydCwgQmVmb3JlUmVtb3ZlLCBCZWZvcmVVcGRhdGUsIENvbHVtbiwgQ3JlYXRlRGF0ZUNvbHVtbiwgRGVsZXRlRGF0ZUNvbHVtbiwgRW50aXR5LCBQcmltYXJ5Q29sdW1uLCBVcGRhdGVEYXRlQ29sdW1uIH0gZnJvbSAndHlwZW9ybSc7XG5cbkBFbnRpdHkoJ1JvbGx1cEluZm9ybWF0aW9uJywgeyBzY2hlbWE6ICdwdWJsaWMnIH0pXG5leHBvcnQgY2xhc3MgUm9sbHVwSW5mb3JtYXRpb24ge1xuICBAUHJpbWFyeUNvbHVtbih7XG4gICAgdHlwZTogJ2ludGVnZXInLFxuICAgIG5hbWU6ICdpZCcsXG4gICAgcHJpbWFyeTogdHJ1ZSxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZ2VuZXJhdGVkOiAnaW5jcmVtZW50J1xuICB9KVxuICBpZCE6IG51bWJlcjtcblxuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgbmFtZTogJ2xhc3RTeW5jQmxvY2tudW1iZXJGb3JSZWdpc3RlckV2ZW50JyxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gIH0pXG4gIGxhc3RTeW5jQmxvY2tudW1iZXJGb3JSZWdpc3RlckV2ZW50ITogbnVtYmVyO1xuXG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICBuYW1lOiAnbGFzdFN5bmNCbG9ja251bWJlckZvckRlcG9zaXRFdmVudCcsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICB9KVxuICBsYXN0U3luY0Jsb2NrbnVtYmVyRm9yRGVwb3NpdEV2ZW50ITogbnVtYmVyO1xuXG4gIEBDcmVhdGVEYXRlQ29sdW1uKHtcbiAgICB0eXBlOiAndGltZXN0YW1wIHdpdGhvdXQgdGltZSB6b25lJyxcbiAgICBuYW1lOiAnY3JlYXRlZEF0JyxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogJ25vdygpJyxcbiAgfSlcbiAgY3JlYXRlZEF0ITogRGF0ZTtcbiAgQFVwZGF0ZURhdGVDb2x1bW4oe1xuICAgIHR5cGU6ICd0aW1lc3RhbXAgd2l0aG91dCB0aW1lIHpvbmUnLFxuICAgIG5hbWU6ICd1cGRhdGVkQXQnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiBub3coKVxuICB9KVxuICB1cGRhdGVkQXQhOiBEYXRlO1xuICBARGVsZXRlRGF0ZUNvbHVtbih7XG4gICAgdHlwZTogJ3RpbWVzdGFtcCB3aXRob3V0IHRpbWUgem9uZScsXG4gICAgbmFtZTogJ2RlbGV0ZWRBdCcsXG4gICAgbnVsbGFibGU6IHRydWVcbiAgfSlcbiAgZGVsZXRlZEF0ITogRGF0ZTtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ3ZhcmNoYXInLFxuICAgIG5hbWU6ICd1cGRhdGVkQnknLFxuICAgIGxlbmd0aDogMjU2LFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgfSlcbiAgdXBkYXRlZEJ5ITogc3RyaW5nIHwgbnVsbDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ3ZhcmNoYXInLFxuICAgIG5hbWU6ICdkZWxldGVkQnknLFxuICAgIGxlbmd0aDogMjU2LFxuICAgIG51bGxhYmxlOiB0cnVlLFxuICB9KVxuICBkZWxldGVkQnkhOiBzdHJpbmcgfCBudWxsO1xuXG4gIEBCZWZvcmVJbnNlcnQoKVxuICBAQmVmb3JlVXBkYXRlKClcbiAgc2V0VXBkYXRlZEJ5KCkge1xuICAgIHRoaXMudXBkYXRlZEJ5ID0gZ2V0UHJvY2Vzc05hbWUoKTtcbiAgfVxuXG4gIEBCZWZvcmVSZW1vdmUoKVxuICBzZXREZWxldGVkQnkoKSB7XG4gICAgdGhpcy5kZWxldGVkQnkgPSBnZXRQcm9jZXNzTmFtZSgpO1xuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7OyIsImltcG9ydCB7IFBpbm9Mb2dnZXJTZXJ2aWNlIH0gZnJvbSAnQGNvbW1vbi9sb2dnZXIvYWRhcHRlcnMvcmVhbC9waW5vTG9nZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgSW5qZWN0YWJsZSwgU2NvcGUgfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5pbXBvcnQgeyBDb25maWdTZXJ2aWNlIH0gZnJvbSAnQG5lc3Rqcy9jb25maWcnO1xuaW1wb3J0IHsgSW5qZWN0UmVwb3NpdG9yeSB9IGZyb20gJ0BuZXN0anMvdHlwZW9ybSc7XG5pbXBvcnQgeyBWZXJpZmllckNvbnRyYWN0IH0gZnJvbSAnQHRzLW9wZXJhdG9yL2RvbWFpbi92ZXJpZmllci1jb250cmFjdCc7XG5pbXBvcnQgeyBUcmFuc2FjdGlvbkluZm8gfSBmcm9tICdjb21tb24vdHMtdHlwZW9ybS9zcmMvYWNjb3VudC90cmFuc2FjdGlvbkluZm8uZW50aXR5JztcbmltcG9ydCB7IFdhbGxldCB9IGZyb20gJ2V0aGVycyc7XG5pbXBvcnQgeyBJbmplY3RTaWduZXJQcm92aWRlciwgRXRoZXJzU2lnbmVyLCBJbmplY3RDb250cmFjdFByb3ZpZGVyLCBFdGhlcnNDb250cmFjdCwgVHJhbnNhY3Rpb25SZXNwb25zZSB9IGZyb20gJ25lc3Rqcy1ldGhlcnMnO1xuaW1wb3J0IHsgQ29ubmVjdGlvbiwgUmVwb3NpdG9yeSB9IGZyb20gJ3R5cGVvcm0nO1xuaW1wb3J0ICogYXMgQUJJIGZyb20gJy4uL2RvbWFpbi92ZXJpZmllZC1hYmkuanNvbic7XG5cbmltcG9ydCB7IFJvbGx1cEluZm9ybWF0aW9uIH0gZnJvbSAnY29tbW9uL3RzLXR5cGVvcm0vc3JjL3JvbGx1cC9yb2xsdXBJbmZvcm1hdGlvbi5lbnRpdHknO1xuaW1wb3J0IEJpZ051bWJlciBmcm9tICdiaWdudW1iZXIuanMnO1xuaW1wb3J0IHsgV29ya2VyU2VydmljZSB9IGZyb20gJ0Bjb21tb24vY2x1c3Rlci93b3JrZXIuc2VydmljZSc7XG5pbXBvcnQgeyBmaXJzdFZhbHVlRnJvbSB9IGZyb20gJ3J4anMvaW50ZXJuYWwvZmlyc3RWYWx1ZUZyb20nO1xuaW1wb3J0IHsgQWNjb3VudEluZm9ybWF0aW9uIH0gZnJvbSAnQGNvbW1vbi90cy10eXBlb3JtL2FjY291bnQvYWNjb3VudEluZm9ybWF0aW9uLmVudGl0eSc7XG5ASW5qZWN0YWJsZSh7XG4gIHNjb3BlOiBTY29wZS5ERUZBVUxULFxufSlcbmV4cG9ydCBjbGFzcyBPcGVyYXRvclByb2R1Y2VyIHtcbiAgcHJpdmF0ZSB3YWxsZXQ6IFdhbGxldDtcbiAgcHJpdmF0ZSBjb250cmFjdDogVmVyaWZpZXJDb250cmFjdDtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSBjb25maWc6IENvbmZpZ1NlcnZpY2UsXG4gICAgcHJpdmF0ZSByZWFkb25seSBsb2dnZXI6IFBpbm9Mb2dnZXJTZXJ2aWNlLFxuICAgIEBJbmplY3RTaWduZXJQcm92aWRlcigpIHByaXZhdGUgcmVhZG9ubHkgZXRoZXJzU2lnbmVyOiBFdGhlcnNTaWduZXIsXG4gICAgQEluamVjdENvbnRyYWN0UHJvdmlkZXIoKSBwcml2YXRlIHJlYWRvbmx5IGV0aGVyc0NvbnRyYWN0OiBFdGhlcnNDb250cmFjdCxcbiAgICBASW5qZWN0UmVwb3NpdG9yeShUcmFuc2FjdGlvbkluZm8pIHByaXZhdGUgdHhSZXBvc2l0b3J5OiBSZXBvc2l0b3J5PFRyYW5zYWN0aW9uSW5mbz4sXG4gICAgQEluamVjdFJlcG9zaXRvcnkoUm9sbHVwSW5mb3JtYXRpb24pIHByaXZhdGUgcm9sbHVwSW5mb1JlcG9zaXRvcnk6IFJlcG9zaXRvcnk8Um9sbHVwSW5mb3JtYXRpb24+LFxuICAgIEBJbmplY3RSZXBvc2l0b3J5KEFjY291bnRJbmZvcm1hdGlvbikgcHJpdmF0ZSBhY2NvdW50UmVwb3NpdG9yeTogUmVwb3NpdG9yeTxBY2NvdW50SW5mb3JtYXRpb24+LFxuICAgIHByaXZhdGUgcmVhZG9ubHkgY29ubmVjdGlvbjogQ29ubmVjdGlvbixcbiAgICBwcml2YXRlIHJlYWRvbmx5IHdvcmtlclNlcnZpY2U6IFdvcmtlclNlcnZpY2UsXG4gICkge1xuICAgIHRoaXMud2FsbGV0ID0gdGhpcy5ldGhlcnNTaWduZXIuY3JlYXRlV2FsbGV0KHRoaXMuY29uZmlnLmdldCgnRVRIRVJFVU1fT1BFUkFUT1JfUFJJVicsICcnKSk7XG4gICAgdGhpcy5jb250cmFjdCA9IHRoaXMuZXRoZXJzQ29udHJhY3QuY3JlYXRlKHRoaXMuY29uZmlnLmdldCgnRVRIRVJFVU1fUk9MTFVQX0NPTlRSQUNUX0FERFInLCAnJyksIEFCSSwgdGhpcy53YWxsZXQpIGFzIHVua25vd24gYXMgVmVyaWZpZXJDb250cmFjdDtcblxuICAgIHRoaXMubG9nZ2VyLmxvZyh7XG4gICAgICBhZGRyZXNzOiB0aGlzLndhbGxldC5hZGRyZXNzLFxuICAgICAgY29udHJhY3Q6IHRoaXMuY29udHJhY3QuYWRkcmVzcyxcbiAgICB9KTtcbiAgICB0aGlzLmxpc3RlblJlZ2lzdGVyRXZlbnQoKTtcbiAgICAvLyB0aGlzLmxpc3RlbkRlcG9zaXRFdmVudCgpOyAvLyEgbmV3XG4gIH1cblxuICBhc3luYyBsaXN0ZW5SZWdpc3RlckV2ZW50KCkge1xuICAgIGF3YWl0IGZpcnN0VmFsdWVGcm9tKHRoaXMud29ya2VyU2VydmljZS5vblJlYWR5T2JzZXJ2ZXIpO1xuICAgIHRoaXMubG9nZ2VyLmxvZyhgT3BlcmF0b3JQcm9kdWNlci5saXN0ZW5SZWdpc3RlckV2ZW50IGNvbnRyYWN0PSR7dGhpcy5jb250cmFjdC5hZGRyZXNzfWApO1xuICAgIGNvbnN0IGZpbHRlcnMgPSB0aGlzLmNvbnRyYWN0LmZpbHRlcnMuUmVnaXN0ZXIoKTtcbiAgICBjb25zdCBoYW5kbGVyID0gKGxvZzogYW55KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyh7XG4gICAgICAgIGxvZ1xuICAgICAgfSlcbiAgICAgIC8vIHRoaXMuaGFuZGxlUmVnaXN0ZXJFdmVudChsb2cuYXJncy5zZW5kZXIsIGxvZy5hcmdzLmFjY291bnRJZCwgbG9nLmFyZ3MudHNQdWJYLCBsb2cuYXJncy50c1B1YlksIGxvZy5hcmdzLnRzQWRkciwgbG9nLnRyYW5zYWN0aW9uSGFzaCk7XG4gICAgfTtcbiAgICB0aGlzLmNvbnRyYWN0Lm9uKGZpbHRlcnMsIGhhbmRsZXIuYmluZCh0aGlzKSk7XG4gIH1cblxuICBhc3luYyBoYW5kbGVSZWdpc3RlckV2ZW50KHNlbmRlcjogc3RyaW5nLCBhY2NvdW50SWQ6IEJpZ051bWJlciwgdHNQdWJYOiBCaWdOdW1iZXIsIHRzUHViWTogQmlnTnVtYmVyLCB0c0FkZHI6IEJpZ051bWJlciwgdHg6IFRyYW5zYWN0aW9uUmVzcG9uc2UpIHtcbiAgICBjb25zdCByb2xsdXBJbmZvID0gYXdhaXQgdGhpcy5yb2xsdXBJbmZvUmVwb3NpdG9yeS5maW5kT25lT3JGYWlsKHsgd2hlcmU6IHsgaWQ6IDEgfSB9KTtcbiAgICBjb25zdCB7IGJsb2NrTnVtYmVyID0gMCB9ID0gdHg7XG5cbiAgICBpZiAoYmxvY2tOdW1iZXIgPD0gcm9sbHVwSW5mby5sYXN0U3luY0Jsb2NrbnVtYmVyRm9yUmVnaXN0ZXJFdmVudCkge1xuICAgICAgdGhpcy5sb2dnZXIubG9nKFxuICAgICAgICBgT3BlcmF0b3JQcm9kdWNlci5saXN0ZW5SZWdpc3RlckV2ZW50IHNraXAgYmxvY2tOdW1iZXI9JHtibG9ja051bWJlcn0gbGFzdFN5bmNCbG9ja251bWJlckZvclJlZ2lzdGVyRXZlbnQ9JHtyb2xsdXBJbmZvLmxhc3RTeW5jQmxvY2tudW1iZXJGb3JSZWdpc3RlckV2ZW50fWAsXG4gICAgICApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24udHJhbnNhY3Rpb24oYXN5bmMgKG1hbmFnZXIpID0+IHtcbiAgICAgIHJldHVybiBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIHRoaXMuYWNjb3VudFJlcG9zaXRvcnkudXBzZXJ0KFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIEwxQWRkcmVzczogc2VuZGVyLFxuICAgICAgICAgICAgYWNjb3VudElkOiBhY2NvdW50SWQudG9TdHJpbmcoKSxcbiAgICAgICAgICAgIHRzUHViS2V5WDogdHNQdWJYLnRvU3RyaW5nKCksXG4gICAgICAgICAgICB0c1B1YktleVk6IHRzUHViWS50b1N0cmluZygpLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgWydMMUFkZHJlc3MnXSxcbiAgICAgICAgKSxcbiAgICAgICAgdGhpcy50eFJlcG9zaXRvcnkuaW5zZXJ0KHtcbiAgICAgICAgICBhY2NvdW50SWQ6IDBuLFxuICAgICAgICAgIHRva2VuSWQ6IDBuLFxuICAgICAgICAgIGFtb3VudDogMG4sXG4gICAgICAgICAgYXJnMDogQmlnSW50KGFjY291bnRJZC50b1N0cmluZygpKSxcbiAgICAgICAgICBhcmcxOiBCaWdJbnQodHNBZGRyLnRvU3RyaW5nKCkpLFxuICAgICAgICB9KSxcbiAgICAgICAgdGhpcy5yb2xsdXBJbmZvUmVwb3NpdG9yeS51cGRhdGUoeyBpZDogMSB9LCB7IGxhc3RTeW5jQmxvY2tudW1iZXJGb3JSZWdpc3RlckV2ZW50OiBibG9ja051bWJlciB9KSxcbiAgICAgIF0pO1xuICAgIH0pO1xuICAgIHRoaXMubG9nZ2VyLmxvZyhgT3BlcmF0b3JQcm9kdWNlci5saXN0ZW5SZWdpc3RlckV2ZW50ICR7c2VuZGVyfSAke2FjY291bnRJZH0gJHt0c1B1Ylh9ICR7dHNQdWJZfSAke3RzQWRkcn1gKTtcbiAgfVxuXG4gIC8vISBEZXBvc2l0IEV2ZW50XG4gIGFzeW5jIGxpc3RlbkRlcG9zaXRFdmVudCgpIHtcbiAgICBhd2FpdCBmaXJzdFZhbHVlRnJvbSh0aGlzLndvcmtlclNlcnZpY2Uub25SZWFkeU9ic2VydmVyKTtcbiAgICB0aGlzLmxvZ2dlci5sb2coYE9wZXJhdG9yUHJvZHVjZXIubGlzdGVuRGVwb3NpdEV2ZW50IGNvbnRyYWN0PSR7dGhpcy5jb250cmFjdC5hZGRyZXNzfWApO1xuICAgIGNvbnN0IGZpbHRlcnMgPSB0aGlzLmNvbnRyYWN0LmZpbHRlcnMuRGVwb3NpdCgpO1xuICAgIGNvbnN0IGhhbmRsZXIgPSAobG9nOiBhbnkpID0+IHtcbiAgICAgIHRoaXMuaGFuZGxlRGVwb3NpdEV2ZW50KGxvZy5hcmdzLnNlbmRlciwgbG9nLmFyZ3MuYWNjb3VudElkLCBsb2cuYXJncy50b2tlbklkLCBsb2cuYXJncy5hbW91bnQsIGxvZy50cmFuc2FjdGlvbkhhc2gpO1xuICAgIH07XG4gICAgdGhpcy5jb250cmFjdC5vbihmaWx0ZXJzLCBoYW5kbGVyLmJpbmQodGhpcykpO1xuICB9XG5cbiAgYXN5bmMgaGFuZGxlRGVwb3NpdEV2ZW50KHNlbmRlcjogc3RyaW5nLCBhY2NvdW50SWQ6IEJpZ051bWJlciwgdG9rZW5JZDogQmlnTnVtYmVyLCBhbW91bnQ6IEJpZ051bWJlciwgdHg6IFRyYW5zYWN0aW9uUmVzcG9uc2UpIHtcbiAgICBjb25zdCByb2xsdXBJbmZvID0gYXdhaXQgdGhpcy5yb2xsdXBJbmZvUmVwb3NpdG9yeS5maW5kT25lT3JGYWlsKHsgd2hlcmU6IHsgaWQ6IDEgfSB9KTtcbiAgICBjb25zdCB7IGJsb2NrTnVtYmVyID0gMCB9ID0gdHg7XG5cbiAgICBpZiAoYmxvY2tOdW1iZXIgPD0gcm9sbHVwSW5mby5sYXN0U3luY0Jsb2NrbnVtYmVyRm9yRGVwb3NpdEV2ZW50KSB7XG4gICAgICB0aGlzLmxvZ2dlci5sb2coXG4gICAgICAgIGBPcGVyYXRvclByb2R1Y2VyLmxpc3RlbkRlcG9zaXRFdmVudCBza2lwIGJsb2NrTnVtYmVyPSR7YmxvY2tOdW1iZXJ9IGxhc3RTeW5jQmxvY2tudW1iZXJGb3JEZXBvc2l0RXZlbnQ9JHtyb2xsdXBJbmZvLmxhc3RTeW5jQmxvY2tudW1iZXJGb3JEZXBvc2l0RXZlbnR9YCxcbiAgICAgICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIFRPRE86IGluc2VydCBUcmFuc2FjdGlvbkluZm9cbiAgICB0aGlzLnR4UmVwb3NpdG9yeS5pbnNlcnQoe1xuICAgICAgdG9rZW5JZDogQmlnSW50KHRva2VuSWQudG9TdHJpbmcoKSksXG4gICAgICBhbW91bnQ6IEJpZ0ludChhbW91bnQudG9TdHJpbmcoKSksXG4gICAgICBhcmcwOiBCaWdJbnQoYWNjb3VudElkLnRvU3RyaW5nKCkpLCAvL1RPRE8gY2hlY2sgYXJnc1xuICAgIH0pO1xuICAgIHRoaXMubG9nZ2VyLmxvZyhgT3BlcmF0b3JQcm9kdWNlci5saXN0ZW5SZWdpc3RlckV2ZW50ICR7c2VuZGVyfSAke2FjY291bnRJZH0gJHt0b2tlbklkfSAke2Ftb3VudH1gKTtcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgX2NsdXN0ZXIgZnJvbSAnY2x1c3Rlcic7XG5pbXBvcnQgdHlwZSB7IENsdXN0ZXIgfSBmcm9tICdjbHVzdGVyJztcbmltcG9ydCB7IFJlcGxheVN1YmplY3QgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IFBpbm9Mb2dnZXJTZXJ2aWNlIH0gZnJvbSAnQGNvbW1vbi9sb2dnZXIvYWRhcHRlcnMvcmVhbC9waW5vTG9nZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgQ2x1c3Rlck1lc3NhZ2VFdmVudFBheWxvYWQsIENsdXN0ZXJNZXNzYWdlVHlwZSB9IGZyb20gJ0B0cy1zZGsvZG9tYWluL2V2ZW50cy9jbHVzdGVyJztcbmltcG9ydCB7IEluamVjdGFibGUsIFNjb3BlIH0gZnJvbSAnQG5lc3Rqcy9jb21tb24nO1xuaW1wb3J0IHsgVHNXb3JrZXJOYW1lIH0gZnJvbSAnQHRzLXNkay9jb25zdGFudCc7XG5pbXBvcnQgeyBnZXRXb3JrZXJOYW1lIH0gZnJvbSAnQHRzLXNkay9oZWxwZXInO1xuY29uc3QgY2x1c3RlciA9IF9jbHVzdGVyIGFzIHVua25vd24gYXMgQ2x1c3RlcjtcblxuQEluamVjdGFibGUoe1xuICBzY29wZTogU2NvcGUuREVGQVVMVCxcbn0pXG5leHBvcnQgY2xhc3MgV29ya2VyU2VydmljZSB7XG4gIGlzTGlzdGVuaW5nID0gZmFsc2U7XG4gIHB1YmxpYyB3b3JrZXJOYW1lOiBUc1dvcmtlck5hbWU7XG4gIHByaXZhdGUgd29ya2VyUmVhZHlTdWJqZWN0ID0gbmV3IFJlcGxheVN1YmplY3QoMSk7XG4gIHB1YmxpYyBvblJlYWR5T2JzZXJ2ZXIgPSB0aGlzLndvcmtlclJlYWR5U3ViamVjdC5hc09ic2VydmFibGUoKTtcbiAgXG4gIGNvbnN0cnVjdG9yKFxuICAgIHJlYWRvbmx5IGxvZ2dlcjogUGlub0xvZ2dlclNlcnZpY2UsXG4gICkge1xuICAgIHRoaXMud29ya2VyTmFtZSA9IGdldFdvcmtlck5hbWUoKTtcbiAgICBpZighY2x1c3Rlci5pc1ByaW1hcnkpe1xuICAgICAgdGhpcy5zdGFydExpc3RlbigpO1xuICAgIH1cbiAgfVxuXG4gIG9uUmVjZWl2ZWRNZXNzYWdlKHBheWxvYWQ6IENsdXN0ZXJNZXNzYWdlRXZlbnRQYXlsb2FkKSB7XG4gICAgdGhpcy5sb2dnZXIubG9nKHtcbiAgICAgIG1zZzogJ09OIE1FU1NBR0UnLCB3b3JrZXJOYW1lOiB0aGlzLndvcmtlck5hbWUsIHBheWxvYWRcbiAgICB9KTtcbiAgICBzd2l0Y2ggKHBheWxvYWQudHlwZSkge1xuICAgICAgY2FzZSBDbHVzdGVyTWVzc2FnZVR5cGUuUkVBRFk6XG4gICAgICAgIHRoaXMud29ya2VyUmVhZHlTdWJqZWN0Lm5leHQodHJ1ZSk7XG4gICAgICAgIHRoaXMud29ya2VyUmVhZHlTdWJqZWN0LmNvbXBsZXRlKCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHN0YXJ0TGlzdGVuKCkge1xuICAgIGlmKHRoaXMuaXNMaXN0ZW5pbmcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignV29ya2VyU2VydmljZSBpcyBhbHJlYWR5IGxpc3RlbmluZycpO1xuICAgIH1cbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnT04gTElTVEVOJywgdGhpcy53b3JrZXJOYW1lKTtcbiAgICBwcm9jZXNzLm9uKCdtZXNzYWdlJywgKHBheWxvYWQ6IENsdXN0ZXJNZXNzYWdlRXZlbnRQYXlsb2FkKSA9PiB7XG4gICAgICBpZihwYXlsb2FkLnRvID09PSB0aGlzLndvcmtlck5hbWUpIHtcbiAgICAgICAgdGhpcy5vblJlY2VpdmVkTWVzc2FnZShwYXlsb2FkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgbWVzc2FnZSBzZW5kIHRvIHdyb25nIFdvcmtlciB0bz0ke3BheWxvYWQudG99LCBjdXJyZW50PSR7dGhpcy53b3JrZXJOYW1lfWApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgc2VuZE1lc3NhZ2UocGF5bG9hZDogT21pdDxDbHVzdGVyTWVzc2FnZUV2ZW50UGF5bG9hZCwgJ2Zyb20nPikge1xuICAgIGlmKHByb2Nlc3M/LnNlbmQpIHtcbiAgICAgIHByb2Nlc3Muc2VuZCh7XG4gICAgICAgIGZyb206IHRoaXMud29ya2VyTmFtZSxcbiAgICAgICAgLi4ucGF5bG9hZCxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3Muc2VuZCBpcyBub3QgZGVmaW5lZCcpO1xuICB9XG5cbiAgcmVhZHkoKSB7XG4gICAgdGhpcy5zZW5kTWVzc2FnZSh7XG4gICAgICB0bzogVHNXb3JrZXJOYW1lLkNPUkUsXG4gICAgICB0eXBlOiBDbHVzdGVyTWVzc2FnZVR5cGUuUkVBRFksXG4gICAgfSk7XG4gIH1cblxuICBzdG9wKCkge1xuICAgIHRoaXMuc2VuZE1lc3NhZ2Uoe1xuICAgICAgdG86IFRzV29ya2VyTmFtZS5DT1JFLFxuICAgICAgdHlwZTogQ2x1c3Rlck1lc3NhZ2VUeXBlLlNUT1AsXG4gICAgfSk7XG4gIH1cblxufSIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInJ4anNcIik7OyIsImltcG9ydCB7IFRzV29ya2VyTmFtZSB9IGZyb20gJ0B0cy1zZGsvY29uc3RhbnQnO1xuaW1wb3J0IHsgUmVjb3JkLCBTdHJpbmcgfSBmcm9tICdydW50eXBlcyc7XG5cbmNvbnN0IFRzV29ya2VyTmFtZUJyYW5kID0gU3RyaW5nLndpdGhDb25zdHJhaW50KChzKSA9PiBPYmplY3QudmFsdWVzKFRzV29ya2VyTmFtZSkuaW5jbHVkZXMocyBhcyBUc1dvcmtlck5hbWUpKTtcblxuZXhwb3J0IGVudW0gQ2x1c3Rlck1lc3NhZ2VUeXBlIHtcbiAgVU5LTk9XTixcbiAgU1RBUlQsXG4gIFJFQURZLFxuICBBTExfUkVBRFksXG4gIFNUT1AsXG4gIE1FU1NBR0UsXG5cbn1cblxuZXhwb3J0IGNvbnN0IENsdXN0ZXJNZXNzYWdlRXZlbnRQYXlsb2FkID0gUmVjb3JkKHtcbiAgZnJvbTogVHNXb3JrZXJOYW1lQnJhbmQsXG4gIHRvOiBUc1dvcmtlck5hbWVCcmFuZCxcbiAgLy8gcGF5bG9hZDogYW55LFxufSk7XG5cbmV4cG9ydCB0eXBlIENsdXN0ZXJNZXNzYWdlRXZlbnRQYXlsb2FkID0ge1xuICBmcm9tOiBUc1dvcmtlck5hbWU7XG4gIHRvOiBUc1dvcmtlck5hbWU7XG4gIHR5cGU6IENsdXN0ZXJNZXNzYWdlVHlwZSxcbiAgbWVzc2FnZT86IHN0cmluZztcbiAgZGF0YT86IGFueTtcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJydW50eXBlc1wiKTs7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicnhqcy9pbnRlcm5hbC9maXJzdFZhbHVlRnJvbVwiKTs7IiwiaW1wb3J0IHsgTG9nZ2VyTW9kdWxlIH0gZnJvbSAnQGNvbW1vbi9sb2dnZXIvbG9nZ2VyLm1vZHVsZSc7XG5pbXBvcnQgeyBHbG9iYWwsIE1vZHVsZSB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcbmltcG9ydCB7IENvbmZpZ01vZHVsZSB9IGZyb20gJ0BuZXN0anMvY29uZmlnJztcbmltcG9ydCB7IE1haW5Qcm9jZXNzU2VydmljZSB9IGZyb20gJy4vbWFpbi1wcm9jZXNzLnNlcnZpY2UnO1xuaW1wb3J0IHsgV29ya2VyU2VydmljZSB9IGZyb20gJy4vd29ya2VyLnNlcnZpY2UnO1xuQEdsb2JhbCgpXG5ATW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIENvbmZpZ01vZHVsZSxcbiAgICBMb2dnZXJNb2R1bGUsXG4gIF0sXG4gIHByb3ZpZGVyczogW1xuICAgIE1haW5Qcm9jZXNzU2VydmljZSxcbiAgXSxcbiAgZXhwb3J0czogW01haW5Qcm9jZXNzU2VydmljZV1cbn0pXG5leHBvcnQgY2xhc3MgTWFpblByb2Nlc3NNb2R1bGUge31cblxuQEdsb2JhbCgpXG5ATW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIENvbmZpZ01vZHVsZSxcbiAgICBMb2dnZXJNb2R1bGUsXG4gIF0sXG4gIHByb3ZpZGVyczogW1xuICAgIFdvcmtlclNlcnZpY2UsXG4gIF0sXG4gIGV4cG9ydHM6IFtXb3JrZXJTZXJ2aWNlXVxufSlcbmV4cG9ydCBjbGFzcyBXb3JrZXJNb2R1bGUge31cbiIsImltcG9ydCB0eXBlIHsgQ2x1c3RlciB9IGZyb20gJ2NsdXN0ZXInO1xuaW1wb3J0ICogYXMgX2NsdXN0ZXIgZnJvbSAnY2x1c3Rlcic7XG5jb25zdCBjbHVzdGVyID0gX2NsdXN0ZXIgYXMgdW5rbm93biBhcyBDbHVzdGVyO1xuaW1wb3J0IHsgQ2x1c3Rlck1lc3NhZ2VFdmVudFBheWxvYWQsIENsdXN0ZXJNZXNzYWdlVHlwZSB9IGZyb20gJ0B0cy1zZGsvZG9tYWluL2V2ZW50cy9jbHVzdGVyJztcbmltcG9ydCB7IFBpbm9Mb2dnZXJTZXJ2aWNlIH0gZnJvbSAnQGNvbW1vbi9sb2dnZXIvYWRhcHRlcnMvcmVhbC9waW5vTG9nZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgSW5qZWN0YWJsZSwgU2NvcGUgfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5pbXBvcnQgeyBUc1dvcmtlck5hbWUsIFdvcmtlckl0ZW0gfSBmcm9tICdAdHMtc2RrL2NvbnN0YW50JztcbmltcG9ydCB7IGdldFdvcmtlck5hbWUgfSBmcm9tICdAdHMtc2RrL2hlbHBlcic7XG5pbXBvcnQgeyBkZWxheSwgZmlsdGVyLCBmaXJzdCwgcGlwZSwgUmVwbGF5U3ViamVjdCwgc2tpcFVudGlsIH0gZnJvbSAncnhqcyc7XG5cbkBJbmplY3RhYmxlKHtcbiAgc2NvcGU6IFNjb3BlLkRFRkFVTFQsXG59KVxuZXhwb3J0IGNsYXNzIE1haW5Qcm9jZXNzU2VydmljZSB7XG4gIHB1YmxpYyB3b3JrZXJNYXA6IHtcbiAgICBbbmFtZTogc3RyaW5nXTogV29ya2VySXRlbTtcbiAgfSA9IHt9O1xuICBwcml2YXRlIHNlbGZXb3JrZXJOYW1lOiBUc1dvcmtlck5hbWU7XG4gIHByaXZhdGUgd29ya2VyUmVhZHlTdWJqZWN0ID0gbmV3IFJlcGxheVN1YmplY3Q8Ym9vbGVhbj4oMSk7XG4gIHB1YmxpYyBpc1JlYWR5ID0gdGhpcy53b3JrZXJSZWFkeVN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG5cblxuICBjb25zdHJ1Y3RvcihyZWFkb25seSBsb2dnZXI6IFBpbm9Mb2dnZXJTZXJ2aWNlKSB7XG4gICAgdGhpcy5zZWxmV29ya2VyTmFtZSA9IGdldFdvcmtlck5hbWUoKTtcbiAgICB0aGlzLndvcmtlclJlYWR5U3ViamVjdC5uZXh0KGZhbHNlKTtcbiAgICB0aGlzLmxvZ2dlci5zZXRDb250ZXh0KCdNYWluUHJvY2Vzc1NlcnZpY2UnKTtcblxuICAgIHRoaXMuaGFuZGxlQWxsV29ya2VyUmVhZHkoKTtcbiAgfVxuXG4gIGhhbmRsZUFsbFdvcmtlclJlYWR5KCkge1xuICAgIC8vIFRPRE86IG9ubHkgaGFuZGxlIGZpcnN0ID9cbiAgICB0aGlzLmlzUmVhZHkucGlwZShcbiAgICAgIGZpbHRlcigoaXNSZWFkeSkgPT4gaXNSZWFkeSksXG4gICAgICBmaXJzdCgpLFxuICAgICAgZGVsYXkoMTAwMCAqIDMpLFxuICAgICkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIE9iamVjdC52YWx1ZXModGhpcy53b3JrZXJNYXApLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgdGhpcy5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgZnJvbTogdGhpcy5zZWxmV29ya2VyTmFtZSxcbiAgICAgICAgICB0bzogaXRlbS5uYW1lLFxuICAgICAgICAgIHR5cGU6IENsdXN0ZXJNZXNzYWdlVHlwZS5SRUFEWSxcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIG9uUmVjZWl2ZWRNZXNzYWdlKHBheWxvYWQ6IENsdXN0ZXJNZXNzYWdlRXZlbnRQYXlsb2FkKSB7XG4gICAgdGhpcy5sb2dnZXIubG9nKHsgbmFtZTogdGhpcy5zZWxmV29ya2VyTmFtZSwgdHlwZTogJ21lc3NhZ2UnLCBwYXlsb2FkIH0pO1xuICAgIHN3aXRjaCAocGF5bG9hZC50eXBlKSB7XG4gICAgICBjYXNlIENsdXN0ZXJNZXNzYWdlVHlwZS5SRUFEWTpcbiAgICAgICAgLy8gV29ya2VyIGluaXRlZCAtLSBzZW5kTWVzc2FnZShSRUFEWSwgQ29yZSkgLT4gTWFpblByb2Nlc3MgLS0gY2hlY2sgQWxsIHdvcmtlciByZWFkeSAtPiAgaGFuZGxlQWxsV29ya2VyUmVhZHkgLS0gc2VuZE1lc3NhZ2UoUkVBRFksIFdvcmtlcikgLT4gV29ya2VyIG9uUmVhZHlcbiAgICAgICAgdGhpcy5nZXRXb3JrZXIocGF5bG9hZC5mcm9tKS5pc1JlYWR5ID0gdHJ1ZTtcbiAgICAgICAgY29uc3QgaXNBbGxSZWFkeSA9IE9iamVjdC52YWx1ZXModGhpcy53b3JrZXJNYXApLmV2ZXJ5KChpdGVtKSA9PiBpdGVtLmlzUmVhZHkpO1xuICAgICAgICB0aGlzLndvcmtlclJlYWR5U3ViamVjdC5uZXh0KGlzQWxsUmVhZHkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHNldFdvcmtlcihuYW1lOiBUc1dvcmtlck5hbWUsIHdvcmtlckl0ZW06IFdvcmtlckl0ZW0pIHtcbiAgICBpZighY2x1c3Rlci5pc1ByaW1hcnkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignc2V0V29ya2VyKCkgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIGluIHByaW1hcnkgcHJvY2VzcycpO1xuICAgIH1cbiAgICB0aGlzLndvcmtlck1hcFtuYW1lXSA9IHdvcmtlckl0ZW07XG4gIH1cbiAgZ2V0V29ya2VyKG5hbWU6IFRzV29ya2VyTmFtZSkge1xuICAgIGNvbnN0IHdvcmtlciA9IHRoaXMud29ya2VyTWFwW25hbWVdO1xuICAgIGlmKCF3b3JrZXIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgd29ya2VyICR7bmFtZX0gaXMgbm90IGZvdW5kYCk7XG4gICAgfVxuICAgIHJldHVybiB3b3JrZXI7XG4gIH1cblxuICBzZW5kTWVzc2FnZShwYXlsb2FkOiBDbHVzdGVyTWVzc2FnZUV2ZW50UGF5bG9hZCkge1xuICAgIHRoaXMubG9nZ2VyLmxvZyh7IHR5cGU6ICdzZW5kTWVzc2FnZScsIHBheWxvYWQgfSk7XG4gICAgaWYocGF5bG9hZC50byA9PT0gdGhpcy5zZWxmV29ya2VyTmFtZSkge1xuICAgICAgdGhpcy5vblJlY2VpdmVkTWVzc2FnZShwYXlsb2FkKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYoIXRoaXMud29ya2VyTWFwW3BheWxvYWQudG9dKSB7XG4gICAgICB0aGlzLmxvZ2dlci5lcnJvcihgV29ya2VyICR7cGF5bG9hZC50b30gbm90IGZvdW5kYCk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFdvcmtlciAke3BheWxvYWQudG99IG5vdCBmb3VuZGApO1xuICAgIH1cbiAgICB0aGlzLndvcmtlck1hcFtwYXlsb2FkLnRvXS53b3JrZXI/LnNlbmQocGF5bG9hZCk7XG4gIH1cblxuICBjbHVzdGVyaXplKHdvcmtlcnM6IFdvcmtlckl0ZW1bXSkge1xuICAgIGlmKCFjbHVzdGVyLmlzUHJpbWFyeSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdjbHVzdGVyaXplKCkgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIGluIHByaW1hcnkgcHJvY2VzcycpO1xuICAgIH1cbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgd29ya2Vycy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IGl0ZW0gPSB3b3JrZXJzW2luZGV4XTtcbiAgICAgIHRoaXMubG9nZ2VyLmxvZyhgJHtUc1dvcmtlck5hbWUuQ09SRX06IGZvcmsgY2x1c3RlciAke2l0ZW0ubmFtZX1gKTtcbiAgICAgIGNvbnN0IHdvcmtlciA9IGNsdXN0ZXIuZm9yayh7XG4gICAgICAgIFRTX1dPUktFUl9OQU1FOiBpdGVtLm5hbWUsXG4gICAgICB9KTtcbiAgICAgIHRoaXMuc2V0V29ya2VyKGl0ZW0ubmFtZSwge1xuICAgICAgICAuLi5pdGVtLFxuICAgICAgICB3b3JrZXIsXG4gICAgICB9KTtcbiAgICAgIHdvcmtlci5vbmNlKCdvbmxpbmUnLCAoKSA9PiB7XG4gICAgICAgIHRoaXMubG9nZ2VyLmxvZyhgV29ya2VyICR7aXRlbS5uYW1lfS0ke3dvcmtlci5wcm9jZXNzLnBpZH0gb25saW5lIWApO1xuICAgICAgfSk7XG4gICAgICB3b3JrZXIub25jZSgnZXhpdCcsICgpID0+IHtcbiAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoYFdvcmtlciAke2l0ZW0ubmFtZX0tJHt3b3JrZXIucHJvY2Vzcy5waWR9IGRpZWQuYCk7XG4gICAgICB9KTtcbiAgICAgIHdvcmtlci5vbignbWVzc2FnZScsIHRoaXMuc2VuZE1lc3NhZ2UuYmluZCh0aGlzKSk7XG4gICAgfVxuICB9XG4gIFxufSIsImltcG9ydCB7IFBpbm9Mb2dnZXJTZXJ2aWNlIH0gZnJvbSAnQGNvbW1vbi9sb2dnZXIvYWRhcHRlcnMvcmVhbC9waW5vTG9nZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgQ29uZmlnU2VydmljZSB9IGZyb20gJ0BuZXN0anMvY29uZmlnJztcbmltcG9ydCB7IE5lc3RGYWN0b3J5IH0gZnJvbSAnQG5lc3Rqcy9jb3JlJztcbmltcG9ydCB7IGdldFdvcmtlck5hbWUsIGdldFByb2Nlc3NOYW1lIH0gZnJvbSAnLi9oZWxwZXInO1xuXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXR1cEFwcChtb2R1bGU6IGFueSkge1xuICBjb25zdCBhcHAgPSBhd2FpdCBOZXN0RmFjdG9yeS5jcmVhdGVBcHBsaWNhdGlvbkNvbnRleHQobW9kdWxlKTtcbiAgY29uc3QgY29uZmlnU2VydmljZSA9IGFwcC5nZXQoQ29uZmlnU2VydmljZSk7XG4gIGNvbnN0IHdvcmtlck5hbWUgPSBnZXRXb3JrZXJOYW1lKCk7XG4gIGNvbnN0IGxvZ2dlciA9IGFwcC5nZXQoUGlub0xvZ2dlclNlcnZpY2UpO1xuXG4gIGxvZ2dlci5zZXRDb250ZXh0KGdldFByb2Nlc3NOYW1lKCkpO1xuICBhcHAudXNlTG9nZ2VyKGxvZ2dlcik7XG5cbiAgbG9nZ2VyLmxvZyhgJHtnZXRQcm9jZXNzTmFtZSgpfTogc2VydmVyIHN0YXJ0ZWQhYCk7XG4gIHJldHVybiBhcHA7XG59XG5cbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIkBuZXN0anMvY29yZVwiKTs7IiwiLy8gTmVzdCBpbXBvcnRzXG5pbXBvcnQgeyBQaW5vTG9nZ2VyU2VydmljZSB9IGZyb20gJ0Bjb21tb24vbG9nZ2VyL2FkYXB0ZXJzL3JlYWwvcGlub0xvZ2dlci5zZXJ2aWNlJztcbmltcG9ydCB7IExvZ2dlck1vZHVsZSB9IGZyb20gJ0Bjb21tb24vbG9nZ2VyL2xvZ2dlci5tb2R1bGUnO1xuaW1wb3J0IHsgTW9kdWxlLCBPbk1vZHVsZUluaXQgfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5pbXBvcnQgeyBDcXJzTW9kdWxlIH0gZnJvbSAnQG5lc3Rqcy9jcXJzJztcbmltcG9ydCB7IENvbmZpZ01vZHVsZSB9IGZyb20gJ0BuZXN0anMvY29uZmlnJztcbmltcG9ydCB7IFRzV29ya2VyTmFtZSB9IGZyb20gJy4uLy4uL3RzLXNkay9zcmMvY29uc3RhbnQnO1xuaW1wb3J0IHsgU2NoZWR1bGVNb2R1bGUgfSBmcm9tICdAbmVzdGpzL3NjaGVkdWxlJztcbmltcG9ydCB7IFByb2R1Y2VyU2VydmljZSB9IGZyb20gJy4vcHJvZHVjZXIuc2VydmljZSc7XG5pbXBvcnQgeyBCdWxsUXVldWVNb2R1bGUgfSBmcm9tICdjb21tb24vYnVsbC1xdWV1ZS9zcmMvQnVsbFF1ZXVlLm1vZHVsZSc7XG5pbXBvcnQgeyBUc1R5cGVPcm1Nb2R1bGUgfSBmcm9tICdjb21tb24vdHMtdHlwZW9ybS9zcmMvdHN0eXBlb3JtLm1vZHVsZSc7XG5pbXBvcnQgeyBUeXBlT3JtTW9kdWxlIH0gZnJvbSAnQG5lc3Rqcy90eXBlb3JtJztcbmltcG9ydCB7IEJsb2NrSW5mb3JtYXRpb24gfSBmcm9tICdjb21tb24vdHMtdHlwZW9ybS9zcmMvYWNjb3VudC9ibG9ja0luZm9ybWF0aW9uLmVudGl0eSc7XG5pbXBvcnQgeyBCdWxsTW9kdWxlIH0gZnJvbSAnQGFuY2hhbjgyOC9uZXN0LWJ1bGxtcSc7XG5pbXBvcnQgeyBEYXRhYmFzZVB1YlN1Yk1vZHVsZSB9IGZyb20gJ0Bjb21tb24vZGItcHVic3ViL2RiLXB1YnN1Yi5tb2R1bGUnO1xuaW1wb3J0IHsgVHJhbnNhY3Rpb25JbmZvIH0gZnJvbSAnY29tbW9uL3RzLXR5cGVvcm0vc3JjL2FjY291bnQvdHJhbnNhY3Rpb25JbmZvLmVudGl0eSc7XG5pbXBvcnQgeyBNYWluUHJvY2Vzc01vZHVsZSB9IGZyb20gJ0Bjb21tb24vY2x1c3Rlci9jbHVzdGVyLm1vZHVsZSc7XG5cbkBNb2R1bGUoe1xuICBpbXBvcnRzOiBbXG4gICAgQ29uZmlnTW9kdWxlLmZvclJvb3QoKSxcbiAgICBDcXJzTW9kdWxlLFxuICAgIExvZ2dlck1vZHVsZSxcbiAgICAvLyBOb3RpZmljYXRpb25zTW9kdWxlLFxuICAgIFNjaGVkdWxlTW9kdWxlLmZvclJvb3QoKSxcbiAgICBCdWxsUXVldWVNb2R1bGUsXG4gICAgVHNUeXBlT3JtTW9kdWxlLFxuICAgIFR5cGVPcm1Nb2R1bGUuZm9yRmVhdHVyZShcbiAgICAgIFtcbiAgICAgICAgVHJhbnNhY3Rpb25JbmZvLFxuICAgICAgICBCbG9ja0luZm9ybWF0aW9uLFxuICAgICAgXSksXG4gICAgQnVsbE1vZHVsZS5yZWdpc3RlclF1ZXVlKFxuICAgICAge1xuICAgICAgICBxdWV1ZU5hbWU6IFRzV29ya2VyTmFtZS5TRVFVRU5DRVIsXG4gICAgICB9LCB7XG4gICAgICAgIHF1ZXVlTmFtZTogVHNXb3JrZXJOYW1lLlBST1ZFUixcbiAgICAgIH0sIHtcbiAgICAgICAgcXVldWVOYW1lOiBUc1dvcmtlck5hbWUuT1BFUkFUT1IsXG4gICAgICB9XG4gICAgKSxcbiAgICBEYXRhYmFzZVB1YlN1Yk1vZHVsZSxcbiAgICBNYWluUHJvY2Vzc01vZHVsZSxcbiAgXSxcbiAgY29udHJvbGxlcnM6IFtdLFxuICBwcm92aWRlcnM6IFtcbiAgICBQcm9kdWNlclNlcnZpY2UsXG4gIF1cbn0pXG5leHBvcnQgY2xhc3MgQXBwTW9kdWxlIGltcGxlbWVudHMgT25Nb2R1bGVJbml0IHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWVtcHR5LWZ1bmN0aW9uXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgbG9nZ2VyOiBQaW5vTG9nZ2VyU2VydmljZSkgeyB9XG5cbiAgb25Nb2R1bGVJbml0KCk6IHZvaWQge1xuICAgIHRoaXMubG9nZ2VyLnNldENvbnRleHQoVHNXb3JrZXJOYW1lLkNPUkUpO1xuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJAbmVzdGpzL2NxcnNcIik7OyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIkBuZXN0anMvc2NoZWR1bGVcIik7OyIsImltcG9ydCB7IEJ1bGxRdWV1ZUluamVjdCB9IGZyb20gJ0BhbmNoYW44MjgvbmVzdC1idWxsbXEnO1xuaW1wb3J0IHsgQ0hBTk5FTCB9IGZyb20gJ0Bjb21tb24vZGItcHVic3ViL2RvbWFpbnMvdmFsdWUtb2JqZWN0cy9wdWJTdWIuY29uc3RhbnRzJztcbmltcG9ydCB7IE1lc3NhZ2VCcm9rZXIgfSBmcm9tICdAY29tbW9uL2RiLXB1YnN1Yi9wb3J0cy9tZXNzYWdlQnJva2VyJztcbmltcG9ydCB7IFBpbm9Mb2dnZXJTZXJ2aWNlIH0gZnJvbSAnQGNvbW1vbi9sb2dnZXIvYWRhcHRlcnMvcmVhbC9waW5vTG9nZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgSW5qZWN0YWJsZSwgU2NvcGUgfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5pbXBvcnQgeyBDcm9uLCBDcm9uRXhwcmVzc2lvbiB9IGZyb20gJ0BuZXN0anMvc2NoZWR1bGUnO1xuaW1wb3J0IHsgSW5qZWN0UmVwb3NpdG9yeSB9IGZyb20gJ0BuZXN0anMvdHlwZW9ybSc7XG5pbXBvcnQgeyBCbG9ja0luZm9ybWF0aW9uIH0gZnJvbSAnY29tbW9uL3RzLXR5cGVvcm0vc3JjL2FjY291bnQvYmxvY2tJbmZvcm1hdGlvbi5lbnRpdHknO1xuaW1wb3J0IHsgVHJhbnNhY3Rpb25JbmZvIH0gZnJvbSAnY29tbW9uL3RzLXR5cGVvcm0vc3JjL2FjY291bnQvdHJhbnNhY3Rpb25JbmZvLmVudGl0eSc7XG5pbXBvcnQgeyBUU19TVEFUVVMgfSBmcm9tICdjb21tb24vdHMtdHlwZW9ybS9zcmMvYWNjb3VudC90c1N0YXR1cy5lbnVtJztcbmltcG9ydCB7IE1vcmVUaGFuLCBSZXBvc2l0b3J5IH0gZnJvbSAndHlwZW9ybSc7XG5pbXBvcnQgeyBUc1R4VHlwZSB9IGZyb20gJ0B0cy1zZGsvZG9tYWluL2xpYi90cy10eXBlcy90cy10eXBlcyc7XG5pbXBvcnQgeyBRdWV1ZSB9IGZyb20gJ2J1bGxtcSc7XG5pbXBvcnQgeyBUc1dvcmtlck5hbWUgfSBmcm9tICcuLi8uLi90cy1zZGsvc3JjL2NvbnN0YW50JztcbmltcG9ydCB7IEJMT0NLX1NUQVRVUyB9IGZyb20gJ0Bjb21tb24vdHMtdHlwZW9ybS9hY2NvdW50L2Jsb2NrU3RhdHVzLmVudW0nO1xuXG5ASW5qZWN0YWJsZSh7XG4gIHNjb3BlOiBTY29wZS5ERUZBVUxULFxufSlcbmV4cG9ydCBjbGFzcyBQcm9kdWNlclNlcnZpY2Uge1xuICBwcml2YXRlIGN1cnJlbnRQZW5kaW5nVHhJZCA9IDA7XG4gIHByaXZhdGUgY3VycmVudFBlbmRpbmdCbG9jayA9IDA7XG4gIHByaXZhdGUgY3VycmVudFByb3ZlZEJsb2NrID0gMDtcbiAgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkgbG9nZ2VyOiBQaW5vTG9nZ2VyU2VydmljZSxcbiAgICBASW5qZWN0UmVwb3NpdG9yeShUcmFuc2FjdGlvbkluZm8pIHByaXZhdGUgdHhSZXBvc2l0b3J5OiBSZXBvc2l0b3J5PFRyYW5zYWN0aW9uSW5mbz4sXG4gICAgQEluamVjdFJlcG9zaXRvcnkoQmxvY2tJbmZvcm1hdGlvbikgcHJpdmF0ZSBibG9ja1JlcG9zaXRvcnk6IFJlcG9zaXRvcnk8QmxvY2tJbmZvcm1hdGlvbj4sXG4gICAgQEJ1bGxRdWV1ZUluamVjdChUc1dvcmtlck5hbWUuU0VRVUVOQ0VSKSBwcml2YXRlIHJlYWRvbmx5IHNlcVF1ZXVlOiBRdWV1ZSxcbiAgICBAQnVsbFF1ZXVlSW5qZWN0KFRzV29ya2VyTmFtZS5PUEVSQVRPUikgcHJpdmF0ZSByZWFkb25seSBvcGVyYXRvclF1ZXVlOiBRdWV1ZSxcbiAgICBAQnVsbFF1ZXVlSW5qZWN0KFRzV29ya2VyTmFtZS5QUk9WRVIpIHByaXZhdGUgcmVhZG9ubHkgcHJvdmVyUXVldWU6IFF1ZXVlLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgbWVzc2FnZUJyb2tlclNlcnZpY2U6IE1lc3NhZ2VCcm9rZXIsXG4gICkge1xuICAgIGxvZ2dlci5sb2coJ0Rpc3BhdGNoU2VydmljZScpO1xuICAgIHRoaXMuc3Vic2NyaWJlKCk7XG4gIH1cblxuICBzdWJzY3JpYmUoKSB7XG4gICAgdGhpcy5tZXNzYWdlQnJva2VyU2VydmljZS5zdWJzY3JpYmUoQ0hBTk5FTC5PUkRFUl9DUkVBVEVELCB0aGlzLmRpc3BhdGNoUGVuZGluZ1RyYW5zYWN0aW9uLmJpbmQodGhpcykpO1xuICAgIHRoaXMubWVzc2FnZUJyb2tlclNlcnZpY2Uuc3Vic2NyaWJlKENIQU5ORUwuT1JERVJfUFJPQ0NFU1NELCB0aGlzLmRpc3BhdGNoUGVuaW5nQmxvY2suYmluZCh0aGlzKSk7XG4gICAgdGhpcy5tZXNzYWdlQnJva2VyU2VydmljZS5zdWJzY3JpYmUoQ0hBTk5FTC5PUkRFUl9WRVJJRklFRCwgdGhpcy5kaXNwYXRjaFByb3ZlZEJsb2NrLmJpbmQodGhpcykpO1xuICB9XG5cbiAgdW5zdWJzY3JpYmUoKSB7XG4gICAgdGhpcy5tZXNzYWdlQnJva2VyU2VydmljZS5jbG9zZSgpO1xuICB9XG5cblxuICBwcml2YXRlIHByZXZKb2JJZD86IHN0cmluZztcbiAgYXN5bmMgZGlzcGF0Y2hQZW5kaW5nVHJhbnNhY3Rpb24oKSB7XG4gICAgdGhpcy5sb2dnZXIubG9nKCdkaXNwYXRjaFBlbmRpbmdUcmFuc2FjdGlvbicpO1xuICAgIGNvbnN0IHRyYW5zYWN0aW9ucyA9IGF3YWl0IHRoaXMudHhSZXBvc2l0b3J5LmZpbmQoe1xuICAgICAgd2hlcmU6IHtcbiAgICAgICAgdHhJZDogTW9yZVRoYW4odGhpcy5jdXJyZW50UGVuZGluZ1R4SWQpLFxuICAgICAgICB0eFN0YXR1czogVFNfU1RBVFVTLlBFTkRJTkcsXG4gICAgICB9LFxuICAgICAgb3JkZXI6IHtcbiAgICAgICAgdHhJZDogJ2FzYycsXG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYodHJhbnNhY3Rpb25zLmxlbmd0aCkge1xuICAgICAgdGhpcy5sb2dnZXIubG9nKGBkaXNwYXRjaFBlbmRpbmdUcmFuc2FjdGlvbiBhZGQgJHt0cmFuc2FjdGlvbnMubGVuZ3RofSBibG9ja3NgKTtcbiAgICAgIHRoaXMuY3VycmVudFBlbmRpbmdUeElkID0gdHJhbnNhY3Rpb25zW3RyYW5zYWN0aW9ucy5sZW5ndGggLSAxXS50eElkO1xuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRyYW5zYWN0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgdHggPSB0cmFuc2FjdGlvbnNbaW5kZXhdO1xuICAgICAgICBjb25zdCBqb2JJZCA9IGAke1RzV29ya2VyTmFtZS5TRVFVRU5DRVJ9LSR7dHgudHhJZH1gO1xuICAgICAgICBjb25zb2xlLmxvZyh7XG4gICAgICAgICAgam9iSWQsXG4gICAgICAgICAgcHJldkpvYklkOiB0aGlzLnByZXZKb2JJZCxcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIGNvbnN0IGpvYmEgPSBhd2FpdCB0aGlzLnNlcVF1ZXVlLmdldEpvYihqb2JJZCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3Qgam9iID0gYXdhaXQgdGhpcy5zZXFRdWV1ZS5hZGQodHgudHhJZC50b1N0cmluZygpLCB0eCwge1xuICAgICAgICAgICAgam9iSWQsXG4gICAgICAgICAgICAvLyBwYXJlbnQ6IHRoaXMucHJldkpvYklkID8ge1xuICAgICAgICAgICAgLy8gICBpZDogdGhpcy5wcmV2Sm9iSWQsXG4gICAgICAgICAgICAvLyAgIHF1ZXVlOiBUc1dvcmtlck5hbWUuU0VRVUVOQ0VSLFxuICAgICAgICAgICAgLy8gfSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB0aGlzLnByZXZKb2JJZCA9IHRoaXMuc2VxUXVldWUudG9LZXkoam9iLmlkPy50b1N0cmluZygpIHx8ICcnKTtcbiAgICAgICAgICB0aGlzLmxvZ2dlci5sb2coYEpPQjogJHtqb2IuaWR9YCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhc3luYyBkaXNwYXRjaFBlbmluZ0Jsb2NrKCkge1xuICAgIHRoaXMubG9nZ2VyLmxvZygnZGlzcGF0Y2hQZW5pbmdCbG9jaycpO1xuICAgIGNvbnN0IGJsb2NrcyA9IGF3YWl0IHRoaXMuYmxvY2tSZXBvc2l0b3J5LmZpbmQoe1xuICAgICAgd2hlcmU6IHtcbiAgICAgICAgYmxvY2tOdW1iZXI6IE1vcmVUaGFuKHRoaXMuY3VycmVudFBlbmRpbmdCbG9jayksXG4gICAgICAgIGJsb2NrU3RhdHVzOiBCTE9DS19TVEFUVVMuUFJPQ0VTU0lORyxcbiAgICAgIH0sXG4gICAgICBvcmRlcjoge1xuICAgICAgICBibG9ja051bWJlcjogJ2FzYycsXG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYoYmxvY2tzLmxlbmd0aCkge1xuICAgICAgdGhpcy5sb2dnZXIubG9nKGBkaXNwYXRjaFBlbmluZ0Jsb2NrIGFkZCAke2Jsb2Nrcy5sZW5ndGh9IGJsb2Nrc2ApO1xuICAgICAgdGhpcy5jdXJyZW50UGVuZGluZ0Jsb2NrID0gYmxvY2tzW2Jsb2Nrcy5sZW5ndGggLSAxXS5ibG9ja051bWJlcjtcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBibG9ja3MubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IGJsb2NrID0gYmxvY2tzW2luZGV4XTtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnNhZmUtYXJndW1lbnRcbiAgICAgICAgdGhpcy5wcm92ZXJRdWV1ZS5hZGQoYmxvY2suYmxvY2tOdW1iZXIudG9TdHJpbmcoKSwgYmxvY2spO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGRpc3BhdGNoUHJvdmVkQmxvY2soKSB7XG4gICAgdGhpcy5sb2dnZXIubG9nKCdkaXNwYXRjaFByb3ZlZEJsb2NrJyk7XG4gICAgY29uc3QgYmxvY2tzID0gYXdhaXQgdGhpcy5ibG9ja1JlcG9zaXRvcnkuZmluZCh7XG4gICAgICB3aGVyZToge1xuICAgICAgICBibG9ja051bWJlcjogTW9yZVRoYW4odGhpcy5jdXJyZW50UHJvdmVkQmxvY2spLFxuICAgICAgICBibG9ja1N0YXR1czogQkxPQ0tfU1RBVFVTLkwyQ09ORklSTUVELFxuICAgICAgfSxcbiAgICAgIG9yZGVyOiB7XG4gICAgICAgIGJsb2NrTnVtYmVyOiAnYXNjJyxcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZihibG9ja3MubGVuZ3RoKSB7XG4gICAgICB0aGlzLmxvZ2dlci5sb2coYGRpc3BhdGNoUHJvdmVkQmxvY2sgYWRkICR7YmxvY2tzLmxlbmd0aH0gYmxvY2tzYCk7XG4gICAgICB0aGlzLmN1cnJlbnRQcm92ZWRCbG9jayA9IGJsb2Nrc1tibG9ja3MubGVuZ3RoIC0gMV0uYmxvY2tOdW1iZXI7XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgYmxvY2tzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCBibG9jayA9IGJsb2Nrc1tpbmRleF07XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLWFyZ3VtZW50XG4gICAgICAgIHRoaXMub3BlcmF0b3JRdWV1ZS5hZGQoYmxvY2suYmxvY2tOdW1iZXIudG9TdHJpbmcoKSwgYmxvY2spO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBcbn1cbiIsImV4cG9ydCBlbnVtIENIQU5ORUwge1xuICBPUkRFUl9DUkVBVEVEID0gJ09SREVSX0NSRUFURUQnLFxuICBPUkRFUl9WRVJJRklFRCA9ICdPUkRFUl9WRVJJRklFRCcsXG4gIE9SREVSX1BST0NDRVNTRCA9ICdPUkRFUl9QUk9DQ0VTU0QnXG59XG5leHBvcnQgY29uc3QgQ0hBTk5FTFM6IENIQU5ORUxbXSA9IFtcbiAgQ0hBTk5FTC5PUkRFUl9DUkVBVEVELCBcbiAgQ0hBTk5FTC5PUkRFUl9WRVJJRklFRCwgXG4gIENIQU5ORUwuT1JERVJfUFJPQ0NFU1NEXG5dOyIsImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBNZXNzYWdlQnJva2VyIHtcbiAgY29ubmVjdCE6ICgpID0+IFByb21pc2U8dm9pZD47XG4gIGFkZENoYW5uZWxzITogKGNoYW5uZWxOYW1lczpzdHJpbmdbXSkgPT4gUHJvbWlzZTx2b2lkPjtcbiAgcmVtb3ZlQ2hhbm5lbCE6IChjaGFubmVsTmFtZTpzdHJpbmcpID0+IFByb21pc2U8dm9pZD47XG4gIHB1Ymxpc2ghOiAoY2hhbm5lbE5hbWU6IHN0cmluZywgZGF0YTogYW55KSA9PiBQcm9taXNlPHZvaWQ+O1xuICBzdWJzY3JpYmUhOiAoY2hhbm5lbE5hbWU6IHN0cmluZywgIGV2ZW50TGlzdGVuZXI6IChwYXlsb2FkOiBhbnkpPT52b2lkICkgPT4gUHJvbWlzZTx2b2lkPjtcbiAgY2xvc2UhOiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xufSAiLCJpbXBvcnQgeyBQaW5vTG9nZ2VyU2VydmljZSB9IGZyb20gJ0Bjb21tb24vbG9nZ2VyL2FkYXB0ZXJzL3JlYWwvcGlub0xvZ2dlci5zZXJ2aWNlJztcbmltcG9ydCB7IExvZ2dlck1vZHVsZSB9IGZyb20gJ0Bjb21tb24vbG9nZ2VyL2xvZ2dlci5tb2R1bGUnO1xuaW1wb3J0IHsgR2xvYmFsLCBNb2R1bGUgfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5pbXBvcnQgeyBDb25maWdNb2R1bGUsIENvbmZpZ1NlcnZpY2UgfSBmcm9tICdAbmVzdGpzL2NvbmZpZyc7XG5pbXBvcnQgeyBNZXNzYWdlQnJva2VyU2VydmljZSB9IGZyb20gJy4vYWRhcHRlcnMvbWVzc2FnZUJyb2tlci5zZXJ2aWNlJztcbmltcG9ydCB7IE1lc3NhZ2VCcm9rZXIgfSBmcm9tICcuL3BvcnRzL21lc3NhZ2VCcm9rZXInO1xuXG5AR2xvYmFsKClcbkBNb2R1bGUoe1xuICBpbXBvcnRzOiBbQ29uZmlnTW9kdWxlLCBMb2dnZXJNb2R1bGVdLFxuICBwcm92aWRlcnM6IFtDb25maWdTZXJ2aWNlLCBQaW5vTG9nZ2VyU2VydmljZSwge1xuICAgIHByb3ZpZGU6IE1lc3NhZ2VCcm9rZXIsXG4gICAgdXNlQ2xhc3M6IE1lc3NhZ2VCcm9rZXJTZXJ2aWNlXG4gIH1dLFxuICBleHBvcnRzOiBbTWVzc2FnZUJyb2tlcl1cbn0pXG5leHBvcnQgY2xhc3MgRGF0YWJhc2VQdWJTdWJNb2R1bGUge30iLCJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQG5lc3Rqcy9jb21tb24nO1xuaW1wb3J0IHsgQ29uZmlnU2VydmljZSB9IGZyb20gJ0BuZXN0anMvY29uZmlnJztcbmltcG9ydCB7IE1lc3NhZ2VCcm9rZXIgfSBmcm9tICcuLi9wb3J0cy9tZXNzYWdlQnJva2VyJztcbmltcG9ydCB7IFBnUHViU3ViIH0gZnJvbSAnQGltcXVldWUvcGctcHVic3ViJztcbmltcG9ydCB7IFBpbm9Mb2dnZXJTZXJ2aWNlIH0gZnJvbSAnQGNvbW1vbi9sb2dnZXIvYWRhcHRlcnMvcmVhbC9waW5vTG9nZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgdGhyZWFkSWQgfSBmcm9tICd3b3JrZXJfdGhyZWFkcyc7XG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTWVzc2FnZUJyb2tlclNlcnZpY2UgaW1wbGVtZW50cyBNZXNzYWdlQnJva2VyIHtcbiAgcHJpdmF0ZSBEQVRBQkFTRV9VUkw6IHN0cmluZztcbiAgcHJpdmF0ZSBwdWJTdWJJbnN0YW5jZTogUGdQdWJTdWI7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgY29uZmlnU2VydmljZTogQ29uZmlnU2VydmljZSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IGxvZ2dlcjogUGlub0xvZ2dlclNlcnZpY2VcbiAgKSB7XG4gICAgdGhpcy5sb2dnZXIuc2V0Q29udGV4dChNZXNzYWdlQnJva2VyU2VydmljZS5uYW1lKTtcbiAgICB0aGlzLkRBVEFCQVNFX1VSTCA9IHRoaXMuY29uZmlnU2VydmljZS5nZXQ8c3RyaW5nPignREFUQUJBU0VfVVJMJywgJycpO1xuICAgIHRoaXMucHViU3ViSW5zdGFuY2UgPSBuZXcgUGdQdWJTdWIoe1xuICAgICAgY29ubmVjdGlvblN0cmluZzogdGhpcy5EQVRBQkFTRV9VUkwsXG4gICAgICBzaW5nbGVMaXN0ZW5lcjogZmFsc2VcbiAgICB9KTtcbiAgICB0aGlzLmNvbm5lY3QoKTtcbiAgfVxuICBhc3luYyBjb25uZWN0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMucHViU3ViSW5zdGFuY2UuY29ubmVjdCgpXG4gICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoZXJyKTtcbiAgICAgIH0pXG4gICAgO1xuICB9XG4gIGFzeW5jIGFkZENoYW5uZWxzKGNoYW5uZWxOYW1lczogc3RyaW5nW10pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLmxvZ2dlci5sb2coY2hhbm5lbE5hbWVzKTtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChjaGFubmVsTmFtZXMubWFwKGNoYW5uZWxOYW1lID0+ICgpPT4gdGhpcy5wdWJTdWJJbnN0YW5jZS5saXN0ZW4oY2hhbm5lbE5hbWUpKSk7XG4gIH1cbiAgYXN5bmMgc3Vic2NyaWJlKGNoYW5uZWxOYW1lOiBzdHJpbmcsIGV2ZW50TGlzdGVuZXI6ICgocGF5bG9hZDogYW55KSA9PiB2b2lkKSk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMubG9nZ2VyLmxvZyhgYWRkQ2hhbm5lbExpc3RlbmVyOiAke2NoYW5uZWxOYW1lfWApO1xuICAgIGNvbnNvbGUubG9nKCdzdWJzY3JpYmUnLCBjaGFubmVsTmFtZSk7XG4gICAgYXdhaXQgdGhpcy5wdWJTdWJJbnN0YW5jZS5jaGFubmVscy5vbihjaGFubmVsTmFtZSwgZXZlbnRMaXN0ZW5lcik7XG4gIH1cbiAgYXN5bmMgcmVtb3ZlQ2hhbm5lbChjaGFubmVsTmFtZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5sb2dnZXIubG9nKGByZW1vdmVDaGFubmVsOiAke2NoYW5uZWxOYW1lfWApO1xuICAgIGF3YWl0IHRoaXMucHViU3ViSW5zdGFuY2UudW5saXN0ZW4oY2hhbm5lbE5hbWUpO1xuICB9XG4gIGFzeW5jIHB1Ymxpc2goY2hhbm5lbE5hbWU6IHN0cmluZywgZGF0YTogYW55KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc29sZS5sb2coe25hbWU6J3B1Ymxpc2gnLCBjaGFubmVsTmFtZSwgZGF0YX0pO1xuICAgIHRoaXMubG9nZ2VyLmxvZyh7bmFtZToncHVibGlzaCcsIGNoYW5uZWxOYW1lLCBkYXRhfSk7XG4gICAgYXdhaXQgdGhpcy5wdWJTdWJJbnN0YW5jZS5jaGFubmVscy5lbWl0KGNoYW5uZWxOYW1lLCBkYXRhKTtcbiAgfVxuICBhc3luYyBjbG9zZSgpOlByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMubG9nZ2VyLmxvZygnY2xvc2UnKTtcbiAgICBhd2FpdCB0aGlzLnB1YlN1Ykluc3RhbmNlLmNsb3NlKCk7XG4gIH1cbiAgXG59IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiQGltcXVldWUvcGctcHVic3ViXCIpOzsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiaW1wb3J0ICogYXMgX2NsdXN0ZXIgZnJvbSAnY2x1c3Rlcic7XG5pbXBvcnQgdHlwZSB7IENsdXN0ZXIgfSBmcm9tICdjbHVzdGVyJztcbmNvbnN0IGNsdXN0ZXIgPSBfY2x1c3RlciBhcyB1bmtub3duIGFzIENsdXN0ZXI7XG4vLyBpbXBvcnQgeyBib290c3RyYXAgYXMgR2F0ZXdheUJvb3RzdHJhcCB9IGZyb20gJ0B0cy1yb2xsdXAtYXBpL21haW4nO1xuaW1wb3J0IHsgYm9vdHN0cmFwIGFzIE9wZXJhdG9yQm9vdHN0cmFwIH0gZnJvbSAnQHRzLW9wZXJhdG9yL21haW4nO1xuaW1wb3J0IHsgYm9vdHN0cmFwIGFzIFNlcXVlbmNlckJvb3RzdHJhcCB9IGZyb20gJ0B0cy1zZXF1ZW5jZXIvbWFpbic7XG5pbXBvcnQgeyBib290c3RyYXAgYXMgUHJvdmVyQm9vdHN0cmFwIH0gZnJvbSAnQHRzLXByb3Zlci9tYWluJztcbmltcG9ydCB7IFRzV29ya2VyTmFtZSwgV29ya2VySXRlbSB9IGZyb20gJ0B0cy1zZGsvY29uc3RhbnQnO1xuaW1wb3J0IHsgQXBwTW9kdWxlIH0gZnJvbSAnLi9hcHAubW9kdWxlJztcbmltcG9ydCB7IE5lc3RGYWN0b3J5IH0gZnJvbSAnQG5lc3Rqcy9jb3JlJztcbmltcG9ydCB7IFBpbm9Mb2dnZXJTZXJ2aWNlIH0gZnJvbSAnQGNvbW1vbi9sb2dnZXIvYWRhcHRlcnMvcmVhbC9waW5vTG9nZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgZ2V0UHJvY2Vzc05hbWUsIGdldFdvcmtlck5hbWUgfSBmcm9tICdAdHMtc2RrL2hlbHBlcic7XG5pbXBvcnQgeyBNYWluUHJvY2Vzc1NlcnZpY2UgfSBmcm9tICdAY29tbW9uL2NsdXN0ZXIvbWFpbi1wcm9jZXNzLnNlcnZpY2UnO1xuXG5jbHVzdGVyaXplKFtcbiAgLy8ge1xuICAvLyAgIG5hbWU6IFRzV29ya2VyTmFtZS5HQVRFV0FZLFxuICAvLyAgIGJvb3RzdHJhcDogR2F0ZXdheUJvb3RzdHJhcCxcbiAgLy8gfSxcbiAgeyBcbiAgICBuYW1lOiBUc1dvcmtlck5hbWUuT1BFUkFUT1IsXG4gICAgYm9vdHN0cmFwOiBPcGVyYXRvckJvb3RzdHJhcCxcbiAgfSxcbiAgLy8geyBcbiAgLy8gICBuYW1lOiBUc1dvcmtlck5hbWUuU0VRVUVOQ0VSLFxuICAvLyAgIGJvb3RzdHJhcDogU2VxdWVuY2VyQm9vdHN0cmFwLFxuICAvLyB9LFxuICAvLyB7IFxuICAvLyAgIG5hbWU6IFRzV29ya2VyTmFtZS5QUk9WRVIsXG4gIC8vICAgYm9vdHN0cmFwOiBQcm92ZXJCb290c3RyYXAsXG4gIC8vIH0sXG5dKTtcbmFzeW5jIGZ1bmN0aW9uIGNsdXN0ZXJpemUod29ya2VyczogV29ya2VySXRlbVtdKSB7XG4gIGlmKGNsdXN0ZXIuaXNQcmltYXJ5KXtcbiAgICBhd2FpdCBzZXR1cE1hc3RlckFwcChBcHBNb2R1bGUsIHdvcmtlcnMpO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IHdvcmtlck5hbWUgPSBnZXRXb3JrZXJOYW1lKCk7XG4gICAgY29uc3Qgd29ya2VyID0gd29ya2Vycy5maW5kKChpdGVtKSA9PiBpdGVtLm5hbWUgPT09IHdvcmtlck5hbWUpO1xuICAgIGlmKHdvcmtlcikge1xuICAgICAgYXdhaXQgd29ya2VyLmJvb3RzdHJhcCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFdvcmtlciAke3dvcmtlck5hbWV9IG5vdCBmb3VuZGApO1xuICAgIH1cbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBzZXR1cE1hc3RlckFwcChtb2R1bGU6IHVua25vd24sIHdvcmtlcnM6IFdvcmtlckl0ZW1bXSkge1xuICBjb25zdCBhcHAgPSBhd2FpdCBOZXN0RmFjdG9yeS5jcmVhdGVBcHBsaWNhdGlvbkNvbnRleHQobW9kdWxlKTtcbiAgY29uc3QgbG9nZ2VyID0gYXBwLmdldChQaW5vTG9nZ2VyU2VydmljZSk7XG4gIGxvZ2dlci5zZXRDb250ZXh0KGdldFdvcmtlck5hbWUoKSk7XG4gIGNvbnN0IGNsdXN0ZXJTZXJ2aWNlID0gYXBwLmdldChNYWluUHJvY2Vzc1NlcnZpY2UpO1xuICBjbHVzdGVyU2VydmljZS5jbHVzdGVyaXplKHdvcmtlcnMpO1xuICBsb2dnZXIuc2V0Q29udGV4dChnZXRQcm9jZXNzTmFtZSgpKTtcblxuICBsb2dnZXIubG9nKGAke1RzV29ya2VyTmFtZS5DT1JFfTogc2VydmVyIHN0YXJ0ZWQhYCk7XG4gIHJldHVybiBhcHA7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9