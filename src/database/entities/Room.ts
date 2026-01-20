import { Entity, PrimaryColumn, Column, OneToMany, Generated } from 'typeorm';
import { MessageEntity } from './MessageEntity';

@Entity('room')
export class Room {
    @PrimaryColumn('text')
    @Generated('uuid')
    id!: string;

    @Column({
        type: 'text',
        transformer: {
            to: (value: string[]) => JSON.stringify(value),
            from: (value: string) => JSON.parse(value)
        }
    })
    memberArray!: string[]; // Array of user UUIDs

    @Column({ type: 'varchar', length: 50 })
    type!: string; // private, group, etc.

    @OneToMany(() => MessageEntity, message => message.room)
    messages?: MessageEntity[];
}
