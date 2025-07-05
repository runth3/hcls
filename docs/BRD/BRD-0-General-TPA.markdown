Business Requirement Document (BRD) - Aplikasi Third Party Administration (TPA)
Tanggal: 1 Juli 2025Versi: 5.0 (Production Implementation)Dibuat oleh: Tim PengembanganDisetujui oleh: ✅ COMPLETED - Production ReadyProject Start: 1 Juli 2025Current Status: ✅ PHASE 1-5 COMPLETED - User, Member, Policy, Claims, Provider Management LIVE

1. Pendahuluan
1.1 Tujuan Dokumen
Dokumen ini mendefinisikan kebutuhan bisnis untuk aplikasi Third Party Administration (TPA) berbasis web menggunakan Next.js dengan arsitektur modular. Aplikasi ini dirancang untuk mengelola administrasi asuransi kesehatan secara efisien dengan fitur-fitur berikut:

Bulk upload untuk memasukkan data client, member, dan polis dalam jumlah besar, sesuai praktik umum di Indonesia.
Workflow membership terintegrasi: pendaftaran client, pembuatan polis, pengajuan klaim, validasi provider, hingga pembayaran.
Dukungan untuk jenis benefit: indemnity, managed care, Administrative Services Only (ASO), dan value-based care.
Fitur khusus TPA: Coordination of Benefits (COB), co-payment, deductibles, out-of-pocket maximums, reinsurance, stop-loss, subrogation, dan analitik berbasis AI/ML.
Ekstensi: portal untuk client, member, provider, statusehat, clinical pathway, aplikasi mobile, serta integrasi dengan WhatsApp dan sistem pembayaran lokal.
Kepatuhan terhadap regulasi lokal (UU PDP) dan internasional (HIPAA, HL7/FHIR).
Dukungan untuk kompleksitas bisnis TPA: hierarki client, product architecture, dan enrollment scenarios.

Dokumen ini berfungsi sebagai panduan tingkat tinggi, dengan spesifikasi detail untuk setiap modul diuraikan dalam BRD terpisah.
1.2 Latar Belakang
Pengelolaan asuransi kesehatan di Indonesia melibatkan volume data besar, sehingga bulk upload melalui CSV/Excel menjadi metode utama untuk memasukkan data client (perusahaan), member (individu), dan polis. Aplikasi ini menyediakan platform terpusat untuk mengelola hubungan antara client, sub-client, HR manager, member, dependent, provider, broker/agent, dan auditor, dengan fitur seperti statusehat, clinical pathway, dan predictive analytics untuk mendukung value-based care. Integrasi dengan sistem lokal seperti BPJS Kesehatan, e-wallet (GoPay, OVO, DANA), dan WhatsApp memastikan relevansi dengan pasar Indonesia. Sistem ini telah diuji dengan simulasi perusahaan nyata (Bank Mandiri, BUMN, Astra Group) dan mendukung skala 200.000+ karyawan.
1.3 Ruang Lingkup
Aplikasi mencakup modul inti dan ekstensi berikut:

Modul Inti (LIVE):
Manajemen Pengguna: Autentikasi, otorisasi, dan manajemen peran dengan 9 peran pengguna dan dasbor dinamis.
Manajemen Anggota: Pengelolaan hierarki client, product catalog, dan siklus hidup member (termasuk dependent dan COBRA).
Manajemen Polis: Pembuatan, pengelolaan, dan perubahan massal polis dengan arsitektur benefit fleksibel.
Manajemen Klaim: Pengajuan, validasi, dan pelacakan klaim dengan COB, co-payment, dan clinical pathway.
Manajemen Penyedia: Pengelolaan jaringan penyedia, capitation, dan data medis.
Manajemen Keuangan: Siap untuk pengembangan (premium billing, pembayaran klaim, integrasi e-wallet).
Analitik dan Pelaporan: Dasbor dan laporan untuk pengambilan keputusan (direncanakan).
Integrasi Eksternal: Sinkronisasi dengan sistem EHR dan BPJS menggunakan HL7/FHIR (direncanakan).
Notifikasi: Pemberitahuan melalui email, SMS, push, dan WhatsApp (direncanakan).
Kepatuhan dan Regulasi: Audit log dan kepatuhan UU PDP/HIPAA (direncanakan).
Manajemen Dokumen: Penyimpanan dokumen klaim (direncanakan).


