import { PredefinedAsset } from "@/app/Types";
import {
  AcquisitionSource,
  AssetType,
  Frequency,
  InvestmentType,
  TransactionType,
} from "@/lib/generated/prisma/enums";
import {
  Bitcoin,
  CircleDollarSign,
  Coins,
  Landmark,
  PiggyBank,
  Star,
  TrendingUp,
  Wallet,
} from "lucide-react";

export const DEFAULT_CATEGORIES = [
  // EXPENSE
  { name: "Food", type: TransactionType.EXPENSE },
  { name: "Transport", type: TransactionType.EXPENSE },
  { name: "Entertainment", type: TransactionType.EXPENSE },
  { name: "Shopping", type: TransactionType.EXPENSE },
  { name: "Health", type: TransactionType.EXPENSE },
  { name: "Other", type: TransactionType.EXPENSE },
  // INCOME
  { name: "Salary", type: TransactionType.INCOME },
  { name: "Freelance", type: TransactionType.INCOME },
  { name: "Business", type: TransactionType.INCOME },
  { name: "Other", type: TransactionType.INCOME },
];

export const DEFAULT_ASSETS = [
  { name: "Cash", type: AssetType.CASH },
  { name: "Bank", type: AssetType.BANK },
  { name: "Property", type: AssetType.PROPERTY },
  { name: "Vehicle", type: AssetType.VEHICLE },
  { name: "Other", type: AssetType.OTHER },
  { name: "Gold", type: AssetType.GOLD },
] as const;

export const ACQUISITION_SOURCES = [
  { name: "Gifted", value: AcquisitionSource.GIFTED },
  { name: "Inherited", value: AcquisitionSource.INHERITED },
  { name: "Other", value: AcquisitionSource.OTHER },
  { name: "Purchased", value: AcquisitionSource.PURCHASED },
];

export const DEFAULT_INVESTMENT_TYPES = [
  { name: "Stock", value: InvestmentType.STOCK },
  { name: "Crypto", value: InvestmentType.CRYPTO },
  { name: "Gold", value: InvestmentType.GOLD },
  { name: "Other", value: InvestmentType.OTHER },
];

export const DEFAULT_ACTIONS = [
  {
    icon: Wallet,
    label: "Add Transaction",
    value: "expense",
  },
  {
    icon: PiggyBank,
    label: "Add Investments",
    value: "savings",
  },
  {
    icon: Landmark,
    label: "Add Assets",
    value: "assets",
  },
];

