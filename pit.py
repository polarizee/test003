from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes
import json
import os

BOT_TOKEN = "7576456978:AAFin7rvsk_5zr9evGB_3KYkuMe8TpJ1g64"  # Ваш токен бота
MINI_APP_URL = "https://test003-ten.vercel.app"  # Убедитесь, что ссылка начинается с https://
ADMIN_CHAT_ID = 1365543895  # Ваш chat_id
BALANCES_FILE = "balances.json"  # Файл для хранения балансов

# Функция для загрузки балансов из файла
def load_balances():
    if os.path.exists(BALANCES_FILE):
        with open(BALANCES_FILE, "r") as file:
            return json.load(file)
    return {}

# Функция для сохранения балансов в файл
def save_balances(balances):
    with open(BALANCES_FILE, "w") as file:
        json.dump(balances, file)

# Функция для сохранения chat_id в файл
def save_user(chat_id):
    with open("users.txt", "a") as file:
        file.write(f"{chat_id}\n")

# Функция для загрузки всех chat_id из файла
def load_users():
    try:
        with open("users.txt", "r") as file:
            return set(file.read().splitlines())
    except FileNotFoundError:
        return set()

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.message.chat_id
    save_user(chat_id)  # Сохраняем chat_id пользователя

    # Создаем клавиатуру с кнопкой "Играть"
    keyboard = {
        "inline_keyboard": [[{"text": "ИГРАТЬ!", "web_app": {"url": MINI_APP_URL}}]]
    }
    # Отправляем сообщение с кнопкой
    await update.message.reply_text(
        "Добро пожаловать! Нажмите кнопку ниже, чтобы начать игру.",
        reply_markup=keyboard
    )

async def gamble(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.message.chat_id
    save_user(chat_id)  # Сохраняем chat_id пользователя

    # Создаем клавиатуру с кнопкой "Играть"
    keyboard = {
        "inline_keyboard": [[{"text": "ИГРАТЬ!", "web_app": {"url": MINI_APP_URL}}]]
    }
    # Отправляем сообщение с кнопкой
    await update.message.reply_text(
        "ВЫИГРАЙ СОСТОЯНИЕ!",
        reply_markup=keyboard
    )

async def notify(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # Проверяем, является ли пользователь администратором
    if update.message.chat_id != ADMIN_CHAT_ID:
        await update.message.reply_text("У вас нет прав для отправки уведомлений.")
        return

    # Загружаем всех пользователей
    users = load_users()
    if not users:
        await update.message.reply_text("Нет пользователей для уведомления.")
        return

    # Получаем текст уведомления из команды
    notification_text = " ".join(context.args)
    if not notification_text:
        await update.message.reply_text("Используйте: /notify <текст уведомления>")
        return

    # Отправляем уведомление каждому пользователю
    for user in users:
        try:
            await context.bot.send_message(chat_id=int(user), text=notification_text)
        except Exception as e:
            print(f"Не удалось отправить сообщение пользователю {user}: {e}")

    await update.message.reply_text(f"Уведомление отправлено {len(users)} пользователям.")

async def submit_request(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик для отправки заявки."""
    # Получаем данные из команды
    args = context.args
    if len(args) < 2:
        await update.message.reply_text("Используйте: /submit_request <username> <amount>")
        return

    username = args[0]  # Telegram username
    amount = args[1]    # Сумма пополнения

    # Формируем сообщение для администратора
    message = f"Новая заявка на пополнение!\nUsername: @{username}\nСумма: {amount}₽"

    # Отправляем сообщение администратору
    try:
        await context.bot.send_message(chat_id=ADMIN_CHAT_ID, text=message)
        await update.message.reply_text("Заявка отправлена администратору.")
    except Exception as e:
        print(f"Ошибка при отправке уведомления: {e}")
        await update.message.reply_text("Ошибка при отправке заявки.")

async def give_balance(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик для выдачи баланса пользователю."""
    # Проверяем, является ли пользователь администратором
    if update.message.chat_id != ADMIN_CHAT_ID:
        await update.message.reply_text("У вас нет прав для выдачи баланса.")
        return

    # Получаем аргументы команды
    args = context.args
    if len(args) < 2:
        await update.message.reply_text("Используйте: /give_balance <username> <amount>")
        return

    username = args[0]  # Telegram username
    amount = int(args[1])  # Сумма для выдачи

    # Загружаем текущие балансы
    balances = load_balances()

    # Обновляем баланс пользователя
    if username in balances:
        balances[username] += amount
    else:
        balances[username] = amount

    # Сохраняем обновленные балансы
    save_balances(balances)

    # Отправляем сообщение администратору
    await update.message.reply_text(f"Баланс пользователя @{username} увеличен на {amount}₽. Текущий баланс: {balances[username]}₽.")

def main():
    # Создаем приложение и добавляем обработчики команд
    application = Application.builder().token(BOT_TOKEN).build()
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("gamble", gamble))
    application.add_handler(CommandHandler("notify", notify))
    application.add_handler(CommandHandler("submit_request", submit_request))
    application.add_handler(CommandHandler("give_balance", give_balance))
    # Запускаем бота
    application.run_polling()

if __name__ == "__main__":
    main()