Modul Ekstensi (Direncanakan):
Portal Client: Antarmuka untuk client mengelola anggota dan laporan.
Portal Member: Antarmuka untuk member mengelola polis, klaim, dan statusehat.
Portal Provider: Antarmuka untuk penyedia mengunggah data medis dan melihat pembayaran.
Statusehat: Pemantauan kesehatan anggota dengan gamifikasi.
Clinical Pathway: Validasi prosedur medis berdasarkan diagnosis.
Real-time Eligibility Verification: Verifikasi kelayakan anggota secara real-time.
Fraud Detection Engine: Deteksi penipuan berbasis AI/ML.
Predictive Analytics: Analisis prediktif untuk risk assessment dan population health.
Mobile Applications: Aplikasi native iOS dan Android.
Telehealth Integration: Integrasi dengan platform telemedicine lokal.
Wellness Management: Program wellness dan preventive care tracking.
WhatsApp Integration: Notifikasi dan pre-authorization melalui WhatsApp Business API.
Local Payment Integration: Integrasi dengan e-wallet lokal (GoPay, OVO, DANA).


Fitur Khusus TPA:
Indemnity: Klaim berdasarkan biaya aktual tanpa batasan jaringan.
Managed Care: Klaim dalam jaringan penyedia dengan rujukan.
ASO: Administrasi untuk rencana yang didanai sendiri.
Value-Based Care: Pembayaran berdasarkan hasil kesehatan.
Coordination of Benefits (COB): Pengelolaan klaim dengan beberapa polis.
Co-payment dan Deductibles: Penghitungan kontribusi member.
Out-of-Pocket Maximums: Batas maksimum biaya member.
Reinsurance dan Stop-Loss: Perlindungan finansial untuk klaim besar.
Subrogation: Pemulihan biaya dari pihak ketiga.
Mass Policy Change: Perubahan polis massal.
Referral/Authorization: Validasi rujukan dan otorisasi.
Premium Billing: Penagihan premi berbasis grup/individu.
Capitation: Pembayaran tetap per anggota untuk penyedia.
First DOS Accumulation: Pelacakan akumulasi klaim berdasarkan tanggal layanan pertama.
Real-time Benefit Verification: Verifikasi manfaat instan.
AI-powered Claims Processing: Pemrosesan klaim otomatis dengan ML.
Population Health Analytics: Analisis kesehatan populasi.
Risk Stratification: Stratifikasi risiko anggota.
Care Gap Analysis: Identifikasi kesenjangan perawatan.
Provider Performance Scoring: Penilaian kinerja provider.
Member Engagement Tools: Gamifikasi untuk keterlibatan anggota.



1.4 Pemangku Kepentingan

TPA Administrator: Mengelola sistem, hierarki client, product catalog, dan kepatuhan.
Client (Corporate): Perusahaan yang membeli coverage untuk karyawan.
Sub-Client: Divisi, cabang, atau unit bisnis dengan benefit arrangements terpisah.
HR Manager: Mengelola pendaftaran karyawan, kelayakan, dan life events.
Member (Employee): Individu yang enrolled dalam benefit plans.
Dependent: Anggota keluarga yang covered di bawah polis karyawan.
Broker/Agent: Perantara penjualan yang membantu akuisisi dan layanan client.
Provider: Fasilitas kesehatan dan profesional yang memberikan layanan.
Regulator: Otoritas pemerintah (OJK, UU PDP, HIPAA) untuk kepatuhan.
Auditor: Auditor internal/eksternal untuk kepatuhan dan akurasi finansial.


2. Tujuan Bisnis
2.1 Tujuan Utama

Mengotomatisasi administrasi asuransi kesehatan dengan bulk upload, mengurangi waktu input data hingga 80% dibandingkan manual.
Mendukung model benefit (indemnity, managed care, ASO, value-based care) untuk fleksibilitas produk.
Mengintegrasikan workflow membership yang mulus dari pendaftaran hingga pembayaran.
Menyediakan portal dan aplikasi mobile untuk transparansi bagi client, member, dan provider.
Memanfaatkan AI/ML untuk deteksi penipuan, analisis prediktif, dan pemrosesan klaim.
Memastikan kepatuhan terhadap regulasi lokal (UU PDP) dan internasional (HIPAA, HL7/FHIR).
Mendukung kompleksitas bisnis TPA dengan hierarki client, product architecture, dan enrollment scenarios.

2.2 Manfaat Bisnis

Efisiensi Operasional: Otomatisasi bulk upload, perubahan massal, dan pemrosesan klaim mengurangi tenaga kerja manual hingga 90%.
Fleksibilitas Produk: Arsitektur produk mendukung desain benefit kompleks dan kustomisasi client.
Skalabilitas Enterprise: Pengelolaan hierarki client untuk korporasi besar dengan banyak anak perusahaan.
Pengalaman Pengguna: Portal self-service dan aplikasi mobile meningkatkan kepuasan dengan target NPS > 70.
Kepatuhan Otomatis: Kepatuhan UU PDP, HIPAA, dan standar industri dengan audit trails.
Manajemen Biaya: Analitik prediktif dan deteksi penipuan untuk pengendalian biaya.
Diferensiasi Pasar: Fitur AI, integrasi modern, dan dukungan pasar lokal Indonesia.
Pertumbuhan Pendapatan: Dukungan untuk struktur client kompleks dan penawaran produk premium.