export const PREDEFINED_ASSETS: PredefinedAsset[] = [
  // ── Gold ────────────────────────────────────────────────────────────────────
  {
    identifier: "gold",
    ticker: "gold", // handled by metals.live, not Yahoo Finance
    label: "Gold",
    type: "GOLD",
    unit: "gram",
  },

  // ── IDX Blue Chips ───────────────────────────────────────────────────────────
  {
    identifier: "BBCA.JK",
    ticker: "BBCA.JK",
    label: "Bank Central Asia",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "BBRI.JK",
    ticker: "BBRI.JK",
    label: "Bank Rakyat Indonesia",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "BMRI.JK",
    ticker: "BMRI.JK",
    label: "Bank Mandiri",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "TLKM.JK",
    ticker: "TLKM.JK",
    label: "Telkom Indonesia",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "ASII.JK",
    ticker: "ASII.JK",
    label: "Astra International",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "GOTO.JK",
    ticker: "GOTO.JK",
    label: "GoTo Gojek Tokopedia",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "BYAN.JK",
    ticker: "BYAN.JK",
    label: "Bayan Resources",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "UNVR.JK",
    ticker: "UNVR.JK",
    label: "Unilever Indonesia",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "ICBP.JK",
    ticker: "ICBP.JK",
    label: "Indofood CBP",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "KLBF.JK",
    ticker: "KLBF.JK",
    label: "Kalbe Farma",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "INDF.JK",
    ticker: "INDF.JK",
    label: "Indofood Sukses Makmur",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "SMGR.JK",
    ticker: "SMGR.JK",
    label: "Semen Indonesia",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "ANTM.JK",
    ticker: "ANTM.JK",
    label: "Aneka Tambang (Antam)",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "PTBA.JK",
    ticker: "PTBA.JK",
    label: "Bukit Asam",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "ADRO.JK",
    ticker: "ADRO.JK",
    label: "Adaro Energy",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "EXCL.JK",
    ticker: "EXCL.JK",
    label: "XL Axiata",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "PGAS.JK",
    ticker: "PGAS.JK",
    label: "Perusahaan Gas Negara",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "JSMR.JK",
    ticker: "JSMR.JK",
    label: "Jasa Marga",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "WSKT.JK",
    ticker: "WSKT.JK",
    label: "Waskita Karya",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "PWON.JK",
    ticker: "PWON.JK",
    label: "Pakuwon Jati",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },

  // ── US Stocks ────────────────────────────────────────────────────────────────
  // Note: US stock prices from Yahoo Finance are in USD — converted to IDR in fetch-prices
  {
    identifier: "AAPL",
    ticker: "AAPL",
    label: "Apple",
    type: "STOCK",
    exchange: "NASDAQ",
    unit: "share",
  },
  {
    identifier: "MSFT",
    ticker: "MSFT",
    label: "Microsoft",
    type: "STOCK",
    exchange: "NASDAQ",
    unit: "share",
  },
  {
    identifier: "GOOGL",
    ticker: "GOOGL",
    label: "Alphabet (Google)",
    type: "STOCK",
    exchange: "NASDAQ",
    unit: "share",
  },
  {
    identifier: "NVDA",
    ticker: "NVDA",
    label: "NVIDIA",
    type: "STOCK",
    exchange: "NASDAQ",
    unit: "share",
  },
  {
    identifier: "AMZN",
    ticker: "AMZN",
    label: "Amazon",
    type: "STOCK",
    exchange: "NASDAQ",
    unit: "share",
  },
  {
    identifier: "META",
    ticker: "META",
    label: "Meta Platforms",
    type: "STOCK",
    exchange: "NASDAQ",
    unit: "share",
  },
  {
    identifier: "TSLA",
    ticker: "TSLA",
    label: "Tesla",
    type: "STOCK",
    exchange: "NASDAQ",
    unit: "share",
  },
  {
    identifier: "BRK-B",
    ticker: "BRK-B",
    label: "Berkshire Hathaway B",
    type: "STOCK",
    exchange: "NYSE",
    unit: "share",
  },
  {
    identifier: "JPM",
    ticker: "JPM",
    label: "JPMorgan Chase",
    type: "STOCK",
    exchange: "NYSE",
    unit: "share",
  },
  {
    identifier: "V",
    ticker: "V",
    label: "Visa",
    type: "STOCK",
    exchange: "NYSE",
    unit: "share",
  },

  // ── Crypto ───────────────────────────────────────────────────────────────────
  // CoinGecko IDs (not symbols) are used as identifiers
  {
    identifier: "bitcoin",
    ticker: "bitcoin",
    label: "Bitcoin",
    type: "CRYPTO",
    unit: "coin",
  },
  {
    identifier: "ethereum",
    ticker: "ethereum",
    label: "Ethereum",
    type: "CRYPTO",
    unit: "coin",
  },
];

