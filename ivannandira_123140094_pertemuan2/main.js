/**
 * ===================================================================
 * STUDENTFLOW - PERSONAL DASHBOARD MAHASISWA
 * Author: Ivan Nandira Mangunang (123140094) - Kelas RA
 * Praktikum Pemrograman Web - Pertemuan 2
 *
 * ES6+ Features Implemented:
 * 1. let & const (Strictly no var used)
 * 2. ES6 Classes (TaskItem & DashboardApp)
 * 3. Arrow Functions
 * 4. Template Literals (`${...}`)
 * 5. Async / Await with try / catch (Weather & Quote APIs)
 * 6. Destructuring Assignment (Parameters & Objects)
 * 7. Spread Operator (...) for Immutable State Management
 * 8. Web Storage API (localStorage)
 * ===================================================================
 */

// ===================================================================
// 1. DATA MODEL CLASS: TaskItem (OOP ES6)
// ===================================================================

/**
 * Class yang memodelkan entitas setiap tugas / catatan mahasiswa.
 */
class TaskItem {
  /**
   * Constructor dengan Destructuring pada parameter dan default values
   */
  constructor({
    id = Date.now().toString(),
    title = '',
    category = 'Tugas Kuliah',
    deadline = '',
    priority = 'Sedang',
    notes = '',
    isCompleted = false,
    createdAt = new Date().toISOString()
  }) {
    this.id = id;
    this.title = title;
    this.category = category;
    this.deadline = deadline;
    this.priority = priority;
    this.notes = notes;
    this.isCompleted = isCompleted;
    this.createdAt = createdAt;
  }

  /**
   * Mengubah status penyelesaian tugas (toggle)
   */
  toggleStatus() {
    this.isCompleted = !this.isCompleted;
  }

  /**
   * Memperbarui atribut tugas menggunakan Destructuring pada parameter
   */
  update({ title, category, deadline, priority, notes }) {
    if (title !== undefined) this.title = title.trim();
    if (category !== undefined) this.category = category;
    if (deadline !== undefined) this.deadline = deadline;
    if (priority !== undefined) this.priority = priority;
    if (notes !== undefined) this.notes = notes.trim();
  }

  /**
   * Mengecek apakah tugas sudah melewati batas deadline (Overdue)
   * Arrow function digunakan sebagai pembantu
   */
  isOverdue() {
    if (!this.deadline || this.isCompleted) return false;
    const taskDate = new Date(this.deadline);
    const now = new Date();
    return taskDate < now;
  }

  /**
   * Mengecek apakah deadline tugas jatuh pada hari ini
   */
  isDueToday() {
    if (!this.deadline || this.isCompleted) return false;
    const taskDate = new Date(this.deadline);
    const now = new Date();
    return (
      taskDate.getDate() === now.getDate() &&
      taskDate.getMonth() === now.getMonth() &&
      taskDate.getFullYear() === now.getFullYear()
    );
  }

  /**
   * Mengonversi objek instans ke objek murni untuk persistensi JSON
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      category: this.category,
      deadline: this.deadline,
      priority: this.priority,
      notes: this.notes,
      isCompleted: this.isCompleted,
      createdAt: this.createdAt
    };
  }
}

// ===================================================================
// 2. HELPER UTILITIES (Arrow Functions)
// ===================================================================

/**
 * Arrow Function 1: Format tanggal dan waktu menjadi format Indonesia yang ramah dibaca
 */
const formatDateTimeIndonesia = (isoString) => {
  if (!isoString) return 'Tidak ada deadline';
  const dateObj = new Date(isoString);
  if (isNaN(dateObj.getTime())) return 'Tanggal tidak valid';

  const options = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };

  return dateObj.toLocaleDateString('id-ID', options);
};

/**
 * Arrow Function 2: Konversi WMO Weather Code Open-Meteo ke label bahasa Indonesia dan ikon
 */
