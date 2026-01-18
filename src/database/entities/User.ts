import {Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany} from 'typeorm';
import {Message} from './Message';

@Entity('user')
export class User {
  @PrimaryColumn('text')
  id!: string;

  @Column({type: 'varchar', length: 255})
  name!: string;

  @Column({type: 'varchar', length: 255, nullable: true})
  idDevice?: string;

  @Column({type: 'varchar', length: 255, unique: true})
  email!: string;

  @Column({type: 'varchar', length: 255})
  password!: string;

  @CreateDateColumn({type: 'datetime'})
  createdAt!: Date;

  @UpdateDateColumn({type: 'datetime'})
  updatedAt!: Date;

  @Column({type: 'boolean', default: true})
  isActive!: boolean;

  @Column({type: 'varchar', length: 500, nullable: true})
  image?: string;

  @Column({type: 'varchar', nullable: true})
  birthday?: string;

  @OneToMany(() => Message, message => message.createdBy)
  messages!: Message[];
}