export const PREDEFINED_STOCKS_ASSETS: PredefinedAsset[] = [
  // ── IDX Blue Chips ───────────────────────────────────────────────────────────
  {
    identifier: "BBCA.JK",
    ticker: "BBCA.JK",
    label: "Bank Central Asia",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "BBRI.JK",
    ticker: "BBRI.JK",
    label: "Bank Rakyat Indonesia",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "BMRI.JK",
    ticker: "BMRI.JK",
    label: "Bank Mandiri",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "TLKM.JK",
    ticker: "TLKM.JK",
    label: "Telkom Indonesia",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "ASII.JK",
    ticker: "ASII.JK",
    label: "Astra International",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "GOTO.JK",
    ticker: "GOTO.JK",
    label: "GoTo Gojek Tokopedia",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "BYAN.JK",
    ticker: "BYAN.JK",
    label: "Bayan Resources",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "UNVR.JK",
    ticker: "UNVR.JK",
    label: "Unilever Indonesia",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "ICBP.JK",
    ticker: "ICBP.JK",
    label: "Indofood CBP",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "KLBF.JK",
    ticker: "KLBF.JK",
    label: "Kalbe Farma",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "INDF.JK",
    ticker: "INDF.JK",
    label: "Indofood Sukses Makmur",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "SMGR.JK",
    ticker: "SMGR.JK",
    label: "Semen Indonesia",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "ANTM.JK",
    ticker: "ANTM.JK",
    label: "Aneka Tambang (Antam)",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "PTBA.JK",
    ticker: "PTBA.JK",
    label: "Bukit Asam",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "ADRO.JK",
    ticker: "ADRO.JK",
    label: "Adaro Energy",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "EXCL.JK",
    ticker: "EXCL.JK",
    label: "XL Axiata",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "PGAS.JK",
    ticker: "PGAS.JK",
    label: "Perusahaan Gas Negara",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "JSMR.JK",
    ticker: "JSMR.JK",
    label: "Jasa Marga",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "WSKT.JK",
    ticker: "WSKT.JK",
    label: "Waskita Karya",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "PWON.JK",
    ticker: "PWON.JK",
    label: "Pakuwon Jati",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },

  // ── US Stocks ────────────────────────────────────────────────────────────────
  // Note: US stock prices from Yahoo Finance are in USD — converted to IDR in fetch-prices
  {
    identifier: "AAPL",
    ticker: "AAPL",
    label: "Apple",
    type: "STOCK",
    exchange: "NASDAQ",
    unit: "share",
  },
  {
    identifier: "MSFT",
    ticker: "MSFT",
    label: "Microsoft",
    type: "STOCK",
    exchange: "NASDAQ",
    unit: "share",
  },
  {
    identifier: "GOOGL",
    ticker: "GOOGL",
    label: "Alphabet (Google)",
    type: "STOCK",
    exchange: "NASDAQ",
    unit: "share",
  },
  {
    identifier: "NVDA",
    ticker: "NVDA",
    label: "NVIDIA",
    type: "STOCK",
    exchange: "NASDAQ",
    unit: "share",
  },
  {
    identifier: "AMZN",
    ticker: "AMZN",
    label: "Amazon",
    type: "STOCK",
    exchange: "NASDAQ",
    unit: "share",
  },
  {
    identifier: "META",
    ticker: "META",
    label: "Meta Platforms",
    type: "STOCK",
    exchange: "NASDAQ",
    unit: "share",
  },
  {
    identifier: "TSLA",
    ticker: "TSLA",
    label: "Tesla",
    type: "STOCK",
    exchange: "NASDAQ",
    unit: "share",
  },
  {
    identifier: "BRK-B",
    ticker: "BRK-B",
    label: "Berkshire Hathaway B",
    type: "STOCK",
    exchange: "NYSE",
    unit: "share",
  },
  {
    identifier: "JPM",
    ticker: "JPM",
    label: "JPMorgan Chase",
    type: "STOCK",
    exchange: "NYSE",
    unit: "share",
  },
  {
    identifier: "V",
    ticker: "V",
    label: "Visa",
    type: "STOCK",
    exchange: "NYSE",
    unit: "share",
  },
];

export const PREDEFINED_CRYPTO_ASSETS: PredefinedAsset[] = [
  {
    identifier: "bitcoin",
    ticker: "bitcoin",
    label: "Bitcoin",
    type: "CRYPTO",
    unit: "coin",
  },
  {
    identifier: "ethereum",
    ticker: "ethereum",
    label: "Ethereum",
    type: "CRYPTO",
    unit: "coin",
  },
];

export const TYPE_ICON = {
  STOCK: {
    icon: TrendingUp,
    className: "text-chart-5 bg-chart-5/12",
  },
  CRYPTO: {
    icon: Bitcoin,
    className: "text-amber bg-amber-soft",
  },
  GOLD: {
    icon: Coins,
    className: "text-sand bg-sand/12",
  },
  OTHER: {
    icon: CircleDollarSign,
    className: "text-muted-foreground bg-surface-2",
  },
} as const;

export const FREQUENCY_OPTIONS: { label: string; value: Frequency }[] = [
  { label: "Daily", value: Frequency.DAILY },
  { label: "Weekly", value: Frequency.WEEKLY },
  { label: "Monthly", value: Frequency.MONTHLY },
  { label: "Custom", value: Frequency.CUSTOM },
];

export const PRO_FEATURES = [
  { label: "Unlimited assets", included: true },
  { label: "Unlimited investments", included: true },
  { label: "Unlimited Scheduled Transactions", included: true },
  { label: "Goals tracking", included: true },
  { label: "AI insights on goals", included: true },
  { label: "Spending forecasts", included: false },
  { label: "Full AI insights", included: false },
  { label: "CSV export", included: false },
  { label: "Email digests", included: false },
];

