import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      console.warn('⚠️ MONGODB_URI tanımlı değil! Lütfen .env dosyasını kontrol edin.');
      return false;
    }

    if (uri.includes('<db_password>')) {
      console.warn('⚠️ MONGODB_URI içinde <db_password> yer tutucusu bulunuyor. Lütfen gerçek şifrenizi server/.env içine yazın.');
      return false;
    }

    if (mongoose.connection.readyState === 1) {
      return true;
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      maxPoolSize: 10
    });
    console.log(`✅ MongoDB Atlas Bağlantısı Başarılı: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Bağlantı Hatası: ${error.message}`);
    return false;
  }
};

// İstek anında bağlantının hazır olduğundan emin olan yardımcı fonksiyon
export const ensureDBConnected = async () => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  // Eğer şu anda bağlanıyorsa (readyState === 2), bağlanmasını bekle
  if (mongoose.connection.readyState === 2) {
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 400));
      if (mongoose.connection.readyState === 1) return true;
    }
  }

  // Bağlantı kopmuşsa veya başlamamışsa yeniden bağlan
  return await connectDB();
};
