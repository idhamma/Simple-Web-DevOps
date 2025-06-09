/* js/main.js */
// === Inisialisasi Peta ===
const defaultCoords = [-6.2088, 106.8456];
const map = L.map('map').setView(defaultCoords, 10);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let marker = L.marker(defaultCoords).addTo(map).bindPopup('Lokasi Awal: Jakarta').openPopup();

// Elemen DOM
const instructionEl = document.getElementById('instruction');
const resultEl = document.getElementById('prayer-times-result');

// Panggil fungsi untuk pertama kali di lokasi default
getAndDisplayPrayerTimes(defaultCoords[0], defaultCoords[1]);

// === Event Listener Ketika Peta di-Klik ===
map.on('click', function(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    
    marker.setLatLng(e.latlng)
          .setPopupContent(`<b>Lokasi Dipilih</b><br>Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`)
          .openPopup();
    
    getAndDisplayPrayerTimes(lat, lng);
    
    // Auto-scroll ke hasil
    document.getElementById('info-card').scrollIntoView({ behavior: 'smooth' });
});

// === Fungsi Utama untuk Menghitung dan Menampilkan Waktu Sholat ===
function getAndDisplayPrayerTimes(latitude, longitude) {
    instructionEl.style.display = 'none';

    // Persiapan parameter untuk Adhan.js
    const coordinates = new adhan.Coordinates(latitude, longitude);
    const params = adhan.CalculationMethod.MoonsightingCommittee();
    const date = new Date();
    
    // Kalkulasi
    const prayerTimes = new adhan.PrayerTimes(coordinates, date, params);
    const timezone = moment.tz.guess();

    // Formatting Waktu
    const formattedTimes = {
        Fajr: moment(prayerTimes.fajr).tz(timezone).format('HH:mm'),
        Sunrise: moment(prayerTimes.sunrise).tz(timezone).format('HH:mm'),
        Dhuhr: moment(prayerTimes.dhuhr).tz(timezone).format('HH:mm'),
        Asr: moment(prayerTimes.asr).tz(timezone).format('HH:mm'),
        Maghrib: moment(prayerTimes.maghrib).tz(timezone).format('HH:mm'),
        Isha: moment(prayerTimes.isha).tz(timezone).format('HH:mm')
    };

    // Tampilkan hasil ke DOM
    resultEl.innerHTML = `
        <div class="location-info">
            <strong>Lokasi:</strong> Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}<br>
            <strong>Tanggal:</strong> ${moment(date).tz(timezone).format('dddd, DD MMMM YYYY')}<br>
            <strong>Timezone:</strong> ${timezone.replace('_', ' ')}
        </div>
        <table>
            <tbody>
                <tr><td>Subuh (Fajr)</td><td>${formattedTimes.Fajr}</td></tr>
                <tr><td>Terbit (Sunrise)</td><td>${formattedTimes.Sunrise}</td></tr>
                <tr><td>Dzuhur (Dhuhr)</td><td>${formattedTimes.Dhuhr}</td></tr>
                <tr><td>Ashar (Asr)</td><td>${formattedTimes.Asr}</td></tr>
                <tr><td>Maghrib</td><td>${formattedTimes.Maghrib}</td></tr>
                <tr><td>Isya (Isha)</td><td>${formattedTimes.Isha}</td></tr>
            </tbody>
        </table>
    `;
}