export const ELITE_FEATURES = [
  { label: "Unlimited assets", included: true },
  { label: "Unlimited investments", included: true },
  { label: "Unlimited Scheduled Transactions", included: true },
  { label: "Goals tracking", included: true },
  { label: "AI insights on goals", included: true },
  { label: "Spending forecasts", included: true },
  { label: "Full AI insights", included: true },
  { label: "CSV export", included: true },
  { label: "Email digests", included: true },
];

export const FREE_LIMITS =
  "3 assets, 3 investments and 5 Scheduled Transactions · No goals · No AI";

export const TNC_CONTENT = `
SYARAT DAN KETENTUAN PENGGUNAAN CLARUS

Terakhir diperbarui: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}

Dengan menggunakan aplikasi Clarus ("Layanan"), Anda menyetujui syarat dan ketentuan berikut yang dibuat oleh PT Anrico Solution ("Perusahaan", "kami").

1. PENERIMAAN SYARAT
Dengan mendaftar dan menggunakan Clarus, Anda menyatakan bahwa Anda telah membaca, memahami, dan menyetujui Syarat dan Ketentuan ini. Jika Anda tidak menyetujui, harap hentikan penggunaan Layanan.

2. DESKRIPSI LAYANAN
Clarus adalah aplikasi pencatatan keuangan pribadi yang membantu pengguna melacak pemasukan, pengeluaran, aset, investasi, dan tujuan keuangan. Layanan tersedia dalam tiga tingkatan: Free, Pro, dan Elite.

3. AKUN PENGGUNA
- Anda bertanggung jawab atas kerahasiaan akun dan kata sandi Anda.
- Anda bertanggung jawab atas seluruh aktivitas yang terjadi di bawah akun Anda.
- Anda wajib segera memberitahu kami jika terjadi penggunaan akun tanpa izin.
- Kami berhak menonaktifkan akun yang melanggar ketentuan ini.

4. LANGGANAN DAN PEMBAYARAN
- Layanan Free tersedia tanpa biaya dengan fitur terbatas.
- Layanan Pro dan Elite memerlukan pembayaran berlangganan tahunan.
- Biaya berlangganan Pro adalah Rp 299.000 per tahun dan Elite Rp 349.000 per tahun.
- Pembayaran diproses melalui Midtrans, gateway pembayaran yang telah berlisensi di Indonesia.
- Berlangganan aktif selama 1 (satu) tahun sejak tanggal pembayaran.
- Tidak ada pengembalian dana (refund) untuk periode berlangganan yang sudah berjalan.
- Perusahaan berhak mengubah harga langganan dengan pemberitahuan 30 hari sebelumnya.

5. PENGGUNAAN YANG DIIZINKAN
Anda setuju untuk menggunakan Layanan hanya untuk tujuan yang sah dan sesuai dengan ketentuan ini. Anda tidak diperkenankan:
- Menggunakan Layanan untuk aktivitas ilegal atau penipuan.
- Mencoba mengakses sistem atau data pengguna lain tanpa izin.
- Menyebarkan malware atau kode berbahaya melalui Layanan.
- Melakukan reverse engineering terhadap aplikasi.

6. DATA KEUANGAN
- Data keuangan yang Anda masukkan adalah milik Anda sepenuhnya.
- Kami tidak menggunakan data keuangan Anda untuk tujuan komersial pihak ketiga.
- Kami menggunakan data secara agregat dan anonim untuk meningkatkan Layanan.
- Fitur AI menggunakan data Anda secara sementara untuk menghasilkan wawasan dan tidak disimpan oleh penyedia AI.

7. BATASAN TANGGUNG JAWAB
Clarus adalah alat bantu pencatatan keuangan, bukan penasihat keuangan berlisensi. Kami tidak bertanggung jawab atas:
- Keputusan keuangan yang Anda buat berdasarkan data di aplikasi.
- Kehilangan data akibat force majeure atau gangguan teknis di luar kendali kami.
- Kerugian tidak langsung yang timbul dari penggunaan Layanan.

8. PENGHENTIAN LAYANAN
Kami berhak menghentikan atau menangguhkan akses Anda ke Layanan jika Anda melanggar ketentuan ini, tanpa pemberitahuan sebelumnya dalam kasus pelanggaran serius.

9. PERUBAHAN KETENTUAN
Kami dapat memperbarui Syarat dan Ketentuan ini sewaktu-waktu. Perubahan material akan diberitahukan melalui email atau notifikasi dalam aplikasi. Penggunaan berkelanjutan setelah perubahan dianggap sebagai penerimaan ketentuan baru.

10. HUKUM YANG BERLAKU
Syarat dan Ketentuan ini diatur oleh hukum Republik Indonesia. Setiap sengketa diselesaikan melalui Pengadilan Negeri Jakarta Selatan.

11. KONTAK
PT Anrico Solution
Email: support@clarus.id
`;

