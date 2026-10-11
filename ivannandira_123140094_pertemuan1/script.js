/**
 * Mini POS - Sistem Kasir & Keranjang Belanja Sederhana
 * Praktikum Pemrograman Web
 * Penulis: Ivannandira (123140094)
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. KONSTANTA & INISIALISASI VARIABEL
  // ==========================================
  const STORAGE_KEY = 'mini_pos_cart';
  const MIN_DISCOUNT_THRESHOLD = 50000; // Minimal belanja Rp 50.000 untuk dapat diskon
  const DISCOUNT_RATE = 0.10; // Diskon 10%

  // Mengambil data dari localStorage dengan JSON.parse
  let cartItems = loadCartFromStorage();

  // ==========================================
  // 2. ELEMEN DOM
  // ==========================================
  // Form & Input
  const itemForm = document.getElementById('itemForm');
  const itemNameInput = document.getElementById('itemName');
  const itemPriceInput = document.getElementById('itemPrice');
  const itemQtyInput = document.getElementById('itemQty');

  // Error Containers
  const groupItemName = document.getElementById('groupItemName');
  const groupItemPrice = document.getElementById('groupItemPrice');
  const groupItemQty = document.getElementById('groupItemQty');
  const errorItemName = document.getElementById('errorItemName');
  const errorItemPrice = document.getElementById('errorItemPrice');
  const errorItemQty = document.getElementById('errorItemQty');

  // Keranjang
  const cartTableBody = document.getElementById('cartTableBody');
  const cartEmptyState = document.getElementById('cartEmptyState');
  const cartCountBadge = document.getElementById('cartCountBadge');
  const btnResetCart = document.getElementById('btnResetCart');

  // Kalkulator Ringkasan
  const dispTotalBelanja = document.getElementById('dispTotalBelanja');
  const dispNominalDiskon = document.getElementById('dispNominalDiskon');
  const dispTotalAkhir = document.getElementById('dispTotalAkhir');
  const badgeDiskonStatus = document.getElementById('badgeDiskonStatus');

  // Pembayaran
  const uangBayarInput = document.getElementById('uangBayar');
  const paymentFeedback = document.getElementById('paymentFeedback');
  const feedbackIcon = document.getElementById('feedbackIcon');
  const feedbackTitle = document.getElementById('feedbackTitle');
  const feedbackDetail = document.getElementById('feedbackDetail');
  const quickCashButtons = document.querySelectorAll('.btn-quick');
  const btnCetakStruk = document.getElementById('btnCetakStruk');

  // Modal Struk
  const receiptModal = document.getElementById('receiptModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnPrintReceipt = document.getElementById('btnPrintReceipt');
  const receiptDateTime = document.getElementById('receiptDateTime');
  const receiptItems = document.getElementById('receiptItems');
  const receiptSummary = document.getElementById('receiptSummary');

  // Live Clock
  const liveClock = document.getElementById('liveClock');

  // ==========================================
  // 3. FUNGSI UTILITAS
  // ==========================================

  /**
   * Format angka menjadi format mata uang Rupiah
   * Contoh: 50000 -> "Rp 50.000"
   */
  function formatRupiah(number) {
    if (isNaN(number) || number === null) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number);
  }

  /**
   * Mengambil data keranjang dari LocalStorage
   * Wajib menggunakan JSON.parse
   */
  function loadCartFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Gagal membaca data dari localStorage:', error);
      return [];
    }
  }

  /**
   * Menyimpan data keranjang ke LocalStorage
   * Wajib menggunakan JSON.stringify
   */
  function saveCartToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error('Gagal menyimpan data ke localStorage:', error);
    }
  }

  /**
   * Jam digital realtime di header
   */
  function updateLiveClock() {
    const now = new Date();
    const options = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    liveClock.textContent = now.toLocaleDateString('id-ID', options);
  }
  setInterval(updateLiveClock, 1000);
  updateLiveClock();

  // ==========================================
  // 4. VALIDASI INPUT FORM
  // ==========================================

  /**
   * Menampilkan pesan error pada field input
   */
  function setError(formGroup, errorElement, message) {
    formGroup.classList.add('has-error');
    errorElement.textContent = message;
  }

  /**
   * Membersihkan pesan error pada field input
   */
  function clearError(formGroup, errorElement) {
    formGroup.classList.remove('has-error');
    errorElement.textContent = '';
  }

  /**
   * Membersihkan seluruh pesan error pada form
   */
  function clearAllErrors() {
    clearError(groupItemName, errorItemName);
    clearError(groupItemPrice, errorItemPrice);
    clearError(groupItemQty, errorItemQty);
  }

  /**
   * Melakukan validasi form input barang sesuai spesifikasi:
   * - Nama Barang: minimal 3 karakter
   * - Harga Satuan: angka positif >= 500
   * - Qty: bilangan bulat >= 1
   */
  function validateForm() {
    clearAllErrors();
    let isValid = true;

    // 1. Validasi Nama Barang
    const nameVal = itemNameInput.value.trim();
    if (!nameVal) {
      setError(groupItemName, errorItemName, 'Nama barang wajib diisi!');
      isValid = false;
    } else if (nameVal.length < 3) {
      setError(groupItemName, errorItemName, 'Nama barang minimal 3 karakter!');
      isValid = false;
    }

    // 2. Validasi Harga Satuan
    const priceVal = itemPriceInput.value.trim();
    const priceNum = Number(priceVal);
    if (!priceVal) {
      setError(groupItemPrice, errorItemPrice, 'Harga satuan wajib diisi!');
      isValid = false;
    } else if (isNaN(priceNum) || priceNum <= 0) {
      setError(groupItemPrice, errorItemPrice, 'Harga harus berupa angka positif!');
      isValid = false;
    } else if (priceNum < 500) {
      setError(groupItemPrice, errorItemPrice, 'Harga satuan minimal Rp 500!');
      isValid = false;
    }

    // 3. Validasi Jumlah (Qty)
    const qtyVal = itemQtyInput.value.trim();
    const qtyNum = Number(qtyVal);
    if (!qtyVal) {
      setError(groupItemQty, errorItemQty, 'Jumlah (Qty) wajib diisi!');
      isValid = false;
    } else if (isNaN(qtyNum) || !Number.isInteger(qtyNum)) {
      setError(groupItemQty, errorItemQty, 'Qty wajib berupa angka bulat!');
      isValid = false;
    } else if (qtyNum < 1) {
      setError(groupItemQty, errorItemQty, 'Jumlah (Qty) minimal 1!');
      isValid = false;
    }

    return isValid;
  }

  // Event listener realtime untuk membersihkan error saat user mulai mengetik
  itemNameInput.addEventListener('input', () => clearError(groupItemName, errorItemName));
  itemPriceInput.addEventListener('input', () => clearError(groupItemPrice, errorItemPrice));
  itemQtyInput.addEventListener('input', () => clearError(groupItemQty, errorItemQty));

  // ==========================================
  // 5. MANAJEMEN KERANJANG (CRUD)
  // ==========================================

  /**
   * Event Submit Tambah Barang
   */
  itemForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Jalankan validasi
    if (!validateForm()) {
      return; // Cegah barang masuk ke keranjang jika tidak valid
    }

    // Ambil data yang valid
    const name = itemNameInput.value.trim();
    const price = parseFloat(itemPriceInput.value);
    const qty = parseInt(itemQtyInput.value, 10);
    const subtotal = price * qty;

    // Buat item baru
    const newItem = {
      id: Date.now(), // Unique ID berdasarkan timestamp
      name: name,
      price: price,
      qty: qty,
      subtotal: subtotal
    };

    // Tambahkan ke array keranjang
    cartItems.push(newItem);

    // Simpan ke localStorage
    saveCartToStorage();

    // Reset form otomatis setelah barang berhasil ditambahkan
    itemForm.reset();
    clearAllErrors();
    itemNameInput.focus();

    // Render ulang tampilan keranjang & perhitungan
    renderCart();
  });

  /**
   * Menghapus item dari keranjang berdasarkan index
   */
  window.deleteItem = function(index) {
    if (index >= 0 && index < cartItems.length) {
      const removedItem = cartItems[index];
      cartItems.splice(index, 1);
      
      // Update data di localStorage
      saveCartToStorage();

      // Render ulang & hitung ulang total otomatis
      renderCart();
      console.log(`Item "${removedItem.name}" berhasil dihapus.`);
    }
  };

  /**
   * Reset / Transaksi Baru: Mengosongkan seluruh keranjang & membersihkan localStorage
   */
  btnResetCart.addEventListener('click', () => {
    if (cartItems.length === 0) {
      alert('Keranjang belanja sudah dalam keadaan kosong.');
      return;
    }

    const confirmReset = confirm('Apakah Anda yakin ingin memulai Transaksi Baru dan mengosongkan seluruh keranjang?');
    if (confirmReset) {
      cartItems = [];
      localStorage.removeItem(STORAGE_KEY);
      uangBayarInput.value = '';
      renderCart();
    }
  });

  // ==========================================
  // 6. PERHITUNGAN OTOMATIS & RENDER
  // ==========================================

  /**
   * Menghitung total belanja, diskon, dan total akhir
   */
  function calculateTotals() {
    // 1. Akumulasi Total Belanja (Subtotal seluruh barang)
    const totalBelanja = cartItems.reduce((acc, item) => acc + item.subtotal, 0);

    // 2. Diskon 10% jika Total Belanja >= Rp 50.000
    let diskonNominal = 0;
    const isEligibleDiscount = totalBelanja >= MIN_DISCOUNT_THRESHOLD;

    if (isEligibleDiscount) {
      diskonNominal = Math.round(totalBelanja * DISCOUNT_RATE);
    }

    // 3. Total Akhir setelah diskon
    const totalAkhir = totalBelanja - diskonNominal;

    return {
      totalBelanja,
      diskonNominal,
      isEligibleDiscount,
      totalAkhir
    };
  }

  /**
   * Menghitung kembalian berdasarkan input uang bayar
   */
  function calculatePayment() {
    const { totalAkhir } = calculateTotals();
    const uangBayarStr = uangBayarInput.value.trim();

    // Jika keranjang belanja kosong
    if (cartItems.length === 0) {
      paymentFeedback.className = 'payment-feedback';
      feedbackIcon.textContent = 'ℹ️';
      feedbackTitle.textContent = 'Status Pembayaran';
      feedbackDetail.textContent = 'Keranjang belanja masih kosong.';
      btnCetakStruk.disabled = true;
      return;
    }

    // Jika uang bayar belum diinput
    if (uangBayarStr === '') {
      paymentFeedback.className = 'payment-feedback';
      feedbackIcon.textContent = 'ℹ️';
      feedbackTitle.textContent = 'Status Pembayaran';
      feedbackDetail.textContent = 'Silakan masukkan nominal uang pembayaran.';
      btnCetakStruk.disabled = true;
      return;
    }

    const uangBayar = parseFloat(uangBayarStr);

    if (isNaN(uangBayar) || uangBayar < 0) {
      paymentFeedback.className = 'payment-feedback status-insufficient';
      feedbackIcon.textContent = '⚠️';
      feedbackTitle.textContent = 'Input Tidak Valid';
      feedbackDetail.textContent = 'Nominal uang tidak valid.';
      btnCetakStruk.disabled = true;
      return;
    }

    // Selisih pembayaran (Uang Bayar - Total Akhir)
    const kembalian = uangBayar - totalAkhir;

    if (kembalian < 0) {
      // Uang Kurang
      const kekurangan = Math.abs(kembalian);
      paymentFeedback.className = 'payment-feedback status-insufficient';
      feedbackIcon.textContent = '❌';
      feedbackTitle.textContent = 'Uang Pembayaran Belum Mencukupi';
      feedbackDetail.textContent = `Kurang: ${formatRupiah(kekurangan)}`;
      btnCetakStruk.disabled = true;
    } else {
      // Uang Cukup / Lebih (Kembalian)
      paymentFeedback.className = 'payment-feedback status-success';
      feedbackIcon.textContent = '✅';
      feedbackTitle.textContent = kembalian === 0 ? 'Pembayaran Pas' : 'Kembalian';
      feedbackDetail.textContent = kembalian === 0 ? 'Uang pas, tidak ada kembalian' : formatRupiah(kembalian);
      btnCetakStruk.disabled = false;
    }
  }

  /**
   * Merender isi tabel keranjang belanja dan memperbarui kalkulator
   */
  function renderCart() {
    // 1. Render Baris Tabel
    cartTableBody.innerHTML = '';

    if (cartItems.length === 0) {
      cartEmptyState.classList.add('active');
    } else {
      cartEmptyState.classList.remove('active');

      cartItems.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td class="text-center font-mono">${index + 1}</td>
          <td class="item-name-cell">${escapeHtml(item.name)}</td>
          <td class="text-right font-mono">${formatRupiah(item.price)}</td>
          <td class="text-center">
            <span class="qty-badge font-mono">${item.qty}</span>
          </td>
          <td class="text-right font-mono fw-bold">${formatRupiah(item.subtotal)}</td>
          <td class="text-center">
            <button 
              type="button" 
              class="btn btn-danger-icon" 
              onclick="deleteItem(${index})" 
              title="Hapus barang ini"
              aria-label="Hapus item"
            >
              Hapus
            </button>
          </td>
        `;
        cartTableBody.appendChild(row);
      });
    }

    // 2. Update Badge Jumlah Item
    const totalQty = cartItems.reduce((acc, it) => acc + it.qty, 0);
    cartCountBadge.textContent = `${cartItems.length} Item (${totalQty} pcs)`;

    // 3. Kalkulasi & Update Ringkasan Belanja
    const { totalBelanja, diskonNominal, isEligibleDiscount, totalAkhir } = calculateTotals();

    dispTotalBelanja.textContent = formatRupiah(totalBelanja);
    dispNominalDiskon.textContent = isEligibleDiscount ? `- ${formatRupiah(diskonNominal)}` : 'Rp 0';
    dispTotalAkhir.textContent = formatRupiah(totalAkhir);

    // Update Tag Status Diskon
    if (isEligibleDiscount) {
      badgeDiskonStatus.textContent = 'Diskon 10% Aktif';
      badgeDiskonStatus.classList.add('active');
    } else {
      badgeDiskonStatus.textContent = 'Min. Rp 50.000';
      badgeDiskonStatus.classList.remove('active');
    }

    // 4. Hitung Ulang Pembayaran & Kembalian
    calculatePayment();
  }

  /**
   * Helper keamanan untuk mencegah XSS pada rendering HTML
   */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Event listener input uang bayar (realtime kalkulasi)
  uangBayarInput.addEventListener('input', calculatePayment);

  // Quick cash buttons listener
  quickCashButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const { totalAkhir } = calculateTotals();
      if (btn.id === 'btnQuickPas') {
        uangBayarInput.value = totalAkhir > 0 ? totalAkhir : '';
      } else {
        const val = btn.getAttribute('data-val');
        if (val) uangBayarInput.value = val;
      }
      calculatePayment();
    });
  });

  // ==========================================
  // 7. MODAL CETAK STRUK PEMBAYARAN
  // ==========================================
  btnCetakStruk.addEventListener('click', () => {
    const { totalBelanja, diskonNominal, totalAkhir } = calculateTotals();
    const uangBayar = parseFloat(uangBayarInput.value) || 0;
    const kembalian = uangBayar - totalAkhir;

    if (cartItems.length === 0 || uangBayar < totalAkhir) return;

    // Set tanggal waktu saat ini
    const now = new Date();
    receiptDateTime.textContent = now.toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // Render list barang di struk
    receiptItems.innerHTML = '';
    cartItems.forEach((item) => {
      const line = document.createElement('div');
      line.className = 'receipt-item-line';
      line.innerHTML = `
        <span>${escapeHtml(item.name)}</span>
        <span>${formatRupiah(item.subtotal)}</span>
      `;
      const sub = document.createElement('div');
      sub.className = 'receipt-item-sub';
      sub.textContent = `${item.qty} x ${formatRupiah(item.price)}`;

      receiptItems.appendChild(line);
      receiptItems.appendChild(sub);
    });

    // Render ringkasan di struk
    receiptSummary.innerHTML = `
      <div class="receipt-sum-row">
        <span>Total Belanja:</span>
        <span>${formatRupiah(totalBelanja)}</span>
      </div>
      <div class="receipt-sum-row">
        <span>Diskon (10%):</span>
        <span>${diskonNominal > 0 ? '-' + formatRupiah(diskonNominal) : 'Rp 0'}</span>
      </div>
      <div class="receipt-sum-row receipt-total">
        <span>TOTAL AKHIR:</span>
        <span>${formatRupiah(totalAkhir)}</span>
      </div>
      <div class="receipt-sum-row" style="margin-top: 6px;">
        <span>Tunai / Bayar:</span>
        <span>${formatRupiah(uangBayar)}</span>
      </div>
      <div class="receipt-sum-row">
        <span>Kembalian:</span>
        <span>${formatRupiah(kembalian)}</span>
      </div>
    `;

    receiptModal.style.display = 'flex';
  });

  btnCloseModal.addEventListener('click', () => {
    receiptModal.style.display = 'none';
  });

  receiptModal.addEventListener('click', (e) => {
    if (e.target === receiptModal) {
      receiptModal.style.display = 'none';
    }
  });

  btnPrintReceipt.addEventListener('click', () => {
    window.print();
  });

  // ==========================================
  // 8. INISIALISASI AWAL
  // ==========================================
  renderCart();
});
