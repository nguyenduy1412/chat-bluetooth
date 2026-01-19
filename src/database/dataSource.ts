import 'reflect-metadata';
import {DataSource} from 'typeorm';
import {typeORMDriver} from 'react-native-nitro-sqlite';
import * as FileSystem from 'expo-file-system';

// Import các entities
import {User} from './entities/User';
import {MessageEntity} from './entities/MessageEntity';
import {Room} from './entities/Room';

export const AppDataSource = new DataSource({
  type: 'react-native',
  database: 'chatbluetooth.sqlite',
  location: '.',
  driver: typeORMDriver,
  entities: [User, MessageEntity, Room],
  synchronize: false, // TẮT auto sync - sẽ sync manually trong initDatabase()
  logging: __DEV__, // Log queries khi dev
  migrationsRun: false,
  dropSchema: false,
});

// Flag để track trạng thái đang khởi tạo (tránh race condition)
let isInitializing = false;
let initPromise: Promise<void> | null = null;

/**
 * Khởi tạo database một cách an toàn
 * - Nếu đã khởi tạo rồi thì return luôn
 * - Nếu đang khởi tạo thì chờ promise cũ
 * - Nếu chưa khởi tạo thì tiến hành khởi tạo
 * - Tự động sync schema nếu có thêm bảng mới (synchronize: true)
 */
export const initDatabase = async (): Promise<void> => {
  // Nếu đã khởi tạo thành công rồi, return luôn
  console.log('🔄 Initializing database...',AppDataSource.isInitialized);
  if (AppDataSource.isInitialized) {
    console.log('⚡ Database already initialized, skipping...');
    return;
  }

  // Nếu đang trong quá trình khởi tạo, chờ promise cũ
  if (isInitializing && initPromise) {
    console.log('⏳ Database initialization in progress, waiting...');
    return initPromise;
  }

  // Bắt đầu khởi tạo
  isInitializing = true;
  initPromise = (async () => {
    try {
      await AppDataSource.initialize();
      
      // Tự động chạy synchronize() một lần duy nhất
      // Thay vì để TypeORM tự động sync mỗi lần khởi động
      const queryRunner = AppDataSource.createQueryRunner();
      try {
        // Kiểm tra xem tables đã tồn tại chưa
        const tables = await queryRunner.getTables(['message', 'user', 'room']);
        
        // Nếu chưa có bảng nào, chạy sync
        if (tables.length === 0) {
          console.log('📋 Creating database schema...');
          await AppDataSource.synchronize(false); // false = không drop schema cũ
          console.log('✅ Database schema created');
        } else {
          console.log('📋 Database schema already exists');
        }
      } finally {
        await queryRunner.release();
      }
      
      console.log('✅ Database initialized successfully');
    } catch (error) {
      // Reset flags nếu lỗi để có thể retry
      isInitializing = false;
      initPromise = null;

      const errorMessage = (error as Error).message || '';

      // Nếu lỗi là do đã khởi tạo rồi (edge case), bỏ qua
      if (
        errorMessage.includes('already') ||
        errorMessage.includes('initialized')
      ) {
        console.log('⚠️ Database was already initialized (caught in error)');
        return;
      }

      console.error('❌ Error initializing database:', error);
      throw error;
    }
  })();

  return initPromise;
};

/**
 * Đóng kết nối database (dùng khi cần cleanup hoặc reset)
 */
export const closeDatabase = async (): Promise<void> => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    isInitializing = false;
    initPromise = null;
    console.log('🔒 Database connection closed');
  }
};

/**
 * Reset và khởi tạo lại database
 * Hữu ích khi cần force re-sync schema
 */
export const resetDatabase = async (): Promise<void> => {
  await closeDatabase();
  await initDatabase();
  console.log('🔄 Database reset completed');
};

/**
 * Kiểm tra database đã sẵn sàng chưa
 */
export const isDatabaseReady = (): boolean => {
  return AppDataSource.isInitialized;
};

/**
 * Đảm bảo database đã được khởi tạo trước khi thực hiện operation
 * Dùng như một guard function
 */
export const ensureDatabase = async (): Promise<DataSource> => {
  if (!AppDataSource.isInitialized) {
    await initDatabase();
  }
  return AppDataSource;
};

/**
 * Xóa toàn bộ database và tạo lại từ đầu
 * ⚠️ CẢNH BÁO: Xóa hết tất cả dữ liệu!
 */
export const deleteAndRecreateDatabase = async (): Promise<void> => {
  try {
    // Đóng connection nếu đang mở
    if (AppDataSource.isInitialized) {
      await closeDatabase();
    }

    // Xóa file database
    const dbPath = `${FileSystem.documentDirectory}SQLite/chatbluetooth.sqlite`;
    const fileInfo = await FileSystem.getInfoAsync(dbPath);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(dbPath);
      console.log('💥 Database file deleted');
    }

    // Reset flags
    isInitializing = false;
    initPromise = null;

    // Khởi tạo lại
    await initDatabase();
    console.log('✅ Database recreated successfully');
  } catch (error) {
    console.error('❌ Error recreating database:', error);
    throw error;
  }
};
