/**
 * @type {HTMLInputElement}
 */
const popup = document.getElementById('popup');
const popupButton = document.getElementById('popup-button');
const button = document.getElementById('form-upload-submit-button');
const link = document.getElementById('link')


document.getElementById('form-upload-submit-button').addEventListener('click', () => {
document.getElementById('form-upload-submit').click();
})

document.getElementById('form-upload-submit').addEventListener('change', async (e) => {


button.disabled = true;

const file = e.target.files[0];

if (!file) {
    button.textContent = 'upload'
        button.disabled = false;
    alert('Выберите файл')
    return;
}

if (file.size > 2 * 1024 * 1024 * 1024) {
    button.textContent = 'upload'
        button.disabled = false;
    alert('Файл слишком большой')
    return;
}

const formInput = new FormData();
formInput.append('file', file);

const xhr = new XMLHttpRequest();
xhr.open('POST', '/upload', true);

xhr.upload.onprogress = function(e) {
  if (e.lengthComputable) {
    const percent = Math.round((e.loaded / e.total) * 100)
    button.textContent = percent + '%'
  }
}

xhr.onload = () => {
    button.textContent = '100%';
    button.style.background = '#00FF73'
    button.style.boxShadow = '0px 7px 0px 0px #00C458'
    button.disabled = false;
    if (xhr.status == 200) {
        const response = JSON.parse(xhr.responseText);
        const name = response.filename;
        popup.style.display = 'flex'
        link.textContent = `http://localhost:3000/download/${name}`

        popupButton.addEventListener('click', function() {
        popupButton.textContent = 'Скопировано!'
        popupButton.disabled = true;

        navigator.clipboard.writeText(`http://localhost:3000/download/${name}`)
})

    } else {
        console.log('error')
    }
}
xhr.send(formInput);


});