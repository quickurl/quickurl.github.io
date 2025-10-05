// КРОК 1: Вставте вашу конфігурацію Firebase сюди
const firebaseConfig = {
  apiKey: "AIzaSyBr6rsSZMA39-1Xd_ZJ56_U-x3NR0ENSBw",
  authDomain: "quickurl-f7d8b.firebaseapp.com",
  projectId: "quickurl-f7d8b",
  storageBucket: "quickurl-f7d8b.firebasestorage.app",
  messagingSenderId: "1077891912101",
  appId: "1:1077891912101:web:ba55e1500174f81a09984c"
};

// Ініціалізація Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Отримуємо елементи зі сторінки
const urlInput = document.getElementById('url-input');
const createBtn = document.getElementById('create-btn');
const codeDisplay = document.getElementById('code-display');

const codeInput = document.getElementById('code-input');
const retrieveBtn = document.getElementById('retrieve-btn');
const linkDisplay = document.getElementById('link-display');

// Функція для генерації випадкового 4-значного коду
function generateCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

// Обробник для кнопки "Створити код"
createBtn.addEventListener('click', () => {
    const longUrl = urlInput.value.trim();

    // Проста валідація URL
    if (!longUrl || !longUrl.startsWith('http')) {
        alert('Будь ласка, введіть коректне посилання (повинно починатися з http або https).');
        return;
    }

    const code = generateCode();
    const timestamp = firebase.database.ServerValue.TIMESTAMP;

    // Записуємо дані в Realtime Database
    db.ref('links/' + code).set({
        url: longUrl,
        createdAt: timestamp
    })
    .then(() => {
        codeDisplay.textContent = `Ваш код: ${code}`;
        urlInput.value = '';
    })
    .catch(error => {
        console.error("Помилка запису в базу даних:", error);
        codeDisplay.textContent = 'Не вдалося створити код. Спробуйте ще раз.';
    });
});

// Обробник для кнопки "Отримати посилання"
retrieveBtn.addEventListener('click', () => {
    const code = codeInput.value.trim();

    if (code.length !== 4) {
        alert('Будь ласка, введіть 4-значний код.');
        return;
    }

    const linkRef = db.ref('links/' + code);
    linkRef.once('value', (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const FIVE_MINUTES_MS = 5 * 60 * 1000;
            const now = Date.now();
            const linkAge = now - data.createdAt;

            // Перевіряємо, чи не минуло 5 хвилин
            if (linkAge > FIVE_MINUTES_MS) {
                linkDisplay.textContent = 'Термін дії коду закінчився.';
                // Опціонально: видаляємо застарілий запис
                linkRef.remove();
            } else {
                linkDisplay.innerHTML = `<a href="${data.url}" target="_blank" rel="noopener noreferrer">Перейти: ${data.url}</a>`;
            }
        } else {
            linkDisplay.textContent = 'Код не знайдено.';
        }
        codeInput.value = '';
    }).catch(error => {
        console.error("Помилка читання з бази даних:", error);
        linkDisplay.textContent = 'Помилка. Спробуйте ще раз.';
    });
});
