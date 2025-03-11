// Баланс пользователя (синхронизируется через localStorage)
let userBalance = parseInt(localStorage.getItem('userBalance')) || 0;
let selectedServer = localStorage.getItem('selectedServer') || '';
let selectedAmount = 0;
let selectedPrice = 0;

// Новый код: Переменные для работы с API
let username = ""; // Telegram username пользователя

// Старый код: Функция для обновления баланса на странице
function updateBalance() {
    const balanceElement = document.getElementById('balance');
    if (!balanceElement) {
        console.error("Элемент с id='balance' не найден.");
        return;
    }
    balanceElement.textContent = userBalance.toLocaleString();
    localStorage.setItem('userBalance', userBalance);
}

// Новый код: Функция для получения баланса через API
async function fetchBalance(username) {
    try {
        const response = await fetch(`http://localhost:5000/get_balance?username=${username}`);
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        const data = await response.json();
        console.log("Ответ от API:", data); // Логируем ответ
        return data.balance;
    } catch (error) {
        console.error("Ошибка при получении баланса:", error);
        return 0;
    }
}

// Новый код: Функция для синхронизации баланса с API
async function syncBalanceWithAPI() {
    if (!username) {
        console.error("Username не установлен.");
        return;
    }

    const newBalance = await fetchBalance(username);
    console.log("Новый баланс:", newBalance); // Логируем новый баланс
    if (newBalance !== userBalance) {
        userBalance = newBalance;
        updateBalance(); // Обновляем баланс на странице
    }
}

// Новый код: Функция для получения username пользователя Telegram
function getTelegramUsername() {
    if (window.Telegram && Telegram.WebApp) {
        const user = Telegram.WebApp.initDataUnsafe.user; // Данные пользователя
        if (user && user.username) {
            console.log("Username пользователя Telegram:", user.username); // Логируем username
            return user.username; // Возвращаем username пользователя
        }
    }
    console.error("Username пользователя Telegram не найден.");
    return null; // Если username недоступен
}

// Остальной код (selectServer, selectAmount, processPayment и т.д.) остается без изменений

// Новый код: Инициализация при загрузке страницы
window.onload = async function () {
    // Получаем username пользователя Telegram
    username = getTelegramUsername();

    if (!username) {
        console.error("Username пользователя Telegram не найден.");
        return;
    }

    // Устанавливаем username в поле ввода модального окна
    document.getElementById('username').value = username;

    // Синхронизируем баланс с API при загрузке страницы
    await syncBalanceWithAPI();

    // Периодически синхронизируем баланс каждые 5 секунд
    setInterval(syncBalanceWithAPI, 5000);

    // Старый код: Загрузка данных при открытии страницы
    if (window.location.pathname.includes('purchase.html')) {
        // Загружаем выбранный сервер
        selectedServer = localStorage.getItem('selectedServer');
        document.getElementById('selected-server').textContent = selectedServer;

        // Обновляем баланс
        updateBalance();

        // Скрываем блок выбранного количества виртов, если ничего не выбрано
        document.getElementById('selected-amount-info').style.display = 'none';
    } else {
        updateBalance(); // Обновляем баланс на других страницах
    }
};
