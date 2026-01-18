import 'reflect-metadata';
import {DataSource} from 'typeorm';
import {typeORMDriver} from 'react-native-nitro-sqlite';

// Import các entities
import {User} from './entities/User';
import {Message} from './entities/Message';
import {Room} from './entities/Room';

export const AppDataSource = new DataSource({
  type: 'react-native',
  database: 'chatbluetooth.sqlite',
  location: '.',
  driver: typeORMDriver,
  entities: [User, Message, Room],
  synchronize: true, // Tự động sync schema khi thêm bảng mới (chỉ dùng khi development)
  logging: __DEV__, // Log queries khi dev
  migrationsRun: false,
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
    // Đảm bảo DB đã init
    if (!AppDataSource.isInitialized) {
      await initDatabase();
    }

    // Drop tất cả tables
    await AppDataSource.dropDatabase();
    console.log('💥 Database dropped');

    // Tạo lại tables từ entities
    await AppDataSource.synchronize();
    console.log('✅ Database recreated successfully');
  } catch (error) {
    console.error('❌ Error recreating database:', error);
    throw error;
  }
};
