from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

BOT_TOKEN = "7576456978:AAFin7rvsk_5zr9evGB_3KYkuMe8TpJ1g64"  # Вставьте токен бота
MINI_APP_URL = "https://moneymaking-mu.vercel.app"  # Убедитесь, что ссылка начинается с https://

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
    if update.message.chat_id != 1365543895:  # Замените YOUR_ADMIN_CHAT_ID на ваш chat_id
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

def main():
    # Создаем приложение и добавляем обработчики команд
    application = Application.builder().token(BOT_TOKEN).build()
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("gamble", gamble))
    application.add_handler(CommandHandler("notify", notify))
    # Запускаем бота
    application.run_polling()

if __name__ == "__main__":
    main()