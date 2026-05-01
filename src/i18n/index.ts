import { createContext, useContext } from 'react';

// ── Direction ───────────────────────────────────────────────────────────────

export type Direction = 'ltr' | 'rtl';

// ── Locale strings ──────────────────────────────────────────────────────────

export interface LocaleStrings {
  // Common
  close: string;
  cancel: string;
  confirm: string;
  save: string;
  delete: string;
  search: string;
  loading: string;
  noResults: string;
  required: string;

  // Pagination
  previous: string;
  next: string;
  pageOf: (page: number, total: number) => string;

  // Select
  selectPlaceholder: string;
  clearSelection: string;

  // DatePicker
  selectDate: string;
  today: string;

  // FileUpload
  dropFiles: string;
  browse: string;

  // Table / DataGrid
  noData: string;
  sortAscending: string;
  sortDescending: string;
  filterPlaceholder: string;
  exportCsv: string;
  rowsSelected: (n: number) => string;
}

// ── Helper — build a locale without having to re-type every key ─────────────

function locale(strings: LocaleStrings): LocaleStrings {
  return strings;
}

// ── Locales ─────────────────────────────────────────────────────────────────

// English (United States)
export const enUS = locale({
  close: 'Close',
  cancel: 'Cancel',
  confirm: 'Confirm',
  save: 'Save',
  delete: 'Delete',
  search: 'Search',
  loading: 'Loading...',
  noResults: 'No results found',
  required: 'Required',
  previous: 'Previous',
  next: 'Next',
  pageOf: (page, total) => `Page ${page} of ${total}`,
  selectPlaceholder: 'Select...',
  clearSelection: 'Clear selection',
  selectDate: 'Select a date',
  today: 'Today',
  dropFiles: 'Drop files here or',
  browse: 'Browse',
  noData: 'No data available',
  sortAscending: 'Sort ascending',
  sortDescending: 'Sort descending',
  filterPlaceholder: 'Filter...',
  exportCsv: 'Export CSV',
  rowsSelected: (n) => `${n} row${n === 1 ? '' : 's'} selected`,
});

// Spanish (Spain)
export const esES = locale({
  close: 'Cerrar',
  cancel: 'Cancelar',
  confirm: 'Confirmar',
  save: 'Guardar',
  delete: 'Eliminar',
  search: 'Buscar',
  loading: 'Cargando...',
  noResults: 'No se encontraron resultados',
  required: 'Requerido',
  previous: 'Anterior',
  next: 'Siguiente',
  pageOf: (page, total) => `Página ${page} de ${total}`,
  selectPlaceholder: 'Seleccionar...',
  clearSelection: 'Limpiar selección',
  selectDate: 'Seleccionar fecha',
  today: 'Hoy',
  dropFiles: 'Suelte archivos aquí o',
  browse: 'Explorar',
  noData: 'No hay datos disponibles',
  sortAscending: 'Orden ascendente',
  sortDescending: 'Orden descendente',
  filterPlaceholder: 'Filtrar...',
  exportCsv: 'Exportar CSV',
  rowsSelected: (n) => `${n} fila${n === 1 ? '' : 's'} seleccionada${n === 1 ? '' : 's'}`,
});

// Portuguese (Brazil)
export const ptBR = locale({
  close: 'Fechar',
  cancel: 'Cancelar',
  confirm: 'Confirmar',
  save: 'Salvar',
  delete: 'Excluir',
  search: 'Pesquisar',
  loading: 'Carregando...',
  noResults: 'Nenhum resultado encontrado',
  required: 'Obrigatório',
  previous: 'Anterior',
  next: 'Próximo',
  pageOf: (page, total) => `Página ${page} de ${total}`,
  selectPlaceholder: 'Selecionar...',
  clearSelection: 'Limpar seleção',
  selectDate: 'Selecionar data',
  today: 'Hoje',
  dropFiles: 'Solte arquivos aqui ou',
  browse: 'Procurar',
  noData: 'Nenhum dado disponível',
  sortAscending: 'Ordenar crescente',
  sortDescending: 'Ordenar decrescente',
  filterPlaceholder: 'Filtrar...',
  exportCsv: 'Exportar CSV',
  rowsSelected: (n) => `${n} linha${n === 1 ? '' : 's'} selecionada${n === 1 ? '' : 's'}`,
});

// Portuguese (Portugal)
export const ptPT = locale({
  close: 'Fechar',
  cancel: 'Cancelar',
  confirm: 'Confirmar',
  save: 'Guardar',
  delete: 'Eliminar',
  search: 'Pesquisar',
  loading: 'A carregar...',
  noResults: 'Sem resultados',
  required: 'Obrigatório',
  previous: 'Anterior',
  next: 'Próximo',
  pageOf: (page, total) => `Página ${page} de ${total}`,
  selectPlaceholder: 'Selecionar...',
  clearSelection: 'Limpar seleção',
  selectDate: 'Selecionar data',
  today: 'Hoje',
  dropFiles: 'Largue ficheiros aqui ou',
  browse: 'Procurar',
  noData: 'Sem dados disponíveis',
  sortAscending: 'Ordenar crescente',
  sortDescending: 'Ordenar decrescente',
  filterPlaceholder: 'Filtrar...',
  exportCsv: 'Exportar CSV',
  rowsSelected: (n) => `${n} linha${n === 1 ? '' : 's'} selecionada${n === 1 ? '' : 's'}`,
});

// French (France)
export const frFR = locale({
  close: 'Fermer',
  cancel: 'Annuler',
  confirm: 'Confirmer',
  save: 'Enregistrer',
  delete: 'Supprimer',
  search: 'Rechercher',
  loading: 'Chargement...',
  noResults: 'Aucun résultat trouvé',
  required: 'Obligatoire',
  previous: 'Précédent',
  next: 'Suivant',
  pageOf: (page, total) => `Page ${page} sur ${total}`,
  selectPlaceholder: 'Sélectionner...',
  clearSelection: 'Effacer la sélection',
  selectDate: 'Sélectionner une date',
  today: "Aujourd'hui",
  dropFiles: 'Déposez les fichiers ici ou',
  browse: 'Parcourir',
  noData: 'Aucune donnée disponible',
  sortAscending: 'Tri croissant',
  sortDescending: 'Tri décroissant',
  filterPlaceholder: 'Filtrer...',
  exportCsv: 'Exporter CSV',
  rowsSelected: (n) => `${n} ligne${n === 1 ? '' : 's'} sélectionnée${n === 1 ? '' : 's'}`,
});

