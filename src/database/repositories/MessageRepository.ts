import { v4 } from 'uuid';
import {AppDataSource} from '../dataSource';
import {MessageEntity} from '../entities/MessageEntity';

export class MessageRepository {
  private get repository() {
    return AppDataSource.getRepository(MessageEntity);
  }

  async create(messageData: Partial<MessageEntity>): Promise<MessageEntity> {
    if (!messageData.id) {
      messageData.id = v4();
    }
    if (!messageData.created_by && messageData.createdBy?.id) {
      messageData.created_by = messageData.createdBy.id;
    }
    const message = this.repository.create(messageData);
    return await this.repository.save(message);
  }

  // Lấy messages của một room
  async findByRoomId(roomId: string): Promise<MessageEntity[]> {
    return await this.repository.find({
      where: {roomId},
      relations: ['createdBy', 'room'],
      order: {createdAt: 'DESC'},
    });
  }

  // Lấy messages của một user
  async findByUserId(userId: string): Promise<MessageEntity[]> {
    return await this.repository.find({
      where: {created_by: userId},
      relations: ['createdBy', 'room'],
      order: {createdAt: 'DESC'},
    });
  }

  // Lấy message theo ID
  async findById(id: string): Promise<MessageEntity | null> {
    return await this.repository.findOne({
      where: {id},
      relations: ['createdBy', 'room'],
    });
  }
  async findAll(): Promise<MessageEntity[]> {
    return await this.repository.find({
      relations: ['createdBy', 'room'],
    });
  }

  // Update message status
  async updateStatus(messageId: string, status: string): Promise<MessageEntity | null> {
    await this.repository.update(messageId, {status});
    return await this.findById(messageId);
  }

  // Update nhiều messages status
  async updateManyStatus(messageIds: string[], status: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(MessageEntity)
      .set({status})
      .where('id IN (:...ids)', {ids: messageIds})
      .execute();
  }

  // Đếm unread messages trong room
  async countUnreadInRoom(roomId: string, userId: string): Promise<number> {
    return await this.repository
      .createQueryBuilder('message')
      .where('message.roomId = :roomId', {roomId})
      .andWhere('message.created_by != :userId', {userId})
      .andWhere('message.status != :status', {status: 'read'})
      .getCount();
  }

  // Lấy tin nhắn cuối cùng của room
  async getLastMessageByRoomId(roomId: string): Promise<MessageEntity | null> {
    return await this.repository.findOne({
      where: {roomId},
      relations: ['createdBy'],
      order: {createdAt: 'DESC'},
    });
  }

  // Xóa message
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return !!result.affected;
  }

  // Xóa tất cả messages của room
  async deleteByRoomId(roomId: string): Promise<boolean> {
    const result = await this.repository.delete({roomId});
    return !!result.affected;
  }
}
