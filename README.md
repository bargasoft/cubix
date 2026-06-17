# CUBIX v1

## Açıklama
CUBIX, modern ve pürüzsüz 3 boyutlu grafikleri, esnek ve "responsive" arayüz tasarımı ile oyunculara keyifli bir bulmaca/zeka deneyimi sunan mobil oyundur. Oyun içerisinde farklı boyutlardaki küp yapılarını çözerek altın (Gold) kazanabilir, kazandığınız altınlarla profilinizi, avatarlarınızı ve oyun mekaniklerini geliştirebilirsiniz.

## Özellikler
* Tamamen Responsive UI (Küçük ekranlardan tabletlere kadar destekler)
* Safe-Area Entegrasyonu (iPhone ve Android çentik uyumluluğu)
* Dinamik Kamera (Tüm mobil cihaz en/boy oranlarında objelerin sığmasını garanti eder)
* AdMob Reklam Sistemi (Ödüllü altın ve süre reklamları)
* Gelişmiş Profil & Market Sistemi
* LocalStorage tabanlı oyuncu adı ve skor kaydetme

## Yükleme
Uygulama Capacitor kullanılarak inşa edilmiştir. `app-release.aab` dosyasını Google Play Console'a yükleyebilirsiniz.

> **ÖNEMLİ NOT:** Reklam birimlerinin aktif olarak çalışabilmesi için `www/index.html` içerisindeki `YOUR_ADMOB_REWARDED_ID_HERE` ve `AndroidManifest.xml` içerisindeki `YOUR_ADMOB_APP_ID_HERE` test anahtarlarının kendi gerçek AdMob kimliklerinizle değiştirilmesi gerekmektedir! Mevcut sürüm "Test ID" kullanılmasını engelleyecek şekilde release imzasıyla kapatılmıştır.

## Derleme (Sadece Geliştiriciler İçin)
Aşağıdaki komutlarla kendi `AAB` dosyanızı tekrar oluşturabilirsiniz:

```bash
npx cap sync
cd android
./gradlew bundleRelease
```