3. Spesifikasi Fungsional
3.1 Modul dan Fitur
3.1.1 Modul Manajemen Pengguna (✅ LIVE)

Fungsi: Mengelola autentikasi, otorisasi, dan peran pengguna.
Fitur:
Registrasi dan login untuk 9 peran (TPA Admin, Client, Sub-Client, HR Manager, Member, Dependent, Broker/Agent, Provider, Auditor).
Role-Based Access Control (RBAC) dengan dasbor dinamis per peran.
Autentikasi hybrid menggunakan NextAuth.js dengan pelacakan login gagal dan penguncian akun.
Aksesibilitas tinggi (tombol pintasan, navigasi tab) sesuai WCAG 2.1.
Audit trails untuk semua aksi pengguna.


Kegunaan: Memastikan akses aman dan terpersonalisasi dengan antarmuka inklusif.

3.1.2 Modul Manajemen Anggota (✅ LIVE)

Fungsi: Mengelola data client, sub-client, dan member dengan hierarki kompleks.
Fitur:
Client Hierarchy Management: Struktur multi-level (Parent → Sub-Client → Sub-Sub-Client) dengan aturan inheritance.
Product & Benefit Management: Katalog produk dengan benefit plans (inpatient, outpatient, dental, dll.) dan aturan kompleks.
Advanced Member Management: Pengelolaan member tiers, dependent tracking, COBRA administration, dan life event processing (pernikahan, kelahiran, perceraian).
Bulk Operations: Bulk upload dengan validasi NIK (16 digit), nomor telepon (+62), dan duplikasi email.
Eligibility Management: Verifikasi kelayakan dengan dukungan real-time (terintegrasi dengan sistem HR).
Integrasi: Sinkronisasi dengan sistem HR dan payroll untuk status kepegawaian.


Kegunaan: Mendukung kompleksitas bisnis TPA enterprise dengan skala 200.000+ karyawan.

3.1.3 Modul Manajemen Polis (✅ LIVE)

Fungsi: Membuat, mengelola, dan memperbarui polis dengan arsitektur benefit fleksibel.
Fitur:
Advanced Policy Structure: Hierarki benefit plans dengan inheritance dan override.
Flexible Benefit Configuration: Aturan multi-layer (coverage, financial, utilization, timing).
Plan Comparison Engine: Rekomendasi polis otomatis berdasarkan profil member.
Mass Policy Operations: Perubahan massal dengan analisis dampak dan alur persetujuan.
Benefit Types Support: Indemnity, Managed Care, ASO, Value-Based Care dengan aturan kompleks.
Integrasi: Sinkronisasi dengan Manajemen Anggota untuk enrollment dan kelayakan.


Kegunaan: Memberikan fleksibilitas maksimal dalam desain produk dan administrasi benefit.

3.1.4 Modul Manajemen Klaim (✅ LIVE)

Fungsi: Mengelola pengajuan, validasi, dan pelacakan klaim.
Fitur:
Pengajuan klaim oleh member/provider dengan dokumen pendukung.
Validasi klaim berdasarkan benefit polis, clinical pathway, rujukan/otorisasi, COB, co-payment, deductibles.
Coordination of Benefits (COB): Pengelolaan klaim dengan beberapa polis.
Co-payment dan Deductibles: Penghitungan otomatis kontribusi member.
Out-of-Pocket Maximums: Pemantauan batas biaya member.
First DOS Accumulation: Pelacakan akumulasi klaim berdasarkan tanggal layanan pertama.
Subrogation: Pemulihan biaya dari pihak ketiga.
Status klaim: Submitted, In Review, Approved, Rejected, Paid.
Integrasi dengan clinical pathway untuk validasi prosedur medis.


Kegunaan: Memastikan proses klaim akurat, transparan, dan efisien.

3.1.5 Modul Manajemen Penyedia (✅ LIVE)

Fungsi: Mengelola jaringan penyedia dan data medis.
Fitur:
Pendaftaran penyedia dengan verifikasi kredensial.
Pengunggahan data medis (diagnosis, prosedur) untuk klaim.
Capitation: Pembayaran tetap per anggota per periode.
Provider Discount: Penetapan diskon layanan penyedia.
Provider Performance Scoring: Penilaian berbasis outcome dan biaya.
Portal penyedia untuk self-service.


Kegunaan: Mendukung hubungan penyedia dan validasi data medis.

