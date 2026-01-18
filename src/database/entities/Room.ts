import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Message } from './Message';

@Entity('room')
export class Room {
    @PrimaryColumn('text')
    id!: string;

    @Column({type: 'text'})
    memberArray!: string[]; // Array of user UUIDs

    @Column({ type: 'varchar', length: 50 })
    type!: string; // private, group, etc.

    @OneToMany(() => Message, message => message.room)
    messages!: Message[];
}