// German (Germany)
export const deDE = locale({
  close: 'Schließen',
  cancel: 'Abbrechen',
  confirm: 'Bestätigen',
  save: 'Speichern',
  delete: 'Löschen',
  search: 'Suchen',
  loading: 'Wird geladen...',
  noResults: 'Keine Ergebnisse gefunden',
  required: 'Erforderlich',
  previous: 'Zurück',
  next: 'Weiter',
  pageOf: (page, total) => `Seite ${page} von ${total}`,
  selectPlaceholder: 'Auswählen...',
  clearSelection: 'Auswahl löschen',
  selectDate: 'Datum auswählen',
  today: 'Heute',
  dropFiles: 'Dateien hier ablegen oder',
  browse: 'Durchsuchen',
  noData: 'Keine Daten verfügbar',
  sortAscending: 'Aufsteigend sortieren',
  sortDescending: 'Absteigend sortieren',
  filterPlaceholder: 'Filtern...',
  exportCsv: 'CSV exportieren',
  rowsSelected: (n) => `${n} Zeile${n === 1 ? '' : 'n'} ausgewählt`,
});

// Italian (Italy)
export const itIT = locale({
  close: 'Chiudi',
  cancel: 'Annulla',
  confirm: 'Conferma',
  save: 'Salva',
  delete: 'Elimina',
  search: 'Cerca',
  loading: 'Caricamento...',
  noResults: 'Nessun risultato trovato',
  required: 'Obbligatorio',
  previous: 'Precedente',
  next: 'Successivo',
  pageOf: (page, total) => `Pagina ${page} di ${total}`,
  selectPlaceholder: 'Seleziona...',
  clearSelection: 'Cancella selezione',
  selectDate: 'Seleziona una data',
  today: 'Oggi',
  dropFiles: 'Trascina file qui o',
  browse: 'Sfoglia',
  noData: 'Nessun dato disponibile',
  sortAscending: 'Ordinamento crescente',
  sortDescending: 'Ordinamento decrescente',
  filterPlaceholder: 'Filtra...',
  exportCsv: 'Esporta CSV',
  rowsSelected: (n) => `${n} riga${n === 1 ? '' : 'i'} selezionat${n === 1 ? 'a' : 'e'}`,
});

// Dutch (Netherlands)
export const nlNL = locale({
  close: 'Sluiten',
  cancel: 'Annuleren',
  confirm: 'Bevestigen',
  save: 'Opslaan',
  delete: 'Verwijderen',
  search: 'Zoeken',
  loading: 'Laden...',
  noResults: 'Geen resultaten gevonden',
  required: 'Verplicht',
  previous: 'Vorige',
  next: 'Volgende',
  pageOf: (page, total) => `Pagina ${page} van ${total}`,
  selectPlaceholder: 'Selecteer...',
  clearSelection: 'Selectie wissen',
  selectDate: 'Selecteer een datum',
  today: 'Vandaag',
  dropFiles: 'Zet bestanden hier neer of',
  browse: 'Bladeren',
  noData: 'Geen gegevens beschikbaar',
  sortAscending: 'Oplopend sorteren',
  sortDescending: 'Aflopend sorteren',
  filterPlaceholder: 'Filteren...',
  exportCsv: 'CSV exporteren',
  rowsSelected: (n) => `${n} rij${n === 1 ? '' : 'en'} geselecteerd`,
});

// Polish (Poland)
export const plPL = locale({
  close: 'Zamknij',
  cancel: 'Anuluj',
  confirm: 'Potwierdź',
  save: 'Zapisz',
  delete: 'Usuń',
  search: 'Szukaj',
  loading: 'Ładowanie...',
  noResults: 'Nie znaleziono wyników',
  required: 'Wymagane',
  previous: 'Poprzednia',
  next: 'Następna',
  pageOf: (page, total) => `Strona ${page} z ${total}`,
  selectPlaceholder: 'Wybierz...',
  clearSelection: 'Wyczyść wybór',
  selectDate: 'Wybierz datę',
  today: 'Dzisiaj',
  dropFiles: 'Upuść pliki tutaj lub',
  browse: 'Przeglądaj',
  noData: 'Brak danych',
  sortAscending: 'Sortuj rosnąco',
  sortDescending: 'Sortuj malejąco',
  filterPlaceholder: 'Filtruj...',
  exportCsv: 'Eksportuj CSV',
  rowsSelected: (n) => `Wybrano ${n} wier${n === 1 ? 'sz' : 'sze'}`,
});

// Russian (Russia)
export const ruRU = locale({
  close: 'Закрыть',
  cancel: 'Отмена',
  confirm: 'Подтвердить',
  save: 'Сохранить',
  delete: 'Удалить',
  search: 'Поиск',
  loading: 'Загрузка...',
  noResults: 'Результаты не найдены',
  required: 'Обязательно',
  previous: 'Назад',
  next: 'Вперёд',
  pageOf: (page, total) => `Страница ${page} из ${total}`,
  selectPlaceholder: 'Выбрать...',
  clearSelection: 'Снять выделение',
  selectDate: 'Выбрать дату',
  today: 'Сегодня',
  dropFiles: 'Перетащите файлы сюда или',
  browse: 'Обзор',
  noData: 'Нет данных',
  sortAscending: 'По возрастанию',
  sortDescending: 'По убыванию',
  filterPlaceholder: 'Фильтр...',
  exportCsv: 'Экспорт CSV',
  rowsSelected: (n) => `Выбрано ${n} строк`,
});