3.1.6 Modul Manajemen Keuangan (📋 Ready for Development)

Fungsi: Mengelola transaksi keuangan untuk pasar Indonesia.
Fitur:
Premium Billing: Model penagihan grup, individu, berbasis gaji, composite, tiered, ASO.
Claims Payment: Pemrosesan pembayaran otomatis ke penyedia dan member.
Indonesian Payment Integration: E-wallet (GoPay, OVO, DANA), virtual account, QRIS.
Reinsurance & Stop-Loss: Manajemen risiko untuk klaim besar.
Payment Gateways: Integrasi dengan Midtrans, Xendit, DOKU.
Tax Compliance: Validasi PPh 21, PPN, NPWP untuk pasar Indonesia.
Financial Reporting: Dasbor real-time, manajemen arus kas, laporan regulasi.
Mobile Payment App: Pembayaran self-service untuk member dan penyedia.
Fraud Detection: Pemantauan pembayaran mencurigakan secara real-time.
Multi-Currency: IDR utama dengan dukungan USD.


Kegunaan: Otomatisasi keuangan dengan kepatuhan pasar Indonesia dan pengurangan 90% proses manual.

3.1.7 Modul Analitik dan Pelaporan (📋 Planned)

Fungsi: Menyediakan analitik untuk pengambilan keputusan.
Fitur:
Dasbor dengan metrik (klaim, pembayaran, tren kesehatan).
Population Health Analytics: Analisis tren kesehatan untuk value-based care.
Risk Stratification: Stratifikasi risiko anggota.
Care Gap Analysis: Identifikasi kesenjangan perawatan.
Laporan khusus untuk client, regulator, dan manajemen.


Kegunaan: Memberikan wawasan untuk efisiensi dan hasil kesehatan.

3.1.8 Modul Integrasi Eksternal (📋 Planned)

Fungsi: Menghubungkan aplikasi dengan sistem eksternal.
Fitur:
Sinkronisasi dengan sistem EHR menggunakan HL7/FHIR.
Impor kode medis (ICD-10, CPT) untuk validasi klaim.
Integrasi dengan BPJS Kesehatan untuk koordinasi manfaat.
Sinkronisasi dengan sistem HR dan payroll.


Kegunaan: Memastikan interoperabilitas dengan sistem eksternal.

3.1.9 Modul Notifikasi dan Komunikasi (📋 Planned)

Fungsi: Mengirim pemberitahuan tentang status proses.
Fitur:
Notifikasi melalui email, SMS, push, dan WhatsApp.
Pemberitahuan hasil bulk upload (sukses, error, jumlah data).
Chatbot WhatsApp untuk dukungan pelanggan.


Kegunaan: Meningkatkan transparansi dan keterlibatan pengguna.

3.1.10 Modul Kepatuhan dan Regulasi (📋 Planned)

Fungsi: Memastikan kepatuhan terhadap regulasi dan deteksi penipuan.
Fitur:
Audit log untuk semua transaksi.
Validasi kode ICD-10 untuk diagnosis.
Pengelolaan data pribadi sesuai UU PDP (hak akses, hak dihapus).
Deteksi penipuan berbasis AI/ML.


Kegunaan: Melindungi data dan memenuhi regulasi.

3.1.11 Modul Manajemen Dokumen (📋 Planned)

Fungsi: Mengelola dokumen pendukung klaim.
Fitur:
Pengunggahan dan penyimpanan dokumen (faktur, laporan medis).
Pencarian dan pengelompokan dokumen berdasarkan klaim.


Kegunaan: Memudahkan akses dan verifikasi dokumen.

3.1.12 Modul Statusehat (📋 Planned)

Fungsi: Memantau kesehatan anggota.
Fitur:
Dasbor kesehatan dengan metrik (frekuensi klaim, diagnosis berulang).
Rekomendasi kesehatan dan gamifikasi untuk keterlibatan.


Kegunaan: Mendukung value-based care dan pencegahan penyakit.

3.1.13 Modul Clinical Pathway (📋 Planned)

Fungsi: Memvalidasi prosedur medis berdasarkan diagnosis.
Fitur:
Definisi jalur klinis untuk kode ICD-10.
Validasi otomatis prosedur klaim.


Kegunaan: Memastikan klaim sesuai standar medis.

3.1.14 Portal Client (📋 Planned)

Fungsi: Antarmuka untuk client mengelola anggota dan laporan.
Fitur:
Dasbor dengan ringkasan anggota, polis, dan utilisasi klaim.
Bulk upload anggota baru.
Laporan khusus (tren klaim, biaya).


Kegunaan: Meningkatkan otonomi client.

3.1.15 Portal Member (📋 Planned)

