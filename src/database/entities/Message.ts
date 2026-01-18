import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Room } from './Room';

@Entity('message')
export class Message {
    @PrimaryColumn('text')
    id!: string;

    @Column({ type: 'varchar', length: 50 })
    type!: string; // text, image, file, etc.

    @Column({ type: 'text' })
    message!: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    status?: string; // sent, delivered, read, failed

    @ManyToOne(() => Room, room => room.messages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'roomId' })
    room!: Room;

    @Column({ type: 'varchar', length: 36 })
    roomId!: string;

    @ManyToOne(() => User, user => user.messages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'created_by' })
    createdBy!: User;

    @Column({ type: 'varchar', length: 36 })
    created_by!: string;

    @CreateDateColumn({ type: 'datetime' })
    created_at!: Date;
}
