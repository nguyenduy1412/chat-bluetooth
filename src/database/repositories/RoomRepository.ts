import { v4 } from 'uuid';
import {AppDataSource} from '../dataSource';
import {Room} from '../entities/Room';

export class RoomRepository {
  // Lazy load repository - chỉ lấy khi cần để tránh lỗi khi DB chưa init
  private get repository() {
    return AppDataSource.getRepository(Room);
  }

  // Tạo room mới
  async create(roomData: Room): Promise<Room> {
    roomData.id = v4();
    const room = this.repository.create(roomData);
    return await this.repository.save(room);
  }

  // Lấy tất cả rooms
  async findAll(): Promise<Room[]> {
    return await this.repository.find({
      relations: ['messages'],
    });
  }

  // Tìm room theo ID
  async findById(id: string): Promise<Room | null> {
    return await this.repository.findOne({
      where: {id},
      relations: ['messages'],
    });
  }

  // Lấy tất cả rooms của một user
  async findByUserId(userId: string): Promise<Room[]> {
    const allRooms = await this.repository.find();
    return allRooms.filter(room => room.memberArray.includes(userId));
  }

  // Tìm room private giữa 2 users
  async findPrivateRoom(userId1: string, userId2: string): Promise<Room | null> {
    const allRooms = await this.repository.find({
      where: {type: 'private'},
    });

    return (
      allRooms.find(
        room =>
          room.memberArray.length === 2 &&
          room.memberArray.includes(userId1) &&
          room.memberArray.includes(userId2),
      ) || null
    );
  }

  // Update room
  async update(id: string, roomData: Partial<Room>): Promise<Room | null> {
    await this.repository.update(id, roomData);
    return await this.findById(id);
  }

  // Thêm member vào room
  async addMember(roomId: string, userId: string): Promise<Room | null> {
    const room = await this.findById(roomId);
    if (!room) return null;

    if (!room.memberArray.includes(userId)) {
      room.memberArray.push(userId);
      return await this.repository.save(room);
    }
    return room;
  }

  // Xóa member khỏi room
  async removeMember(roomId: string, userId: string): Promise<Room | null> {
    const room = await this.findById(roomId);
    if (!room) return null;

    room.memberArray = room.memberArray.filter(id => id !== userId);
    return await this.repository.save(room);
  }

  // Xóa room
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return !!result.affected;
  }
}
