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

// Елементи для створення коду
const urlInput = document.getElementById('url-input');
const createBtn = document.getElementById('create-btn');
const createForm = document.getElementById('create-form');
const codeDisplayArea = document.getElementById('code-display-area');

// Елементи для отримання посилання
const codeInput = document.getElementById('code-input');
const retrieveBtn = document.getElementById('retrieve-btn');
const retrieveForm = document.getElementById('retrieve-form');
const linkDisplayArea = document.getElementById('link-display-area');

function generateCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

// --- Логіка створення коду ---
function handleCreate() {
    const longUrl = urlInput.value.trim();
    if (!longUrl || !longUrl.startsWith('http')) {
        alert('Будь ласка, введіть коректне посилання (повинно починатися з http або https).');
        return;
    }

    const code = generateCode();
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
    const code = codeInput.value.trim();
    if (code.length !== 4) {
        alert('Будь ласка, введіть 4-значний код.');
        return;
    }

    const linkRef = db.ref('links/' + code);
    linkRef.once('value', (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            
            // 1. Ховаємо форму вводу
            retrieveForm.classList.add('hidden');

            // 2. Створюємо очевидний результат: велика кнопка-посилання
            linkDisplayArea.innerHTML = `
                <a href="${data.url}" target="_blank" rel="noopener noreferrer" class="primary-link-btn">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i> Відкрити посилання
                </a>
                <button class="reset-btn" id="reset-btn">Ввести інший код</button>
            `;

            // 3. Додаємо обробник для кнопки скидання
            document.getElementById('reset-btn').addEventListener('click', () => {
                retrieveForm.classList.remove('hidden');
                linkDisplayArea.innerHTML = '';
                codeInput.value = '';
                codeInput.focus();
            });

        } else {
            linkDisplayArea.textContent = 'Код не знайдено або термін його дії закінчився.';
            setTimeout(() => { linkDisplayArea.textContent = '' }, 3000);
        }
    }).catch(error => {
        console.error("Помилка читання:", error);
        linkDisplayArea.textContent = 'Помилка. Спробуйте ще раз.';
    });
}

// --- Обробники подій ---

// Клік на кнопки
createBtn.addEventListener('click', handleCreate);
retrieveBtn.addEventListener('click', handleRetrieve);

// Натискання Enter в полях вводу
urlInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        createBtn.click();
    }
});

codeInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        retrieveBtn.click();
    }
});
