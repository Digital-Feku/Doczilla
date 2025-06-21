/**
 * popup - всплывающее окно
 * popupButton - кнопка в popup
 * popupBg - фон popup (для закрытия)
 * button - кнопка загрузки
 * linkElement - элемент для отображения ссылки
 */

/**
 * @type {HTMLInputElement}
 */
const popup = document.getElementById('popup-frame');
const popupButton = document.getElementById('popup-button');
const popupBg = document.getElementById('popup-bg');
const button = document.getElementById('form-upload-submit-button');
const linkElement = document.getElementById('link')

// При клике на кнопку загрузки имитируем клик по скрытому input файлу
document.getElementById('form-upload-submit-button').addEventListener('click', () => {
document.getElementById('form-upload-submit').click();
})
// Обработчик изменения input файла (когда пользователь выбрал файл)
document.getElementById('form-upload-submit').addEventListener('change', async (e) => {

popupButton.textContent = 'Скопировать ссылку'
button.disabled = true; 

const file = e.target.files[0]; // Получаем выбранный файл
  // Проверка что файл выбран
if (!file) {
    button.textContent = 'upload'
        button.disabled = false;
    alert('Выберите файл')
    return;
}
  // Проверка размера файла (не более 2GB)
if (file.size > 2 * 1024 * 1024 * 1024) {
    button.textContent = 'upload'
        button.disabled = false;
    alert('Файл слишком большой')
    return;
}
  // Создаем FormData для отправки файла
const formInput = new FormData();
formInput.append('file', file);
  // Настраиваем AJAX-запрос
const xhr = new XMLHttpRequest();
xhr.open('POST', '/upload', true);
  // Отслеживаем прогресс загрузки
xhr.upload.onprogress = function(e) {
  if (e.lengthComputable) {
    const percent = Math.round((e.loaded / e.total) * 100)
    button.textContent = percent + '%'
  }
}
  // Обработчик завершения загрузки
xhr.onload = () => {
    button.textContent = '100%';
    button.classList.add('active')
    button.disabled = false;
    if (xhr.status == 200) {
        const response = JSON.parse(xhr.responseText);
        const link = response.downloadLink;
        // Показываем popup с задержкой
        setTimeout(() => {
            popup.style.display = 'flex'
                setTimeout(() => {
                popup.classList.add('show');
                }, 10);
        }, 1000)
            // Устанавливаем ссылку в элемент
        linkElement.textContent = `http://localhost:3000${link}`
        linkElement.href = `http://localhost:3000${link}`

popupButton.addEventListener('click', function() {
          // Обработчик копирования ссылки
    popupButton.textContent = 'Скопировано!'
    popupButton.disabled = true;

    navigator.clipboard.writeText(`http://localhost:3000${link}`)
})
      // Закрытие popup при клике на фон
popupBg.addEventListener('click', () => {
    popup.style.display = 'none'
        setTimeout(() => {
        popup.classList.remove('show');
        }, 10);
    button.textContent = 'upload';
    button.classList.remove('active')
})

    } else {
        console.log('error')
    }
}
  // Отправляем файл на сервер
xhr.send(formInput);


});