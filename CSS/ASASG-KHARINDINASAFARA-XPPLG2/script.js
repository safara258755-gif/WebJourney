// script.js - Logika Utama Dashboard Kalender + Mood Tracker

// 1. DEKLARASI VARIABEL & ELEMEN HTML
const daftarTanggal = document.getElementById("daftar-tanggal");
const judulBulan = document.getElementById("bulan-tahun");

const tombolSebelum = document.getElementById("tombol-bulan-sebelum");
const tombolBerikut = document.getElementById("tombol-bulan-berikutnya");

const formSiklus = document.getElementById("formulir-siklus");
const inputAwalHaid = document.getElementById("awal-haid");
const inputPanjangSiklus = document.getElementById("panjang-siklus");
const inputLamaHaid = document.getElementById("lama-haid");

// Elemen Panel Info Hari Ini
const panelFaseSaatIni = document.getElementById("fase-saat-ini");
const panelMoodSaatIni = document.getElementById("mood-saat-ini");
const panelHaidBerikutnya = document.getElementById("haid-berikutnya");

// Waktu Kalender Aktif (Default bulan saat ini)
let bulan = new Date().getMonth();
let tahun = new Date().getFullYear();

let dataUser = null;

const namaBulan = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

// Mapping mood ke label Indonesia
const MOOD_LABELS = {
  "Happy": "Senang & Ceria",
  "Calm": "Tenang & Damai",
  "Energetic": "Berenergi & Produktif",
  "Tired": "Lelah & Butuh Rehat",
  "Sad": "Sedih / Sensitif",
  "Irritable": "Mudah Marah / Kesal",
  "Anxious": "Cemas / Khawatir",
  "Neutral": "Biasa Saja / Netral"
};

// Warna fase (hex) untuk dipakai di inline style
const PHASE_COLORS = {
  menstrual: "#E07A7A",
  follicular: "#E9C46A",
  ovulation: "#006769",
  luteal: "#40A578"
};

const PHASE_NAMES = {
  menstrual: "Menstruasi",
  follicular: "Folikular",
  ovulation: "Ovulasi",
  luteal: "Luteal"
};

// 2. JALANKAN PROGRAM PERTAMA KALI
inisialisasiAplikasi();

function inisialisasiAplikasi() {
  // Ambil data siklus yang tersimpan di localStorage
  const awalHaidSave = localStorage.getItem("awal-haid");
  const panjangSiklusSave = localStorage.getItem("panjang-siklus");
  const lamaHaidSave = localStorage.getItem("lama-haid") || "5";

  if (awalHaidSave && panjangSiklusSave) {
    dataUser = {
      awal: awalHaidSave,
      siklus: parseInt(panjangSiklusSave),
      lama: parseInt(lamaHaidSave),
    };

    // Isikan ke dalam form input
    inputAwalHaid.value = awalHaidSave;
    inputPanjangSiklus.value = panjangSiklusSave;
    inputLamaHaid.value = lamaHaidSave;
  }

  buatKalender();
  perbaruiPanelHariIni();
}

// ============================================================
// 3. FUNGSI HELPER: getPhase(date)
//    Mengembalikan { key, name, color } berdasarkan tanggal
// ============================================================
function getPhase(date) {
  if (!dataUser) return null;

  const tanggalCek = new Date(date);
  tanggalCek.setHours(0, 0, 0, 0);

  const tanggalAwal = new Date(dataUser.awal);
  tanggalAwal.setHours(0, 0, 0, 0);

  const selisihHari = Math.floor((tanggalCek - tanggalAwal) / (1000 * 60 * 60 * 24));

  if (selisihHari < 0) return null;

  const hariKe = ((selisihHari % dataUser.siklus) + dataUser.siklus) % dataUser.siklus;

  let key = "";
  if (hariKe < dataUser.lama) {
    key = "menstrual";
  } else if (hariKe < 13) {
    key = "follicular";
  } else if (hariKe === 13 || hariKe === 14) {
    key = "ovulation";
  } else {
    key = "luteal";
  }

  return {
    key: key,
    name: PHASE_NAMES[key],
    color: PHASE_COLORS[key]
  };
}

