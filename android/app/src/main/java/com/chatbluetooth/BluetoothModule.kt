package com.chatbluetooth

import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothServerSocket
import android.bluetooth.BluetoothSocket
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.util.Log
import android.util.Base64
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.IOException
import java.io.InputStream
import java.io.OutputStream
import java.util.UUID

class BluetoothModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private val TAG = "BluetoothModule"
  private val APP_NAME = "SocialApp"
  private val MY_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB") // UUID chuẩn SPP
  
  private var adapter: BluetoothAdapter? = BluetoothAdapter.getDefaultAdapter()
  private var serverSocket: BluetoothServerSocket? = null
  
  // Lưu trữ nhiều kết nối
  private val connectedDevices = mutableMapOf<String, ConnectedThread>()
  
  private var acceptThread: AcceptThread? = null
  private var connectThread: ConnectThread? = null

  override fun getName(): String {
    return "BluetoothModule"
  }

  // ==================== QUẢN LÝ BLUETOOTH ====================
  
  /** Kiểm tra Bluetooth có khả dụng không */
  @ReactMethod
  fun isBluetoothAvailable(promise: Promise) {
    try {
      promise.resolve(adapter != null)
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  /** Kiểm tra Bluetooth đã bật chưa */
  @ReactMethod
  fun isBluetoothEnabled(promise: Promise) {
    try {
      if (adapter == null) {
        promise.reject("NO_ADAPTER", "Thiết bị không hỗ trợ Bluetooth")
        return
      }
      promise.resolve(adapter!!.isEnabled)
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  /** Bật Bluetooth (yêu cầu user cho phép) */
  @ReactMethod
  fun enableBluetooth(promise: Promise) {
    try {
      if (adapter == null) {
        promise.reject("NO_ADAPTER", "Thiết bị không hỗ trợ Bluetooth")
        return
      }
      
      if (adapter!!.isEnabled) {
        promise.resolve("Bluetooth đã được bật")
        return
      }

      // Gửi intent để user bật bluetooth
      val enableIntent = Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE)
      enableIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      reactApplicationContext.startActivity(enableIntent)
      promise.resolve("Đã gửi yêu cầu bật Bluetooth")
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  /** Đổi tên Bluetooth */
  @ReactMethod
  fun setBluetoothName(newName: String, promise: Promise) {
    try {
      if (adapter == null) {
        promise.reject("NO_ADAPTER", "Thiết bị không hỗ trợ Bluetooth")
        return
      }

      if (!adapter!!.isEnabled) {
        promise.reject("NOT_ENABLED", "Bluetooth chưa được bật")
        return
      }

      val success = adapter!!.setName(newName)
      if (success) {
        promise.resolve("Đã đổi tên thành: $newName")
      } else {
        promise.reject("FAILED", "Đổi tên Bluetooth thất bại")
      }
    } catch (e: Exception) {
      Log.e(TAG, "Error:", e)
      promise.reject("ERROR", e.message)
    }
  }

  /** Lấy tên Bluetooth hiện tại */
  @ReactMethod
  fun getBluetoothName(promise: Promise) {
    try {
      if (adapter == null) {
        promise.reject("NO_ADAPTER", "Thiết bị không hỗ trợ Bluetooth")
        return
      }

      if (!adapter!!.isEnabled) {
        promise.reject("NOT_ENABLED", "Bluetooth chưa được bật")
        return
      }

      val name = adapter!!.name
      if (name != null) {
        promise.resolve(name)
      } else {
        promise.reject("NO_NAME", "Không lấy được tên Bluetooth")
      }
    } catch (e: Exception) {
      Log.e(TAG, "Error:", e)
      promise.reject("ERROR", e.message)
    }
  }

  /** Lấy địa chỉ MAC của thiết bị */
  @ReactMethod
  fun getBluetoothAddress(promise: Promise) {
    try {
      if (adapter == null) {
        promise.reject("NO_ADAPTER", "Thiết bị không hỗ trợ Bluetooth")
        return
      }
      promise.resolve(adapter!!.address ?: "Unknown")
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  // ==================== QUÉT THIẾT BỊ ====================

  /** Bắt đầu quét thiết bị */
  @ReactMethod
  fun startDiscovery(promise: Promise) {
    try {
      if (adapter == null) {
        promise.reject("NO_ADAPTER", "Thiết bị không hỗ trợ Bluetooth")
        return
      }

      if (!adapter!!.isEnabled) {
        promise.reject("NOT_ENABLED", "Bluetooth chưa được bật")
        return
      }

      // Đăng ký receiver để nhận kết quả quét
      val filter = IntentFilter()
      filter.addAction(BluetoothDevice.ACTION_FOUND)
      filter.addAction(BluetoothAdapter.ACTION_DISCOVERY_FINISHED)
      reactApplicationContext.registerReceiver(discoveryReceiver, filter)

      // Hủy quét cũ nếu đang quét
      if (adapter!!.isDiscovering) {
        adapter!!.cancelDiscovery()
      }

      val started = adapter!!.startDiscovery()
      if (started) {
        promise.resolve("Đã bắt đầu quét thiết bị")
      } else {
        promise.reject("FAILED", "Không thể bắt đầu quét")
      }
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  /** Dừng quét thiết bị */
  @ReactMethod
  fun stopDiscovery(promise: Promise) {
    try {
      if (adapter == null) {
        promise.reject("NO_ADAPTER", "Thiết bị không hỗ trợ Bluetooth")
        return
      }

      if (adapter!!.isDiscovering) {
        adapter!!.cancelDiscovery()
        try {
          reactApplicationContext.unregisterReceiver(discoveryReceiver)
        } catch (e: Exception) {
          Log.w(TAG, "Receiver chưa được đăng ký")
        }
      }
      promise.resolve("Đã dừng quét")
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  /** Lấy danh sách thiết bị đã ghép nối */
  @ReactMethod
  fun getPairedDevices(promise: Promise) {
    try {
      if (adapter == null) {
        promise.reject("NO_ADAPTER", "Thiết bị không hỗ trợ Bluetooth")
        return
      }

      if (!adapter!!.isEnabled) {
        promise.reject("NOT_ENABLED", "Bluetooth chưa được bật")
        return
      }

      val pairedDevices = adapter!!.bondedDevices
      val devices = Arguments.createArray()

      for (device in pairedDevices) {
        val deviceMap = Arguments.createMap()
        deviceMap.putString("name", device.name ?: "Unknown")
        deviceMap.putString("address", device.address)
        deviceMap.putString("bondState", getBondStateString(device.bondState))
        devices.pushMap(deviceMap)
      }

      promise.resolve(devices)
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  private fun getBondStateString(state: Int): String {
    return when (state) {
      BluetoothDevice.BOND_BONDED -> "BONDED"
      BluetoothDevice.BOND_BONDING -> "BONDING"
      BluetoothDevice.BOND_NONE -> "NONE"
      else -> "UNKNOWN"
    }
  }

  // BroadcastReceiver để nhận thiết bị được tìm thấy
  private val discoveryReceiver = object : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
      when (intent?.action) {
        BluetoothDevice.ACTION_FOUND -> {
          val device: BluetoothDevice? = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE)
          device?.let {
            val deviceMap = Arguments.createMap()
            deviceMap.putString("name", it.name ?: "Unknown")
            deviceMap.putString("address", it.address)
            deviceMap.putString("bondState", getBondStateString(it.bondState))
            sendEvent("onDeviceFound", deviceMap)
          }
        }
        BluetoothAdapter.ACTION_DISCOVERY_FINISHED -> {
          sendEvent("onDiscoveryFinished", null)
        }
      }
    }
  }

  // ==================== KẾT NỐI ====================

  /** Mở server để chờ kết nối (chế độ server) */
  @ReactMethod
  fun startServer(promise: Promise) {
    try {
      if (adapter == null) {
        promise.reject("NO_ADAPTER", "Thiết bị không hỗ trợ Bluetooth")
        return
      }

      if (!adapter!!.isEnabled) {
        promise.reject("NOT_ENABLED", "Bluetooth chưa được bật")
        return
      }

      acceptThread?.cancel()
      acceptThread = AcceptThread()
      acceptThread?.start()
      
      Log.d(TAG, "✅ Server started - Name: ${adapter!!.name}, Address: ${adapter!!.address}, UUID: $MY_UUID")
      promise.resolve("Server đã khởi động")
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  /** Kết nối đến thiết bị khác (chế độ client) */
  @ReactMethod
  fun connectToDevice(address: String, promise: Promise) {
    try {
      if (adapter == null) {
        promise.reject("NO_ADAPTER", "Thiết bị không hỗ trợ Bluetooth")
        return
      }

      if (!adapter!!.isEnabled) {
        promise.reject("NOT_ENABLED", "Bluetooth chưa được bật")
        return
      }

      val device = adapter!!.getRemoteDevice(address)
      Log.d(TAG, "🔌 Attempting to connect to: ${device.name} ($address)")
      Log.d(TAG, "   Bond state: ${getBondStateString(device.bondState)}")
      Log.d(TAG, "   UUID: $MY_UUID")
      
      connectThread?.cancel()
      connectThread = ConnectThread(device)
      connectThread?.start()
      
      promise.resolve("Đang kết nối...")
    } catch (e: Exception) {
      Log.e(TAG, "❌ Connect error: ${e.message}", e)
      promise.reject("ERROR", e.message)
    }
  }

  /** Ngắt kết nối với một thiết bị cụ thể */
  @ReactMethod
  fun disconnect(address: String, promise: Promise) {
    try {
      val thread = connectedDevices[address]
      if (thread != null) {
        thread.cancel()
        connectedDevices.remove(address)
        
        val params = Arguments.createMap()
        params.putString("deviceAddress", address)
        sendEvent("onDisconnected", params)
        
        promise.resolve("Đã ngắt kết nối với $address")
      } else {
        promise.reject("NOT_FOUND", "Không tìm thấy kết nối với thiết bị này")
      }
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  /** Ngắt tất cả kết nối */
  @ReactMethod
  fun disconnectAll(promise: Promise) {
    try {
      connectThread?.cancel()
      
      // Ngắt tất cả kết nối hiện có
      for ((address, thread) in connectedDevices) {
        thread.cancel()
        
        val params = Arguments.createMap()
        params.putString("deviceAddress", address)
        sendEvent("onDisconnected", params)
      }
      connectedDevices.clear()
      
      promise.resolve("Đã ngắt tất cả kết nối")
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  /** Dừng server */
  @ReactMethod
  fun stopServer(promise: Promise) {
    try {
      acceptThread?.cancel()
      acceptThread = null
      serverSocket?.close()
      serverSocket = null
      
      promise.resolve("Đã dừng server")
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  /** Kiểm tra trạng thái kết nối */
  @ReactMethod
  fun isConnected(promise: Promise) {
    promise.resolve(connectedDevices.isNotEmpty())
  }

  /** Lấy danh sách thiết bị đã kết nối */
  @ReactMethod
  fun getConnectedDevices(promise: Promise) {
    try {
      val devices = Arguments.createArray()
      for (address in connectedDevices.keys) {
        devices.pushString(address)
      }
      promise.resolve(devices)
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  // ==================== GỬI/NHẬN DỮ LIỆU ====================

  /** Gửi tin nhắn đến một thiết bị cụ thể */
  @ReactMethod
  fun sendMessage(address: String, message: String, promise: Promise) {
    try {
      val thread = connectedDevices[address]
      if (thread == null) {
        promise.reject("NOT_CONNECTED", "Chưa kết nối với thiết bị $address")
        return
      }

      thread.write(message.toByteArray())
      promise.resolve("Đã gửi tin nhắn đến $address")
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  // ==================== GỬI/NHẬN FILE BASE64 ====================
  
  private val CHUNK_SIZE = 4096 // 4KB per chunk

  /** Gửi data Base64 đến một thiết bị */
  @ReactMethod
  fun sendBase64Data(address: String, base64Data: String, fileName: String, type: String, promise: Promise) {
    try {
      val thread = connectedDevices[address]
      if (thread == null) {
        promise.reject("NOT_CONNECTED", "Chưa kết nối với thiết bị $address")
        return
      }

      if (base64Data.isEmpty()) {
        promise.reject("EMPTY_DATA", "Dữ liệu Base64 trống")
        return
      }

      Log.d(TAG, "📤 Sending Base64 $type: $fileName (${base64Data.length} chars) to $address")

      // Tính số chunks
      val totalChunks = (base64Data.length + CHUNK_SIZE - 1) / CHUNK_SIZE
      
      // 1. Gửi header: DATA_B64_START|type|fileName|dataLength|totalChunks
      val header = "DATA_B64_START|$type|$fileName|${base64Data.length}|$totalChunks\n"
      thread.write(header.toByteArray(Charsets.UTF_8))
      
      Thread.sleep(50) // Đợi header được xử lý
      
      // 2. Gửi từng chunk
      for (i in 0 until totalChunks) {
        val start = i * CHUNK_SIZE
        val end = minOf(start + CHUNK_SIZE, base64Data.length)
        val chunk = base64Data.substring(start, end)
        
        val chunkMessage = "DATA_B64_CHUNK|$i|$chunk\n"
        thread.write(chunkMessage.toByteArray(Charsets.UTF_8))
        
        // Progress
        val progress = ((i + 1) * 100 / totalChunks)
        sendEvent("onDataSendProgress", Arguments.createMap().apply {
          putString("deviceAddress", address)
          putString("fileName", fileName)
          putString("type", type)
          putInt("progress", progress)
          putDouble("sent", ((i + 1) * CHUNK_SIZE).toDouble())
          putDouble("total", base64Data.length.toDouble())
        })
        
        Thread.sleep(20) // Delay giữa chunks để tránh overflow
      }
      
      // 3. Gửi end marker
      val endMessage = "DATA_B64_END\n"
      thread.write(endMessage.toByteArray(Charsets.UTF_8))
      
      Log.d(TAG, "✅ Base64 $type sent: $fileName")
      promise.resolve("Đã gửi $type: $fileName")
      
    } catch (e: Exception) {
      Log.e(TAG, "❌ Send Base64 data error: ${e.message}", e)
      promise.reject("ERROR", e.message)
    }
  }

  /** Gửi data Base64 đến tất cả thiết bị */
  @ReactMethod
  fun sendBase64DataToAll(base64Data: String, fileName: String, type: String, promise: Promise) {
    try {
      if (connectedDevices.isEmpty()) {
        promise.reject("NOT_CONNECTED", "Không có thiết bị nào được kết nối")
        return
      }

      if (base64Data.isEmpty()) {
        promise.reject("EMPTY_DATA", "Dữ liệu Base64 trống")
        return
      }

      Log.d(TAG, "📤 Sending Base64 $type to all: $fileName (${base64Data.length} chars)")

      // Tính số chunks một lần
      val totalChunks = (base64Data.length + CHUNK_SIZE - 1) / CHUNK_SIZE
      var successCount = 0
      
      for ((address, thread) in connectedDevices) {
        try {
          // Header
          val header = "DATA_B64_START|$type|$fileName|${base64Data.length}|$totalChunks\n"
          thread.write(header.toByteArray(Charsets.UTF_8))
          Thread.sleep(50)
          
          // Chunks
          for (i in 0 until totalChunks) {
            val start = i * CHUNK_SIZE
            val end = minOf(start + CHUNK_SIZE, base64Data.length)
            val chunk = base64Data.substring(start, end)
            
            val chunkMessage = "DATA_B64_CHUNK|$i|$chunk\n"
            thread.write(chunkMessage.toByteArray(Charsets.UTF_8))
            
            val progress = ((i + 1) * 100 / totalChunks)
            sendEvent("onDataSendProgress", Arguments.createMap().apply {
              putString("deviceAddress", address)
              putString("fileName", fileName)
              putString("type", type)
              putInt("progress", progress)
            })
            
            Thread.sleep(20)
          }
          
          // End
          thread.write("DATA_B64_END\n".toByteArray(Charsets.UTF_8))
          successCount++
          
        } catch (e: Exception) {
          Log.e(TAG, "Failed to send to $address: ${e.message}")
        }
      }
      
      promise.resolve("Đã gửi $type đến $successCount/${connectedDevices.size} thiết bị")
      
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  /** Gửi tin nhắn đến tất cả thiết bị đã kết nối */
  @ReactMethod
  fun sendMessageToAll(message: String, promise: Promise) {
    try {
      if (connectedDevices.isEmpty()) {
        promise.reject("NOT_CONNECTED", "Không có thiết bị nào được kết nối")
        return
      }

      // Thêm \n vào cuối tin nhắn để bên nhận biết khi nào kết thúc
      val messageWithNewline = "$message\n"
      Log.d(TAG, "📤 Sending text message: $message")
      
      for ((address, thread) in connectedDevices) {
        try {
          thread.write(messageWithNewline.toByteArray(Charsets.UTF_8))
        } catch (e: Exception) {
          Log.e(TAG, "Lỗi khi gửi đến $address: ${e.message}")
        }
      }
      promise.resolve("Đã gửi tin nhắn đến tất cả thiết bị")
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  // ==================== THREADS ====================

  // Thread chờ kết nối đến (Server) - Chấp nhận NHIỀU kết nối
  private inner class AcceptThread : Thread() {
    private val mmServerSocket: BluetoothServerSocket? by lazy(LazyThreadSafetyMode.NONE) {
      adapter?.listenUsingRfcommWithServiceRecord(APP_NAME, MY_UUID)
    }

    override fun run() {
      // Lưu server socket để có thể đóng sau
      serverSocket = mmServerSocket
      
      // Chấp nhận nhiều kết nối liên tục
      while (true) {
        val socket: BluetoothSocket? = try {
          mmServerSocket?.accept()
        } catch (e: IOException) {
          Log.e(TAG, "Socket accept() failed", e)
          break
        }
        
        socket?.also {
          Log.d(TAG, "Có kết nối mới từ: ${it.remoteDevice.address}")
          connected(it)
          // KHÔNG đóng server socket, tiếp tục chấp nhận kết nối mới
        }
      }
    }

    fun cancel() {
      try {
        mmServerSocket?.close()
      } catch (e: IOException) {
        Log.e(TAG, "Could not close server socket", e)
      }
    }
  }

  // Thread kết nối đến thiết bị khác (Client)
  private inner class ConnectThread(private val device: BluetoothDevice) : Thread() {
    private var mmSocket: BluetoothSocket? = null

    override fun run() {
      adapter?.cancelDiscovery()
      
      // Thử method 1: Standard RFCOMM
      try {
        Log.d(TAG, "Trying standard RFCOMM connection to ${device.name} (${device.address})")
        mmSocket = device.createRfcommSocketToServiceRecord(MY_UUID)
        mmSocket?.connect()
        Log.d(TAG, "✅ Standard RFCOMM connection successful")
        connected(mmSocket!!)
        return
      } catch (e: IOException) {
        Log.w(TAG, "Standard RFCOMM failed: ${e.message}")
        try {
          mmSocket?.close()
        } catch (closeException: IOException) {
          Log.e(TAG, "Could not close socket", closeException)
        }
      }

      // Thử method 2: Fallback socket (dùng reflection)
      try {
        Log.d(TAG, "Trying fallback socket method...")
        val clazz = device.javaClass
        val paramTypes = arrayOf<Class<*>>(Integer.TYPE)
        val method = clazz.getMethod("createRfcommSocket", *paramTypes)
        mmSocket = method.invoke(device, 1) as BluetoothSocket
        mmSocket?.connect()
        Log.d(TAG, "✅ Fallback socket connection successful")
        connected(mmSocket!!)
        return
      } catch (e: Exception) {
        Log.e(TAG, "Fallback socket failed: ${e.message}")
        try {
          mmSocket?.close()
        } catch (closeException: IOException) {
          Log.e(TAG, "Could not close fallback socket", closeException)
        }
      }

      // Thử method 3: Insecure RFCOMM
      try {
        Log.d(TAG, "Trying insecure RFCOMM connection...")
        mmSocket = device.createInsecureRfcommSocketToServiceRecord(MY_UUID)
        mmSocket?.connect()
        Log.d(TAG, "✅ Insecure RFCOMM connection successful")
        connected(mmSocket!!)
        return
      } catch (e: IOException) {
        Log.e(TAG, "Insecure RFCOMM failed: ${e.message}")
        try {
          mmSocket?.close()
        } catch (closeException: IOException) {
          Log.e(TAG, "Could not close insecure socket", closeException)
        }
      }

      // Tất cả phương pháp đều thất bại
      Log.e(TAG, "❌ All connection methods failed for ${device.name}")
      sendEvent("onConnectionFailed", Arguments.createMap().apply {
        putString("error", "Không thể kết nối với ${device.name}. Hãy đảm bảo:\n1. Thiết bị đã mở app\n2. Đã nhấn 'Chờ kết nối'\n3. Bluetooth đã bật")
        putString("deviceName", device.name ?: "Unknown")
        putString("deviceAddress", device.address)
      })
    }

    fun cancel() {
      try {
        mmSocket?.close()
      } catch (e: IOException) {
        Log.e(TAG, "Could not close client socket", e)
      }
    }
  }

  // Thread xử lý kết nối đã thiết lập
  private inner class ConnectedThread(private val mmSocket: BluetoothSocket) : Thread() {
    private val mmInStream: InputStream = mmSocket.inputStream
    private val mmOutStream: OutputStream = mmSocket.outputStream
    private val mmBuffer: ByteArray = ByteArray(8192)
    private val deviceAddress: String = mmSocket.remoteDevice.address
    private var isRunning = true
    
    // Base64 data receiving state
    private var receivingBase64Data = false
    private var base64DataType = ""
    private var base64FileName = ""
    private var base64DataLength = 0
    private var expectedChunks = 0
    private val base64Chunks = mutableMapOf<Int, String>()
    private var receivedChunkCount = 0

    override fun run() {
      val lineBuffer = StringBuilder()
      
      while (isRunning) {
        val numBytes = try {
          mmInStream.read(mmBuffer)
        } catch (e: IOException) {
          Log.e(TAG, "Input stream disconnected from $deviceAddress", e)
          connectionLost(deviceAddress)
          break
        }

        if (numBytes > 0) {
          // Parse text messages (bao gồm Base64 protocol)
          try {
            val data = String(mmBuffer, 0, numBytes, Charsets.UTF_8)
            lineBuffer.append(data)
            
            var newlineIndex = lineBuffer.indexOf('\n')
            while (newlineIndex != -1) {
              val line = lineBuffer.substring(0, newlineIndex).trim()
              lineBuffer.delete(0, newlineIndex + 1)
              
              if (line.isNotEmpty()) {
                when {
                  line.startsWith("DATA_B64_START|") -> {
                    handleBase64Start(line)
                  }
                  line.startsWith("DATA_B64_CHUNK|") -> {
                    handleBase64Chunk(line)
                  }
                  line == "DATA_B64_END" -> {
                    handleBase64End()
                  }
                  else -> {
                    // Text message
                    Log.d(TAG, "📨 Text message: $line")
                    val params = Arguments.createMap()
                    params.putString("message", line)
                    params.putString("deviceAddress", deviceAddress)
                    params.putString("deviceName", mmSocket.remoteDevice.name ?: "Unknown")
                    sendEvent("onMessageReceived", params)
                  }
                }
              }
              
              newlineIndex = lineBuffer.indexOf('\n')
            }
          } catch (e: Exception) {
            Log.e(TAG, "Error parsing data", e)
          }
        }
      }
    }

    private fun handleBase64Start(line: String) {
      try {
        // DATA_B64_START|type|fileName|dataLength|totalChunks
        val parts = line.split("|")
        if (parts.size != 5) return
        
        base64DataType = parts[1]
        base64FileName = parts[2]
        base64DataLength = parts[3].toInt()
        expectedChunks = parts[4].toInt()
        receivingBase64Data = true
        receivedChunkCount = 0
        base64Chunks.clear()
        
        Log.d(TAG, "📥 Base64 $base64DataType start: $base64FileName ($base64DataLength chars, $expectedChunks chunks)")
        
        sendEvent("onDataReceiveStart", Arguments.createMap().apply {
          putString("deviceAddress", deviceAddress)
          putString("deviceName", mmSocket.remoteDevice.name ?: "Unknown")
          putString("fileName", base64FileName)
          putString("type", base64DataType)
          putDouble("dataSize", base64DataLength.toDouble())
        })
        
      } catch (e: Exception) {
        Log.e(TAG, "Error handling Base64 start", e)
      }
    }

    private fun handleBase64Chunk(line: String) {
      try {
        // DATA_B64_CHUNK|chunkIndex|data
        val parts = line.split("|", limit = 3)
        if (parts.size != 3) return
        
        val chunkIndex = parts[1].toInt()
        val chunkData = parts[2]
        
        base64Chunks[chunkIndex] = chunkData
        receivedChunkCount++
        
        val progress = (receivedChunkCount * 100 / expectedChunks)
        
        sendEvent("onDataReceiveProgress", Arguments.createMap().apply {
          putString("deviceAddress", deviceAddress)
          putString("fileName", base64FileName)
          putString("type", base64DataType)
          putInt("progress", progress)
          putDouble("received", receivedChunkCount.toDouble())
          putDouble("total", expectedChunks.toDouble())
        })
        
      } catch (e: Exception) {
        Log.e(TAG, "Error handling Base64 chunk", e)
      }
    }

    private fun handleBase64End() {
      try {
        if (receivedChunkCount != expectedChunks) {
          Log.w(TAG, "Missing chunks: received $receivedChunkCount, expected $expectedChunks")
        }
        
        // Ghép các chunks theo thứ tự
        val fullBase64 = StringBuilder()
        for (i in 0 until expectedChunks) {
          base64Chunks[i]?.let { fullBase64.append(it) }
        }
        
        // Decode Base64
        val decodedBytes = android.util.Base64.decode(fullBase64.toString(), android.util.Base64.NO_WRAP)
        
        // Xử lý theo type
        when (base64DataType.lowercase()) {
          "image" -> {
            // Ghi file ảnh
            val downloadsDir = android.os.Environment.getExternalStoragePublicDirectory(
              android.os.Environment.DIRECTORY_DOWNLOADS
            )
            val file = java.io.File(downloadsDir, "BT_IMG_$base64FileName")
            file.writeBytes(decodedBytes)
            
            sendEvent("onImageReceived", Arguments.createMap().apply {
              putString("deviceAddress", deviceAddress)
              putString("deviceName", mmSocket.remoteDevice.name ?: "Unknown")
              putString("fileName", base64FileName)
              putString("filePath", file.absolutePath)
              putDouble("fileSize", decodedBytes.size.toDouble())
              putString("type", base64DataType)
            })
          }
          "audio" -> {
            // Ghi file audio
            val downloadsDir = android.os.Environment.getExternalStoragePublicDirectory(
              android.os.Environment.DIRECTORY_DOWNLOADS
            )
            val file = java.io.File(downloadsDir, "BT_AUDIO_$base64FileName")
            file.writeBytes(decodedBytes)
            
            sendEvent("onAudioReceived", Arguments.createMap().apply {
              putString("deviceAddress", deviceAddress)
              putString("deviceName", mmSocket.remoteDevice.name ?: "Unknown")
              putString("fileName", base64FileName)
              putString("filePath", file.absolutePath)
              putDouble("fileSize", decodedBytes.size.toDouble())
              putString("type", base64DataType)
            })
          }
          "file" -> {
            // Ghi file thông thường
            val downloadsDir = android.os.Environment.getExternalStoragePublicDirectory(
              android.os.Environment.DIRECTORY_DOWNLOADS
            )
            val file = java.io.File(downloadsDir, "BT_$base64FileName")
            file.writeBytes(decodedBytes)
            
            sendEvent("onFileReceived", Arguments.createMap().apply {
              putString("deviceAddress", deviceAddress)
              putString("deviceName", mmSocket.remoteDevice.name ?: "Unknown")
              putString("fileName", base64FileName)
              putString("filePath", file.absolutePath)
              putDouble("fileSize", decodedBytes.size.toDouble())
              putString("type", base64DataType)
            })
          }
          else -> {
            // Data type khác
            sendEvent("onDataReceived", Arguments.createMap().apply {
              putString("deviceAddress", deviceAddress)
              putString("deviceName", mmSocket.remoteDevice.name ?: "Unknown")
              putString("fileName", base64FileName)
              putString("data", fullBase64.toString())
              putString("type", base64DataType)
              putDouble("size", decodedBytes.size.toDouble())
            })
          }
        }
        
        Log.d(TAG, "✅ Base64 $base64DataType completed: $base64FileName")
        
        // Reset state
        receivingBase64Data = false
        base64Chunks.clear()
        
      } catch (e: Exception) {
        Log.e(TAG, "Error handling Base64 end", e)
        receivingBase64Data = false
        base64Chunks.clear()
      }
    }

    fun write(bytes: ByteArray) {
      try {
        mmOutStream.write(bytes)
        mmOutStream.flush()
      } catch (e: IOException) {
        Log.e(TAG, "Error writing to $deviceAddress", e)
        throw e
      }
    }

    fun cancel() {
      isRunning = false
      try {
        mmSocket.close()
      } catch (e: IOException) {
        Log.e(TAG, "Could not close connected socket", e)
      }
    }
  }

  // Xử lý khi kết nối thành công
  private fun connected(socket: BluetoothSocket) {
    val deviceAddress = socket.remoteDevice.address
    
    // Nếu đã có kết nối với thiết bị này, đóng kết nối cũ
    connectedDevices[deviceAddress]?.cancel()
    
    // Tạo thread mới cho kết nối này
    val connectedThread = ConnectedThread(socket)
    connectedDevices[deviceAddress] = connectedThread
    connectedThread.start()
    
    val params = Arguments.createMap()
    params.putString("deviceName", socket.remoteDevice.name ?: "Unknown")
    params.putString("deviceAddress", deviceAddress)
    sendEvent("onConnected", params)
    
    Log.d(TAG, "Đã kết nối với $deviceAddress. Tổng số kết nối: ${connectedDevices.size}")
  }

  // Xử lý khi mất kết nối
  private fun connectionLost(deviceAddress: String) {
    connectedDevices.remove(deviceAddress)
    
    val params = Arguments.createMap()
    params.putString("deviceAddress", deviceAddress)
    sendEvent("onConnectionLost", params)
    
    Log.d(TAG, "Mất kết nối với $deviceAddress. Còn lại: ${connectedDevices.size} kết nối")
  }

  // ==================== EVENTS ====================

  private fun sendEvent(eventName: String, params: WritableMap?) {
    reactApplicationContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName, params)
  }

  // ==================== CLEANUP ====================

  override fun onCatalystInstanceDestroy() {
    super.onCatalystInstanceDestroy()
    try {
      reactApplicationContext.unregisterReceiver(discoveryReceiver)
    } catch (e: Exception) {
      Log.w(TAG, "Receiver not registered")
    }
    
    // Đóng tất cả kết nối
    for ((_, thread) in connectedDevices) {
      thread.cancel()
    }
    connectedDevices.clear()
    
    connectThread?.cancel()
    acceptThread?.cancel()
    serverSocket?.close()
  }
}