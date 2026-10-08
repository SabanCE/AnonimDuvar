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

    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Atlas Bağlantısı Başarılı: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Bağlantı Hatası: ${error.message}`);
    return false;
  }
};
