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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// --- Елементи для створення коду ---
const urlInput = document.getElementById('url-input');
const createBtn = document.getElementById('create-btn');
const codeDisplayArea = document.getElementById('code-display-area');

// --- Елементи для отримання посилання ---
const retrieveInteractiveArea = document.getElementById('retrieve-interactive-area');

// HTML-шаблон для форми вводу коду
const retrieveFormTemplate = `
    <input type="text" id="code-input" placeholder="Введіть 4-значний код" maxlength="4" inputmode="numeric" pattern="\\d*">
    <button id="retrieve-btn" class="retrieve-btn-class"><i class="fa-solid fa-arrow-right-to-bracket"></i> Перейти</button>
`;

// --- Логіка створення коду ---
function handleCreate() {
    const longUrl = urlInput.value.trim();
    if (!longUrl || !longUrl.startsWith('http')) {
        alert('Будь ласка, введіть коректне посилання (повинно починатися з http або https).');
        return;
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const timestamp = firebase.database.ServerValue.TIMESTAMP;

    db.ref('links/' + code).set({ url: longUrl, createdAt: timestamp })
    .then(() => {
        codeDisplayArea.innerHTML = `
            <span class="generated-code">${code}</span>
            <button class="copy-btn" id="copy-btn"><i class="fa-regular fa-copy"></i> Копіювати</button>
        `;
        
        document.getElementById('copy-btn').addEventListener('click', () => {
            navigator.clipboard.writeText(code).then(() => {
                const copyBtn = document.getElementById('copy-btn');
                copyBtn.innerHTML = `<i class="fa-solid fa-check"></i> Скопійовано!`;
                copyBtn.classList.add('copied');
                
                setTimeout(() => {
                    copyBtn.innerHTML = `<i class="fa-regular fa-copy"></i> Копіювати`;
                    copyBtn.classList.remove('copied');
                }, 2000);
            });
        });
        urlInput.value = '';
    })
    .catch(error => {
        console.error("Помилка запису:", error);
        codeDisplayArea.textContent = 'Помилка. Спробуйте ще раз.';
    });
}

// --- Логіка отримання посилання ---
function handleRetrieve() {
    const codeInput = document.getElementById('code-input');
    const code = codeInput.value.trim();
    if (code.length !== 4) {
        alert('Будь ласка, введіть 4-значний код.');
        return;
    }

    const linkRef = db.ref('links/' + code);
    linkRef.once('value', (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            
            // Замінюємо вміст контейнера на результат
            retrieveInteractiveArea.innerHTML = `
                <a href="${data.url}" target="_blank" rel="noopener noreferrer" class="primary-link-btn">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i> Відкрити посилання
                </a>
                <button class="reset-btn" id="reset-btn">Ввести інший код</button>
            `;

            // Додаємо обробник для кнопки скидання
            document.getElementById('reset-btn').addEventListener('click', renderRetrieveForm);

        } else {
            alert('Код не знайдено або термін його дії закінчився.');
            codeInput.focus();
        }
    }).catch(error => {
        console.error("Помилка читання:", error);
        alert('Помилка. Спробуйте ще раз.');
    });
}

// Функція для відтворення початкового стану форми отримання
function renderRetrieveForm() {
    retrieveInteractiveArea.innerHTML = retrieveFormTemplate;
    
    // Оскільки елементи тепер створюються динамічно, ми повинні знаходити їх щоразу заново
    const codeInput = document.getElementById('code-input');
    const retrieveBtn = document.getElementById('retrieve-btn');
    
    retrieveBtn.addEventListener('click', handleRetrieve);
    codeInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            retrieveBtn.click();
        }
    });
    codeInput.focus();
}

// --- Ініціалізація обробників подій ---
createBtn.addEventListener('click', handleCreate);
urlInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        createBtn.click();
    }
});

// Перше відтворення форми отримання при завантаженні сторінки
document.addEventListener('DOMContentLoaded', renderRetrieveForm);