// ============================================================
// 4. FUNGSI HELPER: Format tanggal ke YYYY-MM-DD
// ============================================================
function formatDateStr(dateObj) {
  const d = new Date(dateObj);
  const bulanStr = String(d.getMonth() + 1).padStart(2, "0");
  const hariStr = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${bulanStr}-${hariStr}`;
}

// ============================================================
// 5. FUNGSI MOOD: saveMood, loadMood, loadNote
//    Menggunakan localStorage key "catatan-jurnal" (konsisten dgn notes.js)
// ============================================================

/**
 * saveMood - Menyimpan mood (dan catatan opsional) ke localStorage
 * @param {string} date - Format YYYY-MM-DD
 * @param {string} mood - Nilai mood (Happy, Calm, dll)
 * @param {string} note - Catatan opsional
 */
function saveMood(date, mood, note) {
  let data = JSON.parse(localStorage.getItem("catatan-jurnal") || "[]");

  // Hapus entri lama untuk tanggal yang sama
  data = data.filter(item => item.tanggal !== date);

  // Tambah entri baru
  data.push({
    tanggal: date,
    mood: mood,
    isi: note || ""
  });

  localStorage.setItem("catatan-jurnal", JSON.stringify(data));
}

/**
 * loadMood - Membaca mood dari localStorage berdasarkan tanggal
 * @param {string} date - Format YYYY-MM-DD
 * @returns {string|null} Nilai mood atau null
 */
function loadMood(date) {
  const data = JSON.parse(localStorage.getItem("catatan-jurnal") || "[]");
  const entry = data.find(item => item.tanggal === date);
  return entry ? entry.mood : null;
}

/**
 * loadNote - Membaca catatan dari localStorage berdasarkan tanggal
 * @param {string} date - Format YYYY-MM-DD
 * @returns {string|null} Isi catatan atau null
 */
function loadNote(date) {
  const data = JSON.parse(localStorage.getItem("catatan-jurnal") || "[]");
  const entry = data.find(item => item.tanggal === date);
  return entry ? entry.isi : null;
}

/**
 * formatMoodLabel - Mengembalikan "Mood: X (Fase Y)"
 * @param {string} date - Format YYYY-MM-DD
 * @returns {string} Label mood dengan konteks fase
 */
function formatMoodLabel(date) {
  const mood = loadMood(date);
  const phase = getPhase(date);

  if (!mood) return "Belum ada mood";

  const moodText = MOOD_LABELS[mood] || mood;
  const phaseText = phase ? phase.name : "Tidak diketahui";

  return `${moodText} (Fase ${phaseText})`;
}

// ============================================================
// 6. FUNGSI UTAMA: Membuat Struktur Kalender
// ============================================================
function buatKalender() {
  daftarTanggal.innerHTML = "";

  // Tulis judul bulan dan tahun di header
  judulBulan.textContent = namaBulan[bulan] + " " + tahun;

  // Dapatkan hari pertama di bulan aktif ini (0 = Minggu, 1 = Senin, dst)
  let hariPertama = new Date(tahun, bulan, 1).getDay();

  // Dapatkan jumlah hari di bulan aktif ini
  let jumlahHari = new Date(tahun, bulan + 1, 0).getDate();

  // Buat kotak kosong (spacer) agar tanggal 1 jatuh di kolom hari yang benar
  for (let i = 0; i < hariPertama; i++) {
    const kotakKosong = document.createElement("div");
    kotakKosong.className = "date-cell-empty w-full aspect-square";
    daftarTanggal.appendChild(kotakKosong);
  }

  // Buat sel tanggal untuk setiap hari dalam bulan ini
  for (let i = 1; i <= jumlahHari; i++) {
    const tombolTanggal = document.createElement("button");
    const dateStr = formatDateStr(new Date(tahun, bulan, i));

    tombolTanggal.className =
      "date-cell w-full aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-bold transition-all relative border border-transparent select-none cursor-pointer hover:scale-105 hover:shadow-md";
    tombolTanggal.textContent = i;

    // Tambah data-date attribute
    tombolTanggal.setAttribute("data-date", dateStr);

    // Click handler untuk buka tooltip
    tombolTanggal.addEventListener("click", function (event) {
      event.stopPropagation();
      showTooltip(tombolTanggal, dateStr);
    });

    daftarTanggal.appendChild(tombolTanggal);
  }

  // Jika user sudah mengisi data siklus, hitung dan warnai kalender
  if (dataUser) {
    warnaiKalender();
    applyMoodBadges();
  }

  // Sinkronisasi ikon Lucide jika ada elemen baru
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

// ============================================================
// 7. MEWARNAI SEL TANGGAL SESUAI FASE SIKLUSNYA
// ============================================================
function warnaiKalender() {
  const semuaTombolTanggal = document.querySelectorAll(".date-cell");
  const hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);

  const tanggalAwalSiklus = new Date(dataUser.awal);
  tanggalAwalSiklus.setHours(0, 0, 0, 0);

  semuaTombolTanggal.forEach((tombol) => {
    let nilaiHari = parseInt(tombol.textContent);
    let tanggalCek = new Date(tahun, bulan, nilaiHari);
    tanggalCek.setHours(0, 0, 0, 0);

    // Beri highlight tipis jika hari ini
    if (tanggalCek.getTime() === hariIni.getTime()) {
      tombol.classList.add("ring-2", "ring-charcoal", "shadow-sm");
    }

    // Hitung selisih hari dari hari pertama haid terakhir
    let selisihWaktu = tanggalCek.getTime() - tanggalAwalSiklus.getTime();
    let selisihHari = Math.floor(selisihWaktu / (1000 * 60 * 60 * 24));

    // Jika tanggal sebelum awal data, biarkan polos
    if (selisihHari < 0) {
      tombol.classList.add("text-charcoal/70");
      return;
    }

    // Cari tahu hari keberapa di siklus ini
    let hariKe = selisihHari % dataUser.siklus;

    // Tentukan fase siklus
    let fase = "";
    if (hariKe < dataUser.lama) {
      fase = "menstrual";
    } else if (hariKe < 13) {
      fase = "follicular";
    } else if (hariKe === 13 || hariKe === 14) {
      fase = "ovulation";
    } else {
      fase = "luteal";
    }

    // Warna pastel + border putus-putus untuk tanggal masa depan
    // Warna solid untuk tanggal hari ini dan masa lalu
    if (tanggalCek > hariIni) {
      if (fase === "menstrual") {
        tombol.classList.add("border-2", "border-dashed", "border-menstrual/80", "bg-menstrual/30", "text-charcoal");
      } else if (fase === "follicular") {
        tombol.classList.add("border-2", "border-dashed", "border-follicular/80", "bg-follicular/30", "text-charcoal");
      } else if (fase === "ovulation") {
        tombol.classList.add("border-2", "border-dashed", "border-ovulation/80", "bg-ovulation/30", "text-charcoal");
      } else if (fase === "luteal") {
        tombol.classList.add("border-2", "border-dashed", "border-luteal/80", "bg-luteal/30", "text-charcoal");
      }
    } else {
      if (fase === "menstrual") {
        tombol.classList.add("bg-menstrual", "text-charcoal");
      } else if (fase === "follicular") {
        tombol.classList.add("bg-follicular", "text-charcoal");
      } else if (fase === "ovulation") {
        tombol.classList.add("bg-ovulation", "text-charcoal");
      } else if (fase === "luteal") {
        tombol.classList.add("bg-luteal", "text-charcoal");
      }
    }
  });
}

// ============================================================
// 8. APPLY MOOD BADGES PADA SEL KALENDER
//    Menampilkan dot kecil di pojok kanan atas jika ada mood tersimpan
// ============================================================
function applyMoodBadges() {
  const semuaTombolTanggal = document.querySelectorAll(".date-cell[data-date]");
  const allNotes = JSON.parse(localStorage.getItem("catatan-jurnal") || "[]");

  // Buat map tanggal -> mood untuk lookup cepat
  const moodMap = {};
  allNotes.forEach(item => {
    if (item.mood) {
      moodMap[item.tanggal] = item.mood;
    }
  });

  semuaTombolTanggal.forEach(tombol => {
    const dateStr = tombol.getAttribute("data-date");
    const mood = moodMap[dateStr];

    if (mood) {
      // Buat badge dot
      const badge = document.createElement("span");
      badge.className = "mood-badge absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full border border-white shadow-sm";
      badge.title = formatMoodLabel(dateStr);

      // Warna badge berdasarkan fase
      const phase = getPhase(dateStr);
      if (phase) {
        badge.style.backgroundColor = phase.color;
      } else {
        badge.style.backgroundColor = "#C58F7A";
      }

      // Hapus badge lama jika ada
      const oldBadge = tombol.querySelector(".mood-badge");
      if (oldBadge) oldBadge.remove();

      tombol.appendChild(badge);
    }
  });
}

// ============================================================
// 9. TOOLTIP & MODAL MOOD: Buka, Tutup, Simpan, dan Prediksi
// ============================================================

// Penjelasan mood khas untuk tiap fase
const PHASE_EXPLANATIONS = {
  "menstrual": "Pada fase menstruasi, tingkat estrogen & progesteron rendah. Biasanya energi menurun, tubuh butuh istirahat lebih, dan emosi cenderung sensitif, lelah, atau sendu.",
  "follicular": "Pada fase folikular, hormon estrogen mulai meningkat. Biasanya Anda merasa energi kembali naik, mood lebih positif, kreatif, dan bersemangat untuk memulai hal baru.",
  "ovulation": "Pada fase ovulasi (subur), hormon berada pada tingkat tertinggi. Biasanya Anda merasa sangat berenergi, percaya diri, komunikatif, dan emosi cenderung sangat stabil.",
  "luteal": "Pada fase luteal (pra-menstruasi), progesteron meningkat lalu turun tajam. Biasanya muncul gejala PMS seperti perubahan mood yang cepat, mudah cemas, lelah, atau tersinggung."
};

function getPhaseExplanation(phaseKey) {
  return PHASE_EXPLANATIONS[phaseKey] || "Informasi kondisi fase tidak tersedia.";
}

// Nilai numerik mood untuk kalkulasi rata-rata
const MOOD_VALUES = {
  "Happy": 5,
  "Calm": 4,
  "Energetic": 5,
  "Neutral": 3,
  "Tired": 2,
  "Anxious": 2,
  "Sad": 1,
  "Irritable": 1
};

// Map skor rata-rata ke label teks prediksi
function getPredictionLabel(score) {
  if (score >= 4.5) return "Sangat Baik & Berenergi";
  if (score >= 3.5) return "Cukup Baik & Tenang";
  if (score >= 2.5) return "Biasa Saja (Stabil)";
  if (score >= 1.5) return "Agak Lelah / Sensitif";
  return "Sangat Lelah / Emosional";
}

function getAverageMoodForPhase(phaseKey) {
  const allNotes = JSON.parse(localStorage.getItem("catatan-jurnal") || "[]");
  let totalScore = 0;
  let count = 0;

  allNotes.forEach(item => {
    if (item.mood && MOOD_VALUES[item.mood]) {
      const phase = getPhase(item.tanggal);
      if (phase && phase.key === phaseKey) {
        totalScore += MOOD_VALUES[item.mood];
        count++;
      }
    }
  });

  if (count === 0) return null; // Belum ada data untuk fase ini
  
  const avg = totalScore / count;
  return {
    score: avg.toFixed(1),
    label: getPredictionLabel(avg)
  };
}

function showTooltip(cellElement, dateStr) {
  // Hapus tooltip lama jika ada
  hideTooltip();
  
  // Ambil data
  const allNotes = JSON.parse(localStorage.getItem("catatan-jurnal") || "[]");
  const noteEntry = allNotes.find(item => item.tanggal === dateStr);
  const phase = getPhase(dateStr);
  
  // Hitung hari dalam minggu (0 = Minggu, 1 = Senin, ..., 6 = Sabtu)
  const dateObj = new Date(dateStr + "T00:00:00");
  const dayOfWeek = dateObj.getDay();

  // Buat element tooltip
  const tooltip = document.createElement("div");
  tooltip.id = "calendar-tooltip";
  tooltip.className = "absolute z-30 w-72 p-4 bg-white border border-sand rounded-2xl shadow-lg text-left transition-all duration-200 opacity-0 scale-95 cursor-default text-charcoal pointer-events-auto";
  
  // Hitung posisi di atas sel tanggal
  tooltip.style.bottom = "115%";
  
  // Atur penyelarasan kiri/kanan/tengah dinamis berdasarkan kolom agar tidak terpotong di tepi
  if (dayOfWeek === 0 || dayOfWeek === 1) {
    // Aliansi kiri (melebar ke kanan)
    tooltip.style.left = "0";
    tooltip.style.transform = "scale(0.95)";
    tooltip.style.transformOrigin = "bottom left";
  } else if (dayOfWeek === 5 || dayOfWeek === 6) {
    // Aliansi kanan (melebar ke kiri)
    tooltip.style.left = "auto";
    tooltip.style.right = "0";
    tooltip.style.transform = "scale(0.95)";
    tooltip.style.transformOrigin = "bottom right";
  } else {
    // Aliansi tengah
    tooltip.style.left = "50%";
    tooltip.style.transform = "translateX(-50%) scale(0.95)";
    tooltip.style.transformOrigin = "bottom center";
  }
  
  // Prevent clicks inside tooltip from closing it
  tooltip.addEventListener("click", function(e) {
    e.stopPropagation();
  });
  
  // Isi preview catatan
  let preview = "Belum ada catatan untuk tanggal ini.";
  let hasNote = false;
  if (noteEntry && noteEntry.isi) {
    hasNote = true;
    preview = noteEntry.isi.length > 80 ? `"${noteEntry.isi.substring(0, 80)}..."` : `"${noteEntry.isi}"`;
  }
  
  // Prediksi Mood
  let predictionHTML = "";
  if (phase) {
    const prediction = getAverageMoodForPhase(phase.key);
    const bgLightColor = phase.color + "15"; // Opacity warna fase rendah
    
    if (prediction) {
      predictionHTML = `
        <div class="mt-2 p-2 rounded-lg text-[10px] font-medium leading-normal border" 
            style="background-color: ${bgLightColor}; border-color: ${phase.color}33; color: ${phase.color}">
          Prediksi Mood Fase ${phase.name}: <strong>${prediction.label}</strong> (${prediction.score}/5)
        </div>
      `;
    } else {
      // Jika data riwayat masih kosong untuk fase ini
      predictionHTML = `
        <div class="mt-2 p-2 rounded-lg text-[10px] font-medium leading-normal border bg-cream/50 border-sand/60 text-charcoal/50">
          Prediksi Fase ${phase.name}: Belum ada data historis.
        </div>
      `;
    }
  }

  const formattedDate = dateObj.toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric"
  });

  tooltip.innerHTML = `
    <div class="space-y-2">
      <div class="flex justify-between items-start">
        <span class="text-[10px] font-bold text-charcoal/40 uppercase">${formattedDate}</span>
        <button onclick="editMoodDariTooltip(event, '${dateStr}')" class="text-[10px] text-clay hover:underline font-bold">Tulis/Edit</button>
      </div>
      <p class="text-xs text-charcoal/70 leading-relaxed italic">${preview}</p>
      ${hasNote ? `
        <a href="notes.html#note-${dateStr}" class="text-[10px] text-clay hover:underline block font-semibold">
          Lihat selengkapnya di Jurnal →
        </a>
      ` : ""}
      ${predictionHTML}
      
      <!-- Penjelasan Mood Khas Berdasarkan Fase -->
      <div class="text-[9px] text-charcoal/60 leading-normal border-t border-sand/40 pt-1.5 mt-1.5">
        <span class="font-semibold text-charcoal/80 block mb-0.5">Info Fase (${phase ? phase.name : '-'}):</span>
        ${getPhaseExplanation(phase ? phase.key : '')}
      </div>
    </div>
  `;

  cellElement.appendChild(tooltip);

  // Animasi masuk
  requestAnimationFrame(() => {
    tooltip.classList.remove("opacity-0", "scale-95");
    if (dayOfWeek === 0 || dayOfWeek === 1) {
      tooltip.style.transform = "scale(1)";
    } else if (dayOfWeek === 5 || dayOfWeek === 6) {
      tooltip.style.transform = "scale(1)";
    } else {
      tooltip.style.transform = "translateX(-50%) scale(1)";
    }
  });

  // Event listener untuk menutup tooltip jika klik di luar
  document.addEventListener("click", handleOutsideClick);
}

function hideTooltip() {
  const existing = document.getElementById("calendar-tooltip");
  if (existing) {
    existing.remove();
  }
  document.removeEventListener("click", handleOutsideClick);
}

function handleOutsideClick(e) {
  const tooltip = document.getElementById("calendar-tooltip");
  if (tooltip && !tooltip.contains(e.target) && !e.target.classList.contains("date-cell")) {
    hideTooltip();
  }
}

function editMoodDariTooltip(event, dateStr) {
  event.stopPropagation();
  hideTooltip();
  bukaModalMood(dateStr);
}

/**
 * bukaModalMood - Membuka modal detail tanggal + form mood (simplified)
 * @param {string} dateStr - Format YYYY-MM-DD
 */
function bukaModalMood(dateStr) {
  const modal = document.getElementById("modal-mood");
  const overlay = document.getElementById("modal-overlay");
  if (!modal || !overlay) return;

  const dateObj = new Date(dateStr + "T00:00:00");
  const formatTgl = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  const tanggalCantik = dateObj.toLocaleDateString("id-ID", formatTgl);

  // Header tanggal
  document.getElementById("modal-tanggal").textContent = tanggalCantik;

  // Load mood & catatan yang sudah ada
  const moodSaved = loadMood(dateStr);
  const noteSaved = loadNote(dateStr);

  const selectMood = document.getElementById("modal-mood-select");
  const textNote = document.getElementById("modal-note-text");

  selectMood.value = moodSaved || "";
  textNote.value = noteSaved || "";

  // Simpan dateStr ke data attribute modal
  modal.setAttribute("data-active-date", dateStr);

  // Show modal
  overlay.classList.remove("hidden");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  requestAnimationFrame(() => {
    overlay.classList.add("opacity-100");
    modal.classList.add("opacity-100", "scale-100");
    modal.classList.remove("opacity-0", "scale-95");
  });
}

/**
 * tutupModalMood - Menutup modal mood
 */
function tutupModalMood() {
  const modal = document.getElementById("modal-mood");
  const overlay = document.getElementById("modal-overlay");
  if (!modal || !overlay) return;

  modal.classList.remove("opacity-100", "scale-100");
  modal.classList.add("opacity-0", "scale-95");
  overlay.classList.remove("opacity-100");

  setTimeout(() => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    overlay.classList.add("hidden");
  }, 200);
}

/**
 * simpanMoodDariModal - Handler tombol simpan di modal
 */
function simpanMoodDariModal() {
  const modal = document.getElementById("modal-mood");
  const dateStr = modal.getAttribute("data-active-date");
  const mood = document.getElementById("modal-mood-select").value;
  const note = document.getElementById("modal-note-text").value;

  if (!mood) {
    // Highlight select jika belum dipilih
    document.getElementById("modal-mood-select").focus();
    return;
  }

  saveMood(dateStr, mood, note);

  // Refresh badge di kalender
  applyMoodBadges();

  // Refresh panel hari ini
  perbaruiPanelHariIni();

  // Render trend chart
  renderMoodTrend();

  // Tutup modal
  tutupModalMood();
}

// 10. UPDATE PANEL INFORMASI HARI INI
function perbaruiPanelHariIni() {
  if (!dataUser) return;

  const hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);

  const tanggalAwal = new Date(dataUser.awal);
  tanggalAwal.setHours(0, 0, 0, 0);

  // Hitung fase hari ini
  let selisihHari = Math.floor((hariIni - tanggalAwal) / (1000 * 60 * 60 * 24));
  let hariKe = ((selisihHari % dataUser.siklus) + dataUser.siklus) % dataUser.siklus;

  let faseHariIni = "Fase Luteal";
  let warnaChip = "text-luteal";
  if (hariKe < dataUser.lama) {
    faseHariIni = "Fase Menstruasi";
    warnaChip = "text-menstrual";
  } else if (hariKe < 13) {
    faseHariIni = "Fase Folikular";
    warnaChip = "text-charcoal";
  } else if (hariKe === 13 || hariKe === 14) {
    faseHariIni = "Fase Ovulasi (Subur)";
    warnaChip = "text-ovulation";
  }

  panelFaseSaatIni.textContent = faseHariIni;
  panelFaseSaatIni.className = `text-sm font-bold bg-cream px-3 py-1 rounded-full border border-sand/40 ${warnaChip}`;

  // Mood hari ini dari localStorage
  const todayStr = formatDateStr(hariIni);
  const todayMood = loadMood(todayStr);
  if (todayMood) {
    panelMoodSaatIni.textContent = MOOD_LABELS[todayMood] || todayMood;
    panelMoodSaatIni.className = "text-sm font-semibold text-clay";
  } else {
    panelMoodSaatIni.textContent = "Klik tanggal untuk catat";
    panelMoodSaatIni.className = "text-sm font-medium text-charcoal/50 italic";
  }

  // Hitung perkiraan hari haid berikutnya
  let tanggalPrediksiNext = new Date(tanggalAwal.getTime());
  while (tanggalPrediksiNext < hariIni) {
    tanggalPrediksiNext.setDate(tanggalPrediksiNext.getDate() + dataUser.siklus);
  }

  const formatNext = { month: "short", day: "numeric", year: "numeric" };
  panelHaidBerikutnya.textContent = tanggalPrediksiNext.toLocaleDateString("id-ID", formatNext);
}

// 11. MOOD TREND CHART (Bar chart sederhana, pure CSS/JS)
function renderMoodTrend() {
  const container = document.getElementById("mood-trend-container");
  if (!container) return;

  const allNotes = JSON.parse(localStorage.getItem("catatan-jurnal") || "[]");
  const jumlahHari = new Date(tahun, bulan + 1, 0).getDate();

  // Mapping mood ke nilai numerik untuk tinggi bar
  const moodValues = {
    "Happy": 5, "Energetic": 5,
    "Calm": 4,
    "Neutral": 3,
    "Tired": 2, "Anxious": 2,
    "Sad": 1, "Irritable": 1
  };

  // Buat map tanggal -> mood
  const moodMap = {};
  allNotes.forEach(item => {
    if (item.mood) moodMap[item.tanggal] = item.mood;
  });

  // Cek apakah ada data mood untuk bulan ini
  let adaData = false;
  for (let i = 1; i <= jumlahHari; i++) {
    const ds = formatDateStr(new Date(tahun, bulan, i));
    if (moodMap[ds]) { adaData = true; break; }
  }

  if (!adaData) {
    container.innerHTML = `
      <div class="text-center py-6 text-charcoal/40 text-xs italic">
        Belum ada data mood untuk bulan ini. Klik tanggal di kalender untuk mulai mencatat.
      </div>
    `;
    return;
  }

  let barsHTML = "";
  for (let i = 1; i <= jumlahHari; i++) {
    const ds = formatDateStr(new Date(tahun, bulan, i));
    const mood = moodMap[ds];
    const phase = getPhase(ds);
    const color = phase ? phase.color : "#C58F7A";

    if (mood) {
      const val = moodValues[mood] || 3;
      const heightPct = (val / 5) * 100;
      const label = MOOD_LABELS[mood] || mood;
      barsHTML += `
        <div class="flex flex-col items-center gap-0.5 flex-1 min-w-0" title="${i} - ${label}">
          <div class="w-full flex items-end justify-center" style="height:48px;">
            <div class="w-full max-w-[10px] rounded-t-sm transition-all duration-300" style="height:${heightPct}%; background-color:${color};"></div>
          </div>
          <span class="text-[8px] text-charcoal/40 leading-none">${i}</span>
        </div>
      `;
    } else {
      barsHTML += `
        <div class="flex flex-col items-center gap-0.5 flex-1 min-w-0">
          <div class="w-full flex items-end justify-center" style="height:48px;">
            <div class="w-full max-w-[10px] rounded-t-sm bg-sand/40" style="height:10%;"></div>
          </div>
          <span class="text-[8px] text-charcoal/30 leading-none">${i}</span>
        </div>
      `;
    }
  }

  container.innerHTML = `
    <div class="flex items-end gap-px overflow-x-auto pb-1">
      ${barsHTML}
    </div>
    <div class="flex items-center justify-center gap-4 mt-3 text-[9px] text-charcoal/50 flex-wrap">
      <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-menstrual inline-block"></span> Menstruasi</span>
      <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-follicular inline-block"></span> Folikular</span>
      <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full inline-block" style="background:#006769"></span> Ovulasi</span>
      <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full inline-block" style="background:#40A578"></span> Luteal</span>
    </div>
  `;
}

// 12. UPDATE DATA SIKLUS MELALUI FORM DASHBOARD
formSiklus.addEventListener("submit", function (event) {
  event.preventDefault();

  const awal = inputAwalHaid.value;
  const siklus = parseInt(inputPanjangSiklus.value);
  const lama = parseInt(inputLamaHaid.value);

  // Simpan ke localStorage
  localStorage.setItem("awal-haid", awal);
  localStorage.setItem("panjang-siklus", siklus.toString());
  localStorage.setItem("lama-haid", lama.toString());

  // Update data dan gambar ulang kalender
  dataUser = { awal, siklus, lama };
  buatKalender();
  perbaruiPanelHariIni();
  renderMoodTrend();
});

// 13. TOMBOL NAVIGASI BULAN (SEBELUMNYA & BERIKUTNYA)
tombolSebelum.addEventListener("click", function () {
  bulan--;
  if (bulan < 0) {
    bulan = 11;
    tahun--;
  }
  buatKalender();
  renderMoodTrend();
});

tombolBerikut.addEventListener("click", function () {
  bulan++;
  if (bulan > 11) {
    bulan = 0;
    tahun++;
  }
  buatKalender();
  renderMoodTrend();
});

// 14. INISIALISASI TREND CHART
document.addEventListener("DOMContentLoaded", function () {
  renderMoodTrend();
});
