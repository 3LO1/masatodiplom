const fs = require('fs');
const PDFDocument = require('pdfkit');
const path = require('path');

function generateContract(data) {
  return new Promise((resolve, reject) => {
    try {
      // Создаем папку uploads, если ее нет
      const uploadsDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Путь к шрифту
      const fontPath = path.join(__dirname, '../fonts/DejaVuSans.ttf');
      
      // Проверяем наличие шрифта
      if (!fs.existsSync(fontPath)) {
        throw new Error('Шрифт DejaVuSans.ttf не найден в папке fonts');
      }

      // Создаем документ
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, left: 50, right: 50, bottom: 50 },
        info: {
          Title: `Договор аренды №${data.id}`,
          Author: 'MASATO',
          Creator: 'MASATO System'
        }
      });

      // Регистрируем шрифты
      doc.registerFont('DejaVuSans', fontPath);
      doc.registerFont('DejaVuSans-Bold', fontPath);

      const fileName = `contract_${data.id}.pdf`;
      const filePath = path.join(uploadsDir, fileName);
      const fileUrl = `/uploads/${fileName}`;
      const stream = fs.createWriteStream(filePath);

      // Устанавливаем обработчики событий
      doc.pipe(stream);

      // Устанавливаем основной шрифт
      doc.font('DejaVuSans');

      // Заголовок
      doc.fontSize(18)
         .font('DejaVuSans-Bold')
         .text('ДОГОВОР АРЕНДЫ', { align: 'center' })
         .moveDown(1);

      // Номер договора и дата
      doc.fontSize(12)
         .font('DejaVuSans')
         .text(`Номер: ${data.id}`, { align: 'left' })
         .text(`Дата: ${new Date().toLocaleDateString('ru-RU')}`, { align: 'left' })
         .moveDown(2);

      // Стороны договора
      doc.font('DejaVuSans-Bold')
         .text('1. СТОРОНЫ ДОГОВОРА:', { underline: true })
         .moveDown(0.5);

      doc.font('DejaVuSans')
         .text('Арендодатель: ООО "MASATO"')
         .text(`Арендатор: ${data.full_name}`)
         .text(`Email: ${data.email}`)
         .moveDown(2);

         doc.font('DejaVuSans')
   .text(`Арендатор: ${data.full_name}`)
   .text(`ИИН: ${data.iin}`)  // Добавленная строка
   .text(`Email: ${data.email}`);

      // Условия аренды
      doc.font('DejaVuSans-Bold')
         .text('2. ПРЕДМЕТ ДОГОВОРА:', { underline: true })
         .moveDown(0.5);

      doc.font('DejaVuSans')
         .text(`Арендодатель предоставляет, а Арендатор принимает в аренду помещение:`)
         .text(`- Номер помещения: ${data.room_number}`)
         .text(`- Этаж: ${data.floor}`)
         .text(`- Площадь: ${data.area} кв.м`)
         .text(`- Тип помещения: ${data.type}`)
         .moveDown(1)
         .text(`Срок аренды: с ${data.start_date} по ${data.end_date}`)
         .text(`Стоимость аренды: ${data.price} ₸ в месяц`)
         .moveDown(2);

      // Подписи
      doc.font('DejaVuSans-Bold')
         .text('3. ПОДПИСИ СТОРОН:', { underline: true })
         .moveDown(2);

      doc.text('Арендодатель: _________________________', { continued: true })
         .text('          М.П.', { align: 'right' })
         .moveDown(2)
         .text('Арендатор: ____________________________', { continued: true })
         .text('          М.П.', { align: 'right' });

      // Завершаем документ
      doc.end();

      stream.on('finish', () => {
        console.log(`PDF successfully generated: ${filePath}`);
        resolve(fileUrl);
      });
      
      stream.on('error', (err) => {
        console.error('Error generating PDF:', err);
        reject(err);
      });

    } catch (err) {
      console.error('Error in generateContract:', err);
      reject(err);
    }
  });
}

module.exports = generateContract;