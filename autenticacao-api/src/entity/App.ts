import { Entity, Column, ManyToMany, JoinTable, PrimaryGeneratedColumn, OneToMany } from "typeorm"
import { UserToApp} from './UseApp'

export enum STATUSAPP {
  INVALID_PASSWORD = 'The password must contain at least 8 characters, 1 uppercase character, and 1 digit',
  OK = 'Ok',
  INVALID_SECRET = 'This Secret has already been registered',
  INVALID_ID_APP =  'Already have an app with this ID',
  EMAIL_EXISTING = 'EXISTING EMAIL',
  ID_EXISTING = 'EXISTING ID',
  REGISTER_ERROR= 'REGISTER ERROR'
}
@Entity()
export class App {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  id_app: string;

  @Column()
  secret: string;

  @Column()
  expiresIn: string;

  @OneToMany(() => UserToApp, userToApp => userToApp.app)
    public userToApp!: UserToApp[];

  constructor(id_app: string, secret: string, expiresIn: string) {
    this.id_app = id_app
    this.secret = secret
    this.expiresIn = expiresIn
  }

  isValid(): STATUSAPP {
    if (this.secret === "") {
      return STATUSAPP.INVALID_SECRET
    }
      return STATUSAPP.OK
    
  }
}