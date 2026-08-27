import { Module } from "@nestjs/common";
import { FirebaseProvider } from "./firebase.provider";
import { FirebaseService } from "./firebase.service";

@Module({
  providers: [FirebaseProvider, FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
