# Cấu hình TypeORM với react-native-nitro-sqlite

## ✅ Đã hoàn thành

### 1. Cài đặt thư viện
```bash
yarn add react-native-nitro-sqlite react-native-nitro-modules
yarn add typeorm reflect-metadata
yarn add -D patch-package babel-plugin-module-resolver
```

### 2. Cấu hình Babel (babel.config.js)
```javascript
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
          "react-native-sqlite-storage": "react-native-nitro-sqlite"
        },
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      },
    ],
  ],
};
```

### 3. Patch TypeORM
- Đã tạo file `patches/typeorm+0.3.28.patch`
- Đã thêm `"postinstall": "patch-package"` vào package.json

### 4. Import reflect-metadata
- Đã thêm `import 'reflect-metadata'` ở đầu file `index.js`

## 📁 Cấu trúc Database đã tạo

```
src/
  database/
    dataSource.ts              # Cấu hình TypeORM DataSource
    entities/
      User.ts                  # Entity User
      Message.ts               # Entity Message
    repositories/
      UserRepository.ts        # Repository cho User
      MessageRepository.ts     # Repository cho Message
  examples/
    DatabaseExample.tsx        # Ví dụ sử dụng
```

## 🚀 Cách sử dụng

### 1. Khởi tạo Database
```typescript
import {initDatabase} from '@/database/dataSource';

// Trong App.tsx hoặc component root
useEffect(() => {
  initDatabase().then(() => {
    console.log('Database ready!');
  });
}, []);
```

### 2. Sử dụng Repository

#### Tạo User
```typescript
import {UserRepository} from '@/database/repositories/UserRepository';

const userRepo = new UserRepository();

const newUser = await userRepo.create({
  name: 'Nguyen Van A',
  email: 'user@example.com',
  phone: '0123456789',
});
```

#### Lấy danh sách Users
```typescript
const allUsers = await userRepo.findAll();
const activeUsers = await userRepo.findActiveUsers();
const user = await userRepo.findById(1);
```

#### Tạo Message
```typescript
import {MessageRepository} from '@/database/repositories/MessageRepository';

const messageRepo = new MessageRepository();

const message = await messageRepo.create({
  content: 'Hello!',
  sender: user1,
  receiver: user2,
  imageUri: 'file://path/to/image.jpg', // optional
});
```

#### Lấy conversation giữa 2 users
```typescript
const conversation = await messageRepo.findConversation(userId1, userId2);
```

#### Đánh dấu messages đã đọc
```typescript
await messageRepo.markAsRead([messageId1, messageId2]);
```

## 📝 Tạo Entity mới

```typescript
import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm';

@Entity()
export class YourEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({nullable: true})
  description?: string;
}
```

Sau đó thêm entity vào `dataSource.ts`:
```typescript
import {YourEntity} from './entities/YourEntity';

export const AppDataSource = new DataSource({
  // ...
  entities: [User, Message, YourEntity],
  // ...
});
```

## 🎯 Query nâng cao

### QueryBuilder
```typescript
const messages = await messageRepo.repository
  .createQueryBuilder('message')
  .leftJoinAndSelect('message.sender', 'sender')
  .where('sender.id = :senderId', {senderId: 1})
  .andWhere('message.isRead = :isRead', {isRead: false})
  .orderBy('message.createdAt', 'DESC')
  .limit(10)
  .getMany();
```

### Relations
```typescript
const user = await userRepo.repository.findOne({
  where: {id: 1},
  relations: ['messages', 'profile'],
});
```

### Transactions
```typescript
import {AppDataSource} from '@/database/dataSource';

await AppDataSource.transaction(async (transactionalEntityManager) => {
  const user = await transactionalEntityManager.save(User, userData);
  const message = await transactionalEntityManager.save(Message, {
    sender: user,
    // ...
  });
});
```

## ⚙️ Cấu hình bổ sung

### Null Handling (Khuyến nghị)
Thêm vào đầu App.tsx:
```typescript
import {enableSimpleNullHandling} from 'react-native-nitro-sqlite';

enableSimpleNullHandling();
```

### iOS - Sử dụng SQLite built-in
```bash
NITRO_SQLITE_USE_PHONE_VERSION=1 npx pod-install
```

### Enable FTS5 (Full Text Search)

**iOS** - Thêm vào `ios/Podfile`:
```ruby
post_install do |installer|
  installer.pods_project.targets.each do |target|
    if target.name == "RNNitroSQLite" then
      target.build_configurations.each do |config|
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'SQLITE_ENABLE_FTS5=1'
      end
    end
  end
end
```

**Android** - Thêm vào `android/gradle.properties`:
```properties
nitroSqliteFlags="-DSQLITE_ENABLE_FTS5=1"
```

## 🐛 Troubleshooting

### Metro bundler không nhận alias
```bash
yarn start --reset-cache
```

### TypeORM không tìm thấy entities
- Kiểm tra đã import reflect-metadata chưa
- Kiểm tra entities đã thêm vào dataSource.ts chưa

### Lỗi khi build
```bash
# Android
cd android && ./gradlew clean
cd .. && yarn android

# iOS
cd ios && pod install
cd .. && yarn ios
```

## 📚 Tài liệu tham khảo

- [react-native-nitro-sqlite](https://github.com/margelo/react-native-nitro-sqlite)
- [TypeORM Documentation](https://typeorm.io/)
- [TypeORM Entities](https://typeorm.io/entities)
- [TypeORM Query Builder](https://typeorm.io/select-query-builder)
