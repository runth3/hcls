# Business Rules & Non-Functional Requirements - BRD-8

## 4. Aturan Bisnis (Business Rules)

### 4.1 Modul 1: Medical Concept Lexicon
- **BR-LEX-01**: `human_readable_code` harus unik di seluruh tabel `xaie_concepts`
- **BR-LEX-02**: Saat konsep baru dibuat, statusnya default 'Pending Review' hingga disetujui pengguna dengan peran lebih tinggi
- **BR-LEX-03**: Pemetaan kode tidak dapat dibuat jika kombinasi `concept_id`, `coding_system_name`, dan `code_value` sudah ada
- **BR-LEX-04**: Hubungan tidak dapat dibuat jika kombinasi `source_concept_id`, `target_concept_id`, dan `relationship_type` sudah ada
- **BR-LEX-05**: Hard delete konsep tidak diizinkan, hanya soft delete dengan mengubah status

### 4.2 Modul 2: Encounter Records
- **BR-ENC-01**: Setiap encounter harus memiliki minimal satu diagnosis concept
- **BR-ENC-02**: Patient data harus di-hash untuk de-identification compliance
- **BR-ENC-03**: FHIR code mapping harus memiliki confidence score minimal 0.8 untuk auto-processing
- **BR-ENC-04**: Encounter dengan outcome 'DECEASED' memerlukan manual review
- **BR-ENC-05**: Cost data harus dalam currency IDR untuk consistency

### 4.3 Modul 3: Knowledge Graph
- **BR-AI-01**: AI scores hanya dapat diupdate melalui automated learning process, tidak manual
- **BR-AI-02**: Relationship dengan total_encounters < 10 tidak boleh digunakan untuk clinical recommendations
- **BR-AI-03**: Contextual scores harus diupdate minimal setiap 24 jam dari encounter baru
- **BR-AI-04**: ML predictions dengan confidence < 0.7 harus ditandai sebagai 'LOW_CONFIDENCE'
- **BR-AI-05**: Audit log harus disimpan minimal 7 tahun untuk regulatory compliance

## 5. Spesifikasi Non-Fungsional

### 5.1 Performance Requirements
- **PERF-01**: Halaman daftar konsep dengan 100,000 entri harus dimuat (dengan paginasi) dalam < 3 detik
- **PERF-02**: Hasil pencarian global harus muncul dalam < 2 detik
- **PERF-03**: FHIR claim processing harus selesai dalam < 5 detik per claim
- **PERF-04**: GraphQL clinical pathway query harus respond dalam < 1 detik
- **PERF-05**: AI learning batch process harus dapat memproses 10,000 encounters dalam < 30 menit

### 5.2 Security Requirements
- **SEC-01**: Akses CRUD dibatasi berdasarkan RBAC - hanya 'Admin' atau 'Clinical Expert' dapat melakukan perubahan
- **SEC-02**: Semua API calls harus authenticated dengan JWT tokens
- **SEC-03**: Patient data harus encrypted at rest dan in transit
- **SEC-04**: Audit logging untuk semua data modifications
- **SEC-05**: FHIR data harus comply dengan HIPAA dan UU PDP Indonesia

### 5.3 Usability Requirements
- **USA-01**: Interface harus intuitif untuk pengguna non-teknis (clinical experts)
- **USA-02**: Fuzzy search harus toleran terhadap typos hingga 2 karakter
- **USA-03**: Bulk operations harus tersedia untuk mass data entry
- **USA-04**: Multi-language support (English dan Bahasa Indonesia)
- **USA-05**: Mobile-responsive design untuk tablet access

### 5.4 Scalability Requirements
- **SCAL-01**: Sistem harus dapat menangani hingga 1 juta concepts
- **SCAL-02**: Database harus dapat menyimpan 10 juta encounter records
- **SCAL-03**: Concurrent users hingga 500 simultaneous
- **SCAL-04**: API rate limiting 1000 requests per minute per user
- **SCAL-05**: Horizontal scaling capability untuk future growth

### 5.5 Availability Requirements
- **AVAIL-01**: System uptime 99.9% (maksimal 8.76 jam downtime per tahun)
- **AVAIL-02**: Database backup otomatis setiap 6 jam
- **AVAIL-03**: Disaster recovery dengan RTO < 4 jam, RPO < 1 jam
- **AVAIL-04**: Health check endpoints untuk monitoring
- **AVAIL-05**: Graceful degradation saat AI services unavailable

## 6. Ketergantungan (Dependencies)

### 6.1 Internal Dependencies
- **Modul Manajemen Pengguna (BRD-1)**: Diperlukan untuk RBAC dan user authentication
- **Claims Processing (BRD-4)**: Source data untuk encounter records
- **Analytics Dashboard (BRD-7)**: Consumer untuk AI insights dan reports

### 6.2 External Dependencies
- **PostgreSQL 14+**: Database dengan pg_trgm extension untuk fuzzy search
- **FHIR R4 Standard**: Untuk healthcare interoperability
- **AWS HealthLake**: Optional integration untuk advanced FHIR processing
- **GraphQL Server**: Apollo Server atau equivalent untuk API layer

### 6.3 AI/ML Dependencies
- **Python 3.9+**: Untuk ML model development
- **TensorFlow/PyTorch**: Machine learning frameworks
- **scikit-learn**: Statistical analysis dan pattern recognition
- **Apache Airflow**: Untuk ML pipeline orchestration

## 7. Metrik Keberhasilan

### 7.1 Technical KPIs
- **Kelengkapan Data**: Jumlah konsep, sinonim, dan pemetaan kode bertambah konsisten setiap kuartal
- **Akurasi Mapping**: Tingkat keberhasilan NLU dalam memetakan istilah ke concept_id mencapai >95%
- **AI Confidence**: Average confidence score untuk clinical recommendations >0.85
- **System Performance**: 95% API calls respond dalam SLA time limits

### 7.2 Business KPIs
- **Efisiensi Kurasi**: Waktu rata-rata menambahkan dan memvalidasi satu konsep baru < 5 menit
- **User Adoption**: 80% clinical experts menggunakan sistem untuk daily workflow
- **Cost Optimization**: 20% improvement dalam cost prediction accuracy
- **Clinical Outcomes**: 15% improvement dalam treatment appropriateness scores

### 7.3 Compliance KPIs
- **Data Quality**: 99% data completeness untuk mandatory fields
- **Security Compliance**: Zero security incidents per quarter
- **Regulatory Compliance**: 100% compliance dengan healthcare regulations
- **Audit Trail**: Complete audit coverage untuk all data modifications