// Ukrainian (Ukraine)
export const ukUA = locale({
  close: 'Закрити',
  cancel: 'Скасувати',
  confirm: 'Підтвердити',
  save: 'Зберегти',
  delete: 'Видалити',
  search: 'Пошук',
  loading: 'Завантаження...',
  noResults: 'Результати не знайдено',
  required: "Обов'язково",
  previous: 'Назад',
  next: 'Далі',
  pageOf: (page, total) => `Сторінка ${page} з ${total}`,
  selectPlaceholder: 'Вибрати...',
  clearSelection: 'Очистити вибір',
  selectDate: 'Вибрати дату',
  today: 'Сьогодні',
  dropFiles: 'Перетягніть файли або',
  browse: 'Огляд',
  noData: 'Немає даних',
  sortAscending: 'За зростанням',
  sortDescending: 'За спаданням',
  filterPlaceholder: 'Фільтр...',
  exportCsv: 'Експорт CSV',
  rowsSelected: (n) => `Вибрано ${n} рядків`,
});

// Turkish (Turkey)
export const trTR = locale({
  close: 'Kapat',
  cancel: 'İptal',
  confirm: 'Onayla',
  save: 'Kaydet',
  delete: 'Sil',
  search: 'Ara',
  loading: 'Yükleniyor...',
  noResults: 'Sonuç bulunamadı',
  required: 'Zorunlu',
  previous: 'Önceki',
  next: 'Sonraki',
  pageOf: (page, total) => `${total} sayfadan ${page}. sayfa`,
  selectPlaceholder: 'Seçin...',
  clearSelection: 'Seçimi temizle',
  selectDate: 'Tarih seçin',
  today: 'Bugün',
  dropFiles: 'Dosyaları buraya bırakın veya',
  browse: 'Gözat',
  noData: 'Veri yok',
  sortAscending: 'Artan sıralama',
  sortDescending: 'Azalan sıralama',
  filterPlaceholder: 'Filtrele...',
  exportCsv: 'CSV dışa aktar',
  rowsSelected: (n) => `${n} satır seçildi`,
});

// Swedish (Sweden)
export const svSE = locale({
  close: 'Stäng',
  cancel: 'Avbryt',
  confirm: 'Bekräfta',
  save: 'Spara',
  delete: 'Ta bort',
  search: 'Sök',
  loading: 'Laddar...',
  noResults: 'Inga resultat hittades',
  required: 'Obligatoriskt',
  previous: 'Föregående',
  next: 'Nästa',
  pageOf: (page, total) => `Sida ${page} av ${total}`,
  selectPlaceholder: 'Välj...',
  clearSelection: 'Rensa val',
  selectDate: 'Välj ett datum',
  today: 'Idag',
  dropFiles: 'Släpp filer här eller',
  browse: 'Bläddra',
  noData: 'Inga data tillgängliga',
  sortAscending: 'Sortera stigande',
  sortDescending: 'Sortera fallande',
  filterPlaceholder: 'Filtrera...',
  exportCsv: 'Exportera CSV',
  rowsSelected: (n) => `${n} rad${n === 1 ? '' : 'er'} vald${n === 1 ? '' : 'a'}`,
});

// Danish (Denmark)
export const daDK = locale({
  close: 'Luk',
  cancel: 'Annuller',
  confirm: 'Bekræft',
  save: 'Gem',
  delete: 'Slet',
  search: 'Søg',
  loading: 'Indlæser...',
  noResults: 'Ingen resultater fundet',
  required: 'Påkrævet',
  previous: 'Forrige',
  next: 'Næste',
  pageOf: (page, total) => `Side ${page} af ${total}`,
  selectPlaceholder: 'Vælg...',
  clearSelection: 'Ryd valg',
  selectDate: 'Vælg en dato',
  today: 'I dag',
  dropFiles: 'Slip filer her eller',
  browse: 'Gennemse',
  noData: 'Ingen data tilgængelige',
  sortAscending: 'Sorter stigende',
  sortDescending: 'Sorter faldende',
  filterPlaceholder: 'Filtrer...',
  exportCsv: 'Eksporter CSV',
  rowsSelected: (n) => `${n} række${n === 1 ? '' : 'r'} valgt`,
});

// Czech (Czech Republic)
export const csCZ = locale({
  close: 'Zavřít',
  cancel: 'Zrušit',
  confirm: 'Potvrdit',
  save: 'Uložit',
  delete: 'Smazat',
  search: 'Hledat',
  loading: 'Načítání...',
  noResults: 'Žádné výsledky',
  required: 'Povinné',
  previous: 'Předchozí',
  next: 'Další',
  pageOf: (page, total) => `Stránka ${page} z ${total}`,
  selectPlaceholder: 'Vyberte...',
  clearSelection: 'Vymazat výběr',
  selectDate: 'Vyberte datum',
  today: 'Dnes',
  dropFiles: 'Přetáhněte soubory nebo',
  browse: 'Procházet',
  noData: 'Žádná data',
  sortAscending: 'Seřadit vzestupně',
  sortDescending: 'Seřadit sestupně',
  filterPlaceholder: 'Filtrovat...',
  exportCsv: 'Exportovat CSV',
  rowsSelected: (n) => `Vybráno ${n} řádků`,
});

// Hungarian (Hungary)
export const huHU = locale({
  close: 'Bezárás',
  cancel: 'Mégse',
  confirm: 'Megerősítés',
  save: 'Mentés',
  delete: 'Törlés',
  search: 'Keresés',
  loading: 'Betöltés...',
  noResults: 'Nincs találat',
  required: 'Kötelező',
  previous: 'Előző',
  next: 'Következő',
  pageOf: (page, total) => `${page}. oldal / ${total}`,
  selectPlaceholder: 'Válasszon...',
  clearSelection: 'Kijelölés törlése',
  selectDate: 'Válasszon dátumot',
  today: 'Ma',
  dropFiles: 'Húzza ide a fájlokat vagy',
  browse: 'Tallózás',
  noData: 'Nincs adat',
  sortAscending: 'Növekvő sorrend',
  sortDescending: 'Csökkenő sorrend',
  filterPlaceholder: 'Szűrés...',
  exportCsv: 'CSV exportálása',
  rowsSelected: (n) => `${n} sor kiválasztva`,
});

