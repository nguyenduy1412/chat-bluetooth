import {UserType} from '@/types/types';
import {AppDataSource} from '../dataSource';
import {User} from '../entities/User';
import {v4} from 'uuid';

export class UserRepository {
  // Lazy load repository - chỉ lấy khi cần để tránh lỗi khi DB chưa init
  private get repository() {
    return AppDataSource.getRepository(User);
  }

  // Tạo user mới
  async create(userData: User): Promise<User> {
    const user = this.repository.create(userData);
    return await this.repository.save(user);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    const user = await this.repository.findOne({where: {id}});
    if (!user) return null;

    const updatedUser = this.repository.merge(user, data);
    return await this.repository.save(updatedUser);
  }
  // Lấy tất cả users
  async findAll(): Promise<User[]> {
    return await this.repository.find();
  }

  // Tìm user theo ID
  async findById(id: string): Promise<User | null> {
    return await this.repository.findOne({where: {id}});
  }
  async findByAttributes(object: any): Promise<User | null> {
    return await this.repository.findOne({where: object});
  }

  // Tìm user theo email
  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({where: {email}});
  }

  // Tìm user theo device ID
  async findByDeviceId(idDevice: string): Promise<User | null> {
    return await this.repository.findOne({where: {idDevice}});
  }

  // Update user
  async update(id: string, userData: Partial<User>): Promise<User | null> {
    await this.repository.update(id, userData);
    return await this.findById(id);
  }

  // Xóa user
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return !!result.affected;
  }

  // Tìm user active
  async findActiveUsers(): Promise<User[]> {
    return await this.repository.find({where: {isActive: true}});
  }

  // Verify password (giả định bạn sẽ hash password)
  async verifyLogin(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (user && user.password === password) {
      // TODO: Nên dùng bcrypt để hash/compare password
      return user;
    }
    return null;
  }

  // Delete all users (DANGEROUS: Use for Restore only)
  async deleteAll(): Promise<void> {
    const users = await this.repository.find();
    if (users.length > 0) {
      await this.repository.remove(users);
    }
  }

  // Update isActive status
  async setActiveStatus(id: string, isActive: boolean): Promise<User | null> {
    return await this.update(id, {isActive});
  }
}
