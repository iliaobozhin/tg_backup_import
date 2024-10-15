const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const formatDate = dateStr => {
  const date = new Date(dateStr);
  return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}, ${date.getHours()
    .toString()
    .padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
};

const processMessage = (message, sender) => {
  const timestamp = formatDate(message.date);
  if (message.file || message.photo) {
    let file = message.file || message.photo || null;
    if (file === '(File not included. Change data exporting settings to download.)') {
      file = null;
    }
    return { text: `[${timestamp}] ${sender}: <прикреплено: ${file}>\n`, file };
  }
  if (message.text) {
    const text = Array.isArray(message.text) ? message.text.map(part => typeof part === 'string' ? part : part.text).join('') : message.text;
    return { text: `[${timestamp}] ${sender}: ${text}\n` };
  }
};

const main = input_file => {
  const media = [];
  const filePath = path.join(__dirname, input_file);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return console.error('Ошибка чтения файла:', err);
    }

    const parsedData = JSON.parse(data);
    let output = '';

    parsedData.chats.list.forEach(chat => {
      if (Number(chat.id) === Number(user)) {
        chat.messages.forEach(message => {
          const { text, file } = processMessage(message, message.from);
          output += text;
          if (file) {
            if (message.text) {
              const captionText = Array.isArray(message.text) ? message.text.map(part => typeof part === 'string' ? part : part.text).join('') : message.text;
              output += `[${formatDate(message.date)}] ${message.from}: ${captionText}\n`;
            }
            media.push(file);
          }
        });
      }
    });

    fs.writeFile(output_file, output, 'utf8', err => {
      if (err) {
        console.error(`Ошибка записи файла: ${err}`);
      } else {
        console.log('Конвертация завершена.');
      }
    });

    const outputZip = fs.createWriteStream(`Backup_${user}.zip`);
    const archive = archiver('zip', { zlib: { level: 9 } });

    for (let file of media) {
      console.log(file);
      archive.file(file, { name: file.split('/')[file.length - 1] });
    }
    archive.pipe(outputZip);
    archive.file('_chat.txt', { name: '_chat.txt' });
    archive.finalize().then(() => {
      fs.unlink(output_file, err => {
        if (err) {
          console.error(`Ошибка удаления файла: ${err}`);
        } else {
          console.log('_chat.txt успешно удалён');
        }
      });
    }).catch(err => {
      console.error(`Ошибка архивирования: ${err}`);
    });
  });
};

const input_file = 'result.json';
const output_file = '_chat.txt';

const args = process.argv.slice(2);
const user = args[0];

main(input_file);