// Arabic (Saudi Arabia) — RTL
export const arSA = locale({
  close: 'إغلاق',
  cancel: 'إلغاء',
  confirm: 'تأكيد',
  save: 'حفظ',
  delete: 'حذف',
  search: 'بحث',
  loading: '...جارٍ التحميل',
  noResults: 'لم يتم العثور على نتائج',
  required: 'مطلوب',
  previous: 'السابق',
  next: 'التالي',
  pageOf: (page, total) => `صفحة ${page} من ${total}`,
  selectPlaceholder: '...اختر',
  clearSelection: 'مسح الاختيار',
  selectDate: 'اختر تاريخ',
  today: 'اليوم',
  dropFiles: 'أفلت الملفات هنا أو',
  browse: 'تصفح',
  noData: 'لا توجد بيانات',
  sortAscending: 'ترتيب تصاعدي',
  sortDescending: 'ترتيب تنازلي',
  filterPlaceholder: '...فلترة',
  exportCsv: 'تصدير CSV',
  rowsSelected: (n) => `تم تحديد ${n} صفوف`,
});

// Hebrew (Israel) — RTL
export const heIL = locale({
  close: 'סגור',
  cancel: 'ביטול',
  confirm: 'אישור',
  save: 'שמור',
  delete: 'מחק',
  search: 'חיפוש',
  loading: 'טוען...',
  noResults: 'לא נמצאו תוצאות',
  required: 'חובה',
  previous: 'הקודם',
  next: 'הבא',
  pageOf: (page, total) => `עמוד ${page} מתוך ${total}`,
  selectPlaceholder: 'בחר...',
  clearSelection: 'נקה בחירה',
  selectDate: 'בחר תאריך',
  today: 'היום',
  dropFiles: 'גרור קבצים לכאן או',
  browse: 'עיון',
  noData: 'אין נתונים',
  sortAscending: 'מיון עולה',
  sortDescending: 'מיון יורד',
  filterPlaceholder: 'סינון...',
  exportCsv: 'ייצוא CSV',
  rowsSelected: (n) => `נבחרו ${n} שורות`,
});

// Persian / Farsi (Iran) — RTL
export const faIR = locale({
  close: 'بستن',
  cancel: 'لغو',
  confirm: 'تأیید',
  save: 'ذخیره',
  delete: 'حذف',
  search: 'جستجو',
  loading: '...در حال بارگذاری',
  noResults: 'نتیجه‌ای یافت نشد',
  required: 'الزامی',
  previous: 'قبلی',
  next: 'بعدی',
  pageOf: (page, total) => `صفحه ${page} از ${total}`,
  selectPlaceholder: '...انتخاب کنید',
  clearSelection: 'پاک کردن انتخاب',
  selectDate: 'تاریخ را انتخاب کنید',
  today: 'امروز',
  dropFiles: 'فایل‌ها را اینجا رها کنید یا',
  browse: 'مرور',
  noData: 'داده‌ای موجود نیست',
  sortAscending: 'مرتب‌سازی صعودی',
  sortDescending: 'مرتب‌سازی نزولی',
  filterPlaceholder: '...فیلتر',
  exportCsv: 'خروجی CSV',
  rowsSelected: (n) => `${n} ردیف انتخاب شده`,
});

// Japanese (Japan)
export const jaJP = locale({
  close: '閉じる',
  cancel: 'キャンセル',
  confirm: '確認',
  save: '保存',
  delete: '削除',
  search: '検索',
  loading: '読み込み中...',
  noResults: '結果が見つかりません',
  required: '必須',
  previous: '前へ',
  next: '次へ',
  pageOf: (page, total) => `${total}ページ中${page}ページ`,
  selectPlaceholder: '選択...',
  clearSelection: '選択解除',
  selectDate: '日付を選択',
  today: '今日',
  dropFiles: 'ファイルをドロップまたは',
  browse: '参照',
  noData: 'データなし',
  sortAscending: '昇順',
  sortDescending: '降順',
  filterPlaceholder: 'フィルター...',
  exportCsv: 'CSVエクスポート',
  rowsSelected: (n) => `${n}行選択中`,
});

// Korean (South Korea)
export const koKR = locale({
  close: '닫기',
  cancel: '취소',
  confirm: '확인',
  save: '저장',
  delete: '삭제',
  search: '검색',
  loading: '로딩 중...',
  noResults: '검색 결과 없음',
  required: '필수',
  previous: '이전',
  next: '다음',
  pageOf: (page, total) => `${total}페이지 중 ${page}페이지`,
  selectPlaceholder: '선택...',
  clearSelection: '선택 해제',
  selectDate: '날짜 선택',
  today: '오늘',
  dropFiles: '여기에 파일을 놓거나',
  browse: '찾아보기',
  noData: '데이터 없음',
  sortAscending: '오름차순 정렬',
  sortDescending: '내림차순 정렬',
  filterPlaceholder: '필터...',
  exportCsv: 'CSV 내보내기',
  rowsSelected: (n) => `${n}개 행 선택됨`,
});

// Chinese Simplified (China)
export const zhCN = locale({
  close: '关闭',
  cancel: '取消',
  confirm: '确认',
  save: '保存',
  delete: '删除',
  search: '搜索',
  loading: '加载中...',
  noResults: '未找到结果',
  required: '必填',
  previous: '上一页',
  next: '下一页',
  pageOf: (page, total) => `第 ${page} 页，共 ${total} 页`,
  selectPlaceholder: '请选择...',
  clearSelection: '清除选择',
  selectDate: '选择日期',
  today: '今天',
  dropFiles: '将文件拖到此处或',
  browse: '浏览',
  noData: '暂无数据',
  sortAscending: '升序排列',
  sortDescending: '降序排列',
  filterPlaceholder: '筛选...',
  exportCsv: '导出 CSV',
  rowsSelected: (n) => `已选择 ${n} 行`,
});

// Chinese Traditional (Taiwan)
export const zhTW = locale({
  close: '關閉',
  cancel: '取消',
  confirm: '確認',
  save: '儲存',
  delete: '刪除',
  search: '搜尋',
  loading: '載入中...',
  noResults: '未找到結果',
  required: '必填',
  previous: '上一頁',
  next: '下一頁',
  pageOf: (page, total) => `第 ${page} 頁，共 ${total} 頁`,
  selectPlaceholder: '請選擇...',
  clearSelection: '清除選擇',
  selectDate: '選擇日期',
  today: '今天',
  dropFiles: '將檔案拖曳至此或',
  browse: '瀏覽',
  noData: '暫無資料',
  sortAscending: '升冪排列',
  sortDescending: '降冪排列',
  filterPlaceholder: '篩選...',
  exportCsv: '匯出 CSV',
  rowsSelected: (n) => `已選擇 ${n} 行`,
});

