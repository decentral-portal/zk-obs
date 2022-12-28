import { GetL2BalanceRequestDto } from '@ts-rollup-api/infrastructure/dtos/getL2BalanceRequest.dto';
import { GetL2BalanceResponseDto } from '@ts-rollup-api/infrastructure/dtos/getL2BalanceResponse.dto';

export abstract class L2BalanceRepository {
  getL2RealBalance!:(req: GetL2BalanceRequestDto) => Promise<GetL2BalanceResponseDto>;
}