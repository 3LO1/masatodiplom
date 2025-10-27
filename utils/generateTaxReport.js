const fs = require('fs');
const PDFDocument = require('pdfkit');
const path = require('path');

function generateTaxReport(data) {
  return new Promise((resolve, reject) => {
    try {
      // Вычисляем итоговые значения ДО создания документа
      const totalArea = data.reduce((sum, tenant) => sum + parseFloat(tenant.area || 0), 0);
      const totalRevenue = data.reduce((sum, tenant) => sum + parseFloat(tenant.price || 0), 0);

      const uploadsDir = path.join(__dirname, '../uploads/tax_reports');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fontPath = path.join(__dirname, '../fonts/DejaVuSans.ttf');
      
      if (!fs.existsSync(fontPath)) {
        throw new Error('Шрифт DejaVuSans.ttf не найден в папке fonts');
      }

      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, left: 40, right: 40, bottom: 100 },
        info: {
          Title: `Отчет для налоговой ${new Date().toLocaleDateString()}`,
          Author: 'MASATO',
          Creator: 'MASATO System'
        }
      });

      doc.registerFont('DejaVuSans', fontPath);
      doc.registerFont('DejaVuSans-Bold', fontPath);

      const fileName = `tax_report_${new Date().toISOString().slice(0, 10)}.pdf`;
      const filePath = path.join(uploadsDir, fileName);
      const fileUrl = `/uploads/tax_reports/${fileName}`;
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);
      doc.font('DejaVuSans').fontSize(12);

      // Заголовок
      doc.fontSize(18)
         .font('DejaVuSans-Bold')
         .text('ОТЧЕТ ДЛЯ НАЛОГОВОЙ', { align: 'center' })
         .moveDown(1);

      // Информация о компании
      doc.fontSize(12)
         .text('Арендодатель: ООО "MASATO"')
         .text(`Дата формирования: ${new Date().toLocaleDateString('ru-RU')}`)
         .moveDown(2);

      // Таблица с данными арендаторов
      doc.font('DejaVuSans-Bold')
         .text('Список арендаторов:', { underline: true })
         .moveDown(0.5);

      const table = {
        x: 50,
        lineHeight: 20,
        rowHeight: 22,
        fontSize: 10,
        columns: [
          { name: 'ФИО', width: 140, x: 50 },
          { name: 'ИИН', width: 100, x: 200 },
          { name: 'Помещение', width: 70, x: 310 },
          { name: 'Площадь (м²)', width: 80, x: 390, align: 'right' },
          { name: 'Стоимость (₸)', width: 90, x: 480, align: 'right' }
        ]
      };

      // Заголовки таблицы
      const startY = doc.y;
      doc.fontSize(table.fontSize);
      table.columns.forEach(col => {
        doc.text(col.name, col.x, startY, { 
          width: col.width,
          align: col.align || 'left'
        });
      });
      
      doc.moveTo(table.x, startY + table.lineHeight)
         .lineTo(table.x + 500, startY + table.lineHeight)
         .stroke();
      
      doc.y = startY + table.lineHeight + 8;

      // Данные арендаторов
      doc.fontSize(table.fontSize);
      data.forEach(tenant => {
        // Проверяем, осталось ли место для строки таблицы + итоговая секция (примерно 100pt)
        if (doc.y > doc.page.height - 100) {
          doc.addPage();
          doc.y = 50;
        }

        const rowStartY = doc.y;
        
        doc.text(tenant.full_name || 'Не указано', 
          table.columns[0].x, rowStartY, 
          { width: table.columns[0].width }
        )
        .text(tenant.iin || 'Не указано', 
          table.columns[1].x, rowStartY, 
          { width: table.columns[1].width }
        )
        .text(tenant.room_number, 
          table.columns[2].x, rowStartY, 
          { width: table.columns[2].width }
        )
        .text(tenant.area?.toString() || '0', 
          table.columns[3].x, rowStartY, 
          { width: table.columns[3].width, align: table.columns[3].align }
        )
        .text(tenant.price?.toString() || '0', 
          table.columns[4].x, rowStartY, 
          { width: table.columns[4].width, align: table.columns[4].align }
        );
        
        doc.moveTo(table.x, rowStartY + table.rowHeight)
           .lineTo(table.x + 500, rowStartY + table.rowHeight)
           .stroke();
        
        doc.y = rowStartY + table.rowHeight + 8;
      });

      // Добавляем отступ после таблицы перед итогами
      doc.moveDown(2); // Добавляем 2 строки отступа

      // Итоговая информация
      doc.font('DejaVuSans-Bold')
         .text('Итого:', { underline: true })
         .moveDown(0.5);
      
      doc.font('DejaVuSans')
         .text(`Общая арендуемая площадь: ${totalArea.toFixed(2)} м²`)
         .text(`Общий доход от аренды: ${totalRevenue.toFixed(2)} ₸`)
         .moveDown(1);

      // Подпись
      doc.font('DejaVuSans-Bold')
         .text('Директор ООО "MASATO": _________________________')
         .moveDown(0.5)
         .text('М.П.', { align: 'right' });

      doc.end();

      stream.on('finish', () => {
        console.log(`Tax report PDF successfully generated: ${filePath}`);
        resolve(fileUrl);
      });
      
      stream.on('error', (err) => {
        console.error('Error generating tax report PDF:', err);
        reject(err);
      });

    } catch (err) {
      console.error('Error in generateTaxReport:', err);
      reject(err);
    }
  });
}

module.exports = generateTaxReport;