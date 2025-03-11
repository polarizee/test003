// Баланс пользователя (синхронизируется через localStorage)
let userBalance = parseInt(localStorage.getItem('userBalance')) || 0;
let selectedServer = localStorage.getItem('selectedServer') || '';
let selectedAmount = 0;
let selectedPrice = 0;

// Новый код: Переменные для работы с API
let username = ""; // Telegram username пользователя

// Старый код: Функция для обновления баланса на странице
function updateBalance() {
    document.getElementById('balance').textContent = userBalance.toLocaleString();
    localStorage.setItem('userBalance', userBalance);
}

// Новый код: Функция для получения баланса через API
async function fetchBalance(username) {
    try {
        const response = await fetch(`http://localhost:5000/get_balance?username=${username}`);
        const data = await response.json();
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
            return user.username; // Возвращаем username пользователя
        }
    }
    return null; // Если username недоступен
}

// Старый код: Функция для выбора сервера
function selectServer(server) {
    selectedServer = server;
    localStorage.setItem('selectedServer', server);
    window.location.href = 'purchase.html'; // Перенаправляем на страницу покупки
}

// Старый код: Функция для выбора количества виртов
function selectAmount(amount, price) {
    selectedAmount = amount;
    selectedPrice = price;
    document.getElementById('selected-amount').textContent = amount.toLocaleString();
    document.getElementById('selected-price').textContent = price.toLocaleString();
    document.getElementById('selected-amount-info').style.display = 'block'; // Показываем блок
}

// Старый код: Функция для обработки оплаты
function processPayment() {
    if (selectedAmount === 0 || selectedPrice === 0) {
        showNotification('Выберите количество виртов');
        return;
    }

    if (userBalance < selectedPrice) {
        showNotification('Недостаточно средств');
        return;
    }

    // Показываем окно подтверждения оплаты
    openModal('confirmPaymentModal');
}

// Старый код: Функция для подтверждения оплаты
function confirmPayment() {
    userBalance -= selectedPrice;
    updateBalance();
    closeModal('confirmPaymentModal');
    showNotification('Покупка оплачена. Скоро с вами свяжется продавец.');
}

// Старый код: Функция для показа уведомления
function showNotification(message) {
    document.getElementById('notificationText').textContent = message;
    openModal('notificationModal');
}

// Старый код: Функция для открытия модального окна
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

// Старый код: Функция для закрытия модального окна
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Старый код: Функция для открытия модального окна пополнения баланса
function openTopUpModal() {
    document.getElementById('topUpModal').style.display = 'flex';
}

// Старый код: Функция для отправки заявки на пополнение баланса
async function submitTopUpRequest() {
    const amount = parseInt(document.getElementById('amount').value);
    const usernameInput = document.getElementById('username').value.trim();

    // Проверка минимальной суммы (1000 рублей)
    if (!amount || amount < 1000) {
        alert('Минимальная сумма пополнения — 1000 рублей.');
        return;
    }

    if (!usernameInput) {
        alert('Введите ваш Telegram username.');
        return;
    }

    // Отправляем уведомление в Telegram
    const botToken = '7576456978:AAFin7rvsk_5zr9evGB_3KYkuMe8TpJ1g64'; // Замените на токен вашего бота
    const chatId = '1365543895'; // Замените на ваш chat_id
    const message = `Новая заявка на пополнение!\nUsername: @${usernameInput}\nСумма: ${amount}₽`;

    try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
            }),
        });

        const data = await response.json();

        if (data.ok) {
            alert('Заявка отправлена. Ожидайте подтверждения платежа.');
            closeModal('topUpModal'); // Закрываем модальное окно
        } else {
            alert('Ошибка при отправке заявки.');
        }
    } catch (error) {
        console.error('Ошибка при отправке запроса:', error);
        alert('Произошла ошибка при отправке заявки.');
    }
}

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