export const PRIVACY_CONTENT = `
KEBIJAKAN PRIVASI CLARUS

Terakhir diperbarui: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}

PT Anrico Solution ("Perusahaan", "kami") berkomitmen melindungi privasi pengguna Clarus sesuai dengan Undang-Undang Perlindungan Data Pribadi No. 27 Tahun 2022 (UU PDP).

1. DATA YANG KAMI KUMPULKAN

a. Data Identitas
- Nama lengkap
- Alamat email
- Foto profil (dari Google OAuth)

b. Data Keuangan
- Transaksi pemasukan dan pengeluaran yang Anda catat
- Data aset dan investasi yang Anda masukkan
- Tujuan keuangan (goals) yang Anda buat

c. Data Teknis
- Alamat IP
- Jenis perangkat dan browser
- Log aktivitas penggunaan aplikasi
- Tanggal dan waktu akses

2. CARA KAMI MENGUMPULKAN DATA
- Langsung dari Anda saat mendaftar dan menggunakan aplikasi
- Melalui Google OAuth saat Anda masuk menggunakan akun Google
- Secara otomatis melalui cookie dan teknologi pelacakan serupa

3. TUJUAN PENGGUNAAN DATA
Kami menggunakan data Anda untuk:
- Menyediakan dan mengoperasikan Layanan Clarus
- Memproses pembayaran langganan
- Mengirimkan ringkasan keuangan bulanan (jika diaktifkan)
- Menghasilkan wawasan AI atas permintaan Anda
- Meningkatkan kualitas dan keamanan Layanan
- Memenuhi kewajiban hukum yang berlaku

4. BERBAGI DATA DENGAN PIHAK KETIGA
Kami tidak menjual data pribadi Anda. Data hanya dibagikan kepada:

a. Penyedia Infrastruktur
- Vercel Inc. — hosting dan deployment aplikasi
- Neon Technologies — penyimpanan database terenkripsi

b. Layanan Autentikasi
- Google LLC — autentikasi masuk via OAuth

c. Pemrosesan Pembayaran
- Midtrans (PT Midtrans) — pemrosesan pembayaran langganan

d. Layanan AI
- Anthropic, PBC — pemrosesan wawasan keuangan (data tidak disimpan permanen)

e. Kewajiban Hukum
- Penegak hukum atau otoritas berwenang jika diwajibkan oleh hukum

5. PENYIMPANAN DATA
- Data disimpan di server yang berlokasi di wilayah Asia Pasifik
- Data dienkripsi saat transit (TLS) dan saat penyimpanan
- Data akun aktif disimpan selama akun masih aktif
- Setelah penghapusan akun, data dihapus dalam 30 hari

6. HAK-HAK ANDA (Sesuai UU PDP No. 27/2022)
Anda memiliki hak untuk:
- Mengakses data pribadi yang kami simpan tentang Anda
- Memperbarui atau mengoreksi data yang tidak akurat
- Meminta penghapusan data pribadi Anda
- Menarik persetujuan pemrosesan data kapan saja
- Mengajukan pengaduan kepada Komnas PDP

Untuk menggunakan hak-hak ini, hubungi kami di support@clarus.id

7. KEAMANAN DATA
Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang sesuai, termasuk enkripsi data, kontrol akses, dan audit keamanan berkala. Namun, tidak ada sistem yang 100% aman — kami mendorong Anda untuk menjaga kerahasiaan kredensial akun Anda.

8. COOKIE DAN TEKNOLOGI SERUPA
Kami menggunakan cookie sesi untuk autentikasi dan cookie preferensi untuk menyimpan pengaturan Anda. Anda dapat mengatur browser untuk menolak cookie, namun hal ini dapat mempengaruhi fungsionalitas Layanan.

9. PERUBAHAN KEBIJAKAN PRIVASI
Kami dapat memperbarui kebijakan ini sewaktu-waktu. Perubahan signifikan akan diberitahukan melalui email atau notifikasi dalam aplikasi minimal 14 hari sebelum berlaku.

10. KONTAK PENGENDALI DATA
PT Anrico Solution
Email: privacy@clarus.id
`;