const getWeatherMeta = (code, isDay = 1) => {
  const weatherMap = {
    0: { label: isDay ? 'Cerah Berawan' : 'Malam Cerah', icon: isDay ? 'fa-sun' : 'fa-moon', color: '#f59e0b' },
    1: { label: 'Sebagian Cerah', icon: isDay ? 'fa-cloud-sun' : 'fa-cloud-moon', color: '#38bdf8' },
    2: { label: 'Berawan Tipis', icon: 'fa-cloud-sun', color: '#94a3b8' },
    3: { label: 'Mendung Berawan', icon: 'fa-cloud', color: '#64748b' },
    45: { label: 'Berkabut Tebal', icon: 'fa-smog', color: '#94a3b8' },
    48: { label: 'Kabut Berembun', icon: 'fa-smog', color: '#94a3b8' },
    51: { label: 'Gerimis Ringan', icon: 'fa-cloud-rain', color: '#38bdf8' },
    53: { label: 'Gerimis Sedang', icon: 'fa-cloud-rain', color: '#38bdf8' },
    55: { label: 'Gerimis Lebat', icon: 'fa-cloud-showers-heavy', color: '#0284c7' },
    61: { label: 'Hujan Ringan', icon: 'fa-cloud-rain', color: '#38bdf8' },
    63: { label: 'Hujan Sedang', icon: 'fa-cloud-showers-heavy', color: '#0284c7' },
    65: { label: 'Hujan Lebat', icon: 'fa-cloud-showers-water', color: '#1d4ed8' },
    80: { label: 'Hujan Lokal', icon: 'fa-cloud-sun-rain', color: '#0284c7' },
    81: { label: 'Hujan Deras', icon: 'fa-cloud-showers-heavy', color: '#1e40af' },
    82: { label: 'Hujan Badai', icon: 'fa-cloud-showers-water', color: '#1e3a8a' },
    95: { label: 'Badai Petir', icon: 'fa-bolt-lightning', color: '#eab308' },
    96: { label: 'Badai Petir & Es', icon: 'fa-cloud-bolt', color: '#eab308' },
    99: { label: 'Badai Petir Hebat', icon: 'fa-cloud-bolt', color: '#dc2626' }
  };

  return weatherMap[code] || {
    label: 'Kondisi Berawan',
    icon: 'fa-cloud',
    color: '#38bdf8'
  };
};

/**
 * Arrow Function 3: Sanitasi teks string untuk mencegah injeksi HTML (XSS Protection)
 */
const sanitizeHTML = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Arrow Function 4: Menentukan pesan sapaan dinamis berdasarkan jam saat ini
 */
const getGreetingData = () => {
  const currentHour = new Date().getHours();
  if (currentHour >= 4 && currentHour < 11) {
    return {
      title: 'Selamat Pagi, Mahasiswa! 🌅',
      message: 'Awali hari dengan semangat dan fokus menuntaskan target belajar!'
    };
  } else if (currentHour >= 11 && currentHour < 15) {
    return {
      title: 'Selamat Siang, Mahasiswa! ☀️',
      message: 'Tetap produktif dan jangan lupa istirahat sejenak di sela-sela perkuliahan.'
    };
  } else if (currentHour >= 15 && currentHour < 18) {
    return {
      title: 'Selamat Sore, Mahasiswa! 🌇',
      message: 'Waktu yang tepat untuk mereview materi kuliah dan menyelesaikan tugas.'
    };
  } else {
    return {
      title: 'Selamat Malam, Mahasiswa! 🌙',
      message: 'Maksimalkan istirahat atau cicil proyek kuliah sebelum deadline tiba.'
    };
  }
};

// ===================================================================
// 3. MAIN APPLICATION CLASS: DashboardApp (OOP ES6)
// ===================================================================

/**
 * Class pengelola utama state aplikasi, DOM, localStorage, dan API
 */
class DashboardApp {
  constructor() {
    // Kunci penyimpanan di localStorage
    this.STORAGE_KEY = 'studentflow_tasks_v3';

    // State aplikasi To-Do List (Array of TaskItem)
    this.tasks = [];

    // State filter & pencarian
    this.filterStatus = 'all'; // 'all' | 'pending' | 'completed'
    this.filterCategory = 'all';
    this.sortMode = 'newest';
    this.searchQuery = '';

    // Cache elemen-elemen DOM
    this.dom = {
      // Clock & Header
      liveClock: document.getElementById('liveClock'),
      liveDate: document.getElementById('liveDate'),
      greetingHeading: document.getElementById('greetingHeading'),
      greetingMessage: document.getElementById('greetingMessage'),

      // Widgets
      weatherBody: document.getElementById('weatherBody'),
      refreshWeatherBtn: document.getElementById('refreshWeatherBtn'),
      quoteBody: document.getElementById('quoteBody'),
      refreshQuoteBtn: document.getElementById('refreshQuoteBtn'),

      // Stats
      statTotal: document.getElementById('statTotal'),
      statPending: document.getElementById('statPending'),
      statCompleted: document.getElementById('statCompleted'),
      statUrgent: document.getElementById('statUrgent'),
      progressPercentage: document.getElementById('progressPercentage'),
      progressBarFill: document.getElementById('progressBarFill'),

      // Task Creation Form
      taskForm: document.getElementById('taskForm'),
      taskTitle: document.getElementById('taskTitle'),
      taskCategory: document.getElementById('taskCategory'),
      taskPriority: document.getElementById('taskPriority'),
      taskDeadline: document.getElementById('taskDeadline'),
      taskNotes: document.getElementById('taskNotes'),
      titleError: document.getElementById('titleError'),

      // Filter & Toolbar
      searchTaskInput: document.getElementById('searchTaskInput'),
      clearSearchBtn: document.getElementById('clearSearchBtn'),
      filterTabs: document.querySelectorAll('.filter-tab'),
      filterCategorySelect: document.getElementById('filterCategorySelect'),
      sortTasksSelect: document.getElementById('sortTasksSelect'),
      countFilterAll: document.getElementById('countFilterAll'),
      countFilterPending: document.getElementById('countFilterPending'),
      countFilterCompleted: document.getElementById('countFilterCompleted'),
      clearAllCompletedBtn: document.getElementById('clearAllCompletedBtn'),

      // Task List
      tasksList: document.getElementById('tasksList'),

      // Modal Edit
      editModal: document.getElementById('editModal'),
      closeEditModalBtn: document.getElementById('closeEditModalBtn'),
      cancelEditBtn: document.getElementById('cancelEditBtn'),
      editTaskForm: document.getElementById('editTaskForm'),
      editTaskId: document.getElementById('editTaskId'),
      editTaskTitle: document.getElementById('editTaskTitle'),
      editTaskCategory: document.getElementById('editTaskCategory'),
      editTaskPriority: document.getElementById('editTaskPriority'),
      editTaskDeadline: document.getElementById('editTaskDeadline'),
      editTaskNotes: document.getElementById('editTaskNotes'),
      editTitleError: document.getElementById('editTitleError'),

      // Toast
      toastContainer: document.getElementById('toastContainer')
    };

    // Inisialisasi aplikasi
    this.init();
  }