Fungsi: Antarmuka untuk member mengelola polis dan klaim.
Fitur:
Pemilihan polis, pengajuan klaim, pelacakan status.
Dasbor statusehat dengan gamifikasi.


Kegunaan: Memberikan transparansi dan keterlibatan.

3.1.16 Portal Provider (📋 Planned)

Fungsi: Antarmuka untuk penyedia mengunggah data medis.
Fitur:
Pengunggahan diagnosis dan prosedur.
Ringkasan pembayaran (klaim, capitation).


Kegunaan: Memudahkan penyedia berinteraksi dengan sistem.

3.1.17 Real-time Eligibility Verification (📋 Planned)

Fungsi: Verifikasi kelayakan anggota secara real-time.
Fitur:
API real-time untuk cek kelayakan.
Integrasi dengan sistem HR untuk status kepegawaian.
Caching untuk performa optimal.


Kegunaan: Mengurangi klaim ditolak dan mempercepat proses.

3.1.18 Fraud Detection Engine (📋 Planned)

Fungsi: Deteksi penipuan menggunakan AI/ML.
Fitur:
Analisis pola klaim untuk anomali.
Skoring aktivitas mencurigakan dan pemberitahuan.
Integrasi dengan database blacklist.


Kegunaan: Mengurangi kerugian akibat penipuan.

3.1.19 Predictive Analytics (📋 Planned)

Fungsi: Analisis prediktif untuk risk assessment.
Fitur:
Prediksi biaya perawatan kesehatan.
Stratifikasi risiko anggota.
Analisis tren kesehatan populasi.
Identifikasi kesenjangan perawatan.


Kegunaan: Mendukung value-based care dan manajemen risiko.

3.1.20 Mobile Applications (📋 Planned)

Fungsi: Aplikasi native iOS dan Android.
Fitur:
Aplikasi member: Pengajuan klaim, informasi polis, statusehat.
Aplikasi provider: Pemrosesan klaim, data medis.
Kemampuan offline dan autentikasi biometrik.


Kegunaan: Meningkatkan aksesibilitas dan pengalaman pengguna.

3.1.21 Telehealth Integration (📋 Planned)

Fungsi: Integrasi dengan platform telemedicine.
Fitur:
Integrasi dengan Halodoc, Alodokter.
Pemrosesan klaim konsultasi virtual.
Pengelolaan resep digital.


Kegunaan: Mendukung layanan kesehatan modern.

3.1.22 Wellness Management (📋 Planned)

Fungsi: Mengelola program wellness.
Fitur:
Alat penilaian risiko kesehatan.
Pelacakan program wellness dengan reward.
Pengingat perawatan pencegahan.


Kegunaan: Meningkatkan hasil kesehatan.

3.1.23 WhatsApp Integration (📋 Planned)

Fungsi: Komunikasi melalui WhatsApp Business API.
Fitur:
Pre-authorization, status klaim, pengingat janji.
Chatbot dukungan pelanggan.
Pengunggahan dokumen via WhatsApp.


Kegunaan: Meningkatkan keterlibatan pengguna.

3.1.24 Local Payment Integration (📋 Planned)

Fungsi: Integrasi dengan sistem pembayaran lokal.
Fitur:
E-wallet (GoPay, OVO, DANA, ShopeePay).
Virtual account dan QRIS.
Opsi pembayaran cicilan.


Kegunaan: Fleksibilitas pembayaran lokal.


3.2 Workflow Membership
Alur Kerja:

Penambahan Client:
Admin/client mengunggah data client (CSV: nama, email, nomor telepon, NIK).
Validasi: NIK (16 digit), nomor telepon (+62), duplikasi email.


Pembuatan Polis:
Admin mengunggah data polis (CSV: nomor polis, client ID, manfaat, batas).
Validasi: Nomor polis unik, manfaat sesuai standar.
Perubahan massal dengan analisis dampak.


Penambahan Member:
Client/admin mengunggah data member (CSV: client ID, nama, nomor polis, NIK).
Validasi: Client ID, nomor polis, NIK.
ID anggota otomatis.


Pemilihan Polis:
Member memilih polis melalui portal.
Data member diperbarui dengan nomor polis.


Pengajuan Klaim:
Member/provider mengajukan klaim dengan dokumen.
Validasi: Benefit, clinical pathway, COB, co-payment, deductibles.
First DOS accumulation.


Pengunggahan Data Medis:
Provider mengunggah diagnosis/prosedur.
Validasi dengan clinical pathway.


Pembayaran Klaim:
Pembayaran via ACH, capitation, e-wallet.
Reinsurance/stop-loss untuk klaim besar.
Subrogation untuk pihak ketiga.


Notifikasi:
Pemberitahuan via email, SMS, push, WhatsApp.


