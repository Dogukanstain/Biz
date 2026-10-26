# Midnight Protocol — Bahar Vadisi Pixel Co-op

Tarayıcıda çalışan, üstten görünümlü, Stardew Valley'den ilham alan (özgün çizimli) piksel sanatlı küçük köy macerası. Oyun motoru gerekmez.

## Özellikler
- Tek başına oynanabilir; oyuncu sayısı 1–5.
- Aynı oda koduyla arkadaşlar katılabilir.
- Doğukan (kırmızı), Yaren (sarı), Aysima (mor), Berken (pembe), Emre (yeşil) karakter seçimi.
- WASD / ok tuşlarıyla hareket, E ile köy görevlerini tamamlama.
- Telefonlarda dokunmatik hareket ve görev düğmesi.
- Node.js + Express + Socket.IO; Render için hazır.

## GitHub'a yükleme
ZIP'i çıkart. İçindeki `midnight_protocol` klasörüne gir ve **içindeki dosyaları** GitHub deposunun köküne yükle. `package.json`, `server.js` ve `public/` doğrudan depo ana sayfasında görünmeli.

## Render ayarları
Render → New → Web Service → GitHub deposunu seç:
- **Root Directory:** boş bırak (dosyalar deponun kökündeyse)
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Runtime:** Node

Deploy tamamlanınca Render'ın verdiği `https://....onrender.com` adresini aç.

## Oynama
1. Karakterini seç.
2. Oda kodunu bırak `BAHAR` olarak veya kendi kodunu yaz.
3. **Köye gir**. Tek başına da oynayabilirsin.
4. Arkadaşların aynı URL ve aynı oda kodunu kullanmalı.
5. Görev işaretlerine yaklaş, `E` tuşuna bas. Dört görev tamamlanınca köy hedefi tamamlanır.

Not: Bu, tarayıcı prototipidir. Görseller kodla çizilen özgün piksel çizimleridir; resmi Stardew Valley varlıkları kullanılmamıştır.
