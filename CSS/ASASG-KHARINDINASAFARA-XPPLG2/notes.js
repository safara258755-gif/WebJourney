// ==========================================
// notes.js - Logika Pendukung Halaman Jurnal
// ==========================================

const formCatatan = document.getElementById("formulir-catatan");
const inputTanggal = document.getElementById("tanggal-catatan");
const inputMood = document.getElementById("mood-catatan");
const inputIsi = document.getElementById("isi-catatan");
const wadahDaftarCatatan = document.getElementById("daftar-catatan");

// Set default tanggal input ke hari ini
const hariIni = new Date();
inputTanggal.value = dapatkanFormatTanggalStr(hariIni);

let daftarCatatanArray = [];

muatCatatanDariStorage();

function muatCatatanDariStorage() {
  const catatanMentah = localStorage.getItem("catatan-jurnal");
  if (catatanMentah) {
    daftarCatatanArray = JSON.parse(catatanMentah);
  } else {
    daftarCatatanArray = [];
  }

  // Urutkan dari terbaru ke terlama
  daftarCatatanArray.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  tampilkanCatatanDiLayar();
}

function tampilkanCatatanDiLayar() {
  wadahDaftarCatatan.innerHTML = "";

  if (daftarCatatanArray.length === 0) {
    wadahDaftarCatatan.innerHTML = `
            <div class="text-center py-12 border border-dashed border-sand/80 rounded-2xl bg-cream/20">
                <span class="text-3xl block mb-2">🍃</span>
                <p class="text-sm font-medium text-charcoal/50">Belum ada catatan jurnal.</p>
            </div>
        `;
    return;
  }

  daftarCatatanArray.forEach((item) => {
    const kartuJurnal = document.createElement("div");
    kartuJurnal.id = `note-${item.tanggal}`;
    kartuJurnal.className =
      "bg-white border border-sand rounded-2xl p-5 space-y-3 relative overflow-hidden transition-all duration-300";

    const formatTgl = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const tanggalCantik = new Date(item.tanggal).toLocaleDateString(
      "id-ID",
      formatTgl,
    );

    kartuJurnal.innerHTML = `
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-sand/50 pb-2.5">
                <span class="text-xs font-bold text-charcoal/50 tracking-wider">${tanggalCantik}</span>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-cream border-sand text-charcoal w-fit gap-1">
                    <i data-lucide="pen-tool" class="w-3.5 h-3.5 inline"></i> 
                    ${item.mood}
                </span>
            </div>
            <p class="text-xs sm:text-sm text-charcoal/70 leading-relaxed italic whitespace-pre-line bg-cream/30 p-3 rounded-xl border border-sand/30">
                "${item.isi}"
            </p>
        `;
    wadahDaftarCatatan.appendChild(kartuJurnal);
  });

  if (typeof lucide !== "undefined") lucide.createIcons();
}

formCatatan.addEventListener("submit", function (event) {
  event.preventDefault();

  const dataBaru = {
    tanggal: inputTanggal.value,
    mood: inputMood.value,
    isi: inputIsi.value,
  };

  // Jika user menulis di tanggal yang sama, kita hapus catatan lama secara otomatis (replace diam-diam)
  daftarCatatanArray = daftarCatatanArray.filter(
    (item) => item.tanggal !== dataBaru.tanggal,
  );

  // Tambahkan catatan baru
  daftarCatatanArray.push(dataBaru);

  // Simpan ke storage
  localStorage.setItem("catatan-jurnal", JSON.stringify(daftarCatatanArray));

  // Kosongkan form dan set kembali ke hari ini
  formCatatan.reset();
  inputTanggal.value = dapatkanFormatTanggalStr(new Date());

  muatCatatanDariStorage();
});

function dapatkanFormatTanggalStr(dateObj) {
  let d = new Date(dateObj);
  let bulanStr = "" + (d.getMonth() + 1);
  let hariStr = "" + d.getDate();
  let tahunStr = d.getFullYear();

  if (bulanStr.length < 2) bulanStr = "0" + bulanStr;
  if (hariStr.length < 2) hariStr = "0" + hariStr;

  return [tahunStr, bulanStr, hariStr].join("-");
}

document.addEventListener("DOMContentLoaded", function () {
  if (typeof lucide !== "undefined") lucide.createIcons();

  // Smooth scroll to hash target if opening note from calendar tooltip
  if (window.location.hash) {
    const targetId = window.location.hash.substring(1);
    setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // Add high contrast ring flash effect
        el.classList.add("ring-2", "ring-clay", "scale-[1.02]", "shadow-md");
        setTimeout(() => {
          el.classList.remove("scale-[1.02]");
        }, 1000);
      }
    }, 300);
  }
});
