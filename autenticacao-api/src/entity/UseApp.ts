import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { App } from "./App";
import { User } from "./User";

@Entity()
export class UserToApp {
    @PrimaryGeneratedColumn()
    public userToAppId!: number;

    @Column()
    public email!: string;

    @Column()
    public  id_app!: string;
 
    @ManyToOne(() => User, user => user.userToApp)
    public user!: User;

    @ManyToOne(() => App, app => app.userToApp)
    public app!: App;
}