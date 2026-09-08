import { useState, useMemo, useRef, useEffect } from "react";
import Header from "../../components/headerSales";
import { dummyToko } from "../../fitur/tokoTable";
import "../../css/pesananSales.css";

import { MOCK_BARANG, DRAFT_KEY, bacaDraft } from "./pesananSalesData";
import LeaveModal, { NotifModal } from "./leaveModal";


// ======================================================
// COMPONENT
// ======================================================

function PesananSales() {

    // ==================================================
    // STATE TOKO
    // ==================================================

    const [daftarToko, setDaftarToko] = useState(dummyToko);

    const [keywordToko, setKeywordToko] = useState("");

    const [showDropdownToko, setShowDropdownToko] = useState(false);

    // Index item yang sedang di-highlight lewat keyboard (panah/PgUp/PgDown)
    const [highlightIndexToko, setHighlightIndexToko] = useState(-1);

    const tokoDropdownRef = useRef(null);

    const [tokoDipilih, setTokoDipilih] = useState(null);

    const [showFormTokoBaru, setShowFormTokoBaru] = useState(false);

    const [alamatTokoBaru, setAlamatTokoBaru] = useState("");

    const [noTeleponTokoBaru, setNoTeleponTokoBaru] = useState("");


    // ==================================================
    // STATE BARANG
    // ==================================================

    const [daftarBarang, setDaftarBarang] = useState(MOCK_BARANG);

    const [keyword, setKeyword] = useState("");

    const [showDropdown, setShowDropdown] = useState(false);

    // Index item yang sedang di-highlight lewat keyboard (panah/PgUp/PgDown)
    const [highlightIndexBarang, setHighlightIndexBarang] = useState(-1);

    const barangDropdownRef = useRef(null);

    const [barangDipilih, setBarangDipilih] = useState(null);

    const [satuanDipilih, setSatuanDipilih] = useState("SET");

    const [qty, setQty] = useState("");

    // [BARU] Ref input Qty di form "Tambah Barang", supaya begitu
    // barang terpilih (baik lewat klik maupun Enter), fokus otomatis
    // pindah ke kolom Qty dan user tinggal ketik angka lalu Enter lagi.
    const qtyInputRef = useRef(null);

    const [pesanan, setPesanan] = useState([]);

    // ID item yang sedang diedit di tabel Daftar Pesanan
    const [editingItemId, setEditingItemId] = useState(null);

    // Nilai sementara saat mode edit (qty & satuan)
    const [editQty, setEditQty] = useState("");

    const [editSatuan, setEditSatuan] = useState("SET");

    // Ref input Qty saat edit, supaya bisa auto-focus (kursor kedip)
    const editQtyInputRef = useRef(null);

    // Ref untuk auto-scroll tabel "Daftar Pesanan" ke bawah
    // setiap kali ada barang baru ditambahkan.
    const tableWrapperRef = useRef(null);

    // Penanda apakah draft pernah dimuat (supaya badge & tombol
    // "Buang Draft" hanya muncul kalau memang ada draft tersimpan)
    const [adaDraftTersimpan, setAdaDraftTersimpan] = useState(false);


    // ==================================================
    // STATE POPUP "PINDAH HALAMAN" (KATALOG / HISTORY / DATATOKO)
    // ==================================================
    // Muncul ketika user sudah punya barang di pesanan (belum tentu
    // sudah disimpan draft) lalu mengklik menu navigasi lain di Header,
    // supaya user tidak lupa menyimpan draft sebelum pindah tab/halaman.
    // ==================================================

    const [showLeaveModal, setShowLeaveModal] = useState(false);

    // Menyimpan tujuan link yang sempat dicegat, supaya bisa
    // dilanjutkan setelah user memilih aksi di popup.
    const pendingHrefRef = useRef(null);

    // ==================================================
    // FLAG "IZIN NAVIGASI"
    // ==================================================
    const izinkanNavigasiRef = useRef(false);


    // ==================================================
    // [BARU] STATE POPUP NOTIFIKASI (pengganti alert/confirm)
    // ==================================================
    // notif = { type: "alert" | "confirm", message: string, onConfirm?: fn }
    // ==================================================

    const [notif, setNotif] = useState(null);

    function bukaAlert(message) {
        setNotif({ type: "alert", message });
    }

    function bukaConfirm(message, onConfirm) {
        setNotif({ type: "confirm", message, onConfirm });
    }

    function tutupNotif() {
        setNotif(null);
    }


    // ==================================================
    // [BARU] SNAPSHOT DRAFT TERAKHIR TERSIMPAN
    // ==================================================
    // Dipakai untuk membandingkan kondisi toko+pesanan SEKARANG
    // dengan kondisi terakhir yang sudah tersimpan sebagai draft
    // (atau kondisi awal kosong kalau belum pernah ada draft).
    // Popup "Pindah Halaman" HANYA muncul kalau ada perbedaan,
    // bukan sekadar karena pesanan.length > 0.
    // ==================================================

    const lastSavedSnapshotRef = useRef(
        JSON.stringify({ tokoId: null, items: [] })
    );

    function buatSnapshot(toko, items) {
        return JSON.stringify({
            tokoId: toko ? toko.id : null,
            items: items.map((item) => ({
                barangId: item.barangId,
                qty: item.qty,
                satuan: item.satuan
            }))
        });
    }

    function adaPerubahanBelumTersimpan() {
        return (
            buatSnapshot(tokoDipilih, pesanan) !==
            lastSavedSnapshotRef.current
        );
    }


    // ==================================================
    // MUAT DRAFT SAAT HALAMAN DIBUKA / DI-REFRESH
    // ==================================================

    useEffect(() => {

        const draft = bacaDraft();

        if (!draft) {
            return;
        }

        if (draft.toko) {
            setTokoDipilih(draft.toko);
        }

        if (Array.isArray(draft.items)) {
            setPesanan(draft.items);
        }

        setAdaDraftTersimpan(true);

        // [BARU] Catat snapshot draft yang baru dimuat, supaya
        // begitu halaman dibuka, kondisi ini dianggap "sudah tersimpan"
        // dan popup tidak langsung muncul saat user pindah tab.
        lastSavedSnapshotRef.current = buatSnapshot(
            draft.toko || null,
            Array.isArray(draft.items) ? draft.items : []
        );

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    // ==================================================
    // CEGAT KLIK LINK NAVIGASI (Katalog / History Order / DataToko)
    // ==================================================

    useEffect(() => {

        function handleDocumentClick(e) {

            // [DIUBAH] Sebelumnya: if (pesanan.length === 0) return;
            // Sekarang: hanya cegat kalau memang ada perubahan yang
            // belum disimpan sebagai draft (dibandingkan snapshot terakhir).
            if (!adaPerubahanBelumTersimpan()) {
                return;
            }

            // Cari elemen <a> terdekat dari yang diklik
            const link = e.target.closest("a[href]");

            if (!link) {
                return;
            }

            const href = link.getAttribute("href");

            if (!href) {
                return;
            }

            // Abaikan link luar (http/https ke domain lain), anchor (#),
            // link kosong, dan link menuju halaman yang sama
            if (
                href.startsWith("http") ||
                href.startsWith("#") ||
                href === "" ||
                href === window.location.pathname
            ) {
                return;
            }

            // Cegat navigasinya
            e.preventDefault();
            e.stopPropagation();

            pendingHrefRef.current = href;

            setShowLeaveModal(true);
        }

        document.addEventListener("click", handleDocumentClick, true);

        return () => {
            document.removeEventListener("click", handleDocumentClick, true);
        };

        // [DIUBAH] deps: sebelumnya [pesanan.length], sekarang butuh
        // tokoDipilih & pesanan (bukan cuma length) karena snapshot
        // membandingkan isi qty/satuan/toko juga.
    }, [pesanan, tokoDipilih]);


    // ==================================================
    // PROTEKSI REFRESH / TUTUP TAB
    // ==================================================

    useEffect(() => {

        function handleBeforeUnload(e) {

            // Navigasi ini sudah disetujui user lewat popup
            // custom kita -> jangan tampilkan dialog native lagi.
            if (izinkanNavigasiRef.current) {
                return;
            }

            // [DIUBAH] Sebelumnya: if (pesanan.length === 0) return;
            if (!adaPerubahanBelumTersimpan()) {
                return;
            }

            e.preventDefault();

            // Sebagian browser (lama) masih butuh returnValue diisi
            e.returnValue = "";
        }

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };

        // [DIUBAH] deps: sebelumnya [pesanan.length]
    }, [pesanan, tokoDipilih]);


    // ==================================================
    // PENCARIAN TOKO
    // ==================================================

    const hasilPencarianToko = useMemo(() => {

        if (!keywordToko.trim()) {
            return [];
        }

        return daftarToko.filter((toko) =>
            toko.namaToko
                .toLowerCase()
                .includes(keywordToko.toLowerCase())
        );

    }, [keywordToko, daftarToko]);


    const tokoTidakDitemukan =
        keywordToko.trim().length > 0 &&
        hasilPencarianToko.length === 0;


    // ==================================================
    // SCROLL OTOMATIS KE ITEM YANG DI-HIGHLIGHT (TOKO)
    // ==================================================

    useEffect(() => {

        if (!tokoDropdownRef.current) {
            return;
        }

        const el = tokoDropdownRef.current.querySelector(
            `[data-index="${highlightIndexToko}"]`
        );

        if (el) {
            el.scrollIntoView({ block: "nearest" });
        }

    }, [highlightIndexToko]);


    // ==================================================
    // NAVIGASI KEYBOARD DROPDOWN TOKO
    // ==================================================

    function handleKeyDownToko(e) {

        if (!showDropdownToko || !keywordToko.trim()) {
            return;
        }

        const totalItem =
            hasilPencarianToko.length +
            (tokoTidakDitemukan ? 1 : 0);

        if (totalItem === 0) {
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightIndexToko((prev) =>
                (prev + 1) % totalItem
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightIndexToko((prev) =>
                (prev - 1 + totalItem) % totalItem
            );
        } else if (e.key === "PageDown") {
            e.preventDefault();
            setHighlightIndexToko((prev) =>
                Math.min(prev + 5, totalItem - 1)
            );
        } else if (e.key === "PageUp") {
            e.preventDefault();
            setHighlightIndexToko((prev) =>
                Math.max(prev - 5, 0)
            );
        } else if (e.key === "Home") {
            e.preventDefault();
            setHighlightIndexToko(0);
        } else if (e.key === "End") {
            e.preventDefault();
            setHighlightIndexToko(totalItem - 1);
        } else if (e.key === "Enter") {
            e.preventDefault();

            // [DIUBAH] Kalau belum pernah di-highlight lewat panah,
            // anggap user mau pilih hasil teratas supaya Enter
            // langsung berfungsi tanpa perlu pencet panah dulu.
            let indexTerpilih = highlightIndexToko;

            if (indexTerpilih === -1 && totalItem > 0) {
                indexTerpilih = 0;
            }

            if (indexTerpilih === -1) {
                return;
            }

            if (indexTerpilih < hasilPencarianToko.length) {
                pilihToko(
                    hasilPencarianToko[indexTerpilih]
                );
            } else {
                mulaiTambahTokoBaru();
            }
        } else if (e.key === "Escape") {
            setShowDropdownToko(false);
        }
    }


    // ==================================================
    // PILIH TOKO
    // ==================================================

    function pilihToko(toko) {

        setTokoDipilih(toko);

        setKeywordToko(toko.namaToko);

        setShowDropdownToko(false);

        setHighlightIndexToko(-1);

        setShowFormTokoBaru(false);
    }


    // ==================================================
    // TAMBAH TOKO BARU
    // ==================================================

    function mulaiTambahTokoBaru() {

        setShowFormTokoBaru(true);

        setShowDropdownToko(false);
    }


    function simpanTokoBaru() {

        const namaBaru = keywordToko.trim();

        if (!namaBaru || !alamatTokoBaru.trim()) {
            return;
        }

        const tokoBaru = {
            id: `new-${Date.now()}`,
            namaToko: namaBaru,
            alamat: alamatTokoBaru.trim(),
            noTelepon: noTeleponTokoBaru.trim(),
            inputBy: "Sales",
            isBaru: true
        };

        setDaftarToko((prev) => [
            ...prev,
            tokoBaru
        ]);

        setTokoDipilih(tokoBaru);

        setShowFormTokoBaru(false);
    }


    // ==================================================
    // GANTI TOKO
    // ==================================================

    function gantiToko() {

        setTokoDipilih(null);

        setKeywordToko("");

        setHighlightIndexToko(-1);

        setShowFormTokoBaru(false);

        setAlamatTokoBaru("");

        setNoTeleponTokoBaru("");

        // Pesanan di-reset supaya tidak tertukar
        // dengan toko sebelumnya
        setPesanan([]);

        setKeyword("");

        setBarangDipilih(null);

        setHighlightIndexBarang(-1);

        setQty("");

        setSatuanDipilih("SET");
    }


    // ==================================================
    // PENCARIAN BARANG
    // ==================================================

    const hasilPencarian = useMemo(() => {

        if (!keyword.trim()) {
            return [];
        }

        return daftarBarang.filter((barang) =>
            barang.nama
                .toLowerCase()
                .includes(keyword.toLowerCase())
        );

    }, [keyword, daftarBarang]);


    const barangTidakDitemukan =
        keyword.trim().length > 0 &&
        hasilPencarian.length === 0;


    // ==================================================
    // SCROLL OTOMATIS KE ITEM YANG DI-HIGHLIGHT (BARANG)
    // ==================================================

    useEffect(() => {

        if (!barangDropdownRef.current) {
            return;
        }

        const el = barangDropdownRef.current.querySelector(
            `[data-index="${highlightIndexBarang}"]`
        );

        if (el) {
            el.scrollIntoView({ block: "nearest" });
        }

    }, [highlightIndexBarang]);


    // ==================================================
    // [BARU] AUTO-FOCUS KE INPUT QTY SETELAH BARANG TERPILIH
    // ==================================================
    // Begitu barangDipilih terisi (baik lewat klik dropdown maupun
    // Enter), fokus otomatis pindah ke kolom Qty & teks-nya di-select
    // supaya user tinggal ketik angka lalu Enter untuk menambahkan
    // ke pesanan.
    // ==================================================

    useEffect(() => {

        if (barangDipilih && qtyInputRef.current) {
            qtyInputRef.current.focus();
            qtyInputRef.current.select();
        }

    }, [barangDipilih]);


    // ==================================================
    // NAVIGASI KEYBOARD DROPDOWN BARANG
    // ==================================================

    function handleKeyDownBarang(e) {

        if (
            e.key === "Enter" &&
            !showDropdown &&
            barangDipilih
        ) {
            e.preventDefault();
            tambahKePesanan();
            return;
        }

        if (!showDropdown || !keyword.trim()) {
            return;
        }

        const totalItem =
            hasilPencarian.length +
            (barangTidakDitemukan ? 1 : 0);

        if (totalItem === 0) {
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightIndexBarang((prev) =>
                (prev + 1) % totalItem
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightIndexBarang((prev) =>
                (prev - 1 + totalItem) % totalItem
            );
        } else if (e.key === "PageDown") {
            e.preventDefault();
            setHighlightIndexBarang((prev) =>
                Math.min(prev + 5, totalItem - 1)
            );
        } else if (e.key === "PageUp") {
            e.preventDefault();
            setHighlightIndexBarang((prev) =>
                Math.max(prev - 5, 0)
            );
        } else if (e.key === "Home") {
            e.preventDefault();
            setHighlightIndexBarang(0);
        } else if (e.key === "End") {
            e.preventDefault();
            setHighlightIndexBarang(totalItem - 1);
        } else if (e.key === "Enter") {
            e.preventDefault();

            // [DIUBAH] Kalau belum pernah di-highlight lewat panah,
            // anggap user mau pilih hasil teratas supaya Enter
            // langsung berfungsi tanpa perlu pencet panah dulu.
            let indexTerpilih = highlightIndexBarang;

            if (indexTerpilih === -1 && totalItem > 0) {
                indexTerpilih = 0;
            }

            if (indexTerpilih === -1) {
                return;
            }

            if (indexTerpilih < hasilPencarian.length) {
                pilihBarang(
                    hasilPencarian[indexTerpilih]
                );
            } else {
                tambahBarangBaru();
            }
        } else if (e.key === "Escape") {
            setShowDropdown(false);
        }
    }


    // ==================================================
    // PILIH BARANG
    // ==================================================

    function pilihBarang(barang) {

        setBarangDipilih(barang);

        setSatuanDipilih(
            barang.satuanDefault || "SET"
        );

        setKeyword(barang.nama);

        setShowDropdown(false);

        setHighlightIndexBarang(-1);
    }


    // ==================================================
    // TAMBAH BARANG BARU
    // ==================================================

    function tambahBarangBaru() {

        const namaBaru = keyword.trim();

        if (!namaBaru) {
            return;
        }

        const barangBaru = {
            id: `new-${Date.now()}`,
            nama: namaBaru,
            satuanDefault: "SET",
            isBaru: true
        };

        setDaftarBarang((prev) => [
            ...prev,
            barangBaru
        ]);

        setBarangDipilih(barangBaru);

        setSatuanDipilih("SET");

        setShowDropdown(false);
    }


    // ==================================================
    // TAMBAH BARANG KE PESANAN
    // ==================================================

    function tambahKePesanan() {

        if (!barangDipilih) {
            return;
        }

        const qtyFinal = qty === "" ? 0 : Number(qty);

        if (qtyFinal < 0) {
            return;
        }

        const itemBaru = {
            id: Date.now(),
            barangId: barangDipilih.id,
            nama: barangDipilih.nama,
            satuan: satuanDipilih,
            qty: qtyFinal,
            isBaru: !!barangDipilih.isBaru
        };

        setPesanan((prev) => [
            ...prev,
            itemBaru
        ]);

        // Reset form barang
        setKeyword("");

        setBarangDipilih(null);

        setSatuanDipilih("SET");

        setQty("");

        setShowDropdown(false);
    }


    // ==================================================
    // HAPUS ITEM
    // ==================================================

    function hapusItem(id) {

        setPesanan((prev) =>
            prev.filter(
                (item) => item.id !== id
            )
        );

        if (editingItemId === id) {
            setEditingItemId(null);
        }
    }


    // ==================================================
    // EDIT ITEM (QTY & SATUAN)
    // ==================================================

    function mulaiEditItem(item) {

        setEditingItemId(item.id);

        setEditQty(String(item.qty));

        setEditSatuan(item.satuan);
    }


    function batalEditItem() {

        setEditingItemId(null);

        setEditQty("");

        setEditSatuan("SET");
    }


    function simpanEditItem() {

        const qtyFinal =
            editQty === "" ? 0 : Number(editQty);

        if (qtyFinal < 0) {
            return;
        }

        setPesanan((prev) =>
            prev.map((item) =>
                item.id === editingItemId
                    ? {
                        ...item,
                        qty: qtyFinal,
                        satuan: editSatuan
                    }
                    : item
            )
        );

        batalEditItem();
    }


    function handleKeyDownEditQty(e) {

        if (e.key === "Enter") {
            e.preventDefault();
            simpanEditItem();
        } else if (e.key === "Escape") {
            e.preventDefault();
            batalEditItem();
        }
    }


    useEffect(() => {

        if (editingItemId !== null && editQtyInputRef.current) {
            editQtyInputRef.current.focus();
            editQtyInputRef.current.select();
        }

    }, [editingItemId]);


    // ==================================================
    // AUTO-SCROLL DAFTAR PESANAN
    // ==================================================

    useEffect(() => {

        if (!tableWrapperRef.current) {
            return;
        }

        tableWrapperRef.current.scrollTop =
            tableWrapperRef.current.scrollHeight;

    }, [pesanan.length]);


    // ==================================================
    // DRAFT PESANAN
    // ==================================================

    function simpanDraftInternal(tampilkanAlert = true) {

        if (!tokoDipilih) {

            if (tampilkanAlert) {
                bukaAlert("Pilih toko terlebih dahulu sebelum menyimpan draft");
            }

            return false;
        }

        if (pesanan.length === 0) {

            if (tampilkanAlert) {
                bukaAlert("Belum ada barang untuk disimpan sebagai draft");
            }

            return false;
        }

        const draft = {
            toko: tokoDipilih,
            items: pesanan,
            savedAt: Date.now()
        };

        try {

            localStorage.setItem(
                DRAFT_KEY,
                JSON.stringify(draft)
            );

            setAdaDraftTersimpan(true);

            // [BARU] Setelah berhasil simpan draft, catat snapshot
            // terbaru supaya popup "Pindah Halaman" tidak lagi
            // menganggap data ini "belum tersimpan".
            lastSavedSnapshotRef.current = buatSnapshot(
                tokoDipilih,
                pesanan
            );

            if (tampilkanAlert) {
                bukaAlert("Draft pesanan berhasil disimpan");
            }

            return true;

        } catch (err) {

            console.error("Gagal menyimpan draft pesanan:", err);

            if (tampilkanAlert) {
                bukaAlert("Gagal menyimpan draft pesanan");
            }

            return false;
        }
    }


    function simpanDraft() {
        simpanDraftInternal(true);
    }


    function hapusDraft() {

        try {
            localStorage.removeItem(DRAFT_KEY);
        } catch (err) {
            console.error("Gagal menghapus draft pesanan:", err);
        }

        setAdaDraftTersimpan(false);

        // [BARU] Reset snapshot ke kondisi kosong, supaya setelah
        // draft dibuang / pesanan disimpan, kondisi "kosong" ini
        // dianggap sebagai acuan tersimpan yang baru.
        lastSavedSnapshotRef.current = buatSnapshot(null, []);
    }


    function buangDraft() {

        // [DIUBAH] Sebelumnya pakai window.confirm() bawaan browser,
        // sekarang pakai NotifModal custom (type "confirm").
        bukaConfirm(
            "Buang draft pesanan yang tersimpan? Barang & toko yang sedang diisi saat ini juga akan ikut direset.",
            () => {
                hapusDraft();
                gantiToko();
            }
        );
    }


    // ==================================================
    // POPUP "PINDAH HALAMAN" - AKSI USER
    // ==================================================

    function lanjutkanNavigasi(href) {

        izinkanNavigasiRef.current = true;

        if (href) {
            window.location.assign(href);
        }
    }


    function handleBatalPindah() {

        setShowLeaveModal(false);

        pendingHrefRef.current = null;
    }


    function handleLanjutTanpaSimpan() {

        const href = pendingHrefRef.current;

        setShowLeaveModal(false);

        pendingHrefRef.current = null;

        lanjutkanNavigasi(href);
    }


    function handleSimpanDanLanjut() {

        const berhasil = simpanDraftInternal(false);

        const href = pendingHrefRef.current;

        setShowLeaveModal(false);

        pendingHrefRef.current = null;

        if (berhasil) {
            lanjutkanNavigasi(href);
        }
    }


    // ==================================================
    // SIMPAN PESANAN
    // ==================================================

    function simpanPesanan() {

        if (!tokoDipilih) {

            bukaAlert("Toko belum dipilih");

            return;
        }

        if (pesanan.length === 0) {

            bukaAlert("Belum ada barang di pesanan");

            return;
        }

        const payload = {
            toko: tokoDipilih,
            items: pesanan
        };

        console.log(
            "Simpan pesanan:",
            payload
        );

        // TODO:
        // Kirim payload ke backend/API

        bukaAlert(
            "Pesanan tersimpan"
        );

        hapusDraft();

        gantiToko();
    }


    // ==================================================
    // RENDER
    // ==================================================

    return (
        <>
            <Header />

            <main className="pesanan-container">

                <div className="pesanan-layout">


                    {/* KOLOM KIRI */}

                    <div className="pesanan-left">

                        <section className="pesanan-card">

                            <div className="card-header">

                                <div>
                                    <h2>
                                        Informasi Toko
                                    </h2>

                                    <p>
                                        Pilih toko untuk membuat pesanan
                                    </p>
                                </div>

                            </div>


                            <div className="form-group">

                                <label className="form-label">
                                    Nama Toko
                                </label>


                                {tokoDipilih ? (

                                    <div className="toko-terpilih">

                                        <div className="toko-info">

                                            <div className="toko-nama">

                                                {tokoDipilih.namaToko}

                                                {tokoDipilih.isBaru && (
                                                    <span className="badge-baru">
                                                        Toko Baru
                                                    </span>
                                                )}

                                            </div>


                                            {tokoDipilih.alamat && (
                                                <div className="toko-detail">
                                                    {tokoDipilih.alamat}
                                                </div>
                                            )}


                                            {tokoDipilih.noTelepon && (
                                                <div className="toko-detail">
                                                    {tokoDipilih.noTelepon}
                                                </div>
                                            )}

                                        </div>


                                        <button
                                            type="button"
                                            onClick={gantiToko}
                                            className="btn-secondary"
                                        >
                                            Ganti Toko
                                        </button>

                                    </div>

                                ) : (

                                    <div className="search-wrapper">

                                        <span className="search-icon">
                                            ⌕
                                        </span>


                                        <input
                                            type="text"
                                            value={keywordToko}
                                            onChange={(e) => {

                                                setKeywordToko(
                                                    e.target.value
                                                );

                                                setShowDropdownToko(
                                                    true
                                                );

                                                setHighlightIndexToko(
                                                    -1
                                                );

                                                setShowFormTokoBaru(
                                                    false
                                                );
                                            }}
                                            onFocus={() =>
                                                setShowDropdownToko(
                                                    true
                                                )
                                            }
                                            onKeyDown={
                                                handleKeyDownToko
                                            }
                                            placeholder="Ketik nama toko..."
                                            className="form-input search-input"
                                        />


                                        {showDropdownToko &&
                                            keywordToko.trim() &&
                                            !showFormTokoBaru && (

                                                <div
                                                    className="dropdown"
                                                    ref={tokoDropdownRef}
                                                >

                                                    {hasilPencarianToko.map(
                                                        (toko, idx) => (

                                                            <div
                                                                key={toko.id}
                                                                data-index={idx}
                                                                onClick={() =>
                                                                    pilihToko(
                                                                        toko
                                                                    )
                                                                }
                                                                onMouseEnter={() =>
                                                                    setHighlightIndexToko(
                                                                        idx
                                                                    )
                                                                }
                                                                className="dropdown-item"
                                                                style={
                                                                    highlightIndexToko === idx
                                                                        ? { backgroundColor: "#f0f4ff" }
                                                                        : undefined
                                                                }
                                                            >

                                                                <strong>
                                                                    {
                                                                        toko.namaToko
                                                                    }
                                                                </strong>

                                                                {toko.alamat && (
                                                                    <span className="satuan">
                                                                        {
                                                                            toko.alamat
                                                                        }
                                                                    </span>
                                                                )}

                                                            </div>
                                                        )
                                                    )}


                                                    {tokoTidakDitemukan && (

                                                        <div
                                                            data-index={
                                                                hasilPencarianToko.length
                                                            }
                                                            onClick={
                                                                mulaiTambahTokoBaru
                                                            }
                                                            onMouseEnter={() =>
                                                                setHighlightIndexToko(
                                                                    hasilPencarianToko.length
                                                                )
                                                            }
                                                            className="dropdown-item dropdown-item-new"
                                                            style={
                                                                highlightIndexToko === hasilPencarianToko.length
                                                                    ? { backgroundColor: "#f0f4ff" }
                                                                    : undefined
                                                            }
                                                        >
                                                            + Tambah "
                                                            {
                                                                keywordToko
                                                            }
                                                            " sebagai toko baru
                                                        </div>

                                                    )}

                                                </div>

                                            )}

                                    </div>

                                )}

                            </div>


                            {showFormTokoBaru && (

                                <div className="form-toko-baru">

                                    <div className="new-store-title">
                                        Tambah Toko Baru
                                    </div>


                                    <div className="form-group">

                                        <label className="form-label">
                                            Nama Toko
                                        </label>

                                        <input
                                            type="text"
                                            value={keywordToko}
                                            readOnly
                                            className="form-input"
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label className="form-label">
                                            Alamat Toko
                                        </label>

                                        <textarea
                                            rows={3}
                                            value={alamatTokoBaru}
                                            onChange={(e) =>
                                                setAlamatTokoBaru(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Cth: Jl. Sudirman No. 12, Jakarta Pusat"
                                            className="form-input textarea-input"
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label className="form-label">
                                            No Telepon

                                            <span className="label-optional">
                                                (Opsional)
                                            </span>
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                noTeleponTokoBaru
                                            }
                                            onChange={(e) =>
                                                setNoTeleponTokoBaru(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="0812-xxxx-xxxx"
                                            className="form-input"
                                        />

                                    </div>


                                    <button
                                        type="button"
                                        onClick={simpanTokoBaru}
                                        disabled={
                                            !alamatTokoBaru.trim()
                                        }
                                        className="btn-primary btn-full"
                                    >
                                        Simpan Toko & Lanjut
                                    </button>

                                </div>

                            )}

                        </section>


                        {tokoDipilih && (

                            <section className="pesanan-card">

                                <div className="card-header">

                                    <div>

                                        <h2>
                                            Tambah Barang
                                        </h2>

                                        <p>
                                            Cari barang yang ingin dimasukkan
                                            ke dalam pesanan
                                        </p>

                                    </div>

                                </div>


                                <div className="form-group">

                                    <label className="form-label">
                                        Cari Barang
                                    </label>


                                    <div className="search-wrapper">

                                        <span className="search-icon">
                                            ⌕
                                        </span>


                                        <input
                                            type="text"
                                            value={keyword}
                                            onChange={(e) => {

                                                setKeyword(
                                                    e.target.value
                                                );

                                                setBarangDipilih(
                                                    null
                                                );

                                                setShowDropdown(
                                                    true
                                                );

                                                setHighlightIndexBarang(
                                                    -1
                                                );
                                            }}
                                            onFocus={() =>
                                                setShowDropdown(
                                                    true
                                                )
                                            }
                                            onKeyDown={
                                                handleKeyDownBarang
                                            }
                                            placeholder="Ketik nama barang..."
                                            className="form-input search-input"
                                        />


                                        {showDropdown &&
                                            keyword.trim() && (

                                                <div
                                                    className="dropdown"
                                                    ref={barangDropdownRef}
                                                >

                                                    {hasilPencarian.map(
                                                        (barang, idx) => (

                                                            <div
                                                                key={
                                                                    barang.id
                                                                }
                                                                data-index={idx}
                                                                onClick={() =>
                                                                    pilihBarang(
                                                                        barang
                                                                    )
                                                                }
                                                                onMouseEnter={() =>
                                                                    setHighlightIndexBarang(
                                                                        idx
                                                                    )
                                                                }
                                                                className="dropdown-item"
                                                                style={
                                                                    highlightIndexBarang === idx
                                                                        ? { backgroundColor: "#f0f4ff" }
                                                                        : undefined
                                                                }
                                                            >

                                                                <strong>
                                                                    {
                                                                        barang.nama
                                                                    }
                                                                </strong>

                                                                <span className="satuan">
                                                                    Satuan default:{" "}
                                                                    {
                                                                        barang.satuanDefault
                                                                    }
                                                                </span>

                                                            </div>

                                                        )
                                                    )}


                                                    {barangTidakDitemukan && (

                                                        <div
                                                            data-index={
                                                                hasilPencarian.length
                                                            }
                                                            onClick={
                                                                tambahBarangBaru
                                                            }
                                                            onMouseEnter={() =>
                                                                setHighlightIndexBarang(
                                                                    hasilPencarian.length
                                                                )
                                                            }
                                                            className="dropdown-item dropdown-item-new"
                                                            style={
                                                                highlightIndexBarang === hasilPencarian.length
                                                                    ? { backgroundColor: "#f0f4ff" }
                                                                    : undefined
                                                            }
                                                        >
                                                            + Tambah "
                                                            {
                                                                keyword
                                                            }
                                                            " sebagai barang baru
                                                        </div>

                                                    )}

                                                </div>

                                            )}

                                    </div>

                                </div>


                                {barangDipilih && (

                                    <div className="barang-form-bottom">


                                        <div className="qty-row">


                                            <div className="form-group">

                                                <label className="form-label">

                                                    Satuan

                                                    {barangDipilih.isBaru && (
                                                        <span className="badge-baru">
                                                            Barang Baru
                                                        </span>
                                                    )}

                                                </label>


                                                <select
                                                    value={
                                                        satuanDipilih
                                                    }
                                                    onChange={(e) =>
                                                        setSatuanDipilih(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="form-input"
                                                >

                                                    <option value="SET">
                                                        SET
                                                    </option>

                                                    <option value="PCS">
                                                        PCS
                                                    </option>

                                                </select>

                                            </div>


                                            <div className="form-group">

                                                <label className="form-label">
                                                    Qty
                                                </label>

                                                <input
                                                    ref={qtyInputRef}
                                                    type="number"
                                                    min="0"
                                                    value={qty}
                                                    onChange={(e) =>
                                                        setQty(
                                                            e.target.value
                                                        )
                                                    }
                                                    onKeyDown={
                                                        handleKeyDownBarang
                                                    }
                                                    placeholder="0"
                                                    className="form-input"
                                                />

                                            </div>

                                        </div>


                                        <button
                                            type="button"
                                            onClick={
                                                tambahKePesanan
                                            }
                                            className="btn-primary btn-full"
                                        >
                                            + Tambah ke Pesanan
                                        </button>

                                    </div>

                                )}

                            </section>

                        )}

                    </div>


                    {/* KOLOM KANAN */}

                    <div className="pesanan-right">

                        <section className="pesanan-card pesanan-list-card">


                            <div className="card-header order-header">

                                <div>

                                    <h2>
                                        Daftar Pesanan

                                        {adaDraftTersimpan && (
                                            <span className="badge-draft">
                                                Draft Tersimpan
                                            </span>
                                        )}
                                    </h2>

                                    <p>
                                        {pesanan.length > 0
                                            ? `${pesanan.length} barang dalam pesanan`
                                            : "Belum ada barang ditambahkan"
                                        }
                                    </p>

                                </div>


                                {pesanan.length > 0 && (

                                    <div className="order-count">
                                        {pesanan.length}
                                    </div>

                                )}

                            </div>


                            {pesanan.length > 0 ? (

                                <>

                                    <div
                                        className="table-wrapper"
                                        ref={tableWrapperRef}
                                    >

                                        <table className="pesanan-table">

                                            <thead>

                                                <tr>

                                                    <th className="col-no">
                                                        NO
                                                    </th>

                                                    <th>
                                                        BARANG
                                                    </th>

                                                    <th className="col-qty">
                                                        QTY
                                                    </th>

                                                    <th className="col-satuan">
                                                        SATUAN
                                                    </th>

                                                    <th className="col-action">
                                                        AKSI
                                                    </th>

                                                </tr>

                                            </thead>


                                            <tbody>

                                                {pesanan.map(
                                                    (item, index) => {

                                                        const sedangDiedit =
                                                            editingItemId === item.id;

                                                        return (

                                                            <tr
                                                                key={
                                                                    item.id
                                                                }
                                                                className={
                                                                    sedangDiedit
                                                                        ? "row-editing"
                                                                        : undefined
                                                                }
                                                            >

                                                                <td className="col-no">
                                                                    {
                                                                        index + 1
                                                                    }
                                                                </td>


                                                                <td>

                                                                    <div className="barang-name">

                                                                        {
                                                                            item.nama
                                                                        }


                                                                        {item.isBaru && (
                                                                            <span className="badge-baru">
                                                                                Baru
                                                                            </span>
                                                                        )}

                                                                    </div>

                                                                </td>


                                                                <td className="col-qty">

                                                                    {sedangDiedit ? (

                                                                        <input
                                                                            ref={
                                                                                editQtyInputRef
                                                                            }
                                                                            type="number"
                                                                            min="0"
                                                                            value={
                                                                                editQty
                                                                            }
                                                                            onChange={(e) =>
                                                                                setEditQty(
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                            onKeyDown={
                                                                                handleKeyDownEditQty
                                                                            }
                                                                            className="form-input edit-qty-input"
                                                                        />

                                                                    ) : (

                                                                        item.qty

                                                                    )}

                                                                </td>


                                                                <td className="col-satuan">

                                                                    {sedangDiedit ? (

                                                                        <select
                                                                            value={
                                                                                editSatuan
                                                                            }
                                                                            onChange={(e) =>
                                                                                setEditSatuan(
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                            onKeyDown={
                                                                                handleKeyDownEditQty
                                                                            }
                                                                            className="form-input edit-satuan-select"
                                                                        >

                                                                            <option value="SET">
                                                                                SET
                                                                            </option>

                                                                            <option value="PCS">
                                                                                PCS
                                                                            </option>

                                                                        </select>

                                                                    ) : (

                                                                        item.satuan

                                                                    )}

                                                                </td>


                                                                <td className="col-action">

                                                                    {sedangDiedit ? (

                                                                        <div className="action-buttons">

                                                                            <button
                                                                                type="button"
                                                                                onClick={
                                                                                    simpanEditItem
                                                                                }
                                                                                className="btn-simpan-edit"
                                                                                title="Simpan perubahan"
                                                                            >
                                                                                ✓
                                                                            </button>

                                                                            <button
                                                                                type="button"
                                                                                onClick={
                                                                                    batalEditItem
                                                                                }
                                                                                className="btn-batal-edit"
                                                                                title="Batal edit"
                                                                            >
                                                                                ✕
                                                                            </button>

                                                                        </div>

                                                                    ) : (

                                                                        <div className="action-buttons">

                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    mulaiEditItem(
                                                                                        item
                                                                                    )
                                                                                }
                                                                                className="btn-edit"
                                                                                title="Edit qty & satuan"
                                                                            >
                                                                                ✎
                                                                            </button>

                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    hapusItem(
                                                                                        item.id
                                                                                    )
                                                                                }
                                                                                className="btn-hapus"
                                                                                title="Hapus barang"
                                                                            >
                                                                                🗑
                                                                            </button>

                                                                        </div>

                                                                    )}

                                                                </td>

                                                            </tr>

                                                        );
                                                    }
                                                )}

                                            </tbody>

                                        </table>

                                    </div>


                                    <div className="pesanan-footer">

                                        <div className="total-items">

                                            Total{" "}

                                            <strong>
                                                {pesanan.length}
                                            </strong>{" "}

                                            item

                                            {adaDraftTersimpan && (

                                                <button
                                                    type="button"
                                                    onClick={buangDraft}
                                                    className="link-buang-draft"
                                                >
                                                    Buang Draft
                                                </button>

                                            )}

                                        </div>


                                        <div className="footer-actions">

                                            <button
                                                type="button"
                                                onClick={simpanDraft}
                                                className="btn-secondary btn-draft"
                                            >
                                                Simpan Draft
                                            </button>

                                            <button
                                                type="button"
                                                onClick={
                                                    simpanPesanan
                                                }
                                                className="btn-primary btn-simpan"
                                            >
                                                Simpan Pesanan
                                            </button>

                                        </div>

                                    </div>

                                </>

                            ) : (

                                <div className="empty-pesanan">

                                    <div className="empty-icon">
                                        🛒
                                    </div>

                                    <div className="empty-title">
                                        Belum Ada Pesanan
                                    </div>

                                    <div className="empty-text">
                                        Pilih toko terlebih dahulu,
                                        kemudian tambahkan barang
                                        ke dalam pesanan.
                                    </div>

                                </div>

                            )}

                        </section>

                    </div>

                </div>

            </main>


            <LeaveModal
                show={showLeaveModal}
                pesananCount={pesanan.length}
                tokoNama={tokoDipilih ? tokoDipilih.namaToko : "-"}
                onBatal={handleBatalPindah}
                onLanjutTanpaSimpan={handleLanjutTanpaSimpan}
                onSimpanDanLanjut={handleSimpanDanLanjut}
            />

            <NotifModal
                notif={notif}
                onClose={tutupNotif}
            />

        </>
    );
}


export default PesananSales;