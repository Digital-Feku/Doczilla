/**
 * @type {HTMLInputElement}
 */

document.getElementById('form-upload-submit-button').addEventListener('click', () => {
document.getElementById('form-upload-submit').click();
})

document.getElementById('form-upload-submit').addEventListener('change', async (e) => {
const button = document.getElementById('form-upload-submit-button');
button.textContent = 'Loading...'

const file = e.target.files[0];

if (!file) {
    button.textContent = 'upload'
    alert('Выберите файл')
}

const formInput = new FormData();
formInput.append('file', file);

const xhr = new XMLHttpRequest();
xhr.open('POST', '/upload', true);
xhr.send(formInput);

xhr.onload = () => {
    button.textContent = 'upload';
    if (xhr.status == 200) {
        console.log(xhr.responseText)
    } else {
        console.log('error')
    }
}

});