Status Kesehatan:
Pemantauan melalui statusehat.



Diagram Alur Kerja:
[START]
   |
   v
[Admin/Client Mengunggah Client (Bulk)]
   | - CSV: name,email,phone,nik
   | - Validasi: NIK, format telepon
   v
[Admin Mengunggah Polis (Bulk)]
   | - CSV: policyNumber,clientId,benefits,limit
   | - Validasi: Nomor polis unik
   v
[Client Mengunggah Member (Bulk)]
   | - CSV: clientId,name,policyNumber,nik
   | - Validasi: clientId, policyNumber, NIK
   | - Auto-generate ID anggota
   v
[Member Memilih Polis]
   | - Portal Member
   v
[Member/Provider Mengajukan Klaim]
   | - Validasi: COB, co-payment, deductibles, clinical pathway
   | - First DOS accumulation
   v
[Provider Mengunggah Data Medis]
   | - Validasi: Clinical pathway
   v
[Pembayaran Klaim]
   | - ACH, capitation, e-wallet, reinsurance, stop-loss
   | - Subrogation untuk pihak ketiga
   v
[Notifikasi]
   | - Email, SMS, push, WhatsApp
   v
[Member Memantau Statusehat]
   v
[END]


4. Spesifikasi Non-Fungsional
4.1 Keamanan

Enkripsi AES-256 untuk data sensitif.
Autentikasi RBAC dengan NextAuth.js dan pelacakan login gagal.
Audit log untuk semua transaksi.
Kepatuhan UU PDP (hak akses, hak dihapus) dan HIPAA.
Penetration testing untuk sistem LIVE.

4.2 Performa

Respons API < 2 detik untuk 95% permintaan.
Bulk upload 100.000 baris < 5 menit.
Dukungan 200.000+ karyawan dan 1.000 klaim/hari.

4.3 Skalabilitas

Arsitektur microservices dengan Docker/Kubernetes.
Deployment di cloud (AWS) dengan load balancing.
Caching Redis untuk performa optimal.

4.4 Usability

Antarmuka responsif untuk desktop dan mobile.
Multibahasa (Indonesia, Inggris) dengan next-i18next.
Aksesibilitas sesuai WCAG 2.1.

4.5 Integrasi

HL7/FHIR untuk EHR.
Impor kode ICD-10, CPT.
Integrasi BPJS, HR, payroll, e-wallet, WhatsApp.

4.6 Keandalan

Uptime 99.9% untuk modul LIVE.
Fallback notifikasi (email/SMS) jika WhatsApp terbatas.
Graceful degradation untuk beban tinggi.


5. Asumsi dan Kendala
5.1 Asumsi

Pengguna memiliki akses internet stabil.
File CSV/Excel mengikuti template standar.
Sistem EHR mendukung HL7/FHIR.
Client menyediakan NIK valid.
Platform telehealth menyediakan API.

5.2 Kendala

Validasi data bulk upload untuk volume besar.
Integrasi dengan sistem non-standar.
Biaya tambahan untuk AI/ML, e-wallet, WhatsApp.
Regulasi lokal yang berubah.


6. Risiko dan Mitigasi



Risiko
Dampak
Mitigasi



Kesalahan format bulk upload
Data gagal tersimpan
Validasi ketat, template CSV/Excel


Konflik COB/First DOS
Klaim tidak akurat
Peringatan otomatis, tab konflik


Pelanggaran UU PDP/HIPAA
Sanksi hukum
Enkripsi, audit log, consent management


Kegagalan integrasi EHR
Data tidak sinkron
Uji integrasi HL7/FHIR menyeluruh


Kesalahan capitation/reinsurance
Kerugian finansial
Validasi otomatis, simulasi pembayaran


False positive fraud detection
Klaim valid ditolak
Tuning model ML, review manual


Mobile app vulnerabilities
Pelanggaran data
Audit keamanan, penetration testing


WhatsApp API rate limiting
Gangguan layanan
Fallback email/SMS, manajemen kuota


ML model bias
Diskriminasi klaim
Pengujian bias, data pelatihan beragam


Real-time system downtime
Layanan tidak tersedia
Redundansi server, graceful degradation


Payment gateway issues
Gagal transaksi
Opsi gateway ganda, pemantauan real-time


Telehealth integration complexity
Penundaan pengembangan
Integrasi bertahap, pilot testing



7. Rencana Implementasi
7.1 Teknologi

