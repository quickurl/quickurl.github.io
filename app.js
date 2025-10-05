// Вставте вашу конфігурацію Firebase сюди
const firebaseConfig = {
  apiKey: "AIzaSyBr6rsSZMA39-1Xd_ZJ56_U-x3NR0ENSBw",
  authDomain: "quickurl-f7d8b.firebaseapp.com",
  databaseURL: "https://quickurl-f7d8b-default-rtdb.europe-west1.firebasedatabase.app/",
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
const codeDisplayArea = document.getElementById('code-display-area');

const codeInput = document.getElementById('code-input');
const retrieveBtn = document.getElementById('retrieve-btn');
const linkDisplayArea = document.getElementById('link-display-area');

// Функція для генерації випадкового 4-значного коду
function generateCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

// Обробник для кнопки "Створити код"
createBtn.addEventListener('click', () => {
    const longUrl = urlInput.value.trim();
    if (!longUrl || !longUrl.startsWith('http')) {
        alert('Будь ласка, введіть коректне посилання (повинно починатися з http або https).');
        return;
    }

    const code = generateCode();
    const timestamp = firebase.database.ServerValue.TIMESTAMP;

    db.ref('links/' + code).set({
        url: longUrl,
        createdAt: timestamp
    })
    .then(() => {
        // Створюємо HTML для відображення коду та кнопки
        codeDisplayArea.innerHTML = `
            <span class="generated-code">${code}</span>
            <button class="copy-btn" id="copy-btn">Копіювати</button>
        `;
        // Додаємо обробник подій для нової кнопки
        document.getElementById('copy-btn').addEventListener('click', () => {
            navigator.clipboard.writeText(code).then(() => {
                const copyBtn = document.getElementById('copy-btn');
                copyBtn.textContent = 'Скопійовано!';
                setTimeout(() => { copyBtn.textContent = 'Копіювати'; }, 2000);
            });
        });
        urlInput.value = '';
    })
    .catch(error => {
        console.error("Помилка запису:", error);
        codeDisplayArea.textContent = 'Помилка. Спробуйте ще раз.';
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
            // Перевірку на 5 хвилин тепер роблять правила Firebase, але можна залишити і на клієнті
            linkDisplayArea.innerHTML = `<a href="${data.url}" target="_blank" rel="noopener noreferrer">Натисніть, щоб перейти</a>`;
        } else {
            linkDisplayArea.textContent = 'Код не знайдено або термін його дії закінчився.';
        }
        codeInput.value = '';
    }).catch(error => {
        console.error("Помилка читання:", error);
        linkDisplayArea.textContent = 'Помилка. Спробуйте ще раз.';
    });
});
