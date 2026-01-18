import { v4 } from 'uuid';
import {AppDataSource} from '../dataSource';
import {Message} from '../entities/Message';

export class MessageRepository {
  private repository = AppDataSource.getRepository(Message);

  // Tạo message mới
  async create(messageData: {
    type: string;
    message: string;
    roomId: string;
    created_by: string;
    status?: string;
    id?: string;
  }): Promise<Message> {
    messageData.id = v4();
    const message = this.repository.create(messageData);
    return await this.repository.save(message);
  }

  // Lấy tất cả messages
  async findAll(): Promise<Message[]> {
    return await this.repository.find({
      relations: ['createdBy', 'room'],
      order: {created_at: 'DESC'},
    });
  }

  // Lấy messages của một room
  async findByRoomId(roomId: string): Promise<Message[]> {
    return await this.repository.find({
      where: {roomId},
      relations: ['createdBy', 'room'],
      order: {created_at: 'ASC'},
    });
  }

  // Lấy messages của một user
  async findByUserId(userId: string): Promise<Message[]> {
    return await this.repository.find({
      where: {created_by: userId},
      relations: ['createdBy', 'room'],
      order: {created_at: 'DESC'},
    });
  }

  // Lấy message theo ID
  async findById(id: string): Promise<Message | null> {
    return await this.repository.findOne({
      where: {id},
      relations: ['createdBy', 'room'],
    });
  }

  // Update message status
  async updateStatus(messageId: string, status: string): Promise<Message | null> {
    await this.repository.update(messageId, {status});
    return await this.findById(messageId);
  }

  // Update nhiều messages status
  async updateManyStatus(messageIds: string[], status: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(Message)
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
  async getLastMessageByRoomId(roomId: string): Promise<Message | null> {
    return await this.repository.findOne({
      where: {roomId},
      relations: ['createdBy'],
      order: {created_at: 'DESC'},
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