// Thai (Thailand)
export const thTH = locale({
  close: 'ปิด',
  cancel: 'ยกเลิก',
  confirm: 'ยืนยัน',
  save: 'บันทึก',
  delete: 'ลบ',
  search: 'ค้นหา',
  loading: 'กำลังโหลด...',
  noResults: 'ไม่พบผลลัพธ์',
  required: 'จำเป็น',
  previous: 'ก่อนหน้า',
  next: 'ถัดไป',
  pageOf: (page, total) => `หน้า ${page} จาก ${total}`,
  selectPlaceholder: 'เลือก...',
  clearSelection: 'ล้างการเลือก',
  selectDate: 'เลือกวันที่',
  today: 'วันนี้',
  dropFiles: 'วางไฟล์ที่นี่หรือ',
  browse: 'เรียกดู',
  noData: 'ไม่มีข้อมูล',
  sortAscending: 'เรียงจากน้อยไปมาก',
  sortDescending: 'เรียงจากมากไปน้อย',
  filterPlaceholder: 'กรอง...',
  exportCsv: 'ส่งออก CSV',
  rowsSelected: (n) => `เลือก ${n} แถว`,
});

// Vietnamese (Vietnam)
export const viVN = locale({
  close: 'Đóng',
  cancel: 'Hủy',
  confirm: 'Xác nhận',
  save: 'Lưu',
  delete: 'Xóa',
  search: 'Tìm kiếm',
  loading: 'Đang tải...',
  noResults: 'Không tìm thấy kết quả',
  required: 'Bắt buộc',
  previous: 'Trước',
  next: 'Tiếp',
  pageOf: (page, total) => `Trang ${page} / ${total}`,
  selectPlaceholder: 'Chọn...',
  clearSelection: 'Xóa lựa chọn',
  selectDate: 'Chọn ngày',
  today: 'Hôm nay',
  dropFiles: 'Thả tệp vào đây hoặc',
  browse: 'Duyệt',
  noData: 'Không có dữ liệu',
  sortAscending: 'Sắp xếp tăng dần',
  sortDescending: 'Sắp xếp giảm dần',
  filterPlaceholder: 'Lọc...',
  exportCsv: 'Xuất CSV',
  rowsSelected: (n) => `Đã chọn ${n} hàng`,
});

// Indonesian (Indonesia)
export const idID = locale({
  close: 'Tutup',
  cancel: 'Batal',
  confirm: 'Konfirmasi',
  save: 'Simpan',
  delete: 'Hapus',
  search: 'Cari',
  loading: 'Memuat...',
  noResults: 'Tidak ada hasil',
  required: 'Wajib',
  previous: 'Sebelumnya',
  next: 'Berikutnya',
  pageOf: (page, total) => `Halaman ${page} dari ${total}`,
  selectPlaceholder: 'Pilih...',
  clearSelection: 'Hapus pilihan',
  selectDate: 'Pilih tanggal',
  today: 'Hari ini',
  dropFiles: 'Seret file ke sini atau',
  browse: 'Jelajahi',
  noData: 'Tidak ada data',
  sortAscending: 'Urutkan naik',
  sortDescending: 'Urutkan turun',
  filterPlaceholder: 'Filter...',
  exportCsv: 'Ekspor CSV',
  rowsSelected: (n) => `${n} baris dipilih`,
});

// Romanian (Romania)
export const roRO = locale({
  close: 'Închide',
  cancel: 'Anulează',
  confirm: 'Confirmă',
  save: 'Salvează',
  delete: 'Șterge',
  search: 'Caută',
  loading: 'Se încarcă...',
  noResults: 'Nu s-au găsit rezultate',
  required: 'Obligatoriu',
  previous: 'Anterior',
  next: 'Următor',
  pageOf: (page, total) => `Pagina ${page} din ${total}`,
  selectPlaceholder: 'Selectați...',
  clearSelection: 'Șterge selecția',
  selectDate: 'Selectați o dată',
  today: 'Astăzi',
  dropFiles: 'Trageți fișierele aici sau',
  browse: 'Răsfoiți',
  noData: 'Nu există date',
  sortAscending: 'Sortare crescătoare',
  sortDescending: 'Sortare descrescătoare',
  filterPlaceholder: 'Filtrați...',
  exportCsv: 'Exportați CSV',
  rowsSelected: (n) => `${n} rând${n === 1 ? '' : 'uri'} selectat${n === 1 ? '' : 'e'}`,
});

// Hindi (India)
export const hiIN = locale({
  close: 'बंद करें',
  cancel: 'रद्द करें',
  confirm: 'पुष्टि करें',
  save: 'सहेजें',
  delete: 'हटाएँ',
  search: 'खोजें',
  loading: 'लोड हो रहा है...',
  noResults: 'कोई परिणाम नहीं मिला',
  required: 'आवश्यक',
  previous: 'पिछला',
  next: 'अगला',
  pageOf: (page, total) => `पृष्ठ ${page} / ${total}`,
  selectPlaceholder: 'चुनें...',
  clearSelection: 'चयन हटाएँ',
  selectDate: 'तारीख चुनें',
  today: 'आज',
  dropFiles: 'फाइलें यहाँ छोड़ें या',
  browse: 'ब्राउज़ करें',
  noData: 'कोई डेटा उपलब्ध नहीं',
  sortAscending: 'आरोही क्रम',
  sortDescending: 'अवरोही क्रम',
  filterPlaceholder: 'फ़िल्टर...',
  exportCsv: 'CSV निर्यात करें',
  rowsSelected: (n) => `${n} पंक्ति${n === 1 ? '' : 'याँ'} चयनित`,
});

