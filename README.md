# 🚀 Anonim Dijital Duvar (Digital Graffiti & Capsule)

> **Kayıt olmadan, kimlik belirtmeden o anki moduna göre duvara renkli bir dijital kart bırak; başkalarının notlarını beğen ve keşfet!**

Modern tam yığın (Full Stack) mimarisiyle geliştirilmiş, **HTTP Durum Kodları (200, 201, 400, 401, 403, 429)** ve **CI/CD** süreçlerini gerçek dünya senaryolarında sergileyen minimalist dijital graffiti panosu.

---

## 📸 Ekran Görüntüsü & Deneyim
- **Derin Siyah Tuval (Dark Canvas):** Miro ve FigJam esintili, dikkat dağıtmayan zarif siyah zemin.
- **Tıklanan Yere Anlık Kart Ekleme:** Ekranda boş bir noktaya tıklandığı anda imleç koordinatında kompakt oluşturucu açılır ve kart tam oraya yapışır.
- **Doğal Fiziksel Eğim (Tilt):** Notlar panoya fiziksel post-it'ler gibi rastgele hafif açılarla yerleşir (`-4°` ile `+4°`).
- **Anonim Yazar Yetkilendirmesi (Device Token):** Yalnızca o notu yazan kullanıcının ekranında çöp kutusu ikonu görünür ve silinebilir.

---

## 🛠️ Teknoloji Yığını (Tech Stack)

| Katman | Teknolojiler |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide React, Axios |
| **Backend** | Node.js, Express.js (ES Modules), Mongoose, Cors, Dotenv |
| **Spam Koruma** | `express-rate-limit` (IP tabanlı hız sınırlandırıcı) |
| **Veritabanı** | MongoDB Atlas (NoSQL Cloud Cluster) |
| **CI / CD** | GitHub Actions (Otomatik sözdizimi denetimi & Frontend Build doğrulaması) |
| **Hosting** | **Frontend:** Vercel • **Backend:** Render.com |

---

## 📡 HTTP Durum Kodları Mimarisi

Bu projede backend API durum kodları standart REST ilkelerine tam uyumlu olarak kurgulanmıştır:

| Metot | Uç Nokta (Endpoint) | Durum Kodu | Senaryo |
|---|---|---|---|
| `GET` | `/api/posts` | **`200 OK`** | Duvardaki son 30 not başarıyla listelendi. |
| `POST` | `/api/posts` | **`201 Created`** | Yeni anonim not duvara yapıştırıldı. |
| `POST` | `/api/posts` | **`400 Bad Request`** | Not boş bırakıldığında veya 100 karakter sınırını aştığında. |
| `POST` | `/api/posts` | **`429 Too Many Requests`** | Aynı IP'den 15 dakikada 10'dan fazla not gönderilirse (Spam önleme). |
| `POST` | `/api/posts/:id/like` | **`200 OK`** | Kalp butonuna tıklandığında beğeni 1 artırıldı. |
| `DELETE` | `/api/posts/:id` | **`200 OK`** | Yazar kendi notunu başarıyla sildiğinde. |
| `DELETE` | `/api/posts/:id` | **`403 Forbidden`** | Başkasının yazdığı notu silmeye çalışan yetkisiz isteklerde. |
| `ANY` | `/api/unknown` | **`404 Not Found`** | Var olmayan bir endpoint çağrıldığında. |

---

## 🚀 Canlıya Alma (Deployment) Rehberi

Frontend ve Backend'i tamamen ücretsiz olarak iki ayrı modern platformda barındırıyoruz:

### 1. Backend Dağıtımı (Render.com)
1. [render.com](https://render.com) adresine giriş yapıp **New + ➔ Web Service** seçeneğine tıkla.
2. GitHub reponu bağla (`AnonimDuvar`).
3. Aşağıdaki ayarları yapılandır:
   - **Name:** `anonim-duvar-api`
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. **Environment Variables** bölümüne şu değişkenleri ekle:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = `mongodb+srv://...` (Atlas bağlantı adresin)
   - `CLIENT_URL` = `https://<senin-frontend-adın>.vercel.app`
5. **Deploy Web Service** butonuna bas. Render sana bir URL verecek (Örn: `https://anonim-duvar-api.onrender.com`).

---

### 2. Frontend Dağıtımı (Vercel)
1. [vercel.com](https://vercel.com) adresine giriş yapıp **Add New... ➔ Project** seçeneğini seç.
2. GitHub reponu içeri aktar (`AnonimDuvar`).
3. Proje ayarlarında:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `client` (Edit butonuna basıp `client` klasörünü seç).
4. **Environment Variables** bölümüne Backend URL'ini tanımla:
   - `VITE_API_URL` = `https://anonim-duvar-api.onrender.com/api` (Render'dan aldığın URL'in sonuna `/api` ekle).
5. **Deploy** butonuna tıkla. Siten birkaç saniye içinde canlıda!

---

## 💻 Yerel Geliştirme (Localhost)

Projeyi bilgisayarında çalıştırmak için:

```bash
# Repoyu klonla
git clone https://github.com/<kullanici-adin>/AnonimDuvar.git
cd AnonimDuvar

# Kök ve alt paketleri yükle
npm run install:all

# Tek komutla hem backend hem frontend'i ayağa kaldır
npm run dev
```

- **Frontend:** `http://localhost:5173`
- **Backend:** `http://localhost:5000`

---

## 📝 LinkedIn Paylaşım Şablonu

Projeyi LinkedIn'de paylaşırken kullanabileceğin örnek metin:

```text
🚀 Yeni Projem Canlıda: "Anonim Dijital Duvar" (Digital Graffiti Wall)

Kayıt olmadan, dilediğiniz renkte dijital bir not bırakabileceğiniz, diğer insanların bıraktığı notları keşfedip beğenebileceğiniz minimalist bir platform geliştirdim.

🎯 Bu Projede Neleri Hedefledim?
Sadece bir CRUD uygulaması yapmak yerine, gerçek dünya backend standartlarını ve kullanıcı deneyimini ön plana çıkardım:

📡 REST API & HTTP Durum Kodları Mimarisi:
• 201 Created: Başarılı kart oluşturma
• 200 OK: Gerçek zamanlı beğeni ve listeleme
• 400 Bad Request: Katı karakter ve girdi doğrulaması
• 403 Forbidden: Yalnızca notu yazan kişinin silebilmesini sağlayan anonim token güvenliği
• 429 Too Many Requests: Spam saldırılarını engelleyen Rate Limiter koruması

🛠️ Teknoloji Yığını:
• Frontend: React 19, Tailwind CSS v4, Lucide Icons
• Backend: Node.js, Express.js (ES Modules)
• Veritabanı: MongoDB Atlas
• CI/CD: GitHub Actions (Otomatik syntax & build kontrolü)
• Dağıtım: Vercel (Frontend) & Render (Backend)

🌐 Canlı Link: [Vercel Linkiniz]
💻 Kaynak Kodları: [GitHub Reponuz]

Siz de duvara anonim bir not bırakmak ister misiniz? Yorumlarınızı ve notlarınızı bekliyorum! 👇
```
