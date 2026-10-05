/**
 * Sana Space — сборка листа «Список участников»
 *
 * КАК ПОДКЛЮЧИТЬ (один раз):
 * 1. Откройте свою Google Таблицу с результатами.
 * 2. Меню «Расширения» → «Apps Script».
 * 3. Создайте новый файл (значок + рядом с «Файлы») → назовите, например, roster.
 * 4. Вставьте весь этот код и сохраните (значок дискеты).
 * 5. Обновите вкладку с таблицей — в меню появится пункт «Sana Space».
 *
 * КАК ПОЛЬЗОВАТЬСЯ:
 * Меню «Sana Space» → «Собрать список участников».
 * Скрипт создаст (или обновит) лист «Список участников».
 *
 * ВАЖНО: скрипт читает полный JSON из строк и сам находит нужную колонку,
 * поэтому он работает независимо от того, как называются столбцы.
 * Ручные правки в листе «Список участников» при повторной сборке затираются —
 * дописанные вручную фамилии вносите в отдельный лист или копируйте лист перед пересборкой.
 */

var SRC_SHEET = "Результаты";          // лист, куда платформа пишет результаты
var OUT_SHEET = "Список участников";   // лист, который создаёт этот скрипт

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Sana Space")
    .addItem("Собрать список участников", "buildRoster")
    .addToUi();
}

/** Находит в строке ячейку с JSON-профилем и разбирает её */
function parseRow_(row) {
  for (var i = row.length - 1; i >= 0; i--) {
    var cell = row[i];
    if (typeof cell !== "string") continue;
    var s = cell.trim();
    if (s.charAt(0) !== "{") continue;
    try {
      var o = JSON.parse(s);
      if (o && (o.profile || o.res)) return o;
    } catch (e) { /* не JSON — идём дальше */ }
  }
  return null;
}

/** Демо-записи из прототипа не должны попадать в официальный список */
function isDemo_(d) {
  if (d.isDemo === true) return true;
  var p = d.profile || {};
  return p.name === "Демо Айым" && String(p.age) === "15" && p.city === "Алматы";
}

/** Сколько дней реально пройдено (с поправкой на старый баг Дня 8) */
function daysDone_(d) {
  var days = {};
  (d.doneDays || []).forEach(function (n) { days[n] = true; });
  var synth = (d.res || {}).synth || {};
  var hasSynth = Object.keys(synth).some(function (k) {
    return String(synth[k] || "").trim() !== "";
  });
  if (hasSynth) days[8] = true;   // синтез заполнен → День 8 пройден
  return Object.keys(days).length;
}

function fmtDate_(iso) {
  if (!iso) return "";
  var d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso).slice(0, 10);
  return Utilities.formatDate(d, Session.getScriptTimeZone(), "dd.MM.yyyy");
}

var TRACKS = {
  kz: "Казахстан", abroad: "За рубеж", both: "Оба варианта", undecided: "Не решено"
};

function buildRoster() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var src = ss.getSheetByName(SRC_SHEET);
  if (!src) {
    SpreadsheetApp.getUi().alert("Не найден лист «" + SRC_SHEET + "». Проверьте название листа с результатами.");
    return;
  }

  var values = src.getDataRange().getValues();
  var byKey = {};   // дедупликация: один участник — одна строка (берём последнюю попытку)

  for (var r = 1; r < values.length; r++) {   // с 1 — пропускаем шапку
    var data = parseRow_(values[r]);
    if (!data || isDemo_(data)) continue;

    var p = data.profile || {};
    var name = String(p.name || "").trim();
    var surname = String(p.surname || "").trim();
    var phone = String(p.phone || "").trim();
    if (!name && !surname && !phone) continue;

    // ФИО одной строкой: фамилия впереди, если она есть
    var fio = surname ? (surname + " " + name).trim() : name;

    var key = (surname + "|" + name + "|" + phone).toLowerCase();
    var rec = {
      fio: fio,
      noSurname: surname ? "" : "нет фамилии",
      age: p.age || "",
      city: p.city || "",
      phone: phone,
      track: TRACKS[p.track] || "",
      voluntary: p.voluntary === false ? "по инициативе родителей" : "",
      days: daysDone_(data),
      date: data.exported || "",
      dateSort: data.exported ? new Date(data.exported).getTime() : 0
    };
    // если человек проходил несколько раз — оставляем самую свежую попытку
    if (!byKey[key] || rec.dateSort >= byKey[key].dateSort) byKey[key] = rec;
  }

  var list = Object.keys(byKey).map(function (k) { return byKey[k]; });
  list.sort(function (a, b) { return b.dateSort - a.dateSort; });   // новые сверху

  // ---- запись на лист ----
  var out = ss.getSheetByName(OUT_SHEET);
  if (!out) out = ss.insertSheet(OUT_SHEET);
  out.clear();

  var header = ["№", "ФИО", "Возраст", "Город", "Телефон", "Трек обучения",
                "Дней пройдено", "Дата прохождения", "Примечание"];
  var rows = list.map(function (x, i) {
    var note = [x.noSurname, x.voluntary].filter(String).join("; ");
    return [i + 1, x.fio, x.age, x.city, x.phone, x.track,
            x.days + " / 8", fmtDate_(x.date), note];
  });

  out.getRange(1, 1, 1, header.length).setValues([header]);
  if (rows.length) out.getRange(2, 1, rows.length, header.length).setValues(rows);

  // ---- оформление ----
  var head = out.getRange(1, 1, 1, header.length);
  head.setFontWeight("bold").setBackground("#2B2B4C").setFontColor("#FFFFFF")
      .setHorizontalAlignment("center").setVerticalAlignment("middle");
  out.setFrozenRows(1);
  out.setRowHeight(1, 34);

  var widths = [40, 240, 80, 130, 140, 130, 110, 140, 200];
  widths.forEach(function (w, i) { out.setColumnWidth(i + 1, w); });

  if (rows.length) {
    var body = out.getRange(2, 1, rows.length, header.length);
    body.setVerticalAlignment("middle");
    out.getRange(2, 1, rows.length, 1).setHorizontalAlignment("center");
    out.getRange(2, 3, rows.length, 1).setHorizontalAlignment("center");
    out.getRange(2, 7, rows.length, 1).setHorizontalAlignment("center");
    out.getRange(2, 8, rows.length, 1).setHorizontalAlignment("center");
    // телефон — как текст, чтобы не терялся ведущий ноль
    out.getRange(2, 5, rows.length, 1).setNumberFormat("@");
    // подсветим тех, у кого не хватает фамилии
    for (var i = 0; i < list.length; i++) {
      if (list[i].noSurname) out.getRange(i + 2, 2).setBackground("#FFF3CD");
    }
  }

  SpreadsheetApp.getUi().alert(
    "Готово: " + rows.length + " участник(ов).\n\n" +
    "Жёлтым отмечены те, у кого в данных нет фамилии — " +
    "это участники, прошедшие до добавления поля «Фамилия». Их можно дописать вручную."
  );
}