// Tamil (India)
export const taIN = locale({
  close: 'மூடு',
  cancel: 'ரத்து செய்',
  confirm: 'உறுதிப்படுத்து',
  save: 'சேமி',
  delete: 'அழி',
  search: 'தேடு',
  loading: 'ஏற்றுகிறது...',
  noResults: 'முடிவுகள் இல்லை',
  required: 'அவசியம்',
  previous: 'முந்தையது',
  next: 'அடுத்தது',
  pageOf: (page, total) => `பக்கம் ${page} / ${total}`,
  selectPlaceholder: 'தேர்ந்தெடு...',
  clearSelection: 'தேர்வை அழி',
  selectDate: 'தேதியைத் தேர்ந்தெடு',
  today: 'இன்று',
  dropFiles: 'இங்கு கோப்புகளை விடுங்கள் அல்லது',
  browse: 'உலாவுக',
  noData: 'தரவு இல்லை',
  sortAscending: 'ஏறுவரிசை',
  sortDescending: 'இறங்குவரிசை',
  filterPlaceholder: 'வடிகட்டி...',
  exportCsv: 'CSV ஏற்றுமதி',
  rowsSelected: (n) => `${n} வரிசை${n === 1 ? '' : 'கள்'} தேர்ந்தெடுக்கப்பட்ட${n === 1 ? 'து' : 'ன'}`,
});

// Telugu (India)
export const teIN = locale({
  close: 'మూసివేయండి',
  cancel: 'రద్దు చేయండి',
  confirm: 'నిర్ధారించండి',
  save: 'భద్రపరచండి',
  delete: 'తొలగించండి',
  search: 'శోధించండి',
  loading: 'లోడ్ అవుతోంది...',
  noResults: 'ఫలితాలు లేవు',
  required: 'అవసరం',
  previous: 'మునుపటి',
  next: 'తరువాత',
  pageOf: (page, total) => `పేజీ ${page} / ${total}`,
  selectPlaceholder: 'ఎంచుకోండి...',
  clearSelection: 'ఎంపికను తొలగించండి',
  selectDate: 'తేదీని ఎంచుకోండి',
  today: 'నేడు',
  dropFiles: 'ఇక్కడ ఫైల్‌లను వదలండి లేదా',
  browse: 'బ్రౌజ్ చేయండి',
  noData: 'డేటా అందుబాటులో లేదు',
  sortAscending: 'ఆరోహణ క్రమం',
  sortDescending: 'అవరోహణ క్రమం',
  filterPlaceholder: 'ఫిల్టర్...',
  exportCsv: 'CSV ఎగుమతి',
  rowsSelected: (n) => `${n} వరుస${n === 1 ? '' : 'లు'} ఎంచుకోబడ్డాయి`,
});

// Marathi (India)
export const mrIN = locale({
  close: 'बंद करा',
  cancel: 'रद्द करा',
  confirm: 'पुष्टी करा',
  save: 'जतन करा',
  delete: 'हटवा',
  search: 'शोधा',
  loading: 'लोड होत आहे...',
  noResults: 'परिणाम सापडले नाहीत',
  required: 'आवश्यक',
  previous: 'मागील',
  next: 'पुढील',
  pageOf: (page, total) => `पृष्ठ ${page} / ${total}`,
  selectPlaceholder: 'निवडा...',
  clearSelection: 'निवड हटवा',
  selectDate: 'तारीख निवडा',
  today: 'आज',
  dropFiles: 'येथे फायली टाका किंवा',
  browse: 'ब्राउझ करा',
  noData: 'कोणताही डेटा उपलब्ध नाही',
  sortAscending: 'चढत्या क्रमाने',
  sortDescending: 'उतरत्या क्रमाने',
  filterPlaceholder: 'फिल्टर...',
  exportCsv: 'CSV निर्यात करा',
  rowsSelected: (n) => `${n} पंक्ती निवडल्या`,
});

// Gujarati (India)
export const guIN = locale({
  close: 'બંધ કરો',
  cancel: 'રદ કરો',
  confirm: 'પુષ્ટિ કરો',
  save: 'સાચવો',
  delete: 'કાઢી નાખો',
  search: 'શોધો',
  loading: 'લોડ થઈ રહ્યું છે...',
  noResults: 'કોઈ પરિણામો મળ્યા નથી',
  required: 'જરૂરી',
  previous: 'પાછલું',
  next: 'આગળનું',
  pageOf: (page, total) => `પૃષ્ઠ ${page} / ${total}`,
  selectPlaceholder: 'પસંદ કરો...',
  clearSelection: 'પસંદગી ભૂંસો',
  selectDate: 'તારીખ પસંદ કરો',
  today: 'આજે',
  dropFiles: 'અહીં ફાઇલો છોડો અથવા',
  browse: 'બ્રાઉઝ કરો',
  noData: 'કોઈ ડેટા ઉપલબ્ધ નથી',
  sortAscending: 'ચઢતો ક્રમ',
  sortDescending: 'ઉતરતો ક્રમ',
  filterPlaceholder: 'ફિલ્ટર...',
  exportCsv: 'CSV નિકાસ કરો',
  rowsSelected: (n) => `${n} પંક્તિ${n === 1 ? '' : 'ઓ'} પસંદ થયેલ`,
});

// Bengali (India)
export const bnIN = locale({
  close: 'বন্ধ করুন',
  cancel: 'বাতিল করুন',
  confirm: 'নিশ্চিত করুন',
  save: 'সংরক্ষণ করুন',
  delete: 'মুছুন',
  search: 'অনুসন্ধান করুন',
  loading: 'লোড হচ্ছে...',
  noResults: 'কোনো ফলাফল পাওয়া যায়নি',
  required: 'আবশ্যক',
  previous: 'পূর্ববর্তী',
  next: 'পরবর্তী',
  pageOf: (page, total) => `পৃষ্ঠা ${page} / ${total}`,
  selectPlaceholder: 'নির্বাচন করুন...',
  clearSelection: 'নির্বাচন মুছুন',
  selectDate: 'তারিখ নির্বাচন করুন',
  today: 'আজ',
  dropFiles: 'এখানে ফাইল ফেলুন বা',
  browse: 'ব্রাউজ করুন',
  noData: 'কোনো ডেটা নেই',
  sortAscending: 'ঊর্ধ্বক্রম',
  sortDescending: 'অবরোহী ক্রম',
  filterPlaceholder: 'ফিল্টার...',
  exportCsv: 'CSV রপ্তানি করুন',
  rowsSelected: (n) => `${n} সারি নির্বাচিত`,
});

