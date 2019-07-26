import { Module } from '@nestjs/common';
import { AddressController } from './controllers/address.controller';
import { BlockController } from './controllers/block.controller';
import { HomeController } from './controllers/home.controller';
import { TokenController } from './controllers/token.controller';
import { TxController } from './controllers/tx.controller';
import { CacheService } from './services/cache.service';
import { DataService } from './services/data.service';

@Module({
	// imports: [TypeOrmModule.forRoot(), TypeOrmModule.forFeature([])],
	controllers: [HomeController, BlockController, TxController, AddressController, TokenController],
	providers: [DataService, CacheService],


})
export class AppModule {}