  /**
   * Menjalankan urutan awal aplikasi
   */
  init() {
    this.startClock();
    this.updateGreeting();
    this.loadTasksFromStorage();
    this.bindEvents();
    this.render();

    // Fetch API Cuaca & Quote (Async/Await)
    this.fetchWeather();
    this.fetchQuote();
  }

  // -----------------------------------------------------------------
  // CLOCK & GREETING
  // -----------------------------------------------------------------

  /**
   * Menjalankan jam digital real-time setiap detik
   */
  startClock() {
    const updateTime = () => {
      const now = new Date();
      
      // Jam:Menit:Detik WIB
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      this.dom.liveClock.textContent = `${hours}:${minutes}:${seconds} WIB`;

      // Format hari dan tanggal
      const options = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      };
      this.dom.liveDate.textContent = now.toLocaleDateString('id-ID', options);
    };

    updateTime();
    setInterval(updateTime, 1000);
  }

  /**
   * Memperbarui ucapan sapaan sesuai jam
   */
  updateGreeting() {
    const { title, message } = getGreetingData();
    if (this.dom.greetingHeading) this.dom.greetingHeading.textContent = title;
    if (this.dom.greetingMessage) this.dom.greetingMessage.textContent = message;
  }

  // -----------------------------------------------------------------
  // LOCALSTORAGE MANAGEMENT
  // -----------------------------------------------------------------

  /**
   * Memuat data tugas dari localStorage
   */
  loadTasksFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const rawArray = JSON.parse(stored);
        if (Array.isArray(rawArray)) {
          // Instansiasi ulang objek TaskItem menggunakan destructuring parameter
          this.tasks = rawArray.map((item) => new TaskItem({ ...item }));
          return;
        }
      }

      // Jika belum ada data sama sekali, berikan data awal (seeding)
      this.seedInitialTasks();
    } catch (error) {
      console.error('Gagal memuat tugas dari localStorage:', error);
      this.seedInitialTasks();
    }
  }

  /**
   * Menyimpan data tugas ke localStorage
   */
  saveTasksToStorage() {
    try {
      const serialized = JSON.stringify(this.tasks.map((task) => task.toJSON()));
      localStorage.setItem(this.STORAGE_KEY, serialized);
    } catch (error) {
      console.error('Gagal menyimpan tugas ke localStorage:', error);
      this.showToast('Gagal menyimpan perubahan ke memori peramban!', 'error');
    }
  }

  /**
   * Data awal bermanfaat untuk mahasiswa jika localStorage kosong
   */
  seedInitialTasks() {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const formatForInput = (d) => {
      d.setHours(23, 59, 0, 0);
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const initialTasksData = [
      {
        id: 'task-init-1',
        title: 'Mengerjakan Modul 2 Praktikum Pemrograman Web (Dashboard Mahasiswa)',
        category: 'Praktikum',
        deadline: formatForInput(tomorrow),
        priority: 'Tinggi',
        notes: 'Implementasikan OOP ES6, Async/Await, Destructuring, dan Spread Operator.',
        isCompleted: false
      },
      {
        id: 'task-init-2',
        title: 'Koreksi Tugas & Asistensi Praktikum Dasar Rekayasa Perangkat Lunak',
        category: 'Praktikum',
        deadline: formatForInput(nextWeek),
        priority: 'Sedang',
        notes: 'Review modul UML diagram (Use Case & Class Diagram) serta rekap nilai tugas mahasiswa.',
        isCompleted: false
      },
      {
        id: 'task-init-3',
        title: 'Membaca Dokumentasi Modern JavaScript (MDN Web Docs)',
        category: 'Tugas Kuliah',
        deadline: '',
        priority: 'Rendah',
        notes: 'Fokus pada ES6 Modules, Spread Operator, dan Web Storage API.',
        isCompleted: true
      }
    ];

    // Menggunakan instansiasi TaskItem dan Spread Operator
    this.tasks = initialTasksData.map((data) => new TaskItem({ ...data }));
    this.saveTasksToStorage();
  }

  // -----------------------------------------------------------------
  // ASYNC/AWAIT API: CUACA REAL-TIME (Open-Meteo API)
  // -----------------------------------------------------------------

  /**
   * Mengambil data cuaca kampus ITERA secara asinkron dengan try/catch
   */
  async fetchWeather() {
    const endpoint = 'https://api.open-meteo.com/v1/forecast?latitude=-5.36&longitude=105.31&current_weather=true';

    // Tampilkan state loading dengan Template Literals
    this.dom.weatherBody.innerHTML = `
      <div class="widget-loading">
        <div class="spinner"></div>
        <span>Memperbarui cuaca kampus ITERA...</span>
      </div>
    `;

    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP Error: status ${response.status}`);
      }

      const data = await response.json();

      // Destructuring parameter dari objek current_weather
      const { current_weather } = data;
      if (!current_weather) {
        throw new Error('Data cuaca tidak lengkap dari server');
      }

      // Render cuaca ke DOM
      this.renderWeather(current_weather);
    } catch (error) {
      console.error('Fetch weather error:', error);
      // Tampilkan UI pesan error jika gagal mengambil cuaca
      this.dom.weatherBody.innerHTML = `
        <div class="widget-error">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <span>Gagal memuat data cuaca real-time. Periksa koneksi internet Anda.</span>
          <button class="btn btn-sm btn-secondary" onclick="dashboardApp.fetchWeather()">
            <i class="fa-solid fa-rotate-right"></i> Coba Lagi
          </button>
        </div>
      `;
    }
  }

  /**
   * Menampilkan data cuaca yang berhasil diambil menggunakan Template Literals & Destructuring
   */
  renderWeather(currentWeather) {
    // Destructuring properti cuaca
    const { temperature, windspeed, weathercode, is_day, time } = currentWeather;
    const { label, icon, color } = getWeatherMeta(weathercode, is_day);

    const formattedTime = time ? time.replace('T', ' ') : 'Baru saja';

    this.dom.weatherBody.innerHTML = `
      <div class="weather-main-row">
        <div class="weather-temp-wrap">
          <span class="weather-temp">${temperature}</span>
          <span class="weather-unit">°C</span>
        </div>
        <div class="weather-icon-visual" style="color: ${color}">
          <i class="fa-solid ${icon}"></i>
        </div>
      </div>

      <div class="weather-desc-pill">
        <i class="fa-solid ${icon}"></i>
        <span>${label}</span>
      </div>

      <div class="weather-details-grid">
        <div class="weather-detail-item">
          <i class="fa-solid fa-wind"></i>
          <div>Kecepatan Angin: <strong>${windspeed} km/j</strong></div>
        </div>
        <div class="weather-detail-item">
          <i class="fa-solid ${is_day ? 'fa-sun' : 'fa-moon'}"></i>
          <div>Waktu: <strong>${is_day ? 'Siang Hari' : 'Malam Hari'}</strong></div>
        </div>
      </div>

      <div class="weather-footer-time">
        <i class="fa-regular fa-clock"></i> Diperbarui: ${formattedTime} UTC
      </div>
    `;
  }

  // -----------------------------------------------------------------
  // ASYNC/AWAIT API: QUOTES HARIAN (DummyJSON API)
  // -----------------------------------------------------------------

  /**
   * Mengambil kutipan motivasi acak secara asinkron dengan try/catch
   */
  async fetchQuote() {
    const endpoint = 'https://dummyjson.com/quotes/random';

    // State loading dengan Template Literals
    this.dom.quoteBody.innerHTML = `
      <div class="widget-loading">
        <div class="spinner"></div>
        <span>Mengambil kutipan inspirasi...</span>
      </div>
    `;

    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP Error: status ${response.status}`);
      }

      const quoteData = await response.json();

      // Destructuring properti quote & author
      const { quote, author } = quoteData;

      if (!quote || !author) {
        throw new Error('Data kutipan tidak valid');
      }

      // Render kutipan ke DOM
      this.renderQuote({ quote, author });
    } catch (error) {
      console.error('Fetch quote error:', error);
      // Fallback pesan jika API gagal / offline
      this.dom.quoteBody.innerHTML = `
        <div class="widget-error">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <span>Gagal memuat kutipan online.</span>
          <button class="btn btn-sm btn-secondary" onclick="dashboardApp.fetchQuote()">
            <i class="fa-solid fa-rotate-right"></i> Coba Lagi
          </button>
        </div>
      `;
    }
  }

  /**
   * Menampilkan kutipan harian dengan Template Literals dan Destructuring
   */
  renderQuote({ quote, author }) {
    this.dom.quoteBody.innerHTML = `
      <div class="quote-content">
        <div class="quote-bubble">
          <p class="quote-text">"${sanitizeHTML(quote)}"</p>
        </div>
        <div class="quote-author-wrap">
          <span class="quote-author">${sanitizeHTML(author)}</span>
          <span class="quote-tag"><i class="fa-solid fa-sparkles"></i> Daily Motivation</span>
        </div>
      </div>
    `;
  }

  // -----------------------------------------------------------------
  // STATE MANAGEMENT DENGAN SPREAD OPERATOR & IMMUTABILITY
  // -----------------------------------------------------------------

  /**
   * Menambahkan tugas baru secara immutable menggunakan Spread Operator (...)
   */
  addTask({ title, category, deadline, priority, notes }) {
    const newTask = new TaskItem({
      id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      category,
      deadline,
      priority,
      notes,
      isCompleted: false,
      createdAt: new Date().toISOString()
    });

    // Spread Operator (...) untuk menambahkan task ke awal array tanpa mutasi langsung
    this.tasks = [newTask, ...this.tasks];

    this.saveTasksToStorage();
    this.render();
    this.showToast('Tugas baru berhasil ditambahkan ke daftar!', 'success');
  }

  /**
   * Mengedit tugas secara immutable menggunakan map dan Spread Operator (...)
   */
  editTask(taskId, { title, category, deadline, priority, notes }) {
    const taskTarget = this.tasks.find((task) => task.id === taskId);
    if (!taskTarget) return;

    // Memperbarui entitas target
    taskTarget.update({ title, category, deadline, priority, notes });

    // Spread Operator (...) untuk menghasilkan salinan array baru
    this.tasks = [...this.tasks.map((task) => (task.id === taskId ? taskTarget : task))];

    this.saveTasksToStorage();
    this.render();
    this.showToast('Perubahan tugas berhasil disimpan!', 'success');
  }

  /**
   * Menghapus tugas berdasarkan ID secara immutable menggunakan Spread Operator & filter
   */
  deleteTask(taskId) {
    const taskToDelete = this.tasks.find((task) => task.id === taskId);
    if (!taskToDelete) return;

    // Spread Operator (...) pada hasil filter
    this.tasks = [...this.tasks.filter((task) => task.id !== taskId)];

    this.saveTasksToStorage();
    this.render();
    this.showToast(`Tugas "${taskToDelete.title}" berhasil dihapus.`, 'info');
  }

  /**
   * Toggle status tugas (selesai / belum selesai) secara immutable
   */
  toggleTask(taskId) {
    const taskToToggle = this.tasks.find((task) => task.id === taskId);
    if (!taskToToggle) return;

    taskToToggle.toggleStatus();

    // Spread Operator (...) membuat referensi state baru
    this.tasks = [...this.tasks.map((task) => (task.id === taskId ? taskToToggle : task))];

    this.saveTasksToStorage();
    this.render();

    const statusMessage = taskToToggle.isCompleted
      ? 'Selamat! Tugas telah selesai diselesaikan.'
      : 'Tugas dikembalikan ke status belum selesai.';
    this.showToast(statusMessage, 'success');
  }

  /**
   * Menghapus semua tugas yang berstatus selesai
   */
  clearCompletedTasks() {
    const completedCount = this.tasks.filter((task) => task.isCompleted).length;
    if (completedCount === 0) {
      this.showToast('Tidak ada tugas berstatus selesai untuk dibersihkan.', 'info');
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus ${completedCount} tugas yang sudah selesai?`)) {
      // Spread Operator (...) pada filter tugas yang belum selesai
      this.tasks = [...this.tasks.filter((task) => !task.isCompleted)];
      this.saveTasksToStorage();
      this.render();
      this.showToast(`${completedCount} tugas selesai berhasil dibersihkan.`, 'success');
    }
  }

  // -----------------------------------------------------------------
  // RENDERING & DOM UPDATES
  // -----------------------------------------------------------------

  /**
   * Render keseluruhan antarmuka: tugas dan statistik
   */
  render() {
    this.renderTasks();
    this.renderStats();
  }

  /**
   * Memfilter dan mengurutkan array tugas sebelum dirender
   */
  getFilteredTasks() {
    // 1. Salin array dengan Spread Operator (...)
    let result = [...this.tasks];

    // 2. Filter Status (Semua, Belum Selesai, Selesai)
    if (this.filterStatus === 'pending') {
      result = result.filter((task) => !task.isCompleted);
    } else if (this.filterStatus === 'completed') {
      result = result.filter((task) => task.isCompleted);
    }

    // 3. Filter Kategori
    if (this.filterCategory !== 'all') {
      result = result.filter((task) => task.category === this.filterCategory);
    }

    // 4. Filter Pencarian (Search Query)
    if (this.searchQuery.trim() !== '') {
      const query = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.notes.toLowerCase().includes(query) ||
          task.category.toLowerCase().includes(query)
      );
    }

    // 5. Pengurutan (Sorting)
    result.sort((a, b) => {
      if (this.sortMode === 'deadline') {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      } else if (this.sortMode === 'priority') {
        const priorityWeights = { Tinggi: 3, Sedang: 2, Rendah: 1 };
        return (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0);
      } else if (this.sortMode === 'alphabetical') {
        return a.title.localeCompare(b.title);
      } else {
        // 'newest' default
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return result;
  }

  /**
   * Render daftar tugas dinamis ke DOM menggunakan Template Literals
   */
  renderTasks() {
    const filtered = this.getFilteredTasks();

    // Update badge hitungan pada filter tabs
    const totalCount = this.tasks.length;
    const pendingCount = this.tasks.filter((t) => !t.isCompleted).length;
    const completedCount = this.tasks.filter((t) => t.isCompleted).length;

    this.dom.countFilterAll.textContent = totalCount;
    this.dom.countFilterPending.textContent = pendingCount;
    this.dom.countFilterCompleted.textContent = completedCount;

    // Jika kosong, tampilkan Empty State dengan Template Literals
    if (filtered.length === 0) {
      this.dom.tasksList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <i class="fa-solid fa-clipboard-list"></i>
          </div>
          <h4 class="empty-state-title">Tidak Ada Tugas yang Ditemukan</h4>
          <p class="empty-state-text">
            ${
              this.searchQuery
                ? `Tidak ada tugas yang cocok dengan kata kunci "<strong>${sanitizeHTML(this.searchQuery)}</strong>".`
                : 'Belum ada catatan tugas pada filter ini. Silakan tambahkan tugas baru melalui formulir di samping!'
            }
          </p>
        </div>
      `;
      return;
    }

    // Pembuatan HTML dinamis menggunakan Template Literals (${}) dan map
    const tasksHTML = filtered
      .map((task) => {
        // Destructuring properti dari objek task
        const { id, title, category, deadline, priority, notes, isCompleted } = task;

        // Tentukan kelas status deadline
        let deadlineClass = '';
        let deadlineIcon = 'fa-regular fa-calendar';
        if (task.isOverdue()) {
          deadlineClass = 'deadline-overdue';
          deadlineIcon = 'fa-solid fa-triangle-exclamation';
        } else if (task.isDueToday()) {
          deadlineClass = 'deadline-today';
          deadlineIcon = 'fa-solid fa-clock';
        }

        const priorityClass = `badge-priority-${priority.toLowerCase()}`;

        return `
          <div class="task-item ${isCompleted ? 'is-completed' : ''}" data-task-id="${id}" role="listitem">
            <div class="task-checkbox-wrap">
              <input 
                type="checkbox" 
                class="task-checkbox" 
                data-action="toggle" 
                data-task-id="${id}" 
                ${isCompleted ? 'checked' : ''} 
                aria-label="Tandai tugas ${sanitizeHTML(title)} sebagai ${isCompleted ? 'belum selesai' : 'selesai'}"
              >
            </div>

            <div class="task-content">
              <h4 class="task-title">${sanitizeHTML(title)}</h4>
              
              <div class="task-meta-row">
                <span class="badge badge-category">
                  <i class="fa-solid fa-tag"></i> ${sanitizeHTML(category)}
                </span>
                
                <span class="badge ${priorityClass}">
                  <i class="fa-solid fa-flag"></i> ${sanitizeHTML(priority)}
                </span>

                ${
                  deadline
                    ? `
                  <span class="task-deadline ${deadlineClass}">
                    <i class="${deadlineIcon}"></i> ${formatDateTimeIndonesia(deadline)}
                    ${task.isOverdue() ? '(Terlambat)' : ''}
                    ${task.isDueToday() ? '(Hari ini)' : ''}
                  </span>
                `
                    : ''
                }
              </div>

              ${
                notes
                  ? `
                <div class="task-notes">
                  ${sanitizeHTML(notes)}
                </div>
              `
                  : ''
              }
            </div>

            <div class="task-actions">
              <button 
                class="task-action-btn task-edit-btn" 
                data-action="edit" 
                data-task-id="${id}" 
                title="Edit tugas" 
                aria-label="Edit tugas"
              >
                <i class="fa-solid fa-pen"></i>
              </button>
              <button 
                class="task-action-btn task-delete-btn" 
                data-action="delete" 
                data-task-id="${id}" 
                title="Hapus tugas" 
                aria-label="Hapus tugas"
              >
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        `;
      })
      .join('');

    this.dom.tasksList.innerHTML = tasksHTML;
  }

  /**
   * Render metrik ringkasan dan progress bar
   */
  renderStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter((t) => t.isCompleted).length;
    const pending = total - completed;
    const urgent = this.tasks.filter((t) => t.priority === 'Tinggi' && !t.isCompleted).length;

    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    // Update DOM elemen metrik
    this.dom.statTotal.textContent = total;
    this.dom.statPending.textContent = pending;
    this.dom.statCompleted.textContent = completed;
    this.dom.statUrgent.textContent = urgent;

    this.dom.progressPercentage.textContent = `${percentage}%`;
    this.dom.progressBarFill.style.width = `${percentage}%`;
  }

  // -----------------------------------------------------------------
  // EVENT LISTENERS BINDING
  // -----------------------------------------------------------------

  /**
   * Mendaftarkan seluruh event listener interaksi pengguna
   */
  bindEvents() {
    // 1. Submit Tambah Tugas Baru
    this.dom.taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleCreateTaskSubmit();
    });

    // 2. Refresh Weather Button
    this.dom.refreshWeatherBtn.addEventListener('click', () => {
      this.fetchWeather();
      this.showToast('Memperbarui informasi cuaca kampus ITERA...', 'info');
    });

    // 3. Refresh Quote Button
    this.dom.refreshQuoteBtn.addEventListener('click', () => {
      this.fetchQuote();
      this.showToast('Mengambil kutipan inspirasi baru...', 'info');
    });

    // 4. Delegasi Event pada Task List (Toggle, Edit, Delete)
    this.dom.tasksList.addEventListener('click', (e) => {
      const targetBtn = e.target.closest('[data-action]');
      if (!targetBtn) return;

      const action = targetBtn.dataset.action;
      const taskId = targetBtn.dataset.taskId;

      if (action === 'toggle') {
        this.toggleTask(taskId);
      } else if (action === 'edit') {
        this.openEditModal(taskId);
      } else if (action === 'delete') {
        this.deleteTask(taskId);
      }
    });

    // 5. Pencarian Tugas Real-time
    this.dom.searchTaskInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      if (this.searchQuery.trim() !== '') {
        this.dom.clearSearchBtn.classList.remove('hidden');
      } else {
        this.dom.clearSearchBtn.classList.add('hidden');
      }
      this.renderTasks();
    });

    // 6. Clear Search Button
    this.dom.clearSearchBtn.addEventListener('click', () => {
      this.dom.searchTaskInput.value = '';
      this.searchQuery = '';
      this.dom.clearSearchBtn.classList.add('hidden');
      this.renderTasks();
      this.dom.searchTaskInput.focus();
    });

    // 7. Filter Tabs (Semua / Belum Selesai / Selesai)
    this.dom.filterTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        this.dom.filterTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        this.filterStatus = tab.dataset.filter;
        this.renderTasks();
      });
    });

    // 8. Filter Kategori Dropdown
    this.dom.filterCategorySelect.addEventListener('change', (e) => {
      this.filterCategory = e.target.value;
      this.renderTasks();
    });

    // 9. Sort Dropdown
    this.dom.sortTasksSelect.addEventListener('change', (e) => {
      this.sortMode = e.target.value;
      this.renderTasks();
    });

    // 10. Bersihkan Tugas Selesai Button
    this.dom.clearAllCompletedBtn.addEventListener('click', () => {
      this.clearCompletedTasks();
    });

    // 11. Modal Edit Events
    this.dom.closeEditModalBtn.addEventListener('click', () => this.closeEditModal());
    this.dom.cancelEditBtn.addEventListener('click', () => this.closeEditModal());
    this.dom.editModal.addEventListener('click', (e) => {
      if (e.target === this.dom.editModal) {
        this.closeEditModal();
      }
    });

    // 12. Submit Form Edit
    this.dom.editTaskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleEditTaskSubmit();
    });

    // 13. Escape key untuk menutup modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.dom.editModal.classList.contains('hidden')) {
        this.closeEditModal();
      }
    });
  }

  // -----------------------------------------------------------------
  // FORM HANDLERS & MODAL EDIT
  // -----------------------------------------------------------------

  /**
   * Menangani submit formulir penambahan tugas
   */
  handleCreateTaskSubmit() {
    const titleVal = this.dom.taskTitle.value.trim();
    const categoryVal = this.dom.taskCategory.value;
    const priorityVal = this.dom.taskPriority.value;
    const deadlineVal = this.dom.taskDeadline.value;
    const notesVal = this.dom.taskNotes.value.trim();

    // Validasi input judul
    if (!titleVal) {
      this.dom.titleError.textContent = 'Judul tugas wajib diisi!';
      this.dom.taskTitle.classList.add('input-invalid');
      this.dom.taskTitle.focus();
      return;
    }

    if (titleVal.length < 3) {
      this.dom.titleError.textContent = 'Judul tugas minimal 3 karakter!';
      this.dom.taskTitle.classList.add('input-invalid');
      this.dom.taskTitle.focus();
      return;
    }

    // Reset pesan error
    this.dom.titleError.textContent = '';
    this.dom.taskTitle.classList.remove('input-invalid');

    // Menambahkan tugas dengan destructuring argumen
    this.addTask({
      title: titleVal,
      category: categoryVal,
      deadline: deadlineVal,
      priority: priorityVal,
      notes: notesVal
    });

    // Reset formulir
    this.dom.taskForm.reset();
  }

  /**
   * Membuka modal edit dan mengisi formulir dengan data tugas target
   */
  openEditModal(taskId) {
    const targetTask = this.tasks.find((task) => task.id === taskId);
    if (!targetTask) return;

    // Destructuring atribut target
    const { id, title, category, priority, deadline, notes } = targetTask;

    this.dom.editTaskId.value = id;
    this.dom.editTaskTitle.value = title;
    this.dom.editTaskCategory.value = category;
    this.dom.editTaskPriority.value = priority;
    this.dom.editTaskDeadline.value = deadline || '';
    this.dom.editTaskNotes.value = notes || '';

    this.dom.editTitleError.textContent = '';
    this.dom.editTaskTitle.classList.remove('input-invalid');

    this.dom.editModal.classList.remove('hidden');
    this.dom.editTaskTitle.focus();
  }

  /**
   * Menutup modal edit
   */
  closeEditModal() {
    this.dom.editModal.classList.add('hidden');
  }

  /**
   * Menangani simpan perubahan tugas dari modal
   */
  handleEditTaskSubmit() {
    const taskId = this.dom.editTaskId.value;
    const titleVal = this.dom.editTaskTitle.value.trim();
    const categoryVal = this.dom.editTaskCategory.value;
    const priorityVal = this.dom.editTaskPriority.value;
    const deadlineVal = this.dom.editTaskDeadline.value;
    const notesVal = this.dom.editTaskNotes.value.trim();

    if (!titleVal) {
      this.dom.editTitleError.textContent = 'Judul tugas tidak boleh kosong!';
      this.dom.editTaskTitle.classList.add('input-invalid');
      this.dom.editTaskTitle.focus();
      return;
    }

    this.dom.editTitleError.textContent = '';
    this.dom.editTaskTitle.classList.remove('input-invalid');

    // Eksekusi pembaruan tugas
    this.editTask(taskId, {
      title: titleVal,
      category: categoryVal,
      priority: priorityVal,
      deadline: deadlineVal,
      notes: notesVal
    });

    this.closeEditModal();
  }

  // -----------------------------------------------------------------
  // TOAST NOTIFICATION SYSTEM
  // -----------------------------------------------------------------

  /**
   * Menampilkan toast feedback notifikasi melayang
   */
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-circle-info';
    if (type === 'success') iconClass = 'fa-circle-check';
    if (type === 'error') iconClass = 'fa-circle-exclamation';

    // Template Literals untuk toast
    toast.innerHTML = `
      <i class="fa-solid ${iconClass}"></i>
      <span>${sanitizeHTML(message)}</span>
    `;

    this.dom.toastContainer.appendChild(toast);

    // Hapus toast setelah 3.2 detik dengan transisi
    setTimeout(() => {
      toast.classList.add('toast-hide');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3200);
  }
}

// ===================================================================
// 4. INSTANSIASI APLIKASI SAAT DOM SIAP
// ===================================================================

let dashboardApp;

document.addEventListener('DOMContentLoaded', () => {
  dashboardApp = new DashboardApp();
});