// Kannada (India)
export const knIN = locale({
  close: 'ಮುಚ್ಚಿ',
  cancel: 'ರದ್ದುಗೊಳಿಸಿ',
  confirm: 'ದೃಢೀಕರಿಸಿ',
  save: 'ಉಳಿಸಿ',
  delete: 'ಅಳಿಸಿ',
  search: 'ಹುಡುಕಿ',
  loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
  noResults: 'ಯಾವುದೇ ಫಲಿತಾಂಶಗಳು ಸಿಗಲಿಲ್ಲ',
  required: 'ಅಗತ್ಯ',
  previous: 'ಹಿಂದಿನ',
  next: 'ಮುಂದಿನ',
  pageOf: (page, total) => `ಪುಟ ${page} / ${total}`,
  selectPlaceholder: 'ಆಯ್ಕೆಮಾಡಿ...',
  clearSelection: 'ಆಯ್ಕೆಯನ್ನು ತೆರವುಗೊಳಿಸಿ',
  selectDate: 'ದಿನಾಂಕವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
  today: 'ಇಂದು',
  dropFiles: 'ಇಲ್ಲಿ ಫೈಲ್‌ಗಳನ್ನು ಹಾಕಿ ಅಥವಾ',
  browse: 'ಬ್ರೌಸ್ ಮಾಡಿ',
  noData: 'ಯಾವುದೇ ಡೇಟಾ ಇಲ್ಲ',
  sortAscending: 'ಆರೋಹಣ ಕ್ರಮ',
  sortDescending: 'ಅವರೋಹಣ ಕ್ರಮ',
  filterPlaceholder: 'ಫಿಲ್ಟರ್...',
  exportCsv: 'CSV ರಫ್ತು ಮಾಡಿ',
  rowsSelected: (n) => `${n} ಸಾಲು${n === 1 ? '' : 'ಗಳು'} ಆಯ್ಕೆಯಾಗಿ${n === 1 ? 'ದೆ' : 'ವೆ'}`,
});

// Malayalam (India)
export const mlIN = locale({
  close: 'അടയ്ക്കുക',
  cancel: 'റദ്ദാക്കുക',
  confirm: 'സ്ഥിരീകരിക്കുക',
  save: 'സംരക്ഷിക്കുക',
  delete: 'ഇല്ലാതാക്കുക',
  search: 'തിരയുക',
  loading: 'ലോഡുചെയ്യുന്നു...',
  noResults: 'ഫലങ്ങൾ കണ്ടെത്തിയില്ല',
  required: 'ആവശ്യമാണ്',
  previous: 'മുമ്പത്തെ',
  next: 'അടുത്തത്',
  pageOf: (page, total) => `പേജ് ${page} / ${total}`,
  selectPlaceholder: 'തിരഞ്ഞെടുക്കുക...',
  clearSelection: 'തിരഞ്ഞെടുപ്പ് മായ്ക്കുക',
  selectDate: 'തീയതി തിരഞ്ഞെടുക്കുക',
  today: 'ഇന്ന്',
  dropFiles: 'ഇവിടെ ഫയലുകൾ ഇടുക അല്ലെങ്കിൽ',
  browse: 'ബ്രൗസ് ചെയ്യുക',
  noData: 'ഡാറ്റ ലഭ്യമല്ല',
  sortAscending: 'ആരോഹണ ക്രമം',
  sortDescending: 'അവരോഹണ ക്രമം',
  filterPlaceholder: 'ഫിൽട്ടർ...',
  exportCsv: 'CSV എക്സ്പോർട്ടുചെയ്യുക',
  rowsSelected: (n) => `${n} വരി${n === 1 ? '' : 'കൾ'} തിരഞ്ഞെടുത്തു`,
});

// Punjabi (India, Gurmukhi)
export const paIN = locale({
  close: 'ਬੰਦ ਕਰੋ',
  cancel: 'ਰੱਦ ਕਰੋ',
  confirm: 'ਪੁਸ਼ਟੀ ਕਰੋ',
  save: 'ਸੰਭਾਲੋ',
  delete: 'ਮਿਟਾਓ',
  search: 'ਖੋਜੋ',
  loading: 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
  noResults: 'ਕੋਈ ਨਤੀਜੇ ਨਹੀਂ ਮਿਲੇ',
  required: 'ਜ਼ਰੂਰੀ',
  previous: 'ਪਿਛਲਾ',
  next: 'ਅਗਲਾ',
  pageOf: (page, total) => `ਸਫ਼ਾ ${page} / ${total}`,
  selectPlaceholder: 'ਚੁਣੋ...',
  clearSelection: 'ਚੋਣ ਮਿਟਾਓ',
  selectDate: 'ਮਿਤੀ ਚੁਣੋ',
  today: 'ਅੱਜ',
  dropFiles: 'ਇੱਥੇ ਫਾਈਲਾਂ ਛੱਡੋ ਜਾਂ',
  browse: 'ਬਰਾਊਜ਼ ਕਰੋ',
  noData: 'ਕੋਈ ਡਾਟਾ ਉਪਲਬਧ ਨਹੀਂ',
  sortAscending: 'ਚੜ੍ਹਦਾ ਕ੍ਰਮ',
  sortDescending: 'ਉਤਰਦਾ ਕ੍ਰਮ',
  filterPlaceholder: 'ਫਿਲਟਰ...',
  exportCsv: 'CSV ਨਿਰਯਾਤ ਕਰੋ',
  rowsSelected: (n) => `${n} ਕਤਾਰ${n === 1 ? '' : 'ਾਂ'} ਚੁਣੀ${n === 1 ? '' : 'ਆਂ'}`,
});

