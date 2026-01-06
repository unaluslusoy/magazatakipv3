eklettim alanları# Backend - ticker_text Alanı Ekleme Talebi

## Sorun
Android TV uygulamasında `ticker` tipindeki içeriklerde kayan yazı gösterilemiyor çünkü API'den `ticker_text` alanı dönmüyor.

## Mevcut API Yanıtı
```json
{
  "id": 15,
  "name": "Palmiye Gurme Kuruyemiş Aktar",
  "type": "ticker",
  "url": null,
  "duration": 30
}
```

## Beklenen API Yanıtı
```json
{
  "id": 15,
  "name": "Palmiye Gurme Kuruyemiş Aktar",
  "type": "ticker",
  "ticker_text": "🎄 Hoş geldiniz! Mağazamızda seçili ürünlerde indirimler başladı! %50 ye varan indirimler! 🎁",
  "url": null,
  "duration": 30
}
```

## Veritabanı
`contents` tablosunda `ticker_text` kolonu mevcut. Bu alanın API response'a eklenmesi gerekiyor.

## Etkilenen Endpoint'ler
1. `GET /api/contents` - Tüm içerikler listesi
2. `GET /api/contents/:id` - Tek içerik detayı
3. `GET /api/playlists/:id` - Playlist detayı (contents array içinde)

## Laravel/Backend Düzeltmesi

### Option 1: Model'e ekle
```php
// app/Models/Content.php
protected $fillable = [
    'name',
    'type',
    'ticker_text',  // Bu alanı ekle
    // ...diğer alanlar
];
```

### Option 2: Resource'a ekle
```php
// app/Http/Resources/ContentResource.php
public function toArray($request)
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'type' => $this->type,
        'ticker_text' => $this->ticker_text,  // Bu alanı ekle
        'file_url' => $this->file_url,
        'duration' => $this->duration_seconds,
        // ...diğer alanlar
    ];
}
```

### Option 3: Controller'da ekle
```php
// ContentController.php
$content = Content::find($id);
return response()->json([
    'success' => true,
    'data' => [
        'id' => $content->id,
        'name' => $content->name,
        'type' => $content->type,
        'ticker_text' => $content->ticker_text,  // Bu alanı ekle
        // ...
    ]
]);
```

## Test
Düzeltme yapıldıktan sonra:
```bash
curl -s "https://mtapi.magazatakip.com.tr/api/contents" | jq '.data.items.data[] | select(.type == "ticker")'
```

## Android Uygulama Kullanımı
Uygulama zaten `ticker_text` alanını bekliyor:
- Başlık (title/name): Ekranda sabit duracak
- Kayan yazı (ticker_text): Sağdan sola kayacak

```typescript
// PlayerScreen.tsx
<Text style={styles.tickerTitle}>
  {currentContent.title || currentContent.name}
</Text>
<TickerText text={currentContent.ticker_text || ''} />
```

