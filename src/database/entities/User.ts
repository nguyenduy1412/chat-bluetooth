import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Generated,
} from 'typeorm';
import {MessageEntity} from './MessageEntity';

@Entity('user')
export class User {
  @PrimaryColumn('text')
  id?: string;

  @Column({type: 'varchar', length: 255, nullable: true})
  name?: string;

  @Column({type: 'varchar', length: 255, nullable: true})
  idDevice?: string;

  @Column({type: 'varchar', length: 255, unique: true, nullable: true})
  email?: string;

  @Column({type: 'varchar', length: 255, nullable: true})
  password?: string;

  @CreateDateColumn({type: 'datetime'})
  createdAt?: Date;

  @UpdateDateColumn({type: 'datetime'})
  updatedAt?: Date;

  @Column({type: 'boolean', default: true})
  isActive?: boolean;

  @Column({type: 'varchar', length: 500, nullable: true})
  image?: string;

  @Column({type: 'varchar', nullable: true})
  birthday?: string;

  @Column({type: 'boolean', default: false})
  system?: boolean;

  @Column({type: 'varchar', nullable: true})
  deviceAddress?: string;

  @Column({type: 'int', nullable: true})
  otp?: number;
  @Column({type: 'datetime', nullable: true})
  expiredOtp?: Date;

  @OneToMany(() => MessageEntity, message => message.createdBy)
  messages?: MessageEntity[];
}
