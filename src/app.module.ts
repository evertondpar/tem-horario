import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppService } from './app.service';
import { EstablishmentsModule } from './establishments/establishments.module';
import { ServicesModule } from './services/services.module';
import { CollaboratorsModule } from './collaborators/collaborators.module';
import { SchedulesModule } from './schedules/schedules.module';
import { CollaboratorServiceModule } from './collaborator-service/collaborator-service.module';
import { ClientsModule } from './clients/clients.module';
import { AppointmentsModule } from './appointments/appointments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule,
        EstablishmentsModule,
        ServicesModule,
        CollaboratorsModule,
        SchedulesModule,
        CollaboratorServiceModule,
        ClientsModule,
        AppointmentsModule,
      ],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST'),
        port: +config.get('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASS'),
        database: config.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // só em dev! nunca em produção
      }),
    }),
    EstablishmentsModule,
    ServicesModule,
    CollaboratorsModule,
    SchedulesModule,
    CollaboratorServiceModule,
    ClientsModule,
    AppointmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