Frontend: Next.js, Tailwind CSS.
Backend: Next.js API Routes, Prisma.
Database: PostgreSQL (50+ tabel LIVE).
Penyimpanan: AWS S3.
Parsing File: papaparse, xlsx.
Autentikasi: NextAuth.js dengan RBAC.
Notifikasi: SendGrid, Twilio, Firebase, WhatsApp Business API.
Caching: Redis.
AI/ML: TensorFlow.js/Python (AWS SageMaker).
Mobile: React Native.
Real-time: Apache Kafka/Redis Streams.
Pembayaran: Midtrans/Xendit/DOKU.
Telehealth: SDK Halodoc/Alodokter.

7.2 Tahapan Pengembangan

Fase 1-5: COMPLETED (LIVE):
Manajemen Pengguna, Anggota, Polis, Klaim, Penyedia.
Skala 200.000+ karyawan, simulasi Bank Mandiri, BUMN, Astra Group.


Fase 6: Manajemen Keuangan (18 minggu):
Premium billing, pembayaran klaim, e-wallet, tax compliance.


Fase 7: Analitik & Ekstensi (12 bulan):
Analitik, portal, statusehat, clinical pathway, mobile apps, telehealth, WhatsApp, dll.


Fase 8: Diferensiasi Pasar (6 bulan):
Fraud detection, predictive analytics, wellness management.



7.3 Estimasi Sumber Daya

Tim:
3 Frontend Developers.
3 Backend Developers.
2 Mobile Developers.
1 ML Engineer.
1 DevOps Engineer.
1 UI/UX Designer.
2 QA Engineers.
1 Integration Specialist.


Durasi: 18 bulan (Fase 6-8).
Anggaran:
Fase 6: TBD + 30% untuk keuangan dan e-wallet.
Fase 7-8: TBD + 60% untuk AI/ML, mobile, telehealth.
Biaya tambahan: WhatsApp API ($0.005-0.009/pesan), app store ($99/tahun Apple, $25 Google), payment gateway (2.9% + Rp 2,000/transaksi).



7.4 TPA Business Complexity Considerations

Enterprise Client Management:
Multi-level hierarki (holding → anak perusahaan).
Aturan inheritance untuk benefit dan pricing.
Consolidated billing dan transfer antar-subsidiary.


Advanced Product Architecture:
Desain benefit modular (mix-and-match).
Dynamic pricing dengan diskon volume.
Plan comparison engine untuk rekomendasi.


Complex Enrollment Scenarios:
Life event processing (pernikahan, kelahiran, dll.).
COBRA administration dan seasonal workforce.
Dukungan kontrak serikat pekerja.


Integration Requirements:
Sinkronisasi real-time dengan HR dan payroll.
Integrasi klaim dan benefit dengan sistem eksternal.


Compliance & Audit:
Kepatuhan multi-jurisdiksi (UU PDP, HIPAA, SOX).
Audit trails lengkap untuk transaksi.




8. Metrik Keberhasilan

Efisiensi: 90% data diunggah via bulk upload.
Waktu Proses Klaim: < 5 menit (otomatis), < 24 jam (manual).
Kepuasan Pengguna: NPS > 70.
Kepatuhan: 100% UU PDP, HIPAA.
Akurasi COB: 95% klaim multi-polis tanpa konflik.
Real-time Performance: 99% eligibility verification < 2 detik.
Fraud Detection: 85% akurasi, < 5% false positives.
Mobile Adoption: 60% member menggunakan app dalam 6 bulan.
Predictive Accuracy: 80% akurasi stratifikasi risiko.
WhatsApp Engagement: 70% respons notifikasi.
Payment Success: 95% transaksi e-wallet berhasil.
Telehealth Integration: 30% klaim dari telehealth.
Wellness Participation: 40% member aktif.
Client Hierarchy: 95% otomatisasi struktur client.
Product Configuration: < 2 jam untuk setup produk baru.
Enrollment Processing: 99% akurasi skenario kompleks.
Integration Success: 98% uptime integrasi kritis.
Compliance Reporting: 100% otomatisasi laporan kepatuhan.


9. Lampiran
9.1 Contoh Struktur CSV
Client:
name,email,phone,nik
PT ABC,abc@company.com,+628123456789,1234567890123456

Member:
clientId,name,policyNumber,nik,startDate,endDate
client123,John Doe,POL001,9876543210987654,2025-01-01,2025-12-31

Polis:
policyNumber,clientId,benefits,limit,startDate,endDate
POL001,client123,inpatient,outpatient,5000000,2025-01-01,2025-12-31

9.2 Referensi BRD Modul



Modul
BRD Ref
Status
Fitur Utama



Manajemen Pengguna
BRD-1-Modul-Manajemen-Pengguna-RBAC
✅ LIVE
RBAC, 9 peran, dasbor dinamis


Manajemen Anggota
BRD-2-manajemen-anggota-danclient
✅ LIVE
Hierarki client, siklus member


