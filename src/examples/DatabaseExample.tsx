import React, {useEffect, useState} from 'react';
import {View, Text, Button, FlatList, ScrollView} from 'react-native';
import {initDatabase} from '../database/dataSource';
import {UserRepository} from '../database/repositories/UserRepository';
import {MessageRepository} from '../database/repositories/MessageRepository';
import {RoomRepository} from '../database/repositories/RoomRepository';

const userRepo = new UserRepository();
const messageRepo = new MessageRepository();
const roomRepo = new RoomRepository();

export default function DatabaseExample() {
  const [users, setUsers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    // Khởi tạo database khi app start
    initDatabase().then(() => {
      console.log('✅ Database ready!');
      loadData();
    });
  }, []);

  const loadData = async () => {
    const allUsers = await userRepo.findAll();
    const allRooms = await roomRepo.findAll();
    const allMessages = await messageRepo.findAll();
    setUsers(allUsers);
    setRooms(allRooms);
    setMessages(allMessages);
  };

  const handleCreateUser = async () => {
    try {
      const newUser = await userRepo.create({
        name: `User ${Date.now()}`,
        email: `user${Date.now()}@example.com`,
        password: 'password123',
        idDevice: `device_${Date.now()}`,
      });
      console.log('✅ Created user:', newUser);
      loadData();
    } catch (error) {
      console.error('❌ Error creating user:', error);
    }
  };

  const handleCreateRoom = async () => {
    try {
      if (users.length < 2) {
        alert('Cần ít nhất 2 users để tạo room!');
        return;
      }

      const newRoom = await roomRepo.create({
        memberArray: [users[0].id, users[1].id],
        type: 'private',
      });
      console.log('✅ Created room:', newRoom);
      loadData();
    } catch (error) {
      console.error('❌ Error creating room:', error);
    }
  };

  const handleCreateMessage = async () => {
    try {
      if (rooms.length === 0) {
        alert('Cần tạo room trước!');
        return;
      }
      if (users.length === 0) {
        alert('Cần tạo user trước!');
        return;
      }

      const newMessage = await messageRepo.create({
        type: 'text',
        message: `Hello from TypeORM at ${new Date().toLocaleTimeString()}`,
        roomId: rooms[0].id,
        created_by: users[0].id,
        status: 'sent',
      });
      console.log('✅ Created message:', newMessage);
      loadData();
    } catch (error) {
      console.error('❌ Error creating message:', error);
    }
  };

  const handleLoadRoomMessages = async () => {
    if (rooms.length === 0) return;

    const roomMessages = await messageRepo.findByRoomId(rooms[0].id);
    console.log('💬 Room messages:', roomMessages);
    setMessages(roomMessages);
  };

  return (
    <ScrollView style={{flex: 1, padding: 20}}>
      <Text style={{fontSize: 20, fontWeight: 'bold', marginBottom: 10}}>
        TypeORM + Nitro SQLite Demo
      </Text>

      <View style={{marginBottom: 20}}>
        <Button title="Tạo User Mới" onPress={handleCreateUser} />
        <Button title="Tạo Room (2 users)" onPress={handleCreateRoom} />
        <Button title="Tạo Message" onPress={handleCreateMessage} />
        <Button title="Load Room Messages" onPress={handleLoadRoomMessages} />
      </View>

      <Text style={{fontSize: 18, fontWeight: 'bold', marginTop: 20}}>
        Users ({users.length}):
      </Text>
      <FlatList
        scrollEnabled={false}
        data={users}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <Text>
            ID: {item.id} - {item.name} ({item.email})
          </Text>
        )}
      />

      <Text style={{fontSize: 18, fontWeight: 'bold', marginTop: 20}}>
        Rooms ({rooms.length}):
      </Text>
      <FlatList
        scrollEnabled={false}
        data={rooms}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <Text>
            Room #{item.id} - Type: {item.type} - Members:{' '}
            {item.memberArray.join(', ')}
          </Text>
        )}
      />

      <Text style={{fontSize: 18, fontWeight: 'bold', marginTop: 20}}>
        Messages ({messages.length}):
      </Text>
      <FlatList
        scrollEnabled={false}
        data={messages}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <Text>
            [{item.type}] {item.message} (Room: {item.roomId}, By:{' '}
            {item.created_by})
          </Text>
        )}
      />
    </ScrollView>
  );
}
