/**
 * Supabase Sync Service
 * Sync local SQLite data to Supabase cloud database
 */

import {supabase} from '@/lib/supabase';
import {UserRepository} from '@/database/repositories/UserRepository';
import {RoomRepository} from '@/database/repositories/RoomRepository';
import {MessageRepository} from '@/database/repositories/MessageRepository';
import {User} from '@/database/entities/User';
import {Room} from '@/database/entities/Room';
import {MessageEntity} from '@/database/entities/MessageEntity';

// Initialize repositories
const userRepository = new UserRepository();
const roomRepository = new RoomRepository();
const messageRepository = new MessageRepository();

// ============================================
// USER SYNC
// ============================================

/**
 * Transform local User entity to Supabase format
 */
// Helper to safely convert Date types
const safeDateToISO = (date: any): string | null => {
  if (!date) return null;
  if (date?.isNitroSQLiteNull) return null; // Handle Nitro null

  if (date instanceof Date) {
    try {
      return date.toISOString();
    } catch (e) {
      return null;
    }
  }

  if (typeof date === 'string') {
    const d = new Date(date);
    if (!isNaN(d.getTime())) {
      return d.toISOString();
    }
    return date;
  }

  try {
    return new Date(date).toISOString();
  } catch (e) {
    return null;
  }
};

// Helper to sanitize NitroSQLite values
const sanitizeValue = (value: any) => {
  if (value && typeof value === 'object' && value.isNitroSQLiteNull === true) {
    return null;
  }
  return value;
};

/**
 * Transform local User entity to Supabase format
 */
const transformUserForSupabase = (user: User) => ({
  id: sanitizeValue(user.id),
  name: sanitizeValue(user.name) || null,
  id_device: sanitizeValue(user.idDevice) || null,
  email: sanitizeValue(user.email) || null,
  password: sanitizeValue(user.password) || null,
  created_at: safeDateToISO(user.createdAt),
  updated_at: safeDateToISO(user.updatedAt),
  is_active: sanitizeValue(user.isActive) ?? true,
  image: sanitizeValue(user.image) || null,
  birthday: sanitizeValue(user.birthday) || null,
  system: sanitizeValue(user.system) ?? false,
  device_address: sanitizeValue(user.deviceAddress) || null,
  otp: sanitizeValue(user.otp) || null,
  expired_otp: safeDateToISO(user.expiredOtp),
});

/**
 * Sync a single user to Supabase
 */
export const syncSingleUser = async (user: User): Promise<boolean> => {
  try {
    const supabaseUser = transformUserForSupabase(user);
    const {error} = await supabase.from('users').upsert(supabaseUser, {
      onConflict: 'id',
    });

    if (error) {
      console.error('❌ Error syncing user:', user.id, error.message);
      return false;
    }

    console.log('✅ User synced:', user.id);
    return true;
  } catch (error) {
    console.error('❌ Error syncing user:', user.id, error);
    return false;
  }
};

/**
 * Sync all users to Supabase
 */