Manajemen Polis
BRD-3-Manajemen-Polis-Realistic
✅ LIVE
Benefit fleksibel, mass operations


Manajemen Klaim
BRD-4-Claims-Management
✅ LIVE
COB, co-payment, clinical pathway


Manajemen Penyedia
BRD-5-Provider-Management
✅ LIVE
Capitation, provider scoring


Manajemen Keuangan
BRD-6-Financial-Management
📋 Ready
Billing, e-wallet, tax compliance


Analitik dan Pelaporan
BRD-Analytics
📋 Planned
Population health, risk stratification


Integrasi Eksternal
BRD-Integrations
📋 Planned
HL7/FHIR, BPJS


Notifikasi
BRD-Notifications
📋 Planned
Email, SMS, WhatsApp


Kepatuhan
BRD-Compliance
📋 Planned
Audit log, UU PDP


Manajemen Dokumen
BRD-Documents
📋 Planned
Penyimpanan dokumen


Statusehat
BRD-Statusehat
📋 Planned
Pemantauan kesehatan


Clinical Pathway
BRD-ClinicalPathway
📋 Planned
Validasi prosedur


Portal Client
BRD-PortalClient
📋 Planned
Manajemen anggota


Portal Member
BRD-PortalMember
📋 Planned
Polis, klaim, statusehat


Portal Provider
BRD-PortalProvider
📋 Planned
Data medis, pembayaran


Real-time Eligibility
BRD-Eligibility
📋 Planned
Verifikasi real-time


Fraud Detection
BRD-FraudDetection
📋 Planned
AI/ML fraud detection


Predictive Analytics
BRD-PredictiveAnalytics
📋 Planned
Risk assessment


Mobile Applications
BRD-MobileApps
📋 Planned
iOS/Android apps


Telehealth Integration
BRD-Telehealth
📋 Planned
Konsultasi virtual


Wellness Management
BRD-Wellness
📋 Planned
Wellness tracking


WhatsApp Integration
BRD-WhatsApp
📋 Planned
Notifikasi, chatbot


Local Payment
BRD-LocalPayment
📋 Planned
E-wallet, QRIS


9.3 Future Enhancement Modules



Enhancement Module
Priority
Timeline
Investment Required



Real-time Eligibility
High
Year 2
+30% budget, DevOps


Fraud Detection
High
Year 2
+60% budget, ML engineer


Predictive Analytics
Medium
Year 2-3
+40% budget, Data scientist


Mobile Applications
High
Year 2
+50% budget, Mobile developers


Telehealth Integration
Medium
Year 3
+20% budget, Integration specialist


Wellness Management
Low
Year 3+
+30% budget, Health experts


WhatsApp Integration
High
Year 2
+10% budget, API costs


Local Payment
High
Year 2
+15% budget, Gateway fees


AI-Powered Optimization
Medium
Year 3+
+100% budget, AI/ML team


Blockchain Audit
Low
Year 3+
+80% budget, Blockchain experts


Multi-Jurisdictional
Medium
Year 3+
+120% budget, Legal team


Clinical Integration
Low
Year 3+
+150% budget, Medical experts



10. Development Priority & Roadmap

Fase 6: Manajemen Keuangan (18 minggu):
Prioritas utama untuk mendukung premium billing dan pembayaran lokal.


Fase 7: Analitik & Ekstensi (12 bulan):
Portal, statusehat, clinical pathway, mobile apps, telehealth, WhatsApp.


Fase 8: Diferensiasi Pasar (6 bulan):
Fraud detection, predictive analytics, wellness management.


Risk Mitigation:
Scope management untuk fokus pada Fase 6.
90% test coverage untuk modul baru.
Pengujian integrasi antar-modul.
Pemantauan performa real-time.




11. Production Deployment Status

Modul LIVE:
Manajemen Pengguna: RBAC, 9 peran, dasbor dinamis.
Manajemen Anggota: Hierarki client (Bank Mandiri, BUMN, Astra), 200.000+ karyawan.
Manajemen Polis: Benefit fleksibel, mass operations.
Manajemen Klaim: COB, co-payment, clinical pathway.
Manajemen Penyedia: Capitation, provider scoring.
Database: 50+ tabel, API 150+ endpoint.


Siap Pengembangan:
Manajemen Keuangan (BRD-6, 18 minggu).


Direncanakan:
Analitik, portal, statusehat, clinical pathway, mobile apps, telehealth, WhatsApp, e-wallet.


Pasar Indonesia:
Validasi NIK, NPWP, kepatuhan lokal.
Simulasi perusahaan nyata (Bank Mandiri, BUMN, Astra).




12. Persetujuan
Disetujui oleh: ✅ COMPLETED - Production ReadyTanggal Persetujuan: 1 Juli 2025
