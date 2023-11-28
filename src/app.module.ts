import {Module} from '@nestjs/common';
import {ProcessorModule} from './processor/processor.module';
import {ConfigModule} from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot(),
        ProcessorModule,
    ],
})
export class AppModule {
}