export const syncUsers = async (): Promise<{
  success: number;
  failed: number;
}> => {
  const users = await userRepository.findAll();
  let success = 0;
  let failed = 0;

  for (const user of users) {
    const result = await syncSingleUser(user);
    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  console.log(`📊 Users sync complete: ${success} success, ${failed} failed`);
  return {success, failed};
};

// ============================================
// ROOM SYNC
// ============================================

/**
 * Transform local Room entity to Supabase format
 */
const transformRoomForSupabase = (room: Room) => ({
  id: sanitizeValue(room.id),
  member_array: sanitizeValue(room.memberArray),
  type: sanitizeValue(room.type),
});

/**
 * Sync a single room to Supabase
 */
export const syncSingleRoom = async (room: Room): Promise<boolean> => {
  try {
    const supabaseRoom = transformRoomForSupabase(room);
    const {error} = await supabase.from('rooms').upsert(supabaseRoom, {
      onConflict: 'id',
    });

    if (error) {
      console.error('❌ Error syncing room:', error.message);
      return false;
    }

    console.log('✅ Room synced:', room.id);
    return true;
  } catch (error) {
    console.error('❌ Error syncing room:', error);
    return false;
  }
};

/**
 * Sync all rooms to Supabase
 */
export const syncRooms = async (): Promise<{
  success: number;
  failed: number;
}> => {
  const rooms = await roomRepository.findAll();
  let success = 0;
  let failed = 0;

  for (const room of rooms) {
    const result = await syncSingleRoom(room);
    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  console.log(`📊 Rooms sync complete: ${success} success, ${failed} failed`);
  return {success, failed};
};

// ============================================
// MESSAGE SYNC
// ============================================

/**
 * Transform local MessageEntity to Supabase format
 */
const transformMessageForSupabase = (message: MessageEntity) => ({
  id: sanitizeValue(message.id),
  type: sanitizeValue(message.type) || null,
  width: sanitizeValue(message.width) || null,
  height: sanitizeValue(message.height) || null,
  message: sanitizeValue(message.message),
  status: sanitizeValue(message.status) || null,
  room_id: sanitizeValue(message.roomId) || null,
  created_by: sanitizeValue(message.created_by) || null,
  created_at: safeDateToISO(message.createdAt),
});

/**
 * Sync a single message to Supabase
 */
export const syncSingleMessage = async (
  message: MessageEntity,
): Promise<boolean> => {
  try {
    const supabaseMessage = transformMessageForSupabase(message);
    const {error} = await supabase.from('messages').upsert(supabaseMessage, {
      onConflict: 'id',
    });

    if (error) {
      console.error('❌ Error syncing message:', error.message);
      return false;
    }

    console.log('✅ Message synced:', message.id);
    return true;
  } catch (error) {
    console.error('❌ Error syncing message:', error);
    return false;
  }
};

/**
 * Sync all messages to Supabase
 */
export const syncMessages = async (): Promise<{
  success: number;
  failed: number;
}> => {
  const messages = await messageRepository.findAll();
  let success = 0;
  let failed = 0;

  for (const message of messages) {
    const result = await syncSingleMessage(message);
    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  console.log(
    `📊 Messages sync complete: ${success} success, ${failed} failed`,
  );
  return {success, failed};
};

/**
 * Restore account from Supabase
 * CAUTION: This will clear all local data and replace with data from cloud
 */
export const restoreAccount = async (email: string): Promise<boolean> => {
  try {
    console.log('🔄 Restoring account for:', email);

    // 1. Check if user exists on cloud
    const {data: userExists, error: userError} = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !userExists) {
      console.error('❌ User not found on cloud:', email);
      return false;
    }

    const userId = userExists.id;
    console.log('✅ Found user on cloud:', userId);

    // 2. Fetch all data from cloud
    console.log('📥 Fetching cloud data...');
    const {data: cloudRooms, error: roomError} = await supabase
      .from('rooms')
      .select('*');

    // Filter rooms for this user handles in application logic or RLS,
    // but for simple restore we fetch all related rooms
    // Ideally should be filtered by member_array logic or RLS

    const {data: cloudMessages, error: msgError} = await supabase
      .from('messages')
      .select('*')
      .or(
        `created_by.eq.${userId},room_id.in.(${
          // This is complex to query efficiently without join table or RLS
          // For simplicity we might fetch based on what we can access
          // Assuming RLS policy restricts to "own data" or "shared rooms"
          '*' // Placeholder: RLS should handle permissions
        })`,
      );

    // Better strategy: simpler query assuming user can only read their own rooms/messages via RLS
    const {data: allCloudRooms} = await supabase.from('rooms').select('*');
    const {data: allCloudMessages} = await supabase
      .from('messages')
      .select('*');
    const {data: cloudUser} = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!cloudUser) return false;

    // 3. DANGEROUS: Clear local DB
    console.log('🧹 Clearing local database...');
    await messageRepository.deleteAll();
    await roomRepository.deleteAll();
    await userRepository.deleteAll();

    // 4. Insert Cloud Data -> Local
    console.log('💾 Inserting data to local...');

    // Helper to parse date from Supabase
    const parseSupabaseDate = (dateStr: string | null): Date | undefined => {
      if (!dateStr) return undefined;
      // Handle "2026-01-23 07:28:04.000" -> "2026-01-23T07:28:04.000Z"
      let cleanStr = dateStr;
      if (typeof dateStr === 'string') {
        if (dateStr.includes(' ') && !dateStr.includes('T')) {
          cleanStr = dateStr.replace(' ', 'T') + 'Z';
        } else if (!dateStr.includes('Z') && !dateStr.includes('+')) {
          cleanStr = dateStr + 'Z';
        }
      }

      const d = new Date(cleanStr);
      return !isNaN(d.getTime()) ? d : undefined;
    };

    // Insert User
    const localUserNew = new User();

    // Manual mapping to ensure types are correct
    localUserNew.id = cloudUser.id;
    localUserNew.name = cloudUser.name || undefined;
    localUserNew.email = cloudUser.email || undefined;
    localUserNew.image = cloudUser.image || undefined;
    localUserNew.idDevice = cloudUser.id_device || undefined;
    localUserNew.isActive = cloudUser.is_active ?? true;
    localUserNew.birthday = cloudUser.birthday || undefined;
    localUserNew.system = cloudUser.system ?? false;
    localUserNew.deviceAddress = cloudUser.device_address || undefined;
    localUserNew.otp = cloudUser.otp || undefined;

    localUserNew.createdAt =
      parseSupabaseDate(cloudUser.created_at) || new Date();
    localUserNew.updatedAt =
      parseSupabaseDate(cloudUser.updated_at) || new Date();
    localUserNew.expiredOtp = parseSupabaseDate(cloudUser.expired_otp); // Can be undefined

    await userRepository.create(localUserNew);

    // Insert Rooms
    if (allCloudRooms) {
      for (const r of allCloudRooms) {
        // Only insert rooms where user is member
        const members = r.member_array as string[];
        if (members && members.includes(userId)) {
          const newRoom = new Room();
          newRoom.id = r.id;
          newRoom.memberArray = members;
          newRoom.type = r.type;
          await roomRepository.create(newRoom);
        }
      }
    }

    // Insert Messages
    if (allCloudMessages) {
      for (const m of allCloudMessages) {
        const newMsg = new MessageEntity();
        newMsg.id = m.id;
        newMsg.type = m.type;
        newMsg.width = m.width;
        newMsg.height = m.height;
        newMsg.message = m.message;
        newMsg.status = m.status;
        newMsg.roomId = m.room_id;
        newMsg.created_by = m.created_by;
        newMsg.createdAt = parseSupabaseDate(m.created_at) || new Date();
        await messageRepository.create(newMsg);
      }
    }

    console.log('✅ Restore complete!');
    return true;
  } catch (error) {
    console.error('❌ Restore failed:', error);
    return false;
  }
};

// ============================================
// FULL SYNC
// ============================================

export interface SyncResult {
  users: {success: number; failed: number};
  rooms: {success: number; failed: number};
  messages: {success: number; failed: number};
  totalSuccess: number;
  totalFailed: number;
}

/**
 * Sync all data to Supabase (Users -> Rooms -> Messages)
 * Order matters due to foreign key constraints
 */
export const syncAll = async (): Promise<SyncResult> => {
  console.log('🔄 Starting full sync to Supabase...');

  // 1. Sync users first (no dependencies)
  console.log('📤 Syncing users...');
  // Check if we have users with emails
  const users = await userRepository.findAll();
  const validUsers = users.filter(u => u.email && u.email.length > 0);

  if (validUsers.length === 0) {
    console.log('⚠️ No users with email found to sync');
    // Return empty result or handle logic outside
  }

  const usersResult = await syncUsers();

  // 2. Sync rooms (no dependency on users in current schema)
  console.log('📤 Syncing rooms...');
  const roomsResult = await syncRooms();

  // 3. Sync messages last (depends on users and rooms)
  console.log('📤 Syncing messages...');
  const messagesResult = await syncMessages();

  const result: SyncResult = {
    users: usersResult,
    rooms: roomsResult,
    messages: messagesResult,
    totalSuccess:
      usersResult.success + roomsResult.success + messagesResult.success,
    totalFailed:
      usersResult.failed + roomsResult.failed + messagesResult.failed,
  };

  console.log('✅ Full sync complete!', result);
  return result;
};

/**
 * Sync messages for a specific room
 */
export const syncRoomMessages = async (
  roomId: string,
): Promise<{success: number; failed: number}> => {
  const messages = await messageRepository.findByRoomId(roomId);
  let success = 0;
  let failed = 0;

  for (const message of messages) {
    const result = await syncSingleMessage(message);
    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  console.log(
    `📊 Room ${roomId} messages sync: ${success} success, ${failed} failed`,
  );
  return {success, failed};
};