// Urdu (India, Perso-Arabic, RTL)
export const urIN = locale({
  close: 'بند کریں',
  cancel: 'منسوخ کریں',
  confirm: 'تصدیق کریں',
  save: 'محفوظ کریں',
  delete: 'حذف کریں',
  search: 'تلاش کریں',
  loading: 'لوڈ ہو رہا ہے...',
  noResults: 'کوئی نتائج نہیں ملے',
  required: 'ضروری',
  previous: 'پچھلا',
  next: 'اگلا',
  pageOf: (page, total) => `صفحہ ${page} / ${total}`,
  selectPlaceholder: 'منتخب کریں...',
  clearSelection: 'انتخاب صاف کریں',
  selectDate: 'تاریخ منتخب کریں',
  today: 'آج',
  dropFiles: 'یہاں فائلیں چھوڑیں یا',
  browse: 'براؤز کریں',
  noData: 'کوئی ڈیٹا دستیاب نہیں',
  sortAscending: 'صعودی ترتیب',
  sortDescending: 'نزولی ترتیب',
  filterPlaceholder: 'فلٹر...',
  exportCsv: 'CSV برآمد کریں',
  rowsSelected: (n) => `${n} قطار${n === 1 ? '' : 'یں'} منتخب`,
});

// Odia (India)
export const orIN = locale({
  close: 'ବନ୍ଦ କରନ୍ତୁ',
  cancel: 'ବାତିଲ କରନ୍ତୁ',
  confirm: 'ନିଶ୍ଚିତ କରନ୍ତୁ',
  save: 'ସଞ୍ଚୟ କରନ୍ତୁ',
  delete: 'ବିଲୋପ କରନ୍ତୁ',
  search: 'ଖୋଜନ୍ତୁ',
  loading: 'ଲୋଡ଼ ହେଉଛି...',
  noResults: 'କୌଣସି ଫଳାଫଳ ମିଳିଲା ନାହିଁ',
  required: 'ଆବଶ୍ୟକ',
  previous: 'ପୂର୍ବବର୍ତ୍ତୀ',
  next: 'ପରବର୍ତ୍ତୀ',
  pageOf: (page, total) => `ପୃଷ୍ଠା ${page} / ${total}`,
  selectPlaceholder: 'ଚୟନ କରନ୍ତୁ...',
  clearSelection: 'ଚୟନ ସଫା କରନ୍ତୁ',
  selectDate: 'ତାରିଖ ଚୟନ କରନ୍ତୁ',
  today: 'ଆଜି',
  dropFiles: 'ଏଠାରେ ଫାଇଲ ଛାଡ଼ନ୍ତୁ କିମ୍ବା',
  browse: 'ଖୋଜନ୍ତୁ',
  noData: 'କୌଣସି ତଥ୍ୟ ଉପଲବ୍ଧ ନୁହେଁ',
  sortAscending: 'ଆରୋହଣ କ୍ରମ',
  sortDescending: 'ଅବରୋହଣ କ୍ରମ',
  filterPlaceholder: 'ଫିଲ୍ଟର...',
  exportCsv: 'CSV ରପ୍ତାନୀ କରନ୍ତୁ',
  rowsSelected: (n) => `${n} ଧାଡ଼ି ଚୟନ`,
});

// Assamese (India)
export const asIN = locale({
  close: 'বন্ধ কৰক',
  cancel: 'বাতিল কৰক',
  confirm: 'নিশ্চিত কৰক',
  save: 'ছেভ কৰক',
  delete: 'মচক',
  search: 'সন্ধান কৰক',
  loading: 'লোড হৈ আছে...',
  noResults: "কোনো ফলাফল পোৱা নগ'ল",
  required: 'আৱশ্যক',
  previous: 'পূৰ্বৱৰ্তী',
  next: 'পৰৱৰ্তী',
  pageOf: (page, total) => `পৃষ্ঠা ${page} / ${total}`,
  selectPlaceholder: 'নিৰ্বাচন কৰক...',
  clearSelection: 'নিৰ্বাচন মচক',
  selectDate: 'তাৰিখ নিৰ্বাচন কৰক',
  today: 'আজি',
  dropFiles: 'ইয়াত ফাইলবোৰ এৰক বা',
  browse: 'ব্ৰাউজ কৰক',
  noData: 'কোনো তথ্য নাই',
  sortAscending: 'আৰোহণ ক্ৰম',
  sortDescending: 'অৱৰোহণ ক্ৰম',
  filterPlaceholder: 'ফিল্টাৰ...',
  exportCsv: 'CSV ৰপ্তানি কৰক',
  rowsSelected: (n) => `${n} শাৰী নিৰ্বাচিত`,
});

// ── Locale map ──────────────────────────────────────────────────────────────

export const LOCALES = {
  'en-US': enUS,
  'es-ES': esES,
  'pt-BR': ptBR,
  'pt-PT': ptPT,
  'fr-FR': frFR,
  'de-DE': deDE,
  'it-IT': itIT,
  'nl-NL': nlNL,
  'pl-PL': plPL,
  'ru-RU': ruRU,
  'uk-UA': ukUA,
  'tr-TR': trTR,
  'sv-SE': svSE,
  'da-DK': daDK,
  'cs-CZ': csCZ,
  'hu-HU': huHU,
  'ar-SA': arSA,
  'he-IL': heIL,
  'fa-IR': faIR,
  'ja-JP': jaJP,
  'ko-KR': koKR,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'th-TH': thTH,
  'vi-VN': viVN,
  'id-ID': idID,
  'ro-RO': roRO,
  'hi-IN': hiIN,
  'ta-IN': taIN,
  'te-IN': teIN,
  'mr-IN': mrIN,
  'gu-IN': guIN,
  'bn-IN': bnIN,
  'kn-IN': knIN,
  'ml-IN': mlIN,
  'pa-IN': paIN,
  'ur-IN': urIN,
  'or-IN': orIN,
  'as-IN': asIN,
} as const;

export type LocaleCode = keyof typeof LOCALES;

// ── RTL languages ───────────────────────────────────────────────────────────

const RTL_LOCALES = new Set<string>([
  'ar-SA',
  'he-IL',
  'fa-IR',
  'ur-PK',
  'ur-IN',
]);

export function isRTL(locale: string): boolean {
  return RTL_LOCALES.has(locale);
}

// ── Context ─────────────────────────────────────────────────────────────────

export interface I18nContextValue {
  locale: LocaleCode;
  direction: Direction;
  strings: LocaleStrings;
}

export const I18nContext = createContext<I18nContextValue>({
  locale: 'en-US',
  direction: 'ltr',
  strings: enUS,
});

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}

export function useLocale(): LocaleStrings {
  return useContext(I18nContext).strings;
}

export function useDirection(): Direction {
  return useContext(I18nContext).direction;
}
