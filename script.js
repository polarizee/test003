// Баланс пользователя (синхронизируется через localStorage)
let userBalance = parseInt(localStorage.getItem('userBalance')) || 0;
let selectedServer = localStorage.getItem('selectedServer') || '';
let selectedAmount = 0;
let selectedPrice = 0;

// Функция для обновления баланса на странице
function updateBalance() {
    document.getElementById('balance').textContent = userBalance.toLocaleString();
    localStorage.setItem('userBalance', userBalance);
}

// Функция для выбора сервера
function selectServer(server) {
    selectedServer = server;
    localStorage.setItem('selectedServer', server);
    window.location.href = 'purchase.html'; // Перенаправляем на страницу покупки
}

// Функция для выбора количества виртов
function selectAmount(amount, price) {
    selectedAmount = amount;
    selectedPrice = price;
    document.getElementById('selected-amount').textContent = amount.toLocaleString();
    document.getElementById('selected-price').textContent = price.toLocaleString();
    document.getElementById('selected-amount-info').style.display = 'block'; // Показываем блок
}

// Функция для обработки оплаты
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

// Функция для подтверждения оплаты
function confirmPayment() {
    userBalance -= selectedPrice;
    updateBalance();
    closeModal('confirmPaymentModal');
    showNotification('Покупка оплачена. Скоро с вами свяжется продавец.');
}

// Функция для показа уведомления
function showNotification(message) {
    document.getElementById('notificationText').textContent = message;
    openModal('notificationModal');
}

// Функция для открытия модального окна
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

// Функция для закрытия модального окна
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Функция для открытия модального окна пополнения баланса
function openTopUpModal() {
    document.getElementById('topUpModal').style.display = 'flex';
}

// Функция для отправки заявки на пополнение баланса
async function submitTopUpRequest() {
    const amount = parseInt(document.getElementById('amount').value);
    const username = document.getElementById('username').value.trim();

    // Проверка минимальной суммы (1000 рублей)
    if (!amount || amount < 1000) {
        alert('Минимальная сумма пополнения — 1000 рублей.');
        return;
    }

    if (!username) {
        alert('Введите ваш Telegram username.');
        return;
    }

    // Отправляем уведомление в Telegram
    const botToken = '7576456978:AAFin7rvsk_5zr9evGB_3KYkuMe8TpJ1g64'; // Замените на токен вашего бота
    const chatId = '1365543895'; // Замените на ваш chat_id
    const message = `Новая заявка на пополнение!\nUsername: @${username}\nСумма: ${amount}₽`;

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

// Загрузка данных при открытии страницы
window.onload = function () {
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
