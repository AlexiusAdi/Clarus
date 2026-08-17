/**
 * Legal copy shown during onboarding. Kept out of constants/index.ts so that
 * importing a plan limit or an icon map does not drag several hundred lines of
 * prose into the same module graph.
 */
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
